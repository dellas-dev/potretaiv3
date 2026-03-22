# Beta Deploy Checklist

## Tujuan

Checklist ini dipakai sebelum membuka PotretAI v3 ke 10-20 user beta pertama.

## 1. Environment Variables / Secrets

Pastikan worker production sudah memiliki semua secret / env berikut:

- `FAL_KEY`
- `REPLICATE_KEY` (jika fallback masih dipakai)
- `R2_CDN_BASE`
- `ADMIN_KEY`
- `BETA_MODE`
- `BETA_ALLOWLIST`

## 2. Beta Access Settings

Untuk limited launch yang ketat:

- set `BETA_MODE=on`
- isi `BETA_ALLOWLIST` dengan daftar `user_id` beta, dipisahkan koma

Contoh:

```env
BETA_MODE=on
BETA_ALLOWLIST=usr_a1b2c3,usr_d4e5f6,usr_g7h8i9
```

## 3. Deploy Order

Urutan deploy yang disarankan:

1. deploy worker
2. verifikasi route health `/`
3. verifikasi `GET /beta-status/{user_id}`
4. deploy frontend
5. login sebagai user beta
6. test upload wajah
7. test generate `Studio Foto`
8. test generate `Wisuda`
9. test generate `Beauty Retouch`
10. test create order dan submit proof
11. test approve/reject order via admin helper

## 4. Minimum Route Checks

Pastikan route berikut merespons normal:

- `GET /`
- `GET /get-credit/{user_id}`
- `GET /history/{user_id}`
- `GET /beta-status/{user_id}`
- `POST /upload-face`
- `POST /generate-pulid`
- `POST /generate-beauty-retouch`
- `POST /create-order`
- `POST /submit-payment-proof`
- `POST /verify-payment`
- `POST /admin-stats`

## 5. Frontend Checks

- logo tampil
- credit badge tampil
- paket aktif sesuai tier
- `Spark` tidak melihat `Beauty Retouch`
- `Spark` tidak bisa `4 foto`
- `Signature/Prestige` melihat `Beauty Retouch`
- result cards punya CTA yang benar

## 6. Payment Checks

- create order menghasilkan `order_id`
- QRIS modal menampilkan `order_id`
- proof upload sukses
- admin approve menambah kredit / paket
- reject tidak menambah kredit

## 7. Monitoring Checks

Di admin helper, cek:

- `Refresh Stats`
- `Run System Check`
- order summary bergerak
- recent generate logs muncul
- beta status terbaca benar

## 8. Launch Guardrails

- mulai hanya 10-20 user
- jangan buka semua preset sekaligus di `Spark`
- jangan ubah default `2 foto`
- jangan nonaktifkan refund generate gagal
- pantau retry rate harian

## 9. Exit Criteria Sebelum Menambah User

- generate success rate stabil
- payment flow stabil
- credit balance sinkron backend/frontend
- support burden masih terkendali
- Beauty Retouch hasilnya believable
- tidak ada mismatch tier di frontend
