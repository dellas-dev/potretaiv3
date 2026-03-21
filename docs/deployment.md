# PotretAI v3 — Deployment Guide

Panduan lengkap untuk deploy PotretAI v3 ke production:

- **Frontend** → Cloudflare Pages di `https://potretai.studiocreative.id`
- **API Worker** → Cloudflare Worker di `https://api.potretai.studiocreative.id`

---

## Prasyarat

1. Akun Cloudflare (free tier cukup untuk mulai)
2. Domain `studiocreative.id` sudah di-manage di Cloudflare DNS
3. Node.js ≥ 18 dan npm terinstall
4. Wrangler CLI: `npm install -g wrangler`
5. Login Wrangler: `wrangler login`

---

## Bagian 1 — Deploy Cloudflare Worker (API)

### 1.1 Buat KV Namespaces

Jalankan perintah berikut dan salin ID yang dikembalikan ke `wrangler.toml`:

```bash
wrangler kv:namespace create "FACE_CACHE"
wrangler kv:namespace create "USER_CREDITS"
wrangler kv:namespace create "PAYMENT_ORDERS"
wrangler kv:namespace create "RESULT_CACHE"
wrangler kv:namespace create "AFFILIATE_DATA"
wrangler kv:namespace create "RATE_LIMIT"
wrangler kv:namespace create "USAGE_ANALYTICS"
```

Update `cloudflare-worker/wrangler.toml` — isi `id = "..."` masing-masing namespace.

### 1.2 Buat R2 Buckets

```bash
wrangler r2 bucket create potretai-faces
wrangler r2 bucket create generated-images
wrangler r2 bucket create payment-proofs
```

**Enable public access untuk `potretai-faces`:**
Cloudflare Dashboard → R2 → `potretai-faces` → Settings → Public Access → Allow Access

**Catat Public URL** (format: `https://pub-XXXX.r2.dev`) dan update `wrangler.toml`:
```toml
R2_CDN_BASE = "https://pub-GANTI_DENGAN_URL_R2_KAMU.r2.dev"
```

### 1.3 Simpan Secrets

```bash
wrangler secret put FAL_KEY
# Masukkan fal.ai API key saat diminta

wrangler secret put ADMIN_KEY
# Masukkan kunci admin untuk /verify-payment

wrangler secret put TURNSTILE_SECRET
# Masukkan Cloudflare Turnstile secret key
# Dapatkan di: https://dash.cloudflare.com → Turnstile → Add Site
```

### 1.4 Buat Queue

```bash
wrangler queues create potretai-generate
```

### 1.5 Deploy Worker

```bash
cd cloudflare-worker
wrangler deploy
```

Worker akan live di: `https://potretai-worker.<subdomain-kamu>.workers.dev`

### 1.6 Setup Custom Domain untuk API

**Di Cloudflare Dashboard:**
1. Buka Workers & Pages → `potretai-worker` → Settings → Triggers → Custom Domains
2. Klik "Add Custom Domain"
3. Masukkan: `api.potretai.studiocreative.id`
4. Cloudflare akan otomatis buat DNS record dan SSL certificate

**Verifikasi:**
```bash
curl https://api.potretai.studiocreative.id/
# Expected: {"status":"ok","service":"PotretAI Worker",...}
```

---

## Bagian 2 — Deploy Frontend (Cloudflare Pages)

### 2.1 Persiapan Repository

Pastikan `frontend/app.html` sudah menggunakan URL production:
```js
const WORKER_URL = 'https://api.potretai.studiocreative.id';
```

File ini sudah dikonfigurasi dengan benar. Untuk local development, uncomment baris:
```js
// const WORKER_URL = 'http://localhost:8787';
```

### 2.2 Deploy via Cloudflare Pages Dashboard

1. Buka Cloudflare Dashboard → Pages → Create a project
2. Pilih "Upload assets" (untuk deploy langsung tanpa Git)
3. Project name: `potretai-frontend`
4. Upload folder `frontend/` sebagai root
5. Klik Deploy

