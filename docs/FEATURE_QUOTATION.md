# Feature: Quotation

> **Read this file** when modifying quotation-related functionality in the
> frontend. For backend, see the backend repo's `docs/FEATURE_QUOTATION.md`.

## Overview

The Quotation feature is the **entry point** of the order lifecycle. Marketing
employees create quotations for customers specifying spareparts and/or services.
Quotations go through a review/approval workflow before being converted to
Purchase Orders.

## Business Rules

1. Quotations have a **versioning system** — same `quotation_number` can have
   multiple versions. The list page groups quotations by number and shows
   version tabs.
2. Types: `Spareparts` or `Service` (or mixed, line items can be either).
3. Status lifecycle: `Process → On Review → Approved → PO`. Side states: `Change` (needs changes), `Revised` (version bumped), `Cancelled`, `Waiting`, `Rejected`, `Done`.
4. Quotations can be **returned** after becoming a PO (return workflow).
5. The **review workflow** is role-gated: Director reviews quotation pricing.
6. Discount and PPN (tax) values come from General settings.
7. **Per-item review trigger**: if any item's `unitPriceSell` falls below
   `basePrice × (1 − general.discount)`, the quotation auto-enters On Review.
   (`general.discount` is a fraction, e.g. 0.05 = 5%.)
8. **Total discount % (added Jun 9)**: a manual whole-quotation discount, entered as a
   percentage below the Total Amount field (`price.totalDiscountPercent`, 0–100, column
   `quotations.total_discount_percent`). It reduces the subtotal **before** PPN is applied.
   **ANY value > 0 forces the quotation into Director review**, independent of rule 7 —
   either trigger (per-item OR total %) will cause On Review status and set review to false.
9. **Currency inputs**: price fields use `components/CurrencyInput.vue` — displays formatted
   as `Rp 1.250.000` while typing but `v-model` remains a raw Number, so all calculations
   are unchanged.
