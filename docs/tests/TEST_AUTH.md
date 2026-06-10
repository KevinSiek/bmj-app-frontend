# Test Cases — Authentication & Authorization

## AUTH-API-001: Login with valid credentials (P0, Integration)
**Preconditions**: Employee exists with email `test@bmj.com`, password `Password123`
**Steps**:
1. `POST /api/login` with `{ "email": "test@bmj.com", "password": "Password123" }`
**Expected**:
- Status 200
- Response contains `access_token`, `token_type: "Bearer"`, `status: true`
- Response contains `user` object with `id`, `fullname`, `role`, `branch`
- `use_temp_password` is `false`

## AUTH-API-002: Login with invalid email (P0, Integration)
**Preconditions**: No employee with email `wrong@bmj.com`
**Steps**:
1. `POST /api/login` with `{ "email": "wrong@bmj.com", "password": "Password123" }`
**Expected**:
- Status 401
- Response: `{ "status": false, "message": "Login failed" }`

## AUTH-API-003: Login with wrong password (P0, Integration)
**Preconditions**: Employee exists with email `test@bmj.com`
**Steps**:
1. `POST /api/login` with `{ "email": "test@bmj.com", "password": "WrongPass1" }`
**Expected**:
- Status 401
- Response: `{ "status": false, "message": "Login failed" }`

## AUTH-API-004: Login with missing email field (P1, Integration)
**Steps**:
1. `POST /api/login` with `{ "password": "Password123" }`
**Expected**:
- Status 422 (Validation error)
- Error on `email` field: "The email field is required."

## AUTH-API-005: Login with missing password field (P1, Integration)
**Steps**:
1. `POST /api/login` with `{ "email": "test@bmj.com" }`
**Expected**:
- Status 422 (Validation error)
- Error on `password` field: "The password field is required."

## AUTH-API-006: Login with invalid email format (P1, Integration)
**Steps**:
1. `POST /api/login` with `{ "email": "not-an-email", "password": "Password123" }`
**Expected**:
- Status 422
- Error on `email` field: "The email field must be a valid email address."

## AUTH-API-007: Login with temporary password — first use (P0, Integration)
**Preconditions**: Employee has `temp_password = "TempPass1"`, `temp_pass_already_use = false`, `temp_pass_expires_at` is in the future
**Steps**:
1. `POST /api/login` with `{ "email": "test@bmj.com", "password": "TempPass1" }`
**Expected**:
- Status 200
- `use_temp_password` is `true`
- Employee's `temp_pass_already_use` set to `true` in DB
- Employee's `temp_password` set to `null` in DB

## AUTH-API-008: Login with temporary password — already used (P0, Integration)
**Preconditions**: Employee has `temp_password = null`, `temp_pass_already_use = true`
**Steps**:
1. `POST /api/login` with temp password that was already consumed
**Expected**:
- Status 400
- Message: "This temporary password already use, please contact the admin."

## AUTH-API-009: Login with expired temporary password (P1, Integration)
**Preconditions**: Employee has `temp_password = "TempPass1"`, `temp_pass_expires_at` is in the past
**Steps**:
1. `POST /api/login` with `{ "email": "test@bmj.com", "password": "TempPass1" }`
**Expected**:
- Falls through to regular auth attempt. If temp_password doesn't match bcrypt hash, status 401.

## AUTH-API-010: Logout (P0, Integration)
**Preconditions**: Authenticated user with valid token
**Steps**:
1. `POST /api/logout` with `Authorization: Bearer <token>`
**Expected**:
- Status 200
- `{ "success": true }`
- Token is revoked — subsequent API calls with same token return 401

## AUTH-API-011: Get current user (P0, Integration)
**Preconditions**: Authenticated user
**Steps**:
1. `GET /api/user` with `Authorization: Bearer <token>`
**Expected**:
- Status 200
- Response contains `user` object matching the logged-in employee

## AUTH-API-012: Access protected route without token (P0, Security)
**Steps**:
1. `GET /api/quotation` without `Authorization` header
**Expected**:
- Status 401 (Unauthenticated)

