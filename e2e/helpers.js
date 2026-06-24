import { expect } from '@playwright/test';

/**
 * Shared robust helpers for the UI-driving e2e specs.
 *
 * The app's success modal (#modalMessage, ModalMessage.vue) is the #1 flake source: it's
 * v-if'd on a Pinia ref and uses a Bootstrap fade. Two races bite naive code:
 *   1. The modal appears a beat AFTER the confirm "Yes" click — so a close that checks
 *      instantaneous visibility no-ops, then the modal appears and its overlay blocks the
 *      NEXT action (often surfacing as a failure in the next serial test).
 *   2. The .modal-body overlay + fade intercept a normal Playwright click during the fade.
 */

/**
 * Close the #modalMessage success modal and WAIT for it to fully disappear.
 * Waits (briefly) for the modal to appear first, then fires the Close button's NATIVE DOM
 * click via evaluate (bypasses actionability/overlay; triggers the Vue @click → store),
 * retrying until hidden. Idempotent — safe to call when no modal is open.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ waitForAppear?: number }} [opts] waitForAppear: how long to wait for the modal to
 *   render before treating it as absent. Use a small value (~800) for a defensive
 *   clear-if-present call; the default (4000) suits "I just triggered a success" calls.
 */
export async function closeModal(page, { waitForAppear = 4000 } = {}) {
  const modal = page.locator('#modalMessage');
  const appeared = await modal
    .waitFor({ state: 'visible', timeout: waitForAppear })
    .then(() => true)
    .catch(() => false);
  if (!appeared) return;
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const m = document.querySelector('#modalMessage');
      const btn = m && [...m.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Close');
      if (btn) btn.click();
    });
    if (await modal.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false)) return;
  }
  await expect(modal).toBeHidden({ timeout: 5000 });
}

/**
 * Confirm a modal action (click "Yes") while awaiting the triggering API response, so a
 * following navigation/URL assertion doesn't race the request. Returns the response.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} urlPart substring of the API endpoint to await, e.g. '/api/purchase-order/moveToPi/'
 * @param {{ status?: number, timeout?: number }} [opts]
 */
export async function confirmYesAwaiting(page, urlPart, { status = 200, timeout = 20000 } = {}) {
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(urlPart) && r.status() === status, { timeout }),
    page.click('button:has-text("Yes")'),
  ]);
  return res;
}

// --- API-direct provisioning for guard specs -------------------------------------------
//
// The Quotation/PurchaseOrder/Buy seeders create ZERO rows, so guard specs that need a real
// {id}/{slug} (allow-cases, and negatives that must reach the controller body) have nothing to
// assert against and would skip. These helpers create that data at runtime through the same
// flow the app uses — create quotation → approve → moveToPo — so the assertions actually run.
// All are API-direct (Director Bearer token), no browser.

const API_BASE = 'http://localhost:8000';

/** Log in and return a Bearer-token request context for a seeded account. */
export async function apiContextFor(playwright, email, password = 'password') {
  const anon = await playwright.request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  const res = await anon.post('/api/login', { data: { email, password } });
  const body = await res.json();
  await anon.dispose();
  if (!body.access_token) throw new Error(`login failed for ${email}: ${JSON.stringify(body).slice(0, 200)}`);
  return playwright.request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
  });
}

/**
 * Provision a fresh Approved quotation that has been moved to a PO, as Director.
 * Returns { slug, poId } — the quotation slug (now linked to a PO) and the created PO id
 * (status 'Prepare'). Throws on any step failure so a setup bug surfaces loudly rather than
 * masquerading as a skipped test.
 */
export async function provisionQuotationAndPo(director) {
  const sp = (await (await director.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
  if (!sp) throw new Error("provision: 'E2E Guaranteed Stock Sparepart' not found — check SparepartSeeder");

  const create = await director.post('/api/quotation', {
    data: {
      project: { type: 'Spareparts' },
      customer: {
        companyName: `PT Guard Provision ${Date.now()}`, address: 'A', city: 'Jakarta',
        province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
      },
      price: { amount: 50000 },
      spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceSell: 50000 }],
    },
  });
  if (create.status() !== 201) throw new Error(`provision: create quotation -> ${create.status()}: ${await create.text()}`);
  const slug = (await create.json()).data.slug;

  const approve = await director.post(`/api/quotation/approve/${slug}`, { data: { notes: 'guard provision' } });
  if (approve.status() !== 200) throw new Error(`provision: approve -> ${approve.status()}`);

  const move = await director.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'guard provision po' } });
  if (move.status() !== 200) throw new Error(`provision: moveToPo -> ${move.status()}`);
  const poId = (await move.json()).data?.id ?? null;

  return { slug, poId };
}

