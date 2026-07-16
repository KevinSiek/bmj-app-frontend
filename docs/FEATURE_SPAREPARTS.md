# Feature: Spareparts

## Overview
Spareparts management handles the catalog of all parts sold or used in services.
Inventory is tracked per-branch (Jakarta, Semarang). Spareparts have dual
pricing: sell price and buy price, plus seller-specific pricing.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/SparepartsPage.vue` | List all spareparts |
| `views/menu/SparepartsAddPage.vue` | Add new sparepart |
| `views/menu/SparepartsDetailPage.vue` | Sparepart detail with stock per branch |
| `views/menu/SparepartsEditPage.vue` | Edit sparepart |
| `components/SparepartSelector.vue` | ★ Search + select sparepart (used in Quotation/Purchase forms) |
| `components/CurrencyInput.vue` | Realtime Rp currency formatting for price fields |
| `stores/sparepart.js` | Pinia store |
| `api/sparepart.js` | API wrappers |

## Key Business Rules
1. Each sparepart has a unique `sparepart_number` and `slug`
2. Pricing: `unit_price_sell` (to customer) and `unit_price_buy` (cost)
3. Stock is **per-branch** via `branch_spareparts` pivot table
4. `DetailSparepart` records track seller-specific prices
5. Bulk upload via Excel (see [FEATURE_EMPLOYEE_AUTH_MISC.md](./FEATURE_EMPLOYEE_AUTH_MISC.md) → Upload Data)
6. **Role-based costing visibility**: Marketing can view the sparepart list and detail
   pages but sees ONLY number, name, and stock quantities. All pricing information
   (sell price, buy price, and seller data) is hidden from Marketing via both backend
   (`SparepartController` nulls these fields) and frontend (`v-if` guards). Inventory
   Admin and Purchase roles have `unit_price_sell` hidden. (Fixed a latent bug: the old
   Inventory hide used a camelCase key that didn't match the snake_case response, so it
   never took effect — now corrected.)
7. **Realtime currency formatting**: Price input fields use `CurrencyInput.vue` component
   to display Rp (Indonesian Rupiah) currency formatting in real-time. The component
   emits the raw numeric value to parent forms while displaying formatted text to users.

## Data Model
```
Sparepart
  ├── sparepart_number, sparepart_name
  ├── unit_price_sell, unit_price_buy
  ├── branchStocks[] → BranchSparepart (branch_id, quantity)
  ├── detailSpareparts[] → DetailSparepart (seller prices)
  ├── detailQuotations[] → line items in quotations
  ├── detailBuys[] → line items in purchases
  └── detailBackOrders[] → line items in back orders
```

## SparepartSelector Component
Reusable search component used in QuotationForm and PurchaseAdd pages:
- Debounced search input
- Displays sparepart name, number, stock per branch, sell price, seller prices
- Emits selected sparepart to parent form
- Price display respects role-based visibility (Marketing sees no prices)

## CurrencyInput Component
Shared component for all price inputs across the application:
- Formats input value as Rp currency in real-time
- Emits raw numeric value to parent form
- Used in sparepart add/edit, quotation detail, purchase forms, and other price fields
- Improves UX with visual thousand separators and currency symbol

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllSparepart(param)` | GET | `/api/sparepart` |
| `getSparepartById(id)` | GET | `/api/sparepart/{id}` |
| `addSparepart(data)` | POST | `/api/sparepart` |
| `updateSparepart(id, data)` | PUT | `/api/sparepart/{id}` |
| `deleteSparepart(id)` | DELETE | `/api/sparepart/{id}` |
| `uploadSpareparts(data)` | POST | `/api/sparepart/updateAllData` |

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Dead components — SparepartSelector & PurchaseItemRow
Both are orphaned. `PurchaseItemRow.vue` is imported by NO file; `SparepartSelector.vue` is imported ONLY by `PurchaseItemRow.vue` (src/components/PurchaseItemRow.vue:38). The live Purchase Add/Edit and Movement Add pages use inline inputs + Bootstrap dropdowns instead. `SparepartSelector` also calls `axios.get('/api/spareparts')` directly — WRONG endpoint (real is `/api/sparepart`), bypasses `httpApi`, and reads fields (`part_number`, `name`, `selling_price`) that none of the stores produce (SparepartSelector.vue:126,48,146). Treat it as a broken experiment, not a reusable widget.

> ⚠️ Correction: the File Map row (line 15) and the "SparepartSelector Component / used in QuotationForm and PurchaseAdd" section (lines 49-54) are STALE — `SparepartSelector` is not used by any live form.

### Three divergent `mapSparepart` copies
Same name, three different output shapes — pick the right store's copy:
- sparepart store: `totalUnit` = array of `{name, stock}`, seeds Jakarta/Semarang defaults, seller carries `quantity` (stores/sparepart.js:12-30).
- purchase store: `totalUnit` = array, seller has NO `quantity` (stores/purchase.js:37-54).
- movement store: `totalUnit` = OBJECT keyed by branch name via `Object.fromEntries`, seller no `quantity` (stores/sparepart-movement.js:34-50).

Editing one does not touch the others — duplication/drift hazard.

### Why the Add form always renders Jakarta + Semarang stock inputs
When API `total_unit` is absent, the sparepart store seeds it from `common.branch` → `[{name:'Jakarta',stock:0},{name:'Semarang',stock:0}]` (stores/sparepart.js:18-21). Those empty rows are seeded defaults, not real stock.

### `uploadSparepartFile` is a broken stub
It builds an EMPTY `FormData`, never appends the file, then calls `sparepartApi.uploadFile(formData)` — and `uploadFile` is not even exported from api/sparepart.js (stores/sparepart.js:73-78; api/sparepart.js:51-59). The working bulk path is `addSparepartInBulk` → `POST /api/sparepart/updateAllData` (api/sparepart.js:43-44); see [FEATURE_EMPLOYEE_AUTH_MISC.md](./FEATURE_EMPLOYEE_AUTH_MISC.md) (Upload Data).

> ⚠️ Correction (API table): the real wrapper is `addSparepartInBulk`, not `uploadSpareparts` (api/sparepart.js:43).

### Role gating (frontend)
Add / Edit / Delete buttons are Director-only (`isRoleDirector`; SparepartsPage.vue:9, SparepartsDetailPage.vue:74-78). Buy/purchase-price section visibility = Director | Finance | Head Inventory | Inventory Purchase (`canSeePurchasePrice`, SparepartsDetailPage.vue:105). Marketing price-hiding still depends on the BACKEND nulling the fields — the frontend guard alone is not the full story.

### Seller costs load lazily
`unitPriceSeller[]` (seller-specific costs) is fetched per sparepart via `getSparepartDetails` → `GET /api/sparepart/{id}/sellers` (api/sparepart.js:47-49), not bundled in the list payload.
