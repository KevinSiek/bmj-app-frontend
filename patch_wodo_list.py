import re

path = 'e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

debug_log = """    // Debug: Log the quotation list response to see why PT DO Test is missing
    const listResponse = await page.waitForResponse(res => res.url().includes('/api/quotation') && res.request().method() === 'GET');
    const listBody = await listResponse.json();
    console.log('Quotation List API Data:', JSON.stringify(listBody.data?.data?.map(q => ({ num: q.quotation_number, cust: q.customer.company_name, branch: q.branch })) || listBody, null, 2));
"""

target = "    await page.waitForSelector('.list .item', { state: 'visible', timeout: 15000 });"
if target in content and "Debug: Log the quotation list" not in content:
    content = content.replace(target, target + "\n" + debug_log)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched list debug.")
