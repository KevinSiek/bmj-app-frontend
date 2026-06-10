# Test Cases — BMJ App (Complete Test Suite)

> **Purpose**: Master test case reference for the entire BMJ App system.
> Covers API (backend), integration (full-stack), and UI (frontend) test cases.
> Organized by feature module.

> ⚠️ **THIS FILE IS A PLANNING CATALOG, NOT THE IMPLEMENTED SUITE.** The actually-implemented,
> verified-green tests live in **`e2e/*.spec.js`** (35 spec files, **328 tests passing**). For
> the real state, current coverage (~84% of endpoints hard-tested), how to run, the backend
> bugs fixed, and the failure-code cheat sheet, **read [`LLM_HANDOVER.md`](./LLM_HANDOVER.md)
> first.** The `~158` counts below describe envisioned cases and are out of date — treat the
> `e2e/` specs as source of truth.

---

## How to Use This Document

1. **For writing PHPUnit tests** → see test IDs prefixed with `API-`
2. **For writing Vitest/Cypress tests** → see test IDs prefixed with `UI-`
3. **For manual QA** → follow the step-by-step in each test case
4. **For CI/CD** → automate all `API-` tests first, then `UI-` smoke tests

Each test case has:
- **ID** — unique reference (`MODULE-TYPE-NNN`)
- **Priority** — P0 (critical), P1 (important), P2 (nice-to-have)
- **Type** — Unit, Integration, E2E, Security
- **Preconditions** — what must be true before running
- **Steps** — what to do
- **Expected Result** — what should happen

---

## Module Index

| Module | Test File | Test Count |
| ------ | --------- | ---------- |
| Authentication & Authorization | [TEST_AUTH.md](./TEST_AUTH.md) | 28 |
| Quotation | [TEST_QUOTATION.md](./TEST_QUOTATION.md) | 42 |
| Purchase Order | [TEST_PURCHASE_ORDER.md](./TEST_PURCHASE_ORDER.md) | 35 |
| Proforma Invoice | [TEST_PROFORMA_INVOICE.md](./TEST_PROFORMA_INVOICE.md) | 10 |
| Work Order & Delivery Order | [TEST_WO_DO.md](./TEST_WO_DO.md) | 10 |
| Back Order & Purchase (Buy) | [TEST_BACK_ORDER_BUY.md](./TEST_BACK_ORDER_BUY.md) | 10 |
| Spareparts & Employee | [TEST_SPAREPARTS_EMP.md](./TEST_SPAREPARTS_EMP.md) | 11 |
| Misc (Customer, Gen, Invoice) | [TEST_MISC.md](./TEST_MISC.md) | 12 |
| **Total** | | **~158** |

---

## Priority Distribution

| Priority | Count | Description |
| -------- | ----- | ----------- |
| P0 | ~65 | Critical path — login, CRUD, status transitions, stock mutations |
| P1 | ~70 | Important — validation, authorization, edge cases, pagination |
| P2 | ~23 | Nice-to-have — UI polish, PDF generation, responsive design |

---

## Test Environment Requirements

### Backend (PHPUnit)
- PHP ≥ 8.0, Laravel 11
- MySQL test database (use `:memory:` SQLite or separate test DB)
- `RefreshDatabase` trait for isolation
- Factory/Seeder for test data: Employee, Customer, Branch, Sparepart, General

### Frontend (Vitest + Playwright)
- Node.js, Vitest
- `@vue/test-utils` for component testing
- Mock Axios for API calls
- **Playwright** is installed for E2E testing:
  - Run `npm run test:e2e` to execute the automated UI tests headlessly.
  - Run `npm run test:e2e:ui` to open the visual test runner and debug.

### E2E (Cypress or Playwright)
- Running backend dev server
- Running frontend dev server
- Seeded test database with known data
