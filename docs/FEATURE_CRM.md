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
