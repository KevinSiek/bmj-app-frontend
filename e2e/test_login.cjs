const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://127.0.0.1:5173/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    
    // intercept the response
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    console.log('Login Status:', response.status());
    const body = await response.json();
    console.log('Login Body:', body);
    
    await page.waitForURL('**/menu', { timeout: 10000 });
    console.log('Navigated successfully to menu');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
