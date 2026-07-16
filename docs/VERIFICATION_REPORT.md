# BMJ ERP — Exhaustive Full-Stack Verification Report

> **Subject**: PT Berkat Megah Jaya ERP — Vue 3 frontend (`bmj-app-frontend`) + Laravel 11
> backend (`bmj-app-backend`). Read-only audit of **both** repos.
>
> **Method**: 3 authority files read line-by-line (FE `config/index.js`, FE `router/index.js`,
> BE `routes/api.php`) + all 18 backend controllers + middleware + `SparepartStockService` +
> ~60 FE views/stores + all 56 e2e specs. Then an 8-domain multi-agent investigation
> (one investigator per feature domain → 100 capability-matrix rows, 38 FE/BE mismatches,
> 93 edge cases) with an **adversarial verification pass** (each finding handed to an independent
> skeptic instructed to *refute* it from source). The verifier corrected several findings — see
> the per-finding **Verified** column.
>
> **Verification legend** —
> `✔ADV` verified by an adversarial agent that re-proved it from source (quoted line);
> `✔ME` re-read and confirmed by hand in the main loop;
> `~INV` investigator-reported, cited to `file:line`, **not** independently re-verified (the
> verification agents for these domains hit the session usage limit before running);
> `ASSUMPTION` explicitly marked inference.
> All findings carry `file:line` + repo (**FE** = frontend, **BE** = backend).
>
> **Severity** — 🔴 P0 (unauthenticated-role data mutation / integrity, act now) · 🟠 P1 (real
> security or integrity defect) · 🟡 P2 (workflow/authz/consistency) · 🔵 P3 (broken UX / cosmetic
> / dead code). **A frontend-hides-but-backend-allows gap is treated as a SECURITY finding.**
>
> **Report-only**: no product code was changed; no commit was made. Compiled 2026-07-16.

---

## Executive summary

The backend is the **only real authorization boundary** (`RoleMiddleware`; `director` bypasses
all checks). Layer analysis and adversarial verification surfaced **three classes** of defect:

1. **Master-data endpoints with no role gate at all** (Customer, Seller, Access) — any
   authenticated role, including Service, can CRUD them. `access/*` governs the permission
   catalog itself. **P0.** (§F1–F3, ✔ME)
2. **Frontend-hides-but-backend-allows privilege escalation** — the Sparepart catalog
   (create/update/delete + **bulk price-list upload**) is Director-only in the UI but allows 5
   roles at the API. **P0/P1.** (§F4, ✔ME)
3. **State-machine / stock-integrity gaps** — `buy.done` and `backorder.adjust` are replayable
   and double-mutate stock; `sparepart.update` can write **negative** stock; PO/PI/WO/DO
   lifecycle transitions skip required states; the delivery-note number generator has a
   **duplicate-number race**; the Employee model leaks the plaintext **temp password** to the
   client. **P0–P2.** (§F5–F13)

Two important corrections the adversarial pass made vs. the prior draft:
- The "Return approval privilege escalation" is actually a **functional dead-end**: the FE POSTs
  to a **GET-only** route → HTTP 405 for *everyone including Director* (§F14, ✔ADV). The
  ungated route + missing director-lock are latent, masked behind the 405.
- Several "escalations" were **downgraded to broken-UX (P3)** because the backend *does* reject
  (Quotation approve/reject, Finance edit) — kept honest so the P0/P1 list stays credible.

**e2e suite**: reported 330/330 passing (36 specs). **Not executed this audit** — backend :8000
was down and `global-setup` runs a destructive `migrate:fresh --seed`; the coverage map (§5) is
built by reading the specs. The suite's blind spots line up exactly with the P0/P1 findings (§5.2).

---

## 1. Authorization model (both repos)

Five gate layers; only L5 is real:

| Layer | Repo | Where | Enforces |
| --- | --- | --- | --- |
| L1 feature | FE | `router/index.js:661-670` | `to.meta.feature ∈ accessFeature[role]` |
| L2 allowedRoles | FE | `router/index.js:672-676` | `to.meta.allowedRoles.includes(role)` (sparse) |
| L3 nav | FE | `Navbar*.vue` | which menu items render |
| L4 button | FE | per-view `v-if` on `useRole()` | which action buttons render |
| **L5 `role:` middleware** | **BE** | **`routes/api.php` + `RoleMiddleware.php:16-32`** | **the only real HTTP 403** |

