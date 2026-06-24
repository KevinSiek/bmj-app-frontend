# AGENTS.MD — BMJ App Frontend (Vue 3 + Vite)

> **Purpose**: This file is the LLM orchestrator for `bmj-app-frontend`. Read
> this FIRST in every new session to understand the entire frontend codebase in
> under 60 seconds. Then read the feature-specific `docs/*.md` files only when
> you need to modify that feature.

---

## 1. What This Application Is

**BMJ App** is an internal ERP / order-management system for **PT Berkat Megah
Jaya**, a company dealing in spareparts and industrial services across multiple
branches (Jakarta, Semarang). The frontend is a **Vue 3 SPA** using
**Composition API** throughout. It communicates with a **Laravel 11** backend
via REST API protected by **Laravel Sanctum** token auth.

### Business Domain (Order Lifecycle)

```
Quotation → Purchase Order → Proforma Invoice → Invoice
                           → Work Order (service jobs)
                           → Delivery Order (logistics)
                           → Back Order (fulfilled by manual Buy/Purchase)
```

Every entity has a status lifecycle (Process → On Review → Approved → PO →
Ready → Release → Done) with approval/rejection workflows.

---

## 2. Tech Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| Framework      | Vue 3 (Composition API, `<script setup>`)                    |
| Build          | Vite 6                                                       |
| State          | Pinia (one store per domain entity)                          |
| Router         | Vue Router 4 (history mode)                                  |
| HTTP Client    | Axios (base URL from `VITE_API_BASE_URL` env var)            |
| CSS/UI         | Bootstrap 5 + Bootstrap Icons + Tailwind CSS 4 + SCSS        |
| Charts         | Chart.js + vue-chartjs                                       |
| PDF Gen        | pdfmake (client-side PDF generation for PO, PI, Invoice, etc)|
| File Upload    | Dropzone 6                                                   |
| Excel          | xlsx (SheetJS) for data import/export                        |
| Number-to-Word | to-words (currency amount to text)                           |
| Font           | Poppins (Google Fonts)                                       |

---

## 3. Project Structure Map

```
src/
├── main.js                    # App entry: mounts Vue, Pinia, Router, Axios defaults
├── App.vue                    # Root component: RouterView + global modals
├── config/index.js            # ★ CENTRAL CONFIG — menu paths, statuses, roles, API endpoints
├── router/index.js            # All route definitions + auth guard
├── api/                       # HTTP wrapper per domain (→ docs/API_LAYER.md)
├── stores/                    # Pinia stores per domain (→ docs/STATE_MANAGEMENT.md)
├── views/                     # Page-level components
│   ├── HomePage.vue           # Authenticated shell (sidebar + content)
│   ├── LoginPage.vue          # Login form
│   ├── MenuPage.vue           # Mobile menu shell
│   ├── menu/                  # ★ All feature pages (→ docs/FEATURES.md)
│   └── role/                  # Role-specific menu components
├── components/                # Shared UI components (→ docs/COMPONENTS.md)
│   ├── menu/                  # Per-feature sidebar menu items
│   └── quotation/             # QuotationForm.vue (30KB, most complex component)
├── composeable/               # Vue composables (useRole, useTrack, useDate)
├── utils/                     # Utilities (→ docs/UTILITIES.md)
│   ├── http-api.js            # Generic Axios CRUD wrappers
│   ├── local-storage.js       # Token storage with TTL
│   ├── pdf/                   # PDF generators per document type
│   └── ...
└── assets/css/base.css        # Global base styles
```

---

## 4. Architecture Patterns (MUST FOLLOW)

### 4.1 Config-Driven Routing

All route paths and names are defined in `src/config/index.js` → `menuMapping`.
The router imports `menuMapping as menuConfig` and references it like
`menuConfig.quotation.path`. **Never hardcode route paths in components or
router** — always reference `menuMapping`.

### 4.2 API Layer Pattern

Each domain has a file in `src/api/` that imports generic CRUD helpers from
`src/utils/http-api.js` and the endpoint from `src/config/index.js → api`.

```
config/index.js (api.quotation = '/api/quotation')
    ↓
api/quotation.js (uses http-api.js wrappers)
    ↓
stores/quotation.js (calls api, maps data, exposes state)
    ↓
views/menu/QuotationPage.vue (consumes store)
```

### 4.3 Store Pattern (Pinia Composition API)

Every store follows this structure:
1. `ref()` for reactive state
2. `mapXxx(data)` function to normalize API response to frontend model
3. `async` action functions that call api, map results, set refs
4. `$resetXxx()` functions to clear state
5. Stores export all refs and actions

### 4.4 Auth Flow

1. Login via `POST /api/login` → receives Sanctum token
2. Token stored in localStorage as `token-bmj` with 24-hour TTL
3. Axios `Authorization: Bearer <token>` header set globally
4. Router guard checks `authStore.authenticated` on `requireAuth` routes
5. On 401/token expiry → `forceLogout()` clears state and redirects to `/login`

### 4.5 Role-Based Access

