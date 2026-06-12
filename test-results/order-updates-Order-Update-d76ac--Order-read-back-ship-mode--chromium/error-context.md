# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-updates.spec.js >> Order Updates API Tests (PO, PI, WO, DO Updates) >> Order Lifecycle Updates >> ORD-EXT-004: Update Delivery Order (read-back ship_mode)
- Location: e2e\order-updates.spec.js:199:5

# Error details

```
Error: apiRequestContext.put: connect ECONNREFUSED ::1:8000
Call log:
  - → PUT http://localhost:8000/api/delivery-order/3
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: application/json
    - accept-encoding: gzip,deflate,br
    - Authorization: Bearer 125|qRkzRjvVxtb22oaZ2SHzylmbcsJwb83vFFKMuRyWeb3f1101
    - content-type: application/json
    - content-length: 40

```