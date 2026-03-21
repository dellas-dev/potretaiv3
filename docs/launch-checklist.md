# PotretAIv3 — Production Launch Checklist

**Frontend:** https://potretai.studiocreative.id
**API Worker:** https://api.potretai.studiocreative.id
**AI Model:** fal-ai/flux-pulid (hardcoded · cannot be overridden)

---

## PRE-FLIGHT VERIFICATION RESULTS

### Step 1 — Project Structure

| Folder | Status |
|--------|--------|
| `frontend/` | ✅ Exists |
| `cloudflare-worker/` | ✅ Exists |
| `cloudflare-worker/ai/` | ✅ Exists — falClient.js, generateSolo.js, watermark.js |
| `cloudflare-worker/prompts/` | ✅ Exists — promptBuilder.js, consistencyEngine.js, masterPrompt.js, randomizer.js |
| `cloudflare-worker/utils/` | ✅ Exists — 18 utilities including security, creditManager, rateLimiter |
| `cloudflare-worker/payments/` | ✅ Exists — createOrder.js, submitProof.js, verifyPayment.js |
| `cloudflare-worker/share/` | ✅ Exists — shareGenerator.js, shareImage.js, sharePage.js, shareTracking.js |
| `cloudflare-worker/history/` | ✅ Exists — historyManager.js, historyRoutes.js, historyCleanup.js |

### Step 2 — AI Model Policy

| Check | Status |
|-------|--------|
| `fal-ai/flux-pulid` is the ONLY model | ✅ Confirmed — hardcoded in falClient.js |
| `flux-pro` references | ✅ Clean — appears only in test `.not.toContain()` assertions |
| `flux-schnell` references | ✅ Clean — appears only in test `.not.toContain()` assertions |
| `flux-dev` references | ✅ Clean — appears only in worker.js exclusion comment |
| `stable-diffusion` references | ✅ None found |
| `midjourney` references | ✅ None found |
| `dalle` references | ✅ None found |

### Step 3 — wrangler.toml Config

| Check | Status |
|-------|--------|
| `name = "potretai-worker"` | ✅ Line 6 |
| `main = "worker.js"` | ✅ Line 7 |
| `compatibility_date = "2026-03-11"` | ✅ Line 8 |
| Route `api.potretai.studiocreative.id/*` | ✅ Lines 194–196 |
| `zone_name = "studiocreative.id"` | ✅ Line 196 |
| Cron trigger `"0 * * * *"` | ✅ Line 187 |
| Queue `potretai-generate` | ✅ Lines 173–180 |

### Step 4 — Bindings

| Binding | Type | Status |
|---------|------|--------|
| `FAL_KEY` | Secret | ✅ Documented — run `wrangler secret put FAL_KEY` |
| `ADMIN_KEY` | Secret | ✅ Documented — run `wrangler secret put ADMIN_KEY` |
| `TURNSTILE_SECRET` | Secret | ✅ Documented — run `wrangler secret put TURNSTILE_SECRET` |
| `FACES_BUCKET` (R2) | R2 | ✅ Configured — bucket: `potretai-faces` |
| `RESULT_BUCKET` (R2) | R2 | ✅ Configured — bucket: `generated-images` |
| `PAYMENT_PROOFS` (R2) | R2 | ✅ Configured — bucket: `payment-proofs` |
| `FACE_CACHE` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `USER_CREDITS` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `PAYMENT_ORDERS` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `RESULT_CACHE` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `AFFILIATE_DATA` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `RATE_LIMIT` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `USAGE_ANALYTICS` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `HISTORY_KV` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `SHARE_KV` (KV) | KV | ⚠️ ID is placeholder — see action items |
| `R2_CDN_BASE` (var) | Env var | ⚠️ Placeholder URL — see action items |
| `AI` (Workers AI) | AI | ✅ Configured — @cf/facebook/detr-resnet-50 |

### Step 5 — Frontend API Config

