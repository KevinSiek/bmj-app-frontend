# Test Cases — Misc (Customer, Seller, Invoice, General, Cross-Cutting)

## Invoice

### INV-API-001: Get all Invoices (P0, Integration)
**Steps**:
1. `GET /api/invoice?page=1`
**Expected**:
- Status 200, paginated list of Invoices

### INV-API-002: Finance and Director Roles only (P0, Security)
**Steps**:
1. `GET /api/invoice` as Marketing
**Expected**:
- Status 403

---

## Customer & Seller

### CUST-API-003: Get all Customers (P1, Integration)
**Steps**:
1. `GET /api/customer?page=1`
**Expected**:
- Status 200

### CUST-API-004: Create Customer (P1, Integration)
**Steps**:
1. `POST /api/customer` with `{ "company_name": "PT Test", ... }`
**Expected**:
- Status 201

### SELL-API-005: Create Seller (P1, Integration)
**Steps**:
1. `POST /api/seller` with `{ "name": "Distributor X", ... }`
**Expected**:
- Status 201

---

## General Settings & Dashboard

### GEN-API-006: Get General Settings (P0, Integration)
**Preconditions**: Director role
**Steps**:
1. `GET /api/general`
**Expected**:
- Status 200, returns discount, PPN, and currency converter limits

### GEN-API-007: Update General Settings (P0, Integration)
**Steps**:
1. `POST /api/general` with `{ "discount": 0.15, "ppn": 0.11 }`
**Expected**:
- Status 200
- Settings updated globally (affects future quotations)

### DASH-API-008: Get Dashboard Summary (P1, Integration)
**Steps**:
1. `GET /api/dashboard`
**Expected**:
- Status 200
- Returns aggregate metrics (total quotations, POs, revenue, etc.) based on user role (Marketing sees own, Director sees all)

---

## Cross-Cutting Concerns

### CROSS-API-009: Pagination format is consistent (P1, Integration)
**Test**: All `GET /api/*` endpoints return standard Laravel pagination metadata.

### CROSS-API-010: Database Transaction Rollbacks (P0, Integration)
**Test**: When an error occurs halfway through `moveToPo()` (e.g. valid quotation but invalid stock constraint), the transaction rolls back so the PO is not created, stock is not deducted, and quotation status is unchanged.

### CROSS-API-011: SQL Injection Protection (P0, Security)
**Test**: Ensure search endpoints (e.g. `?search=1' OR '1'='1`) do not expose data via string concatenation but use prepared statements.

### CROSS-API-012: LockForUpdate prevents Race Conditions (P0, Integration)
**Test**: Concurrent requests to `moveToPo()` or `approve()` on the same Quotation ID block each other, preventing duplicate PO generation. Checked via Laravel's `lockForUpdate()` in Controllers.
