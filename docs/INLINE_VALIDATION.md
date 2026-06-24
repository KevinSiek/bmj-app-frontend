# Inline Input Validation Pattern

> **Read this** before modifying or extending any form in the application.

## Overview

All create/edit forms use **client-side inline validation** that mirrors the
server-side validation rules. Errors are shown directly beneath the invalid
input element (Bootstrap `.invalid-feedback`) as the user interacts with the
form, rather than being surfaced only after a round-trip to the backend.

---

## Implementation Pattern

### 1. `isDirty` Flag (Store)
Each form's Pinia store holds an `isDirty` reactive `ref(false)`.  
- **False on initial load** — prevents error highlights on a blank or pre-filled form.
- **Set to `true`** when the user first edits any field OR when they attempt to submit.

```js
// store/work-order.js (example)
const isDirty = ref(false)
```

Stores that carry `isDirty`:
- `borrow.js`
- `work-order.js`
- `delivery-order.js`
- `proforma-invoice.js`
- `purchase-order.js`
- `sparepart-movement.js`
- `purchase.js` (for Purchase Add/Edit)
- `employee.js` (for Employee Add/Edit)
- `sparepart.js` (for Spareparts Add/Edit)

### 2. Computed `errors` Object (Vue Component)
Each form component declares a `computed` property that returns an object
keyed by field name. A non-empty string value means that field has an error.

```js
// Example: WorkOrderAddPage.vue
const errors = computed(() => ({
  compiled: !form.compiled ? 'Compiled by is required' : '',
  approver: !form.approver ? 'CSO Head is required' : '',
  receivedBy: !form.receivedBy ? 'Received by is required' : '',
}))
```

### 3. Deep Watcher for `isDirty`
```js
watch(
  () => store.form,      // or relevant reactive data
  () => { store.isDirty = true },
  { deep: true }
)
```

### 4. Template Binding
```vue
<input
  v-model="form.compiled"
  :class="{ 'is-invalid': store.isDirty && errors.compiled }"
  class="form-control"
/>
<div class="invalid-feedback">{{ errors.compiled }}</div>
```

- `is-invalid` (Bootstrap) triggers red border + shows `.invalid-feedback`.
- The `store.isDirty &&` guard prevents eager highlighting on initial render.

### 5. Submit Guard
```js
const handleSubmit = () => {
  store.isDirty = true   // force-show all errors
  const hasErrors = Object.values(errors.value).some(Boolean)
  if (hasErrors) return  // block API call
  // ... proceed with save
}
```

---

## Forms with Inline Validation

| Form | File | Fields Validated |
| ---- | ---- | ---------------- |
| Quotation Add/Edit | `QuotationAddPage.vue`, `QuotationEditPage.vue` | Customer, branch, type, sparepart lines (name, qty > 0), service lines |
| Purchase Add/Edit | `PurchaseAddPage.vue`, `PurchaseEditPage.vue` | Seller, items (sparepart, qty > 0, price > 0) |
| Spareparts Add/Edit | `SparepartsAddPage.vue`, `SparepartsEditPage.vue` | Name, number, sell price > 0, buy price > 0 |
| Employee Add/Edit | `EmployeeAddPage.vue`, `EmployeeEditPage.vue` | Fullname, role, branch, email, username, password |
| Borrow Add | `BorrowAddPage.vue` | Service PO selection, notes marketing, sparepart lines (selection, qty > 0) |
| Borrow Return | `BorrowReturnPage.vue` | Returned quantities (0 ≤ qty ≤ borrowed) |
| Work Order Add | `WorkOrderAddPage.vue` | Compiled, CSO head, received by, unit quantities > 0 |
| Work Order Edit | `WorkOrderEditPage.vue` | Same fields as Add |
| Delivery Order Add | `DeliveryOrderAddPage.vue` | DO date, picked by, ship mode, order type |
| Proforma Invoice Edit | `ProformaInvoiceEditPage.vue` | Down payment % (0–100) |
| PO Return | `PurchaseOrderReturnPage.vue` | Items list non-empty, returned quantities > 0 |
| Sparepart Movement Add | `SparepartMovementAddPage.vue` | Source ≠ target branch, reason, sparepart selections, quantities > 0 |

---

## Adding Validation to a New Form

Follow these steps when building a new create/edit page:

1. **Add `isDirty = ref(false)` to the store** and return it.
2. **Add `computed errors`** to the Vue component — one key per validated field.
3. **Add a deep watcher** on the form data that sets `store.isDirty = true`.
4. **Bind `:class="{ 'is-invalid': store.isDirty && errors.fieldName }"`** on each input.
5. **Add `<div class="invalid-feedback">{{ errors.fieldName }}</div>`** after each input.
6. **In the submit handler**, set `store.isDirty = true` first, then check `Object.values(errors.value).some(Boolean)` before calling the API.

---

## Common Validation Rules by Type

| Type | Rule |
| ---- | ---- |
| Required text | `!value || !value.trim()` |
| Required select | `!value` (falsy id/string) |
| Positive quantity | `!qty \|\| Number(qty) <= 0` |
| Positive price | `!price \|\| Number(price) <= 0` |
| Percentage | `val === '' \|\| isNaN(val) \|\| val < 0 \|\| val > 100` |
| Array non-empty | `!array \|\| array.length === 0` |
| Row-level (tables) | Map over rows and return array of per-row error objects |