| Check | Status |
|-------|--------|
| `frontend/js/config.js` exists | ✅ Exists |
| `API_BASE_URL = 'https://api.potretai.studiocreative.id'` | ✅ Correct |
| `app.html` WORKER_URL | ✅ `https://api.potretai.studiocreative.id` |
| `POST /generate` call | ✅ `${WORKER_URL}/generate` — line 1825 |
| `POST /upload-face` call | ✅ `${WORKER_URL}/upload-face` — line 1974 |

### Step 6 — CORS

| Check | Status |
|-------|--------|
| `https://potretai.studiocreative.id` in ALLOWED_ORIGINS | ✅ Line 98 of worker.js |
| `Access-Control-Allow-Origin` header | ✅ corsHeaders() function |
| `Access-Control-Allow-Methods: POST, GET, OPTIONS` | ✅ corsHeaders() function |
| `Access-Control-Allow-Headers: Content-Type` | ✅ corsHeaders() function |
| `OPTIONS` preflight handled | ✅ handleCors() — returns 204 |

### Step 7 — Share System

| Check | Status |
|-------|--------|
| Route `GET /share/{id}` registered | ✅ worker.js line 179 |
| `handleShare()` imported and wired | ✅ from `./share/shareImage.js` |
| SHARE_KV primary lookup | ✅ shareImage.js — tries KV first, falls back to R2 |
| RESULT_BUCKET fallback (legacy job_id links) | ✅ shareImage.js |
| View counter increment | ✅ shareTracking.js — incrementShareViews() |
| `shareGenerator.js` stores in SHARE_KV | ✅ 90-day TTL, 12-char share ID |
| Image URL domain validation | ✅ Only cdn.potretai.com, *.r2.dev, *.r2.cloudflarestorage.com |
| OpenGraph / Twitter Card meta tags | ✅ sharePage.js |

### Step 8 — History System

| Check | Status |
|-------|--------|
| Route `GET /history/{user_id}` registered | ✅ worker.js line 186 |
| Route `GET /get-credit/{user_id}` registered | ✅ worker.js line 191 |
| `historyManager.saveGenerationHistory()` called in queue pipeline | ✅ generateQueue.js step 9 |
| HISTORY_KV key format `history:{user_id}:{ms}` | ✅ historyManager.js line 52 |
| 30-day auto-expiration TTL | ✅ historyManager.js — HISTORY_TTL constant |
| `cleanupOldHistory()` runs in cron | ✅ worker.js scheduled() handler |
| Latest 20 results, newest first | ✅ getUserHistory(user_id, env, 20) |
| Frontend dashboard.html | ✅ frontend/dashboard.html |
| Frontend historyHandler.js | ✅ frontend/js/historyHandler.js |

---

## ⚠️ ACTION ITEMS BEFORE LAUNCH

These must be completed before running `wrangler deploy`.

### 1 — Create all KV Namespaces and fill IDs in wrangler.toml

Run each command, copy the returned `id`, paste into wrangler.toml:

```bash
cd cloudflare-worker

wrangler kv:namespace create "FACE_CACHE"
# → paste id into: binding = "FACE_CACHE" id = "..."

wrangler kv:namespace create "USER_CREDITS"
# → paste id into: binding = "USER_CREDITS" id = "..."

wrangler kv:namespace create "PAYMENT_ORDERS"
# → paste id into: binding = "PAYMENT_ORDERS" id = "..."

wrangler kv:namespace create "RESULT_CACHE"
# → paste id into: binding = "RESULT_CACHE" id = "..."

wrangler kv:namespace create "AFFILIATE_DATA"
# → paste id into: binding = "AFFILIATE_DATA" id = "..."

wrangler kv:namespace create "RATE_LIMIT"
# → paste id into: binding = "RATE_LIMIT" id = "..."

wrangler kv:namespace create "USAGE_ANALYTICS"
# → paste id into: binding = "USAGE_ANALYTICS" id = "..."

wrangler kv:namespace create "HISTORY_KV"
# → paste id into: binding = "HISTORY_KV" id = "..."

wrangler kv:namespace create "SHARE_KV"
# → paste id into: binding = "SHARE_KV" id = "..."
```

### 2 — Create R2 Buckets

