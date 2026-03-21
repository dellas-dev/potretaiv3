# Payment-Flow.md — PotretAI v3
*Alur Pembayaran · QRIS Manual · Verifikasi Admin · State Machine*

---

## 1. Overview Sistem Pembayaran

PotretAI v3 menggunakan **QRIS manual** sebagai satu-satunya metode pembayaran.

Tidak ada payment gateway otomatis. Setiap transaksi diverifikasi secara manual oleh admin sebelum akun diaktivasi.

### Mengapa QRIS Manual?

| Alasan | Detail |
|--------|--------|
| Biaya setup Rp 0 | Tidak perlu integrasi Midtrans, Xendit, atau Stripe |
| Familiar untuk Indonesia | Semua app e-wallet mendukung QRIS |
| Cocok untuk fase awal | Volume transaksi masih terkontrol (max 100 Founding) |
| Tidak butuh server payment | Tidak ada webhook, tidak ada API key payment |
| Langsung cair ke DANA | Tidak ada holding period seperti payment gateway |

**Catatan:** Setelah user melewati 100 transaksi/bulan, evaluasi migrasi ke Xendit atau Midtrans.

---

## 2. Metode Pembayaran yang Diterima

QRIS PotretAI dapat dibayar dari semua aplikasi berikut:

| Aplikasi | Logo | Cara Bayar |
|----------|------|-----------|
| DANA | 🔵 | Scan QRIS → Konfirmasi |
| GoPay | 🟢 | Scan QRIS → Konfirmasi |
| OVO | 🟣 | Scan QRIS → Konfirmasi |
| ShopeePay | 🟠 | Scan QRIS → Konfirmasi |
| LinkAja | 🔴 | Scan QRIS → Konfirmasi |
| BCA Mobile | 🔵 | m-BCA → Scan QRIS |
| BRI Mobile | 🔵 | BRImo → Scan QRIS |
| BNI Mobile | 🟠 | BNI Mobile → Scan QRIS |
| Mandiri | 🟡 | Livin → Scan QRIS |
| Bank lain | — | Mobile banking → Scan QRIS |

**QRIS Provider:** DANA Personal QRIS
**Nama penerima:** [Nama pemilik akun DANA]
**Nominal:** Sesuai paket yang dipilih (tidak boleh kurang atau lebih)

---

## 3. Alur Pembayaran Lengkap

### State Machine

```
[FREE USER]
     │
     │ Klik "Beli Paket" / "Upgrade"
     ▼
[PILIH PAKET]
  • Founding Base  — Rp 197.000
  • Founding Premium — Rp 497.000
     │
     │ Klik "Lanjut ke Pembayaran"
     ▼
[HALAMAN PAYMENT]
  • Tampil QRIS image
  • Tampil instruksi scan
  • Tampil nominal yang harus dibayar
  • Tampil batas upload bukti (24 jam)
     │
     │ User scan QRIS + bayar
     │ User screenshot bukti bayar
     ▼
[UPLOAD BUKTI]
  • Form upload screenshot
  • Input nama WhatsApp
  • Input email akun PotretAI
  • Tombol Submit
     │
     │ Submit berhasil
     ▼
[PENDING VERIFICATION]
  • Status akun: "Menunggu Verifikasi"
  • Notifikasi masuk ke admin (WA + email)
  • UI menampilkan: "Pembayaran sedang diverifikasi"
  • Estimasi: 1×24 jam pada hari kerja
     │
     ├── [Admin TOLAK] ──────────────────────────────────────────┐
     │                                                           ▼
     │                                              [BUKTI DITOLAK]
     │                                              • Notif WA ke user
     │                                              • Alasan penolakan
     │                                              • User bisa upload ulang
     │
     └── [Admin TERIMA] ────────────────────────────────────────┐
                                                                ▼
                                                   [AKUN DIAKTIVASI]
                                                   • Tier diupdate di DB
                                                   • Notif WA: "Akun aktif!"
                                                   • User bisa langsung generate
```

---

## 4. Halaman Payment — Spesifikasi UI

### URL
```
/payment?package=founding_base
/payment?package=founding_premium
/payment?package=studio_annual    ← aktif di Fase 2
/payment?package=premium_annual   ← aktif di Fase 2
```

### Konten yang WAJIB Ada

