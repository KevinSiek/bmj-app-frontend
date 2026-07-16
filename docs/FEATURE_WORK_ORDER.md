# Feature: Work Order

## Overview
Work Orders (WO) are service job tickets created when a Purchase Order is
**released**. They track the execution of service work including workers,
timelines, and sparepart usage.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/WorkOrderPage.vue` | List all work orders |
| `views/menu/WorkOrderAddPage.vue` | Create WO (from PO release) |
| `views/menu/WorkOrderDetailPage.vue` | WO detail with status tracking |
| `views/menu/WorkOrderEditPage.vue` | Edit WO details |
| `stores/work-order.js` | Pinia store |
| `api/work-order.js` | API wrappers |
| `utils/pdf/work-order.js` | PDF generation (13KB — detailed) |

## Key Business Rules
1. WO is created during PO **Release** action, in status **Wait On Progress**.
2. Status lifecycle: `Wait On Progress → Process → Progress → Done`.
   - **Process** button (shown in Wait On Progress) → `POST /api/work-order/process/{id}` → Progress.
   - **Done** button (shown in Progress) → `POST /api/work-order/done/{id}` → Done; propagates
     DONE to the PO + quotation. (Legacy "On Progress" rows can still go straight to Done.)
3. WO tracks: worker name, expected days, start/end dates, scope, units.
4. Vaccine, APD, and Peduli Lindungi safety fields have been removed from the UI,
   API responses, and model fillable (DB columns remain but are no longer used).
5. `WoUnit` child records track individual units being serviced.
6. WO actions are gated to Service + Director roles.
7. WO detail displays the related PO's "No Internal Request" (purchase_order_number) and "No PO"
   (po_number).

## Data Model
```
WorkOrder
  ├── purchase_order_id (FK → PurchaseOrder)
  ├── work_order_number
  ├── received_by, worker, head_of_service, approver, compiled
  ├── expected_days, expected_start_date, expected_end_date
  ├── start_date, end_date
  ├── current_status, is_done
  ├── spareparts, backup_sparepart
  ├── scope, vaccine, apd, peduli_lindungi
  ├── execution_time, notes
  └── woUnits[] (WoUnit child records)
```

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllWorkOrder(param)` | GET | `/api/work-order` |
| `getWorkOrderById(id)` | GET | `/api/work-order/{id}` |
| `updateWorkOrder(id, data)` | PUT | `/api/work-order/{id}` |
| `processWorkOrder(id, data)` | POST | `/api/work-order/process/{id}` |

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)
> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### Real status flow is a 3-state machine, and "Process"/"Done" are buttons, not statuses
Runtime statuses are only `Wait On Progress → On Progress → Done` (`config/index.js:283-285`).
Detail gating: **Process** button shows at `Wait On Progress` (`WorkOrderDetailPage.vue:340-343`) and
POSTs `/api/work-order/process/{id}` → `On Progress`; **Done** button shows at `On Progress`
(`WorkOrderDetailPage.vue:344-348`) and POSTs `/api/work-order/done/{id}` with
`{startDate, endDate, worker, descriptionCompleted}` (`stores/work-order.js:120-127`) → `Done`.

> ⚠️ Correction: "Key Business Rules" #2 names the middle states `Process`/`Progress`. Those are
> not real status values — the middle status is `On Progress`. `Process`/`Done` are action buttons.

### Config constants `wo` and `ready` exist but are dead in the detail flow
`common.status.work_order.wo` (`'WO'`) and `.ready` (`'Sparepart Ready'`) are defined
(`config/index.js:281-282`) but the detail page gates only on `wait_on_progress`/`on_progress`.
`wo` is referenced solely by `Track.vue:67`; `ready` has no readers. Do not rely on either as a live WO status.

### WO is created from a standalone Add form, not from a PO Release
Actual creation path is `/work-order/add` (`WorkOrderAddPage.vue`): the "Add WO" button calls
`workOrderStore.addWorkOrder()` then routes to the WO list (`WorkOrderAddPage.vue:286-297`).
The feature is open to Marketing / Service / Director per `accessFeature`
(`config/index.js:374, 394, 466`). For Marketing, `back()` returns to the **PO detail**
(`WorkOrderAddPage.vue:302-309`), and Branch is auto-filled from the user and rendered read-only
(`WorkOrderAddPage.vue:242-249` + `BranchField :show-readonly="isRoleMarketing"` at line 9) — a leftover
of the PO-origin intent.

> ⚠️ Correction: "Overview" / rule #1 say the WO is created "during PO Release". The PO **Release**
> button only renders for **Sparepart** POs (`isShowRelease` requires `type == sparepart`,
> `PurchaseOrderDetailPage.vue:381-402`), and for sparepart POs `doRelease` routes to a **Delivery Order**,
> not a WO (`PurchaseOrderDetailPage.vue:482-488`). So the `doRelease` Service→WO branch (line 487) is
> effectively **unreachable** from that button.

### Latent bug: `doRelease` targets `/work-order/add/:id`, which is not a registered route
`doRelease` pushes `${work_order.path}/add/${id}` = `/work-order/add/:id`
(`PurchaseOrderDetailPage.vue:487`), but the router only registers `/work-order/add` (no `:id` variant)
(`config/index.js:210-213`, `router/index.js:410-414`). If that branch ever became reachable it would
navigate to a non-matching route.

### Edit is Marketing-gated, not Service
`isShowEdit` requires `isRoleMarketing || isRoleDirector` (`WorkOrderDetailPage.vue:335-338`), while
Process/Done require `isRoleService || isRoleDirector` (`:332`). Rule #6 ("gated to Service + Director")
is only true for the Process/Done actions.

### API-endpoint table is incomplete
`api/work-order.js` also exports `addWorkOrder` (POST `/api/work-order`, `:65`), `deleteWorkOrder`
(DELETE `/api/work-order/{id}`, `:77`), and `done` (POST `/api/work-order/done/{id}`, `:85`) — none of
which appear in the "API Endpoints" table above.
