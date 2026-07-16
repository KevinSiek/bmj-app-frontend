# Feature: Employee Management

## Overview
Employee management handles CRUD for system users. Employees are the auth
entity — they have roles that determine feature access.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/EmployeePage.vue` | List all employees |
| `views/menu/EmployeeAddPage.vue` | Create employee |
| `views/menu/EmployeeDetailPage.vue` | Employee detail with access info |
| `views/menu/EmployeeEditPage.vue` | Edit employee |
| `stores/employee.js` | Pinia store |
| `api/employee.js` | API wrappers |

## Key Business Rules
1. **Director-only** feature (middleware: `role:director`)
2. Employee fields: fullname, branch, role, email, username, password
3. Supports **temporary password** with one-time use and expiry
4. Password reset by Director generates a temp password
5. Employee's `role` field determines feature access
6. Roles: Director, Marketing, Finance, Inventory Admin, Inventory Purchase, Service

## Auth Fields
- `password` — bcrypt hashed permanent password
- `temp_password` — plain text temp password (cleared after first use)
- `temp_pass_already_use` — boolean flag
- `temp_pass_expires_at` — expiry timestamp

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllEmployee(param)` | GET | `/api/employee` |
| `getEmployeeById(slug)` | GET | `/api/employee/{slug}` |
| `addEmployee(data)` | POST | `/api/employee` |
| `updateEmployee(slug, data)` | PUT | `/api/employee/{slug}` |
| `deleteEmployee(slug)` | DELETE | `/api/employee/{slug}` |
| `getEmployeeAccess(slug)` | GET | `/api/employee/access/{slug}` |
| `resetPassword(slug, data)` | POST | `/api/employee/reset-password/{slug}` |

---

# Feature: Auth & Profile

## Overview
Auth handles login/logout and token management. Profile allows users to change
their own password.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/LoginPage.vue` | Login form |
| `views/menu/ProfilePage.vue` | Profile page with password change |
| `components/LoginDesktop.vue` | Desktop login UI component |
| `stores/auth.js` | Auth state (user, authenticated, token) |
| `api/auth.js` | Login/logout/getUser/changePassword API calls |

## Auth Flow
1. User submits email + password
2. `POST /api/login` → Sanctum token + user object
3. Token stored in `localStorage` as `token-bmj` with 24h TTL
4. Axios `Authorization` header set globally
5. Router guard checks `authStore.authenticated`
6. Token expiry → `forceLogout()` → redirect to `/login`

## Temp Password Flow
1. Director resets password → backend generates temp_password
2. Employee logs in with temp password
3. Backend marks `temp_pass_already_use = true` and clears temp_password
4. Response includes `use_temp_password: true` flag
5. Frontend forces user to change password on first login

---

# Feature: General Settings

## Overview
Global business settings managed by Director only.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/GeneralPage.vue` | Settings form |
| `stores/general.js` | General settings state |
| `api/general.js` | API wrappers |

## Settings
- `discount` — global discount rate (stored as decimal, displayed as %)
- `ppn` — PPN/VAT rate (stored as decimal, displayed as %)
- `currency_converter` — exchange rate for price conversion

These values are used in Quotation pricing calculations.

---

# Feature: Dashboard

## Overview
Director-only dashboard with analytics and summary data.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/DashboardPage.vue` | Full dashboard (25KB, uses Chart.js) |
| `stores/dashboard.js` | Dashboard data store |
| `api/dashboard.js` | API wrappers |

## Key Features
- Charts (Chart.js + vue-chartjs) for sales/order analytics
- Summary cards for key metrics
- Per-role summary data via `/api/summary/{role}`

---

# Feature: Upload Data

## Overview
Bulk sparepart data upload via Excel files.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/UploadDataPage.vue` | Upload page with Dropzone |

## Key Features
- Uses Dropzone for drag-and-drop file upload
- Accepts Excel files (.xlsx)
- Calls `/api/sparepart/updateAllData` endpoint
- Backend processes via `SparepartImport` (maatwebsite/excel)

---

# Feature: Return