```html
<!-- Struktur halaman payment -->

[1] HEADER
  Logo PotretAI
  Judul: "Pembayaran Paket [Nama Paket]"

[2] RINGKASAN PAKET
  Nama paket
  Daftar fitur (checklist)
  Harga: Rp XXX.000
  Durasi: Seumur hidup / 365 hari

[3] INSTRUKSI PEMBAYARAN
  Step 1: Buka aplikasi e-wallet kamu
  Step 2: Pilih menu "Scan QR" atau "Bayar"
  Step 3: Scan kode QRIS di bawah ini
  Step 4: Masukkan nominal TEPAT Rp XXX.000
  Step 5: Konfirmasi pembayaran
  Step 6: Screenshot bukti pembayaran
  Step 7: Upload bukti di bawah ini

[4] QRIS IMAGE
  Gambar QRIS besar (min 300×300px)
  Tombol "Download QRIS" (untuk bayar via PC)
  Nama penerima: [Nama DANA]
  Nominal: Rp XXX.000

[5] WARNING NOMINAL
  ⚠️ Bayar TEPAT Rp XXX.000
  Pembayaran kurang atau lebih akan ditolak otomatis

[6] FORM UPLOAD BUKTI
  Input: Nama lengkap
  Input: Email akun PotretAI
  Input: Nomor WhatsApp (untuk notifikasi)
  Upload: Screenshot bukti pembayaran (JPG/PNG, max 5MB)
  Checkbox: "Saya menyetujui bahwa pembayaran tidak dapat dikembalikan setelah akun diaktivasi"
  Tombol: "Kirim Bukti Pembayaran"

[7] KONTAK ADMIN
  "Ada pertanyaan? Hubungi kami:"
  Tombol WhatsApp: wa.me/62XXXXXXXXXX
  Teks: "Chat Admin PotretAI"

[8] DISCLAIMER
  • Verifikasi dilakukan dalam 1×24 jam pada hari kerja
  • Pembayaran tidak dapat dikembalikan setelah aktivasi
  • Pastikan email yang kamu masukkan sama dengan akun PotretAI kamu
```

---

## 5. Admin Panel — Verifikasi Pembayaran

### Notifikasi Masuk ke Admin

Setiap ada submission bukti bayar, admin menerima notifikasi via:

**WhatsApp (template pesan otomatis):**
```
🔔 PEMBAYARAN BARU — PotretAI

Paket    : Founding Premium (Rp 497.000)
Nama     : Budi Santoso
Email    : budi@gmail.com
WA       : 081234567890
Waktu    : 14 Mar 2025, 14:23 WIB

[Lihat Bukti Bayar]
[Aktivasi Akun] | [Tolak]
```

**Email notif admin:**
```
Subject: [PotretAI] Verifikasi Pembayaran — Founding Premium

User: budi@gmail.com
Paket: Founding Premium
Nominal: Rp 497.000
Bukti: [attachment screenshot]

Login ke admin panel untuk verifikasi:
https://potretai.com/admin/payments
```

### Checklist Verifikasi Admin

Sebelum mengaktivasi akun, admin wajib memastikan:

```
□ Nominal yang diterima TEPAT sesuai paket
□ Nama penerima di bukti = nama DANA PotretAI
□ Tanggal transaksi = hari ini atau kemarin (max 24 jam)
□ Screenshot tidak terlihat diedit/dipalsukan
□ Email di form = email yang terdaftar di sistem
□ Slot Founding Member masih tersedia (jika Founding)
```

### Aksi Admin Setelah Verifikasi

**Jika DITERIMA:**
```
1. Update user tier di database:
   users.set({ tier: 'founding_premium', status: 'active',
   activated_at: now(), expires_at: null })

2. Kirim notif WA ke user:
   "✅ Pembayaranmu sudah dikonfirmasi!
   Akun PotretAI Premium kamu sudah aktif.
   Silakan login dan mulai buat foto AI profesional kamu.
   potretai.com/app"

3. Kirim email konfirmasi ke user

4. Update counter slot Founding di dashboard
```

**Jika DITOLAK:**
```
1. Kirim notif WA ke user dengan alasan:
   "❌ Maaf, bukti pembayaranmu tidak dapat diverifikasi.
   Alasan: [nominal tidak sesuai / bukti tidak valid / dll]
   Silakan upload ulang atau hubungi admin."

2. Status kembali ke 'pending_upload' — user bisa submit ulang
```

---

## 6. Database Schema — Payment

