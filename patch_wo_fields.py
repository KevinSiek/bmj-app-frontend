"""
patch_wo_fields.py
Applies targeted patches to e2e/wo-do.spec.js AFTER patch_all.cjs has run.
Fixes:
  1. Missing NPWP/Email fields in customer form (both WO-SETUP and DO-SETUP)
  2. Missing Job field in service quotation detail
  3. WO Done transition: fills mandatory fields (dates, worker, notes)
  4. API error logging via page.on('response')
  5. DO-SETUP dropdown visibility (click before type, global dropdown selector)
  6. Removes orphaned Branch/Compiled/Approved/Worker/AddUnit lines
  7. DO-SETUP: after creating quotation, navigate explicitly to /quotation list
     and dismiss any lingering modal before clicking the first item.
"""

import re

path = 'e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# â”€â”€ 0. Remove orphaned lines that no longer match the UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
for pattern in [
    r"^\s*await page\.selectOption\('select\[aria-label=\"Branch\"\]'.*\);\s*\n",
    r"^\s*await page\.fill\('input\[placeholder=\"Compiled by\"\]'.*\);\s*\n",
    r"^\s*await page\.fill\('input\[placeholder=\"Approved by\"\]'.*\);\s*\n",
    r"^\s*await page\.fill\('input\[placeholder=\"Work Performed by\"\]', 'Mike'\);\s*\n",
    r"^\s*await page\.click\('button:has-text\(\"Add Unit\"\)'\);\s*\n",
]:
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

# â”€â”€ 1. Add NPWP/Email after Postal Code (both WO-SETUP and DO-SETUP) â”€â”€â”€â”€â”€â”€â”€â”€â”€
content = content.replace(
    "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\n",
    "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\n"
    "    await page.fill('input[placeholder=\"NPWP\"]', '01.234.567.8-901.234');\n"
    "    await page.fill('input[placeholder=\"Email\"]', 'client@test.com');\n"
)

# â”€â”€ 2. Add Job field after Quantity fill in service quotation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
content = content.replace(
    "    await page.locator('input[placeholder=\"Quantity\"]').first().fill('1');\n",
    "    await page.locator('input[placeholder=\"Quantity\"]').first().fill('1');\n"
    "    await page.locator('input[placeholder=\"Job\"]').first().fill('Install new block');\n"
)

# â”€â”€ 3. WO Done transition: fill mandatory fields before Done button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
content = content.replace(
    "    const doneBtn = page.locator('button:has-text(\"Done\")');\n",
    "    const dateInputs2 = await page.locator('input[type=\"date\"]').all();\n"
    "    for (const input of dateInputs2) {\n"
    "      if (await input.isEnabled()) {\n"
    "         await input.fill('2026-06-02');\n"
    "      }\n"
    "    }\n"
    "    await page.locator('input[placeholder=\"Work Performed by\"]').last().fill('WorkerName');\n"
    "    await page.locator('textarea[placeholder=\"Notes\"]').last().fill('Task finished');\n"
    "    const doneBtn = page.locator('button:has-text(\"Done\")');\n"
)

# â”€â”€ 4. API error logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
content = content.replace(
    "    page = await browser.newPage();\n",
    "    page = await browser.newPage();\n"
    "    page.on('response', async res => {\n"
    "      if (res.status() >= 400 && res.url().includes('/api/')) {\n"
    "        console.log('API ERROR ' + res.status() + ' ' + res.url() + ' BODY:', await res.text().catch(() => 'no body'));\n"
    "      }\n"
    "    });\n"
)

# â”€â”€ 5. DO-SETUP dropdown fixes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
content = content.replace(
    "    await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });\n",
    "    await partNameInput.click();\n"
    "    await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });\n"
)
content = content.replace(
    "    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });\n",
    "    await expect(page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });\n"
)
content = content.replace(
    "    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();\n",
    "    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();\n"
)

# â”€â”€ 6. DO-SETUP: after creating quotation, use explicit navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Replace the DO-SETUP "Move to PO" block: after closeModal, navigate explicitly
# to /quotation, wait for items, dismiss any modal, then click.
old_do_move = (
    "    await closeModal(page);\n"
    "    \n"
    "    // Move to PO\n"
    "    await page.locator('.list .item').first().click();\n"
    "    await page.click('button:has-text(\"Create PO\")');\n"
    "    await page.fill('.modal-body textarea', 'Move to DO setup');\n"
)
new_do_move = (
    "    await closeModal(page);\n"
    "    \n"
    "    // Move to PO â€” navigate explicitly to the quotation list\n"
    "    await page.goto('/quotation');\n"
    "    await page.waitForSelector('.list .item', { state: 'visible', timeout: 15000 });\n"
    "    // Dismiss any lingering success modal that may have reappeared after navigation\n"
    "    await closeModal(page, { waitForAppear: 800 });\n"
    "    await page.locator('.list .item').first().click();\n"
    "    await page.click('button:has-text(\"Create PO\")');\n"
    "    await page.fill('.modal-body textarea', 'Move to DO setup');\n"
)

# This pattern appears twice: once in WO-SETUP and once in DO-SETUP.
# We only want to patch the DO-SETUP occurrence. To distinguish them,
# we include the Notes context that differs ('Setup DO PO' vs 'Setup WO PO').
# The notes line is a few lines earlier, so we match a bigger context block.

do_setup_old = (
    "    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup DO PO');\n"
)

if do_setup_old in content:
    # Find the index of 'Setup DO PO' and then find the old_do_move AFTER it
    idx_do = content.index(do_setup_old)
    # Find old_do_move starting from idx_do
    idx_move = content.find(old_do_move, idx_do)
    if idx_move >= 0:
        content = content[:idx_move] + new_do_move + content[idx_move + len(old_do_move):]
        print("  âœ“ DO-SETUP: patched Move to PO with explicit navigation")
    else:
        print("  âœ— DO-SETUP: could not find old_do_move after 'Setup DO PO'")
else:
    print("  âœ— DO-SETUP: could not find 'Setup DO PO' notes line")

# Also patch the WO-SETUP "Move to PO" similarly â€” add explicit navigation
wo_setup_old = (
    "    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup WO PO');\n"
)
if wo_setup_old in content:
    idx_wo = content.index(wo_setup_old)
    idx_wo_move = content.find(old_do_move.replace('Move to DO setup', 'Move to PO'), idx_wo)
    # For WO-SETUP, the notes text in the PO modal is different
    # Let's check what pattern exists
    wo_old_move = (
        "    await closeModal(page);\n"
        "    \n"
        "    // Move to PO â€” intercept API response to capture new PO ID\n"
        "    await page.locator('.list .item').first().click();\n"
    )
    idx_wo_move = content.find(wo_old_move, idx_wo)
    if idx_wo_move >= 0:
        wo_new_move = (
            "    await closeModal(page);\n"
            "    \n"
            "    // Move to PO â€” navigate explicitly to quotation list\n"
            "    await page.goto('/quotation');\n"
            "    await page.waitForSelector('.list .item', { state: 'visible', timeout: 15000 });\n"
            "    await closeModal(page, { waitForAppear: 800 });\n"
            "    await page.locator('.list .item').first().click();\n"
        )
        content = content[:idx_wo_move] + wo_new_move + content[idx_wo_move + len(wo_old_move):]
        print("  âœ“ WO-SETUP: patched Move to PO with explicit navigation")
    else:
        print("  âœ— WO-SETUP: could not find wo_old_move after 'Setup WO PO'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched via python successfully.")

