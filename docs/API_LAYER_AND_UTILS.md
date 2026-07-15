# API Layer & Utilities

> **Read this** when adding new API calls or utility functions.

## API Layer Architecture

```
src/config/index.js          ← endpoint URLs (e.g., api.quotation = '/api/quotation')
      ↓
src/utils/http-api.js        ← generic Axios CRUD wrappers
      ↓
src/api/{feature}.js         ← feature-specific API functions
      ↓
src/stores/{feature}.js      ← consumes API, maps data, manages state
```

## HTTP API Wrappers (`utils/http-api.js`)

Five generic functions wrapping Axios:

| Function | HTTP Method | Signature |
| -------- | ----------- | --------- |
| `getDataViaApi(path, query)` | GET | With query params |
| `getDataByIdViaApi(path)` | GET | By ID (no params) |
| `postDataViaApi(path, data)` | POST | Create/action |
| `putDataViaApi(path, data)` | PUT | Update |
| `deleteDataViaApi(path)` | DELETE | Delete |

All return `res.data` on success and throw `err.response` on failure.

## API File Pattern

Each `src/api/*.js` file exports an object with named functions:

```javascript
import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllItems = (params) => httpApi.getDataViaApi(api.feature, params)
const getItemById = (id) => httpApi.getDataByIdViaApi(`${api.feature}/${id}`)
const addItem = (data) => httpApi.postDataViaApi(api.feature, data)
const updateItem = (id, data) => httpApi.putDataViaApi(`${api.feature}/${id}`, data)
const deleteItem = (id) => httpApi.deleteDataViaApi(`${api.feature}/${id}`)

export default { getAllItems, getItemById, addItem, updateItem, deleteItem }
```

## Axios Configuration (`main.js`)

```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL  // http://localhost:8000
axios.defaults.withCredentials = true
// Authorization header set in auth store after login
```

---

## Utilities

### `utils/local-storage.js` — Token Storage
- `setToken(key, value, ttl)` — store with TTL in days (converted to ms)
- `getToken(key)` — retrieve if not expired, auto-remove if expired
- `removeToken(key)` — remove from localStorage
- Token key: `'token-bmj'`. 🐞 **Effective TTL is 24 *days*, not 24 hours** —
  `setToken(...,24)` with `expiry = now + ttl*60*60*24*1000` treats `ttl` as
  days (see Edge Cases below).

### `utils/debouncer.js` — Debounce Helper
- Simple debounce wrapper for search inputs
- Used in SparepartSelector, list page search bars

### `utils/form-util.js` — Form Utilities
- Helper functions for form validation and data processing
- Used in add/edit page components

### `utils/responsive.js` — Responsive Detection
- `isMobile()` — returns boolean based on viewport width
- Used in `App.vue` to set `mainStore.isMobile`

### `utils/route-util.js` — Route Utilities
- Helper functions for route parameter extraction
- Used in detail pages to get `:id` from URL

### `utils/pdf-util.js` — PDF Utilities
- Common PDF generation helpers
- Used by all `utils/pdf/*.js` files

### `utils/pdf/*.js` — PDF Generators
Per-document PDF generators using pdfmake:
- `quotation.js` — Quotation PDF
- `purchase-order.js` — PO PDF
- `proforma-invoice.js` — PI PDF (22KB, most detailed)
- `invoice.js` — Invoice PDF
- `work-order.js` — WO PDF
- `delivery-note.js` — DN PDF

Each generates a PDF definition object and opens/downloads via pdfmake.

## Composables (`composeable/`)

### `useRole.js`
Provides computed role checks:
- `isRoleDirector`, `isRoleMarketing`, `isRoleFinance`
- `isRoleInventoryAdmin`, `isRoleInventoryPurchase`, `isRoleService`
- Each is a `computed(() => user.value?.role === 'RoleName')`

### `useTrack.js`
Manages status track overlay:
- `isShowTrack` — visibility toggle
- `trackData` — status history array
- `openTrackModal()` / `closeModal()`
- `setGetTrackFunc(fn)` — set the data fetch function

### `useDate.js`
Date formatting and filtering helpers (month list, `selectedMonth`/`selectedYear`
seeded from `route.query`, `yearRange` from 2020→current).

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md).

- 🐞 **Token TTL bug.** `setToken(key, value, ttl)` computes
  `expiry = now + ttl*60*60*24*1000` (`utils/local-storage.js:1-8`). That
  multiplier is **one day in ms**, so `ttl` is *days*; `stores/auth.js:25` passes
  `24` → a **24-day** session, not 24 hours. Hours would be `ttl*60*60*1000`.
- **`http-api.js` re-throws `err.response`** (the raw HTTP response), not the
  Error — which is why callers branch on `error.status` / `error.data`
  (e.g. the `must_change_password` 403 handler in `main.js:20-36`).
- **Actual `utils/form-util.js` exports:** `validatePassword`,
  `formatCurrency`/`formatMoney` (`Intl.NumberFormat('id-ID')`, no "Rp", web
  display), `formatPDFPrice` (returns a pdfmake **columns object with "Rp."** for
  official docs), `formatDate`, `formatDateAndTime`. (The "form validation
  helpers" description understates it.)
- **`utils/pdf-util.js` exports:** `getBase64FromUrl(url)` (loads the logo into a
  canvas → JPEG data URL) and `toDateString(date)` (`id-ID` long date). Every
  `utils/pdf/*.js` generator ends with **`.print()`** — the `.download(...)` line
  is commented out.
- **`debounce(func, delay, id)`** keys its timer on `func + id`
  (`utils/debouncer.js`), so pass a stable `id` per input to avoid cross-field
  timer collisions. `SearchAutocomplete`/`QuotationForm` use their own inline
  `setTimeout` debounce (300–500 ms) instead.
- **Cross-wired endpoints (frontend surprise):** PO returns POST to the
  **quotation** API (`api/purchase-order.js:104-114`); PO `fullPaid` posts to the
  **proforma-invoice** endpoint (`:83-85`). Frontend "Purchase" hits backend
  **`/api/buy`**.
- **Backend failure codes are not uniform** (400 vs 422 vary by controller) and
  several controllers read camelCase keys via a field map that silently drops
  snake_case — see `docs/tests/LLM_HANDOVER.md` before asserting on the API.
