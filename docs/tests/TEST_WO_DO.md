# Test Cases — Work Order & Delivery Order

## Work Order (Service)

### WO-API-001: Get all Work Orders (P0, Integration)
**Steps**:
1. `GET /api/work-order?page=1`
**Expected**:
- Status 200, paginated list of Work Orders
- Includes related `woUnits`

### WO-API-002: Service role access only (P0, Security)
**Preconditions**: Authenticated as Marketing
**Steps**:
1. `GET /api/work-order`
**Expected**:
- Status 403 (Unauthorized)

### WO-API-003: Update Work Order status (P0, Integration)
**Preconditions**: WO exists with `current_status = Prepare`
**Steps**:
1. `POST /api/work-order/status/{id}` with `{ "status": "In Progress" }`
**Expected**:
- Status 200
- WO `current_status` updated
- Possible statuses: Prepare, In Progress, Pending, Done

### WO-API-004: Update Work Order details (P1, Integration)
**Steps**:
1. `PUT /api/work-order/{id}` with updated worker/scope/expected_days
**Expected**:
- WO updated successfully

### UI-WO-005: Generate Work Order PDF (P2, E2E)
**Expected**: Downloads PDF with job descriptions, units, and scope of work.

---

## Delivery Order (Logistics)

### DO-API-006: Get all Delivery Orders (P0, Integration)
**Steps**:
1. `GET /api/delivery-order?page=1`
**Expected**:
- Status 200, paginated list of Delivery Orders

### DO-API-007: Inventory Admin role access only (P0, Security)
**Preconditions**: Authenticated as Finance
**Steps**:
1. `GET /api/delivery-order`
**Expected**:
- Status 403 (Unauthorized)

### DO-API-008: Update DO Status to Delivered (P0, Integration)
**Preconditions**: DO exists
**Steps**:
1. `POST /api/delivery-order/status/{id}` with `{ "status": "Delivered" }`
**Expected**:
- DO `current_status` updated to "Delivered"
- If PO is fully paid, PO status might auto-transition or enable "Done" transition

### DO-API-009: Update DO details (P1, Integration)
**Steps**:
1. `PUT /api/delivery-order/{id}` with updated `picked_by`, `ship_mode`
**Expected**:
- DO updated successfully

### UI-DO-010: Generate Delivery Order PDF (P2, E2E)
**Expected**: Downloads DO PDF without pricing information (standard for DOs).
