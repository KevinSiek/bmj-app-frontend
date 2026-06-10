# Feature: Back Order

## Overview
Back Orders (BO) track spareparts that are out of stock when a PO is released.
They trigger the Purchase (Buy) workflow to procure missing parts from sellers.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/BackOrderPage.vue` | List all back orders |
| `views/menu/BackOrderDetailPage.vue` | BO detail with line items |
| `stores/back-order.js` | Pinia store |
| `api/back-order.js` | API wrappers |

## Key Business Rules
1. BO is auto-created during PO **Release** when spareparts are insufficient
2. Contains `DetailBackOrder` line items (sparepart_id + quantity)
3. BO links to a `Buy` record for procurement
4. Process action transitions the BO status
5. No manual creation — always derived from PO release

## Data Chain
```
PurchaseOrder (Release)
  → BackOrder (auto-created for missing stock)
    → DetailBackOrder[] (sparepart + qty needed)
    → Buy (procurement from seller)
      → DetailBuy[] (sparepart + qty + price)
```

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllBackOrder(param)` | GET | `/api/back-order` |
| `getBackOrderById(id)` | GET | `/api/back-order/{id}` |
| `processBackOrder(id, data)` | POST | `/api/back-order/process/{id}` |
