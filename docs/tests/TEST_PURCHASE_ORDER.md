# Test Cases — Purchase Order

## Read Operations

### PO-API-001: Get all purchase orders — paginated, grouped by PO number (P0, Integration)
**Steps**:
1. `GET /api/purchase-order?page=1`
**Expected**:
- Status 200
- POs grouped by `purchase_order_number`
- Each group shows all versions sorted by `version` ascending
- Pagination metadata: `data`, `current_page`, `last_page`, `total`

### PO-API-002: Get all POs — search by PO number (P1, Integration)
**Steps**:
1. `GET /api/purchase-order?search=PO/001`
**Expected**:
- Only POs matching the search term in PO number, quotation number, project, or customer name

### PO-API-003: Get all POs — filter by year and month (P1, Integration)
**Steps**:
1. `GET /api/purchase-order?year=2026&month=June`
**Expected**:
- Only POs with `purchase_order_date` in June 2026

### PO-API-004: Get PO by ID — full detail (P0, Integration)
**Preconditions**: PO exists with related quotation, customer, spareparts, PI
**Steps**:
1. `GET /api/purchase-order/{id}`
**Expected**:
- Status 200
- Response includes: PO number, date, customer info, pricing, spareparts/services, PI info, status

### PO-API-005: Marketing sees only own POs (P0, Security)
**Preconditions**: Marketing user
**Steps**:
1. `GET /api/purchase-order`
**Expected**:
- Only POs where `employee_id` matches current user

### PO-API-006: Service sees only Service-type POs (P0, Security)
**Preconditions**: Service user
**Steps**:
1. `GET /api/purchase-order`
**Expected**:
- Only POs whose quotation `type = "Service"`

### PO-API-007: Inventory Admin sees only Spareparts-type POs (P0, Security)
**Preconditions**: Inventory Admin user
**Steps**:
1. `GET /api/purchase-order`
**Expected**:
- Only POs whose quotation `type = "Spareparts"`

---

## Move to Proforma Invoice

### PO-API-008: Move to PI — valid (P0, Integration)
**Preconditions**: PO exists, no PI yet, PO not rejected
**Steps**:
1. `POST /api/purchase-order/moveToPi/{id}` with `{ "notes": "DP 50%" }`
**Expected**:
- Status 200
- ProformaInvoice created with `purchase_order_id`
- PI number format: `PI/{N}/BMJ-MEGAH/{BRANCH_CODE}/{USER_ID}/{ROMAN_MONTH}/{YEAR}`
- PI `is_dp_paid = false`, `is_full_paid = false`
- Quotation status updated to "Pi", status history appended

### PO-API-009: Move to PI — blocked if already has PI (P0, Integration)
**Preconditions**: PO already has a ProformaInvoice
**Steps**:
1. `POST /api/purchase-order/moveToPi/{id}` with notes
**Expected**:
- Status 400
- Message: "Purchase order already has a proforma invoice"

### PO-API-010: Move to PI — blocked if PO is rejected (P0, Integration)
**Preconditions**: PO `current_status = "Rejected"`
**Steps**:
1. `POST /api/purchase-order/moveToPi/{id}`
**Expected**:
- Status 400
- Message: "Cannot create PI for a rejected purchase order"

### PO-API-011: Move to PI — notes required (P1, Integration)
**Steps**:
1. `POST /api/purchase-order/moveToPi/{id}` without `notes`
**Expected**:
- Status 422
- Validation error: notes is required

---

## Status Transitions

### PO-API-012: Ready — valid transition (P0, Integration)
**Preconditions**: PO exists, not rejected, no pending back order (or BO is Ready)
**Steps**:
1. `POST /api/purchase-order/ready/{id}`
**Expected**:
- PO `current_status` set to "Ready"
- Quotation status updated to "Ready" with history entry

### PO-API-013: Ready — blocked if PO is rejected (P0, Integration)
**Preconditions**: PO `current_status = "Rejected"`
**Steps**:
1. `POST /api/purchase-order/ready/{id}`
**Expected**:
- Status 400
- Message: "Cannot set to ready a rejected purchase order"

### PO-API-014: Ready — blocked if back order not ready (P0, Integration)
**Preconditions**: PO has BackOrder with `current_status != "Ready"`
**Steps**:
1. `POST /api/purchase-order/ready/{id}`
**Expected**:
- Status 400
- Message: "Please process back order first."

### PO-API-015: Done — valid transition (P0, Integration)
**Preconditions**: PO exists
**Steps**:
1. `POST /api/purchase-order/done/{id}`
**Expected**:
- PO `current_status` set to "Done"
- Quotation status updated to "Done" with history

---

## Release (Creates Downstream Entities)

### PO-API-016: Release Service PO — creates Work Order (P0, Integration)
**Preconditions**: Service-type PO, PI exists with `is_dp_paid = true`, no WO yet
**Steps**:
1. `POST /api/purchase-order/release/{id}` with service order payload:
```json
{
  "serviceOrder": { "receivedBy": "John", "startDate": "2026-06-01", "endDate": "2026-06-15" },
  "poc": { "compiled": "Jane", "approver": "Director", "headOfService": "Bob", "worker": "Mike" },
  "additional": { "scope": "Full overhaul" },
  "units": [{ "jobDescriptions": "Engine repair", "unitType": "Generator", "quantity": 1 }]
}
```
**Expected**:
- WorkOrder created with `purchase_order_id`
- WO number format: `WO/{N}/BMJ-MEGAH/...`
- WoUnit records created
- PO `current_status` = "Release"
- Quotation status = "Release"

