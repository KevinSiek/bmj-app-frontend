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
| `views/menu/ProformaInvoiceEditPage.vue` | Edit PI (down payment %, notes) — with inline validation |
| `stores/proforma-invoice.js` | Pinia store — includes `isDirty` flag |
| `api/pi.js` | API wrappers |
| `utils/pdf/proforma-invoice.js` | PDF generation (22KB — detailed) |

## Key Business Rules
1. PI has `is_dp_paid` and `is_full_paid` boolean flags.
2. `dpPaid` action marks down payment as received.
3. `fullPaid` action marks full payment as received.
4. `moveToInvoice` creates a final Invoice from the PI.
5. PI includes `down_payment` amount and `grand_total`.
6. `total_amount_text` stores the currency amount in words.
7. The Edit form accepts a `dp_percentage` field (0–100) that sets the down payment as a percentage of the grand total. **Inline validation** ensures this value is a valid number within range. Errors are shown beneath the percentage input using Bootstrap `.invalid-feedback`. The store's `isDirty` flag prevents eager display.

## Role Access
Finance, Director

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllPI(param)` | GET | `/api/proforma-invoice` |
| `getPIById(id)` | GET | `/api/proforma-invoice/{id}` |
| `dpPaid(id, data)` | POST | `/api/proforma-invoice/dpPaid/{id}` |
| `fullPaid(po_id, data)` | POST | `/api/proforma-invoice/fullPaid/{po_id}` |
| `moveToInvoice(id, data)` | POST | `/api/proforma-invoice/moveToInvoice/{id}` |
| `updatePI(id, data)` | PUT | `/api/proforma-invoice/{id}` |
