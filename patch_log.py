path = 'e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "page.on('response', async res => {"
log_code = """      if (res.status() === 200 && res.url().includes('/api/quotation') && res.request().method() === 'GET') {
        const body = await res.json().catch(() => null);
        if (body && body.data && body.data.data) {
          console.log('QUOTATION LIST:', body.data.data.map(q => ({ num: q.quotation_number, cust: q.customer?.company_name, branch: q.branch })));
        }
      }
"""
if target in content and "QUOTATION LIST:" not in content:
    content = content.replace(target, target + "\n" + log_code)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched.")
