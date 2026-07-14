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
