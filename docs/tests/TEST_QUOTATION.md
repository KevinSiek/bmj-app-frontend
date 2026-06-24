# Test Cases — Quotation

## CRUD Operations

### QUOT-API-001: Create quotation — Spareparts type, valid (P0, Integration)
**Preconditions**: Marketing/Director user, spareparts exist in DB, General settings (discount/ppn) exist
**Steps**:
1. `POST /api/quotation` with valid payload:
```json
{
  "project": { "type": "Spareparts", "branch": "Jakarta" },
  "price": { "amount": 1000000 },
  "customer": { "companyName": "PT Test", "office": "HQ", "address": "Jl. Test 1", "urban": "Kelapa Gading", "subdistrict": "Kelapa Gading", "city": "Jakarta", "province": "DKI Jakarta", "postalCode": "14240" },
  "spareparts": [{ "sparepartId": 1, "quantity": 5, "unitPriceSell": 200000 }]
}
```
**Expected**:
- Status 201
- Quotation created with `quotation_number` format: `QUOT/{N}/BMJ-MEGAH/{BRANCH_CODE}/{USER_ID}/{ROMAN_MONTH}/{YEAR}`
- `version` = 1
- `current_status` = "Approved" (if price >= allowed minimum)
- DetailQuotation records created for each sparepart
- `grand_total` = subtotal + PPN

### QUOT-API-002: Create quotation — Service type, valid (P0, Integration)
**Preconditions**: Marketing/Director user
**Steps**:
1. `POST /api/quotation` with service payload:
```json
{
  "project": { "type": "Service" },
  "price": { "amount": 5000000 },
  "customer": { "companyName": "PT Test", ... },
  "services": [{ "service": "Engine Overhaul", "quantity": 1, "unitPriceSell": 5000000 }]
}
```
**Expected**:
- Status 201
- Service detail quotation records created (with `service` field, no `sparepart_id`)
- PPN calculated: `subtotal * ppn_rate`
- `discount` = 0 for service type

### QUOT-API-003: Create quotation — price below discount threshold → On Review (P0, Integration)
**Preconditions**: Sparepart with `unit_price_sell = 100000`, General `discount = 0.1` (10%)
**Steps**:
1. `POST /api/quotation` with sparepart `unitPriceSell = 80000` (below `100000 * 0.9 = 90000`)
**Expected**:
- Status 201
- `current_status` = "On Review" (not "Approved")
- `review` = false (needs Director review)

### QUOT-API-004: Create quotation — price at exact discount threshold → Approved (P1, Integration)
**Preconditions**: Sparepart `unit_price_sell = 100000`, General `discount = 0.1`
**Steps**:
1. `POST /api/quotation` with sparepart `unitPriceSell = 90000` (exactly `100000 * 0.9`)
**Expected**:
- Status 201
- `current_status` = "Approved"
- `review` = true

### QUOT-API-005: Create quotation — missing required fields (P1, Integration)
**Steps**:
1. `POST /api/quotation` with empty body
**Expected**:
- Status 422
- Validation errors for: `project.type`, `price.amount`, `customer.companyName`, etc.

### QUOT-API-006: Create quotation — invalid type (P1, Integration)
**Steps**:
1. `POST /api/quotation` with `project.type = "InvalidType"`
**Expected**:
- Status 422
- Error: "The selected project.type is invalid." (must be "Service" or "Spareparts")

### QUOT-API-007: Create quotation — non-existent sparepart ID (P1, Integration)
**Steps**:
1. `POST /api/quotation` with `spareparts[0].sparepartId = 99999`
**Expected**:
- Status 422
- Error: "The selected spareparts.0.sparepartId is invalid."

### QUOT-API-008: Create quotation — quantity = 0 (P1, Integration)
**Steps**:
1. `POST /api/quotation` with `spareparts[0].quantity = 0`
**Expected**:
- Status 422
- Error: "The spareparts.0.quantity field must be at least 1."

### QUOT-API-009: Create quotation — unitPriceSell = 0 (P1, Integration)
**Steps**:
1. `POST /api/quotation` with `spareparts[0].unitPriceSell = 0`
**Expected**:
- Status 422
- Error: "The spareparts.0.unitPriceSell field must be at least 1."

### QUOT-API-010: Create quotation — existing customer reuse (P1, Integration)
**Preconditions**: Customer "PT ABC" with all matching address fields already exists
**Steps**:
1. `POST /api/quotation` with same customer data
**Expected**:
- No new customer record created
- Existing `customer_id` used for the quotation

