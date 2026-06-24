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
5. Bulk upload via Excel (see FEATURE_UPLOAD.md)
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