```bash
wrangler r2 bucket create potretai-faces
wrangler r2 bucket create generated-images
wrangler r2 bucket create payment-proofs
```

Then enable **public access** on `potretai-faces`:
Dashboard → R2 → `potretai-faces` → Settings → Public Access → Enable

Copy the public URL (format: `https://pub-XXXX.r2.dev`) and update `wrangler.toml`:
```toml
R2_CDN_BASE = "https://pub-XXXX.r2.dev"   # ← replace placeholder
```

### 3 — Store Secrets

```bash
cd cloudflare-worker

wrangler secret put FAL_KEY          # fal.ai API key
wrangler secret put ADMIN_KEY        # admin key for /verify-payment
wrangler secret put TURNSTILE_SECRET # Cloudflare Turnstile secret
```

Get Turnstile credentials:
Dashboard → Turnstile → Add Site → Domain: `potretai.studiocreative.id` → Widget: Invisible

### 4 — Create Cloudflare Queue

```bash
wrangler queues create potretai-generate
```

### 5 — DNS Records

Verify these records exist in Cloudflare DNS for `studiocreative.id`:

| Type  | Name         | Content / Target                               | Proxy  |
|-------|--------------|------------------------------------------------|--------|
| CNAME | `potretai`   | `potretai-frontend.pages.dev`                  | ✅ On |
| CNAME | `api.potretai` | Auto-set by Workers custom domain setup      | ✅ On |

### 6 — Set workers_dev (optional but recommended for production)

To prevent the worker from being accessible on the public `workers.dev` URL:

```toml
# wrangler.toml
workers_dev = false   # change from true
```

---

## DEPLOY COMMANDS

### Deploy API Worker

```bash
cd cloudflare-worker
wrangler deploy
```

Expected output:
```
✅ potretai-worker deployed to https://api.potretai.studiocreative.id
```

Verify:
```bash
curl https://api.potretai.studiocreative.id/
# Expected: {"status":"ok","service":"PotretAI Worker","version":"3.2.0","model":"fal-ai/flux-pulid"}
```

### Deploy Frontend (Cloudflare Pages)

**Option A — Dashboard (first deploy):**
1. Cloudflare Dashboard → Pages → Create a project → Upload assets
2. Project name: `potretai`
3. Upload the `frontend/` folder
4. After deploy: Settings → Custom domains → Add `potretai.studiocreative.id`

**Option B — Wrangler CLI (subsequent deploys):**
```bash
wrangler pages deploy frontend --project-name=potretai
```

**Option C — Git integration (recommended for CI/CD):**
1. Push repo to GitHub
2. Cloudflare Pages → Create project → Connect to Git
3. Build settings:
   - Build command: *(leave empty — static files)*
   - Build output directory: `frontend`
4. Auto-deploys on every push to `main`

### CORS Test After Deploy

```bash
curl -i \
  -H "Origin: https://potretai.studiocreative.id" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://api.potretai.studiocreative.id/generate

# Must include in response:
# Access-Control-Allow-Origin: https://potretai.studiocreative.id
# Access-Control-Allow-Methods: POST, GET, OPTIONS
```

---

## LAUNCH CHECKLIST

Complete each item in order before going live.

### Infrastructure
- [ ] Cloudflare account created and `studiocreative.id` domain added
- [ ] DNS nameservers for `studiocreative.id` pointed to Cloudflare
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Wrangler authenticated: `wrangler login`

### R2 Buckets
- [ ] `potretai-faces` R2 bucket created
- [ ] `generated-images` R2 bucket created
- [ ] `payment-proofs` R2 bucket created
- [ ] Public access enabled on `potretai-faces`
- [ ] `R2_CDN_BASE` in `wrangler.toml` updated with actual public URL