```sql
-- Tabel payment_submissions
CREATE TABLE payment_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  package_id      VARCHAR(50) NOT NULL,  -- 'founding_base' | 'founding_premium' | dll
  amount          INTEGER NOT NULL,       -- dalam rupiah
  full_name       VARCHAR(255) NOT NULL,
  whatsapp        VARCHAR(20) NOT NULL,
  proof_image_url TEXT NOT NULL,         -- URL screenshot yang diupload
  status          VARCHAR(20) DEFAULT 'pending',
                  -- 'pending' | 'verified' | 'rejected'
  rejection_reason TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  verified_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES admins(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Tabel user access
CREATE TABLE users (
  id              UUID PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  tier            VARCHAR(30) DEFAULT 'free',
                  -- 'free' | 'founding_base' | 'founding_premium'
                  -- | 'studio_annual' | 'premium_annual'
  status          VARCHAR(20) DEFAULT 'active',
  activated_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,           -- NULL untuk founding (no expiry)
  is_founding     BOOLEAN DEFAULT false,
  generate_used   INTEGER DEFAULT 0,     -- reset setiap bulan
  generate_limit  INTEGER DEFAULT 0,     -- 0=free, 50=base, 200=premium
  last_reset_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Generate Limit — Enforcement

```js
// Middleware: cek limit sebelum generate
async function checkGenerateLimit(userId) {
  const user = await db.users.findById(userId);

  // Cek status akun
  if (user.status !== 'active') {
    throw new Error('ACCOUNT_INACTIVE');
  }

  // Cek expiry (untuk annual tier)
  if (user.expires_at && new Date() > user.expires_at) {
    await db.users.update(userId, { tier: 'free', generate_limit: 0 });
    throw new Error('ACCESS_EXPIRED');
  }

  // Cek apakah perlu reset bulanan
  const now = new Date();
  const lastReset = new Date(user.last_reset_at);
  if (now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()) {
    await db.users.update(userId, {
      generate_used: 0,
      last_reset_at: now
    });
    user.generate_used = 0;
  }

  // Cek sisa limit
  if (user.generate_limit === 0) {
    throw new Error('NO_ACCESS');         // akun Free
  }
  if (user.generate_used >= user.generate_limit) {
    throw new Error('LIMIT_EXCEEDED');    // sudah habis bulan ini
  }

  return true;
}

// Setelah generate berhasil
async function incrementGenerateCount(userId) {
  await db.users.increment(userId, 'generate_used', 4); // +4 per sesi (4 gambar)
}
```

**Pesan error yang ditampilkan ke user:**

```js
const ERROR_MESSAGES = {
  NO_ACCESS: {
    title: 'Akun Gratis Tidak Bisa Generate',
    body: 'Pilih paket untuk mulai membuat foto AI profesional.',
    cta: 'Lihat Paket',
    ctaUrl: '/pricing'
  },
  LIMIT_EXCEEDED: {
    title: 'Limit Bulan Ini Sudah Habis',
    body: 'Limit generasimu sudah terpakai semua bulan ini. Limit akan reset otomatis pada tanggal 1 bulan depan.',
    cta: null
  },
  ACCESS_EXPIRED: {
    title: 'Akses Tahunanmu Sudah Berakhir',
    body: 'Perpanjang akses untuk terus membuat foto AI profesional.',
    cta: 'Perpanjang Sekarang',
    ctaUrl: '/pricing'
  },
  ACCOUNT_INACTIVE: {
    title: 'Akun Sedang Diverifikasi',
    body: 'Pembayaranmu sedang diverifikasi admin. Biasanya selesai dalam 1×24 jam.',
    cta: 'Cek Status',
    ctaUrl: '/account'
  }
};
```

---

## 8. Pesan WhatsApp Admin — Template Lengkap

Nomor WA admin yang tampil di halaman payment:

```
wa.me/62XXXXXXXXXX?text=Halo+Admin+PotretAI,+saya+sudah+melakukan+pembayaran+paket+[NAMA_PAKET].+Email+saya+[EMAIL].+Mohon+konfirmasinya.
```

**Template balasan admin (copy-paste):**

Konfirmasi berhasil:
```
✅ Halo [Nama]!

Pembayaran Rp [nominal] untuk paket [nama paket] sudah kami terima dan konfirmasi.

Akun PotretAI kamu sudah aktif sekarang!
Silakan login di: potretai.com

Selamat berkreasi 🎉
Tim PotretAI
```

Bukti tidak valid:
```
❌ Halo [Nama],

Maaf, bukti pembayaran yang kamu kirimkan tidak bisa kami verifikasi karena:
[alasan]

Silakan upload ulang melalui:
potretai.com/payment/resubmit

Atau hubungi kami jika ada pertanyaan.
Tim PotretAI
```

---

## 9. Skalabilitas — Rencana Migrasi Payment

Ketika volume melebihi 100 transaksi/bulan, migrasi ke payment gateway otomatis:

| Volume | Rekomendasi |
|--------|------------|
| < 100 transaksi/bulan | QRIS Manual (sekarang) |
| 100–500 transaksi/bulan | Xendit (biaya 2.5% per transaksi) |
| > 500 transaksi/bulan | Midtrans + custom dashboard |

Migrasi tidak mengubah logika akses — hanya mengganti layer verifikasi dari manual ke otomatis.

---

*PotretAI v3 — Payment Flow · QRIS Manual · v3.0*
