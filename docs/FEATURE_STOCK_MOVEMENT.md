# Feature: Stock Movement & History

> **Read this file** when modifying stock ledgers or branch transfers.

## Overview
This feature tracks every increment and decrement of sparepart stock across the entire system (Stock History ledger), and provides a manual workflow to transfer stock between company branches (Sparepart Movement).

## File Map

| File | Purpose |
| ---- | ------- |
| `views/menu/StockHistoryPage.vue` | Global ledger of all stock transactions |
| `views/menu/SparepartMovementPage.vue` | List branch transfer requests |
| `views/menu/SparepartMovementAddPage.vue` | Create new branch transfer |
| `views/menu/SparepartMovementDetailPage.vue` | View transfer details & execute actions |
| `stores/stock-movement.js` | Pinia store for Stock History ledger |
| `stores/sparepart-movement.js` | Pinia store for Sparepart Movement transfers |
| `api/stock-movement.js` | API wrappers for `/api/stock-movement` |
| `api/sparepart-movement.js` | API wrappers for `/api/sparepart-movement` |

## 1. Stock History (Ledger)
The Stock History page acts as a read-only global ledger. Every time stock is added or removed, a `stock_movements` record is created on the backend (usually via `SparepartStockService`).

### Key Data Fields (`stores/stock-movement.js`)
- `delta` — The amount of stock changed (positive or negative)
- `sourceType` — The feature that caused the change (e.g., `PurchaseOrder`, `Buy`, `Borrow`, `Return`, `ManualEdit`, `SparepartMovement`, `Import`)
- `sourceId` — The ID of the source entity
- `reason` — Notes explaining the change
- `branch` — The branch where the stock changed
- `sparepart` — The specific sparepart modified

### Business Rules
1. **Inventory Admin / Director Only**: The Stock History ledger is restricted. Marketing users cannot view the global movement ledger.
2. **Navigation**: Users can click a source entity (like a Purchase Order or Borrow ID) to navigate directly to that entity's detail page via `sourceRouteMap` defined in `src/config/index.js`.

---

## 2. Sparepart Movement (Branch Transfers)
Allows moving stock from one branch to another (e.g., from Jakarta to Semarang).

### Status Lifecycle
`Created` → `Send` → `Received` (or `Cancelled` from Created).

### Key Data Fields (`stores/sparepart-movement.js`)
- `movementNumber` — Unique transfer ID
- `sourceBranch` — Branch losing stock
- `targetBranch` — Branch gaining stock
- `details[]` — Array of spareparts and quantities to transfer

### Business Rules
1. **Creation**: Any inventory user can create a transfer request specifying source branch, target branch, and a list of spareparts.
2. **Send**: Executes the stock deduction at the `sourceBranch`.
3. **Receive**: Executes the stock addition at the `targetBranch`.
4. **Cancel**: Only allowed while in `Created` state.

## API Endpoints

| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getStockMovements` | GET | `/api/stock-movement` |
| `getSparepartMovements` | GET | `/api/sparepart-movement` |
| `getSparepartMovementById` | GET | `/api/sparepart-movement/{id}` |
| `createSparepartMovement` | POST | `/api/sparepart-movement` |
| `sendSparepartMovement` | POST | `/api/sparepart-movement/send/{id}` |
| `receiveSparepartMovement` | POST | `/api/sparepart-movement/receive/{id}` |
| `cancelSparepartMovement` | POST | `/api/sparepart-movement/cancel/{id}` |

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Movement action gating (detail page)
`isInventory` = Director | Head Inventory | Inventory Admin (SparepartMovementDetailPage.vue:129-130) — Finance and Inventory Purchase are excluded. Send & Cancel require status `Created`; Receive requires `Send`; all three also require `isInventory` (SparepartMovementDetailPage.vue:132-136).

### Add form force-picks the opposite branch
Only two branches exist, so watchers auto-set `target_branch` to the opposite of `source_branch` and vice-versa (SparepartMovementAddPage.vue:134-144). The stock preview reads `item.totalUnit?.[form.source_branch]` (SparepartMovementAddPage.vue:70) — this works ONLY because the movement store's `mapSparepart` returns `totalUnit` as an OBJECT keyed by branch (stores/sparepart-movement.js:40-42). The sparepart/purchase stores return `totalUnit` as an array and would break this lookup.

### Detail page renders RAW snake_case
The transfer detail table prints `item.sparepart.sparepart_number` / `sparepart_name` straight from the API — unmapped, inconsistent with the camelCase used elsewhere (SparepartMovementDetailPage.vue:57-58).

### Stock is never mutated client-side (invariant)
The frontend NEVER adjusts branch stock for Purchase or Movement. Every delta happens backend-side and writes a `stock_movements` ledger row (`delta`, `sourceType`, `sourceId`) — the ledger is the audit source of truth. Movement Cancel is safe only in `Created` (before stock moves); Send (source −) and Receive (target +) are the two half-transactions.

### Stock History source deep-links
`sourceTypes` (config/index.js:338) and `sourceRouteMap` (config/index.js:339-348) drive the ledger's source column: Buy→purchase_detail, PurchaseOrder→purchase_order_detail, BackOrder→back_order_detail, Return→return_detail, Borrow→borrow_detail, ManualEdit & Import→spareparts_detail, SparepartMovement→sparepart_movement_detail. `getSourceRoute` builds the link from `menuMapping[key].name`, so it couples to ROUTE names; an unmapped type returns `null`, and the row then shows the plain `sourceType` text with no link (StockHistoryPage.vue:54-56,105-110).
