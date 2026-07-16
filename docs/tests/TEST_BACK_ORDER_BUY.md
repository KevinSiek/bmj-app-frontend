# Test Cases — Back Order & Purchase (Buy)

## Back Order

### BO-API-001: Get all Back Orders (P0, Integration)
**Steps**:
1. `GET /api/back-order?page=1`
**Expected**:
- Status 200, paginated list of Back Orders
- Includes associated PO and missing spareparts

### BO-API-002: Auto-creation on PO Release with missing stock (P0, Integration)
**Preconditions**: Quotation has `is_indent = true` for some spareparts. PO is created.
**Steps**:
1. Release PO
**Expected**:
- BackOrder automatically created
- `detail_back_orders` populated with missing spareparts
- BackOrder status = "Process"

### BO-API-002B: Fulfill BO via Stock Movement / Upload (P0, Integration)
**Preconditions**: BackOrder exists with missing items.
**Steps**:
1. User manually injects stock via `api/sparepart-movement` or `Upload Data`.
2. `POST /api/back-order/process/{id}`
**Expected**:
- Status 200
- BackOrder status updated to "Ready" (fulfilled) because stock was satisfied without a Buy.

### BO-API-002C: Adjust BO via API (P1, Integration)
**Preconditions**: BackOrder exists.
**Steps**:
1. `POST /api/back-order/adjust/{id}` with `{ spareparts: [{ sparepartId, order: 0 }] }`
**Expected**:
- Status 200
- BackOrder requirement drops to 0. Status becomes "Ready" (fulfilled).

### BO-API-003: Move BO to Buy (P0, Integration)
**Preconditions**: BackOrder exists in "Prepare" state
**Steps**:
1. `POST /api/back-order/moveToBuy/{id}`
**Expected**:
- Status 200
- Buy entity created
- BackOrder status updated to "Process"

### BO-API-004: Inventory Admin / Purchase Roles only (P0, Security)
**Steps**:
1. `GET /api/back-order` as Marketing
**Expected**:
- Status 403

---

## Purchase (Buy)

### BUY-API-005: Get all Buys (P0, Integration)
**Steps**:
1. `GET /api/buy?page=1`
**Expected**:
- Status 200, paginated list of Buys

### BUY-API-006: Create standalone Buy (P0, Integration)
**Preconditions**: Inventory Purchase role
**Steps**:
1. `POST /api/buy` with payload containing spareparts to buy for stock replenishment
**Expected**:
- Status 201
- Buy created with `buy_number` format `BUY/{N}/...`

### BUY-API-007: Approve Buy (P0, Integration)
**Preconditions**: Buy exists in "On Review" (if total > limit)
**Steps**:
1. Director calls `POST /api/buy/approve/{id}`
**Expected**:
- Buy approved, status = "Approved"

### BUY-API-008: Move Buy to Receive / Done (P0, Integration)
**Preconditions**: Buy approved
**Steps**:
1. `POST /api/buy/receive/{id}`
**Expected**:
- Status 200
- **Stock increased** for received spareparts in the specified branch
- If Buy originated from a BackOrder, BackOrder status updated to "Ready"
- Corresponding PO can now be marked "Ready"

### BUY-API-009: Reject Buy (P1, Integration)
**Preconditions**: Director role
**Steps**:
1. `POST /api/buy/reject/{id}`
**Expected**:
- Status 200, Buy rejected

### UI-BUY-010: Generate Buy PDF (P2, E2E)
**Expected**: Downloads PDF for the purchase order sent to external Seller.
