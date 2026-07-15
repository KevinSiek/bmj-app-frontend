# Feature: Invoice

## Overview
Invoices are the final financial document, created from Proforma Invoices via
`moveToInvoice`. They are read-only after creation.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/InvoicePage.vue` | List all invoices |
| `views/menu/InvoiceDetailPage.vue` | Invoice detail (read-only, with Track) |
| `stores/invoice.js` | Pinia store |
| `api/invoice.js` | API wrappers |
| `utils/pdf/invoice.js` | PDF generation |

## Key Business Rules
1. Invoices are **read-only** — no edit/delete functionality
2. Created only through PI → Invoice flow
3. Includes `term_of_payment` field
4. Invoice detail shows the full chain: Quotation → PO → PI → Invoice

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllInvoice(param)` | GET | `/api/invoice` |
| `getInvoiceById(id)` | GET | `/api/invoice/{id}` |

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Read-only, born from a PI
- Created from a PI via `moveToInvoice`. The detail page offers only Back / DP Invoice / Final Invoice / Print — no edit or delete UI (`src/views/menu/InvoiceDetailPage.vue:250-259`). `updateInvoice`/`deleteInvoice` exist in the store but nothing in the UI calls them.

### `invoice.type` states and the two buttons
- `type ∈ '' | 'DP' | 'Final'` as set from the UI; the PDF additionally branches on `'DP2'` (`src/utils/pdf/invoice.js:207,291` → "Down Payment 2").
- "DP Invoice" shows when type is unset OR (`type === 'DP'` AND nested `invoice.version < 3`) — the staged DP1/DP2 gate (`InvoiceDetailPage.vue:316-321`). "Final Invoice" shows only when type is unset (`:256`).
- Both call `setInvoiceType(id, { type })` → `POST /api/invoice/setType/{id}` (`InvoiceDetailPage.vue:357,369`; `src/api/invoice.js:74`).

### TWO `version` fields — do not conflate
- `src/stores/invoice.js:15` top-level record `version` vs `:31` nested `invoice.version`. The DP-staging gate uses the **nested** one (`invoice.version < 3`), never the top-level record version. WHY it matters: the wrong field silently disables/enables the DP button.

### Rounding: subtotal/grandTotal are `Math.ceil`'d
- `src/stores/invoice.js:29-30` ceil `subTotal` and `grandTotal` on the way in.
- The PDF's `ppn` arrives `Math.trunc`'d from the general store (`InvoiceDetailPage.vue:377`), then `ppnTypeDp = ceil(subtotalTypeDp * ppn/100)`; the DP-vs-Final split is `type==='DP' ? subtotal*dp/100 : subtotal*(100-dp)/100` (`src/utils/pdf/invoice.js:332-343`).

### Term of Payment + Payment Due are print-time only, NOT persisted
- Collected in the Print modal at print time and passed straight into `createPdf(...)` (`InvoiceDetailPage.vue:262-288, 376-378`). They are local refs — printing does not save them back to the invoice record.