### QUOT-API-011: Create quotation — new customer created (P1, Integration)
**Preconditions**: No customer matches the payload
**Steps**:
1. `POST /api/quotation` with new customer data
**Expected**:
- New customer record created with `slug`
- New `customer_id` linked to quotation

### QUOT-API-012: Create quotation — employee cannot create for another employee's customer (P0, Integration)
**Preconditions**: Marketing user A. Customer already has a quotation from Marketing user B.
**Steps**:
1. Marketing user A tries `POST /api/quotation` for the same customer
**Expected**:
- Status 403
- Message: "This customer is already being handled by [username]."

### QUOT-API-013: Create quotation — Director can create for any customer (P0, Integration)
**Preconditions**: Director user. Customer has quotation from another employee.
**Steps**:
1. Director `POST /api/quotation` for that customer
**Expected**:
- Status 201 (Director exempt from customer ownership check)

### QUOT-API-014: Create quotation — sparepart insufficient stock → is_indent = true (P1, Integration)
**Preconditions**: Sparepart has 3 units in branch stock
**Steps**:
1. `POST /api/quotation` with `quantity = 10` for that sparepart
**Expected**:
- Status 201
- `detail_quotations.is_indent` = true for that line item

### QUOT-API-015: Create quotation — Finance role blocked from create (P0, Security)
**Preconditions**: Finance user authenticated
**Steps**:
1. `POST /api/quotation`
**Expected**:
- Status 403 or message: "You have no access in this action"
- Only Marketing and Director can create (`ALLOWED_ROLE_TO_CREATE`)

### QUOT-API-016: Create quotation — number auto-increments within same month (P1, Integration)
**Preconditions**: 3 quotations already exist this month
**Steps**:
1. `POST /api/quotation`
**Expected**:
- Quotation number contains `/4/` (next sequential number)

### QUOT-API-017: Create quotation — number resets for new month (P2, Integration)
**Preconditions**: Previous quotations exist in a different month
**Steps**:
1. `POST /api/quotation` in a new month
**Expected**:
- Quotation number contains `/1/` (reset for new month)

---

## Read Operations

### QUOT-API-018: Get all quotations — paginated (P0, Integration)
**Steps**:
1. `GET /api/quotation?page=1`
**Expected**:
- Status 200
- Response contains pagination: `data`, `current_page`, `last_page`, `total`, `per_page`

### QUOT-API-019: Get all quotations — search filter (P1, Integration)
**Steps**:
1. `GET /api/quotation?search=PT%20ABC`
**Expected**:
- Only quotations matching customer name, quotation number, or project returned

### QUOT-API-020: Get quotation by slug (P0, Integration)
**Preconditions**: Quotation exists with known slug
**Steps**:
1. `GET /api/quotation/{slug}`
**Expected**:
- Status 200
- Full quotation detail with customer, spareparts/services, pricing, status

### QUOT-API-021: Get quotation — non-existent slug (P1, Integration)
**Steps**:
1. `GET /api/quotation/non-existent-slug`
**Expected**:
- Status 404

### QUOT-API-022: Marketing sees only own quotations (P0, Security)
**Preconditions**: Marketing user A has 5 quotations, Marketing user B has 3
**Steps**:
1. Marketing user A: `GET /api/quotation`
**Expected**:
- Only user A's quotations returned (filtered by `employee_id`)

---

## Update (Versioning)

### QUOT-API-023: Update quotation — creates new version (P0, Integration)
**Preconditions**: Quotation V1 exists, no PO created yet
**Steps**:
1. `PUT /api/quotation/{slug}` with updated data
**Expected**:
- New quotation record created with `version = 2`, same `quotation_number`
- Original V1 remains unchanged

### QUOT-API-024: Update quotation — blocked if PO already exists (P0, Integration)
**Preconditions**: Quotation has an associated PurchaseOrder
**Steps**:
1. `PUT /api/quotation/{slug}`
**Expected**:
- Status 400
- Message: "Quotation already in purchase order"

### QUOT-API-025: Update quotation — only latest version can be updated (P1, Integration)
**Preconditions**: Quotation V1 exists, V2 exists (latest)
**Steps**:
1. `PUT /api/quotation/{v1_slug}`
**Expected**:
- Status 400
- Message: "Only the latest version can be updated"

### QUOT-API-026: Update quotation — marks old On Review versions as Changed (P1, Integration)
**Preconditions**: Quotation V1 has `review=false`, `current_status=On Review`
**Steps**:
1. `PUT /api/quotation/{v1_slug}` (creates V2)
**Expected**:
- V1's `review` set to `true`, `current_status` set to "Change"

