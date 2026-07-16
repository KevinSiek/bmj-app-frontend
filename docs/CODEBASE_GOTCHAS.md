# BMJ Frontend — Codebase Gotchas, Edge Cases & Cross-Cutting Notes

> **Read this right after `AGENTS.MD`.** It captures the things the per-feature
> docs don't: cross-cutting conventions, latent bugs, orphaned/legacy code, and
> naming traps that are only obvious after reading the source line by line.
> Every claim cites `file:line`. Reality drifts — if a citation no longer
> matches the code, trust the code and fix the line here.
>
> **Scope split:** cross-cutting facts live here; feature-specific edge cases
> live in each `docs/FEATURE_*.md` under its "⚠️ Edge Cases & Gotchas" section
> (indexed in §15). Compiled 2026-07-16 from a full line-by-line read.

---

## 1. The mental model in 60 seconds

- **`src/config/index.js` is the hub.** It exports `menuMapping` (every route
  path + name), `common` (statuses, roles, branches, modal types, track labels,
  `sourceTypes`, `sourceRouteMap`), `accessFeature` (per-role feature tree), and
  `api` (every endpoint base). The router, the sidebar/nav, the route guard, the
  stores, and the status timeline all key off this one file. **Add a feature
  here and it appears in the router, guard, and nav at once.** Never hardcode a
  route path or status string in a component.
- **Strict layered data flow:**
  `config → api/*.js (thin CRUD via utils/http-api.js) → stores/*.js (mapXxx + refs) → views/*.vue`.
- **Two app shells / two roots** (`src/router/index.js`):
  - `/menu` → `MenuPage.vue` → `components/menu/MenuDesktop.vue` = `MenuUpper` +
    `<router-view>`; landing is `views/role/MainMenu.vue` (role tiles with live
    counts).
  - `/` (redirects to `/menu`) → `HomePage.vue` = persistent sidebar
    (`NavbarDesktop`) + content; the top bar shows a **Back** button when
    `route.meta.useBack` and a **Track** button when `route.meta.useTrack`.
- **Build facts:** `@` → `./src` (`vite.config.js` + `jsconfig.json`); dev API
  is `VITE_API_BASE_URL=http://127.0.0.1:8000` (`.env`; note `127.0.0.1`, not
  `localhost`).

---

## 2. Response envelope & data-mapping conventions (read before touching any store)

- **`utils/http-api.js` unwraps `res.data` exactly once** (`.then(res => res.data)`)
  and re-throws **`err.response`** (the raw HTTP response) on failure — which is
  why stores/views can branch on `error.status` / `error.data`.
- **Two envelope shapes coexist:**
  - **Auth** reads **top-level** fields: `response.access_token`,
    `response.user` (`stores/auth.js:25-26`).
  - **Every other store** destructures a **nested** `.data`, then `data.data`
    for paginated lists: `const { data } = await api.getX(); items.value = data.data.map(mapX)`
    (`stores/employee.js:31-33`). Grabbing the wrong depth is a common mistake.
- **Write/read casing asymmetry:** stores **POST/PUT the camelCase** ref object
  directly (e.g. `addQuotation` sends `quotation.value`), but **GET responses
  are snake_case** and get mapped back to camelCase by `mapXxx()`. The backend
  accepts camelCase on write via a field map — see §13 for the trap.
- **`mapXxx()` with empty input = the blank-form factory.** `$resetX()` is
  usually `x.value = mapX()`, producing an empty template that Add pages mount
  with. Don't assume `$resetX` just nulls the ref.

---

## 3. Store & list conventions

- **Grouping + versioning:** Quotation, PO, PI, Invoice, Back Order, Work Order,
  and Return group flat API rows by document number into `{ number, versions[] }`.
  The list shows the **latest** version as a collapsible parent; older versions
  render **disabled / non-clickable**. Grouping keys on the *internal* number
  (e.g. `purchase_order_number`), not the customer PO number.
- **Pagination is URL-driven.** `Pagination.vue` reads `route.query.page` and
  writes via `utils/route-util.updateQuery`. Likewise `SelectDate` (month/year)
  and `DateRangeFilter` (start/end, mutually exclusive with month/year) push to
  `route.query`; list pages react to the URL. State is shareable/bookmarkable.
- **Three divergent `mapSparepart` copies** with different `totalUnit` shapes —
  see §11/§12 and `docs/FEATURE_SPAREPARTS.md`.

---

## 4. Auth & session

