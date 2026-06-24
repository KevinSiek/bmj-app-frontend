# LLM Handover: E2E Testing Suite Status

> **Date Updated:** 2026-06-06
> **For:** the next LLM/engineer continuing work on `bmj-app-frontend` + `bmj-app-backend`.
> **Read this first.** It supersedes the older "100% passing" note (which described only an
> early, much smaller suite). The numbers and bug-fixes below are verified by real full runs.

---

## 1. Current State — VERIFIED

**328 / 328 Playwright tests passing across 35 spec files** in `e2e/`, confirmed by a full
local run (`npx playwright test`, single worker, DB reseeded via global-setup). Last full
run: 11.2 min.

The suite is **API-direct first** (most new specs hit the backend over HTTP with a logged-in
`request` context and assert real status codes / DB read-backs), with the original UI-driven
specs retained for the core lifecycle. This makes it fast and stable.

### Coverage (of the 95 routes in `bmj-app-backend/routes/api.php`)
- **~84% of endpoints hard-tested** (real status/DB/read-back assertions)
- **~93% exercised** in total
- **Remaining gap:** cross-browser (Chromium only) + a few dead/low-value routes
  (`POST /tokens/create`, some list-filter variants).

### What's covered
- Full order lifecycle: Quotation → PO → PI → Invoice, plus WO / DO / BO / Buy.
- **Full role × route authorization matrix** (`authz-matrix.spec.js`) — every disallowed role
  → 403 on every protected group, each paired with an allow-case. Plus write-path 403s
  (`security-403*.spec.js`).
- **Per-field validation matrix** (`validation-matrix.spec.js`, `validation-matrix-targets.spec.js`)
  — every create/update endpoint, each field broken with multiple invalid values, asserting
  the correct code. **NOTE the code is not uniform:** most are 422, but
  `PUT /purchase-order/{id}`, `PUT /delivery-order/{id}`, and `release/{id}` (both branches)
  return **400** (manual `Validator::make`). See the cheat-sheet in section 5.
- **Negative paths** (`negative-paths.spec.js`) — 422 + 404 across the API.
- **Illegal state transitions** (`illegal-transitions.spec.js`).
- **Stock invariants + concurrency** (`stock-math.spec.js`, `stock-concurrency.spec.js`,
  `concurrency-deep.spec.js` — N-way + cross-operation races, no lost update under `lockForUpdate`).
- **Bulk Excel import** success + failure (`bulk-import.spec.js`).
- **Auth lifecycle** (`auth-lifecycle.spec.js`) — logout revocation, changePassword, temp-password.
- **Edge cases** (`edge-cases.spec.js`) — pagination/filters, special-chars/Unicode, 255-char
  boundary, decimal precision.
- CRUD on every controller with **read-back assertions** (mutations re-read the persisted value).

---

## 2. Backend bugs FIXED during this work (each has a regression-guard test)

These are real product changes in `bmj-app-backend`. If you revert one, the named test fails.

1. **Systemic 500-instead-of-404/422.** Every controller's `handleError()` (plus
   Customer/Seller inline catches and `LoginController@changePassword`) caught `\Throwable`
   and flattened Laravel's `ModelNotFoundException`/`ValidationException` into a generic 500.
   They now **re-throw** those, so `findOrFail` → 404 and `validate` → 422.
   `AccessesController@store` gained missing validation. Guards: `negative-paths.spec.js`.
2. **`DELETE /api/buy/{id}`** → 500 FK violation. `BuyController@destroy` now deletes child
   `detail_buys` first. Guard: `detail-and-buy-extended.spec.js` DBE-API-003.
3. **Temp-password reuse (SECURITY).** `EmployeeController@store` sets the real password to
   `bcrypt(tempPassword)`, so a temp password used to work forever. Fixed with a
   `must_change_password` column (migration `2026_06_06_000001_*`) + `EnsurePasswordChanged`
   middleware (alias `password.changed`, applied on the `auth:sanctum` group in `routes/api.php`)
   that blocks all routes except changePassword/logout/user until a real password is set.
   Wired in EmployeeController store/resetPassword, LoginController changePassword, and the
   Employee model `$fillable`/`$casts`. Guards: `auth-lifecycle.spec.js` AL-006/AL-007.
4. **Negative stock on `moveToPo`** — now floors at 0 (`max(0,…)` in QuotationController); the
   indent shortfall is tracked by the BackOrder. Guard: `stock-concurrency.spec.js` STKC-001.
5. **`PO updateStatus`** accepted any string — now `Rule::in([...PO statuses])` → 422 on bad
   value. Guard: `illegal-transitions.spec.js` ILL-006.
6. **Slug overflow** — a 255-char customer/seller name passed validation but 500'd because the
   derived slug overflowed the column. Fixed with `Str::limit(…, 240)`. Guard:
   `edge-cases.spec.js` EDGE-CHARS-002.