Seven roles defined in `config/index.js → common.role`:
- **Director** — full access to everything
- **Marketing** — quotation, purchase_order, spareparts (view only), borrow
- **Finance** — quotation, purchase_order, proforma_invoice, invoice
- **Inventory Admin** — purchase_order, spareparts, back_order, delivery_order, borrow, stock_history, sparepart_movement
- **Inventory Purchase** — spareparts, back_order, purchase
- **Head Inventory** — purchase_order, spareparts, borrow, stock_history, sparepart_movement, purchase, back_order, delivery_order (supervisor role)
- **Service** — purchase_order, spareparts (view), work_order

The `accessFeature` config maps each role to its allowed feature keys. The
`useRole()` composable provides computed booleans: `isRoleDirector`,
`isRoleMarketing`, etc.

### 4.6 Modal System

Three global modals managed by `useModalStore`:
- **ModalMessage** — success/failure feedback
- **ModalConfirmation** — confirm/cancel dialogs with callback
- **ModalNotes** — add notes before an action (e.g., reject with reason)

### 4.7 Responsive Design

`App.vue` detects mobile via `responsiveUtil.isMobile()` → `mainStore.isMobile`.
Components branch between desktop/mobile rendering accordingly. Two navbars:
`NavbarDesktop.vue` and `NavbarMobile.vue`.

---

## 5. Feature Index

| Feature            | Pages (in `views/menu/`)                                          | Store file              | API file              | Docs                                    |
| ------------------ | ----------------------------------------------------------------- | ----------------------- | --------------------- | --------------------------------------- |
| Dashboard          | DashboardPage                                                     | dashboard.js            | dashboard.js          | docs/FEATURE_DASHBOARD.md               |
| Quotation          | Quotation{Page,Add,Edit,Detail,Review,ReviewDetail}               | quotation.js            | quotation.js          | docs/FEATURE_QUOTATION.md               |
| Purchase Order     | PurchaseOrder{Page,Detail,Return}                                 | purchase-order.js       | purchase-order.js     | docs/FEATURE_PURCHASE_ORDER.md          |
| Proforma Invoice   | ProformaInvoice{Page,Detail,Edit}                                 | proforma-invoice.js     | pi.js                 | docs/FEATURE_PROFORMA_INVOICE.md        |
| Invoice            | Invoice{Page,Detail}                                              | invoice.js              | invoice.js            | docs/FEATURE_INVOICE.md                 |
| Work Order         | WorkOrder{Page,Add,Detail,Edit}                                   | work-order.js           | work-order.js         | docs/FEATURE_WORK_ORDER.md              |
| Delivery Order     | DeliveryOrder{Page,Add,Detail}                                    | delivery-order.js       | delivery-order.js     | docs/FEATURE_DELIVERY_ORDER.md          |
| Back Order         | BackOrder{Page,Detail,AdjustmentPage}                            | back-order.js           | back-order.js         | docs/FEATURE_BACK_ORDER.md              |
| Purchase (Buy)     | Purchase{Page,Add,Edit,Detail,Review,ReviewDetail}                | purchase.js             | purchase.js           | docs/FEATURE_PURCHASE.md                |
| Spareparts         | Spareparts{Page,Add,Detail,Edit}                                  | sparepart.js            | sparepart.js          | docs/FEATURE_SPAREPARTS.md              |
| Sparepart Movement | SparepartMovement{Page,Add,Detail}                                | sparepart-movement.js   | sparepart-movement.js | docs/FEATURE_SPAREPART_MOVEMENT.md      |
| Stock History      | StockHistoryPage                                                  | stock-movement.js       | stock-movement.js     | docs/FEATURE_SPAREPART_MOVEMENT.md      |
| Borrow (Pinjaman)  | Borrow{Page,Add,Detail,ReturnPage}                                | borrow.js               | borrow.js             | docs/FEATURE_BORROW.md                  |
| Employee           | Employee{Page,Add,Detail,Edit}                                    | employee.js             | employee.js           | docs/FEATURE_EMPLOYEE_AUTH_MISC.md      |
| Profile            | ProfilePage                                                       | auth.js                 | auth.js               | docs/FEATURE_EMPLOYEE_AUTH_MISC.md      |
| General Settings   | GeneralPage                                                       | general.js              | general.js            | docs/FEATURE_EMPLOYEE_AUTH_MISC.md      |
| Upload Data        | UploadDataPage                                                    | —                       | sparepart.js          | docs/FEATURE_EMPLOYEE_AUTH_MISC.md      |
| Return             | Return{Page,Detail}                                               | purchase-order.js       | purchase-order.js     | docs/FEATURE_PURCHASE_ORDER.md          |

---

## 6. Key Files to Read First

When starting a new session or task, read these files in order:

1. **This file** (`AGENTS.MD`) — system overview
2. **`src/config/index.js`** — all route paths, statuses, roles, API endpoints
3. **`src/router/index.js`** — full route tree with auth guards
4. **The specific `docs/*.md`** for the feature you're modifying
5. **The specific store** (`src/stores/xxx.js`) for state logic
6. **The specific API file** (`src/api/xxx.js`) for endpoint calls

---

## 7. Naming Conventions