## Overview
Return workflow for returning items from completed Purchase Orders.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/ReturnPage.vue` | List POs with pending returns |
| `views/menu/ReturnDetailPage.vue` | Return detail with item list |

## Business Rules
- Uses the same `purchase-order` store and API
- Return requires selecting specific items and quantities
- Director approves or rejects returns
- Approved returns trigger stock adjustments

---

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Auth — token TTL is 24 DAYS, not 24 hours
`setToken` computes `expiry = now + (ttl*60*60*24*1000)` (`utils/local-storage.js:5`). That multiplier is the ms in **one day**, so the `ttl` argument is in *days*. Login passes `setToken('token-bmj', access_token, 24)` (`stores/auth.js:25`) → the token lives **24 days**. Looks like an unintended unit bug (a 24-hour TTL would be `ttl*60*60*1000`). Matters for security review and "why am I still logged in" questions.

> ⚠️ Correction: "Token stored in `localStorage` as `token-bmj` with 24h TTL" (line 63) is wrong — it is 24 days.

### Auth — `forceLogout()` is manual-only, NOT a 401 handler
`logout()` clears local state first, best-effort `POST /api/logout`, then hard `window.location.reload()` (`stores/auth.js:38-66`). `forceLogout()` clears state and does `window.location.href = '/login'` (`stores/auth.js:86-92`). `forceLogout` has exactly one caller — the manual button in `components/ProfileBar.vue:56`. There is **no axios 401 interceptor** wiring it. On real token expiry, `getToken` returns null, the router guard sees `authenticated === false` and redirects via `next('/login')` (`router/index.js:678-684`) — `forceLogout` never runs.

> ⚠️ Correction: "Token expiry → `forceLogout()` → redirect to `/login`" (line 65) is misleading — expiry is handled by the route guard, not `forceLogout`.

### Auth — must-change-password gate is a GLOBAL 403 interceptor
Enforced in `main.js:20-36`: any response with status `403` **and** body `must_change_password` truthy opens a message modal and does `router.push('/profile')`. It is a single axios response interceptor, not a per-route guard, so it fires for *every* API call until the password is changed.

> ⚠️ Correction: the "Temp Password Flow" (lines 67-73) describes a `use_temp_password: true` flag driving the redirect. The actual trigger is a **403 + `must_change_password`** body field (`main.js:25`); the employee mapper reads `must_change_password` (`stores/employee.js:25`).

### Auth — two response-envelope shapes coexist (easy to grab the wrong one)
`http-api` unwraps `res.data` once for every verb (`utils/http-api.js:4-8,12-13`). The auth store therefore reads **top-level** fields: `response.access_token`, `response.user` (`stores/auth.js:25-26`). Every other store destructures a further nested `.data`, and lists go one level deeper via `data.data` (`stores/employee.js:31-33`, `stores/customer.js:24-25`). Copy-pasting an auth-style read into another store (or vice-versa) silently yields `undefined`.

### Employee — Director-only is enforced by a FEATURE guard, not a role middleware
The route carries `meta: { feature: 'employee' }` (`router/index.js:490`). `beforeEach` calls `getAllowedFeatures(role)` and redirects to `/menu` unless the feature is allowed (`router/index.js:661-670`). Only `accessFeature.director` lists `'employee'` (`config/index.js:373`), so it is effectively Director-only — but the mechanism is feature-based access, not a `role:director` middleware as the File-map note (line 18) implies.

### Employee — Add page has NO password field (backend generates a temp password)
`EmployeeAddPage.vue` posts fullname/username/email/role/group/phone/branch only — there is no password input in the form. The roles list is hardcoded and includes `head_inventory` (`EmployeeAddPage.vue:75-83`). The temp password is created server-side and surfaced later via reset.

### Employee — temp-password reveal path
After `getEmployee`, if `mustChangePassword && tempPassword` the detail page reveals a password input pre-filled with the temp password so the Director can relay it (`EmployeeDetailPage.vue:154-157`). `resetPassword(id)` maps the returned `temp_password` into `employee.password` (`stores/employee.js:58-65`); the API `POST`s to `/api/employee/reset-password/{id}` with **no body** (`api/employee.js:33-35`).

### Employee — latent ReferenceError in the Edit page
`EmployeeEditPage.vue:95-97` contains a copy-pasted block that assigns `isShowPasswordInputs.value = true`, but that ref is **never declared** in this component (it exists only in `EmployeeDetailPage.vue`). If a just-reset employee (`mustChangePassword && tempPassword`) is opened directly in Edit, `onMounted` throws a ReferenceError. Harmless only because the normal flow reaches Edit from Detail.

### Misc — `@submit.prevent="action()"` calls an undefined function
Every employee form and the General form use `<form @submit.prevent="action()">` where `action` is undeclared (`EmployeeAddPage.vue:3`, `EmployeeDetailPage.vue:7`, `EmployeeEditPage.vue:4`, `GeneralPage.vue:3`). Harmless today because submission happens via explicit `@click` buttons — and in AddPage the button sits *outside* the `<form>` (`EmployeeAddPage.vue:46-52`). But pressing Enter inside a form field would invoke `action()` and throw.

### Dashboard vs Summary — two different "summary" systems, same word
- **Dashboard** store: `GET /api/dashboard/summary` (`api/dashboard.js:6`) — Director analytics for Chart.js (`stores/dashboard.js`).
- **Summary** store: `GET /api/summary/{role}` (`api/summary.js:5`) — the live menu-card counts (`stores/summary.js`).

Grabbing the wrong one gives the wrong shape entirely.

### Summary — Head Inventory sends an unencoded space in the URL
`getSummary` lowercases the role and only collapses `inventory admin` / `inventory purchase` → `inventory`; anything else is used verbatim (`stores/summary.js:13-14`). A Head Inventory user therefore requests `GET /api/summary/head inventory` (literal space, unencoded) — likely mismatched against the backend route.

### Role name has inconsistent casing across three sites
The value is `'Head Inventory'` in `config.common.role.head_inventory` (`config/index.js:321`) and in router `allowedRoles` (`router/index.js:135,367,386`), but the `accessFeature` **map key** is lowercase `'head inventory'` (`config/index.js:431`), and `summary.js:13` lowercases the user role for lookups. Any lookup that does not normalize case will silently miss.

### General settings — frontend does NO decimal↔% conversion
The store copies API values straight into refs and posts them back verbatim (`stores/general.js:10-23`). `GeneralPage.vue` binds those refs directly to inputs and renders a **static** `%` label beside discount/VAT (`GeneralPage.vue:16-18,28-30`) — there is no ×100/÷100 anywhere. Whatever the backend returns is exactly what is shown and re-saved. `HomePage.vue:57-59` loads `getGeneralData()` on mount so the values are available app-wide; they are consumed in Quotation pricing (`components/quotation/QuotationForm.vue`) and Invoice detail (`views/menu/InvoiceDetailPage.vue`).

> ⚠️ Correction: "stored as decimal, displayed as %" (lines 89-91) does not reflect any frontend behavior — the frontend performs no conversion; `%` is a display-only label.

### App shell — two distinct shells
- `/menu`: `MenuPage → components/menu/MenuDesktop` (renders `MenuUpper` + a `<router-view>`) → role tiles at `views/role/MainMenu.vue` (the `''` child route). Full-screen tile grid, no sidebar.
- `/`: `HomePage` = persistent sidebar `NavbarDesktop` + content `<router-view>`. The top bar shows **Back** only when `meta.useBack`, and a **Track** button only when `meta.useTrack` → `trackStore.openTrackModal()` (`views/HomePage.vue:11-20`).

`isMobile` (`stores/main.js:5`) drives all desktop/mobile branching.

### Main menu tiles — own access helper + live counts
`MainMenu.vue` uses its own `canAccess(roles)` (`views/role/MainMenu.vue:249`), independent of the router feature guard, and pulls live counts from `summaryStore` (loaded in `onMounted` → `getSummary()`, line 258). The Inventory tile's destination is role-dependent: Head Inventory/Director → `inventory-head`, Inventory Admin → `inventory-admin`, else `inventory-purchase` (`views/role/MainMenu.vue:251-255`).

### Upload Data — bypasses the store / http-api layer entirely
`UploadDataPage.vue` talks to the backend with a raw Dropzone instance, not the axios `http-api` wrappers: it POSTs to `${VITE_API_BASE_URL}/api/sparepart/updateAllData` with a **manually attached** `Authorization: Bearer <token-bmj>` (plus a static `key: 'rest-api-test'` header), chunked at 2 MB and sequential (`chunkSize: 2000000`, `parallelChunkUploads: false`, `autoProcessQueue: false`) — `UploadDataPage.vue:87-106`. Client-side XLSX validation via the `xlsx` lib enforces a `.xlsx` name (`:155`), required headers `sparepart_number/sparepart_name/purchase_price/seller` (`:202`), and `seller ∈ {1,2,3,4}` (`:218`). None of this goes through the interceptors in `main.js`, so the global 403/must-change-password gate does not cover uploads.

### Return — no dedicated store, and the list links to the PO detail
Return reuses the `purchase-order` store and API (`views/menu/ReturnPage.vue:59,71,100-103`). Clicking a row navigates to **`/purchase-order/:id`** (the PO detail), *not* `/return/:id` (`ReturnPage.vue:113-116`). The approve/reject screen lives at route `/return/:id` = `ReturnDetailPage.vue`, whose buttons call `purchaseOrderStore.rejectReturn(id)` / `approveReturn(id)` (`ReturnDetailPage.vue:289,304`). The Return route block carries **no `meta.feature`** guard (`router/index.js:583-601`), so access is gated only by menu visibility.
