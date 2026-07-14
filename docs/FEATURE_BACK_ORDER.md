# Feature: Back Order

## Overview
Back Orders (BO) track spareparts that are out of stock when a PO is released.
They trigger the Purchase (Buy) workflow to procure missing parts from sellers.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/BackOrderPage.vue` | List all back orders |
| `views/menu/BackOrderDetailPage.vue` | BO detail with line items; print/PDF export |
| `stores/back-order.js` | Pinia store |
| `api/back-order.js` | API wrappers |

## Key Business Rules
1. BO is auto-created during PO **Release** when spareparts are insufficient.
2. Contains `DetailBackOrder` line items (sparepart_id + qty needed)
3. A BO can have two main types depending on missing goods (Spareparts).
4. Status lifecycle: `Process → Ready → Rejected`.
3. **Fulfillment Workflow**: BOs are now fulfilled via manual Purchases rather than auto-creating Buys. 
4. **Analyze Action**: Before processing, Inventory clicks "Analyze" to verify if `available stock >= requested quantity`.
5. **Process Action**: If stock is sufficient, "Process" decrements the branch stock directly and transitions the BO to 'Done'.
6. No manual creation — always derived from PO release
6. Back Order detail can be exported as PDF for documentation/archival

## Data Chain
```
PurchaseOrder (Release)
  → BackOrder (auto-created for missing stock)
    → DetailBackOrder[] (sparepart + qty needed)
    → (Manual Purchase creates separate Buy to restock branch)
    → BackOrder is Analyzed & Processed (deducts stock)
```

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllBackOrder(param)` | GET | `/api/back-order` |
| `getBackOrderById(id)` | GET | `/api/back-order/{id}` |
| `analyzeBackOrder(id)` | GET | `/api/back-order/analyze/{id}` |
| `processBackOrder(id)` | POST | `/api/back-order/process/{id}` |
| `adjustBackOrder(id, data)` | POST | `/api/back-order/adjust/{id}` |

## Print / PDF Export
Back Order detail page includes a **Print** button that generates a PDF following the same pattern as Quotation and PO PDFs:
- Creator name stamped on the document
- Version stamp ("Version N") indicating document iteration
- PDF filename: `back_order_{id}.pdf` (or equivalent)