- **Sanctum bearer token** in `localStorage('token-bmj')`; header set globally in
  `stores/auth.js` after login and re-applied in `getUser()`.
- 🐞 **Token TTL is 24 *days*, not 24 hours.** `setToken('token-bmj', token, 24)`
  (`stores/auth.js:25`) with `expiry = now + ttl*60*60*24*1000`
  (`utils/local-storage.js:1-8`). `60*60*24*1000` is **one day in ms**, so `ttl`
  is days → `24` = 24 days. Docs/AGENTS that say "24-hour TTL" are wrong. Hours
  would be `ttl*60*60*1000`. `getToken` auto-purges on expiry.
- **Must-change-password gate is global**, enforced by an axios *response*
  interceptor (`main.js:20-36`): any `403` whose body has `must_change_password`
  → message modal + `router.push('/profile')`. It is **not** a per-route guard.
- **`forceLogout()` is only called manually** from `ProfileBar.vue` — it is
  **not** wired to a 401 interceptor (the AGENTS "token expiry → forceLogout"
  line is aspirational). `logout()` clears local state first, best-effort hits
  `/api/logout`, then hard `window.location.reload()`.

---

## 5. Roles & access control

- **Seven roles** (`common.role`, `config/index.js:314-322`): Director,
  Marketing, Finance, Inventory Admin, Service, Inventory Purchase, Head
  Inventory.
- 🐞 **One role, three spellings:** `common.role.head_inventory` = `'Head Inventory'`
  (display), the `accessFeature` key is `'head inventory'` (lowercase), and
  router `allowedRoles` uses `'Head Inventory'`. Comparisons must use the right
  form. Related bug: `stores/summary.js:13-14` normalizes `inventory admin` /
  `inventory purchase` → `inventory` but **not** `head inventory`, so a Head
  Inventory user requests `GET /api/summary/head inventory` (unencoded space) —
  likely mismatched vs backend.
- **Access is gated at four independent layers**, all sourced from
  `accessFeature`: (1) router `meta.feature` + `meta.allowedRoles`
  (`router/index.js:653-699`), (2) sidebar `NavbarDesktop` /
  `NavbarMobile.flatFeatures`, (3) `MainMenu.canAccess()` tiles, (4) `useRole()`
  computed booleans in components. `useRole` compares against the **display**
  strings.
- **`BranchField.vue` bakes policy into a component:** Director → `<select>`
  (Jakarta/Semarang), Marketing → read-only field. Falls back to `useRole()`
  when its `showDirector`/`showReadonly` props are `undefined`.
- **Router exception:** Marketing is normally denied `delivery_order` /
  `work_order` features, but the guard special-cases the DO-add and WO-add
  routes so Marketing can release (`router/index.js:663-667`).

---

## 6. Status vs Track vocabularies (they are NOT the same strings)

- `common.status.*` (per-entity display strings) and `common.track.*` (timeline
  labels) **differ** — e.g. status `'PO'` vs track `'Po'`; track adds `'Pi'`,
  `'Full Paid'`. `Track.vue` maps `trackType` (`'Borrow'` / `'SparepartMovement'`
  / `'WorkOrder'` / default PO) to a canonical step list and overlays the real
  `status[]` events, filling in completed vs pending steps.
- **Delivery Order reuses the Work Order status vocabulary**
  (`Wait On Progress → On Progress → Done`), not its own set.
- **Inverted-boolean idiom:** several "is paid / is done" computeds mean
  "**not yet** → show the button." The clearest is PI's `isDPPaid`
  (`ProformaInvoiceDetailPage.vue:309-313`) — `true` means DP not yet paid. The
  PO detail uses the same `!status.some(s => s.state === track.X)` pattern for
  `isShowReady`, `isShowCreatePi`, etc. Don't read these names literally.

---

## 7. Global UI buses

- **Modal store** (`stores/modal.js`) drives the three modals mounted in
  `App.vue`: `openMessageModal(type, msg)`, `openConfirmationModal(msg, okMsg, cb)`,
  `openNotesModal(label, cb, { requirePo, label })`. `action` holds the
  callback; `requirePoNumber` adds an inline PO-number field (used by
  `moveToPo`). `ModalConfirmation`/`ModalNotes` await `action()` then show a
  success/failure `ModalMessage`.
- **Track store** (`stores/track.js`) drives the slide-in timeline (`TrackNav` →
  `Track.vue`): `isShowTrack`, `trackData`, `trackType`, opened from the shell's
  Track button on `meta.useTrack` routes.

---

## 8. Money & formatting

