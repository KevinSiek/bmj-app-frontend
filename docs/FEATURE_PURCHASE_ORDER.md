# Feature: Purchase Order

> **Read this file** when modifying Purchase Order functionality.

## Overview

Purchase Orders (PO) are created from approved Quotations. They track the
fulfillment lifecycle from creation through delivery and payment. POs are
central to the order chain — they link Quotations upstream to Proforma
Invoices, Work Orders, Delivery Orders, and Back Orders downstream.

## Business Rules

1. POs are created via `moveToPo` from a Quotation — not manually.
2. POs support **versioning** (same PO number, different versions).
3. Status lifecycle: `Prepare → DP Paid → Ready → Release → Done → BO`
4. **Release** action creates Work Orders, Delivery Orders, and Back Orders.
5. **Return** workflow allows partial item returns after completion.
6. Director can decline POs.
7. **Two PO numbers** (added Jun 9):
   - `purchase_order_number` — the auto-generated number, now labelled **"No Internal
     Request"** in the UI/PDF (format `PO/12/BMJ-MEGAH/JKT/1/VI/26`).
   - `po_number` — the **real PO number**, entered by the user at `moveToPo`. It is
     **required AND unique** (`moveToPo` validates `required|string|unique:purchase_orders,po_number`).
     The Create-PO modal (`ModalNotes.vue`, `requirePoNumber` flag) collects it as "No PO"
     alongside notes. PO + Delivery Order detail pages show BOTH numbers. Mapped as
     `poNumber` in the PO/DO stores. Pre-Jun-9 POs have a null `po_number` (blank).
8. **PDF creator name**: the PO PDF signature uses `created_by_name` (creating employee's
   `fullname`) from the get() response.

## File Map

| File | Purpose |
| ---- | ------- |
| `views/menu/PurchaseOrderPage.vue` | List all POs (grouped by PO number) |
| `views/menu/PurchaseOrderDetailPage.vue` | PO detail with status actions |
| `views/menu/PurchaseOrderReturnPage.vue` | Return items from a PO |
| `stores/purchase-order.js` | Pinia store — state, API calls, data mapping |
| `api/purchase-order.js` | API endpoint wrappers |
| `utils/pdf/purchase-order.js` | PDF generation for PO document |

## Store: `purchase-order.js`

### Key State
- `purchaseOrder` — single PO
- `purchaseOrders` — list (grouped by PO number)
- `returnPurchaseOrders` — POs with pending returns

### Key Mapping (`mapPurchaseOrder`)
- `purchaseOrder.*` → PO number, date, type
- `proformaInvoice.*` → PI number, date, DP/full paid booleans
- `customer.*` → company info
- `price.*` → amount, discount, subtotal, ppn, grandTotal
- `spareparts[]` / `services[]` — line items

### Key Actions
- `getAllPurchaseOrders(param)` — fetch + group by PO number
- `getPurchaseOrder(id)` — fetch single
- `processToProformaInvoice(id, notes)` — create PI from PO
- `ready(id)` / `release(id, workOrder)` / `done(id)` — status transitions
- `reject(id, notes)` — decline
- `returnPurchaseOrder(id, items)` — initiate return
- `approveReturn(id)` / `rejectReturn(id)` — return approval

## API Endpoints

| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllPurchaseOrder(param)` | GET | `/api/purchase-order` |
| `getPurchaseOrderById(id)` | GET | `/api/purchase-order/{id}` |
| `processToProformaInvoice(id, data)` | POST | `/api/purchase-order/moveToPi/{id}` |
| `ready(id)` | POST | `/api/purchase-order/ready/{id}` |
| `release(id, data)` | POST | `/api/purchase-order/release/{id}` |
| `done(id)` | POST | `/api/purchase-order/done/{id}` |
| `reject(id, data)` | POST | `/api/purchase-order/reject/{id}` |

## Track Component

PO detail pages use the Track component (`useTrack` composable) to display the
status timeline: PO → PI → DP Paid → Full Paid → Ready → Release → Done → Return.
