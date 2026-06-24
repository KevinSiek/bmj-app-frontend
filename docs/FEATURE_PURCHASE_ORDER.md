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
7. **Service role** can view and list POs (GET endpoints).
8. **Two PO numbers**:
   - `purchase_order_number` — the auto-generated internal request number, labelled **"No Internal Request"** in the UI/PDF (format `PO/12/BMJ-MEGAH/JKT/1/VI/26`).
   - `po_number` — the **real PO number**, entered by the user at `moveToPo`. It is **required AND unique** per database constraint (`purchase_orders.po_number UNIQUE`). The `moveToPo` endpoint validates `required|string|unique:purchase_orders,po_number`. The Create-PO modal (`ModalNotes.vue`, `requirePoNumber` flag) collects it as "No PO" alongside notes. Both numbers appear on PO detail pages, Delivery Order detail, and in PDF exports. Mapped as `poNumber` in the PO/DO stores. Pre-implementation POs have a null `po_number` (blank).
9. **PDF features**:
   - Creator name: the PO PDF signature block uses `created_by_name` (the creating employee's fullname) from the get() response.
   - Version stamp: PO PDFs include a version number for multi-version tracking.
10. **Inline validation** on the Return form (`PurchaseOrderReturnPage.vue`): the returned items list must be non-empty and every returned quantity must be > 0. The store's `isDirty` flag gates error display until the user interacts or attempts submit.

## File Map

| File | Purpose |
| ---- | ------- |
| `views/menu/PurchaseOrderPage.vue` | List all POs (grouped by PO number) |
| `views/menu/PurchaseOrderDetailPage.vue` | PO detail with status actions |
| `views/menu/PurchaseOrderReturnPage.vue` | Return items from a PO — with inline validation |
| `stores/purchase-order.js` | Pinia store — includes `isDirty` flag |
| `api/purchase-order.js` | API endpoint wrappers |
| `utils/pdf/purchase-order.js` | PDF generation for PO document |

## Store: `purchase-order.js`

### Key State
- `purchaseOrder` — single PO
- `purchaseOrders` — list (grouped by PO number)
- `returnPurchaseOrders` — POs with pending returns

### Key Mapping (`mapPurchaseOrder`)
- `purchaseOrder.*` → PO number (both `purchaseOrderNumber` and `poNumber`), date, type
- `purchaseOrder.createdByName` — creating employee's name (for PDF signature)
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
| `getAllReturn()` | GET | `/api/purchase-order/return` |

## API Response Format

GET `/api/purchase-order` and `/api/purchase-order/{id}` responses include:

```json
{
  "id": "...",
  "purchase_order_number": "PO/12/BMJ-MEGAH/JKT/1/VI/26",
  "po_number": "PO-2024-001",
  "created_by_name": "John Doe",
  "purchase_order": {
    "po_number": "PO-2024-001"
  },
  "...": "other fields"
}
```

Delivery Order responses include `purchase_order.po_number` for PO number display.

## Track Component

PO detail pages use the Track component (`useTrack` composable) to display the
status timeline: PO → PI → DP Paid → Full Paid → Ready → Release → Done → Return.
