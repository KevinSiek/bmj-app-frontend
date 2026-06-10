# Feature: Delivery Order

## Overview
Delivery Orders (DO) track the logistics of delivering goods to customers.
Created when a Purchase Order is **released**.

## File Map
| File | Purpose |
| ---- | ------- |
| `views/menu/DeliveryOrderPage.vue` | List all delivery orders |
| `views/menu/DeliveryOrderAddPage.vue` | Create DO (from PO release) |
| `views/menu/DeliveryOrderDetailPage.vue` | DO detail |
| `stores/delivery-order.js` | Pinia store |
| `api/delivery-order.js` | API wrappers |
| `utils/pdf/delivery-note.js` | PDF generation for delivery note |

## Key Business Rules
1. DO is created during PO **Release** action
2. Tracks: ship_mode, order_type, delivery details, received_by, prepared_by
3. Has `type` field matching the quotation type (Sparepart/Service)
4. NPWP field for tax purposes
5. Process action transitions status

## API Endpoints
| Function | Method | Endpoint |
| -------- | ------ | -------- |
| `getAllDeliveryOrder(param)` | GET | `/api/delivery-order` |
| `getDeliveryOrderById(id)` | GET | `/api/delivery-order/{id}` |
| `updateDeliveryOrder(id, data)` | PUT | `/api/delivery-order/{id}` |
| `processDeliveryOrder(id, data)` | POST | `/api/delivery-order/process/{id}` |
