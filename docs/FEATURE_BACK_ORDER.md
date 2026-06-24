# Feature: Back Order

## Overview
Back Orders (BO) track spareparts that are out of stock when a PO is released.
They trigger the Purchase (Buy) workflow to procure missing parts from sellers.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/BackOrderPage.vue` | List all back orders |
| `views/menu/BackOrderDetailPage.vue` | BO detail with line items; analyze + process + print actions |
| `views/menu/BackOrderAdjustmentPage.vue` | Adjust sparepart lines in an existing BO (swap/rebalance items) |
| `stores/back-order.js` | Pinia store |
| `api/back-order.js` | API wrappers |

## Key Business Rules
1. BO is auto-created during PO **Release** when spareparts are insufficient.
2. Contains `DetailBackOrder` line items (sparepart_id + qty needed).
3. **Fulfillment Workflow**: BOs are fulfilled via manual Purchases (Buy) rather than auto-creating Buys.
4. **Analyze Action**: Before processing, Inventory clicks "Analyze" (`GET /api/back-order/analyze/{id}`) to verify `available stock >= requested quantity`.
5. **Process Action**: If stock is sufficient, "Process" decrements the branch stock directly and transitions the BO to `Done`.
6. **Adjustment Workflow** (`BackOrderAdjustmentPage.vue`): Allows Inventory to rebalance the sparepart lines of an existing BO — e.g., replace an out-of-stock part with a substitute. The adjustment page shows the **current BO** lines (read-only) and an **Adjust Sparepart** table where items can be added/removed/edited. A total-order validation ensures `sum(original orders) == sum(adjusted orders)` before submitting. Calls `backOrderStore.adjustBackOrder(id)` on the backend.
7. No manual BO creation — always derived from PO release.
8. Back Order detail can be exported as PDF for documentation/archival.

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
| `adjustBackOrder(id, payload)` | POST | `/api/back-order/adjust/{id}` |
| `getBackOrderForAdjustment(id)` | GET | `/api/back-order/{id}` (+ store normalises for adjustment form) |

## Print / PDF Export
Back Order detail page includes a **Print** button that generates a PDF following the same pattern as Quotation and PO PDFs:
- Creator name stamped on the document
- Version stamp ("Version N") indicating document iteration
- PDF filename: `back_order_{id}.pdf` (or equivalent)