10. **PDF creator name**: the quotation PDF signature uses `created_by_name` (the creating
    employee's `fullname`) from the get() response, not a hardcoded name.
11. **PDF version stamp**: the quotation PDF includes a "Version N" stamp alongside the creator
    name to track document iterations.

## File Map

| File | Purpose |
| ---- | ------- |
| `views/menu/QuotationPage.vue` | List all quotations (grouped by number) |
| `views/menu/QuotationAddPage.vue` | Wrapper for QuotationForm in add mode |
| `views/menu/QuotationEditPage.vue` | Wrapper for QuotationForm in edit mode |
| `views/menu/QuotationDetailPage.vue` | Read-only quotation detail |
| `views/menu/QuotationReviewPage.vue` | List quotations needing review |
| `views/menu/QuotationReviewDetailPage.vue` | Review detail with approve/reject/needChange |
| `components/quotation/QuotationForm.vue` | ★ **Core form** (30KB) — handles both add and edit |
| `stores/quotation.js` | Pinia store — state, API calls, data mapping |
| `api/quotation.js` | API endpoint wrappers |
| `utils/pdf/quotation.js` | PDF generation for quotation document |

## Data Flow

```
QuotationPage.vue
  → quotationStore.getAllQuotation(params)
    → quotationApi.getAllQuotations(params)
      → GET /api/quotation?page=X&search=Y
    ← response mapped via mapQuotation()
    ← grouped by quotation_number into { quotationNumber, versions[] }
  ← quotations ref updated → UI re-renders
```

## QuotationForm.vue (Critical Component)

This is the **most complex component** in the entire frontend at ~30KB. It
handles:
- Customer selection/creation
- Dynamic sparepart line items with real-time pricing
- Dynamic service line items
- Auto-calculation of amounts, discounts, subtotals, PPN, grand total
- Sparepart search via `SparepartSelector` component
- Branch selection
- Both add and edit modes determined by `formType` prop
- Total discount % input that forces review when > 0

### Key Props
- `formType` — `'Add'` or `'Edit'`

### Key Dependencies
- `useQuotationStore` — quotation state
- `useGeneralStore` — discount/ppn rates
- `SparepartSelector` component — search and select spareparts
- `CurrencyInput` component — realtime Rp formatting on all price inputs

## Store: `quotation.js`

### Key State
- `quotation` — single quotation object
- `quotations` — list (grouped by quotation_number)
- `quotationReview` / `quotationReviews` — review workflow state
- `searchedSpareparts` — sparepart search results
- `paginationData` — pagination metadata

### Key Mapping (`mapQuotation`)
Maps backend snake_case to frontend camelCase:
- `customer.*` → company info
- `project.*` → quotation number, type, date, branch
- `price.*` → amount, discount, ppn, subtotal, grandTotal, **totalDiscountPercent**
- `created_by_name` → creating employee's full name
- `spareparts[]` → sparepartId, sparepartName, quantity, unitPriceSell, unitPriceBuy (Director only), totalPrice
- `services[]` → service name, quantity, unitPriceSell, totalPrice

### Key Actions
- `getAllQuotation(param)` — fetch + group by quotation_number
- `getQuotation(id)` — fetch single
- `addQuotation()` / `editQuotation()` — create/update
- `processQuotation(id, notes, poNumber)` — move to PO (now requires poNumber)
- `approveQuotation(id)` / `rejectQuotation(id)` / `needChangeQuotation(id)`
- `getSpareparts(param)` — search spareparts for the form

## API: `quotation.js`

All calls go to `config.api.quotation` = `/api/quotation`.

| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllQuotations(param)` | GET | `/api/quotation?...` |
| `getQuotationyId(id)` | GET | `/api/quotation/{id}` |
| `addQuotation(data)` | POST | `/api/quotation` |
| `updateQuotation(slug, data)` | PUT | `/api/quotation/{slug}` |
| `processQuotation(slug, data)` | POST | `/api/quotation/moveToPo/{slug}` |
| `getAllReviewQuotations(param)` | GET | `/api/quotation/review/1` |
| `approveQuotation(slug)` | POST | `/api/quotation/approve/{slug}` |
| `rejectQuotation(slug, data)` | POST | `/api/quotation/reject/{slug}` |
| `needChangeQuotation(slug, data)` | POST | `/api/quotation/needChange/{slug}` |
| `getQuotationReturn(param)` | GET | `/api/quotation/return/1` |
| `returnQuotation(id)` | POST | `/api/quotation/return/{id}` |
| `approveReturn(slug)` | GET | `/api/quotation/approveReturn/{slug}` |
| `declineReturn(slug)` | GET | `/api/quotation/rejectReturn/{slug}` |

### processQuotation Payload

The `processQuotation` endpoint now requires:
- `notes` — movement reason or comments
- `poNumber` — the unique user-entered PO number (not the internal auto-generated request number)

## PDF Generation

`utils/pdf/quotation.js` generates a quotation PDF using pdfmake with:
- Company header
- Customer details
- Line item table (spareparts and/or services)
- Pricing summary with discount, subtotal, PPN, grand total
- **Creator name** from `created_by_name` (employee's fullname)
- **Version stamp** ("Version N") to track document iterations

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Status lifecycle — the On Review trigger is server-side
- The form never computes the review flag. `updatePrice()` (`components/quotation/QuotationForm.vue:650-656`) only recomputes amount/subtotal/ppn/grandTotal — no review state. The backend flips status to **On Review** at create/edit when any item `unitPriceSell < basePrice×(1 − general.discount)` **OR** `price.totalDiscountPercent > 0` (Business Rules 7-8; backend `docs/FEATURE_QUOTATION.md`). WHY it matters: dropping a price or setting a total discount % in the form gives **no local signal** that the quote will bounce to Director review — you only find out after save.

### Non-obvious logic
- **`updatePrice()` ignores `totalDiscountPercent`** (`QuotationForm.vue:650-656`). Subtotal is computed as `amount − price.discount`; the manual whole-quote discount % is never subtracted client-side, and the Total Discount input is a plain `v-model.number` (`:478-481`) that does not even call `updatePrice`. So while you type a Total Discount %, the on-screen Subtotal / PPN / Grand Total stay **unadjusted** — the backend re-derives the real figures. Do not trust the displayed grand total when a total discount % is set.
- **Sparepart select aborts hard if no ID resolves.** `onSelect` (`QuotationForm.vue:588-631`) tries `sparepartData.id || .sparepartId || .sparepart_id`; if all are empty it `alert()`s "Could not get sparepart ID…" and returns **without inserting the row** (`:616-621`). WHY: blocks saving a line item the backend can't match to stock.
- **`$resetQuotation()` doubles as the blank-form factory.** It is `mapQuotation()` called with no argument (`stores/quotation.js:225-228`); mapping `undefined` yields an empty object, which is what the new-form mount relies on (`QuotationForm.vue:569-570`). There is no separate empty-quotation template.

### Doc-code drift
> ⚠️ Correction: the "Key Props" / QuotationForm sections above claim the form is driven by a **`formType`** prop with values `'Add'`/`'Edit'`. That prop does not exist. The real prop is **`type`** (`QuotationForm.vue:546-552`), and its values come from `common.form.type` = `Add` / `Edit` / **`View`** (`config/index.js:254-257`). One QuotationForm instance drives Add, Edit, Detail **and** Review-Detail; `View` (Detail/Review) sets `disabled` on every field (`:552-553`).

- **Total-Discount hint prints a raw fraction.** The hint reads `Any value > {{ discount }}% requires Director review` (`QuotationForm.vue:482`), but `discount` is the General fraction (0.05 = 5%, Business Rule 7), so it renders literally "Any value > 0.05% requires Director review". It is also misleading vs the real rule: any value **> 0** forces review (Rule 8), not "> the per-item discount threshold". Cosmetic only — no calculation reads this text.

### Roles / coupling
- **Create = Marketing + Director.** `canAdd = isRoleDirector || isRoleMarketing` (`views/menu/QuotationPage.vue:88`) gates the Add button (`:13`). **Review = Director only**, but the gate is at navigation: the review entry on the list is `v-if="isRoleDirector"` (`QuotationPage.vue:7`). Note the approve/reject/needChange buttons on `views/menu/QuotationReviewDetailPage.vue:8-16` are **not independently role-guarded** — Director-only is enforced by who can reach the page, not by the buttons.
- **Write/read casing is asymmetric.** `addQuotation()` / `editQuotation()` POST/PUT `quotation.value` as-is (camelCase) (`stores/quotation.js:181-198`), while GET responses are mapped snake→camel via `mapQuotation()` (`:15-71`). Backend accepts camelCase on write, emits snake_case on read. `addQuotation()` also carries a stale no-op comment about `requestPriceChange` (`:183`) that reflects no current logic.
- **moveToPo captures the customer PO number.** `processQuotation(id, notes, poNumber)` → POST `/api/quotation/moveToPo/{slug}` with `{ notes, poNumber }` (`stores/quotation.js:200-202`, `api/quotation.js:67-69`). That `poNumber` is the customer PO entered in the moveToPo modal (`components/ModalNotes.vue`, `requirePoNumber` flag) — distinct from the internal auto-generated request number. See the Purchase Order doc's "Two PO numbers".
