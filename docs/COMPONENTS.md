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
- Actually a `Teleport`-to-body slide-in overlay wrapping `Track.vue`, driven by
  `useTrackStore.isShowTrack`.

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md).

- 🐞 **`SparepartSelector.vue` and `PurchaseItemRow.vue` are ORPHANED.**
  `PurchaseItemRow.vue` is imported by no file; `SparepartSelector.vue` is
  imported only by `PurchaseItemRow.vue`. The live Purchase/Movement forms use
  inline inputs + Bootstrap dropdowns.
  > ⚠️ Correction: the "Used in QuotationForm and PurchaseAdd" claim above is
  > stale. `SparepartSelector` also calls `axios.get('/api/spareparts')`
  > directly (wrong endpoint — real is `/api/sparepart`), bypasses `http-api`,
  > and expects a field shape that doesn't match the stores.
- **Two globally-registered components** (missing from the list above):
  `PriceDisplay` (read-only "Rp. …") and `CurrencyInput` (`v-model` stays a raw
  `Number`) are registered in `main.js:43-44`, so they're usable in any template
  without import.
- **`BranchField.vue` encodes role policy:** Director → `<select>`
  (Jakarta/Semarang), Marketing → read-only; falls back to `useRole()` when its
  `showDirector`/`showReadonly` props are `undefined`. Uses Vue 3.4 `defineModel`.
- **`SearchAutocomplete.vue` is a global typed search** hitting
  `stockMovementApi.getSuggestions` — returns mixed types (Sparepart/PO/Employee/
  Customer) and emits either free-text `searched` or a structured `selected`
  filter (`{filter_type, filter_id}`).
- **`ItemComponent.vue` status→color is a substring match**
  (`statusColour.red.some(s => currentStatus.includes(s))`) and it collapses
  second/third columns on mobile via `mainStore.isMobile`.
- 🐞 **`Pagination.vue`** is URL-driven (`route.query.page` + `updateQuery`) but
  has leftover `console.log`s and assigns to the computed `currentPage` at
  `onClickPage` (a no-op; navigation still works via `updateQuery`).
- **Modal flow:** `ModalConfirmation`/`ModalNotes` `await modalStore.action()`
  then pop a success/failure `ModalMessage`; `openNotesModal(..., {requirePo})`
  adds an inline PO-number field (used by `moveToPo`).
- **Two Track implementations:** the live Pinia `stores/track.js` (used by
  `Track.vue`/`TrackNav.vue`) vs the orphaned `composeable/useTrack.js`.
- **Sidebar reality:** the persistent desktop sidebar is `NavbarDesktop.vue`
  (per-role from `accessFeature`, with nested submenu groups); `NavbarMobile.vue`
  is the mobile hamburger and still carries a large **commented-out legacy
  `menus` array** beside the live config-driven version.
