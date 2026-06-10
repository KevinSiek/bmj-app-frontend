# Test Cases — Spareparts, Inventory & Employees

## Spareparts & Stock

### SP-API-001: Get all spareparts (P0, Integration)
**Steps**:
1. `GET /api/sparepart?page=1`
**Expected**:
- Status 200
- Includes total stock across all branches

### SP-API-002: Get sparepart stock per branch (P0, Integration)
**Steps**:
1. `GET /api/sparepart/{id}`
**Expected**:
- Detail includes `branch_spareparts` breakdown (e.g., Jakarta: 10, Semarang: 5)

### SP-API-003: Create new sparepart (P0, Integration)
**Steps**:
1. `POST /api/sparepart` with `{ "sparepart_name": "Spark Plug", "unit_price_sell": 50000, "unit_price_buy": 30000, "code": "SP001" }`
**Expected**:
- Status 201
- Sparepart created

### SP-API-004: Bulk Import Spareparts via Excel (P0, Integration)
**Preconditions**: Valid Excel file adhering to import template
**Steps**:
1. `POST /api/sparepart/import` with Excel file attachment
**Expected**:
- Status 200
- Spareparts created or updated in DB based on Excel rows

### SP-API-005: Bulk Import — Invalid Excel (P1, Integration)
**Steps**:
1. `POST /api/sparepart/import` with invalid columns/data
**Expected**:
- Status 422
- Validation errors indicating which row failed

### SP-API-006: Decrement Stock (P0, Unit)
**Test**: `SparepartStockService->decrease()`
**Steps**:
1. Call `decrease(sparepart, 'Jakarta', 5)`
**Expected**:
- Stock reduced by 5. If insufficient, throws exception or clamped to 0 based on implementation.

### SP-API-007: Increment Stock (P0, Unit)
**Test**: `SparepartStockService->increase()`
**Steps**:
1. Call `increase(sparepart, 'Semarang', 10)`
**Expected**:
- Stock increased by 10. If record missing, it is created automatically.

---

## Employee Management

### EMP-API-008: Get all employees (P0, Integration)
**Preconditions**: Director role
**Steps**:
1. `GET /api/employee?page=1`
**Expected**:
- Status 200, paginated list of employees

### EMP-API-009: Create employee (P0, Integration)
**Steps**:
1. `POST /api/employee` with `{ "fullname": "Test User", "email": "test@bmj.com", "role": "Marketing", "branch": "Jakarta" }`
**Expected**:
- Status 201
- Employee created
- `temp_password` generated and returned in response
- `temp_pass_expires_at` set to +24 hours

### EMP-API-010: Non-Director cannot access employees (P0, Security)
**Preconditions**: Finance role
**Steps**:
1. `GET /api/employee`
**Expected**:
- Status 403

### EMP-API-011: Reset Employee Password (P1, Integration)
**Steps**:
1. `POST /api/employee/resetPassword/{id}`
**Expected**:
- Generates new `temp_password`, invalidates old one, returns new temp password in response.
