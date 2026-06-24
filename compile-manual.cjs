const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// Content in Bahasa Indonesia
const sections = [];

// Cover Page
sections.push(`
  <div class="cover">
    <div class="cover-brand">PT BERKAT MEGAH JAYA</div>
    <div class="cover-divider"></div>
    <div style="margin: 30px 0;">
      <img src="./public/images/BMJ-page-book.jpg" style="width: 280px; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
    </div>
    <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>(USER MANUAL)</h1>
    <h2 class="cover-subtitle">Sistem ERP & Manajemen Siklus Pesanan Terintegrasi<br>BMJ App</h2>
    <div class="cover-meta">
      <p><strong>Diterbitkan untuk:</strong> Semua Staf & Manajemen PT Berkat Megah Jaya</p>
      <p><strong>Area Cakupan:</strong> Penawaran, Pesanan Pembelian, Faktur, Keuangan, Logistik, & Pengaturan Sistem</p>
      <p><strong>Versi Dokumen:</strong> 1.0 (Juni 2026)</p>
      <p><strong>Status:</strong> Resmi & Validasi E2E Lulus</p>
    </div>
  </div>
  <div class="page-break"></div>
`);

// Table of Contents Placeholder (styling handles the layout)
sections.push(`
  <div class="section toc-section">
    <h1 class="section-title">Daftar Isi</h1>
    <ul class="toc-list">
      <li><a href="#pendahuluan">1. Pendahuluan & Konsep Sistem ERP</a></li>
      <li><a href="#peran-akses">2. Struktur Peran & Hak Akses Pengguna</a></li>
      <li><a href="#modul-quotation">3. Modul Penawaran Harga (Quotation)</a></li>
      <li><a href="#modul-po">4. Modul Pesanan Pembelian (Purchase Order)</a></li>
      <li><a href="#modul-pi">5. Modul Faktur Proforma (Proforma Invoice)</a></li>
      <li><a href="#modul-invoice">6. Modul Faktur Akhir (Invoice)</a></li>
      <li><a href="#modul-spareparts">7. Modul Katalog Suku Cadang (Spareparts)</a></li>
      <li><a href="#modul-logistik-do">8. Modul Logistik: Pengiriman (Delivery Order) & Perintah Kerja (Work Order)</a></li>
      <li><a href="#modul-logistik-bo">9. Modul Logistik: Inden & Kekurangan Stok (Back Order)</a></li>
      <li><a href="#modul-logistik-buy">10. Modul Pengadaan: Pembelian Barang (Buy / Purchase)</a></li>
      <li><a href="#modul-logistik-borrow">11. Modul Logistik: Peminjaman Suku Cadang (Borrow)</a></li>
      <li><a href="#modul-logistik-movement">12. Modul Logistik: Mutasi Barang & Riwayat Pergerakan Stok</a></li>
      <li><a href="#modul-administrasi">13. Modul Kepegawaian, Keamanan, & Pengaturan Global</a></li>
    </ul>
  </div>
  <div class="page-break"></div>
`);