**Atau deploy via Git (disarankan):**
1. Push repo ke GitHub/GitLab
2. Cloudflare Pages → Create project → Connect to Git
3. Build settings:
   - Build command: *(kosong — static files)*
   - Build output directory: `frontend`
4. Deploy

### 2.3 Setup Custom Domain untuk Frontend

1. Cloudflare Pages → `potretai-frontend` → Custom domains
2. Klik "Set up a custom domain"
3. Masukkan: `potretai.studiocreative.id`
4. Cloudflare akan buat CNAME record otomatis

**Verifikasi:**
Buka `https://potretai.studiocreative.id` di browser.

---

## Bagian 3 — Setup Cloudflare Turnstile (Bot Protection)

1. Cloudflare Dashboard → Turnstile → Add Site
2. Site name: `PotretAI`
3. Domain: `potretai.studiocreative.id`
4. Widget type: **Invisible** (recommended)
5. Salin **Site Key** → tambahkan ke frontend HTML (atribut `data-sitekey`)
6. Salin **Secret Key** → `wrangler secret put TURNSTILE_SECRET`

---

## Bagian 4 — DNS Records Ringkasan

Berikut DNS records yang diperlukan di Cloudflare DNS untuk `studiocreative.id`:

| Type  | Name              | Content                                        | Proxy |
|-------|-------------------|------------------------------------------------|-------|
| CNAME | potretai          | `potretai-frontend.pages.dev`                  | ✅ On |
| CNAME | api.potretai      | Auto-set saat add custom domain di Worker      | ✅ On |

> **Catatan:** Cloudflare Pages dan Workers custom domain setup otomatis membuat DNS records. Tabel di atas untuk referensi verifikasi.

---

## Bagian 5 — Environment Variables Ringkasan

### wrangler.toml (non-sensitive)

| Variable      | Value                            | Keterangan                     |
|---------------|----------------------------------|--------------------------------|
| `SERVICE_NAME` | `PotretAI Worker`               | Nama service                   |
| `VERSION`      | `3.2.0`                         | Versi worker                   |
| `FAL_MODEL`    | `fal-ai/flux-pulid`             | Model AI (jangan diubah)       |
| `R2_CDN_BASE`  | `https://pub-XXX.r2.dev`        | Public URL R2 bucket           |

### Secrets (via `wrangler secret put`)

| Secret             | Keterangan                          |
|--------------------|-------------------------------------|
| `FAL_KEY`          | API key fal.ai                      |
| `ADMIN_KEY`        | Kunci admin untuk verify-payment    |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key     |

---

## Bagian 6 — Testing Production

Setelah deploy, verifikasi semua endpoint:

```bash
# Health check
curl https://api.potretai.studiocreative.id/

# CORS check (harus dapat header Access-Control-Allow-Origin)
curl -H "Origin: https://potretai.studiocreative.id" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.potretai.studiocreative.id/generate \
     -v 2>&1 | grep -i "access-control"
```

---

## Bagian 7 — Local Development

### Worker (port 8787)

```bash
cd cloudflare-worker
wrangler dev
```

### Frontend (port 3000)

```bash
node serve.mjs
# → http://localhost:3000
```

Untuk testing lokal, update `frontend/app.html`:
```js
const WORKER_URL = 'http://localhost:8787';
```

---

## Arsitektur Production

```
User Browser
     │
     ├── HTTPS ──► potretai.studiocreative.id  (Cloudflare Pages)
     │                       │
     │                       │ fetch() API calls
     │                       ▼
     └── HTTPS ──► api.potretai.studiocreative.id  (Cloudflare Worker)
                             │
                   ┌─────────┼──────────┐
                   ▼         ▼          ▼
                KV Store   R2 Bucket  Queue
                (credits,  (images,   (async
                 analytics) proofs)    generation)
                             │
                             ▼
                        fal.ai API
                   (fal-ai/flux-pulid)
```

---

*PotretAI v3 — AI Photo Studio · Deployment Guide · v3.0*
