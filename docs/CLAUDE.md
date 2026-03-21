# CLAUDE.md — PotretAI v3 · Master Development Rules
*Version 3.0 · Updated March 2025 · Full English*

---

## 1. Read This First

Read this entire file before starting any task. All implementations MUST follow PotretAI v3 SaaS architecture standards.

---

## 2. Application Overview

| Field        | Value                                  |
|--------------|----------------------------------------|
| Name         | PotretAI Studio                        |
| Type         | AI Photo Generator SaaS                |
| Version      | v3.0                                   |
| UI Language  | Bahasa Indonesia (labels, toasts, errors) |
| AI Language  | English only (all prompts to Fal.ai / Replicate) |
| Target Market| Indonesian users, middle to upper class |

### Menu Structure (6 Menus)

| Menu         | Target User          | Tech Pipeline         | Tier     |
|--------------|----------------------|-----------------------|----------|
| Wisuda       | S1/S2/S3 graduates   | Solo — Fal.ai PuLID   | Budget   |
| Profesional  | LinkedIn/CV/KTP      | Solo — Fal.ai PuLID   | Budget   |
| Maternity    | Pregnant mothers     | Solo — Fal.ai PuLID   | Premium  |
| Studio Korea | Solo male/female     | Solo — Fal.ai PuLID   | Premium  |
| Prewedding   | Couples              | Couple — Replicate    | Premium  |
| Wedding      | Couples              | Couple — Replicate    | Premium  |

### Deleted Menus
- Family → REMOVED (3-4 face technology not reliable)
- Engagement → MERGED into Prewedding

---

## 3. Pricing Tiers

### Budget Tier (Rp 197,000 — Founding Base)
- Wisuda generator
- Profesional generator
- 50 photos/month
- Lifetime access

### Premium Tier (Rp 497,000 — Founding Premium)
- All 6 generators
- 200 photos/month
- Lifetime access

---

## 4. Brand Identity

### Colors (MANDATORY — do not deviate)

| Name       | HEX       | Usage                              |
|------------|-----------|------------------------------------|
| AI Teal    | `#1FA6B5` | Primary — CTA, active, highlight   |
| Deep Teal  | `#0E8EA0` | Primary dark — hover, gradient     |
| Charcoal   | `#1E2A2F` | Main text, dark backgrounds        |
| Warm Coral | `#FF7A5A` | Accent — badge, alert, promo       |
| Soft Grey  | `#A7B0B5` | Secondary text, placeholder        |
| Light Grey | `#EEF3F5` | Section bg, border                 |
| White      | `#FFFFFF` | Surface, card background           |

### Typography

| Role            | Font        | Weight                    |
|-----------------|-------------|---------------------------|
| Heading/Display | Montserrat  | SemiBold/Bold/ExtraBold   |
| Body/UI         | Inter       | Regular/Medium            |
| Button/Label    | Roboto Mono | Medium                    |

### Logo
- Path: `brand_asset/Logo potretai.png`
- Always use real logo — never a placeholder
- Clear space minimum = height of "p" character on all sides

---

## 5. AI Generation Architecture

### Pipeline: Solo Menus (Wisuda, Profesional, Maternity, Studio Korea)

```
User uploads face photo (1 photo)
        ↓
Worker: Upload face to Fal.ai R2 storage → get HTTPS URL
        ↓
Worker: POST fal-ai/flux-pulid
  body: {
    prompt: <English prompt from PromptBuilder>,
    reference_image_url: <face_url>,
    num_images: 4,
    image_size: { width: 832, height: 1040 },
    num_inference_steps: 20,
    guidance_scale: 4.5,
    id_scale: 0.9,
    sync_mode: true,
    output_format: "jpeg",
    output_quality: 92
  }
        ↓
Return: 4 photo URLs → render in output panel
Expected face accuracy: 70-85%
```

### Pipeline: Couple Menus (Prewedding, Wedding)