**Governing facts** (✔ME):
- `director` bypasses every backend role check — [BE:RoleMiddleware.php:27](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Middleware/RoleMiddleware.php#L27).
- roles normalize `strtolower`+spaces→`_` (`:24-25`); the token **`inventory`** in many route lists matches **no real role** → dead (harmless but misleading). Confirmed across api.php:78,158,181,191,249,254,257,260.
- No **Head Inventory** seed account exists (`e2e/helpers.js`, LLM_HANDOVER §3) → HI capabilities are entirely untested and its DP-paid release bypass (BE:920,998) is unexercised.
- Some audited backend files are **uncommitted working-tree changes** (LLM_HANDOVER §2; `git status` shows `M PurchaseOrderController.php`, `M WorkOrderController.php`). All findings describe the code **as it is now**.

---

## 2. Capability matrix — Role × Feature (backend-enforced)

`accessFeature` (FE [config/index.js:351-469](../src/config/index.js#L351)) vs `role:` middleware (BE [routes/api.php](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php)). ✔=allowed, ✘=403, D=Director-only, **⚠=FE/BE disagree (see §4)**. Director omitted (bypasses L5).

| Feature (API) | Mkt | Fin | InvAdmin | InvPurch | HeadInv | Svc | BE group (api.php) |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | --- |
| Quotation `/quotation` | ✔ | ⚠ᵃ | ✘ | ✘ | ✘ | ✘ | marketing,finance,director (:57) |
| — approve/decline | D | D | ✘ | ✘ | ✘ | ✘ | in-method Director-only (:781,834) |
| — needChange | ⚠ᵇ | ⚠ᵇ | ✘ | ✘ | ✘ | ✘ | route marketing,finance,director; **no director lock** (:712) |
| PO read/most `/purchase-order` | ✔ | ✔ | ✔ | ✘ | ✔ | ✔ | 7-role (:78) |
| — updateStatus/ready/done/moveToPi | ⚠ᶜ | ⚠ᶜ | ⚠ᶜ | ✘ | ⚠ᶜ | ⚠ᶜ | 7-role, **no in-method role/from-state guard** (:84,85,86,83) |
| — release | ⚠ᵈ | ✘ | ✔ | ✘ | ✔ | ✘ | marketing,inventory_admin,head_inventory,director (:94) |
| — decline | D/Fin | ✔ | ✘ | ✘ | ✘ | ✘ | in-method Finance/Director (:1106) |
| Proforma/Invoice `/proforma-invoice`,`/invoice` | ✘ | ✔ | ✘ | ✘ | ✘ | ✘ | finance,director (:124) |
| — fullPaid | ✘ | ⚠ᵉ | ✘ | ✘ | ✘ | ✘ | finance,director; **skips DP-paid** (:497) |
| Work Order `/work-order` read | ✔ | ✘ | ✘ | ✘ | ✘ | ✔ | marketing,service,director (:143) |
| — create/update | ✔ | ✘ | ✘ | ✘ | ✘ | ⚠ᶠ | marketing,director (:147) |
| — process/done | ✘ | ✘ | ✘ | ✘ | ✘ | ✔ | service,director (:151) |
| Delivery Order `/delivery-order` | ✘ | ✘ | ✔ | ✘ | ✔ | ✘ | inventory_admin,head_inventory,director (:181) |
| — update (Done, unpaid) | ✘ | ✘ | ⚠ᵍ | ✘ | ⚠ᵍ | ✘ | route ok; **no payment/from-state guard** (:281) |
| Back Order `/back-order` | ✘ | ✘ | ✔ | ✔ | ✔ | ✘ | inventory_purchase,inventory_admin,head_inventory,director (:191) |
| — adjust (replay) | ✘ | ✘ | ⚠ʰ | ⚠ʰ | ⚠ʰ | ✘ | route ok; **no status guard** (:498) |
| Buy `/buy` create/done | ✘ | ✘ | ✘ | ✔ | ✔ | ✘ | inventory_purchase,head_inventory,director (:158) |
| — done (replay) | ✘ | ✘ | ✘ | ⚠ⁱ | ⚠ⁱ | ✘ | route ok; **no status guard → double stock** (:634) |
| Borrow read/send/receive/done | ✔ | ✘ | ✔ | ⚠ʲ | ✔ | ✘ | +inventory_purchase (:203/:223) |
| — return (no owner guard) | ⚠ᵏ | ✘ | ✘ | ✘ | ✘ | ✘ | marketing,director; **no ownsBorrow** (:376) |
| **Sparepart write/delete/upload** | **⚠ˡ** | ✘ | **⚠ˡ** | **⚠ˡ** | **⚠ˡ** | ✘ | inventory_purchase,inventory_admin,marketing,head_inventory,director (:254) |
| Stock ledger/Movement | ✘ | ✘ | ✔ | ✔ | ✔ | ✘ | inventory roles (:232) |
| Employee `/employee` | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | **D** (:101) |
| **Customer `/customer`** write | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **NONE (:264)** — any role |
| **Seller `/seller`** write | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **NONE (:272)** — any role |
| **Access `/access`** CRUD | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **⚠ᵐ** | **NONE (:49)** — any role |
| General read `/general` | ⚠ⁿ | ⚠ⁿ | ⚠ⁿ | ⚠ⁿ | ⚠ⁿ | ⚠ⁿ | **NONE (:38)** — any role |
| Dashboard `/dashboard` | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | **D** (:101) |
| Summary `/summary/{role}` | ✔ | ✔ | ✔ | ✔ | ⚠ᵒ | ✔ | NONE (:40), self-zeroing |

**Mismatch footnotes** map to §4 findings: ᵃ→F16 · ᵇ→F16 · ᶜ→F6 · ᵈ→F8 · ᵉ→F9 · ᶠ→F17 · ᵍ→F10 · ʰ→F5b · ⁱ→F5a · ʲ→F12 · ᵏ→F11 · ˡ→F4 · ᵐ→F1/F2/F3 · ⁿ→F15 · ᵒ→F13.

---

## 3. End-to-end role-interaction flow checks (Phase 3)

Each canonical multi-role handoff traced against the matrix. **PASS** = every gate lines up; **GAP** = a handoff step is over-/under-permissioned or lifecycle-skippable.

| Flow | Handoff chain | Verdict | Note |
| --- | --- | --- | --- |
| **Sales → billing** | Mkt create Quotation → Dir approve → (Mkt/Fin/Dir) moveToPo → Fin moveToPi → Fin dpPaid → Fin fullPaid → Fin moveToInvoice | **GAP** | approve/decline correctly Dir-locked (✔ADV), but **fullPaid skips dpPaid** (F9), **moveToInvoice needs no payment** (F9 edge), and moveToPi/ready/done are callable by any of 6 roles (F6). |
| **Sparepart release** | …ready (InvAdmin/HeadInv/Dir) → release → DO created → InvAdmin process → done | **GAP** | Marketing can release branch-unrestricted (F8); DO can jump to Done unpaid via `update` (F10); DN number can duplicate under concurrency (F7). |
| **Service release** | …release → WorkOrder created → Svc process → Svc done | **GAP** | WO can skip `Wait On Progress → Done` (F17 edge); FE hides the Service Release button but API supports it (matrix ᶠ). |
| **Fulfilment (indent)** | moveToPo mints BackOrder → InvPurch/InvAdmin process → Buy created → HeadInv approve → done (stock+) | **GAP** | `buy.done` replay double-increments stock (F5a); `backorder.adjust` replayable on a Ready BO (F5b). |
| **Borrow (Pinjaman)** | Mkt create → HeadInv approve → Inv send (stock−) → Mkt return → Inv receive → Dir done | **GAP** | Every transition is from-state-guarded (✔, the model to copy) **except** `return` has **no ownership guard** (F11) and shortfall **over-restores stock** (F12 edge). |
| **Return** | Mkt initiate return (restock) → Dir approve/reject return | **BROKEN** | Return-approve/reject is **405 for everyone** (F14, ✔ADV); the initiate step has no PO-lifecycle precondition (F16 edge). |
| **Auth / onboarding** | Dir create Employee (temp pw) → temp login → forced changePassword | **GAP** | Single-use temp-pw gate works, but the model **leaks temp_password to the client** (F13) and `changePasswordOrPhone` never checks the current password (F13). |

---

## 4. Findings (P0 → P3), each with verification status

### 🔴 F1 — `access/*` (permission catalog) CRUD-able by ANY authenticated role
**P0 · authz · ✔ME.** [BE:routes/api.php:49-55](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L49) has no `role:` middleware; [BE:AccessesController.php](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/AccessesController.php) has no role/ownership check in any method. `update` line 75 does `$access->update($request->all())` (mass-assignment) when no `access`/`name` key. → any role (Service, etc.) can tamper with the ACL vocabulary. **Fix**: wrap in `role:director`; replace the `$request->all()` fallback with `validate`.

### 🔴 F2 — Customer single-record `get/store/update/destroy` unguarded
**P0 · authz · ✔ME + ~INV.** [BE:api.php:264-270](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L264) no `role:`; only `getAll` is group-scoped, `store/update/destroy` have no scope ([BE:CustomerController.php:87,130,175,185](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/CustomerController.php#L87)). → a Service user can delete another marketer's customer, orphaning quotations. **Fix**: add ownership scoping + set `pic_employee_id` on `store`.

### 🔴 F3 — Seller `/seller` CRUD unguarded and unscoped
**P0 · authz · ✔ME + ~INV.** [BE:api.php:272-278](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L272) no `role:`; [BE:SellerController.php:69,104,142](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/SellerController.php#L69) no checks; `getAll` not even scoped. → any role can delete a seller referenced by buys/spareparts. **Fix**: gate writes to purchasing roles.

### 🔴 F4 — Sparepart create/update/delete **and bulk upload** are FE-Director-only but 5 roles at BE
**P0 (upload) / P1 (CRUD) · FE-hides-BE-allows SECURITY · ✔ME.** [BE:api.php:254-260](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L254): `store`/`update`/`destroy`/`updateAllData` all under `role:inventory_purchase,inventory_admin,marketing,head_inventory,director`. FE hides Add/Edit/Delete behind `v-if="isRoleDirector"` (FE:SparepartsPage.vue:9, SparepartsDetailPage.vue:74,78) and Upload behind `feature:'upload_data'` (Director-only, FE:config:377). → Marketing/InvAdmin/InvPurch/HeadInv can POST `/api/sparepart/updateAllData` to **rewrite the entire price list**, or CRUD any sparepart. **Fix**: gate writes to the intended role(s); restrict `updateAllData` to Director.

### 🔴 F5a — `buy.done` replayable → double stock increment
**P0 · integrity · ✔ME (last turn) + ~INV.** [BE:BuyController.php:634-673](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/BuyController.php#L634): sets `Received` and `stockService->increase(...)` with **no** check that status wasn't already `Received`. `POST /buy/done/{id}` ×N adds stock ×N and bumps `unit_price_buy` each time. **Fix**: guard `if ($buy->current_status === RECEIVED) return 400`.

### 🟠 F5b — `backorder.adjust` has no status guard → re-adjust a Ready BO re-mutates stock
**P1 · integrity · ~INV.** [BE:BackOrderController.php:498-726](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/BackOrderController.php#L498) never checks `current_status` (contrast `process()` which blocks Ready/Rejected at :364). The FE route `back_order_adjustment` has no `allowedRoles` (FE:router:263-271) and the URL is directly navigable. → re-submitting adjustment on a closed BO issues fresh increase/decrease movements. **Fix**: add the same Ready/Rejected guard `process()` has.

### 🟠 F6 — PO `updateStatus`/`ready`/`done`/`moveToPi`/`update` reachable by 6 roles, no in-method role or from-state guard
**P1 (updateStatus) / P2 (rest) · both-allow · ✔ADV.** [BE:PurchaseOrderController.php:649-662](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/PurchaseOrderController.php#L649): `updateStatus` `Rule::in([8 statuses])` then saves with no from-state guard; `done()` (:753) forces `Done` from any state incl. Rejected. Route group is 7-role (:78). FE offers no button, but a crafted `POST /status/{id}` free-sets the PO to any state within `getAccessedPurchaseOrder` scope. Verifier: *"classic frontend-hides-but-backend-allows state-machine escalation… bounded by row scoping."* **Fix**: add in-method role checks + a `transition($from,$to)` guard (copy Borrow).

### 🟠 F7 — Delivery-note number duplicate-number race (no lock on the sequence, no unique index)
**P1 · integrity/concurrency · ✔ME + ~INV.** [BE:DeliveryOrderController.php:381-390](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/DeliveryOrderController.php#L381): DN sequence = `max(existing DN seq for year)+1` via an unlocked full-table scan; `process()` locks the individual DO row (:341), not the aggregate. **No unique constraint** on `delivery_note_number` (migrations `2024_12_29_150525_create_delivery_order.php`, `2026_06_30_180228_add_delivery_note_number_*` — grep found none, ✔ME). → two concurrent `process()` on different DOs write the **same official DN**, silently. **Fix**: unique index + a locked counter or DB sequence.

### 🟠 F8 — PO `release` allows Marketing at BE, branch-unrestricted, while FE hides it
**P2 · FE-hides-BE-allows · ✔ADV.** [BE:api.php:94](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L94) release group includes `marketing`; [BE:PurchaseOrderController.php:1009](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/PurchaseOrderController.php#L1009) SMG-branch guard fires **only** for `inventory admin`, so Marketing releases from any branch. FE hides the Release button from Marketing (FE:PurchaseOrderDetailPage.vue:383). Verifier notes the router *whitelists* Marketing into WO/DO add (FE:router:664-665), so it's *partly intentional* — but the branch-unrestricted release power Inventory Admin lacks is real. **Fix**: apply the SMG guard to Marketing too, or intend it explicitly.

### 🟠 F9 — `fullPaid` skips the DP-Paid stage; `moveToInvoice`/`dpPaid` not idempotent
**P1 · lifecycle bypass · ✔ADV.** [BE:ProformaInvoiceController.php:497-536](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/ProformaInvoiceController.php#L497): `fullPaid` never reads `is_dp_paid` (only blocks Rejected POs); FE hides the button until `isDpPaid` (FE:PurchaseOrderDetailPage.vue:368). A Finance/Director POST jumps straight to Full Paid and overwrites the PI grand_total. `dpPaid`/`fullPaid` also re-append status entries with no "already paid" guard; `moveToInvoice` creates an Invoice for an unpaid PO. **Fix**: require `is_dp_paid` in `fullPaid`; add idempotency guards.

### 🟠 F10 — DO `update` sets `Done` on an **unpaid** DO, bypassing the Finance payment gate
**P1 · both-allow · ~INV.** [BE:DeliveryOrderController.php:281-315](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/DeliveryOrderController.php#L281): `update` accepts `Rule::in([On Progress, Done])` with no payment check and no from-state guard, while `process()` (:362-371) requires PI `is_dp_paid||is_full_paid`. → InvAdmin/HeadInv PUT `{currentStatus:'Done'}` on an unpaid DO. Also **"Print Delivery Note" is a mutating PUT** gated only by a print-visibility computed (FE:DeliveryOrderDetailPage.vue:191,298-322). **Fix**: add the payment + from-state guard to `update`.

### 🟠 F11 — Borrow `return()` has no ownership guard (peer can reconcile another's borrow)
**P1 · authz · ~INV.** [BE:BorrowController.php:376-402](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/BorrowController.php#L376): `return()` doesn't call `transition()` or `ownsBorrow()` — only checks scope + status, unlike `update`/`cancel` (:190,277). A same-group Marketing user can `POST /borrow/return/{id}` on a co-worker's borrow. **Fix**: add `ownsBorrow` (creator-or-Director) to `return`.

### 🟠 F12 — Borrow shortfall **over-restores** stock
**P1 · integrity · ~INV (BREAKS edge).** [BE:BorrowController.php:446-462](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/BorrowController.php#L446): when a covering-PO detail qty **exactly** equals the missing qty, `return()` restores `+missing` immediately, then `receive()` (:509-523) restores `+quantity_return`. Borrow 10, return 6, PO covers exactly 4 → stock ends **+10, not +6** — 4 units restored that were sold. **Fix**: don't stack the PO-cover restore with the receive restore.

### 🟠 F13 — Employee model leaks plaintext `temp_password` to the client; `changePasswordOrPhone` skips current-password check
**P1 · security · ✔ME.** [BE:Employee.php:16-36](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Models/Employee.php#L16) has **no `$hidden`** and `temp_password` is `$fillable`; `LoginController` returns the whole `$user` (login + `getCurrentUser`), and the FE reads/shows it (FE:stores/employee.js:24, EmployeeDetailPage.vue:154-157). Separately, [BE:Api/LoginController.php:131-154](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/app/Http/Controllers/Api/LoginController.php#L131) validates only the new password — **no current-password check**. → temp-password gate undermined; a live session can silently change the password. **Fix**: add `$hidden = ['password','temp_password',...]`; require+verify `current_password` (except on the must-change path).

### 🔵 F14 — Return approve/reject is dead (FE POST → BE GET-only route = 405), + ungated route + missing director-lock
**P2/P3 · broken UX + latent authz · ✔ADV.** FE POSTs to [BE:api.php:73-74](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L73) which registers **`Route::get`** only → **HTTP 405 for everyone including Director** (verifier proved 405 fires before middleware). The `/return` routes carry no `meta.feature`/`allowedRoles` (FE:router:582-601) and `approveReturn`/`declineReturn` lack the director-lock their siblings have (BE:QuotationController.php:2197,2071) — both latent, masked by the 405. **Fix**: change the routes to `POST`, add the director-lock, gate the FE route.

### 🔵 F15 — `GET /general` readable by any authenticated role (FE hides to Director)
**P3 · info exposure · ~INV.** [BE:api.php:38](../../../../Repo/backend/bmj-app-backend/BmjAppBackend/routes/api.php#L38) no `role:` — any role can read discount/ppn/currency. Write stays Director-only (:114). Low sensitivity. **Fix**: add `role:director` to the read if intended Director-only.

### 🔵 F16 — Quotation broken-UX cluster (backend correctly rejects)
**P3 · broken UX · ✔ADV.** All confirmed the backend *does* deny, so these are UX not security: Finance sees **Edit** but `update` 404s (isAllowedRole Marketing/Director, BE:391); Marketing/Finance reach `/quotation/review/:id` and see Approve/Reject but `approve`/`decline` 400 (Director-only, BE:783,834); **Create PO** shows before status is Approved → moveToPo 400 (BE:1185). **`needChange` is the exception** — it has **no** director-lock (BE:712), so Marketing/Finance genuinely can set status `Change` with a hardcoded "[Director Review]" note (P3, real inconsistency). Also `changeStatusToReturn` restocks with **no PO-lifecycle precondition** (BE:1862-1911) — inventory can inflate for undelivered goods. **`approveQuotation(id)` silently drops the notes arg** the component passes (FE:stores/quotation.js:204, ✔ADV). **Fix**: gate the review route/buttons; add Approved precondition to Create PO; director-lock `needChange`; add a lifecycle precondition to `changeStatusToReturn`; fix the notes drop.

### 🔵 F17 — WO/DO/Buy broken-UX & dead paths
**P3 · ~INV.** Service sees "Add Work Order" but `store` 403s (BE:147); WO edit route ungated but PUT 403s; **WO/DO `done` skip `Wait On Progress → Done`** (no from-state guard, BE:WorkOrderController.php:697, DeliveryOrderController.php:459); `GET /buy/{id}/details` → **missing `getDetails` method → 500** (BE:api.php:162); `buy.update` can resurrect a `Received` buy to `Wait for Review` and rewrite line items (BE:218-226); `buy.destroy` on a Received buy doesn't reverse stock (BE:319-344); PO `process()` method is unrouted dead code (BE:791); `delivery_order_add` nav pushes a literal `:id` path (FE:DeliveryOrderPage.vue:117); `BorrowReturnPage` legacy orphan posts a payload the BE rejects. **Fix**: hide FE dead-ends; remove/route dead code; add from-state guards.

### 🔵 F18 — Latent FE bugs & consistency (dormant)
**P3 · ~INV / ✔ME.** Token TTL 24 **days** (FE:auth.js:25 × local-storage.js:5); `SparepartMovementController` null-branch deref → 500 for a branchless user (BE:126,176,198); 3 divergent `mapSparepart` `totalUnit` shapes (FE:stores sparepart.js/sparepart-movement.js); `sparepart.destroy` no FK-dependency guard → orphan/500 (BE:183); FE `returnConfirmation` doesn't abort on invalid qty (BE is the only gate, FE:BorrowDetailPage.vue:252-262); PI `downPayment` accepts >100 → negative computed total (BE:403); Invoice list groups by PO number not invoice_number → DP2 series can merge (FE:stores/invoice.js:76); dead `inventory` role token everywhere; `summary.js` misses `head inventory` → 404 (F13-adjacent, FE:summary.js:14).

---

## 5. E2E coverage map (Phase 5)

**Not executed** — backend :8000 down; `global-setup` runs destructive `migrate:fresh --seed`
([playwright.config.js:38](../playwright.config.js#L38)); the DB `berkatmegahjaya` is not a
confirmed throwaway. **Run recipe** (documented, not run): start `php artisan serve` :8000 +
`npx vite --port 5173 --strictPort`, then `npm run test:e2e` (Chromium-only, single-worker).
Suite reports **330/330 passing, 36 specs** (LLM_HANDOVER §1). Map below is read-based.

### 5.1 Well covered ✅
Full role×route 403 matrix (`authz-matrix`, `security-403*`), lifecycle transitions
(`illegal-transitions`, `order-flow-extended`), stock math + N-way concurrency (`stock-math`,
`stock-concurrency`, `concurrency-deep`), per-field validation codes (`validation-matrix*`),
temp-password lifecycle (`auth-lifecycle`), bulk import (`bulk-import`), borrow shortfall
(`borrow-shortfall`), split flow (`quotation-split-flow`).

### 5.2 Coverage gaps ❌ (each maps to a finding)
| Gap | Finding | Evidence |
| --- | --- | --- |
| No test that a low-priv **authenticated** role is blocked from `/access` CRUD (only anon→401) | F1 | `guards-masterdata.spec.js:198,226` |
| Customer/Seller single-record cross-role mutate untested (`customer-seller.spec.js` Director-only) | F2, F3 | `guards-masterdata.spec.js:243,260` (anon-only) |
| **Sparepart write/upload by a non-Director role untested** | F4 | `guards-masterdata` tests sparepart POST for InvAdmin allow only; no Marketing/InvPurch write-escalation test |
| No `buy.done` **replay** test (only distinct-buy concurrency) | F5a | `stock-math` STK-002, `concurrency-deep` CONC-002 |
| No `backorder.adjust` replay-on-Ready test | F5b | — |
| No `PO updateStatus` free-set-by-non-Director test | F6 | `guards-purchase-order` (Dir/IP only) |
| No **DN duplicate-number** concurrency test | F7 | `concurrency-deep` (stock only) |
| No `fullPaid`-without-`dpPaid` test | F9 | `proforma-invoice.spec.js` (happy path) |
| No DO `update`-to-Done-unpaid test | F10 | — |
| No Borrow `return` ownership test | F11 | `borrow-shortfall` (Director-only) |
| No Borrow shortfall **over-restore** stock assertion | F12 | `borrow-shortfall` asserts net=shortfall but not the exact-cover double-restore |
| No temp_password-not-leaked assertion | F13 | `auth-lifecycle` (tests gate, not serialization) |
| **Head Inventory never logged in** → HI capabilities entirely untested | F8, matrix | `e2e/helpers.js` seed list |
| WO/DO `Wait On Progress → Done` skip untested | F17 | `illegal-transitions` (PO/PI/quotation only) |

### 5.3 Suite hygiene
`e2e/borrow-lifecycle-api.spec.js` is a **broken 15-line stub**; `stock-concurrency.spec.js`
STKC-001 has a **stale header** (says "negative allowed", asserts `toBe(0)`). The repo root and
`e2e/` carry many `patch_*.cjs`/`patch_*.py` one-off scripts + `full-suite-*.txt` logs (cleanup).

---

## 6. Prioritized issue list

1. **P0 — close the unguarded master-data controllers**: F1 `access`, F2 `customer`, F3 `seller` (add `role:` + ownership). Smallest change, largest risk drop.
2. **P0 — Sparepart write/upload authz** (F4): gate `store/update/destroy/updateAllData` to the intended role(s); Director-only for bulk upload.
3. **P0/P1 — stock integrity**: guard `buy.done` (F5a) and `backorder.adjust` (F5b) against replay; add `min:0` to `sparepart.update` stock (F18); the DN unique index + counter lock (F7); Borrow shortfall over-restore (F12).
4. **P1 — lifecycle bypasses**: `fullPaid` DP-paid precondition (F9); DO `update` payment/from-state guard (F10); PO `updateStatus`/`done` in-method role + from-state (F6); Borrow `return` ownership (F11).
5. **P1 — auth hardening**: `$hidden` on Employee + verify current password (F13).
6. **P2 — Marketing branch-unrestricted release** (F8): apply the SMG guard or intend it.
7. **P3 — broken UX / dead code**: fix the Return 405 + gate its route (F14); Quotation UX cluster incl. `needChange` director-lock + dropped notes (F16); WO/DO/Buy dead-ends (F17); latent FE bugs (F18).
8. **Tests**: add the §5.2 negative tests; restore the borrow-lifecycle stub; fix the STKC-001 comment; seed a Head Inventory account.

---

## Appendix A — Verification ledger

| Finding | Severity | Verification | Repo |
| --- | --- | --- | --- |
| F1 access CRUD | P0 | ✔ME | BE |
| F2 customer CRUD | P0 | ✔ME + ~INV | BE |
| F3 seller CRUD | P0 | ✔ME + ~INV | BE |
| F4 sparepart write/upload | P0/P1 | ✔ME | FE+BE |
| F5a buy.done replay | P0 | ✔ME(prior) + ~INV | BE |
| F5b backorder.adjust replay | P1 | ~INV | BE |
| F6 PO updateStatus/done | P1/P2 | ✔ADV | FE+BE |
| F7 DN duplicate race | P1 | ✔ME + ~INV | BE |
| F8 Marketing release | P2 | ✔ADV | FE+BE |
| F9 fullPaid skips DP | P1 | ✔ADV | FE+BE |
| F10 DO update unpaid Done | P1 | ~INV | BE |
| F11 borrow return no owner | P1 | ~INV | BE |
| F12 borrow over-restore | P1 | ~INV | BE |
| F13 temp_password leak + no cur-pw | P1 | ✔ME | BE+FE |
| F14 return 405 dead | P2/P3 | ✔ADV | FE+BE |
| F15 general read open | P3 | ~INV | BE |
| F16 quotation UX cluster | P3 | ✔ADV | FE+BE |
| F17 WO/DO/Buy UX+dead | P3 | ~INV | FE+BE |
| F18 latent FE bugs | P3 | ~INV / ✔ME | FE+BE |

**`~INV` findings** (F5b, F10, F11, F12, F15, F17, most of F18) are cited to `file:line` by a
domain investigator but their dedicated adversarial verifier hit the session usage limit before
running. They are consistent with verified siblings and with direct reads, but a confirming
re-read is the one open item before treating them as fully closed.

## Appendix B — Evidence base
8-domain investigation (100 matrix rows, 38 mismatches, 93 edges) + 18 adversarial CONFIRMED
verdicts, journal at `…/workflows/wf_d68e3c2c-e61/journal.jsonl`. Direct main-loop reads: FE
`config/index.js`, `router/index.js`, `useRole.js`; BE `routes/api.php`, `RoleMiddleware`,
`EnsurePasswordChanged`, `AccessesController`, `BuyController`, `SparepartController`,
`DeliveryOrderController`, `Employee` model, DO migrations; FE `helpers.js`, `LLM_HANDOVER.md`,
`playwright.config.js`. Prior-turn spec index for all 56 e2e files.
