# Feature: Proforma Invoice

## Overview
Proforma Invoices (PI) are created from Purchase Orders via `moveToPi`. They
track payment status (Down Payment and Full Payment).

## Status Flow
PO → PI Created → DP Paid → Full Paid → Invoice Created

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/ProformaInvoicePage.vue` | List all PIs |
| `views/menu/ProformaInvoiceDetailPage.vue` | PI detail with payment actions |
| `views/menu/ProformaInvoiceEditPage.vue` | Edit PI (down payment, notes) |
| `stores/proforma-invoice.js` | Pinia store |
| `api/pi.js` | API wrappers |
| `utils/pdf/proforma-invoice.js` | PDF generation (22KB — detailed) |

## Key Business Rules
1. PI has `is_dp_paid` and `is_full_paid` boolean flags
2. `dpPaid` action marks down payment as received
3. `fullPaid` action marks full payment as received
4. `moveToInvoice` creates a final Invoice from the PI
5. PI includes `down_payment` amount and `grand_total`
6. `total_amount_text` stores the currency amount in words

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllPI(param)` | GET | `/api/proforma-invoice` |
| `getPIById(id)` | GET | `/api/proforma-invoice/{id}` |
| `dpPaid(id, data)` | POST | `/api/proforma-invoice/dpPaid/{id}` |
| `fullPaid(po_id, data)` | POST | `/api/proforma-invoice/fullPaid/{po_id}` |
| `moveToInvoice(id, data)` | POST | `/api/proforma-invoice/moveToInvoice/{id}` |
| `updatePI(id, data)` | PUT | `/api/proforma-invoice/{id}` |

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Creation — PI is born from a PO, never created directly
- Finance/Director click "Create PI" on the **PO** detail → `processToProformaInvoice(id, notes)` → `POST /api/purchase-order/moveToPi/{id}` (`src/api/purchase-order.js:71`). The store's `addProformaInvoice` (`POST /api/proforma-invoice`) exists but no UI calls it — a PI always inherits its PO's data server-side, so there is no "blank PI" form.

### `isDPPaid` has INVERTED semantics — read the name backwards
- `src/views/menu/ProformaInvoiceDetailPage.vue:309-313`: `isDPPaid` is **true when the DP has NOT yet been paid** (`!status.some(state === dp_paid)`), scoped to Finance/Director. It is the "show the DP Paid / Edit buttons" flag, not a "DP is paid" flag. WHY it matters: reading it as "DP is paid" inverts every guard built on it.

### The edit page exposes exactly ONE editable field
- `src/views/menu/ProformaInvoiceEditPage.vue`: every input is `disabled` except `downPayment` (line 186, rendered with a trailing `%`). It is only reachable before DP is paid, via the detail-page Edit button that rides the inverted `isDPPaid`.
- > ⚠️ Correction: the File Map above says "Edit PI (down payment, notes)". The notes textarea is `disabled` (`ProformaInvoiceEditPage.vue:176`) — notes are NOT editable here; only `downPayment` is.
- Gotcha: that field's on-screen label is "Advance Payment:" (`ProformaInvoiceEditPage.vue:183`) yet it binds `downPayment`, a different quantity from the `price.advancePayment` waterfall row. Don't conflate the two.

### `downPayment` is a PERCENTAGE; `price.*` are absolute rupiah
- `src/stores/proforma-invoice.js:11-61`: `price` is a 7-row waterfall — Amount − Discount = SubTotal − AdvancePayment = Total + VAT = TotalAmount (`amount, discount, subtotal, advancePayment, total, ppn, totalAmount`). `downPayment` (line 44) is a percent, applied as `subtotal * dp/100` in the PDF — not a rupiah figure.

### Actions and which API each really hits
- "DP Paid" → `dpPaid(id)` → `POST /api/proforma-invoice/dpPaid/{id}` (`src/api/pi.js:73`). id only, no body.
- "Create Invoice" → `processToInvoice(id)` → `POST /api/proforma-invoice/moveToInvoice/{id}` (`src/api/pi.js:69`). id only.
- "Full Paid" belongs to the PO, not the PI: it posts to `/api/proforma-invoice/fullPaid/{id}` but is wired through the **purchase-order** api/store (`src/api/purchase-order.js:83-84`) — look there, not in `api/pi.js`.

### Naming trap in `project.*`
- `src/stores/proforma-invoice.js:19-20`: `project.purchaseOrderNumber` = **Internal Request No** (not the PO number); `project.poNumber` = the customer's PO No. The PDF's top-left "Purchase Order" row actually prints `poNumber` (`src/utils/pdf/proforma-invoice.js:132`).

### PDF quirks (`src/utils/pdf/proforma-invoice.js`)
- It `.print()`s, it does not download — the `.download(...)` line is commented out (`:736-737`).
- Amount-in-words via `to-words`. When `downPayment > 0` it spells only the DP slice — `ceil(subtotal)*dp/100 + ceil(that*0.11)` (`:116-121`) — otherwise it spells `totalAmount`.
- The DP-slice PPN is **hardcoded 11%** here (`:118`, `* 0.11`), unlike the Invoice PDF which reads the configurable ppn. Change the VAT rate and this document won't follow.
- Hardcoded remittance: BCA A/C 009-8928009 (`:689`) and signatory "SR. PRAWESTI / FINANCE" (`:710-711`).