```
User uploads male face + female face
        ↓
Worker: Upload both faces to Fal.ai R2 storage
        ↓
STEP 1: Replicate flux-dev → base couple photo (no face reference)
STEP 2: Replicate InsightFace → swap MALE face (face_index=0)
STEP 3: Replicate InsightFace → swap FEMALE face (face_index=1)
        ↓
Return: 4 photo URLs
Expected face accuracy: 60-80% (technology limitation acknowledged)
```

---

## 6. Cloudflare Worker — API Endpoints

```javascript
// All endpoints use POST method
// API keys stored as Worker secrets (never in client code)

POST /upload-face        → Upload user face to Fal.ai R2 storage
POST /generate-solo      → Fal.ai flux-pulid (1 face reference, 4 images)
POST /generate-couple    → Replicate flux-dev (base couple photo)
POST /faceswap           → Replicate InsightFace (face_index: 0 or 1)
GET  /                   → Health check

// CORS allowed origins:
const ALLOWED_ORIGINS = [
  'https://studiocreative.id',
  'https://www.studiocreative.id',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'null'
];
```

---

## 7. Prompt Architecture — JSON Format

All prompts are built as structured JSON objects internally, then compiled to a final English string sent to the AI API.

```javascript
// Internal JSON structure (PromptBuilder output)
const promptJSON = {
  subject: "beautiful Indonesian woman",
  outfit: "white modern kebaya, fitted lace bodice, flowing kain batik",
  location: "Borobudur Temple, Magelang, Java",
  background_detail: "9th century Buddhist monument, sunrise mist, UNESCO heritage",
  pose: "full body standing confident, holding diploma scroll, elegant posture",
  shot_type: "full body shot, head to toe, architectural background",
  expression: "proud joyful smile, bright confident eyes",
  lighting: "soft golden morning light, gentle rim light",
  atmosphere: "clear sky, misty morning, serene",
  lens: "35mm f/1.4 wide prime lens",
  camera: "Canon EOS R5",
  color_grade: "bright and airy, clean whites, lifted tones",
  style: "editorial lifestyle photography",
  category_modifier: "graduation photography, academic achievement, milestone portrait",
  auto_modifiers: "ultra realistic, photorealistic, 8k resolution, professional photography, sharp focus, high detail skin texture, depth of field, bokeh, full body portrait, RAW photo, HDR, no text, no watermark"
};

// Final compiled prompt (English string sent to API)
const finalPrompt = `${subject}, ${pose}, ${outfit}, ${background_detail}, ${lighting}, ${atmosphere}, ${expression}, ${shot_type}, ${style}, ${color_grade}, ${camera}, ${lens}, ${category_modifier}, ${auto_modifiers}`;
```

### Why JSON Format
1. **Consistency** — each field has clear validation
2. **Debuggable** — can log individual fields
3. **Extensible** — easy to add/remove parameters
4. **AI-accurate** — structured order produces better results

---

## 8. Absolute Rules

### AI & Prompts
```
❌ Prompt NEVER shown to user under any circumstances
❌ API keys NEVER in client-side code
❌ Do not generate more or less than 4 photos per session
❌ Family menu → permanently removed
❌ token/credit/top-up/monthly subscription in UI copy
✅ All prompts built in English by PromptBuilder
✅ All API calls via Cloudflare Worker proxy
✅ User faces uploaded to Fal.ai R2 before API call
✅ Error messages translated to Bahasa Indonesia
✅ Pessimistic usage deduction (deduct first, refund on failure)
```

### UI & Design
```
❌ transition-all → use specific transitions
❌ Default Tailwind blue/indigo → use brand teal
❌ Skeleton loading beyond 90 seconds
❌ Spinner loading → use skeleton shimmer only
✅ Toast notifications for all user feedback
✅ Mobile-first responsive design
✅ Placeholder images: https://placehold.co/WIDTHxHEIGHT
✅ Layered color-tinted shadows for depth
```

### Language
```
✅ All UI labels → Bahasa Indonesia
✅ All AI prompts → English
✅ All error messages → Bahasa Indonesia  
✅ All toast messages → Bahasa Indonesia
✅ All .md files → English
✅ All code comments → English
✅ All variable/function names → English
```

---

## 9. Photo Output Specifications

### Shot Types by Menu