/**
 * Provision a fresh Buy row (status 'Wait for Review') as an authorized inventory role.
 * Returns its id. Used by buy guard allow-cases that need a real buy row to prove an
 * authorized role reaches the handler. `branch` must match the actor's seeded branch wiring;
 * 'Semarang' suits indah.s (Inventory Purchase, Semarang) and Director.
 */
export async function provisionBuy(api, branch = 'Semarang') {
  const sp = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
  if (!sp) throw new Error("provision: 'E2E Guaranteed Stock Sparepart' not found");
  const res = await api.post('/api/buy', {
    data: {
      totalAmount: 50000,
      branch,
      notes: 'guard provision buy',
      spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceBuy: 40000 }],
    },
  });
  if (res.status() !== 201) throw new Error(`provision: create buy -> ${res.status()}: ${await res.text()}`);
  return (await res.json()).data.id;
}

/**
 * Provision a fresh Approved quotation that has NOT been moved to a PO yet, as Director.
 * Returns its slug. Used by quotation guard tests whose controller-internal guards (the
 * Director-only re-check, needChange) must be reached on a quotation with no existing PO.
 */
export async function provisionApprovedQuotation(director) {
  const sp = (await (await director.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
  if (!sp) throw new Error("provision: 'E2E Guaranteed Stock Sparepart' not found");
  const create = await director.post('/api/quotation', {
    data: {
      project: { type: 'Spareparts' },
      customer: {
        companyName: `PT Guard Quot ${Date.now()}`, address: 'A', city: 'Jakarta',
        province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
      },
      price: { amount: 50000 },
      spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceSell: 50000 }],
    },
  });
  if (create.status() !== 201) throw new Error(`provision: create quotation -> ${create.status()}: ${await create.text()}`);
  return (await create.json()).data.slug;
}

// ─── Role-Lifecycle Helpers ────────────────────────────────────────────────────
//
// Used by role-lifecycle-*.spec.js to provide fast API-direct provisioning and
// a consistent loginAs() helper for switching roles in browser-driven tests.

/**
 * Seeded account credentials keyed by friendly role name.
 * All passwords are 'password' (set by EmployeeSeeder).
 */
export const ACCOUNTS = {
  director:         'director.jkt@bmj.com',
  marketing:        'citra.k@bmj.com',
  finance:          'fajar.n@bmj.com',
  inventoryAdmin:   'eko.p@bmj.com',
  inventoryPurchase:'indah.s@bmj.com',
  headInventory:    'headinv.jkt@bmj.com',
  service:          'hadi.s@bmj.com',
};

/**
 * Return an API request context for a named seeded role.
 * roleKey must be a key of ACCOUNTS.
 */
export async function apiContextForRole(playwright, roleKey) {
  const email = ACCOUNTS[roleKey];
  if (!email) throw new Error(`apiContextForRole: unknown roleKey '${roleKey}'`);
  return apiContextFor(playwright, email);
}

/**
 * Log in as a different user in a browser page.
 * Clears localStorage first so the previous session token is gone.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} [password='password']
 */
export async function loginAs(page, email, password = 'password') {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/menu', { timeout: 20000 });
}

/**
 * Provision a PO that is in "Ready" status (Quotation→approve→moveToPo→moveToPi→dpPaid→ready).
 * All steps are API-direct (Director). Returns { poId, piId, quotationSlug }.
 *
 * @param {*} director - Director request context from apiContextFor()
 * @param {'Spareparts'|'Service'} type - Quotation type
 * @param {object} [opts]
 * @param {number} [opts.qty=1] - Sparepart quantity (ignored for Service type)
 * @param {string} [opts.sparepartSearch='E2E Guaranteed'] - Sparepart search term
 */
