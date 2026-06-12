# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-updates.spec.js >> Order Updates API Tests (PO, PI, WO, DO Updates) >> Order Lifecycle Updates >> ORD-EXT-005: Update Work Order (read-back worker)
- Location: e2e\order-updates.spec.js:217:5

# Error details

```
Error: expect(received).toBeDefined()

Received: undefined
```

# Test source

```ts
  118 |       let servicePoId = body.data.id;
  119 | 
  120 |       // Ensure Ready state to release
  121 |       await apiContext.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready SP', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  122 |       await apiContext.post(`/api/purchase-order/ready/${servicePoId}`, { data: { notes: 'Ready SRV', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  123 | 
  124 |       // Create PI for Service PO and Pay DP (required before releasing Work Order)
  125 |       response = await apiContext.post(`/api/purchase-order/moveToPi/${servicePoId}`, { data: { notes: 'Move Service to PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  126 |       body = await response.json();
  127 |       let servicePiId = body.data.id;
  128 |       await apiContext.post(`/api/proforma-invoice/dpPaid/${servicePiId}`, { data: { notes: 'Pay DP Service', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  129 | 
  130 |       // 6. Release to DO and WO
  131 |       response = await apiContext.post(`/api/purchase-order/release/${poId}`, {
  132 |         data: {
  133 |           notes: 'Release DO',
  134 |           deliveryOrder: {
  135 |             deliveryOrderDate: '2026-06-03',
  136 |             preparedBy: 'E2E Prep',
  137 |             receivedBy: 'E2E Recv',
  138 |             pickedBy: 'E2E Pick',
  139 |             shipMode: 'Land',
  140 |             orderType: 'Regular'
  141 |           }
  142 |         }
  143 |       });
  144 |       body = await response.json();
  145 |       if (response.status() !== 200) console.error('Release PO failed:', body);
  146 |       doId = body.data.delivery_order.id;
  147 | 
  148 |       response = await apiContext.post(`/api/purchase-order/release/${servicePoId}`, {
  149 |         data: {
  150 |           notes: 'Release WO',
  151 |           serviceOrder: { receivedBy: 'E2E Recv', startDate: '2026-06-03', endDate: '2026-06-05' },
  152 |           poc: { compiled: 'E2E Comp', approver: 'E2E Appr', headOfService: 'E2E Head' },
  153 |           units: [{ quantity: 1, unitType: 'Test', jobDescriptions: 'Job' }]
  154 |         }
  155 |       });
  156 |       body = await response.json();
  157 |       if (response.status() !== 200) console.error('Release Service PO failed:', body);
  158 |       woId = body.data.work_order.id;
  159 | 
  160 |       expect(poId).toBeDefined();
  161 |       expect(piId).toBeDefined();
  162 |       expect(doId).toBeDefined();
  163 |       expect(woId).toBeDefined();
  164 |     });
  165 | 
  166 |     // NOTE: PO update maps only camelCase keys (purchaseOrderNumber, paymentDue, ...).
  167 |     // The previous snake_case payload was silently ignored (a 200 no-op) — the read-back
  168 |     // below would have stayed at the old number. Using the correct camelCase keys here.
  169 |     test('ORD-EXT-002: Update Purchase Order (read-back number)', async () => {
  170 |       expect(poId).toBeDefined();
  171 |       const newNumber = `PO-UPD-${Date.now()}`;
  172 |       const response = await apiContext.put(`/api/purchase-order/${poId}`, {
  173 |         data: {
  174 |           paymentDue: '2026-12-31',
  175 |           purchaseOrderDate: '2026-01-01',
  176 |           purchaseOrderNumber: newNumber
  177 |         }
  178 |       });
  179 |       expect(response.status()).toBe(200);
  180 | 
  181 |       // Read-back: the mutated purchase_order_number must persist.
  182 |       const getBody = await (await apiContext.get(`/api/purchase-order/${poId}`)).json();
  183 |       expect(getBody.data.purchase_order_number).toBe(newNumber);
  184 |     });
  185 | 
  186 |     test('ORD-EXT-003: Update Proforma Invoice (read-back down_payment)', async () => {
  187 |       expect(piId).toBeDefined();
  188 |       const response = await apiContext.put(`/api/proforma-invoice/${piId}`, {
  189 |         data: {
  190 |           downPayment: 77000
  191 |         }
  192 |       });
  193 |       expect(response.status()).toBe(200);
  194 |       // The update endpoint echoes the persisted down_payment.
  195 |       const body = await response.json();
  196 |       expect(Number(body.data.down_payment)).toBe(77000);
  197 |     });
  198 | 
  199 |     test('ORD-EXT-004: Update Delivery Order (read-back ship_mode)', async () => {
  200 |       expect(doId).toBeDefined();
  201 |       const response = await apiContext.put(`/api/delivery-order/${doId}`, {
  202 |         data: {
  203 |           shipMode: 'Air',
  204 |           orderType: 'Express'
  205 |         }
  206 |       });
  207 |       expect(response.status()).toBe(200);
  208 | 
  209 |       // Read-back: the mutated ship_mode must persist (detail nests it under delivery_order).
  210 |       const getBody = await (await apiContext.get(`/api/delivery-order/${doId}`)).json();
  211 |       expect(getBody.data.delivery_order.ship_mode).toBe('Air');
  212 |     });
  213 | 
  214 |     // NOTE (reported): WorkOrderController@update maps work_order_number => null when the
  215 |     // key is absent, so its 'sometimes|required' rule always fires and a WO update without
  216 |     // workOrderNumber 422s. A client must always resend the number — so we do here.
  217 |     test('ORD-EXT-005: Update Work Order (read-back worker)', async () => {
> 218 |       expect(woId).toBeDefined();
      |                    ^ Error: expect(received).toBeDefined()
  219 |       const response = await apiContext.put(`/api/work-order/${woId}`, {
  220 |         data: {
  221 |           workOrderNumber: `WO-UPD-${Date.now()}`,
  222 |           worker: 'Updated Worker'
  223 |         }
  224 |       });
  225 |       expect(response.status()).toBe(200);
  226 | 
  227 |       // Read-back: the mutated worker must persist (detail nests it under poc).
  228 |       const getBody = await (await apiContext.get(`/api/work-order/${woId}`)).json();
  229 |       expect(getBody.data.poc.worker).toBe('Updated Worker');
  230 |     });
  231 |   });
  232 | });
  233 | 
```