| Menu         | Primary Shot Type              | Secondary Options          |
|--------------|--------------------------------|----------------------------|
| Wisuda       | Full body (toga + props)       | 3/4 body, wide landscape   |
| Profesional  | Half body / close-up           | 3/4 body, headshot         |
| Maternity    | Full body, silhouette          | 3/4 belly focus, wide      |
| Studio Korea | Full body, 3/4 body            | Close-up, seated, wide     |
| Prewedding   | Full body couple, wide shot    | Medium couple, cinematic   |
| Wedding      | Full body couple, ceremonial   | Medium portrait, wide      |

### Image Dimensions
```
Standard portrait:   832 x 1040 (4:5 ratio)
Wide landscape:      1040 x 832 (5:4 ratio) — for wide shots
Square:              900 x 900  (1:1 ratio) — for professional headshot
```

---

## 10. File Structure

```
/Aplikasi PotretAIv3/
├── brand_asset/
│   ├── Logo potretai.png
│   └── potretai_brand_guide.png
├── cloudflare-worker/
│   ├── worker.js              → Proxy (Replicate + Fal.ai)
│   ├── wrangler.toml
│   ├── .dev.vars              → Local API keys (never commit)
│   └── package.json
├── docs/
│   ├── CLAUDE.md              → This file (master rules)
│   ├── PromptBuilder.md       → All prompt data (English)
│   ├── Component-Structure.md → UI specs
│   └── Image-Generation-Pipeline.md
├── index.html                 → Landing page
├── login.html                 → Register page
├── login-masuk.html           → Login page
└── app.html                   → Main application
```

---

## 11. Environment Variables

```bash
# Set via: wrangler secret put VARIABLE_NAME
FAL_API_KEY=fal-xxxxxxxxxxxxxxxxx
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Local .dev.vars file (never commit to git):
FAL_API_KEY=fal-xxxxxxxxxxxxxxxxx
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 12. Standard Toast Messages (Bahasa Indonesia)

```javascript
// Generation flow
"📤 Mengupload foto referensi..."
"🎨 AI sedang membuat 4 foto..."
"✨ Memproses detail wajah..."
"🎉 4 foto berhasil dibuat!"

// Errors (Bahasa Indonesia)
"❌ Upload gagal. Pastikan foto berukuran < 5MB."
"❌ Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP."
"❌ Foto terlalu kecil. Minimal 200x200 piksel."
"❌ Generate gagal. Periksa koneksi internet dan coba lagi."
"❌ API key tidak valid. Hubungi admin."
"⏱️ Timeout. Generate terlalu lama. Coba lagi."
"⚠️ Kuota foto habis. Reset tanggal 1 bulan depan."
```

---

## 13. Navigation Map

| From              | To                | Trigger                        |
|-------------------|-------------------|--------------------------------|
| index.html        | login.html        | "Daftar", "Mulai Sekarang"     |
| index.html        | login-masuk.html  | "Masuk" in navbar              |
| login.html        | login-masuk.html  | "Sudah punya akun?"            |
| login-masuk.html  | login.html        | "Belum punya akun?"            |
| login.html        | app.html          | Submit register form           |
| login-masuk.html  | app.html          | Submit login form              |
| app.html          | login-masuk.html  | "Keluar" in avatar dropdown    |

---

## 14. Testing Checklist Before Deploy

```
✅ Worker health check: GET / returns { status: "ok" }
✅ Face upload → returns Fal.ai R2 HTTPS URL
✅ Solo generate: 4 photos with face resemblance
✅ Couple generate: 4 photos (both faces attempted)
✅ All 6 menus switchable in app.html
✅ Error messages appear in Bahasa Indonesia
✅ CORS: no errors when opening from file:// protocol
✅ Mobile responsive at 375px width
✅ Logo visible on all 4 HTML pages
✅ Navigation between all pages functional
✅ Usage counter decrements on generate
✅ Toast notifications appear and auto-dismiss
```

---

*PotretAI v3 · CLAUDE.md v3.0 · March 2025*
*Menus: Wisuda | Profesional | Maternity | Studio Korea | Prewedding | Wedding*