---

## Review Workflow

### QUOT-API-027: Get quotations needing review (P0, Integration)
**Preconditions**: Some quotations have `review = false`
**Steps**:
1. `GET /api/quotation/review/1`
**Expected**:
- Returns only quotations where `review = false` (need review)

### QUOT-API-028: Approve quotation — Director (P0, Integration)
**Preconditions**: Quotation in "On Review" status, Director user
**Steps**:
1. `POST /api/quotation/approve/{slug}`
**Expected**:
- `review` set to `true`
- `current_status` set to "Approved"

### QUOT-API-029: Approve quotation — non-Director blocked (P0, Security)
**Preconditions**: Marketing user, quotation in "On Review"
**Steps**:
1. `POST /api/quotation/approve/{slug}`
**Expected**:
- Status 400
- Message: "You are not authorized to approve this quotation"

### QUOT-API-030: Reject quotation — Director (P0, Integration)
**Preconditions**: Director user, quotation exists
**Steps**:
1. `POST /api/quotation/reject/{slug}`
**Expected**:
- `review` set to `true`
- `current_status` set to "Rejected"

### QUOT-API-031: Reject quotation — non-Director blocked (P0, Security)
**Steps**:
1. Non-Director `POST /api/quotation/reject/{slug}`
**Expected**:
- Status 400
- Message: "You are not authorized to decline this quotation"

### QUOT-API-032: Need change — marks quotation for revision (P1, Integration)
**Preconditions**: Quotation exists, no PO
**Steps**:
1. `POST /api/quotation/needChange/{slug}`
**Expected**:
- `review` = false
- `current_status` = "Change"

### QUOT-API-033: Need change — blocked if PO exists (P1, Integration)
**Preconditions**: Quotation has PO
**Steps**:
1. `POST /api/quotation/needChange/{slug}`
**Expected**:
- Status 400
- Message: "Quotation already in purchase order."

---

## Move to PO

### QUOT-API-034: Move to PO — valid (P0, Integration)
**Preconditions**: Approved quotation (Spareparts type), no PO yet
**Steps**:
1. `POST /api/quotation/moveToPo/{slug}`
**Expected**:
- PurchaseOrder created with `quotation_id` linking back
- PO number format: `PO/{N}/BMJ-MEGAH/{BRANCH_CODE}/{USER_ID}/{ROMAN_MONTH}/{YEAR}`
- Quotation `current_status` updated to "Po"
- Status history array appended with PO entry
- Sparepart stock **decremented** for branch

### QUOT-API-035: Move to PO — blocks if quotation already has PO (P0, Integration)
**Steps**:
1. `POST /api/quotation/moveToPo/{slug}` on quotation that already has PO
**Expected**:
- Status 400

---

## Return Workflow

### QUOT-API-036: Get quotations needing return (P1, Integration)
**Steps**:
1. `GET /api/quotation/return/1`
**Expected**:
- Returns quotations where return is pending

### QUOT-API-037: Change status to return (P1, Integration)
**Steps**:
1. `POST /api/quotation/return/{id}`
**Expected**:
- Quotation status updated to "Return"

### QUOT-API-038: Approve return (P1, Integration)
**Steps**:
1. `GET /api/quotation/approveReturn/{slug}`
**Expected**:
- Return approved, stock adjustments made

### QUOT-API-039: Reject return (P1, Integration)
**Steps**:
1. `GET /api/quotation/rejectReturn/{slug}`
**Expected**:
- Return rejected, no stock changes

---

## UI Tests

### UI-QUOT-040: Quotation list page renders with version tabs (P0, E2E)
**Steps**:
1. Login as Marketing, navigate to quotation list
**Expected**:
- Quotations grouped by number
- Version tabs visible for multi-version quotations

### UI-QUOT-041: QuotationForm — add sparepart line item (P0, E2E)
**Steps**:
1. Navigate to Add Quotation
2. Select type "Spareparts"
3. Search for a sparepart via SparepartSelector
4. Set quantity and price
**Expected**:
- Line item added to the form
- Amount auto-calculates

### UI-QUOT-042: QuotationForm — pricing calculation (P0, E2E)
**Steps**:
1. Add 2 spareparts with different quantities and prices
**Expected**:
- Amount = sum of (qty × unitPrice) for all items
- Discount auto-calculated if price differs from official
- Subtotal = Amount - Discount
- PPN = Subtotal × ppn_rate
- Grand Total = Subtotal + PPN