// 1. Pendahuluan
sections.push(`
  <div id="pendahuluan" class="section">
    <h1 class="section-title">1. Pendahuluan & Konsep Sistem ERP</h1>
    <p>Selamat datang di <strong>BMJ App</strong>, sistem manajemen internal terintegrasi (ERP) untuk <strong>PT Berkat Megah Jaya</strong>. Aplikasi ini dirancang untuk mempermudah, mengotomatisasi, dan memantau siklus pesanan barang maupun jasa industri secara *end-to-end* di seluruh cabang perusahaan (Jakarta dan Semarang).</p>
    
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/login-page.png">
      <div class="screenshot-caption">Gambar 1.1: Halaman Login Utama BMJ App</div>
    </div>

    <h3>Alur Siklus Utama Dokumen</h3>
    <p>Setiap pesanan di PT Berkat Megah Jaya mengikuti alur dokumen yang ketat untuk menjamin keamanan finansial dan akurasi stok inventaris:</p>
    <div class="flowchart-container">
      <div class="flow-step">
        <span class="flow-badge badge-quotation">Quotation</span>
        <p class="flow-desc">Penawaran harga awal oleh Marketing.</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <span class="flow-badge badge-po">Purchase Order (PO)</span>
        <p class="flow-desc">Persetujuan pemesanan resmi dari pelanggan.</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <span class="flow-badge badge-pi">Proforma Invoice</span>
        <p class="flow-desc">Tagihan sementara untuk uang muka (DP).</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <span class="flow-badge badge-invoice">Invoice</span>
        <p class="flow-desc">Tagihan final setelah barang/jasa selesai dirilis.</p>
      </div>
    </div>
    
    <div class="alert alert-info">
      <strong>Informasi Penting:</strong> Di samping alur keuangan utama, perolehan PO juga memicu alur logistik operasional:
      <ul>
        <li><strong>Delivery Order (DO)</strong>: Dibuat untuk pengiriman pesanan suku cadang (*Spareparts*).</li>
        <li><strong>Work Order (WO)</strong>: Dibuat untuk penugasan jasa teknisi (*Service*).</li>
        <li><strong>Back Order (BO)</strong>: Otomatis dibuat jika ada suku cadang yang stoknya tidak mencukupi saat PO dirilis.</li>
      </ul>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 2. Peran Akses
sections.push(`
  <div id="peran-akses" class="section">
    <h1 class="section-title">2. Struktur Peran & Hak Akses Pengguna</h1>
    <p>BMJ App menerapkan <strong>Role-Based Access Control (RBAC)</strong> yang membatasi hak akses fitur berdasarkan jabatan karyawan. Hal ini memastikan kerahasiaan data margin harga dan pembagian wewenang yang aman.</p>
    
    <table>
      <thead>
        <tr>
          <th>Peran (Role)</th>
          <th>Cakupan Akses Utama</th>
          <th>Keterbatasan (Restrictions)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Director</strong></td>
          <td>Akses penuh ke semua fitur, laporan keuangan global, pengaturan sistem, approval tingkat tinggi, dan CRUD karyawan.</td>
          <td>Tidak ada batasan.</td>
        </tr>
        <tr>
          <td><strong>Marketing</strong></td>
          <td>Membuat penawaran (Quotation), mengajukan permohonan PO, melacak pengembalian barang (*Return*), serta mengelola peminjaman suku cadang (*Borrow*).</td>
          <td>Tidak dapat melihat harga beli (*buy price*) sparepart atau harga beli dari supplier. Hanya melihat stok fisik.</td>
        </tr>
        <tr>
          <td><strong>Finance</strong></td>
          <td>Memproses PO menjadi Proforma Invoice (PI), mencatat pembayaran uang muka (DP) dan pelunasan, serta menerbitkan Invoice final.</td>
          <td>Tidak dapat mengubah spesifikasi teknis penawaran atau mengubah stok secara langsung.</td>
        </tr>
        <tr>
          <td><strong>Inventory Admin</strong></td>
          <td>Memproses pengiriman (Delivery Order), memantau mutasi barang antar cabang, melacak riwayat stok (*Stock History*), serta merilis PO.</td>
          <td>Tidak dapat melihat harga jual (*sell price*) suku cadang ke pelanggan pada katalog.</td>
        </tr>
        <tr>
          <td><strong>Inventory Purchase</strong></td>
          <td>Membuat pengadaan pembelian barang (*Buy / Purchase*) dari supplier eksternal berdasarkan kekurangan stok (Back Order).</td>
          <td>Tidak dapat melihat harga jual suku cadang.</td>
        </tr>
        <tr>
          <td><strong>Head Inventory</strong></td>
          <td>Peran pengawas gudang. Menyetujui peminjaman barang, merilis DO, memantau pembelian dan mutasi stok cabang.</td>
          <td>Tidak dapat menyetujui penawaran harga penjualan ke pelanggan (wewenang Director).</td>
        </tr>
        <tr>
          <td><strong>Service</strong></td>
          <td>Mengelola Work Order (Service), mengisi detail teknisi, tanggal kerja, dan unit yang diservis.</td>
          <td>Akses terbatas hanya pada halaman Work Order dan katalog Spareparts (tanpa harga).</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="page-break"></div>
`);

// 3. Modul Quotation
sections.push(`
  <div id="modul-quotation" class="section">
    <h1 class="section-title">3. Modul Penawaran Harga (Quotation)</h1>
    <p>Penawaran Harga atau <strong>Quotation</strong> adalah dokumen awal tempat tim Marketing mendaftarkan kebutuhan pelanggan. Dokumen ini mendukung sistem versi untuk mencatat perubahan negosiasi.</p>
    
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/marketing-quotation-list.png">
      <div class="screenshot-caption">Gambar 3.1: Halaman Daftar Penawaran Harga (Quotation List)</div>
    </div>

    <h3>Langkah-langkah Membuat Quotation Baru:</h3>
    <ol class="step-list">
      <li>Pilih menu <strong>Quotation</strong> dan klik tombol <strong>Add Quotation</strong>.</li>
      <li>Tentukan <strong>Project Type</strong>:
        <ul>
          <li><em>Spareparts</em>: Untuk penjualan suku cadang fisik.</li>
          <li><em>Service</em>: Untuk pekerjaan perbaikan/servis industri.</li>
        </ul>
      </li>
      <li>Isi data pelanggan secara lengkap (Nama Perusahaan, Alamat, Kota, Telepon, dsb.).</li>
      <li>Masukkan detail item:
        <ul>
          <li>Untuk <em>Spareparts</em>, gunakan panel pencarian suku cadang untuk menambah item, lalu tentukan jumlah (*quantity*) dan harga jual satuan.</li>
          <li>Untuk <em>Service</em>, klik <strong>Add Service</strong> dan masukkan deskripsi jasa beserta nominal harganya.</li>
        </ul>
      </li>
      <li>Klik tombol <strong>Add Quotation</strong> dan konfirmasi dengan memilih <strong>Yes</strong>.</li>
    </ol>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/marketing-quotation-add.png">
      <div class="screenshot-caption">Gambar 3.2: Formulir Pembuatan Quotation Baru</div>
    </div>

    <h3>Aturan Bisnis & Persetujuan (Approval):</h3>
    <ul>
      <li><strong>Sistem Versi</strong>: Jika ada perubahan harga/jumlah setelah dokumen dikirim, edit dokumen tersebut untuk membuat <em>Version 2</em>, <em>Version 3</em>, dst. Versi lama tetap tersimpan sebagai arsip historis.</li>
      <li><strong>Pemicu Review Otomatis (On Review)</strong>: 
        <ol>
          <li><em>Diskon per-item</em>: Jika harga jual yang dimasukkan oleh Marketing berada di bawah harga dasar setelah diskon maksimal yang diizinkan (General Settings), sistem otomatis mengunci Quotation ke status <strong>On Review</strong> agar diperiksa oleh Director.</li>
          <li><em>Diskon Total</em>: Marketing dapat memasukkan diskon keseluruhan dalam persen (0-100%). **Setiap nilai diskon total yang lebih besar dari 0% secara otomatis memicu persetujuan Director**, apa pun harga satuannya.</li>
        </ol>
      </li>
      <li>Hanya Quotation yang berstatus <strong>Approved</strong> yang dapat diproses ke tahap Purchase Order.</li>
    </ul>

    <h3>Hasil Cetak Penawaran Harga (Quotation PDF)</h3>
    <p>Berikut adalah tampilan dokumen cetak Penawaran Harga yang siap dikirimkan kepada pelanggan:</p>
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-quotation.png">
      <div class="screenshot-caption">Gambar 3.3: Hasil Cetak Penawaran Harga (Quotation PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 4. Modul PO
sections.push(`
  <div id="modul-po" class="section">
    <h1 class="section-title">4. Modul Pesanan Pembelian (Purchase Order)</h1>
    <p>Purchase Order (PO) dibentuk langsung dari Quotation yang telah disetujui. Dokumen PO mengunci kesepakatan dan menjadi jembatan ke logistik gudang serta keuangan.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-po-list.png">
      <div class="screenshot-caption">Gambar 4.1: Daftar PO Siap Tagih (PO List)</div>
    </div>

    <h3>Langkah-langkah Memproses Quotation Menjadi PO:</h3>
    <ol class="step-list">
      <li>Masuk ke detail Quotation yang berstatus <strong>Approved</strong>.</li>
      <li>Klik tombol <strong>Create PO</strong> di kanan bawah.</li>
      <li>Sistem akan memunculkan modal pembuatan PO. Marketing wajib mengisi:
        <ul>
          <li><strong>Notes</strong>: Catatan operasional PO.</li>
          <li><strong>No PO (Real PO Number)</strong>: Nomor PO fisik dari pelanggan. **Kolom ini wajib diisi dan harus unik secara sistem**. Jika nomor PO sudah pernah digunakan sebelumnya, sistem akan menolak untuk menghindari duplikasi tagihan.</li>
        </ul>
      </li>
      <li>Klik <strong>Create PO</strong> lalu konfirmasi <strong>Yes</strong>. Anda akan dialihkan ke halaman Detail PO.</li>
    </ol>

    <div class="alert alert-warning">
      <strong>Memahami Dua Nomor PO pada Sistem:</strong>
      <ul>
        <li><strong>No Internal Request (purchase_order_number)</strong>: Nomor PO internal yang dibuat secara otomatis oleh sistem (format: <code>PO/XXX/BMJ-MEGAH/...</code>). Digunakan untuk pelacakan internal dokumen.</li>
        <li><strong>No PO Asli (po_number)</strong>: Nomor PO resmi dari pembeli/klien yang diinput manual. Muncul di semua cetakan logistik/faktur.</li>
      </ul>
    </div>

    <h3>Siklus Status PO:</h3>
    <p>Sebuah PO akan bergulir melalui status-status berikut:</p>
    <ul>
      <li><strong>Prepare</strong>: Status awal PO. Siap diajukan pembuatan DP.</li>
      <li><strong>DP Paid</strong>: Ditandai setelah Finance mencatat pembayaran uang muka pelanggan pada Proforma Invoice.</li>
      <li><strong>Ready</strong>: Dinyatakan oleh bagian logistik setelah semua sparepart siap di gudang (atau pekerjaan servis siap dijadwalkan).</li>
      <li><strong>Release</strong>: Barang dikirim (memicu Delivery Order) atau pekerjaan servis dimulai (memicu Work Order).</li>
      <li><strong>Done</strong>: Pesanan telah selesai diproses sepenuhnya.</li>
    </ul>

    <h3>Modul Pengembalian (Return Workflow):</h3>
    <p>Karyawan Marketing dapat melakukan pengembalian barang (*Return*) untuk PO yang berstatus <strong>Done</strong>. Pengembalian barang harus memvalidasi jumlah barang yang diretur (> 0 dan tidak melebihi jumlah yang dibeli). Retur ini membutuhkan persetujuan Director sebelum stok dikembalikan ke gudang secara resmi.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-po-detail.png">
      <div class="screenshot-caption">Gambar 4.2: Rincian Pesanan Pembelian (PO Detail)</div>
    </div>

    <h3>Hasil Cetak Pesanan Pembelian (PO PDF)</h3>
    <p>Berikut adalah contoh cetak lembar request Pesanan Pembelian (PO) internal yang digunakan perusahaan:</p>
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-purchase-order.png">
      <div class="screenshot-caption">Gambar 4.3: Hasil Cetak Pesanan Pembelian (Purchase Order PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 5. Modul Proforma Invoice
sections.push(`
  <div id="modul-pi" class="section">
    <h1 class="section-title">5. Modul Faktur Proforma (Proforma Invoice)</h1>
    <p>Proforma Invoice (PI) digunakan oleh Finance untuk menagih pembayaran sebelum seluruh barang dikirimkan, khususnya untuk skema pembayaran bertahap (Uang Muka + Pelunasan).</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-pi-list.png">
      <div class="screenshot-caption">Gambar 5.1: Daftar Proforma Invoice (PI List)</div>
    </div>

    <h3>Langkah-langkah Memproses PI:</h3>
    <ol class="step-list">
      <li>Di detail PO berstatus <strong>Prepare</strong>, klik tombol <strong>Create PI</strong>.</li>
      <li>Masukkan catatan penagihan dan simpan. Dokumen PI otomatis terbuat.</li>
      <li><strong>Mengubah Persentase DP</strong>:
        <ul>
          <li>Masuk ke detail PI, klik <strong>Edit PI</strong>.</li>
          <li>Masukkan persentase uang muka yang diinginkan pada kolom <strong>Advance Payment (%)</strong> (0-100%). Nilai nominal DP akan dihitung otomatis dari grand total.</li>
          <li>Isi catatan lalu simpan. Sistem melakukan inline validation agar persentase yang diinput berupa angka valid.</li>
        </ul>
      </li>
      <li><strong>Mencatat Pembayaran DP (DP Paid)</strong>:
        <ul>
          <li>Klik tombol <strong>DP Paid</strong> di halaman detail PI. Konfirmasi pembayaran. Status PO akan otomatis berubah menjadi <strong>DP Paid</strong>.</li>
        </ul>
      </li>
      <li><strong>Mencatat Pelunasan (Full Paid)</strong>:
        <ul>
          <li>Setelah barang siap kirim atau selesai dipasang, klik tombol <strong>Full Paid</strong> pada PI untuk mencatat pelunasan akhir.</li>
        </ul>
      </li>
    </ol>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-pi-detail.png">
      <div class="screenshot-caption">Gambar 5.2: Detail Rincian Faktur Proforma (PI Detail)</div>
    </div>

    <h3>Hasil Cetak Faktur Proforma (PI PDF)</h3>
    <p>Berikut adalah tampilan cetak Proforma Invoice yang diserahkan ke pelanggan untuk penagihan uang muka (DP):</p>
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-proforma-invoice.png">
      <div class="screenshot-caption">Gambar 5.3: Hasil Cetak Faktur Proforma (Proforma Invoice PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 6. Modul Invoice
sections.push(`
  <div id="modul-invoice" class="section">
    <h1 class="section-title">6. Modul Faktur Akhir (Invoice)</h1>
    <p>Faktur Akhir atau <strong>Invoice</strong> merupakan bukti tagihan final yang diterbitkan oleh perusahaan setelah transaksi lunas atau barang selesai dikirimkan.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-invoice-list.png">
      <div class="screenshot-caption">Gambar 6.1: Daftar Invoice Final (Invoice List)</div>
    </div>

    <h3>Langkah-langkah Menerbitkan Invoice:</h3>
    <ol class="step-list">
      <li>Buka halaman detail Proforma Invoice yang telah lunas (Full Paid).</li>
      <li>Klik tombol <strong>Create Invoice</strong>.</li>
      <li>Isi jangka waktu pembayaran pada kolom <strong>Term of Payment</strong> (misal: <em>30 Days</em>, <em>Cash on Delivery</em>).</li>
      <li>Konfirmasi dan simpan. Dokumen Invoice akan resmi diterbitkan.</li>
    </ol>

    <div class="alert alert-info">
      <strong>Sifat Dokumen Invoice:</strong> Invoice bersifat **Read-Only** (hanya baca). Setelah diterbitkan, Invoice tidak dapat diedit atau dihapus untuk menjaga kepatuhan audit keuangan perusahaan. Detail Invoice menampilkan garis pelacakan lengkap dari Quotation hingga pelunasan.
    </div>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/finance-invoice-detail.png">
      <div class="screenshot-caption">Gambar 6.2: Detail Faktur Akhir (Invoice Detail - Read-Only)</div>
    </div>

    <h3>Hasil Cetak Faktur Akhir (Invoice PDF)</h3>
    <p>Berikut adalah tampilan cetak Invoice Final resmi yang ditujukan kepada pelanggan untuk pelunasan tagihan:</p>
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-invoice.png">
      <div class="screenshot-caption">Gambar 6.3: Hasil Cetak Faktur Akhir (Invoice PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 7. Modul Spareparts
sections.push(`
  <div id="modul-spareparts" class="section">
    <h1 class="section-title">7. Modul Katalog Suku Cadang (Spareparts)</h1>
    <p>Sistem ini mengelola katalog suku cadang (*Spareparts*) industri beserta jumlah ketersediaan fisik yang dipisahkan berdasarkan cabang Jakarta dan Semarang.</p>

    <h3>Visibilitas Harga Suku Cadang Berdasarkan Hak Akses:</h3>
    <p>Untuk mencegah kebocoran data margin keuntungan perusahaan, tampilan katalog disesuaikan dengan peran pengguna:</p>
    <ul>
      <li><strong>Marketing</strong>: Hanya dapat melihat Kode Barang, Nama Barang, dan Jumlah Stok di masing-masing cabang. Seluruh kolom harga (Harga Jual, Harga Beli, dan Supplier) disembunyikan.</li>
      <li><strong>Inventory Admin / Purchase</strong>: Dapat melihat data stok dan harga beli supplier, tetapi harga jual penawaran disembunyikan.</li>
      <li><strong>Director</strong>: Memiliki hak akses penuh untuk melihat dan mengubah seluruh informasi harga jual dan beli suku cadang.</li>
    </ul>

    <h3>Bulk Upload Data Suku Cadang (Excel):</h3>
    <ol class="step-list">
      <li>Pilih menu <strong>Upload Data</strong>.</li>
      <li>Unduh template Excel resmi yang disediakan sistem.</li>
      <li>Isi daftar suku cadang baru beserta stok awal pada kolom cabang yang sesuai.</li>
      <li>Seret berkas Excel (.xlsx) ke area Dropzone atau klik untuk memilih berkas.</li>
      <li>Klik <strong>Upload</strong>. Sistem (Laravel maatwebsite/excel) akan memvalidasi data dan memperbarui basis data katalog secara massal.</li>
    </ol>
  </div>
  <div class="page-break"></div>
`);

// 8. Modul DO
sections.push(`
  <div id="modul-logistik-do" class="section">
    <h1 class="section-title">8. Modul Logistik: Pengiriman (Delivery Order) & Perintah Kerja (Work Order)</h1>
    
    <h2>8.1 Pengiriman Suku Cadang (Delivery Order)</h2>
    <p>Delivery Order (DO) diterbitkan otomatis oleh sistem ketika PO bertipe *Spareparts* yang berstatus <strong>DP Paid</strong> dan <strong>Ready</strong> diklik <strong>Release</strong> oleh admin gudang.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-do-list.png">
      <div class="screenshot-caption">Gambar 8.1: Daftar Surat Jalan Pengiriman (DO List)</div>
    </div>

    <h3>Langkah Pemrosesan DO:</h3>
    <ol class="step-list">
      <li>Di halaman PO yang telah dirilis, klik tombol pengiriman yang mengarah ke halaman DO.</li>
      <li>Isi formulir DO yang memuat:
        <ul>
          <li><strong>Ship Mode</strong>: Kurir internal, ekspedisi darat/laut, dll.</li>
          <li><strong>Order Type</strong>: Tipe pengiriman.</li>
          <li><strong>Penerima & Pemeriksa</strong>: Nama staf yang menyiapkan dan kurir yang membawa.</li>
        </ul>
      </li>
      <li>Setelah DO disimpan, status pengiriman berada dalam antrean <strong>Process</strong>.</li>
      <li>Ketika barang sampai di pelanggan, klik <strong>Process DO</strong> di detail DO untuk merubah status menjadi <strong>Done</strong>.</li>
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
        <div class="screenshot-caption">Gambar 8.2: Hasil Cetak Surat Penyerahan Barang (Delivery Order PDF)</div>
      </div>
      <div style="width: 48%; text-align: center;">
        <img class="screenshot" src="./playwright-screenshots/print-delivery-note.png" style="max-width: 100%;">
        <div class="screenshot-caption">Gambar 8.3: Hasil Cetak Surat Jalan Perjalanan (Delivery Note PDF)</div>
      </div>
    </div>

    <h2>8.2 Perintah Kerja Jasa Servis (Work Order)</h2>
    <p>Untuk PO yang bertipe *Service* (jasa pemeliharaan/perbaikan), proses <strong>Release</strong> oleh Service Admin akan menerbitkan dokumen <strong>Work Order (WO)</strong> untuk penugasan tim teknisi lapangan.</p>

    <h3>Langkah Pemrosesan WO:</h3>
    <ol class="step-list">
      <li>Pilih PO Jasa berstatus <strong>DP Paid</strong> dan klik <strong>Release</strong>.</li>
      <li>Masukkan detail penjadwalan servis (Tanggal Mulai, Tanggal Selesai, Teknisi yang Ditugaskan, dan unit yang diservis).</li>
      <li>Simpan untuk menerbitkan WO. Tekan tombol <strong>Print</strong> di detail WO untuk mencetak lembar penugasan resmi.</li>
    </ol>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-work-order.png">
      <div class="screenshot-caption">Gambar 8.4: Hasil Cetak Lembar Perintah Kerja Teknisi (Work Order PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 9. Modul Back Order
sections.push(`
  <div id="modul-logistik-bo" class="section">
    <h1 class="section-title">9. Modul Logistik: Inden & Kekurangan Stok (Back Order)</h1>
    <p>Sistem BMJ App mengamankan inventaris dengan melacak kekurangan suku cadang secara otomatis. Jika saat PO dirilis terdapat item yang kuantitasnya melebihi stok cabang saat itu, sistem otomatis memisahkan item tersebut ke dalam dokumen <strong>Back Order (BO)</strong>.</p>

    <h3>Alur Kerja Pemenuhan Back Order:</h3>
    <div class="flowchart-container">
      <div class="flow-step">
        <p>1. PO Rilis dengan Kekurangan Stok</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <p>2. Dokumen BO Terbentuk Otomatis (Status: Process)</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <p>3. Tim Purchase Membeli Barang ke Supplier (Modul Buy)</p>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <p>4. Stok Supplier Masuk (Meningkatkan Stok Cabang)</p>
      </div>
    </div>

    <h3>Langkah Penyelesaian BO di Gudang:</h3>
    <ol class="step-list">
      <li>Buka halaman detail Back Order terkait.</li>
      <li>Klik tombol <strong>Analyze</strong>. Sistem akan memeriksa apakah stok fisik saat ini sudah cukup untuk memenuhi kekurangan BO tersebut.</li>
      <li>Jika hasil analisis menyatakan stok **Cukup**, tombol <strong>Process</strong> akan aktif.</li>
      <li>Klik <strong>Process</strong>. Sistem akan langsung memotong stok cabang dan memperbarui status BO menjadi <strong>Done</strong> (selesai terpenuhi).</li>
    </ol>

    <h3>Mengubah Suku Cadang Pengganti (Adjustment Workflow):</h3>
    <p>Jika suku cadang asli yang diinden tidak lagi tersedia dari supplier, Inventory dapat melakukan penyesuaian (*Adjustment*):</p>
    <ul>
      <li>Buka halaman <strong>Back Order Adjustment</strong> untuk BO tersebut.</li>
      <li>Tambahkan sparepart alternatif sebagai pengganti suku cadang asli.</li>
      <li>**Aturan Validasi**: Kuantitas total barang yang disesuaikan/diganti harus setara dengan kuantitas order awal demi menjaga konsistensi nilai pesanan PO asli.</li>
    </ul>
  </div>
  <div class="page-break"></div>
`);

// 10. Modul Purchase (Buy)
sections.push(`
  <div id="modul-logistik-buy" class="section">
    <h1 class="section-title">10. Modul Pengadaan: Pembelian Barang (Buy / Purchase)</h1>
    <p>Modul Purchase (di basis data disebut <code>Buy</code>) adalah alat pengadaan barang yang digunakan oleh peran **Inventory Purchase** untuk memesan suku cadang kepada Supplier eksternal guna mengisi kembali kekurangan stok gudang.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/inventoryPurchase-purchase-list.png">
      <div class="screenshot-caption">Gambar 10.1: Daftar Pembelian Supplier (Purchase/Buy List)</div>
    </div>

    <h3>Langkah Membuat Pengadaan Pembelian (Buy):</h3>
    <ol class="step-list">
      <li>Masuk ke menu <strong>Purchase</strong> dan klik <strong>Add Purchase</strong>.</li>
      <li>Pilih <strong>Supplier / Seller</strong> dari daftar seller terdaftar.</li>
      <li>Pilih <strong>Cabang Target</strong> yang akan menerima barang (Jakarta / Semarang).</li>
      <li>Masukkan baris sparepart yang ingin dibeli beserta jumlah dan harga beli dari supplier.</li>
      <li>Klik <strong>Add Purchase</strong>. Status awal transaksi adalah <strong>Wait for Review</strong>.</li>
    </ol>

    <h3>Alur Persetujuan & Penerimaan Barang:</h3>
    <ul>
      <li><strong>Review Director</strong>: Transaksi pembelian wajib ditinjau oleh Director. Director dapat memilih untuk menyetujui (*Approve*) atau menolak (*Reject*).</li>
      <li><strong>Proses Masuk Gudang (Done / Received)</strong>: Setelah barang fisik tiba di gudang dari supplier, klik tombol <strong>Done</strong> pada detail Purchase yang disetujui. Aksi ini secara otomatis memicu penambahan stok fisik sparepart pada cabang target yang dituju.</li>
    </ul>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/inventoryPurchase-purchase-add.png">
      <div class="screenshot-caption">Gambar 10.2: Formulir Pembuatan Pengadaan Pembelian (Buy/Purchase)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 11. Modul Peminjaman (Borrow)
sections.push(`
  <div id="modul-logistik-borrow" class="section">
    <h1 class="section-title">11. Modul Logistik: Peminjaman Suku Cadang (Borrow)</h1>
    <p>Modul Peminjaman Suku Cadang (*Borrow*) memfasilitasi penggunaan barang gudang untuk operasional pengerjaan servis (Work Order) sebelum suku cadang tersebut ditagihkan secara resmi kepada pelanggan.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/marketing-borrow-list.png">
      <div class="screenshot-caption">Gambar 11.1: Daftar Peminjaman Barang (Borrow List)</div>
    </div>

    <h3>Siklus Status & Aksi Peminjaman:</h3>
    <p>Peminjaman memiliki alur ketat dengan hak akses berbasis peran:</p>
    <ul>
      <li><strong>Created</strong>: Permohonan dibuat oleh Marketing dengan memilih PO Servis dan mendaftarkan suku cadang serta jumlah yang dipinjam.</li>
      <li><strong>Approved</strong>: Permohonan disetujui oleh Head Inventory atau Director.</li>
      <li><strong>Send</strong>: Barang diserahkan ke tim teknisi. **Aksi Send memicu pemotongan stok fisik gudang**. Tombol cetak PDF peminjaman aktif pada status ini untuk ditandatangani.</li>
      <li><strong>Returned</strong>: Teknisi mengembalikan sisa suku cadang yang tidak terpakai ke gudang (Marketing mengisi jumlah yang dikembalikan di form kembali).</li>
      <li><strong>Done</strong>: Rekonsiliasi selesai, stok yang dikembalikan masuk kembali ke gudang.</li>
    </ul>

    <div class="alert alert-danger">
      <strong>Aturan Penting Rekonsiliasi (Done Borrow):</strong>
      <p>Pada saat peminjaman diselesaikan (Done), sistem memeriksa jumlah suku cadang yang digunakan (Kuantitas Dipinjam − Kuantitas Dikembalikan).</p>
      <p>Jika ada selisih barang yang terpakai/hilang, **sistem mewajibkan pengguna untuk memilih/mengaitkan dokumen PO Spareparts baru** yang menampung pembelian suku cadang tersebut sebelum status peminjaman dapat diubah menjadi <strong>Done</strong>. Hal ini menjamin barang yang keluar dari gudang selalu berakhir dengan penagihan tagihan resmi.</p>
    </div>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/marketing-borrow-add.png">
      <div class="screenshot-caption">Gambar 11.2: Formulir Pengajuan Peminjaman Barang Baru</div>
    </div>

    <h3>Hasil Cetak Surat Peminjaman Barang (Borrow PDF)</h3>
    <p>Berikut adalah tampilan cetak formulir Peminjaman Barang gudang yang ditandatangani untuk penyerahan barang ke teknisi:</p>
    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/print-borrow.png">
      <div class="screenshot-caption">Gambar 11.3: Hasil Cetak Surat Peminjaman Suku Cadang (Borrow PDF)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 12. Modul Mutasi & Riwayat Stok
sections.push(`
  <div id="modul-logistik-movement" class="section">
    <h1 class="section-title">12. Modul Logistik: Mutasi Barang & Riwayat Pergerakan Stok</h1>
    
    <h2>Mutasi Suku Cadang (Sparepart Movement)</h2>
    <p>Digunakan untuk mentransfer ketersediaan suku cadang antar cabang gudang (Jakarta ↔ Semarang) untuk menyeimbangkan kebutuhan logistik operasional.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-movement-list.png">
      <div class="screenshot-caption">Gambar 12.1: Daftar Mutasi Cabang (Movement List)</div>
    </div>
    
    <h3>Alur Siklus Status Mutasi:</h3>
    <ol class="step-list">
      <li><strong>Created</strong>: Admin gudang asal membuat permohonan mutasi barang dan jumlahnya.</li>
      <li><strong>Send</strong>: Gudang asal mengirimkan barang. **Stok di gudang asal langsung berkurang**.</li>
      <li><strong>Received</strong>: Gudang tujuan mengonfirmasi barang telah tiba fisik dan sesuai. **Stok di gudang tujuan bertambah**. Mutasi berakhir di status Done.</li>
    </ol>

    <h2>Riwayat Pergerakan Stok (Stock History)</h2>
    <p>Merupakan modul audit log *Read-Only* (hanya baca) yang mencatat setiap mutasi stok keluar dan masuk suku cadang secara detail. Setiap entri mencatat tipe transaksi asal (Pesanan PO, Pembelian Buy, Retur, Mutasi, Peminjaman, atau impor manual), identitas admin, kuantitas perubahan stok, dan cap tanggal.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/inventoryAdmin-stock-history.png">
      <div class="screenshot-caption">Gambar 12.2: Laporan Audit Riwayat Pergerakan Stok (Stock History)</div>
    </div>
  </div>
  <div class="page-break"></div>
`);

// 13. Modul Administrasi
sections.push(`
  <div id="modul-administrasi" class="section">
    <h1 class="section-title">13. Modul Kepegawaian, Keamanan, & Pengaturan Global</h1>
    
    <h2>Manajemen Karyawan (Employee CRUD)</h2>
    <p>Direktur dapat menambah, mengedit, atau menonaktifkan akun karyawan serta mengelola cabang tugas mereka.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/director-employee-list.png">
      <div class="screenshot-caption">Gambar 13.1: Daftar Karyawan BMJ App (Employee List)</div>
    </div>
    
    <h3>Alur Kata Sandi Sementara (Temporary Password):</h3>
    <ol class="step-list">
      <li>Saat membuat akun baru atau melakukan reset sandi, Director memberikan kata sandi sementara (*Temporary Password*).</li>
      <li>Saat karyawan tersebut pertama kali login menggunakan sandi sementara, sistem mendeteksi bendera <code>must_change_password</code> dari server.</li>
      <li>Sistem langsung mengarahkan pengguna ke halaman penggantian kata sandi baru. Pengguna **tidak dapat mengakses menu atau fitur apa pun sebelum mengganti sandi sementara tersebut** demi alasan keamanan informasi perusahaan.</li>
    </ol>

    <h2>Pengaturan Global (General Settings)</h2>
    <p>Director mengelola parameter bisnis global yang berdampak pada modul penawaran (Quotation):</p>
    <ul>
      <li><strong>Discount Rate (%)</strong>: Batas diskon dasar suku cadang. Penawaran di bawah batas ini otomatis memicu review.</li>
      <li><strong>PPN Rate (%)</strong>: Tarif pajak pertambahan nilai penutupan transaksi (misal: 11%).</li>
      <li><strong>Currency Converter</strong>: Kurs dasar konversi mata uang asing untuk katalog suku cadang.</li>
    </ul>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/director-general-settings.png">
      <div class="screenshot-caption">Gambar 13.2: Formulir Pengaturan Global Sistem (General Settings)</div>
    </div>

    <h2>Dasbor Analitik (Dashboard)</h2>
    <p>Menampilkan grafik interaktif penjualan bulanan, rasio jenis proyek (Spareparts vs Service), serta kartu ringkasan omzet berjalan yang disaring berdasarkan hak akses pengguna.</p>

    <div class="screenshot-container">
      <img class="screenshot" src="./playwright-screenshots/director-dashboard-analytics.png">
      <div class="screenshot-caption">Gambar 13.3: Dasbor Analitik & Grafik Penjualan Terintegrasi</div>
    </div>
  </div>
`);

// HTML page layout compilation
const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Pengguna BMJ App</title>
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
      font-size: 38px;
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
    .cover-meta p {
      margin: 4px 0;
    }

    /* General Typography */
    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      color: #1e3a8a;
      page-break-after: avoid;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 18px;
      margin-top: 25px;
      margin-bottom: 15px;
    }
    h3 {
      font-size: 15px;
      color: #0f172a;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    
    /* Table of Contents */
    .toc-section {
      padding: 20px;
    }
    .toc-list {
      list-style-type: none;
      padding-left: 0;
    }
    .toc-list li {
      font-size: 16px;
      margin-bottom: 12px;
      border-bottom: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
    }
    .toc-list a {
      color: #1e3a8a;
      text-decoration: none;
      font-weight: 500;
    }

    /* Lists */
    .step-list {
      padding-left: 20px;
      margin-bottom: 20px;
    }
    .step-list li {
      margin-bottom: 8px;
      padding-left: 5px;
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
      padding: 10px 12px;
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

    /* Flowchart / Lifecycle Visualizers */
    .flowchart-container {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    .flow-step {
      text-align: center;
      width: 22%;
    }
    .flow-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      color: white;
      margin-bottom: 8px;
    }
    .badge-quotation { background-color: #3b82f6; }
    .badge-po { background-color: #10b981; }
    .badge-pi { background-color: #f59e0b; }
    .badge-invoice { background-color: #8b5cf6; }
    .flow-desc {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .flow-arrow {
      font-size: 20px;
      color: #cbd5e1;
      font-weight: bold;
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

    /* Inline Code */
    code {
      font-family: monospace;
      background-color: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: #0f172a;
    }
  </style>
</head>
<body>
  ${sections.join('\n')}
</body>
</html>
`;

// Compile PDF via Playwright
(async () => {
  try {
    const htmlPath = path.join(__dirname, 'manual.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('HTML manual written to', htmlPath);

    console.log('Launching Playwright Chromium...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set the HTML content
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

    console.log('Generating PDF...');
    const pdfPath = path.join(__dirname, 'Buku_Panduan_BMJ_App.pdf');
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
          PT BERKAT MEGAH JAYA &bull; BUKU PANDUAN PENGGUNA BMJ APP
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; width: 100%; text-align: center; color: #94a3b8; font-family: 'Inter', sans-serif; border-top: 1px solid #e2e8f0; padding-top: 5px; margin: 0 40px;">
          Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span> &bull; Rahasia Perusahaan
        </div>
      `
    });

    console.log('PDF generated successfully at:', pdfPath);
    await browser.close();

    // Clean up temporary HTML file
    fs.unlinkSync(htmlPath);
    console.log('Temporary HTML file cleaned up.');
  } catch (err) {
    console.error('Error compiling PDF:', err);
    process.exit(1);
  }
})();
