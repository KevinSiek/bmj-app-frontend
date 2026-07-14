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
