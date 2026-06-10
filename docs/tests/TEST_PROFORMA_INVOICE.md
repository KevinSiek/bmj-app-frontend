# Test Cases — Proforma Invoice

## PI-API-001: Get all proforma invoices (P0, Integration)
**Steps**:
1. `GET /api/proforma-invoice?page=1`
**Expected**:
- Status 200
- Returns paginated list of PIs with their associated PO, customer, and quotation info

## PI-API-002: Get PI by ID (P0, Integration)
**Steps**:
1. `GET /api/proforma-invoice/{id}`
**Expected**:
- Status 200
- Full PI detail including down_payment, grand_total, is_dp_paid, is_full_paid

## PI-API-003: Pay Down Payment (DP) — valid (P0, Integration)
**Preconditions**: PI exists, `is_dp_paid = false`, `down_payment > 0`
**Steps**:
1. `POST /api/proforma-invoice/dp/{id}`
**Expected**:
- PI `is_dp_paid` set to `true`
- Quotation status updated to "Dp" with history
- PO `current_status` unchanged (remains PI)

## PI-API-004: Pay DP — when no DP required (P1, Integration)
**Preconditions**: PI exists with `down_payment = 0` or null
**Steps**:
1. `POST /api/proforma-invoice/dp/{id}`
**Expected**:
- API might still set it to true, but typically should just proceed. Validation: check if it allows paying 0 DP. (Assuming valid, sets to true).

## PI-API-005: Pay Full — creates Invoice (P0, Integration)
**Preconditions**: PI exists, `is_full_paid = false`, DP already paid (if DP exists)
**Steps**:
1. `POST /api/proforma-invoice/full/{id}`
**Expected**:
- PI `is_full_paid` set to `true`
- Invoice created automatically linked to this PI
- Invoice number format: `INV/{N}/...`
- Quotation status updated to "Full" with history

## PI-API-006: Update PI — change DP amount (P1, Integration)
**Preconditions**: PI exists, DP not yet paid
**Steps**:
1. `PUT /api/proforma-invoice/{id}` with `{ "down_payment": 5000000 }`
**Expected**:
- PI `down_payment` updated

## PI-API-007: Update PI — cannot change DP after payment (P1, Integration)
**Preconditions**: PI exists, `is_dp_paid = true`
**Steps**:
1. `PUT /api/proforma-invoice/{id}` with new `down_payment`
**Expected**:
- Should block or ignore the update to `down_payment` (validate business logic behavior)

## PI-API-008: Role Authorization — Finance and Director only (P0, Security)
**Preconditions**: Authenticated as Marketing or Inventory
**Steps**:
1. `GET /api/proforma-invoice`
**Expected**:
- Status 403 (Unauthorized)

## UI-PI-009: PI detail shows correct payment status (P1, E2E)
**Steps**:
1. View PI detail
**Expected**:
- Shows "DP Paid" indicator if `is_dp_paid = true`
- Shows "Full Paid" indicator if `is_full_paid = true`
- Action buttons ("Pay DP", "Pay Full") conditionally visible based on status

## UI-PI-010: PI PDF generation (P2, E2E)
**Steps**:
1. Click generate PDF on PI page
**Expected**:
- Downloads valid PDF with Proforma Invoice title, pricing, DP, and balance remaining.
