# Feature: Work Order

## Overview
Work Orders (WO) are service job tickets created when a Purchase Order is
**released**. They track the execution of service work including workers,
timelines, and sparepart usage.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/WorkOrderPage.vue` | List all work orders |
| `views/menu/WorkOrderAddPage.vue` | Create WO (from PO release) — with inline validation |
| `views/menu/WorkOrderDetailPage.vue` | WO detail with status tracking |
| `views/menu/WorkOrderEditPage.vue` | Edit WO details — with inline validation |
| `stores/work-order.js` | Pinia store — includes `isDirty` flag |
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
8. **Inline validation** on Add and Edit forms: compiled (by), CSO head (approver), received_by,
   and per-unit quantities (> 0) are all validated client-side. Errors display beneath the
   invalid control. The store's `isDirty` flag prevents eager highlighting on load.

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
| `doneWorkOrder(id)` | POST | `/api/work-order/done/{id}` |