### PO-API-017: Release Service PO — blocked if DP not paid (P0, Integration)
**Preconditions**: PI exists but `is_dp_paid = false`
**Steps**:
1. `POST /api/purchase-order/release/{id}` with service payload
**Expected**:
- Status 400
- Message: "Proforma invoice must exist and down payment must be paid"

### PO-API-018: Release Service PO — blocked if WO already exists (P1, Integration)
**Preconditions**: WO already exists for this PO
**Steps**:
1. `POST /api/purchase-order/release/{id}`
**Expected**:
- Status 400
- Message: "Work order already exists for this purchase order"

### PO-API-019: Release Spareparts PO — creates Delivery Order (P0, Integration)
**Preconditions**: Spareparts-type PO, PI exists, no DO yet
**Steps**:
1. `POST /api/purchase-order/release/{id}` with delivery order payload:
```json
{
  "deliveryOrder": { "deliveryOrderDate": "2026-06-05", "pickedBy": "John", "shipMode": "Truck", "orderType": "Regular" }
}
```
**Expected**:
- DeliveryOrder created with `purchase_order_id`
- DO number format: `DO/{N}/BMJ-MEGAH/...`
- PO `current_status` = "Release"

### PO-API-020: Release Spareparts PO — blocked if DO already exists (P1, Integration)
**Steps**:
1. `POST /api/purchase-order/release/{id}` when DO exists
**Expected**:
- Status 400
- Message: "Delivery order already exists for this purchase order"

### PO-API-021: Release Spareparts PO — blocked if no PI (P1, Integration)
**Steps**:
1. `POST /api/purchase-order/release/{id}` when no PI
**Expected**:
- Status 400
- Message: "Proforma invoice must exist for Sparepart type"

### PO-API-022: Release — blocked if PO is rejected (P0, Integration)
**Steps**:
1. `POST /api/purchase-order/release/{id}` on rejected PO
**Expected**:
- Status 400
- Message: "Cannot release a rejected purchase order"

---

## Decline

### PO-API-023: Decline PO — Finance role (P0, Integration)
**Preconditions**: Finance user, PO exists
**Steps**:
1. `POST /api/purchase-order/decline/{id}` with `{ "notes": "Budget exceeded" }`
**Expected**:
- PO `current_status` = "Rejected", notes saved
- Quotation status = "Rejected" with history
- **Stock restored**: sparepart quantities increased back (if Spareparts type)
- BackOrder rejected if exists

### PO-API-024: Decline PO — Director role (P0, Integration)
**Preconditions**: Director user
**Steps**:
1. `POST /api/purchase-order/decline/{id}` with notes
**Expected**:
- Same as PO-API-023 (Director also allowed)

### PO-API-025: Decline PO — Marketing role blocked (P0, Security)
**Preconditions**: Marketing user
**Steps**:
1. `POST /api/purchase-order/decline/{id}`
**Expected**:
- Status 400
- Message: "You are not authorized to decline this purchase order"

### PO-API-026: Decline PO — notes required (P1, Integration)
**Steps**:
1. `POST /api/purchase-order/decline/{id}` without notes
**Expected**:
- Status 422
- Validation error: notes is required

### PO-API-027: Decline PO — stock restoration for spareparts (P0, Integration)
**Preconditions**: PO for Spareparts type with 3 line items
**Steps**:
1. Decline the PO
**Expected**:
- Each sparepart's branch stock `quantity` increased by the quotation's line item quantity
- Verified via `branch_spareparts` table

---

## Update

### PO-API-028: Update PO fields (P1, Integration)
**Steps**:
1. `PUT /api/purchase-order/{id}` with `{ "notes": "Updated notes", "paymentDue": "2026-12-31" }`
**Expected**:
- Status 200
- PO updated with new values
- Full formatted response returned

### PO-API-029: Update PO — invalid status value (P1, Integration)
**Steps**:
1. `PUT /api/purchase-order/{id}` with `{ "currentStatus": "InvalidStatus" }`
**Expected**:
- Status 400
- Validation error: must be one of BO, Prepare, Ready, Release, Returned, Paid

---

## UI Tests

### UI-PO-030: PO list page grouped by PO number (P0, E2E)
**Steps**:
1. Login, navigate to Purchase Order list
**Expected**:
- POs displayed grouped by number with version tabs

### UI-PO-031: PO detail page shows Track timeline (P0, E2E)
**Steps**:
1. Navigate to PO detail
**Expected**:
- Track component shows status progression: PO → PI → DP → Full → Ready → Release → Done

### UI-PO-032: PO detail — action buttons match status (P1, E2E)
**Steps**:
1. View PO in "Prepare" status
**Expected**:
- "Ready" button visible if conditions met
- "Decline" button visible for Finance/Director

### UI-PO-033: Release modal for Service PO shows work order form (P1, E2E)
**Steps**:
1. Click "Release" on Service-type PO
**Expected**:
- Work order form appears with fields: receivedBy, worker, units, scope, dates

### UI-PO-034: Release modal for Spareparts PO shows delivery order form (P1, E2E)
**Steps**:
1. Click "Release" on Spareparts-type PO
**Expected**:
- Delivery order form appears with fields: deliveryDate, shipMode, orderType, pickedBy

### UI-PO-035: PDF generation for PO (P2, E2E)
**Steps**:
1. Click PDF download on PO detail page
**Expected**:
- PDF downloads with correct PO data, line items, pricing
