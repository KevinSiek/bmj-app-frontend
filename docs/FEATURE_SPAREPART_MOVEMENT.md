# Feature: Sparepart Movement & Stock History

## Overview
Two related features for tracking inter-branch inventory logistics:
- **Sparepart Movement** — transfers stock between branches (Jakarta ↔ Semarang), with an Approve / Send / Receive lifecycle.
- **Stock History** — a read-only audit log of every stock change across all spareparts, filterable by branch, source type, and date range.

---

## Sparepart Movement

### File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/SparepartMovementPage.vue` | List all movements (ItemComponent cards showing `sourceBranch → targetBranch`) |
| `views/menu/SparepartMovementAddPage.vue` | Create new movement (source branch, target branch, reason, sparepart lines with quantities) |
| `views/menu/SparepartMovementDetailPage.vue` | Detail view with lifecycle action buttons |
| `stores/sparepart-movement.js` | Pinia store (`useSparepartMovementStore`) |
| `api/sparepart-movement.js` | API wrappers |

### Status Lifecycle
`Created → Send → Received` ; side-exit `Cancelled`

| Action | Transitions To |
| ------ | -------------- |
| Create | Created |
| Send | Send (source branch ships stock) |
| Receive | Received (target branch confirms receipt; stock increases) |
| Cancel | Cancelled |

### Key Business Rules
1. **Source and target branch must differ** — validated on the frontend form.
2. Each movement line references a sparepart + transfer quantity (must be > 0).
3. Stock is **decremented at Send** from the source branch, **incremented at Receive** on the target branch.
4. A `reason` free-text field is required.
5. Inline validation on the add form: source branch, target branch, reason, sparepart selections, and quantities are all validated before submit.
6. The store holds an `isDirty` flag to suppress eager validation on initial page load.

### Data Model (mapped)
```
SparepartMovement
  ├── movementNumber         (display ID)
  ├── sourceBranch           (source branch name)
  ├── targetBranch           (target branch name)
  ├── reason
  ├── currentStatus
  └── items[]
       ├── sparepartId
       ├── sparepartName
       ├── sparepartNumber
       └── quantity
```

### Role Access
Available to: **Inventory Admin**, **Inventory Head**, **Director**

### API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `fetchList(param)` | GET | `/api/sparepart-movement` |
| `fetchById(id)` | GET | `/api/sparepart-movement/{id}` |
| `create(payload)` | POST | `/api/sparepart-movement` |
| `send(id)` | POST | `/api/sparepart-movement/send/{id}` |
| `receive(id)` | POST | `/api/sparepart-movement/receive/{id}` |
| `cancel(id)` | POST | `/api/sparepart-movement/cancel/{id}` |

---

## Stock History

### File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/StockHistoryPage.vue` | Paginated, filterable stock movement audit log table |
| `stores/stock-movement.js` | Pinia store (`useStockMovementStore`) |
| `api/stock-movement.js` | API wrappers |

### Key Features
1. **Read-only** — no create/edit, pure audit log.
2. Displays: Date, Sparepart (name + number), Delta (colour-coded ± quantity), Source Type, Reason, Branch, By (employee name).
3. **Source Type filter** — dropdown matching `common.sourceTypes`:  
   `PurchaseOrder | Buy | BackOrder | Return | Borrow | ManualEdit | Import | SparepartMovement`
4. **Branch filter** — Jakarta / Semarang / All.
5. **Date range filter** via `DateRangeFilter` component (month + year by default).
6. **SearchAutocomplete** — text search OR sparepart-level autocomplete (`filter_type` + `filter_id` URL params).
7. Source column renders a **clickable router-link** to the originating entity detail page using `common.sourceRouteMap` to map source type → route key.

### Role Access
Available to: **Inventory Admin**, **Inventory Head**, **Director**

### API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getStockMovements(param)` | GET | `/api/stock-movement` |

Query params: `page`, `search`, `branch`, `source_type`, `month`, `year`, `filter_type`, `filter_id`, `start_date`, `end_date`
