# Feature: Delivery Order (UI label: "Delivery Note")

> **Naming (Jun 9):** USER-FACING labels say **"Delivery Note"** (menu, page titles, section
> headings). The CODE is unchanged — route `/api/delivery-order`, table `delivery_orders`,
> store `useDeliveryOrderStore`, URL `/delivery-order`, classes all still use "delivery-order".
> The detail page has TWO print buttons — "Print Delivery Order" and "Print Delivery Note" —
> that call the same `utils/pdf/delivery-note.js` createPdf(data, docTitle), differing only by
> the PDF title for now.

## Overview
Delivery Orders (DO) track the logistics of delivering goods to customers.
Created when a Purchase Order is **released**.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/DeliveryOrderPage.vue` | List all delivery orders |
| `views/menu/DeliveryOrderAddPage.vue` | Create DO (from PO release) |
| `views/menu/DeliveryOrderDetailPage.vue` | DO detail |
| `stores/delivery-order.js` | Pinia store |
| `api/delivery-order.js` | API wrappers |
| `utils/pdf/delivery-note.js` | PDF generation for delivery note |

## Key Business Rules
1. DO is created during PO **Release** action
2. Tracks: ship_mode, order_type, delivery details, received_by, prepared_by
3. Has `type` field matching the quotation type (Sparepart/Service)
4. NPWP field for tax purposes
5. Process action transitions status
6. Detail view displays both **Internal Request** (IR) number and **PO number** from the linked Purchase Order

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllDeliveryOrder(param)` | GET | `/api/delivery-order` |
| `getDeliveryOrderById(id)` | GET | `/api/delivery-order/{id}` |
| `updateDeliveryOrder(id, data)` | PUT | `/api/delivery-order/{id}` |
| `processDeliveryOrder(id, data)` | POST | `/api/delivery-order/process/{id}` |

## Print Modes
The Delivery Order detail page provides two distinct print options:
- **Print Delivery Order** — generates PDF with "Delivery Order" title (formal document reference)
- **Print Delivery Note** — generates PDF with "Delivery Note" title (logistics/fulfillment context)

Both modes use the same underlying PDF template (`utils/pdf/delivery-note.js`) and include the same data; they differ only in the document title stamp and version stamp ("Version N") applied to the PDF.

## Response Data
The API response for Delivery Order includes:
- Standard delivery order fields (ship_mode, order_type, delivery_date, etc.)
- Linked Purchase Order data including:
  - `purchase_order.po_number` — user-entered PO number (unique)
  - `purchase_order.purchase_order_number` — internal request (IR) number
  - `created_by_name` — creator name

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### The add route's `:id` is the PURCHASE ORDER id, and creation is server-side
- Route `delivery_order_add` = `/delivery-order/add/:id`, where `:id` is the **PO** id (`src/config/index.js:226-229`). The add page's Release action calls `purchaseOrderStore.release(route.params.id, deliveryOrder.value)` → `POST /api/purchase-order/release/{id}` (`src/views/menu/DeliveryOrderAddPage.vue:113`). There is no DO `POST` for creation — the DO is materialised by the PO Release.
- > ⚠️ Correction: the DO list "Add Delivery Order" button pushes the literal `menuConfig.delivery_order_add.path` with `:id` unresolved (`src/views/menu/DeliveryOrderPage.vue:119`) — that navigation is effectively broken. Real creation is PO detail → Release.

### Status vocabulary is borrowed from `work_order`
- DO `currentStatus` reuses the `work_order` enum: Wait On Progress → On Progress → Done (`src/config/index.js:280-286`), consumed directly in the detail-page guards (`DeliveryOrderDetailPage.vue:225-234`). There is no DO-specific status set.

### Action gating (`src/views/menu/DeliveryOrderDetailPage.vue:225-236`)
- "Process": Inventory Admin/Head/Director AND `currentStatus === 'Wait On Progress'` AND (`purchaseOrder.isDpPaid` OR `isFullPaid`) → `process(id)` → `POST /api/delivery-order/process/{id}`.
- "Done": same roles AND `currentStatus === 'On Progress'` → `setDone(id)`.

### "Print Delivery Note" visibility + hidden side effect (`:238-248, 298-331`)
- Visible to Director always; otherwise only for the Semarang/`SMG` branch; hidden once the PO has reached Ready or DP Paid.
- Printing is NOT read-only: it opens a Receiver Name modal, writes `receivedBy` via `updateDeliveryOrder(id, { receivedBy })` (`PUT /api/delivery-order/{id}`), refetches, THEN prints. An empty receiver name aborts the print.

### One PDF layout, two titles (`src/utils/pdf/delivery-note.js`)
- `createPdf(data, docTitle)` serves both buttons; they differ only by the title stamp — "DELIVERY ORDER" vs "DELIVERY NOTE" (`:59,71`; invoked at `DeliveryOrderDetailPage.vue:296,322`).
- When `docTitle === 'DELIVERY NOTE'` and `deliveryOrder.deliveryNoteNumber` exists, the PDF prints that number in place of the DO number (`:88-89`). It `.print()`s (download commented out, `:294-295`) and carries no prices.

### Router lets Marketing reach the add routes
- `src/router/index.js:663-667`: `beforeEach` special-cases Marketing so it may open `delivery_order_add` (and `work_order_add`) even though those routes aren't in its allowed feature set — because Marketing triggers the PO Release that creates the DO.
