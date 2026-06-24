const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const screenshotDir = path.join(__dirname, 'playwright-screenshots');

const baseHtmlStyle = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-size: 14px;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    
    /* Cover Page Styling */
    .cover {
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 50px;
      border: 8px double #1e3a8a;
      margin: 20px;
      background: #f8fafc;
      box-sizing: border-box;
    }
    .cover-brand {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #1e3a8a;
      margin-bottom: 10px;
    }
    .cover-divider {
      width: 80px;
      height: 4px;
      background: #d97706; /* Gold */
      margin-bottom: 40px;
    }
    .cover-title {
      font-family: 'Outfit', sans-serif;
      font-size: 34px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 20px 0;
    }
    .cover-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 400;
      color: #475569;
      margin-bottom: 50px;
    }
    .cover-meta {
      margin-top: auto;
      font-size: 12px;
      color: #64748b;
      line-height: 1.8;
    }

    /* General Typography */
    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      color: #1e3a8a;
      page-break-after: avoid;
    }
    h1 {
      font-size: 22px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 16px;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    h3 {
      font-size: 14px;
      color: #0f172a;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }

    /* Screenshots */
    .screenshot-container {
      text-align: center;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .screenshot {
      max-width: 90%;
      border: 2px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .screenshot-caption {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
      font-style: italic;
    }

    /* Lists */
    .step-list {
      padding-left: 20px;
      margin-bottom: 20px;
    }
    .step-list li {
      margin-bottom: 8px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Alerts */
    .alert {
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 6px;
      font-size: 13px;
      border-left: 5px solid;
    }
    .alert-info {
      background-color: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
    .alert-warning {
      background-color: #fffbef;
      border-color: #f59e0b;
      color: #78350f;
    }
    .alert-danger {
      background-color: #fef2f2;
      border-color: #ef4444;
      color: #991b1b;
    }
    .alert ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }
    code {
      font-family: monospace;
      background-color: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #0f172a;
    }
  </style>
`;

const manuals = {
  // 1. MARKETING
  marketing: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Marketing</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: MARKETING</h1>
        <h2 class="cover-subtitle">Siklus Penawaran, Pengajuan PO, & Peminjaman Barang</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Buka browser Anda dan navigasikan ke alamat sistem BMJ App. Masukkan email dan password Anda di layar login.</p>
      
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/login-page.png">
        <div class="screenshot-caption">Gambar 1.1: Halaman Login Utama BMJ App</div>
      </div>

      <p>Setelah login sukses, Anda akan dialihkan ke dashboard khusus Marketing. Dari sini Anda dapat mengakses menu Penawaran (*Quotation*), Pesanan Pembelian (*Purchase Order*), Peminjaman (*Borrow*), dan katalog Suku Cadang (*Spareparts*).</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/marketing-dashboard.png">
        <div class="screenshot-caption">Gambar 1.2: Menu Dashboard Peran Marketing</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Manajemen Penawaran Harga (Quotation)</h1>
      <p>Marketing bertanggung jawab penuh dalam pembuatan dan negosiasi awal dokumen Penawaran Harga.</p>
      
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/marketing-quotation-list.png">
        <div class="screenshot-caption">Gambar 2.1: Daftar Penawaran Harga (Quotation List)</div>
      </div>

      <h2>Langkah Membuat Quotation Baru:</h2>
      <ol class="step-list">
        <li>Pilih menu <strong>Quotation</strong>, lalu klik tombol <strong>Add Quotation</strong>.</li>
        <li>Isi data proyek seperti tipe proyek (Service / Spareparts) dan cabang tujuan (Jakarta / Semarang).</li>
        <li>Tulis nama perusahaan pelanggan. Sistem akan memunculkan pilihan jika pelanggan sudah terdaftar, atau Anda dapat melengkapi kolom data alamat baru.</li>
        <li>Masukkan baris suku cadang (*Add Spareparts*) atau baris jasa (*Add Service*). Gunakan Currency Input untuk mengisi harga satuan.</li>
        <li>Gunakan diskon total (%) jika ingin memberikan diskon keseluruhan. **Ingat: Setiap nilai diskon total > 0% akan memaksa dokumen disetujui manual oleh Director**.</li>
        <li>Simpan dan konfirmasi penawaran.</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/marketing-quotation-add.png">
        <div class="screenshot-caption">Gambar 2.2: Formulir Pembuatan Quotation Baru</div>
      </div>

      <h3>Hasil Cetak Penawaran Harga (Quotation PDF)</h3>
      <p>Berikut adalah tampilan dokumen cetak Penawaran Harga yang siap dikirimkan kepada pelanggan:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-quotation.png">
        <div class="screenshot-caption">Gambar 2.3: Hasil Cetak Penawaran Harga (Quotation PDF)</div>
      </div>

      <h2>Alur Pengembalian Barang (Return Workflow):</h2>
      <p>Karyawan Marketing dapat mengajukan pengembalian barang (*Return*) untuk PO yang telah selesai (*Done*):</p>
      <ol class="step-list">
        <li>Masuk ke menu <strong>Purchase Order (PO)</strong>, lalu buka detail PO berstatus <strong>Done</strong>.</li>
        <li>Klik tombol <strong>Return</strong> untuk membuka formulir pengembalian barang.</li>
        <li>Masukkan kuantitas suku cadang yang dikembalikan secara valid (harus lebih besar dari 0 dan tidak boleh melebihi jumlah pembelian awal).</li>
        <li>Simpan pengajuan. Status pengembalian akan berada pada antrean review. Pengembalian stok ke gudang secara resmi baru terlaksana setelah disetujui oleh Director.</li>
      </ol>
      <div class="page-break"></div>

      <h1>3. Siklus Peminjaman Suku Cadang (Borrow)</h1>
      <p>Digunakan saat sparepart harus dipinjam terlebih dahulu untuk pengerjaan servis (Work Order) sebelum ditagihkan secara resmi.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/marketing-borrow-list.png">
        <div class="screenshot-caption">Gambar 3.1: Halaman Daftar Peminjaman Suku Cadang (Borrow List)</div>
      </div>

      <h2>Langkah Mengajukan Peminjaman:</h2>
      <ol class="step-list">
        <li>Klik menu <strong>Borrow</strong>, lalu klik <strong>Add Borrow</strong>.</li>
        <li>Pilih <strong>Service PO</strong> yang valid. Sistem akan otomatis memunculkan detail PO dan nomor Work Order-nya.</li>
        <li>Pilih sparepart yang akan dipinjam beserta kuantitasnya.</li>
        <li>Isi catatan permohonan lalu simpan.</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/marketing-borrow-add.png">
        <div class="screenshot-caption">Gambar 3.2: Formulir Pengajuan Pinjaman Baru</div>
      </div>

      <div class="alert alert-danger">
        <strong>Aturan Retur & Pengembalian:</strong>
        <p>Pada saat penyerahan barang kembali, Marketing wajib merekrut kuantitas barang yang dikembalikan. Jika barang digunakan/hilang (selisih lebih dari 0), Anda **wajib mengaitkan PO Spareparts baru** yang mencakup barang terpakai tersebut sebelum peminjaman disetujui selesai (*Done*).</p>
      </div>

      <h3>Hasil Cetak Surat Peminjaman Barang (Borrow PDF)</h3>
      <p>Berikut adalah tampilan cetak formulir Peminjaman Barang gudang yang ditandatangani untuk penyerahan barang ke teknisi:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-borrow.png">
        <div class="screenshot-caption">Gambar 3.3: Hasil Cetak Surat Peminjaman Suku Cadang (Borrow PDF)</div>
      </div>
    </body>
    </html>
  `,

  // 2. FINANCE
  finance: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Finance</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: FINANCE</h1>
        <h2 class="cover-subtitle">Pengelolaan Proforma Invoice, Pembayaran, & Invoice Final</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Masuk menggunakan akun kredensial Finance Anda di halaman login.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-dashboard.png">
        <div class="screenshot-caption">Gambar 1.1: Dashboard Peran Finance</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Mengelola Pesanan Pembelian & Pembuatan PI</h1>
      <p>Finance memantau daftar PO yang masuk untuk diproses tagihannya.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-po-list.png">
        <div class="screenshot-caption">Gambar 2.1: Daftar PO Siap Tagih (PO List)</div>
      </div>

      <p>Klik pada baris PO untuk membuka rincian PO dan menekan tombol <strong>Create PI</strong>.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-po-detail.png">
        <div class="screenshot-caption">Gambar 2.2: Rincian PO (PO Detail) & Tombol Create PI</div>
      </div>

      <h2>Langkah Memproses Proforma Invoice (PI):</h2>
      <ol class="step-list">
        <li>Pilih PO yang berstatus <strong>Prepare</strong> dari daftar PO.</li>
        <li>Klik tombol <strong>Create PI</strong> pada halaman detail PO tersebut.</li>
        <li>Isi catatan (Notes) pada modal konfirmasi, lalu klik "Create PI" untuk menyimpan.</li>
        <li>Sistem akan otomatis membentuk dokumen Proforma Invoice (PI) baru.</li>
        <li>Tentukan persentase DP dengan mengedit PI tersebut (misal: 50% dari total nilai kontrak).</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-pi-list.png">
        <div class="screenshot-caption">Gambar 2.3: Daftar Proforma Invoice (PI List)</div>
      </div>

      <h3>Hasil Cetak Pesanan Pembelian (PO PDF)</h3>
      <p>Berikut adalah contoh cetak lembar request Pesanan Pembelian (PO) internal yang digunakan perusahaan:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-purchase-order.png">
        <div class="screenshot-caption">Gambar 2.4: Hasil Cetak Pesanan Pembelian (Purchase Order PDF)</div>
      </div>
      <div class="page-break"></div>

      <h1>3. Pencatatan Pembayaran & Menerbitkan Invoice</h1>
      <p>Setelah uang pembayaran diterima di bank, Anda wajib menandai status pembayaran di sistem:</p>
      
      <h2>Langkah Pembayaran DP (Down Payment):</h2>
      <ol class="step-list">
        <li>Buka detail PI yang bersangkutan dari daftar PI.</li>
        <li>Klik tombol <strong>DP Paid</strong> dan konfirmasi <strong>Yes</strong>. Status PO terkait otomatis berubah menjadi <strong>DP Paid</strong> dan gudang dapat merilis barang/memulai pengerjaan.</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-pi-detail.png">
        <div class="screenshot-caption">Gambar 3.1: Detail Proforma Invoice & Tombol Verifikasi Pembayaran</div>
      </div>

      <h3>Hasil Cetak Faktur Proforma (PI PDF)</h3>
      <p>Berikut adalah tampilan cetak Proforma Invoice yang diserahkan ke pelanggan untuk penagihan uang muka (DP):</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-proforma-invoice.png">
        <div class="screenshot-caption">Gambar 3.2: Hasil Cetak Faktur Proforma (Proforma Invoice PDF)</div>
      </div>

      <h2>Langkah Pembayaran Lunas & Menerbitkan Invoice:</h2>
      <ol class="step-list">
        <li>Jika barang telah dikirim atau servis selesai dikerjakan, buka PI terkait dan klik <strong>Full Paid</strong>.</li>
        <li>Klik tombol <strong>Create Invoice</strong> untuk menghasilkan faktur tagihan final.</li>
        <li>Isi kolom <strong>Term of Payment</strong> (Syarat Pembayaran, contoh: "30 Days") dan catatan pendukung.</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-invoice-list.png">
        <div class="screenshot-caption">Gambar 3.3: Halaman Daftar Invoice Final (Invoice List)</div>
      </div>

      <p>Klik pada salah satu baris Invoice untuk melihat rincian Invoice Final.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/finance-invoice-detail.png">
        <div class="screenshot-caption">Gambar 3.4: Detail Invoice Final (Read-Only)</div>
      </div>

      <h3>Hasil Cetak Faktur Akhir (Invoice PDF)</h3>
      <p>Berikut adalah tampilan cetak Invoice Final resmi yang ditujukan kepada pelanggan untuk pelunasan tagihan:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-invoice.png">
        <div class="screenshot-caption">Gambar 3.5: Hasil Cetak Faktur Akhir (Invoice PDF)</div>
      </div>

      <div class="alert alert-info">
        <strong>PENTING:</strong> Invoice final bersifat **Read-Only** (tidak bisa diedit/dihapus) demi menjaga kepatuhan audit finansial perusahaan.
      </div>
    </body>
    </html>
  `,

  // 3. INVENTORY ADMIN
  inventoryAdmin: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Inventory Admin</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: INVENTORY ADMIN</h1>
        <h2 class="cover-subtitle">Manajemen Pengiriman Barang, Mutasi Stok, & Logistik Gudang</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Gunakan akun gudang Anda untuk masuk ke sistem.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-dashboard.png">
        <div class="screenshot-caption">Gambar 1.1: Dashboard Peran Inventory Admin</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Pengiriman Barang (Delivery Order)</h1>
      <p>Ketika PO bertipe Spareparts dirilis, Inventory Admin memproses pengirimannya.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-do-list.png">
        <div class="screenshot-caption">Gambar 2.1: Daftar Surat Jalan Pengiriman (DO List)</div>
      </div>

      <h2>Langkah Pengiriman Barang (DO):</h2>
      <ol class="step-list">
        <li>Masuk ke halaman PO yang berstatus rilis.</li>
        <li>Isi formulir DO (Moda Pengiriman, Tipe Pengiriman, Nama Kurir, dsb).</li>
        <li>Simpan DO. Status akan berada dalam antrean **Process**.</li>
        <li>Ketika barang sampai secara fisik di pelanggan, buka DO tersebut dan klik **Process DO** untuk menandai status selesai (**Done**).</li>
      </ol>

      <h3>Dua Format Cetak PDF pada Detail DO:</h3>
      <p>Halaman detail DO menyediakan dua tombol cetak yang menghasilkan dokumen berbeda dari template yang sama:</p>
      <ul>
        <li><strong>Print Delivery Order</strong>: Menghasilkan PDF berlabel formal "Delivery Order" sebagai tanda bukti serah terima resmi ber-tanda tangan untuk pelanggan.</li>
        <li><strong>Print Delivery Note</strong>: Menghasilkan dokumen "Delivery Note" (Surat Jalan) yang diserahkan kepada kurir atau pihak ekspedisi untuk keperluan perjalanan logistik.</li>
      </ul>

      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-order.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 2.2: Hasil Cetak Surat Penyerahan Barang (Delivery Order PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-note.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 2.3: Hasil Cetak Surat Jalan Perjalanan (Delivery Note PDF)</div>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>3. Mutasi Barang (Movement) & Riwayat Stok</h1>
      <p>Gunakan fitur mutasi untuk mengirim stok suku cadang dari cabang asal ke cabang tujuan.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-movement-list.png">
        <div class="screenshot-caption">Gambar 3.1: Halaman Mutasi Suku Cadang (Movement List)</div>
      </div>

      <p>Daftar Riwayat Stok (*Stock History*) adalah audit log hanya baca yang melacak semua pengurangan dan penambahan barang gudang secara transparan.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-stock-history.png">
        <div class="screenshot-caption">Gambar 3.2: Riwayat Audit Log Pergerakan Stok Suku Cadang</div>
      </div>
    </body>
    </html>
  `,

  // 4. INVENTORY PURCHASE
  inventoryPurchase: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Inventory Purchase</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: INVENTORY PURCHASE</h1>
        <h2 class="cover-subtitle">Prosedur Pengadaan Barang Gudang & Pembelian (Buy)</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Masuk ke sistem dengan akun pengadaan (Purchase) Anda.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryPurchase-dashboard.png">
        <div class="screenshot-caption">Gambar 1.1: Dashboard Peran Inventory Purchase</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Membuat Pengadaan Pembelian (Buy/Purchase)</h1>
      <p>Saat terjadi kekurangan stok barang akibat Back Order, Anda wajib membeli barang ke supplier eksternal.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryPurchase-purchase-list.png">
        <div class="screenshot-caption">Gambar 2.1: Daftar Dokumen Pembelian Supplier (Purchase/Buy List)</div>
      </div>

      <h2>Langkah Membuat Dokumen Pembelian (Buy):</h2>
      <ol class="step-list">
        <li>Klik menu <strong>Purchase</strong>, lalu klik <strong>Add Purchase</strong>.</li>
        <li>Pilih <strong>Supplier (Seller)</strong> dan tentukan cabang target penerima barang.</li>
        <li>Masukkan sparepart yang ingin dibeli, jumlah, dan harga beli supplier.</li>
        <li>Simpan dokumen. Status awal adalah **Wait for Review** dan akan diajukan ke Director.</li>
        <li>Ketika barang tiba di gudang, klik tombol **Done** pada pembelian yang disetujui untuk menaikkan stok fisik cabang secara otomatis.</li>
      </ol>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/inventoryPurchase-purchase-add.png">
        <div class="screenshot-caption">Gambar 2.2: Formulir Pembuatan Dokumen Pembelian Gudang</div>
      </div>
    </body>
    </html>
  `,

  // 5. SERVICE
  service: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Service</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: SERVICE</h1>
        <h2 class="cover-subtitle">Pencatatan Penugasan Pekerjaan Servis (Work Order)</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Masuk menggunakan akun operasional teknisi (Service) Anda.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/service-dashboard.png">
        <div class="screenshot-caption">Gambar 1.1: Dashboard Peran Service</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Menjalankan Perintah Kerja (Work Order / WO)</h1>
      <p>Work Order dibentuk otomatis ketika PO bertipe Service dirilis oleh administrasi gudang.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/service-work-order-list.png">
        <div class="screenshot-caption">Gambar 2.1: Halaman Daftar Perintah Kerja (Work Order List)</div>
      </div>

      <h2>Langkah Operasional Teknisi (WO):</h2>
      <ol class="step-list">
        <li>Buka daftar Work Order, pilih WO berstatus **Wait On Progress**.</li>
        <li>Klik **Process** untuk menandakan pekerjaan mulai dikerjakan. Status akan berpindah ke **Progress**.</li>
        <li>Setelah pekerjaan fisik di lapangan selesai dan unit berhasil diservis, isi data tanggal selesai, nama teknisi pelaksana, dan lingkup pekerjaan (*Scope of Work*).</li>
        <li>Klik tombol **Done** untuk menyelesaikan Work Order.</li>
      </ol>

      <h3>Hasil Cetak Lembar Perintah Kerja Teknisi (Work Order PDF)</h3>
      <p>Berikut adalah tampilan cetak surat penugasan kerja teknisi resmi untuk perbaikan di lapangan:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/print-work-order.png">
        <div class="screenshot-caption">Gambar 2.2: Hasil Cetak Lembar Perintah Kerja Teknisi (Work Order PDF)</div>
      </div>

      <div class="alert alert-info">
        <strong>Penyelesaian PO Servis:</strong> Menandai Work Order sebagai **Done** akan otomatis memicu status PO terkait menjadi **Done** dan memperbarui lini masa pelacakan dokumen.
      </div>
    </body>
    </html>
  `,

  // 6. DIRECTOR
  director: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Director</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: DIRECTOR</h1>
        <h2 class="cover-subtitle">Persetujuan Harga Penawaran, Analitik Bisnis, & Manajemen Pegawai</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Sebagai akun Administrator Utama (Director), Anda memiliki akses penuh ke seluruh modul sistem. Silakan login dengan email dan password Director Anda.</p>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/director-dashboard.png">
        <div class="screenshot-caption">Gambar 1.1: Menu Utama Akun Director</div>
      </div>
      <div class="page-break"></div>

      <h1>2. Grafik Analitik & Kinerja Keuangan</h1>
      <p>Director dibekali dengan modul analisis bisnis untuk memantau performa perusahaan secara real-time:</p>
      <ul>
        <li><strong>Grafik Omzet Bulanan:</strong> Menampilkan total penjualan per bulan.</li>
        <li><strong>Proporsi Proyek Cabang:</strong> Membandingkan kontribusi proyek antara cabang Jakarta dan Semarang.</li>
        <li><strong>Kartu Ringkasan Penjualan:</strong> Informasi ringkas mengenai total Quotation, PO, dan Invoice yang berhasil diproses.</li>
      </ul>

      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/director-dashboard-analytics.png">
        <div class="screenshot-caption">Gambar 2.1: Dasbor Analitik & Grafik Kinerja Perusahaan</div>
      </div>
      <div class="page-break"></div>

      <h1>3. Siklus Transaksi 1: Alur Lancar (Smooth Scenario)</h1>
      <p>Skenario ini melacak siklus normal dari pembuatan penawaran hingga barang terkirim atau jasa selesai tanpa ada hambatan stok maupun revisi harga.</p>
      <div class="alert alert-info">
        <strong>Urutan Status Siklus Lancar:</strong><br>
        Quotation (Sparepart/Service) &rarr; Approved &rarr; Purchase Order (PO) &rarr; Back Order (BO) Siap &rarr; Sparepart Ready &rarr; Proforma Invoice (PI) &rarr; Invoice Final &rarr; Delivery Order (DO) / Work Order (WO).
      </div>
      <h3>Langkah-langkah Operasional Siklus Lancar:</h3>
      <ol class="step-list">
        <li><strong>Quotation Dibuat & Disetujui:</strong> Marketing membuat Quotation baru. Jika diskon total 0%, sistem otomatis menyetujui dokumen (status <strong>Approved</strong>).</li>
        <li><strong>Konversi ke PO:</strong> Dari detail Quotation, klik tombol <strong>Create PO</strong> dengan mengisi catatan transisi dan nomor PO eksternal. Status berubah menjadi <strong>Prepare</strong>.</li>
        <li><strong>Evaluasi Stok (BO):</strong> Jika seluruh suku cadang yang dipesan memiliki stok yang cukup di gudang cabang terkait, sistem menandai PO sebagai <strong>BO (Back Order)</strong> dengan detail "all sparepart ready".</li>
        <li><strong>Sparepart Ready:</strong> Klik tombol <strong>Sparepart Ready</strong> di halaman PO. Status PO berubah menjadi <strong>Ready</strong>.</li>
        <li><strong>Pembuatan PI & Billing:</strong> Finance membuat Proforma Invoice (PI) dari PO. Finance menentukan persentase DP, lalu mencatat pembayaran (<strong>DP Paid</strong>). Status PO berubah menjadi <strong>DP Paid</strong>.</li>
        <li><strong>Rilis & Pengiriman (DO / WO):</strong>
          <ul>
            <li>Untuk proyek <em>Spareparts</em>: Inventory Admin merilis PO menjadi dokumen Delivery Order (DO). Kurir mengirim barang dan setelah sampai, DO ditandai <strong>Done</strong>.</li>
            <li>Untuk proyek <em>Service</em>: PO dirilis menjadi dokumen Work Order (WO). Teknisi mengerjakan jasa servis dan setelah selesai, WO ditandai <strong>Done</strong>.</li>
          </ul>
        </li>
        <li><strong>Pelunasan & Invoice Final:</strong> Setelah pengiriman/servis selesai, pelanggan melunasi sisa tagihan. Finance mencatat status PI sebagai <strong>Full Paid</strong> dan mencetak <strong>Invoice Final</strong> (Read-Only). Status PO berubah menjadi <strong>Done</strong>.</li>
      </ol>
      <div class="page-break"></div>

      <h1>4. Siklus Transaksi 2: Alur Tidak Lancar (No Smooth Scenarios)</h1>
      <p>Di dunia nyata, transaksi sering mengalami hambatan seperti review diskon, revisi penawaran, penolakan, stok gudang kurang, atau kebutuhan pengembalian barang (*Return*).</p>

      <h2>Skenario 2.1: Quotation Need Review (Persetujuan Diskon)</h2>
      <p>Terjadi ketika Marketing memberikan diskon total melebihi batas default. Sistem secara otomatis menangguhkan persetujuan dan mengubah status Quotation menjadi <strong>Need Review</strong>. Director masuk ke menu <strong>Quotation Review</strong>, memeriksa detail dan alasan diskon, lalu mengklik <strong>Approve</strong>. Setelah disetujui, Quotation berstatus <strong>Approved</strong> dan dapat diproses oleh Marketing ke tahap PO, PI, pelunasan, hingga serah terima barang (DO/WO) selesai.</p>

      <h2>Skenario 2.2: Quotation Need Change (Revisi 1 Kali & Naik Versi V2)</h2>
      <p>Jika Director tidak menyetujui harga atau diskon pada penawaran pertama (V1) yang masuk antrean review:</p>
      <ol class="step-list">
        <li>Director membuka detail penawaran, mengklik tombol <strong>Need Change</strong>, dan wajib mengisi catatan revisi di modal Notes. Status dokumen berubah menjadi <strong>Need Change</strong>.</li>
        <li>Marketing mengklik tombol <strong>Edit</strong> pada dokumen tersebut, mengubah isi penawaran sesuai instruksi, lalu menyimpannya kembali.</li>
        <li>Sistem otomatis menaikkan versi dokumen menjadi <strong>V2</strong>. Jika V2 sudah sesuai batas normal, statusnya langsung menjadi <strong>Approved</strong>. Jika masih melebihi batas diskon, statusnya kembali ke <strong>Need Review</strong> untuk disetujui Director.</li>
        <li>Setelah statusnya menjadi <strong>Approved</strong>, Marketing memprosesnya ke PO, pengiriman, dan pelunasan.</li>
      </ol>

      <h2>Skenario 2.3: Quotation Need Review -> Need Change -> Revised V2 -> Need Review -> Approved</h2>
      <p>Skenario di mana proses revisi mengalami review berulang:</p>
      <ol class="step-list">
        <li>Quotation V1 dikirim ke antrean review Director karena diskon tinggi (<strong>Need Review</strong>).</li>
        <li>Director menolak sementara dengan mengklik <strong>Need Change</strong>.</li>
        <li>Marketing melakukan edit dan menyimpan perubahan sebagai <strong>V2</strong>. Namun, karena revisi V2 masih menawarkan diskon di luar batas normal, status V2 tetap masuk antrean <strong>Need Review</strong>.</li>
        <li>Director memeriksa versi V2, merasa diskon baru tersebut dapat diterima, lalu mengklik <strong>Approve</strong>. Dokumen berstatus <strong>Approved</strong> dan berlanjut ke alur PO, PI, dan DO/WO.</li>
      </ol>
      <div class="page-break"></div>

      <h2>Skenario 2.4: Quotation Need Review -> Need Change -> Revised V2 -> Need Review -> Need Change -> Approved V3</h2>
      <p>Proses negosiasi harga yang lebih panjang hingga versi ketiga:</p>
      <ol class="step-list">
        <li>Quotation V1 masuk antrean review diskon (<strong>Need Review</strong>). Director meminta revisi (<strong>Need Change</strong>).</li>
        <li>Marketing mengirimkan revisi V2, tetapi diskon masih terlalu tinggi (kembali <strong>Need Review</strong>).</li>
        <li>Director meminta revisi kembali untuk kedua kalinya (<strong>Need Change</strong>).</li>
        <li>Marketing mengedit dokumen dan mengirimkan revisi <strong>V3</strong>.</li>
        <li>Director memeriksa V3, menyetujuinya dengan mengklik <strong>Approve</strong>. Dokumen berstatus <strong>Approved</strong> untuk diteruskan ke pembuatan PO, pembayaran DP, pengiriman, pelunasan, dan Invoice.</li>
      </ol>

      <h2>Skenario 2.5: Quotation Need Review -> Rejected (Penolakan Final)</h2>
      <p>Terjadi ketika penawaran harga yang diajukan oleh Marketing dinilai tidak layak atau merugikan perusahaan:</p>
      <ol class="step-list">
        <li>Quotation V1 berstatus <strong>Need Review</strong> masuk ke antrean Director.</li>
        <li>Director memeriksa rincian penawaran, lalu mengklik tombol <strong>Reject</strong> pada modal Notes dan menuliskan alasan penolakan secara jelas.</li>
        <li>Status dokumen berubah secara permanen menjadi <strong>Rejected</strong>. Dokumen ini terkunci, tidak dapat diedit lagi oleh Marketing, dan tidak bisa diproses ke tahap Purchase Order (PO).</li>
      </ol>

      <h2>Skenario 2.6: Quotation Need Review -> Need Change -> Revised V2 -> Rejected</h2>
      <p>Penolakan final setelah dilakukan proses revisi oleh Marketing:</p>
      <ol class="step-list">
        <li>Quotation V1 berstatus <strong>Need Review</strong> dikembalikan oleh Director via tombol <strong>Need Change</strong>.</li>
        <li>Marketing merevisi dokumen dan mengirimkan versi <strong>V2</strong> (kembali berstatus <strong>Need Review</strong>).</li>
        <li>Director memeriksa V2, namun mendapati bahwa revisi tersebut tetap tidak memenuhi syarat profitabilitas perusahaan.</li>
        <li>Director mengklik tombol <strong>Reject</strong>. Status Quotation V2 berubah menjadi <strong>Rejected</strong> secara permanen dan seluruh proses untuk penawaran tersebut dihentikan.</li>
      </ol>

      <h2>Skenario 2.7: Alur Pengembalian Barang (PO Return Workflow)</h2>
      <p>Jika barang yang telah diterima oleh pelanggan mengalami kerusakan atau tidak sesuai spesifikasi, Marketing dapat mengajukan pengembalian barang setelah transaksi selesai:</p>
      <ol class="step-list">
        <li>Marketing mengajukan retur melalui detail PO berstatus <strong>Done</strong> dengan menginput kuantitas retur barang (> 0 dan tidak melebihi jumlah beli awal). Dokumen masuk antrean review return.</li>
        <li>Director membuka menu <strong>Quotation Return</strong> untuk memeriksa daftar pengajuan retur.</li>
        <li>Director dapat menyetujui pengembalian dengan mengklik <strong>Approve Return</strong> (stok barang otomatis dikembalikan ke inventaris cabang dan status PO menjadi <strong>Done (Returned)</strong>), atau menolaknya dengan mengklik <strong>Reject Return</strong>.</li>
      </ol>
      <div class="page-break"></div>

      <h2>Skenario 2.8: Siklus Servis & Peminjaman Suku Cadang (Borrow)</h2>
      <p>Khusus untuk proyek tipe <em>Service</em>, teknisi seringkali perlu meminjam sparepart dari gudang terlebih dahulu sebelum tagihan resmi diterbitkan:</p>
      <ol class="step-list">
        <li>Setelah PO Service disetujui, klik tombol <strong>Create Borrow</strong> pada halaman detail PO untuk mengajukan peminjaman sparepart. Isi daftar sparepart yang dipinjam beserta kuantitasnya, lalu kirim pengajuan.</li>
        <li>Director atau Head Inventory memeriksa permohonan peminjaman di menu <strong>Borrow</strong> dan mengklik <strong>Approve</strong>.</li>
        <li>Teknisi melakukan pengerjaan servis menggunakan sparepart pinjaman tersebut.</li>
        <li><strong>Prosedur Pengembalian (Return Borrow):</strong> Setelah pengerjaan selesai, buka dokumen Borrow terkait dan klik <strong>Return</strong>. Masukkan kuantitas sparepart yang dikembalikan secara fisik ke gudang.</li>
        <li>Jika ada sparepart yang terpakai atau hilang (selisih kuantitas > 0), sistem <strong>mewajibkan Marketing mengaitkan nomor PO Sparepart baru</strong> yang mencakup sparepart terpakai tersebut sebelum dokumen Borrow dapat diselesaikan. Hal ini penting agar sistem dapat mencatat pemotongan stok secara legal dan menagihkannya ke pelanggan.</li>
        <li>Setelah PO baru dikaitkan, klik <strong>Done</strong> untuk menyelesaikan Borrow.</li>
      </ol>

      <h2>Skenario 2.9: Back Order Not Ready & Pengadaan (Purchase/Buy)</h2>
      <p>Terjadi jika stok suku cadang di gudang cabang tidak mencukupi untuk memenuhi PO:</p>
      <ol class="step-list">
        <li>Saat PO dibuat, sistem mendeteksi kekurangan stok dan menandai status PO sebagai <strong>BO</strong> (Back Order) dengan sub-status sparepart "Not Ready".</li>
        <li>Jika pengguna memaksakan mengklik tombol <strong>Sparepart Ready</strong>, sistem akan memblokir proses dengan pesan error (proses gagal).</li>
        <li><strong>Pengadaan Barang (Purchase/Buy):</strong> Bagian Purchase (atau Director) harus membuat dokumen Pembelian (<strong>Buy</strong>) baru ke supplier/seller untuk sparepart yang kurang tersebut.</li>
        <li>Director memeriksa dan menyetujui dokumen Buy tersebut (<strong>Approve Buy</strong>).</li>
        <li>Ketika barang secara fisik tiba di gudang dari supplier, buka detail Buy tersebut dan klik tombol <strong>Done</strong>. Sistem akan otomatis menambah stok fisik sparepart tersebut pada gudang cabang penerima.</li>
        <li><strong>BO Run Analyze:</strong> Kembali ke halaman detail Back Order terkait, klik tombol <strong>Analyze</strong>. Sistem akan mencocokkan stok baru dengan daftar inden. Setelah stok teralokasi, status BO berubah menjadi "Ready".</li>
        <li>Klik tombol <strong>Sparepart Ready</strong> pada PO (sekarang sukses!). Proses berlanjut ke PI, pembayaran DP, rilis pengiriman, pelunasan, dan Invoice Final.</li>
      </ol>
      <div class="page-break"></div>

      <h1>5. Penjelasan Tombol Kontrol, Catatan (Notes) & Cetak Dokumen</h1>
      <p>Setiap perubahan status dan interaksi dokumen diatur secara disiplin menggunakan tombol-tombol khusus yang wajib disertai pengisian catatan (Notes):</p>
      <table>
        <thead>
          <tr>
            <th>Fitur / Tombol</th>
            <th>Fungsi Utama</th>
            <th>Kewajiban Notes / Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Approve / Reject Quotation</strong></td>
            <td>Menyetujui atau menolak penawaran harga yang masuk ke antrean review Director.</td>
            <td><strong>Wajib.</strong> Alasan persetujuan atau penolakan harus diinput pada modal Notes.</td>
          </tr>
          <tr>
            <td><strong>Need Change</strong></td>
            <td>Mengembalikan Quotation ke Marketing untuk direvisi.</td>
            <td><strong>Wajib.</strong> Harus menyertakan bagian mana yang perlu diperbaiki.</td>
          </tr>
          <tr>
            <td><strong>Create PO</strong></td>
            <td>Mengonversi Quotation berstatus Approved menjadi Purchase Order.</td>
            <td><strong>Opsional.</strong> Dapat diisi petunjuk khusus untuk bagian gudang.</td>
          </tr>
          <tr>
            <td><strong>Sparepart Ready</strong></td>
            <td>Memverifikasi ketersediaan stok fisik di gudang untuk PO terkait.</td>
            <td><strong>Otomatis.</strong> Sistem mengunci stok jika sukses.</td>
          </tr>
          <tr>
            <td><strong>DP Paid / Full Paid</strong></td>
            <td>Mencatat penerimaan pembayaran DP atau Pelunasan dari pelanggan.</td>
            <td><strong>Wajib.</strong> Digunakan sebagai bukti audit penerimaan bank.</td>
          </tr>
          <tr>
            <td><strong>Cetak (Print PDF)</strong></td>
            <td>Menghasilkan dokumen PDF resmi (Quotation, PO, PI, Invoice, Surat Jalan DO, Perintah Kerja WO) yang siap dikirim ke klien atau dicetak fisik.</td>
            <td>Menampilkan tanda tangan digital pemeriksa dan logo PT Berkat Megah Jaya.</td>
          </tr>
        </tbody>
      </table>

      <h2>Hasil Cetak Dokumen PDF Resmi (PDF Outputs)</h2>
      <p>Berikut adalah visualisasi hasil cetak dokumen-dokumen resmi BMJ App yang siap diserahkan kepada pelanggan, kurir, teknisi, maupun untuk pengarsipan internal:</p>

      <h3>1. Penawaran Harga (Quotation) & Pesanan Pembelian (Purchase Order)</h3>
      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-quotation.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.1: Hasil Cetak Penawaran Harga (Quotation PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-purchase-order.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.2: Hasil Cetak Pesanan Pembelian (Purchase Order PDF)</div>
        </div>
      </div>

      <div class="page-break"></div>

      <h3>2. Faktur Proforma (Proforma Invoice) & Faktur Akhir (Invoice)</h3>
      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-proforma-invoice.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.3: Hasil Cetak Faktur Proforma (Proforma Invoice PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-invoice.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.4: Hasil Cetak Faktur Akhir (Invoice PDF)</div>
        </div>
      </div>

      <div class="page-break"></div>

      <h3>3. Pengiriman Barang (Delivery Order) & Surat Jalan (Delivery Note)</h3>
      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-order.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.5: Hasil Cetak Surat Penyerahan Barang (Delivery Order PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-note.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.6: Hasil Cetak Surat Jalan Perjalanan (Delivery Note PDF)</div>
        </div>
      </div>

      <div class="page-break"></div>

      <h3>4. Perintah Kerja (Work Order) & Surat Peminjaman Suku Cadang (Borrow)</h3>
      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-work-order.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.7: Hasil Cetak Lembar Perintah Kerja Teknisi (Work Order PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-borrow.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 5.8: Hasil Cetak Surat Peminjaman Suku Cadang (Borrow PDF)</div>
        </div>
      </div>

      <div class="page-break"></div>

      <h1>6. Audit Riwayat Pergerakan Stok (Stock History)</h1>
      <p>Sistem mencatat setiap pengurangan dan penambahan barang gudang secara ketat dan transparan pada menu <strong>Stock History</strong>:</p>
      <ul>
        <li><strong>Pengurangan Stok Otomatis:</strong> Terjadi pada saat PO dideklarasikan <em>Ready</em> (stok dikunci untuk pelanggan).</li>
        <li><strong>Penambahan Stok Otomatis:</strong> Terjadi ketika pengadaan barang eksternal (<strong>Buy</strong>) diselesaikan (status <strong>Done</strong>) or saat ada kelebihan sparepart dikembalikan pada penutupan dokumen <strong>Borrow</strong>.</li>
        <li><strong>Audit Log:</strong> Setiap baris histori memuat tanggal mutasi, nama operator pelaksana, jenis dokumen referensi (PO, Buy, Borrow, Movement), kuantitas, dan saldo akhir stok.</li>
      </ul>

      <h1>7. Pengelolaan Karyawan & Parameter Sistem</h1>
      <p>Director memiliki hak eksklusif untuk mengelola data master karyawan dan parameter operasional sistem:</p>

      <h2>Manajemen Karyawan (Employee CRUD)</h2>
      <p>Direktur dapat menambah, mengedit, atau menonaktifkan akun karyawan serta mengelola cabang tugas mereka melalui daftar karyawan:</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/director-employee-list.png">
        <div class="screenshot-caption">Gambar 7.1: Daftar Karyawan Terdaftar (Employee List)</div>
      </div>

      <ul>
        <li><strong>Reset Password & Sandi Sementara:</strong> Jika karyawan lupa sandi, Director dapat melakukan reset dan memberikan sandi sementara. Sistem dilengkapi dengan pengaman <strong>must_change_password</strong>, di mana saat login pertama kali, karyawan dipaksa mengganti sandi sebelum bisa mengakses menu utama.</li>
        <li><strong>General Settings:</strong> Director dapat mengubah batas maksimal diskon penawaran, tarif PPN (VAT) nasional, serta nilai kurs mata uang global.</li>
      </ul>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/director-general-settings.png">
        <div class="screenshot-caption">Gambar 7.2: Formulir Pengaturan PPN, Diskon, & Kurs</div>
      </div>
    </body>
    </html>
  `,

  // 7. HEAD INVENTORY
  headInventory: `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Buku Panduan - Peran Head Inventory</title>
      ${baseHtmlStyle}
    </head>
    <body>
      <div class="cover">
        <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
        <div class="cover-divider"></div>
        <div style="margin: 30px 0;">
          <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        </div>
        <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>PERAN: HEAD INVENTORY</h1>
        <h2 class="cover-subtitle">Persetujuan Pengadaan Barang Supplier & Pengawasan Stok Multi-Cabang</h2>
        <div class="cover-meta">
          <p><strong>Penyusun:</strong> Tim Penyusun &bull; <strong>Revisi:</strong> Juni 2026</p>
        </div>
      </div>
      <div class="page-break"></div>

      <h1>1. Cara Login & Masuk Dashboard</h1>
      <p>Masuk menggunakan akun Head Inventory Anda untuk melakukan pengawasan penuh pada gudang cabang.</p>
      <div class="screenshot-container">
        <img class="screenshot" src="./playwright-screenshots/login-page.png">
        <div class="screenshot-caption">Gambar 1.1: Layar Login Utama</div>
      </div>

      <h1>2. Persetujuan Pengadaan Barang (Approve Buy/Purchase)</h1>
      <p>Bagian Purchase mengajukan pembelian suku cadang ke supplier luar saat stok kosong (Back Order). Sebagai Head Inventory, Anda bertugas memverifikasi dan menyetujui pengajuan tersebut:</p>
      <ol class="step-list">
        <li>Masuk ke menu <strong>Purchase</strong>. Dokumen yang butuh persetujuan akan berstatus <strong>Wait for Review</strong>.</li>
        <li>Klik pada baris dokumen untuk memeriksa detail sparepart, jumlah, dan harga beli yang diajukan.</li>
        <li>Klik tombol <strong>Approve</strong> untuk menyetujui pembelian, atau <strong>Reject</strong> jika ada kesalahan harga, atau <strong>Need Change</strong> jika butuh revisi dari bagian Purchase.</li>
      </ol>

      <h1>3. Pengawasan Mutasi Stok (Sparepart Movement) & Surat Jalan (DO)</h1>
      <p>Head Inventory bertanggung jawab mengawasi aktivitas operasional admin gudang:</p>
      <ul>
        <li><strong>Sparepart Movement:</strong> Memantau perpindahan stok antar cabang (Jakarta-Semarang) agar distribusi suku cadang seimbang.</li>
        <li><strong>Delivery Order (DO):</strong> Memastikan surat jalan pengiriman barang dirilis tepat waktu setelah pembayaran DP divalidasi oleh Finance.</li>
        <li><strong>Peminjaman Suku Cadang (Borrow):</strong> Meninjau permohonan pinjam pakai suku cadang untuk keperluan servis (Work Order) dan memastikan pengembalian barang terpakai terdokumentasi dengan PO baru.</li>
      </ul>

      <div style="display: flex; justify-content: space-around; gap: 15px; margin: 20px 0;">
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-order.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 3.1: Hasil Cetak Surat Penyerahan Barang (Delivery Order PDF)</div>
        </div>
        <div style="width: 48%; text-align: center;">
          <img class="screenshot" src="./playwright-screenshots/print-delivery-note.png" style="max-width: 100%;">
          <div class="screenshot-caption">Gambar 3.2: Hasil Cetak Surat Jalan Perjalanan (Delivery Note PDF)</div>
        </div>
      </div>

      <div class="screenshot-container" style="margin-top: 20px;">
        <img class="screenshot" src="./playwright-screenshots/print-borrow.png">
        <div class="screenshot-caption">Gambar 3.3: Hasil Cetak Peminjaman Barang (Borrow PDF)</div>
      </div>

      <h1>4. Audit Log Riwayat Stok (Stock History)</h1>
      <p>Menu <strong>Stock History</strong> memuat riwayat pergerakan stok suku cadang secara detail (mutasi masuk, keluar, penyesuaian opname). Head Inventory wajib melakukan audit berkala pada halaman log ini untuk meminimalkan selisih fisik barang di gudang.</p>
    </body>
    </html>
  `,
};

// Generate all PDFs
(async () => {
  const browser = await chromium.launch();
  try {
    for (const [role, htmlContent] of Object.entries(manuals)) {
      const htmlFileName = `manual-${role}.html`;
      const htmlPath = path.join(__dirname, htmlFileName);
      
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      console.log(`HTML template written for ${role}: ${htmlPath}`);

      const page = await browser.newPage();
      await page.goto('file://' + htmlPath.replace(/\\/g, '/'));
      await page.waitForLoadState('networkidle');

      // Wait for all images to load fully
      await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));
      });

      const pdfFileName = `Buku_Panduan_${role.charAt(0).toUpperCase() + role.slice(1)}.pdf`;
      const pdfPath = path.join(__dirname, pdfFileName);

      console.log(`Generating PDF for ${role}...`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '60px',
          bottom: '60px',
          left: '40px',
          right: '40px'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 8px; width: 100%; text-align: center; color: #94a3b8; font-family: 'Inter', sans-serif; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin: 0 40px;">
            PT BERKAT MEGAH JAYA &bull; PANDUAN PENGGUNA PERAN ${role.toUpperCase()}
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 8px; width: 100%; text-align: center; color: #94a3b8; font-family: 'Inter', sans-serif; border-top: 1px solid #e2e8f0; padding-top: 5px; margin: 0 40px;">
            Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span> &bull; Dokumen Rahasia Perusahaan
          </div>
        `
      });

      console.log(`PDF compiled for ${role} at: ${pdfPath}`);
      
      // Clean up temporary HTML file
      fs.unlinkSync(htmlPath);
    }
    console.log('\nAll role-specific manuals compiled successfully!');
  } catch (err) {
    console.error('Error during manuals compilation:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
