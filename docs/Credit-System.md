# Credit-System.md — PotretAI v3
*Sistem Generate Limit · Monthly Reset · Tidak Ada Token/Kredit*

---

## 1. Filosofi Sistem

PotretAI v3 **tidak menggunakan sistem kredit, token, atau koin.**

Sistem yang dipakai adalah **generate limit bulanan** — sederhana, transparan, dan mudah dipahami oleh pengguna Indonesia.

```
SEBELUM (sistem lama)   →   SESUDAH (sistem baru)
────────────────────────────────────────────────
Token / Kredit          →   Generate per bulan
Beli top-up             →   Tidak ada top-up
Saldo habis             →   Limit habis, tunggu reset
Harga per generate      →   Bayar paket, bukan per foto
Kompleks                →   Simpel
```

**Prinsip utama:**
- User membayar **paket akses** — bukan per foto
- Limit generate **reset otomatis** setiap tanggal 1
- Tidak ada cara untuk menambah limit (tidak ada top-up)
- Tidak ada carry-over — sisa bulan lalu tidak terbawa

---

## 2. Limit per Paket

| Paket | Generate per Bulan | Cara Hitung | Reset |
|-------|-------------------|-------------|-------|
| Free | 0 | Tidak bisa generate | — |
| Founding Base | 50 | Per sesi = 4 gambar | Tanggal 1 |
| Founding Premium | 200 | Per sesi = 4 gambar | Tanggal 1 |
| Studio Annual | 50 | Per sesi = 4 gambar | Tanggal 1 |
| Premium Annual | 200 | Per sesi = 4 gambar | Tanggal 1 |

**Satuan generate:**
- 1 sesi generate = 4 gambar sekaligus (selalu 4 — tidak bisa kurang)
- Deduction: -4 dari limit setiap kali tombol generate ditekan
- Founding Base: maksimal **12 sesi** per bulan (12 × 4 = 48 gambar)
- Founding Premium: maksimal **50 sesi** per bulan (50 × 4 = 200 gambar)

---

## 3. Reset Bulanan

### Kapan Reset Terjadi

```
Reset otomatis: Tanggal 1 setiap bulan, pukul 00:00 WIB
```

Bukan rolling 30 hari — tapi calendar month. Artinya:
- User beli di tanggal 28 Maret → limit 50
- Tanggal 1 April → limit reset ke 50 lagi
- User hanya dapat 3 hari di bulan pertama — ini normal dan sudah tertulis di FAQ

### Logika Reset

```js
// Dipanggil setiap kali user mulai sesi app
async function checkAndResetMonthlyLimit(userId) {
  const user = await db.users.findById(userId);
  const now = new Date();
  const lastReset = new Date(user.last_reset_at);

  const isSameMonth =
    now.getFullYear() === lastReset.getFullYear() &&
    now.getMonth()    === lastReset.getMonth();

  if (!isSameMonth) {
    await db.users.update(userId, {
      generate_used: 0,
      last_reset_at: now.toISOString(),
    });
    console.log(`[Reset] User ${userId} — limit direset untuk ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`);
  }
}
```

### Notifikasi Reset ke User

Email otomatis tanggal 1 setiap bulan (hanya untuk user berbayar):

```
Subject: 🔄 Limit generatemu sudah direset — PotretAI

Halo [Nama],

Selamat datang di bulan baru! 🎉

Limit generate foto AI kamu sudah direset:
  Paket : Founding Premium
  Limit : 200 foto / bulan
  Berlaku: 1 April – 30 April 2025

Mulai buat foto AI profesionalmu sekarang:
[Buka PotretAI Studio]

Salam,
Tim PotretAI
```

---

## 4. Tracking Generate Usage

### Database Field

```sql
ALTER TABLE users ADD COLUMN generate_used   INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN generate_limit  INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_reset_at   TIMESTAMPTZ DEFAULT now();

-- generate_limit diisi saat aktivasi paket:
-- Free          → 0
-- Base tier     → 50
-- Premium tier  → 200
```

### Deduction Flow