## AUTH-API-013: Access protected route with expired/revoked token (P0, Security)
**Steps**:
1. Login, get token
2. Logout (revoke token)
3. `GET /api/quotation` with revoked token
**Expected**:
- Status 401

## AUTH-API-014: Change password — valid (P0, Integration)
**Preconditions**: Authenticated user
**Steps**:
1. `POST /api/user/changePassword` with `{ "password": "NewPass1", "confirm_password": "NewPass1" }`
**Expected**:
- Status 200
- Message: "Change password success"
- Can login with new password afterward

## AUTH-API-015: Change password — mismatch confirm (P1, Integration)
**Steps**:
1. `POST /api/user/changePassword` with `{ "password": "NewPass1", "confirm_password": "Different1" }`
**Expected**:
- Status 422
- Validation error: "The confirm password field must match password."

## AUTH-API-016: Change password — too short (P1, Integration)
**Steps**:
1. `POST /api/user/changePassword` with `{ "password": "Ab1", "confirm_password": "Ab1" }`
**Expected**:
- Status 422
- Validation error: password must be at least 6 characters

## AUTH-API-017: Change password — missing uppercase (P1, Integration)
**Steps**:
1. `POST /api/user/changePassword` with `{ "password": "password1", "confirm_password": "password1" }`
**Expected**:
- Status 422
- Validation error: password must contain mixed case

## AUTH-API-018: Change password — missing number (P1, Integration)
**Steps**:
1. `POST /api/user/changePassword` with `{ "password": "Password", "confirm_password": "Password" }`
**Expected**:
- Status 422
- Validation error: password must contain a number

---

## RBAC-API-019: Director bypasses all role middleware (P0, Security)
**Preconditions**: Director user authenticated
**Steps**:
1. Access any role-protected route (e.g., `/api/employee`, `/api/quotation`, `/api/work-order`)
**Expected**:
- Status 200 for all routes — Director always passes `RoleMiddleware`

## RBAC-API-020: Marketing cannot access employee management (P0, Security)
**Preconditions**: Marketing user authenticated
**Steps**:
1. `GET /api/employee`
**Expected**:
- Status 403 (Unauthorized)

## RBAC-API-021: Marketing can access quotation routes (P0, Security)
**Preconditions**: Marketing user authenticated
**Steps**:
1. `GET /api/quotation`
**Expected**:
- Status 200

## RBAC-API-022: Finance cannot access work-order routes (P1, Security)
**Preconditions**: Finance user authenticated
**Steps**:
1. `GET /api/work-order`
**Expected**:
- Status 403

## RBAC-API-023: Service can access work-order but not invoice (P1, Security)
**Preconditions**: Service user authenticated
**Steps**:
1. `GET /api/work-order` → Status 200
2. `GET /api/invoice` → Status 403

## RBAC-API-024: Inventory Admin can access delivery-order but not invoice (P1, Security)
**Preconditions**: Inventory Admin user authenticated
**Steps**:
1. `GET /api/delivery-order` → Status 200
2. `GET /api/invoice` → Status 403

## RBAC-API-025: Inventory Purchase can access buy but not delivery-order (P1, Security)
**Preconditions**: Inventory Purchase user authenticated
**Steps**:
1. `GET /api/buy` → Status 200
2. `GET /api/delivery-order` → Status 403

## RBAC-API-026: Role normalization handles spaces (P1, Unit)
**Test**: `RoleMiddleware` normalizes "Inventory Admin" → "inventory_admin"
**Steps**:
1. User with `role = "Inventory Admin"` hits route with `role:inventory_admin` middleware
**Expected**:
- Access granted (spaces converted to underscores, lowercased)

## RBAC-API-027: Unauthenticated user gets 403 from role middleware (P0, Security)
**Steps**:
1. Hit role-protected route without token
**Expected**:
- Status 401 or 403 — middleware aborts with "Unauthorized"

---

## UI-AUTH-028: Login page renders correctly (P0, E2E)
**Steps**:
1. Navigate to `/login`
**Expected**:
- Email and password input fields visible
- Login button visible
- BMJ branding/logo visible
