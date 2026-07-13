# Feature: Purchase (Buy)

## Overview
Purchase (internally called "Buy") is the procurement workflow for buying
spareparts from external sellers to fulfill Back Orders.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/PurchasePage.vue` | List all purchases |
| `views/menu/PurchaseAddPage.vue` | Create purchase (with item rows) |
| `views/menu/PurchaseEditPage.vue` | Edit purchase |
| `views/menu/PurchaseDetailPage.vue` | Purchase detail |
| `views/menu/PurchaseReviewPage.vue` | Purchases awaiting review |
| `views/menu/PurchaseReviewDetailPage.vue` | Review detail |
| `views/PurchaseAdd.vue` | Root-level purchase add (legacy?) |
| `components/PurchaseItemRow.vue` | Single line item row component |
| `stores/purchase.js` | Pinia store |
| `api/purchase.js` | API wrappers |

## Key Business Rules
1. "Buy" is initiated when missing stock is identified, usually from a Back Order (BO).
2. Buy tracks items purchased from a specific seller.
3. Status lifecycle: `Wait for Review → Approved → Received`. Side states: `Rejected`, `Need Change`.
4. It ties into **Spareparts** (purchasing more inventory) and optionally links to a `back_order_id` if fulfilling a BO.
5. Line items (`DetailBuy`) reference spareparts with seller prices
5. Director reviews and approves/rejects purchase requests
6. On approval + receive, stock quantities increase via `SparepartStockService`

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllPurchase(param)` | GET | `/api/buy` |
| `getPurchaseById(id)` | GET | `/api/buy/{id}` |
| `addPurchase(data)` | POST | `/api/buy` |
| `updatePurchase(id, data)` | PUT | `/api/buy/{id}` |
| `deletePurchase(id)` | DELETE | `/api/buy/{id}` |
| `approvePurchase(id, data)` | POST | `/api/buy/approve/{id}` |
| `rejectPurchase(id, data)` | POST | `/api/buy/reject/{id}` |
| `needChangePurchase(id, data)` | POST | `/api/buy/needChange/{id}` |
| `donePurchase(id, data)` | POST | `/api/buy/done/{id}` |
| `getReviewPurchase(param)` | GET | `/api/buy/review/1` |

## Note on Naming
The frontend calls this "Purchase" while the backend model is `Buy` and the
API endpoint is `/api/buy`. The config mapping is:
`config.api.purchase = '/api/buy'`
