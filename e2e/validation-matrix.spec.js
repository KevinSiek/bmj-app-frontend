import { test, expect } from '@playwright/test';

/**
 * Per-field validation matrix. For each create/update endpoint we start from a known-valid
 * payload, then break ONE field at a time with several invalid values and assert the API
 * rejects it with the correct status code.
 *
 * Failure codes are NOT uniform (verified from the controllers):
 *   - Most validate() endpoints → 422.
 *   - PUT /purchase-order/{id}, PUT /delivery-order/{id}, release/{id} → 400 (manual Validator::make).
 * Each case declares its own expected code.
 *
 * Helper `setPath` writes a value at a dotted/`*`-free path so nested camelCase keys
 * (customer.companyName, spareparts.0.quantity) can be broken individually.
 */

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

// Set a value at a dot path, creating intermediate objects; `__DELETE__` removes the key.
function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (value === '__DELETE__') delete cur[last];
  else cur[last] = value;
  return obj;
}

const DEL = '__DELETE__';

test.describe('Per-Field Validation Matrix', () => {
  let api;
  let sparepartId;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const token = (await (await ctx.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' },
    })).json()).access_token;
    expect(token).toBeDefined();
    await ctx.dispose();
    api = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    sparepartId = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0].id;
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // ---- Static create-endpoint matrices (valid base + per-field invalid values) ----
  const customerValid = {
    company_name: 'PT Valid', office: '021-1', address: 'Jl. A', urban: 'U',
    subdistrict: 'S', city: 'Jakarta', province: 'DKI', postal_code: 12345,
  };
  const sellerValid = { code: 'SUP-1', name: 'Supplier One', type: 'Local' };
  const accessValid = { access: 'Valid Access' };
  const generalValid = { discount: 0.1, ppn: 0.11, currency_converter: 15000 };

  // [path, [invalid values...], expectedCode]
  const matrices = [
    {
      label: 'customer POST', method: 'POST', path: '/api/customer', base: customerValid, code: 422,
      fields: [
        ['company_name', [DEL, '', 12345]],
        ['office', [DEL, '']],
        ['address', [DEL, '']],
        ['urban', [DEL, '']],
        ['subdistrict', [DEL, '']],
        ['city', [DEL, '']],
        ['province', [DEL, '']],
        ['postal_code', [DEL, '', 'abcde']],
      ],
    },
    {
      label: 'seller POST', method: 'POST', path: '/api/seller', base: sellerValid, code: 422,
      fields: [
        ['code', [DEL, '', 12345]],
        ['name', [DEL, '']],
      ],
    },
    {
      label: 'access POST', method: 'POST', path: '/api/access', base: accessValid, code: 422,
      fields: [
        ['access', [DEL, '']],
      ],
    },
    {
      label: 'general PUT', method: 'PUT', path: '/api/general', base: generalValid, code: 422,
      fields: [
        ['discount', ['abc', -1, 101]],
        ['ppn', ['ten', -5, 150]],
        ['currency_converter', ['USD', -0.01]],
      ],
    },
  ];

  for (const m of matrices) {
    for (const [field, invalids] of m.fields) {
      for (const inv of invalids) {
        const label = inv === DEL ? 'missing' : JSON.stringify(inv);
        test(`VM ${m.label} · ${field}=${label} → ${m.code}`, async () => {
          const payload = setPath(deepClone(m.base), field, inv);
          const res = m.method === 'POST' ? await api.post(m.path, { data: payload }) : await api.put(m.path, { data: payload });
          expect(res.status()).toBe(m.code);
        });
      }
    }
  }

  // ---- Employee POST (unique email/username; build fresh base each run) ----
  test.describe('employee POST validation', () => {
    function empBase() {
      const s = `vm${Date.now()}${Math.floor(performance.now())}`;
      return { fullname: 'VM', role: 'Marketing', branch: 'Jakarta', email: `${s}@bmj.com`, username: s };
    }
    const empFields = [
      ['fullname', [DEL, '', 12345]],
      ['role', [DEL, '']],
      ['branch', [DEL, '']],
      ['email', [DEL, '', 'not-an-email']],
      ['username', [DEL, '']],
    ];
    for (const [field, invalids] of empFields) {
      for (const inv of invalids) {
        const label = inv === DEL ? 'missing' : JSON.stringify(inv);
        test(`VM employee POST · ${field}=${label} → 422`, async () => {
          const payload = setPath(empBase(), field, inv);
          expect((await api.post('/api/employee', { data: payload })).status()).toBe(422);
        });
      }
    }
  });

  // ---- Quotation POST (nested camelCase + conditional spareparts) ----
  test.describe('quotation POST validation', () => {
    function quoteBase() {
      return {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT VM', address: 'A', city: 'Jakarta', province: 'DKI',
          postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      };
    }
    const quoteFields = [
      ['project.type', [DEL, '', 'spareparts', 'Parts']],
      ['price.amount', [DEL, 'abc']],
      ['customer.companyName', [DEL, '']],
      ['customer.postalCode', [DEL, 'abc']],
      ['spareparts.0.quantity', [0, -3, 'two']],
      ['spareparts.0.unitPriceSell', [0, -100, 'free']],
      ['spareparts.0.sparepartId', [999999, 'abc']],
    ];
    for (const [field, invalids] of quoteFields) {
      for (const inv of invalids) {
        const label = inv === DEL ? 'missing' : JSON.stringify(inv);
        test(`VM quotation POST · ${field}=${label} → 422`, async () => {
          const payload = setPath(quoteBase(), field, inv);
          expect((await api.post('/api/quotation', { data: payload })).status()).toBe(422);
        });
      }
    }
  });

  // ---- Buy POST (camelCase + nested) ----
  test.describe('buy POST validation', () => {
    function buyBase() {
      return { totalAmount: 50000, notes: 'vm', branch: 'Jakarta', spareparts: [{ sparepartId, quantity: 1, unitPriceBuy: 1000 }] };
    }
    const buyFields = [
      ['totalAmount', [DEL, 'abc']],
      ['branch', [DEL]],
      ['spareparts', [DEL, 'notarray']],
      ['spareparts.0.quantity', [0, -3, 1.5]],
      ['spareparts.0.unitPriceBuy', [0, -100]],
      ['spareparts.0.sparepartId', [999999999, 'abc']],
    ];
    for (const [field, invalids] of buyFields) {
      for (const inv of invalids) {
        const label = inv === DEL ? 'missing' : JSON.stringify(inv);
        test(`VM buy POST · ${field}=${label} → 422`, async () => {
          const payload = setPath(buyBase(), field, inv);
          expect((await api.post('/api/buy', { data: payload })).status()).toBe(422);
        });
      }
    }
  });

  // ---- Transition endpoints with a single required `notes` (need a real target id) ----
  test('VM moveToPo · notes missing → 422', async () => {
    // Build an approved quotation, then call moveToPo with no notes.
    const q = (await (await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: 'PT VM Notes', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      },
    })).json()).data;
    await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a' } });
    const res = await api.post(`/api/quotation/moveToPo/${q.slug}`, { data: {} });
    expect(res.status()).toBe(422);
  });
});
