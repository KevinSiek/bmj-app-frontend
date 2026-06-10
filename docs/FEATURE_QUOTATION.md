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
3. Status lifecycle: `Process → On Review → Approved → PO → Cancelled/Revised`
4. Quotations can be **returned** after becoming a PO (return workflow).
5. The **review workflow** is role-gated: Director reviews quotation pricing.
6. Discount and PPN (tax) values come from General settings.
7. **Per-item review trigger** (existing): if any item's `unitPriceSell` falls below
   `basePrice × (1 − general.discount)`, the quotation auto-enters On Review.
   (`general.discount` is a fraction, e.g. 0.05 = 5%.)
8. **Total discount %** (added Jun 9): a manual whole-quotation discount, entered as a
   percentage below Total Amount (`price.totalDiscountPercent`, 0–100, column
   `quotations.total_discount_percent`). It reduces the subtotal **before** PPN, and ANY
   value > 0 forces the quotation into Director review. Independent of rule 7 (either triggers).
9. **Currency inputs**: price fields use `components/CurrencyInput.vue` — shows `Rp 1.250.000`
   while typing but `v-model` stays a raw Number, so calculations are unchanged.
10. **PDF creator name**: the quotation PDF signature uses `created_by_name` (the creating
    employee's `fullname`) from the get() response, not a hardcoded name.

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

### Key Props
- `formType` — `'Add'` or `'Edit'`

### Key Dependencies
- `useQuotationStore` — quotation state
- `useGeneralStore` — discount/ppn rates
- `SparepartSelector` component — search and select spareparts

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
- `price.*` → amount, discount, ppn, subtotal, grandTotal
- `spareparts[]` → sparepartId, sparepartName, quantity, unitPriceSell, totalPrice
- `services[]` → service name, quantity, unitPriceSell, totalPrice

### Key Actions
- `getAllQuotation(param)` — fetch + group by quotation_number
- `getQuotation(id)` — fetch single
- `addQuotation()` / `editQuotation()` — create/update
- `processQuotation(id, notes)` — move to PO
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
| `rejectQuotation(slug)` | POST | `/api/quotation/reject/{slug}` |
| `needChangeQuotation(slug)` | POST | `/api/quotation/needChange/{slug}` |

## PDF Generation

`utils/pdf/quotation.js` generates a quotation PDF using pdfmake with:
- Company header
- Customer details
- Line item table (spareparts and/or services)
- Pricing summary with discount, subtotal, PPN, grand total