export async function provisionReadyPo(director, type = 'Spareparts', opts = {}) {
  const { qty = 1, sparepartSearch = 'E2E Guaranteed' } = opts;
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  let quotationPayload;
  if (type === 'Spareparts') {
    const sp = (await (await director.get(`/api/sparepart?search=${encodeURIComponent(sparepartSearch)}`)).json()).data.data[0];
    if (!sp) throw new Error(`provisionReadyPo: sparepart '${sparepartSearch}' not found`);
    quotationPayload = {
      project: { type: 'Spareparts' },
      customer: {
        companyName: `PT Lifecycle ${suffix}`, address: 'Jl. Test', city: 'Jakarta',
        province: 'DKI Jakarta', postalCode: '12345', office: '021-000', urban: 'U', subdistrict: 'S',
      },
      price: { amount: qty * 150000 },
      spareparts: [{ sparepartId: sp.id, quantity: qty, unitPriceSell: 150000 }],
    };
  } else {
    quotationPayload = {
      project: { type: 'Service' },
      customer: {
        companyName: `PT Svc Lifecycle ${suffix}`, address: 'Jl. Service', city: 'Jakarta',
        province: 'DKI Jakarta', postalCode: '12345', office: '021-000', urban: 'U', subdistrict: 'S',
      },
      price: { amount: 5000000 },
      services: [{ service: 'E2E Service Work', quantity: 1, servicePrice: 5000000 }],
    };
  }

  // 1. Create quotation
  const createRes = await director.post('/api/quotation', { data: quotationPayload });
  if (createRes.status() !== 201)
    throw new Error(`provisionReadyPo: create quotation -> ${createRes.status()}: ${await createRes.text()}`);
  const { slug, id: quotationId } = (await createRes.json()).data;

  // 2. Approve
  const approveRes = await director.post(`/api/quotation/approve/${slug}`, { data: { notes: 'auto-provision' } });
  if (approveRes.status() !== 200)
    throw new Error(`provisionReadyPo: approve -> ${approveRes.status()}: ${await approveRes.text()}`);

  // 3. Move to PO
  const poNumber = `PO-AUTO-${suffix}`;
  const movRes = await director.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'auto-provision', poNumber } });
  if (movRes.status() !== 200)
    throw new Error(`provisionReadyPo: moveToPo -> ${movRes.status()}: ${await movRes.text()}`);
  const poId = (await movRes.json()).data?.id;

  // 4. Move to PI
  const piRes = await director.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'auto-provision PI' } });
  if (piRes.status() !== 200)
    throw new Error(`provisionReadyPo: moveToPi -> ${piRes.status()}: ${await piRes.text()}`);
  const piId = (await piRes.json()).data?.id;

  // 5. DP Paid (makes PO eligible for Ready)
  const dpRes = await director.post(`/api/proforma-invoice/dpPaid/${piId}`);
  if (dpRes.status() !== 200)
    throw new Error(`provisionReadyPo: dpPaid -> ${dpRes.status()}: ${await dpRes.text()}`);

  // 6. Ready
  const readyRes = await director.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'auto-provision ready' } });
  if (readyRes.status() !== 200)
    throw new Error(`provisionReadyPo: ready -> ${readyRes.status()}: ${await readyRes.text()}`);

  return { poId, piId, quotationSlug: slug, quotationId };
}

/**
 * Read a sparepart's stock quantity for a specific branch (by branch name contains match).
 * @param {*} api - Any authenticated API context
 * @param {number|string} sparepartId
 * @param {string} branchNameContains - e.g. 'jakarta' or 'semarang'
 * @returns {Promise<number>}
 */
export async function getStockForBranch(api, sparepartId, branchNameContains = 'jakarta') {
  const res = await api.get(`/api/sparepart/${sparepartId}`);
  const data = (await res.json()).data;
  const stocks = data.stocks ?? data.total_unit ?? data.branch_stocks ?? [];
  const branch = (Array.isArray(stocks) ? stocks : []).find(
    (s) => (s.name ?? s.branch ?? '').toLowerCase().includes(branchNameContains.toLowerCase())
  );
  return Number(branch?.stock ?? branch?.quantity ?? 0);
}
