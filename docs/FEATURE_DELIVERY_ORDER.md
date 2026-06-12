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
