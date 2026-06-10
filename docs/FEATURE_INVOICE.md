# Feature: Invoice

## Overview
Invoices are the final financial document, created from Proforma Invoices via
`moveToInvoice`. They are read-only after creation.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/InvoicePage.vue` | List all invoices |
| `views/menu/InvoiceDetailPage.vue` | Invoice detail (read-only, with Track) |
| `stores/invoice.js` | Pinia store |
| `api/invoice.js` | API wrappers |
| `utils/pdf/invoice.js` | PDF generation |

## Key Business Rules
1. Invoices are **read-only** — no edit/delete functionality
2. Created only through PI → Invoice flow
3. Includes `term_of_payment` field
4. Invoice detail shows the full chain: Quotation → PO → PI → Invoice

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllInvoice(param)` | GET | `/api/invoice` |
| `getInvoiceById(id)` | GET | `/api/invoice/{id}` |