⚠️ **Commit status:** as of this handover these changes may be UNCOMMITTED in the working tree
(they were left for the repo owner to commit because pre-existing non-session work was
interleaved in the same controller files). Run `git status` / `git log` to see whether they
have since been committed before assuming anything about the baseline.

---

## 3. How to run the suite

The `playwright.config.js` `webServer` block is **commented out** — start both servers manually:

1. **Backend:** `php artisan serve` → `:8000` (from `bmj-app-backend/BmjAppBackend`).
2. **Frontend:** `npx vite --port 5173 --strictPort` → `:5173`.
   - The config hardcodes `baseURL: http://localhost:5173`. Stray dev servers can grab 5173
     and push fresh Vite to 5174/5175 — `--strictPort` plus killing stale port-holders avoids
     the suite silently driving the wrong frontend.
3. **Run + view the report (the command you want):**
   ```bash
   npm run test:e2e            # = playwright test — runs all specs headless, single worker,
                               #   and auto-generates the HTML report (config: reporter:'html')
   npx playwright show-report  # opens the generated playwright-report/ in a browser
   ```
   One-liner: `npm run test:e2e; npx playwright show-report` (show-report opens the last run's
   report even if some tests failed).

   **Command cheat sheet:**
   | Goal | Command |
   |---|---|
   | Run everything + browsable HTML report | `npm run test:e2e` then `npx playwright show-report` |
   | Re-open the last report (no re-run) | `npx playwright show-report` |
   | Watch/debug interactively (UI Mode) | `npm run test:e2e:ui` (= `playwright test --ui`) |
   | Fast terminal pass/fail (no HTML) | `npx playwright test --reporter=list` |
   | Run a single spec | `npx playwright test e2e/<file>.spec.js` |

   NOTE: `test:e2e` and `test:e2e:ui` run the **same tests** (all specs, API-direct AND
   UI-driving) — `--ui` is Playwright's visual debugger, not "the UI tests". In UI Mode, use
   "Run all"; re-running a single serial spec out of order fails (it needs its `*-SETUP` first).
   Single worker is enforced in config (required — the suite shares one reseeded DB and many
   specs are serial).

⚠️ **DESTRUCTIVE:** `e2e/global-setup.js` runs `php artisan migrate:fresh --seed` against the
backend DB on **every** run — it drops and reseeds `berkatmegahjaya`. Never point it at a DB
with data you care about. Seed creds: all users password `password`; key accounts
`director.jkt@bmj.com` (Director), `citra.k@bmj.com` (Marketing), `fajar.n@bmj.com` (Finance),
`eko.p@bmj.com` (Inventory Admin), `hadi.s@bmj.com` (Service). Fixtures
`E2E Guaranteed Stock Sparepart` and `E2E Low Stock Sparepart` are relied on by many specs.

---

## 4. Patterns to follow when adding tests

- **API-direct is the default.** Log in via `request.newContext` → grab `access_token` →
  set `Authorization: Bearer`. See `stock-math.spec.js` / `validation-matrix.spec.js` as templates.
- **Read source before asserting a code.** This codebase's failure codes are NOT uniform
  (422 vs 400 vs 404 vs 500 vary per controller). The validation contracts were extracted from
  the controllers — trust the controller, not your assumption.
- **camelCase trap:** many controllers read camelCase keys via a `$fieldMap` and silently drop
  snake_case (PO update, DO update, Buy, Sparepart, Quotation nested). Sending the wrong case =
  a silent no-op that a status-only test won't catch — always read-back the mutated field.
- **Build your own data** for detail/transition tests — the seeders create 0 WO/DO/BO rows.
- **UI specs:** use `pressSequentially` + `waitForResponse('/api/sparepart')` for the
  autocomplete (not `.fill()`), and a generous `waitForURL('**/menu', {timeout: 20000})` after
  login. These were the two main flake sources and are fixed suite-wide.

---

## 5. Quick failure-code cheat sheet (validation)

- **Assert 400 (not 422)** for: `release/{id}` (both branches), `PUT /purchase-order/{id}`,
  `PUT /delivery-order/{id}`, and the Excel `updateAllData` path.
- **404 fires before validation** for `PUT /customer/{slug}` (lookup-first); but **422 fires
  even on a missing record** for `PUT /seller|employee|quotation/{slug}` (validate-first).
- **No validation path at all** (never 422/400 from body): `PUT /access/{id}`, PI
  `moveToInvoice`/`dpPaid`/`fullPaid`, `WO process`, `employee reset-password`/`DELETE`.
- **camelCase single-field gotcha:** PI uses `downPayment` (camelCase); General uses
  `currency_converter` (snake).

---

## 6. Remaining work (toward "every scenario")

- **Cross-browser:** Chromium only. Add Firefox/WebKit projects to `playwright.config.js` and
  fix browser-specific failures.
- A handful of low-value list-filter endpoints assert "responds" but not filtered content.
- The repo `docs/tests/TEST_*.md` files are an older planning catalog (~158 envisioned cases);
  the **actual implemented suite is the 35 specs in `e2e/`** — treat the specs as source of truth.
