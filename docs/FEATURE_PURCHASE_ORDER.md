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
3. Status lifecycle: `Prepare → DP Paid → Ready → Release → Done → BO`. Side states: `Returned`, `Paid`, `Rejected`, `Wait On Progress`, `On Progress`.
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

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### The two PO numbers (#1 source of confusion)
- Internal request no. = `purchaseOrder.purchaseOrderNumber` (`purchase_order.purchase_order_number`); customer PO = `purchaseOrder.poNumber` (`purchase_order.po_number`), entered at moveToPo. Both mapped in `mapPurchaseOrder` (`stores/purchase-order.js:26-27`, inline comments "Internal Request Number" / "PO From Customer").
- **List grouping keys on the INTERNAL number, not the customer PO:** `const key = item.purchase_order.purchase_order_number` (`stores/purchase-order.js:105`; same in the return list `:124`). Versions collapse by internal request no.
- **The two numbers are labelled DIFFERENTLY on every surface** — mind this when grepping UI text:
  - PO detail page: "Internal Request Number" / "Purchase Order Number" (`views/menu/PurchaseOrderDetailPage.vue:9,14`).
  - PO PDF: "Internal PO" / "PO Customer" (`utils/pdf/purchase-order.js:139-140`); PDF also appends `-Rev. N` when version > 1 (`:132`).
  - moveToPo modal: customer-PO field placeholder "No PO", shown only when `requirePoNumber` is set (`components/ModalNotes.vue:15-16`).
  - DO / WO / PI detail pages: "No Internal Request" / "No PO".
> ⚠️ Correction: Business Rule 8 says the internal number is "labelled **No Internal Request** in the UI/PDF". That label is only used on the DO/WO/PI pages. The **PO detail page** labels it "Internal Request Number" (`PurchaseOrderDetailPage.vue:9`) and the **PO PDF** labels it "Internal PO" (`utils/pdf/purchase-order.js:140`). There is no single label.

### Cross-wired API endpoints (do not "fix" these paths)
- **Return actions POST to the QUOTATION api**, not a PO route: `returnPurchaseOrder` → `/api/quotation/return/{id}`, `approveReturn` → `/api/quotation/approveReturn/{id}`, `rejectReturn` → `/api/quotation/rejectReturn/{id}` (`api/purchase-order.js:104-114`). `returnPurchaseOrder` also wraps the payload as `{ returned: [...] }`.
- **`fullPaid` posts to the PI endpoint**, not a PO endpoint: `/api/proforma-invoice/fullPaid/{id}` (`api/purchase-order.js:83-85`). Payment lives on the Proforma Invoice, so "Full Paid" targets the PI.

### Non-obvious logic
- **Release does NOT call the release API from the detail page.** The Release button runs `doRelease()` (`PurchaseOrderDetailPage.vue:482-488`), which only routes: type Spareparts → `delivery-order/add/{id}`, else (Service) → `work-order/add/{id}`. The store's `release(id, workOrder)` (`stores/purchase-order.js:184-186`) runs later from inside those DO/WO add flows, not here.
- **PO Return is Spareparts-only.** `doReturn()` blocks Service with a failure modal "Service quotations cannot be returned" (`PurchaseOrderDetailPage.vue:490-493`); the return page submits `{ returned: [{ sparepart_id, quantity }] }` (`views/menu/PurchaseOrderReturnPage.vue:191-196`).
- **Notes are append-only with a stamped prefix.** `saveNotes()` builds `[<id-ID timestamp> by <username>]: <text>` and newline-appends it to the existing notes, then PUTs the whole blob via `updateNotes` → `updatePurchaseOrder` (`PurchaseOrderDetailPage.vue:533-548`, `stores/purchase-order.js:196-198`). No dedicated notes endpoint — it reuses the PO update PUT.
- **List "payment status" is computed client-side, not a server field.** `paymentStatus(item)` appends `(Full Paid)` / `(DP Paid)` / `(Unpaid)` to `currentStatus` from the PI booleans, with a special `Done (Full Paid)` case (`views/menu/PurchaseOrderPage.vue:101-107`).
- **`getPurchaseOrderOptions({type,search,page})` is a load-more picker:** page 1 replaces `poOptions`, page > 1 appends (`stores/purchase-order.js:216-222`).

### Roles / gating (each action independently gated in `PurchaseOrderDetailPage.vue:365-416`)
- **Full Paid** — Finance | Director, when DP paid & not full paid (`:365-370`).
- **Ready** — Inventory Admin | Director | Head Inventory, when not already Ready (`:371-375`).
- **Create PI** — Finance | Director, when no PI yet (`:376-380`).
- **Release** — Head Inventory | Inventory Admin | Director; requires Ready **+** DP-paid (admin/director bypass this) **+** type Spareparts; non-Director / non-Head-Inventory are further restricted to the Semarang/SMG branch (`:381-402`).
- **Done** — Marketing | Director, when Released & not Done (`:403-408`).
- **Return** — Marketing | Director, when Done & not Returned (`:409-413`).
- **Reject** — Director | Finance (`:415`).
- **Service role is read-only.** It matches none of the `isShow*` action guards, and unit/total price columns + the Print button are hidden behind `v-if="!isRoleService"` (`PurchaseOrderDetailPage.vue:119-120,185-190,210,311`).
