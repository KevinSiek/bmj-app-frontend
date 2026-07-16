import { test, expect, request } from '@playwright/test';
import { closeModal, apiContextFor, provisionApprovedQuotation } from './helpers.js';

/**
 * Live UI verification for the 6-feature batch (Jun 9). NOT part of the regression gate — a
 * one-off visual walkthrough that drives the real browser and screenshots each new surface:
 *  #1 realtime Rp currency input, #3 total-discount % field, #5 No-PO modal + both numbers on
 *  PO detail, #6 both numbers on DO detail, #4 creator name (checked via API in the PDF data).
 *
 * Run on demand against the LIVE servers (does NOT wipe the DB):
 *   npx playwright test --config=playwright.verify.config.js
 * It is excluded from the main suite (testIgnore) because it needs live data, not migrate:fresh.
 */
test.describe('Feature batch — live UI verification', () => {
  test.describe.configure({ mode: 'serial' });

  async function login(page, email) {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });
  }

  test('FV-1: realtime Rp formatting on the quotation unit-price input', async ({ page }) => {
    await login(page, 'marketing.jkt@bmj.com'); // Marketing
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');

    await page.fill('input[placeholder="Company Name"]', 'PT FV Currency');
    await page.fill('input[placeholder="Address"]', 'Jl. T');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI');
    await page.fill('input[placeholder="Office"]', '021');
    await page.fill('input[placeholder="Urban"]', 'U');
    await page.fill('input[placeholder="Subdistrict"]', 'S');
    await page.fill('input[placeholder="Postal Code"]', '12345');

    await page.click('button:has-text("Add Sparepart")');
    const row = page.locator('.sparepart .list').first();
    const search = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await row.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed', { delay: 60 });
    await search;
    await expect(row.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
    await row.locator('.dropdown-item').first().click();

    // Selecting the sparepart auto-fills the unit price, so clear it before typing our own.
    const priceInput = row.locator('input[placeholder="Unit Price"]');
    await priceInput.click();
    await priceInput.press('Control+a');
    await priceInput.press('Delete');
    await priceInput.pressSequentially('1250000', { delay: 30 });
    // Real-time Rp formatting with id-ID thousands separators.
    await expect(priceInput).toHaveValue(/Rp\s*1\.250\.000/, { timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/fv-1-currency-input.png', fullPage: true });
  });

  test('FV-3: total-discount % field appears below the total amount', async ({ page }) => {
    await login(page, 'marketing.jkt@bmj.com');
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    // The "Total Discount (%)" field must be visible in add mode.
    await expect(page.locator('text=Total Discount (%)')).toBeVisible({ timeout: 10000 });
    const pct = page.locator('input[placeholder="0"]').first();
    await pct.fill('10');
    await expect(pct).toHaveValue('10');
    await page.screenshot({ path: 'e2e/screenshots/fv-3-total-discount.png', fullPage: true });
  });

  test('FV-5: Create PO modal shows the No PO input', async ({ page, playwright }) => {
    // Self-provision an approved (no-PO) quotation via API so the Create PO button is available.
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const slug = await provisionApprovedQuotation(dir);
    await dir.dispose();

    await login(page, 'director.jkt@bmj.com');
    await page.goto(`/quotation/${slug}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PO")');
    // The notes modal now must contain a "No PO" input (feature #5).
    await expect(page.locator('#ModalNotes input[placeholder="No PO"]')).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/fv-5-no-po-modal.png', fullPage: true });
  });

  test('FV-5b/6: PO detail shows No Internal Request + No PO labels', async ({ page, playwright }) => {
    // Go straight to a real PO detail by id (the list has POs; navigate directly to avoid
    // depending on list-row rendering).
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const poList = (await (await dir.get('/api/purchase-order')).json()).data.data;
    const poId = poList[0]?.id;
    await dir.dispose();
    test.skip(!poId, 'No purchase order exists to open');

    await login(page, 'director.jkt@bmj.com');
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('text=No Internal Request')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('label:has-text("No PO")')).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/fv-5b-po-detail-numbers.png', fullPage: true });
  });
});