- All rupiah rendering uses `Intl.NumberFormat('id-ID')` (thousands = `.`).
  `utils/form-util.js`: `formatMoney`/`formatCurrency` (no "Rp", web display),
  `formatPDFPrice` (returns a pdfmake columns object **with** "Rp." — comment
  notes PDFs are official financial docs), `formatDate`, `formatDateAndTime`.
- **Two globally-registered components** (`main.js:43-44`, usable without
  import): `PriceDisplay` (read-only "Rp. 1.250.000") and `CurrencyInput`
  (formatted input, `v-model` stays a raw `Number`).
- Backend can send fractional money, so PDFs/detail pages sprinkle `Math.ceil` /
  `Math.trunc` (e.g. `stores/invoice.js:29-30`, `utils/pdf/invoice.js`).

---

## 9. PDF subsystem (`src/utils/pdf/*.js`)

- Each generator is `createPdf(data, notes, user)` (or `(data, title)` for the
  delivery note). Pattern: fetch `/images/logo-header.png` as base64
  (`utils/pdf-util.getBase64FromUrl`), build an A4 `docDefinition`, branch on
  `type === common.type.sparepart` to pick a sparepart vs service table, render
  Amount/Discount rows only when `hasDiscount`, stamp `-Rev.N` when `version > 1`.
- **Every generator ends with `.print()`** — the `.download(...)` line is
  commented out in all of them. The app prints; it does not save files.
- PI and Invoice spell amounts with `to-words` (`ToWords`, IDR). The PI PDF has
  a **hardcoded** BCA account `009-8928009` and signatory `SR. PRAWESTI / FINANCE`
  (`utils/pdf/proforma-invoice.js`).
- The PO PDF prints **both** numbers — "PO Customer" (`poNumber`) and
  "Internal PO" (`purchaseOrderNumber`) — the clearest proof of the two-number
  model (§12). `utils/pdf/purchase-order.js:139-140`.

---

## 10. Two different "summary" systems (same word, different data)

- **Dashboard** = Director analytics: `stores/dashboard.js` →
  `GET /api/dashboard/summary` (Chart.js: revenue trend, branch mix, receivables
  aging, funnel, leaderboard).
- **Summary** = menu-card counts: `stores/summary.js` → `GET /api/summary/{role}`,
  consumed by `MainMenu` tiles.
- Grabbing the wrong store is an easy mistake. See §5 for the `head inventory`
  role bug in the summary path.

---

## 11. Orphaned / legacy / dead-code registry

This codebase repeatedly keeps a **stale artifact beside its live replacement**.
Don't "fix" or build on these without checking they're actually wired in:

| Artifact | Reality | Evidence |
| --- | --- | --- |
| `components/SparepartSelector.vue` | Orphaned. Imported **only** by the also-orphaned `PurchaseItemRow.vue`. Calls `axios.get('/api/spareparts')` directly (wrong endpoint — real is `/api/sparepart`), bypasses `http-api`, and expects fields that don't match the stores. | grep imports |
| `components/PurchaseItemRow.vue` | Orphaned — imported by **no** file. Live Purchase/Movement forms use inline inputs + Bootstrap dropdowns. | grep imports |
| `views/menu/BorrowReturnPage.vue` (`/borrow/:id/return`) | Legacy return screen posting a different payload; the **live** borrow return is inline on `BorrowDetailPage`. | `BorrowDetailPage.vue:235-250` |
| Route `/work-order/add/:id` (used by PO `doRelease`) | **Not in `menuMapping`** (only `/work-order/add` exists). Also the Service→WO branch of `doRelease` is unreachable because the Release button only renders for Spareparts POs. | `PurchaseOrderDetailPage.vue:381-488` |
| DO list "Add Delivery Order" button | Pushes the literal `menuConfig.delivery_order_add.path` string with unresolved `:id` → effectively broken. Real DO creation is PO-detail → Release. | `DeliveryOrderPage.vue:119` |
| `components/NavbarMobile.vue` legacy `menus` array | Large commented-out hardcoded menu block sits beside the live config-driven version. | `NavbarMobile.vue:138-192` |
| `composeable/useTrack.js` | A second Track implementation (`getTrackFunc`) that duplicates the live `stores/track.js`; the UI (`Track.vue`, `TrackNav.vue`) uses the **store**. | compare files |
| `stores/counter.js` | Unused default Pinia example. | — |

---

## 12. Known latent frontend bugs

These are real but mostly dormant (dead paths or unused actions). Flag before
relying on the surrounding code:

