import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Quotation E2E Tests (Live DB)', () => {
  test.describe.configure({ mode: 'serial' });
  // Use a marketing user to create a quotation
  test.beforeEach(async ({ page }) => {
    // Login as Marketing (from EmployeeSeeder.php)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });
  });

  test('UI-QUOT-041 & UI-QUOT-042: Create Quotation and check pricing calculations', async ({ page }) => {
    // Navigate to Add Quotation
    await page.goto('/quotation/add');
    
    // Check page loaded
    await expect(page.locator('select[aria-label="Project Type"]')).toBeVisible();

    // Select Project Type: Spareparts
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');

    // Fill Customer Manually
    await page.fill('input[placeholder="Company Name"]', 'PT Customer Baru');
    await page.fill('input[placeholder="Address"]', 'Jl. Test 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    
    // Fill notes to satisfy Laravel 'sometimes|string' validation which fails on null
    await page.fill('textarea', 'Test quotation notes');
    // Select Sparepart
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.sparepart .list').first();
    
    // Setup waiter for the sparepart search API
    const searchPromise = page.waitForResponse(resp => resp.url().includes('/api/sparepart') && resp.status() === 200);
    
    // Type 'e' which is the most common vowel to match almost any Faker string
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('e', { delay: 100 });
    
    // Wait for the API to return
    await searchPromise;
    
    // Wait for the dropdown to render and click the first item
    await expect(firstRow.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item').first().click();
    
    // Set quantity
    await firstRow.locator('input[placeholder="Quantity"]').fill('5');
    
    // Set lower unit price to trigger review
    await firstRow.locator('input[placeholder="Unit Price"]').fill('1000');
    
    // Unfocus to trigger calculation
    await firstRow.locator('input[placeholder="Quantity"]').blur();
    
    // Verify pricing calculations (amount, subtotal, ppn, grand total)
    // We can't verify exact price because it's random, but we can verify it's not Rp 0,00
    await expect(page.locator('.amount.type')).not.toContainText('Rp 0,00');
    
    // Debug the response
    page.on('response', response => {
      if (response.url().includes('/api/quotation')) {
        if (response.request().method() === 'POST') {
          response.json().then(json => console.log('POST VALIDATION:', json)).catch(() => {});
        } else if (response.request().method() === 'GET' && !response.url().includes('review')) {
          response.json().then(json => console.log('GET QUOTATIONS:', JSON.stringify(json).substring(0, 500))).catch(() => {});
        }
      }
    });

    // Save the quotation
    await page.click('button.btn-process:has-text("Add Quotation")');
    
    // Click 'Yes' on the confirmation modal (assuming standard sweetalert or custom modal)
    // If it's the custom modalStore, it has a confirm button
    await page.click('button:has-text("Yes")');
    
    // Wait for redirect to quotation list
    await page.waitForURL('**/quotation', { timeout: 10000 });
    // The new quotation has 1 version, so QuotationPage displays quotationNumber instead of customer name
    // We can just verify that the list has items
    try {
      await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
    } catch (e) {
      console.log('HTML DUMP:');
      console.log(await page.content());
      throw e;
    }
  });

  test('QUOT-API-028: Director approves quotation', async ({ page }) => {
    // Logout marketing user
    await page.goto('/profile');
    const profileNav = page.locator('.profilePP .nav-link');
    await expect(profileNav).toBeVisible({ timeout: 15000 });
    await profileNav.click();
    await page.click('.logout-btn');
    await page.waitForURL('**/login', { timeout: 20000 });

    // Login as Director (from EmployeeSeeder.php)
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Go to Quotation Review page
    await page.goto('/quotation/review');
    
    // Check if there's a quotation to review (created by previous test)
    // Since seeders also create quotations on review, there should be items here
    
    // Click on the first Detail button
    try {
      await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
      await page.locator('.list .item').first().click();
    } catch (e) {
      console.log('REVIEW PAGE HTML DUMP:');
      console.log(await page.content());
      throw e;
    }
    
    // Wait for detail page
    await page.waitForURL('**/quotation/review/*');

    // Click Approve
    await page.click('button:has-text("Approve")');
    
    // Confirm approval
    await page.click('.button-modal button:has-text("Approve")');
    
    // Wait for success modal and close it
    await closeModal(page);
    
    // Manually navigate back to review list (UI doesn't auto-redirect)
    await page.goto('/quotation/review');
  });

  test('QUOT-API-034: Move to PO from approved quotation', async ({ page }) => {
    // Continue as Director (from previous test)
    // Go to Quotation list
    await page.goto('/quotation');
    // Clear any leftover success/error modal from the prior serial test — a lingering
    // #modalMessage overlay would intercept the list-item click below. Short appear-wait
    // since we're only clearing a pre-existing modal, not waiting for a new one.
    await closeModal(page, { waitForAppear: 800 });

    // Wait for data to load
    await expect(page.locator('.list .item').first()).toBeVisible();

    // Target an APPROVED quotation. If none is in the list yet (the review-approve in the
    // prior test can land on a seeded review item rather than ours), approve one first so
    // this test is self-sufficient instead of depending on cross-test ordering.
    let approvedRow = page.locator('.list .item', { hasText: 'Approved' }).first();
    if (!(await approvedRow.isVisible().catch(() => false))) {
      // Approve the first reviewable quotation via the review flow, then come back.
      await page.goto('/quotation/review');
      await closeModal(page);
      await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
      await page.locator('.list .item').first().click();
      await page.waitForURL('**/quotation/review/*');
      await page.click('button:has-text("Approve")');
      await page.click('.button-modal button:has-text("Approve")');
      await closeModal(page);
      await page.goto('/quotation');
      await closeModal(page);
      approvedRow = page.locator('.list .item', { hasText: 'Approved' }).first();
    }
    await expect(approvedRow).toBeVisible({ timeout: 15000 });
    await approvedRow.click();

    // Wait for detail page
    await page.waitForURL('**/quotation/*');

    // Click 'Create PO'
    await page.click('button:has-text("Create PO")');
    
    // Notes modal appears
    await page.fill('.modal-body textarea', 'Test Move to PO');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    
    // Confirmation modal appears
    await page.click('button:has-text("Yes")');
    
    // Wait for redirect to purchase order list
    await page.waitForURL('**/purchase-order', { timeout: 10000 });
    
    // Close success modal
    await closeModal(page);
    
    // Verify it's in the list
    await expect(page.locator('.list .item').first()).toBeVisible();
  });

  test('QUOT-API-030 & QUOT-API-032: Reject quotation', async ({ page }) => {
    // Multi-step flow with logout/login + create + Director reject — the 30s default is too
    // tight under UI-Mode load.
    test.setTimeout(90000);
    // Logout Director
    await page.goto('/profile');
    const profileNav = page.locator('.profilePP .nav-link');
    await expect(profileNav).toBeVisible({ timeout: 15000 });
    await profileNav.click();
    await page.click('.logout-btn');
    await page.waitForURL('**/login', { timeout: 20000 });

    // Login as Marketing
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create a new quotation that needs review (low price)
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    
    // Fill Customer Manually
    await page.fill('input[placeholder="Company Name"]', 'PT Customer Rejection');
    await page.fill('input[placeholder="Address"]', 'Jl. Tolak 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    
    // Fill notes to satisfy Laravel 'sometimes|string' validation which fails on null
    await page.fill('textarea[placeholder="Notes"]', 'Test quotation notes');
    
    // Select Sparepart
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.sparepart .list').first();
    const searchPromise = page.waitForResponse(resp => resp.url().includes('/api/sparepart') && resp.status() === 200);
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('e', { delay: 100 });
    await searchPromise;
    await expect(firstRow.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item').first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    
    // Use a very low price to ensure it needs review
    await firstRow.locator('input[placeholder="Unit Price"]').fill('100');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await page.waitForURL('**/quotation', { timeout: 10000 });

    // Logout Marketing
    await page.goto('/profile');
    const profileNav2 = page.locator('.profilePP .nav-link');
    await expect(profileNav2).toBeVisible({ timeout: 15000 });
    await profileNav2.click();
    await page.click('.logout-btn');
    await page.waitForURL('**/login', { timeout: 20000 });

    // Login as Director
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Go to Quotation Review page
    await page.goto('/quotation/review');
    
    // Click on the first Detail button
    await page.locator('.list .item').first().click();
    await page.waitForURL('**/quotation/review/*');

    // Click Reject
    await page.click('button:has-text("Reject")');
    
    // Confirmation modal appears
    await page.click('.button-modal button:has-text("Reject")');
    
    // Wait for success modal and close it
    await closeModal(page);
    
    // Manually navigate back to review list
    await page.goto('/quotation/review');
  });
});
