import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

/**
 * Bulk Excel import SUCCESS path (the existing sparepart-extended.spec.js only covers the
 * invalid-file rejection). Drives the real Dropzone chunked-upload endpoint with a valid
 * single-chunk .xlsx and asserts the resulting spareparts + stock behavior.
 *
 * Importer column layout (index-based, row 0 is the skipped header):
 *   [1]=sparepart_number  [2]=sparepart_name  [3]=purchase_price  [4]=seller(opt)  [5]=branch(opt)
 */
test.describe('Sparepart Bulk Import — Success Path', () => {
  let api;

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
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // Build a valid single-sheet xlsx buffer from an array-of-arrays.
  function xlsxBuffer(rows) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  // POST the xlsx as a single Dropzone chunk.
  async function upload(buffer, uuid) {
    return api.post('/api/sparepart/updateAllData', {
      multipart: {
        dzuuid: uuid,
        dzchunkindex: '0',
        dztotalchunkcount: '1',
        file: { name: 'import.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer },
      },
    });
  }

  async function stockFor(sparepartId, branchId) {
    const d = (await (await api.get(`/api/sparepart/${sparepartId}`)).json()).data;
    const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
    return b ? Number(b.quantity) : null;
  }

  test('IMP-001: valid import creates a new sparepart (new_records=1)', async () => {
    const num = `IMP-A-${Date.now()}`;
    const buf = xlsxBuffer([
      ['HDR', 'number', 'name', 'price', 'seller', 'branch'],
      ['', num, `Imported ${num}`, 123456, '', 'JKT'],
    ]);
    const res = await upload(buf, `e2e-a-${Date.now()}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.new_records).toBe(1);

    // The part is now retrievable.
    const list = (await (await api.get(`/api/sparepart?search=${encodeURIComponent(num)}`)).json()).data.data;
    expect(list.some((p) => p.sparepart_number === num)).toBe(true);
  });

  test('IMP-002: imported sparepart has a record on every branch', async () => {
    const num = `IMP-B-${Date.now()}`;
    const buf = xlsxBuffer([
      ['HDR', 'number', 'name', 'price', 'seller', 'branch'],
      ['', num, `Imported ${num}`, 50000, '', 'JKT'],
    ]);
    expect((await upload(buf, `e2e-b-${Date.now()}`)).status()).toBe(200);

    const part = (await (await api.get(`/api/sparepart?search=${encodeURIComponent(num)}`)).json()).data.data.find((p) => p.sparepart_number === num);
    expect(part).toBeDefined();
    const detail = (await (await api.get(`/api/sparepart/${part.id}`)).json()).data;
    // The importer ensures a stock record across all branches (quantity 0).
    expect(Array.isArray(detail.stocks)).toBe(true);
    expect(detail.stocks.length).toBeGreaterThanOrEqual(2); // Jakarta + Semarang
    for (const s of detail.stocks) expect(Number(s.quantity)).toBe(0);
  });

  test('IMP-003: re-importing an existing part resets its branch stock to 0 (not additive)', async () => {
    const num = `IMP-C-${Date.now()}`;
    const buf = xlsxBuffer([
      ['HDR', 'number', 'name', 'price', 'seller', 'branch'],
      ['', num, `Imported ${num}`, 50000, '', 'JKT'],
    ]);
    expect((await upload(buf, `e2e-c1-${Date.now()}`)).status()).toBe(200);
    const part = (await (await api.get(`/api/sparepart?search=${encodeURIComponent(num)}`)).json()).data.data.find((p) => p.sparepart_number === num);
    expect(part).toBeDefined();

    // Manually bump Jakarta (branch 1) stock so we can prove the re-import resets it.
    // (Use a Buy receive — the sanctioned increment path.)
    const buyRes = await api.post('/api/buy', {
      data: { totalAmount: 10000, notes: 'Stock bump for import test', branch: 'Jakarta', spareparts: [{ sparepartId: part.id, quantity: 10, unitPriceBuy: 1000 }] },
    });
    const buyId = (await buyRes.json()).data.id;
    await api.post(`/api/buy/approve/${buyId}`, { data: { notes: 'a' } });
    await api.post(`/api/buy/done/${buyId}`, { data: { notes: 'recv' } });
    expect(await stockFor(part.id, 1)).toBe(10);

    // Re-import the same part → branch stock is reset to 0 (import is not additive).
    const buf2 = xlsxBuffer([
      ['HDR', 'number', 'name', 'price', 'seller', 'branch'],
      ['', num, `Imported ${num}`, 60000, '', 'JKT'],
    ]);
    const res2 = await upload(buf2, `e2e-c2-${Date.now()}`);
    expect(res2.status()).toBe(200);
    expect((await res2.json()).data.updated_records).toBeGreaterThanOrEqual(1);
    expect(await stockFor(part.id, 1)).toBe(0);
  });

  test('IMP-004: a row failing validation aborts the import (400) and persists nothing', async () => {
    const goodNum = `IMP-D-${Date.now()}`;
    // Second data row has an empty required sparepart_number → validation fails for the chunk.
    const buf = xlsxBuffer([
      ['HDR', 'number', 'name', 'price', 'seller', 'branch'],
      ['', goodNum, `Good ${goodNum}`, 1000, '', 'JKT'],
      ['', '', 'Missing Number Row', 2000, '', 'JKT'],
    ]);
    const res = await upload(buf, `e2e-d-${Date.now()}`);
    // The importer throws ValidationException → controller returns 400.
    expect(res.status()).toBe(400);
    // The whole chunk is rolled back: the good row is NOT persisted either.
    const list = (await (await api.get(`/api/sparepart?search=${encodeURIComponent(goodNum)}`)).json()).data.data;
    expect(list.some((p) => p.sparepart_number === goodNum)).toBe(false);
  });
});
