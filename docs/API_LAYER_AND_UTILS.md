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
- Token key: `'token-bmj'`, TTL: 24 hours

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
Date formatting and filtering helpers.
