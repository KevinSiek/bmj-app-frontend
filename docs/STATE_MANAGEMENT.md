# State Management (Pinia Stores)

> **Read this** when adding or modifying Pinia stores.

## Architecture

All stores use **Pinia Composition API** (setup stores with `defineStore` and
`() => {}` factory). No Options API stores exist.

## Store Index

| Store File | Store ID | Domain |
| ---------- | -------- | ------ |
| `auth.js` | `auth-store` | Authentication (user, token, login/logout) |
| `quotation.js` | `quotation` | Quotations + review workflow |
| `purchase-order.js` | `purchase-order` | POs + returns |
| `proforma-invoice.js` | `proforma-invoice` | Proforma Invoices |
| `invoice.js` | `invoice` | Invoices |
| `work-order.js` | `work-order` | Work Orders |
| `delivery-order.js` | `delivery-order` | Delivery Orders |
| `back-order.js` | `back-order` | Back Orders |
| `purchase.js` | `purchase` | Purchases (Buy) |
| `sparepart.js` | `sparepart` | Sparepart catalog |
| `sparepart-movement.js` | `sparepartMovement` | Sparepart transfers between branches |
| `stock-movement.js` | `stock-movement` | Global stock movement ledger |
| `employee.js` | `employee` | Employee management |
| `customer.js` | `customer` | Customer management |
| `seller.js` | `seller` | Seller management |
| `general.js` | `general` | General settings |
| `dashboard.js` | `dashboard` | Dashboard analytics |
| `summary.js` | `summary` | Per-role summaries |
| `modal.js` | `modal` | Global modal state |
| `main.js` | `main` | App-wide state (isMobile) |
| `track.js` | `track` | Status tracking |
| `counter.js` | `counter` | (unused default Pinia example) |

## Standard Store Pattern

Every domain store follows this skeleton:

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import featureApi from '@/api/feature'

export const useFeatureStore = defineStore('feature', () => {
  // 1. State
  const item = ref(null)
  const items = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  // 2. Data mapping (snake_case → camelCase)
  function mapItem(data) {
    return {
      id: data?.id || '',
      fieldName: data?.field_name || '',
      // ... map all fields
    }
  }

  // 3. Actions
  async function getAll(param) {
    isLoading.value = true
    const { data } = await featureApi.getAll(param)
    items.value = data.data.map(mapItem)
    paginationData.value = data
    isLoading.value = false
  }

  async function getById(id) {
    const { data } = await featureApi.getById(id)
    item.value = mapItem(data)
  }

  // 4. Reset functions
  async function $resetItem() { item.value = mapItem() }
  async function $resetItems() { items.value = [] }

  // 5. Return all
  return { item, items, paginationData, isLoading, getAll, getById, $resetItem, $resetItems }
})
```

## Data Mapping Convention

Backend returns `snake_case` JSON. Stores map to `camelCase`:
- `company_name` → `companyName`
- `current_status` → `currentStatus`
- `unit_price_sell` → `unitPriceSell`
- `grand_total` → `grandTotal`

Nested objects are also mapped:
- `data.customer.company_name` → `customer.companyName`
- `data.price.grand_total` → `price.grandTotal`

## Grouping Pattern (Quotation / PO)

Quotations and POs use a **grouping pattern** where the API returns flat items
but the store groups them by document number:

```javascript
const grouped = {}
data.data.forEach(item => {
  const key = item.quotation_number  // or purchase_order_number
  if (!grouped[key]) {
    grouped[key] = { number: key, versions: [] }
  }
  grouped[key].versions.push(mapItem(item))
})
items.value = Object.values(grouped)
```

This enables the version tabs UI in list pages.

## Pagination

All list stores consume Laravel's pagination response:
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 10,
  "total": 50,
  "from": 1,
  "to": 10
}
```

The `paginationData` ref stores the full response. The `Pagination.vue`
component consumes it directly.

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md).
> Store-layer specifics below; each cites `file:line`.

- **Two response-envelope shapes.** `utils/http-api.js` unwraps `res.data` once,
  so **auth** reads top-level fields (`response.access_token`, `response.user` —
  `stores/auth.js:25-26`) while **every other store** destructures a nested
  `.data`, then `data.data` for lists (`stores/employee.js:31-33`). Use the right
  depth per domain.
- **Write camelCase / read snake_case.** Stores **POST/PUT the camelCase ref**
  directly (e.g. `addQuotation` sends `quotation.value`) but map **snake_case**
  GET responses back via `mapXxx()`. The backend accepts camelCase via a field
  map — watch the camelCase trap in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md) §13.
- **`$resetX()` is the blank-form factory**, not just a null: it's usually
  `x.value = mapX()` (empty input → empty template), which Add pages mount.
  Exception: **`$resetPurchases` clears `purchaseReviews`, not `purchases`**
  (`stores/purchase.js:118-120`) — misleading name.
- 🐞 **Three divergent `mapSparepart` copies** with different `totalUnit` shapes:
  `sparepart.js:12-30` (array `{name,stock}`, seeds Jakarta/Semarang, seller has
  `quantity`), `purchase.js:37-54` (array, seller no `quantity`),
  `sparepart-movement.js:34-50` (**object** keyed by branch name). Editing one
  won't fix the others — a real drift hazard.
- **Grouping keys on the internal number.** The `{ number, versions[] }` grouping
  (Quotation/PO/PI/Invoice/BO/WO/Return) keys on the *internal* document number
  (e.g. `purchase_order_number`), **not** the customer PO number.
- **Legacy/unused stores:** `counter.js` is the unused Pinia example; there are
  **two Track implementations** — the live Pinia `stores/track.js` (used by
  `Track.vue`) and an orphaned `composeable/useTrack.js`.
