# Feature: Borrow (Pinjaman)

## Overview
Pinjaman is a Marketing-driven request to lend out spareparts for a Service job.
It is tied to a **Service Purchase Order** and its Work Order, reviewed by Head
Inventory or Director, handed over with a signed PDF and a **Send** action that
deducts stock, returned with **Kembali**, and reconciled per-line with a
**Quantity Return** column before **Done**. Any shortfall (sold spareparts) must
be justified by a covering Spareparts PO.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/BorrowPage.vue` | List all borrows |
| `views/menu/BorrowAddPage.vue` | Create/edit: Service PO picker + sparepart lines |
| `views/menu/BorrowDetailPage.vue` | Lifecycle buttons, reconciliation, handover PDF |
| `components/borrow/PoSelect.vue` | Searchable + load-more PO picker (Service / Spareparts) |
| `utils/pdf/borrow.js` | Handover PDF (Yang Menyerahkan / Yang Menerima) |
| `stores/borrow.js` | Pinia store |
| `api/borrow.js` | API wrappers |

## Lifecycle & roles
`Created → Approved → Borrowed → Returned → Done`; side-exits `Rejected`,
`Cancelled`. Buttons are gated by **role + status**:

| Action | Role | From status |
| ------ | ---- | ----------- |
| Create / Edit / Cancel | Marketing | Created |
| Approve / Reject | Head Inventory, Director | Created |
| Print PDF / Send | Inventory (Admin/Purchase/Head), Director | Approved |
| Kembali | Marketing | Borrowed |
| Quantity Return + Done | Inventory, Director | Returned |

Director bypasses role gating everywhere (backend `RoleMiddleware`).

## Key Business Rules
1. A borrow must reference a **Service** PO; the PO's Work Order is shown read-only.
2. Stock decreases at **Send** (handover), not at approval; increases by returned quantities at **Done**.
3. Once Approved, Marketing can no longer cancel or edit.
4. **Print PDF** is repeatable; it collects the receiver name ("Yang Menerima") via the notes modal, and stamps the logged-in user as "Yang Menyerahkan".
5. At reconciliation, each line's Quantity Return is 0..borrowed. If any line is short, a Spareparts PO that covers the missing quantities is required before Done.

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllBorrow(param)` | GET | `/api/borrow` |
| `getBorrowById(id)` | GET | `/api/borrow/{id}` |
| `getPurchaseOrderOptions({type,search,page})` | GET | `/api/borrow/options/purchase-orders` |
| `addBorrow(payload)` | POST | `/api/borrow` |
| `updateBorrow(id, payload)` | PUT | `/api/borrow/{id}` |
| `approveBorrow(id)` | POST | `/api/borrow/approve/{id}` |
| `rejectBorrow(id, {notes})` | POST | `/api/borrow/reject/{id}` |
| `sendBorrow(id)` | POST | `/api/borrow/send/{id}` |
| `receiveBorrow(id)` | POST | `/api/borrow/receive/{id}` |
| `returnBorrow(id)` | POST | `/api/borrow/return/{id}` |
| `doneBorrow(id)` | POST | `/api/borrow/done/{id}` |
| `cancelBorrow(id)` | POST | `/api/borrow/cancel/{id}` |

## Print / PDF Export
`utils/pdf/borrow.js` follows the back-order / delivery-note pdfmake pattern:
logo header, borrow + PO/WO info, sparepart table, and a two-party signature
block. Triggered from the detail page via the notes modal, which supplies the
"Yang Menerima" name; "Yang Menyerahkan" comes from the auth store user.

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### The lifecycle has a `Received` step the top-of-file flow omits
Real flow is `Created → Approved → Borrowed → Returned → Received → Done`, side-exits `Rejected`,
`Cancelled` (statuses at `config/index.js:293-302`; gating at `BorrowDetailPage.vue:156-171`).
Button/role/status map:

| Action | Role (computed) | From status |
| ------ | --------------- | ----------- |
| Cancel / Edit | Marketing (`isMarketing`) | Created |
| Approve / Reject | Head Inventory, Director (`isReviewer`) | Created |
| Print PDF / Send | Inventory Admin, Head Inventory, Director (`isInventory`) | Approved |
| Return (Kembali) | Marketing | Borrowed |
| Receive | Inventory Admin, Head Inventory, Director | Returned |
| Finish (Done) | **Director only** (`canFinished`) | Received |

> ⚠️ Correction: the "Lifecycle & roles" section omits `Received` and collapses the tail into a single
> "Quantity Return + Done | Inventory, Director | Returned" row. In reality the per-line **Quantity Return**
> reconciliation is a **Marketing** action at `Borrowed` (`canReturn`, `BorrowDetailPage.vue:166`), and the
> final **Finish/Done** is **Director-only** at `Received` (`canFinished`, `:168`) — not an Inventory action.

> ⚠️ Correction: that same table lists "Inventory (Admin/**Purchase**/Head)" for Print/Send. `isInventory`
> is `InventoryAdmin || HeadInventory || Director` (`BorrowDetailPage.vue:156-157`) — **Inventory Purchase is
> excluded**, even though `isRoleInventoryPurchase` is imported.

### Return is inline on the detail page; per-line quantities + shortfall PO
While status is `Borrowed`, Marketing reconciles per line via `returnQuantities` (each `0..borrowed`) plus an
optional Return Notes. `hasShortfall` = any line where returned < borrowed (`BorrowDetailPage.vue:170-171`);
if short, a **Spareparts** PO must be selected or `doReturn` throws. `doReturn` POSTs
`{ returned: [{ sparepartId, quantityReturn }], returnNotes, sparepartPoId? }` to `/api/borrow/return/{id}`
(`BorrowDetailPage.vue:235-250`, `api/borrow.js:32-34`).

### `BorrowReturnPage.vue` is an orphaned legacy screen with a different payload
Route `/borrow/:id/return` (`config/index.js:158-160`, `router/index.js:301-303`) renders a separate return
screen that POSTs a **different** shape — `{ spareparts, notes }` — to the same endpoint
(`BorrowReturnPage.vue:200-221`). No component navigates to this route; the live flow uses the inline detail-page
return, so this page is effectively dead. Don't mistake its `{spareparts, notes}` payload for the current contract.

### Stock deducts at Send, not at approval
The Send confirmation literally warns "Stock will be deducted" (`BorrowDetailPage.vue:229`); stock is restored
by the returned quantities during the return/reconciliation. Approve does not move stock.

### `PoSelect` is shared across WO and Borrow, and resets the store on hide/unmount
`components/borrow/PoSelect.vue` is used by WorkOrder Add/Edit/Detail and Borrow Add/Detail (5 files). It takes
`type` `'Service'` or `'Spareparts'` (`:28-29`), is backed by `purchaseOrderStore.getPurchaseOrderOptions`
with load-more paging (`:44-60`), and **resets** the shared `poOptions` on dropdown-hide and on unmount
(`:79-86`). Because the options live in the store, two `PoSelect` instances on one page share state — the reset
on hide/unmount is what keeps them from bleeding into each other.