```js
// Urutan eksekusi saat user klik tombol Generate
async function handleGenerate(userId, tab, params) {

  // 1. Reset jika bulan baru
  await checkAndResetMonthlyLimit(userId);

  // 2. Ambil data user terbaru
  const user = await db.users.findById(userId);

  // 3. Validasi akses
  if (!AccessControl.canAccessTab(user.tier, tab)) {
    throw { code: 'NO_TAB_ACCESS', tab };
  }

  // 4. Validasi limit
  if (user.generate_used + 4 > user.generate_limit) {
    throw { code: 'LIMIT_EXCEEDED', remaining: user.generate_limit - user.generate_used };
  }

  // 5. Deduct dulu sebelum generate (pessimistic deduction)
  await db.users.update(userId, {
    generate_used: user.generate_used + 4
  });

  try {
    // 6. Generate gambar (4 paralel)
    const results = await FalEngine.generateBatch(params);

    // 7. Simpan ke history
    await saveToHistory(userId, results, tab);

    return results;

  } catch (err) {
    // 8. Jika generate gagal, kembalikan limit
    await db.users.update(userId, {
      generate_used: user.generate_used  // rollback
    });
    throw err;
  }
}
```

---

## 5. UI Copy — Semua State Limit

### State 1: Banyak Sisa
```
📸 Sisa 180 foto bulan ini
```

### State 2: Pertengahan (40–75% terpakai)
```
📸 Sisa 85 foto · Reset 1 Mei
```

### State 3: Hampir Habis (>75% terpakai)
```
⚠️ Sisa 12 foto bulan ini — hampir habis
Reset otomatis 1 Mei 2025
```

### State 4: Habis
```
🔒 Limit bulan ini sudah habis
Reset otomatis pada 1 Mei 2025
Sementara itu, lihat hasil foto sebelumnya di Riwayat
```

### State 5: Akun Free
```
🔒 Akun Gratis tidak bisa generate foto
Pilih paket untuk mulai membuat foto AI profesional
[Lihat Paket] →
```

### State 6: Annual Expired
```
⏰ Akses tahunanmu sudah berakhir
Perpanjang untuk melanjutkan generate foto AI
[Perpanjang Sekarang] →
```

---

## 6. FAQ untuk User — Bahasa Indonesia

**Q: Kenapa limit saya tiba-tiba habis?**
A: Setiap kali kamu menekan tombol Generate, sistem membuat 4 foto sekaligus dan mengurangi limit sebesar 4. Jika kamu generate 5 kali, berarti 20 foto sudah terpakai dari limitmu.

**Q: Apakah bisa beli tambahan limit?**
A: Tidak. PotretAI tidak menjual top-up atau kredit tambahan. Semua limit sudah termasuk dalam paket yang kamu beli. Limit akan reset otomatis setiap tanggal 1.

**Q: Sisa limit bulan lalu bisa dibawa ke bulan ini?**
A: Tidak. Sisa limit tidak bisa dibawa ke bulan berikutnya. Ini berlaku untuk semua paket.

**Q: Bagaimana cara tahu sisa limit saya?**
A: Kamu bisa lihat sisa limit di pojok kanan atas aplikasi (topbar), atau masuk ke halaman Akun untuk detail lengkap.

**Q: Reset tanggal 1 — apakah jam 00:00 tepat?**
A: Ya, reset terjadi otomatis pada pukul 00:00 WIB setiap tanggal 1. Setelah reset, limit langsung tersedia untuk digunakan.

---

## 7. Tidak Ada Fitur Berikut

Daftar ini untuk menghindari kebingungan developer saat build:

```
❌ Token purchase
❌ Credit balance
❌ Top-up limit
❌ Carry-over sisa limit
❌ Bonus kredit referral
❌ Lifetime generate unlimited
❌ Per-image pricing
❌ Paket berdasarkan jumlah foto
❌ Flash sale kredit
```

Jika ada permintaan fitur di atas, tunda sampai ada analisis dampak unit economics yang jelas.

---

*PotretAI v3 — Credit System (Generate Limit) · v3.0*