- 🐞 **Token TTL 24 days** — §4, `utils/local-storage.js:1-8`.
- 🐞 **`EmployeeEditPage.vue:95-97`** references `isShowPasswordInputs`, which is
  declared only in `EmployeeDetailPage` → `ReferenceError` path if a reset
  employee is opened in Edit.
- 🐞 **`uploadSparepartFile`** builds an **empty** `FormData` and never appends
  the file (`stores/sparepart.js:73-78`) — broken stub (the live import path is
  `UploadDataPage.vue`'s raw Dropzone, not this).
- 🐞 **`Pagination.vue`** has leftover `console.log`s and assigns to the computed
  `currentPage` (`onClickPage`, `:67`) — a no-op; navigation works via
  `updateQuery`.
- 🐞 **`addInvoice` / `addDeliveryOrder`** pass the store **ref** (not `.value`)
  to the API — latent, but both `add` paths are unused (creation is server-side
  via PO `moveToPi` / `release`).
- 🐞 **`@submit.prevent="action()"`** on employee forms calls an **undefined**
  `action` — harmless because buttons submit via `@click`, but an Enter-key
  submit would throw.

---

## 13. API-contract cautions (backend-facing)

Before asserting on backend behavior, read `docs/tests/LLM_HANDOVER.md` (the
verified 328-test Playwright suite in `e2e/` is the source of truth; the
`docs/tests/TEST_*.md` files are a **stale wishlist**). Key traps:

- **Failure codes are NOT uniform.** Most invalid bodies → `422`, but
  `PUT /purchase-order/{id}`, `PUT /delivery-order/{id}`, `release/{id}` (both
  branches), and the Excel `updateAllData` path → **`400`** (manual
  `Validator::make`). Some transition endpoints have **no** validation path.
- **camelCase field-map trap:** several controllers read camelCase keys via a
  `$fieldMap` and **silently drop** snake_case — a status-only test won't catch
  the no-op. Always read back the mutated field.
- **Cross-wired endpoints (frontend surprise):** PO returns
  (`returnPurchaseOrder`/`approveReturn`/`rejectReturn`) POST to the **quotation**
  API `/api/quotation/return|approveReturn|rejectReturn/{id}`
  (`api/purchase-order.js:104-114`); PO **fullPaid** posts to the **proforma-invoice**
  endpoint `/api/proforma-invoice/fullPaid/{id}` (`api/purchase-order.js:83-85`).
- **Frontend "Purchase" = backend "Buy"** (`api.purchase = '/api/buy'`).

---

## 14. Data-entry hardening idiom

Numeric inputs across the forms block spinner/scientific-notation input with
`@wheel.prevent` + `@keydown` blocking `-`, `+`, `e`, `E`. When adding a numeric
field, replicate it for consistency. Money fields use the global `CurrencyInput`.

---

## 15. Per-feature edge-case index

Each feature doc carries a `## ⚠️ Edge Cases & Gotchas` section with the details
for that domain:

- Sales: [FEATURE_QUOTATION.md](./FEATURE_QUOTATION.md) · [FEATURE_PURCHASE_ORDER.md](./FEATURE_PURCHASE_ORDER.md)
- Billing: [FEATURE_PROFORMA_INVOICE.md](./FEATURE_PROFORMA_INVOICE.md) · [FEATURE_INVOICE.md](./FEATURE_INVOICE.md)
- Logistics/Service: [FEATURE_DELIVERY_ORDER.md](./FEATURE_DELIVERY_ORDER.md) · [FEATURE_WORK_ORDER.md](./FEATURE_WORK_ORDER.md)
- Fulfilment: [FEATURE_BACK_ORDER.md](./FEATURE_BACK_ORDER.md) · [FEATURE_BORROW.md](./FEATURE_BORROW.md)
- Inventory: [FEATURE_PURCHASE.md](./FEATURE_PURCHASE.md) · [FEATURE_SPAREPARTS.md](./FEATURE_SPAREPARTS.md) · [FEATURE_STOCK_MOVEMENT.md](./FEATURE_STOCK_MOVEMENT.md)
- Admin/CRM: [FEATURE_EMPLOYEE_AUTH_MISC.md](./FEATURE_EMPLOYEE_AUTH_MISC.md) · [FEATURE_CRM.md](./FEATURE_CRM.md)

Core references: [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) ·
[API_LAYER_AND_UTILS.md](./API_LAYER_AND_UTILS.md) · [COMPONENTS.md](./COMPONENTS.md)
