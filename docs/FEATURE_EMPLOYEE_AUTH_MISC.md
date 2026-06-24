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
