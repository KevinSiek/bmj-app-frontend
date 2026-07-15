# Feature: Purchase (Buy)

## Overview
Purchase (internally called "Buy") is the procurement workflow for buying
spareparts from external sellers to fulfill Back Orders.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/PurchasePage.vue` | List all purchases |
| `views/menu/PurchaseAddPage.vue` | Create purchase (with item rows) |
| `views/menu/PurchaseEditPage.vue` | Edit purchase |
| `views/menu/PurchaseDetailPage.vue` | Purchase detail |
| `views/menu/PurchaseReviewPage.vue` | Purchases awaiting review |
| `views/menu/PurchaseReviewDetailPage.vue` | Review detail |
| `views/PurchaseAdd.vue` | Root-level purchase add (legacy?) |
| `components/PurchaseItemRow.vue` | Single line item row component |
| `stores/purchase.js` | Pinia store |
| `api/purchase.js` | API wrappers |

## Key Business Rules
1. "Buy" is initiated when missing stock is identified, usually from a Back Order (BO).
2. Buy tracks items purchased from a specific seller.
3. Status lifecycle: `Wait for Review → Approved → Received`. Side states: `Rejected`, `Need Change`.
4. It ties into **Spareparts** (purchasing more inventory) and optionally links to a `back_order_id` if fulfilling a BO.
5. Line items (`DetailBuy`) reference spareparts with seller prices
5. Director reviews and approves/rejects purchase requests
6. On approval + receive, stock quantities increase via `SparepartStockService`

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllPurchase(param)` | GET | `/api/buy` |
| `getPurchaseById(id)` | GET | `/api/buy/{id}` |
| `addPurchase(data)` | POST | `/api/buy` |
| `updatePurchase(id, data)` | PUT | `/api/buy/{id}` |
| `deletePurchase(id)` | DELETE | `/api/buy/{id}` |
| `approvePurchase(id, data)` | POST | `/api/buy/approve/{id}` |
| `rejectPurchase(id, data)` | POST | `/api/buy/reject/{id}` |
| `needChangePurchase(id, data)` | POST | `/api/buy/needChange/{id}` |
| `donePurchase(id, data)` | POST | `/api/buy/done/{id}` |
| `getReviewPurchase(param)` | GET | `/api/buy/review/1` |

## Note on Naming
The frontend calls this "Purchase" while the backend model is `Buy` and the
API endpoint is `/api/buy`. The config mapping is:
`config.api.purchase = '/api/buy'`

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### "Purchase" is backend "Buy"
`config.api.purchase = '/api/buy'` (config/index.js:484), so every wrapper below hits `/api/buy/*`. The "Purchase" name is frontend-only — grep the backend for `Buy`.

### The 4th review action has no config constant
Status constants are only `Wait for Review / Rejected / Approved / Received` (config/index.js:287-292). "Need Change" is a real review action (button at PurchaseReviewDetailPage.vue:51) but has NO config constant — searching config for it finds nothing.

### Detail-page action gating
Edit is hidden once status ∈ {Received, Rejected, Approved} (`HIDDEN_EDIT_STATUSES`, PurchaseDetailPage.vue:82-91). Receive shows only while `Approved` and calls `receive(id)` → `POST /api/buy/done/{id}` (PurchaseDetailPage.vue:92-95,109-113; api/purchase.js:46-48). Reject / Need Change / Approve live only on the review detail (PurchaseReviewDetailPage.vue:45-58).

### Review list is Director / Head Inventory only
`getAllPurchaseReview` → `GET /api/buy/review/1` — the `/1` is hardcoded (api/purchase.js:26-28). Route meta restricts both the review list and review detail to `['Director','Head Inventory']` (router/index.js:367,386).

### Seller price resolution on item select
`selectItem` overrides `unitPriceBuy` with the chosen seller's price, then recomputes `totalPrice = quantity * unitPriceBuy` (PurchaseAddPage.vue:168-176). Submit blocks any row with `quantity <= 0` (PurchaseAddPage.vue:209-214).

### Store gotchas
- `$resetPurchases` clears `purchaseReviews`, NOT `purchases` — the name misleads (stores/purchase.js:118-120).
- `approve/reject/needChange/receive` send NO request body; `needChangePurchase` also never `return`s its response (stores/purchase.js:109-134).
- `addPurchase`/`updatePurchase` POST the mapped camelCase `purchase.value` straight through — no snake_case remap on write (stores/purchase.js:82,91).

> ⚠️ Correction (File Map + API table): `components/PurchaseItemRow.vue` is DEAD CODE — imported by no live page (it, in turn, is the only importer of `SparepartSelector.vue`; see FEATURE_SPAREPARTS.md). The API table's `(id, data)` signatures for approve/reject/needChange/done are wrong — the real wrappers take only `id` and send no body, and are named `approvePurchase` / `rejectPurchase` / `needChangePurchase` / `done` + `getAllPurchaseReview` (not `getReviewPurchase`) — api/purchase.js:26-73.

### Numeric-input hardening idiom
Quantity/price inputs block wheel-scroll and the `- + e E` keys via `@wheel.prevent` + a `@keydown` filter (PurchaseAddPage.vue:82-83). This same idiom is reused across the forms.