| Entity          | Convention                      | Example                  |
| --------------- | ------------------------------- | ------------------------ |
| Views           | `{Feature}{Action}Page.vue`     | `QuotationAddPage.vue`   |
| Components      | PascalCase descriptive          | `SparepartSelector.vue`  |
| Stores          | `use{Feature}Store`             | `useQuotationStore`      |
| API files       | kebab-case matching backend     | `purchase-order.js`      |
| Routes          | kebab-case paths                | `/purchase-order/:id`    |
| Config keys     | snake_case                      | `purchase_order_detail`  |

---

## 8. Common Patterns You MUST Replicate

### Adding a new page:
1. Create `views/menu/NewFeaturePage.vue`
2. Add route config in `config/index.js → menuMapping`
3. Add route in `router/index.js` referencing `menuConfig.new_feature`
4. Add API endpoint in `config/index.js → api`
5. Create `api/new-feature.js` using `http-api.js` wrappers
6. Create `stores/new-feature.js` with Pinia composition API
7. Add menu entry in relevant `components/menu/Menu*.vue`

### Modifying an entity's status lifecycle:
1. Update status values in `config/index.js → common.status`
2. Update backend controller + migration if new DB column needed
3. Update the store's `mapXxx()` function
4. Update the Track component data if it's a tracked entity

### Adding inline validation to a form:
1. Add `isDirty = ref(false)` to the entity's Pinia store and return it
2. Add `computed errors` to the Vue component — one key per validated field
3. Add a deep `watch` on the form data that sets `store.isDirty = true`
4. Bind `:class="{ 'is-invalid': store.isDirty && errors.field }"` on each input
5. Add `<div class="invalid-feedback">{{ errors.field }}</div>` after each input
6. In the submit handler, set `store.isDirty = true` first, then guard with
   `Object.values(errors.value).some(Boolean)` before calling the API
See **`docs/INLINE_VALIDATION.md`** for the full pattern and field-type rule reference.

---

## 9. Related Backend

The backend is a **Laravel 11** app at:
`e:\Kerja\Kerja\Bkawan\PT_BerkatMegahJaya\Repo\backend\bmj-app-backend\BmjAppBackend`

See `AGENTS.MD` in that repo for the backend orchestration doc.

**API Base URL**: Configured in `.env` → `VITE_API_BASE_URL` (default:
`http://localhost:8000`).

**Auth**: Laravel Sanctum token-based. Frontend sends `Authorization: Bearer`
header. Backend validates via `auth:sanctum` middleware.

---

## 10. Testing & Quality Assurance

There is a real, verified **Playwright E2E suite in `e2e/` — 35 specs / 328 tests passing** —
that drives the full-stack app + backend API (lifecycle, full role×route authz matrix,
per-field validation, stock + concurrency, negatives, edge cases).

**Start here:**
1. ⭐ [`docs/tests/LLM_HANDOVER.md`](./docs/tests/LLM_HANDOVER.md) — current state, how to run
   (servers + single worker; global-setup reseeds the DB), the **6 backend bugs fixed** and
   which test guards each, and the validation failure-code cheat sheet.
2. [`e2e/README.md`](./e2e/README.md) — verified status + spec map.
3. The `e2e/*.spec.js` files are the **source of truth**. The older `docs/tests/TEST_*.md`
   catalog is a stale planning wishlist (~158 envisioned cases), NOT the implemented suite.

**Run:** `npm run test:e2e` (start `php artisan serve` :8000 and Vite on **:5173 strict** first;
the config hardcodes `baseURL :5173` and the suite is single-worker + reseeds the DB).

Always run the suite before implementing major changes — it guards stock invariants, role
access, versioning, validation codes, and the temp-password single-use gate.

---

## 11. Development Commands

```bash
npm run dev       # Start Vite dev server (default: http://localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint fix
npm run format    # Prettier format src/
npm run test:e2e            # Run ALL e2e specs headless + auto-generate the HTML report
npx playwright show-report  # Open the generated report in a browser (after a run)
npm run test:e2e:ui         # Playwright UI Mode — interactive visual debugger (same tests)
```

> Best "run + report" command: `npm run test:e2e` then `npx playwright show-report`
> (or chain: `npm run test:e2e; npx playwright show-report`). `test:e2e` and `test:e2e:ui`
> run the SAME tests — `--ui` is the visual debugger, not "the UI tests". Start backend :8000
> + Vite :5173 (strict) first; the run reseeds the DB.

---

## 11. Environment Variables

| Variable           | Purpose                         | Default                |
| ------------------ | ------------------------------- | ---------------------- |
| `VITE_API_BASE_URL`| Backend API base URL            | `http://localhost:8000`|

Production `.env.production` sets this to the deployed backend URL.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **bmj-app-frontend** (4118 symbols, 9782 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "master"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.
- NEVER execute git commits directly. Always leave all files unstaged/staged as requested, and let the human user evaluate and run commits manually.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/bmj-app-frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/bmj-app-frontend/clusters` | All functional areas |
| `gitnexus://repo/bmj-app-frontend/processes` | All execution flows |
| `gitnexus://repo/bmj-app-frontend/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
