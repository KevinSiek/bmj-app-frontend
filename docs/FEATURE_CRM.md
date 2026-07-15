# Feature: CRM (Customer & Seller)

> **Read this file** when interacting with Customer or Seller endpoints.

## Overview
Customer and Seller records in the BMJ App represent the external business entities that the company trades with. 
Unlike internal Entities like Spareparts or Employees, **there are no dedicated Customer or Seller CRUD pages in the frontend UI**. Instead, they are managed via "implicit creation" and integrated selectors during the Quotation and Purchase workflows.

## File Map

| File | Purpose |
| ---- | ------- |
| `stores/customer.js` | Pinia store for Customer API |
| `stores/seller.js` | Pinia store for Seller API |
| `api/customer.js` | Generic API wrapper for `/api/customer` |
| `api/seller.js` | Generic API wrapper for `/api/seller` |

---

## 1. Customers

Customers represent the clients purchasing goods and services via **Quotations**.

### Implicit Creation Workflow
When an employee creates a new Quotation (`views/menu/QuotationAddPage.vue`), they must input a Customer Name. 
1. If the Customer Name + Address matches an existing record in the database, the backend uses the existing `customer_id`.
2. If it does not match, the backend **implicitly creates a new Customer record** with a unique `slug`.
3. The Quotation is then permanently linked to that Customer.

### Key Business Rules
- **Ownership**: Marketing employees "own" the customers they quote. The backend prevents a Marketing employee from creating a quotation for a Customer already owned by another Marketing employee (returns validation error: *"This customer is already being handled by [username]"*).
- **Director Override**: The Director role bypasses customer ownership rules and can quote any customer.

### Data Model
- `company_name`
- `office`
- `address`, `city`, `province`, `postal_code`

### API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAll` | GET | `/api/customer` |
| `getById` | GET | `/api/customer/{slug}` |
| `create` | POST | `/api/customer` |
| `update` | PUT | `/api/customer/{slug}` |
| `delete` | DELETE | `/api/customer/{slug}` |

---

## 2. Sellers

Sellers represent external distributors or shops where the company procures spareparts via **Purchases (Buys)** to fulfill Back Orders.

### Integration Workflow
1. **Sparepart Pricing**: Each Sparepart can have multiple seller-specific prices. This is managed via the `DetailSparepart` table, linking a Sparepart to a Seller.
2. **Purchase (Buy) Forms**: When a user creates a Purchase (`views/menu/PurchaseAddPage.vue`), they select the seller they are purchasing from.
3. Similar to customers, sellers can be managed via API, but they act as auxiliary entities to Spareparts and Buys.

### Data Model
- `name`
- `code`
- `type`

### API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAll` | GET | `/api/seller` |
| `getById` | GET | `/api/seller/{slug}` |
| `create` | POST | `/api/seller` |
| `update` | PUT | `/api/seller/{slug}` |
| `delete` | DELETE | `/api/seller/{slug}` |

---

## ⚠️ Edge Cases & Gotchas (verified 2026-07-16)

> Cross-cutting findings live in [CODEBASE_GOTCHAS.md](./CODEBASE_GOTCHAS.md). Items below are specific to this feature; each cites file:line.

### The frontend wrappers are READ-ONLY (no CRUD)
Despite the endpoint tables above, the frontend only ever *reads* customers and sellers. `api/customer.js` exports **only** `getCustomers` → `GET /api/customer` (`api/customer.js:4-10`); `api/seller.js` exports **only** `getSellers` → `GET /api/seller` (`api/seller.js:4-10`). There are no `getById`/`create`/`update`/`delete` wrappers, and no store methods call them. Customer records are created implicitly by the backend during Quotation submission (see §1), never via a frontend `POST /api/customer`.

> ⚠️ Correction: the "API Endpoints" tables (customer lines 40-46, seller lines 64-71) list `getById`/`create`/`update`/`delete`. Those are **not implemented** in the frontend API layer — only the `getAll` GET exists in each file.

### Stores are thin autocomplete/lookup feeds
Both stores just fetch a list, map field names, and expose the array — no selection state, no persistence.
- **Customer** (`stores/customer.js`): `mapCustomer` renames `company_name → companyName`, `postal_code → postalCode`, etc. (`:8-21`); `getCustomers` reads the nested `data.data` list (`:24-25`).
- **Seller** (`stores/seller.js`): `mapSeller` keeps `id`/`code`/`name`/`type` (`:8-15`); `getSellers` reads `data.data` (`:18-19`).

Both rely on the doubly-nested envelope (`data.data`) — see the envelope gotcha in `FEATURE_EMPLOYEE_AUTH_MISC.md`.

### Where each store is actually consumed
- **Customer** store → the customer autocomplete/lookup in the Quotation form (`components/quotation/QuotationForm.vue`). Ownership rules (Marketing owns quoted customers; Director override) are enforced **backend-side** during quotation submit — the frontend has no ownership logic.
- **Seller** store → the seller-pricing selectors in Sparepart Add/Edit (`views/menu/SparepartsAddPage.vue`, `views/menu/SparepartsEditPage.vue`).

> Note: the seller *store* is not imported by `PurchaseAddPage.vue` — the "seller selector in Purchase (Buy) add" (§2, Integration Workflow) is not backed by this store; verify how Purchase selects its seller before relying on that claim. (observed — verify)

### Upload Data references sellers by numeric code, not the seller store
The bulk sparepart upload identifies sellers by a hardcoded numeric legend — `1 = Megah, 2 = CT, 3 = Aseng, 4 = MHI` (`views/menu/UploadDataPage.vue:42-47`) — and validates `seller ∈ {1,2,3,4}` (`:218`). These codes are independent of the `seller` store's records; do not assume the numbers line up with seller `id`/`code` without checking the backend import mapping.
