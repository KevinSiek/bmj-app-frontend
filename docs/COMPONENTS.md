# Components Architecture

> **Read this** when adding or modifying shared components.

## Global Modals (in App.vue)

Three modal components are mounted globally in `App.vue` and controlled by
`useModalStore`:

### ModalMessage.vue
- Simple feedback modal (success/failure)
- Triggered by: `modalStore.openMessageModal(type, message)`
- Types: `common.modal.success` or `common.modal.failed`
- Auto-closes or user-dismisses

### ModalConfirmation.vue
- Yes/No confirmation dialog with callback
- Triggered by: `modalStore.openConfirmationModal(message, type, callback)`
- On confirm: executes the `action` callback
- Used before destructive actions (delete, reject, etc.)

### ModalNotes.vue
- Text input modal for adding notes before an action
- Triggered by: `modalStore.openNotesModal(buttonLabel, callback)`
- Callback receives `modalStore.notes` value
- Used for reject-with-reason, process-with-notes, etc.

## Navigation Components

### NavbarDesktop.vue (5.3KB)
- Top navigation bar for desktop layout
- Shows current page breadcrumb, user info, track toggle
- Back button when `route.meta.useBack` is true

### NavbarMobile.vue (6.8KB)
- Hamburger menu navigation for mobile
- Full-screen overlay menu
- Same features as desktop navbar

### ProfileBar.vue (3.3KB)
- User profile sidebar widget
- Shows user name, role, branch
- Logout button

## Menu Components (components/menu/)

Each menu component renders the sidebar navigation for a specific feature:
- `MenuDesktop.vue` — container for all menu items
- `MenuUpper.vue` — top-level menu header
- `MenuQuotation.vue`, `MenuPurchaseOrder.vue`, `MenuInvoice.vue`, etc.
  — each renders a card with icon, title, and click handler

All follow the same pattern:
```vue
<template>
  <div class="menu-item" @click="router.push(...)">
    <i class="bi bi-icon-name"></i>
    <span>Feature Name</span>
  </div>
</template>
```

## Role Menu Components (views/role/)

Each role has a dedicated menu page showing only their allowed features:
- `MainMenu.vue` (18KB) — dynamically renders menus based on `accessFeature` config
- `DirectorMenu.vue` — all features
- `MarketingMenu.vue` — quotation, purchase_order
- `FinanceMenu.vue` — quotation, PO, PI, invoice
- `ServiceMenu.vue` — PO, back_order, work_order
- `InventoryAdminMenu.vue` — PO, spareparts, back_order, delivery_order
- `InventoryPurchaseMenu.vue` — spareparts, back_order, purchase

## Shared Components

### ItemComponent.vue (4.6KB)
- Generic item display component
- Used in list pages to render entity cards

### Pagination.vue (2.4KB)
- Reusable pagination component
- Consumes `paginationData` from stores (Laravel pagination format)
- Emits page change events

### SearchBar.vue (0.8KB)
- Simple search input with debounce
- Emits search query to parent

### SelectDate.vue (1.9KB)
- Date picker/filter component
- Used on list pages for date-range filtering

### SparepartSelector.vue (6KB)
- Complex search + select component for spareparts
- Used in QuotationForm and PurchaseAdd
- Debounced search, displays stock per branch, prices
- Emits selected sparepart to parent

### PurchaseItemRow.vue (3.4KB)
- Single line item row for purchase forms
- Sparepart selection + quantity + price fields

### Track.vue (4.6KB)
- Status timeline visualization component
- Shows the status progression of an entity (PO, Quotation, etc.)
- Uses `useTrack` composable for state management

### TrackNav.vue (1.7KB)
- Navigation header for tracked entities
- Shows current status badge + track toggle button

### CurrencyInput.vue
- Shared input component for all price/currency fields across the application
- Displays value as formatted Rp (Indonesian Rupiah) with thousand separators in real-time
- Emits the raw numeric value to the parent form via `v-model`
- Used in: Spareparts Add/Edit, Quotation, Purchase, Back Order Adjustment, and any other form with price inputs
- Accepts `disabled` and `inputClass` props

### RefreshButton.vue
- Small button that emits a `@refresh` event
- Used on list pages alongside SearchBar to manually re-fetch data without reloading the page

### DateRangeFilter.vue
- Date range selection component (start date – end date)
- Used on Stock History page to filter movements by a custom date range
- Syncs with URL query params (`start_date`, `end_date`) via `updateQuery`

### SearchAutocomplete.vue
- Enhanced search input with autocomplete dropdown
- Supports two modes:
  1. **Text search** — emits `@searched` with the raw text query
  2. **Entity select** — emits `@selected` with `{ filter_type, filter_id }` for server-side filtering
- Used on Stock History page for sparepart-level filtering

### borrow/PoSelect.vue
- Domain-specific searchable PO picker used in Borrow forms
- Supports load-more pagination for PO options
- Filters by PO type (Service / Spareparts)
- Accepts `isInvalid` boolean prop — applies Bootstrap `is-invalid` class for inline validation integration
- Emits selected PO object to parent

## Inline Validation in Components

All form inputs now use Bootstrap's validation classes for inline error display:
```vue
<input :class="{ 'is-invalid': store.isDirty && errors.field }" class="form-control" />
<div class="invalid-feedback">{{ errors.field }}</div>
```
See [`docs/INLINE_VALIDATION.md`](./INLINE_VALIDATION.md) for the full pattern.