### KV Namespaces
- [ ] `FACE_CACHE` namespace created — ID filled in `wrangler.toml`
- [ ] `USER_CREDITS` namespace created — ID filled in `wrangler.toml`
- [ ] `PAYMENT_ORDERS` namespace created — ID filled in `wrangler.toml`
- [ ] `RESULT_CACHE` namespace created — ID filled in `wrangler.toml`
- [ ] `AFFILIATE_DATA` namespace created — ID filled in `wrangler.toml`
- [ ] `RATE_LIMIT` namespace created — ID filled in `wrangler.toml`
- [ ] `USAGE_ANALYTICS` namespace created — ID filled in `wrangler.toml`
- [ ] `HISTORY_KV` namespace created — ID filled in `wrangler.toml`
- [ ] `SHARE_KV` namespace created — ID filled in `wrangler.toml`

### Cloudflare Queue
- [ ] `potretai-generate` queue created

### Secrets
- [ ] `FAL_KEY` secret stored (`wrangler secret put FAL_KEY`)
- [ ] `ADMIN_KEY` secret stored (`wrangler secret put ADMIN_KEY`)
- [ ] `TURNSTILE_SECRET` secret stored (`wrangler secret put TURNSTILE_SECRET`)
- [ ] Turnstile site key added to frontend HTML (`data-sitekey`)

### fal.ai API
- [ ] fal.ai account created at https://fal.ai
- [ ] API key generated in fal.ai dashboard
- [ ] Key stored as `FAL_KEY` secret in Cloudflare Workers
- [ ] Model `fal-ai/flux-pulid` available on the account plan

### Worker Deployment
- [ ] All KV namespace IDs filled in `wrangler.toml` (no more placeholder strings)
- [ ] `R2_CDN_BASE` updated with actual R2 public URL
- [ ] `wrangler deploy` executed from `cloudflare-worker/` directory
- [ ] Worker live at `https://api.potretai.studiocreative.id/`
- [ ] Health check passing: `curl https://api.potretai.studiocreative.id/` returns `{"status":"ok",...}`

### Frontend Deployment
- [ ] Cloudflare Pages project `potretai` created
- [ ] `frontend/` folder deployed
- [ ] Custom domain `potretai.studiocreative.id` configured on Pages project
- [ ] Site accessible at `https://potretai.studiocreative.id`
- [ ] Logo loads: `assets/Logo_potretai.png`
- [ ] Google Fonts loading (Montserrat, Inter, Roboto Mono)

### End-to-End Testing
- [ ] CORS preflight (`OPTIONS /generate`) returns correct headers
- [ ] `POST /generate` returns `{ success: true, job_id, share_url }` (202)
- [ ] `GET /result/{job_id}` returns 202 while processing, 200 when done
- [ ] `GET /share/{id}` returns branded HTML share page
- [ ] `GET /history/{user_id}` returns `{ history: [...] }`
- [ ] `POST /upload-face` accepts a face image and returns `{ face_image_url }`
- [ ] `POST /create-order` returns order ID and QRIS details
- [ ] Credit deduction works: pro user has 150 → 149 after one generate

### Payment / QRIS
- [ ] QRIS payment provider account set up
- [ ] QRIS static code or dynamic API integrated
- [ ] `POST /submit-payment-proof` accepts image upload
- [ ] `POST /verify-payment` works with admin key
- [ ] Credit is applied to user after payment verification

### Security
- [ ] Cloudflare Turnstile widget visible on generate form
- [ ] Requests from unknown origins return 403 (test with curl, no Origin header)
- [ ] Rate limit triggers 429 after 4 requests per user per minute
- [ ] Prompt moderation blocks banned words (test: `"nude"` in pose field → 400)
- [ ] `/verify-payment` returns 401 without valid `ADMIN_KEY`

### Monitoring
- [ ] Cloudflare Workers dashboard shows incoming requests
- [ ] Workers Analytics shows error rate < 1%
- [ ] Cron trigger running hourly (check Workers → Triggers → Cron)
- [ ] R2 storage usage visible in dashboard

---

## ROLLBACK PLAN

If the deployment fails or critical bugs are found post-launch:

```bash
# Roll back worker to previous version
wrangler rollback

# Or deploy a specific version
wrangler deploy --compatibility-date=2026-03-11
```

For frontend rollback: Cloudflare Pages → Deployments → select previous deployment → Rollback.

---

*PotretAIv3 — Production Launch Checklist · v3.0 · 2026-03-15*
