# Feature: Back Order

## Overview
Back Orders (BO) track spareparts that are out of stock when a PO is released.
They trigger the Purchase (Buy) workflow to procure missing parts from sellers.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/BackOrderPage.vue` | List all back orders |
| `views/menu/BackOrderDetailPage.vue` | BO detail with line items; print/PDF export |
| `stores/back-order.js` | Pinia store |
| `api/back-order.js` | API wrappers |

## Key Business Rules
1. BO is auto-created during PO **Release** when spareparts are insufficient.
2. Contains `DetailBackOrder` line items (sparepart_id + qty needed)
3. A BO can have two main types depending on missing goods (Spareparts).
4. Status lifecycle: `Process → Ready → Rejected`.
3. **Fulfillment Workflow**: BOs are now fulfilled via manual Purchases rather than auto-creating Buys. 
4. **Analyze Action**: Before processing, Inventory clicks "Analyze" to verify if `available stock >= requested quantity`.
5. **Process Action**: If stock is sufficient, "Process" decrements the branch stock directly and transitions the BO to 'Done'.
6. No manual creation — always derived from PO release
6. Back Order detail can be exported as PDF for documentation/archival

## Data Chain
```
PurchaseOrder (Release)
  → BackOrder (auto-created for missing stock)
    → DetailBackOrder[] (sparepart + qty needed)
    → (Manual Purchase creates separate Buy to restock branch)
    → BackOrder is Analyzed & Processed (deducts stock)
```

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllBackOrder(param)` | GET | `/api/back-order` |
| `getBackOrderById(id)` | GET | `/api/back-order/{id}` |
| `analyzeBackOrder(id)` | GET | `/api/back-order/analyze/{id}` |
| `processBackOrder(id)` | POST | `/api/back-order/process/{id}` |
| `adjustBackOrder(id, data)` | POST | `/api/back-order/adjust/{id}` |

## Print / PDF Export
Back Order detail page includes a **Print** button that generates a PDF following the same pattern as Quotation and PO PDFs:
- Creator name stamped on the document
- Version stamp ("Version N") indicating document iteration
- PDF filename: `back_order_{id}.pdf` (or equivalent)

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### No `back_order` status block in config — states are hard-coded literals
The `common.status` object has no `back_order` key (`config/index.js:260-309`). The detail page compares
`currentStatus` against the raw strings `'Rejected'` and `'Ready'` (`BackOrderDetailPage.vue:191-196`).
Effective flow: `Process → (Analyze / Process) → Done`, or `Rejected`.

> ⚠️ Correction: rule #4 in "Key Business Rules" gives the lifecycle as `Process → Ready → Rejected`.
> The terminal state after a successful Process is **Done** (rule #5 agrees). `isReadyToProcess` hides
> Analyze/Adjust once `currentStatus` is `Rejected` **or** `Ready`, so a BO already at `Ready` also shows no actions.

### The list silently drops BOs whose latest version origin ≠ 'processed'
`BackOrderPage.vue:77-82` renders only BOs where the latest version's `origin === 'processed'`; every other
BO is filtered out of the list with no UI hint. A "missing" BO is usually this filter, not a data problem.

### `isReadyToProcess` also needs at least one unsatisfied line
Beyond the status checks, `isReadyToProcess` requires `spareparts.some(s => s.backOrder !== 0)`
(`BackOrderDetailPage.vue:195`). A fully-satisfied BO (all `backOrder === 0`) shows **no** Analyze/Adjust
button even in an otherwise-actionable status.

### Analyze is a GET that returns availability; `total_available === 0` short-circuits
`analyzeBackOrder` is a **GET** `/api/back-order/analyze/{id}` (`api/back-order.js:71-73`). If the response's
`total_available === 0`, the UI shows a "nothing changed" warning and does **not** process; otherwise it opens
the Process confirmation (`BackOrderDetailPage.vue:212-231`). **Process** is POST `/api/back-order/process/{id}`
(`api/back-order.js:67-69`) which decrements branch stock and moves the BO to Done.

### Fulfillment of missing parts is manual — there is no auto-Buy
Restocking is done via the separate **Purchase / Buy** feature, which is backed by `/api/buy`
(`api.purchase: '/api/buy'`, `config/index.js:484`). Nothing in the BO analyze/process path creates a Buy;
Inventory must purchase to restock **before** Process will find enough stock.

### Adjustment: two independent objects from one payload, and a sum-equality guard
`getBackOrderForAdjustment` maps the same payload twice into **separate** objects — `backOrder`
(original, rendered read-only) and `newBackOrder` (editable) — so edits never leak back
(`stores/back-order.js:111-114`). Submit is blocked unless `sum(order)` over the new lines **equals**
`sum(order)` over the originals, else a "Total order mismatch" modal aborts
(`BackOrderAdjustmentPage.vue:208-216`). Per line, `backOrder = order − deliveryOrder` (recomputed at
`BackOrderAdjustmentPage.vue:170`), i.e. `order = deliveryOrder + backOrder`.

### PDF prints (does not download) and splits ORDER into two columns
`utils/pdf/back-order.js:130` calls `.print()` (the `.download(...)` line above it is commented out), so the
button opens the print dialog. The table breaks each line's ORDER into `DELIVER` (`deliveryOrder`) and
`BACK ORDER` (`backOrder`) columns (`utils/pdf/back-order.js:100-110`).
