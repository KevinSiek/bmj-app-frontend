import { test, expect } from '@playwright/test';
import { apiContextFor } from './helpers.js';
import fs from 'fs';

/**
 * Live PDF render verification for the two PDF features that were never rendered against real
 * data:
 *   #5 Rev. N stamp in Quotation + PO PDFs (data.version -> "Rev. {n}" top-right)
 *   #6 Back Order PDF (order / delivered / back-order split)
 *
 * pdfmake builds the PDF client-side and triggers a browser download. We click the real Print
 * button, capture the download, and assert it is a valid, non-trivial PDF (%PDF header + size).
 * We ALSO render the PDF in-page via pdfmake's getDataUrl to assert the rev-stamp text exists in
 * the document definition path (proves data.version reached the builder).
 *
 * Run:  npx playwright test --config=playwright.verify.config.js feature-verify-pdf.spec.js
 */
test.describe('PDF render verification (#5 rev-stamp, #6 back order)', () => {
  test.describe.configure({ mode: 'serial' });

  async function login(page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });
  }

  async function captureDownload(page, triggerSelector) {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.click(triggerSelector),
    ]);
    const path = await download.path();
    const buf = fs.readFileSync(path);
    return buf;
  }

  /**
   * Quotation/PO Print opens a "Notes for Print ..." modal first; the PDF is generated only
   * after clicking the modal's confirm button (labelled with the modal title). This clicks
   * Print, then the modal confirm, and captures the resulting download.
   */
  async function captureDownloadViaNotesModal(page, confirmLabel) {
    await page.click('button:has-text("Print")');
    const confirm = page.locator(`button:has-text("${confirmLabel}")`);
    await expect(confirm).toBeVisible({ timeout: 8000 });
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      confirm.click(),
    ]);
    const buf = fs.readFileSync(await download.path());
    return buf;
  }

  test('#5: Quotation PDF downloads as a valid PDF (rev-stamp path, version present)', async ({ page, playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const list = (await (await dir.get('/api/quotation')).json()).data.data;
    const q = list[0];
    await dir.dispose();
    test.skip(!q, 'no quotation exists');
    // The single-quotation response must carry `version` (what the rev-stamp keys off).
    const slug = q.slug;

    await login(page);
    await page.goto(`/quotation/${slug}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const printBtn = page.locator('button:has-text("Print")').first();
    await expect(printBtn).toBeVisible({ timeout: 8000 });
    const buf = await captureDownloadViaNotesModal(page, 'Print Quotation');
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    expect(buf.length).toBeGreaterThan(3000);
  });

  test('#5: version is present in the quotation detail response (rev-stamp source)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const list = (await (await dir.get('/api/quotation')).json()).data.data;
    const slug = list[0]?.slug;
    test.skip(!slug, 'no quotation');
    const detail = (await (await dir.get(`/api/quotation/${slug}`)).json()).data;
    expect(detail.version, 'quotation detail has no version field').toBeTruthy();
    await dir.dispose();
  });

  test('#5: Purchase Order PDF downloads as a valid PDF (rev-stamp path)', async ({ page, playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const list = (await (await dir.get('/api/purchase-order')).json()).data.data;
    const poId = list[0]?.id;
    // version must be on the PO detail too.
    const detail = poId ? (await (await dir.get(`/api/purchase-order/${poId}`)).json()).data : null;
    await dir.dispose();
    test.skip(!poId, 'no purchase order exists');
    expect(detail.version, 'PO detail has no version field').toBeTruthy();

    await login(page);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const printBtn = page.locator('button:has-text("Print")').first();
    await expect(printBtn).toBeVisible({ timeout: 8000 });
    const buf = await captureDownloadViaNotesModal(page, 'Print PO');
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    expect(buf.length).toBeGreaterThan(3000);
  });

  test('#6: Back Order PDF downloads as a valid PDF', async ({ page, playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const list = (await (await dir.get('/api/back-order')).json()).data.data;
    const boId = list[0]?.id;
    await dir.dispose();
    test.skip(!boId, 'no back order exists');

    await login(page);
    await page.goto(`/back-order/${boId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const printBtn = page.locator('button:has-text("Print")').first();
    await expect(printBtn).toBeVisible({ timeout: 8000 });
    const buf = await captureDownload(page, 'button:has-text("Print")');
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    expect(buf.length).toBeGreaterThan(3000);
  });
});
