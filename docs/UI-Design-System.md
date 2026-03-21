# UI-Design-System.md — PotretAI v3
*Design System Reference · Frontend Design Tokens · Component Patterns*

---

## 1. Design Philosophy

PotretAI v3 adalah **premium AI SaaS platform** untuk fotografer dan pasangan Indonesia.

### Prinsip Desain
| Prinsip | Penjelasan |
|---------|-----------|
| **Premium** | Terasa seperti tool profesional kelas dunia — bukan app gratisan |
| **Trustworthy** | Kredibel, clean, tidak overwhelming |
| **Focused** | Setiap elemen punya tujuan — tidak ada noise visual |
| **Indonesian-aware** | Hangat, tidak terlalu dingin/corporate |
| **Depth** | Surfaces berlapis — tidak flat, ada perceived depth |

### Tone Visual
- Luxury editorial, bukan playful
- Clean tapi berkarakter — bukan blank/sterile
- Modern Indonesia — tidak generik global SaaS

---

## 2. Brand Colors

### Primary Palette

```css
:root {
  --color-ai-teal:    #1FA6B5;   /* rgb(31, 166, 181)   — Primary CTA, active state */
  --color-deep-teal:  #0E8EA0;   /* rgb(14, 142, 160)   — Hover, gradient dark end */
  --color-charcoal:   #1E2A2F;   /* rgb(30, 42, 47)     — Text utama, dark bg */
  --color-coral:      #FF7A5A;   /* rgb(255, 122, 90)   — Accent, badge, alert */
  --color-soft-grey:  #A7B0B5;   /* rgb(167, 176, 181)  — Text sekunder, placeholder */
  --color-light-grey: #EEF3F5;   /* rgb(238, 243, 245)  — Section bg, border */
  --color-white:      #FFFFFF;   /* Surface, card bg */
}
```

### Extended Palette (Derivatif)

```css
:root {
  /* Teal variants */
  --color-teal-50:  rgba(31, 166, 181, 0.05);
  --color-teal-100: rgba(31, 166, 181, 0.10);
  --color-teal-200: rgba(31, 166, 181, 0.18);
  --color-teal-300: rgba(31, 166, 181, 0.28);
  --color-teal-400: rgba(31, 166, 181, 0.45);

  /* Charcoal variants */
  --color-charcoal-dark:   #0C1E24;  /* Darker, for footer bg */
  --color-charcoal-medium: #253035;  /* Sidebar bg */

  /* Coral variants */
  --color-coral-hover: #e85c3a;
  --color-coral-soft:  rgba(255, 122, 90, 0.12);

  /* Utility */
  --color-border:       #EEF3F5;
  --color-border-dark:  rgba(167, 176, 181, 0.18);
  --color-overlay:      rgba(14, 26, 32, 0.55);
}
```

### Color Usage Map

| Konteks | Token | Hex |
|---------|-------|-----|
| Primary button bg | `--color-ai-teal` → `--color-deep-teal` | gradient |
| Primary button hover glow | teal shadow | `rgba(31,166,181,0.38)` |
| Active nav/tab | `--color-ai-teal` | `#1FA6B5` |
| Body text | `--color-charcoal` | `#1E2A2F` |
| Secondary text | `--color-soft-grey` | `#A7B0B5` |
| Card background | `--color-white` | `#FFFFFF` |
| Section bg light | `--color-light-grey` | `#EEF3F5` |
| Section bg teal wash | multi radial gradient | lihat pattern di bawah |
| Dark section bg | `--color-charcoal` | `#1E2A2F` |
| Footer bg | `--color-charcoal-dark` | `#0C1E24` |
| Badge/promo | `--color-coral` | `#FF7A5A` |
| Border default | `--color-border` | `#EEF3F5` |
| Input border focus | `--color-ai-teal` | `#1FA6B5` |
| Upload box border | dashed `--color-ai-teal` | `#1FA6B5` |
| Error state | `#E53E3E` | — |
| Success state | `#38A169` | — |

---

## 3. Typography

### Font Stack

```html
<!-- Wajib di-import di semua halaman -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Font Roles

| Role | Font | Weight | Digunakan untuk |
|------|------|--------|-----------------|
| Display/Hero | Montserrat | 900 ExtraBold | Hero heading, halaman title besar |
| Heading 1 | Montserrat | 800 ExtraBold | Section headings utama |
| Heading 2 | Montserrat | 700 Bold | Sub-section, card titles |
| Heading 3 | Montserrat | 600 SemiBold | Form section headers, sidebar labels |
| Body default | Inter | 400 Regular | Paragraf, deskripsi, body text |
| Body medium | Inter | 500 Medium | Label form, nav items, hint text |
| UI Label | Roboto Mono | 500 Medium | Buttons, tags, badges, kode, AI UI |
| UI Label small | Roboto Mono | 400 Regular | Timestamps, metadata, version |

### Type Scale

```css
/* Display — Hero sections */
.text-display {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: clamp(38px, 5.5vw, 68px);
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: var(--color-charcoal);
}

/* H1 — Section titles */
.text-h1 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 50px);
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-charcoal);
}

/* H2 — Sub-sections, card headings */
.text-h2 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 2.5vw, 28px);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-charcoal);
}

/* H3 — Form sections, sidebar */
.text-h3 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-charcoal);
}

/* Body large */
.text-body-lg {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 17px;
  line-height: 1.75;
  color: var(--color-soft-grey);
}

/* Body default */
.text-body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-charcoal);
}

/* Body small */
.text-body-sm {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-soft-grey);
}

/* Label — buttons, tags */
.text-label {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.02em;
}

/* Label small — badges, metadata */
.text-label-sm {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

/* Gradient text */
.text-gradient {
  background: linear-gradient(130deg, #1FA6B5 0%, #0E8EA0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Typography Rules
- ❌ Jangan pakai font yang sama untuk heading dan body
- ❌ Jangan pakai `letter-spacing: normal` pada heading besar — selalu tight (`-0.03em`)
- ✅ Heading besar: Montserrat + tracking tight + line-height `1.08`
- ✅ Body text: Inter + line-height `1.7`
- ✅ Semua tombol dan label: Roboto Mono

---

## 4. Spacing System

Berbasis unit `4px`. Gunakan kelipatan yang konsisten.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-28: 112px;
}
```

### Spacing Map per Konteks

| Konteks | Value |
|---------|-------|
| Gap antar elemen dalam card | `16px` |
| Padding card | `32px` |
| Padding card mobile | `20px` |
| Gap antar cards di grid | `20px` |
| Section padding top/bottom | `100px` desktop / `60px` mobile |
| Sidebar item padding | `12px 16px` |
| Form field gap | `16px` |
| Form section gap | `28px` |
| Topbar height | `68px` |
| Sidebar width | `240px` |
| Generator panel kiri | `360px` |
| Max content width | `1280px` |
| Max content width narrow | `896px` |

---

## 5. Shadow System

Semua shadow menggunakan **color-tinted** dengan opacity rendah. Tidak ada flat `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`.

```css
/* Card default */
.shadow-card {
  box-shadow:
    0 1px 2px rgba(14,142,160,0.04),
    0 4px 12px rgba(14,142,160,0.07),
    0 16px 32px rgba(14,142,160,0.05);
}

/* Card hover */
.shadow-card-hover {
  box-shadow:
    0 2px 4px rgba(14,142,160,0.06),
    0 10px 28px rgba(14,142,160,0.14),
    0 32px 48px rgba(14,142,160,0.09);
}

/* Floating elements (modals, dropdowns) */
.shadow-float {
  box-shadow:
    0 2px 4px rgba(30,42,47,0.06),
    0 8px 20px rgba(30,42,47,0.10),
    0 24px 48px rgba(30,42,47,0.10),
    0 48px 80px rgba(30,42,47,0.07);
}

/* Teal glow — primary buttons, active states */
.shadow-teal-glow {
  box-shadow:
    0 4px 14px rgba(31,166,181,0.35),
    0 1px 3px rgba(31,166,181,0.2);
}

/* Teal glow hover */
.shadow-teal-glow-hover {
  box-shadow:
    0 8px 26px rgba(31,166,181,0.46),
    0 2px 6px rgba(31,166,181,0.22);
}

/* Coral glow — popular badge, accent */
.shadow-coral-glow {
  box-shadow:
    0 4px 12px rgba(255,122,90,0.42);
}

/* Sidebar active item */
.shadow-sidebar-active {
  box-shadow:
    0 2px 8px rgba(31,166,181,0.25),
    0 4px 16px rgba(31,166,181,0.15);
}

/* Upload box active */
.shadow-upload-active {
  box-shadow:
    0 0 0 3px rgba(31,166,181,0.2),
    0 4px 12px rgba(31,166,181,0.12);
}
```

---

## 6. Border Radius

```css
:root {
  --radius-sm:    6px;   /* Input, badge kecil */
  --radius-md:    10px;  /* Button, input normal */
  --radius-lg:    16px;  /* Card kecil, FAQ item */
  --radius-xl:    20px;  /* Card utama, photo card */
  --radius-2xl:   24px;  /* Pricing card */
  --radius-full:  9999px; /* Pill, tag, avatar */
}
```

### Usage Map
| Komponen | Radius |
|----------|--------|
| Button primary/secondary | `10px` |
| Input, select | `10px` |
| Card fitur | `20px` |
| Card pricing | `24px` |
| Tag / badge pill | `100px` |
| Avatar | `50%` |
| Upload box | `16px` |
| Sidebar item active | `12px` |
| Toast notification | `12px` |
| Modal | `20px` |
| Tooltip/dropdown | `12px` |
| Gallery image card | `20px` |
| Skeleton loader | sesuai komponen |

---

## 7. Gradient Patterns

### Background Gradients

```css
/* Hero section background */
.bg-hero {
  background:
    radial-gradient(ellipse 60% 50% at 90% 10%, rgba(31,166,181,0.13) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 10% 90%, rgba(14,142,160,0.09) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(238,243,245,0.7) 0%, #ffffff 70%);
}

/* Section teal wash (alternating sections) */
.bg-section-teal {
  background:
    radial-gradient(ellipse 50% 50% at 0% 0%, rgba(31,166,181,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 100% 100%, rgba(14,142,160,0.05) 0%, transparent 60%),
    #EEF3F5;
}

/* Dark CTA section */
.bg-section-dark {
  background: #1E2A2F;
  /* + decorative blobs sebagai position:absolute children */
}

/* Dark decorative blob */
.bg-blob-teal {
  background: radial-gradient(circle, rgba(31,166,181,0.18) 0%, transparent 70%);
}

/* Footer */
.bg-footer {
  background: #111C20;
}
```

### Button Gradients

```css
/* Primary button */
background: linear-gradient(135deg, #1FA6B5 0%, #0E8EA0 100%);

/* Gradient text */
background: linear-gradient(130deg, #1FA6B5 0%, #0E8EA0 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Dark pricing card */
background: linear-gradient(148deg, #1E2A2F 0%, #0C1E24 100%);

/* Coral badge */
background: linear-gradient(135deg, #FF7A5A, #e85c3a);
```

### Grain Texture Overlay

```css
/* Ditambahkan via body::after — subtle noise texture */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
  z-index: 9999;
}
```

---

## 8. Animation & Transition

### Easing Functions

```css
:root {
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce spring — buttons, hover */
  --ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);        /* Smooth — FAQ, accordion */
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);           /* Ease out — slide in */
  --ease-in-out:   cubic-bezier(0.4, 0, 0.6, 1);        /* Balanced — fade */
}
```

### Duration Tokens

```css
:root {
  --duration-fast:   150ms;  /* Hover color change */
  --duration-normal: 220ms;  /* Button transform, tab switch */
  --duration-slow:   300ms;  /* Card hover, panel open */
  --duration-slower: 400ms;  /* Accordion, FAQ body */
  --duration-page:   650ms;  /* Scroll fade-up animation */
}
```

### Rules Animasi
- ❌ JANGAN gunakan `transition-all`
- ✅ HANYA animate `transform` dan `opacity` — tidak layout-triggering properties
- ✅ Gunakan `--ease-spring` untuk semua hover transform
- ✅ Gunakan `--ease-smooth` untuk accordion/collapse

### Keyframe Animations

```css
/* Float — hero visual cards */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-14px) rotate(0.5deg); }
}
@keyframes float-b {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(-0.5deg); }
}
.float-a { animation: float   7s ease-in-out infinite; }
.float-b { animation: float-b 5.5s ease-in-out infinite; animation-delay: -2.5s; }

/* Pulse dot — status indicator */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(0.75); opacity: 0.5; }
}
.pulse-dot { animation: pulse-dot 2.2s ease-in-out infinite; }

/* Scroll fade-up */
.fade-up {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity var(--duration-page) var(--ease-in-out),
    transform var(--duration-page) cubic-bezier(0.34, 1.2, 0.64, 1);
}
.fade-up.in {
  opacity: 1;
  transform: translateY(0);
}

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    #EEF3F5 25%,
    #e2e8ea 50%,
    #EEF3F5 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
```

---

## 9. Component Library

### 9.1 Buttons

#### Primary Button
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #1FA6B5 0%, #0E8EA0 100%);
  color: #ffffff;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(31,166,181,0.38), 0 1px 3px rgba(31,166,181,0.2);
  transition:
    transform var(--duration-normal) var(--ease-spring),
    box-shadow var(--duration-normal) ease,
    opacity 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(31,166,181,0.46), 0 2px 6px rgba(31,166,181,0.22);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(31,166,181,0.28);
}
.btn-primary:focus-visible {
  outline: 3px solid rgba(31,166,181,0.5);
  outline-offset: 3px;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #1FA6B5;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 13px 27px;
  border-radius: 10px;
  border: 1.5px solid #1FA6B5;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform var(--duration-normal) var(--ease-spring),
    background 0.2s ease,
    color 0.2s ease;
}
.btn-secondary:hover {
  background: rgba(31,166,181,0.08);
  transform: translateY(-2px);
}
.btn-secondary:active {
  transform: translateY(0);
  background: rgba(31,166,181,0.14);
}
.btn-secondary:focus-visible {
  outline: 3px solid rgba(31,166,181,0.4);
  outline-offset: 3px;
}
```

#### Generate Button (Full Width, Large)
```css
.btn-generate {
  /* Sama dengan btn-primary + */
  width: 100%;
  justify-content: center;
  padding: 16px 28px;
  font-size: 15px;
  border-radius: 12px;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(31,166,181,0.42), 0 2px 6px rgba(31,166,181,0.22);
}
```

#### Button Size Variants
```css
.btn-sm  { padding: 8px 16px;  font-size: 12px; border-radius: 8px; }
.btn-md  { padding: 10px 20px; font-size: 13px; border-radius: 10px; }
.btn-lg  { padding: 16px 32px; font-size: 15px; border-radius: 10px; }
.btn-xl  { padding: 18px 36px; font-size: 16px; border-radius: 12px; }
```

---

### 9.2 Form Elements

#### Input / Textarea
```css
.input {
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #1E2A2F;
  background: #ffffff;
  border: 1.5px solid #EEF3F5;
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.input:hover { border-color: rgba(31,166,181,0.35); }
.input:focus {
  border-color: #1FA6B5;
  box-shadow: 0 0 0 3px rgba(31,166,181,0.12);
}
.input::placeholder { color: #A7B0B5; font-size: 13px; }
.input.error {
  border-color: #E53E3E;
  box-shadow: 0 0 0 3px rgba(229,62,62,0.12);
}
```

#### Select Dropdown
```css
.select {
  /* Sama dengan .input + */
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23A7B0B5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer;
}
select optgroup {
  background: #EEF3F5;
  color: #0E8EA0;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
}
```

#### Input dengan Label
```html
<!-- Struktur standard -->
<div class="form-field">
  <label class="form-label">Nama Pria</label>
  <input type="text" class="input" placeholder="Nama pengantin pria...">
  <span class="form-hint">Opsional — untuk personalisasi foto</span>
</div>
```

```css
.form-field   { display: flex; flex-direction: column; gap: 6px; }
.form-label   { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #1E2A2F; }
.form-hint    { font-family: 'Inter', sans-serif; font-size: 12px; color: #A7B0B5; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-section + .form-section { padding-top: 24px; border-top: 1px solid #EEF3F5; }
.form-section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #A7B0B5;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

#### Toggle Password Show/Hide
```html
<div style="position: relative;">
  <input type="password" class="input" id="password" placeholder="Buat password...">
  <button type="button" onclick="togglePassword('password', this)"
    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #A7B0B5; padding: 4px;">
    <!-- Eye icon SVG -->
  </button>
</div>
```

---

### 9.3 Face Upload Box

```css
.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 86px;
  border: 1.5px dashed #1FA6B5;
  border-radius: 16px;
  background: rgba(31,166,181,0.03);
  cursor: pointer;
  transition:
    border-style 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
  position: relative;
  overflow: hidden;
}
.upload-box:hover {
  border-style: solid;
  background: rgba(31,166,181,0.07);
  box-shadow: 0 0 0 3px rgba(31,166,181,0.12);
}
.upload-box.has-file {
  border-style: solid;
  border-color: #1FA6B5;
  background: rgba(31,166,181,0.05);
}
.upload-box.has-file img {
  /* Preview thumbnail mengisi box */
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}
.upload-box .upload-icon {
  color: #1FA6B5;
  opacity: 0.7;
}
.upload-box .upload-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  color: #1FA6B5;
  letter-spacing: 0.04em;
  text-align: center;
}
.upload-box .btn-clear {
  /* Tombol X untuk hapus foto */
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  background: rgba(30,42,47,0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 10px;
  backdrop-filter: blur(4px);
}
```

---

### 9.4 Tag Pill / Badge

```css
/* Tag pill — section labels */
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(31,166,181,0.09);
  color: #0E8EA0;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid rgba(31,166,181,0.18);
}

/* Category tab */
.cat-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #A7B0B5;
  padding: 8px 18px;
  border-radius: 100px;
  border: 1.5px solid #EEF3F5;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}
.cat-tab:hover, .cat-tab.active {
  background: #1FA6B5;
  color: white;
  border-color: #1FA6B5;
}

/* Popular / Coral badge */
.badge-popular {
  background: linear-gradient(135deg, #FF7A5A, #e85c3a);
  color: white;
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  padding: 5px 16px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(255,122,90,0.42);
}

/* Status badge */
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: rgba(167,176,181,0.8);
}
.badge-status .dot {
  width: 7px;
  height: 7px;
  background: #1FA6B5;
  border-radius: 50%;
}
```

---

### 9.5 Cards

#### Feature Card
```css
.feature-card {
  background: #ffffff;
  border: 1px solid #EEF3F5;
  border-radius: 20px;
  padding: 32px;
  transition:
    transform var(--duration-slow) cubic-bezier(0.34,1.4,0.64,1),
    box-shadow var(--duration-slow) ease;
}
.feature-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 2px 4px rgba(14,142,160,0.06),
    0 12px 32px rgba(14,142,160,0.12),
    0 32px 48px rgba(14,142,160,0.07);
}
```

#### Category Card (Dashboard)
```css
.category-card {
  background: #ffffff;
  border: 1px solid #EEF3F5;
  border-radius: 20px;
  padding: 28px 24px;
  cursor: pointer;
  transition:
    transform var(--duration-slow) cubic-bezier(0.34,1.4,0.64,1),
    box-shadow var(--duration-slow) ease;
}
.category-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 2px 4px rgba(14,142,160,0.06),
    0 12px 32px rgba(14,142,160,0.12);
}
```

#### Gallery Image Card
```css
.photo-card {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1);
}
.photo-card:hover { transform: scale(1.025); }
.photo-card .photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(14,42,53,0.7) 0%, rgba(14,42,53,0.1) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.photo-card:hover .photo-overlay { opacity: 1; }
```

#### Result Image Card (Generator Output)
```css
.result-card {
  background: #ffffff;
  border: 1px solid #EEF3F5;
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}
.result-card:hover {
  box-shadow: 0 4px 20px rgba(14,142,160,0.12);
}
.result-card .result-image {
  width: 100%;
  aspect-ratio: 4/5; /* default — overridden per ratio */
  object-fit: cover;
  display: block;
  loading: lazy;
}
.result-card .result-footer {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #EEF3F5;
}
.result-card .result-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: #A7B0B5;
  letter-spacing: 0.04em;
}
.result-card .result-actions {
  display: flex;
  gap: 6px;
}
.result-card .result-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid #EEF3F5;
  background: white;
  color: #A7B0B5;
  cursor: pointer;
  transition: all 0.15s ease;
}
.result-btn:hover { background: #EEF3F5; color: #1FA6B5; border-color: #1FA6B5; }
```

---

### 9.6 Loading Skeleton

```css
/* Skeleton base */
.skeleton-box {
  border-radius: 10px;
  background: linear-gradient(90deg, #EEF3F5 25%, #e2e8ea 50%, #EEF3F5 75%);
  background-size: 800px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

/* Skeleton variants */
.skeleton-text  { height: 16px; border-radius: 6px; }
.skeleton-title { height: 28px; border-radius: 8px; }
.skeleton-image { border-radius: 16px; /* set width/height inline */ }
.skeleton-btn   { height: 44px; border-radius: 10px; }

/* Result grid skeleton (4 cards) */
.skeleton-result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.skeleton-result-card {
  border-radius: 16px;
  overflow: hidden;
}
.skeleton-result-image {
  width: 100%;
  aspect-ratio: 4/5;
  /* shimmer applied */
}
.skeleton-result-footer {
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

### 9.7 Toast Notification

```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #1E2A2F;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(30,42,47,0.3), 0 8px 32px rgba(30,42,47,0.2);
  min-width: 240px;
  max-width: 340px;
  transform: translateX(0);
  opacity: 1;
  transition:
    transform 0.3s var(--ease-spring),
    opacity 0.25s ease;
}
.toast.entering {
  transform: translateX(100%);
  opacity: 0;
}
.toast.success .toast-icon { color: #38A169; }
.toast.error   .toast-icon { color: #E53E3E; }
.toast.info    .toast-icon { color: #1FA6B5; }
```

---

### 9.8 Icon System

Menggunakan **SVG inline** — minimal line icon dengan `stroke-width: 1.8`, rounded caps.

#### Icon Wrapper
```css
.icon-wrap-teal {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(31,166,181,0.13) 0%, rgba(14,142,160,0.07) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-wrap-coral {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255,122,90,0.13) 0%, rgba(255,122,90,0.07) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-wrap-sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}
```

#### Icon Size Standards
| Konteks | Size | Stroke |
|---------|------|--------|
| Feature card | 24×24 | 1.8 |
| Sidebar nav | 18×18 | 1.8 |
| Button icon | 14×14 | 1.5 |
| Upload box | 22×22 | 1.6 |
| Toast | 16×16 | 2.0 |
| Category card (dashboard) | 28×28 | 1.8 |

#### Ikon per Kategori
```
Prewedding  — couple heart / camera icon
Wedding     — rings / wedding arch icon
Engagement  — ring box / diamond icon
Studio      — camera / aperture icon
Family      — group people icon
Dashboard   — grid / home icon
History     — clock / image gallery icon
Settings    — gear / sliders icon
Account     — user circle icon
```

---

## 10. Layout System

### Topbar
```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 68px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(238,243,245,0.8);
  box-shadow: 0 1px 0 rgba(30,42,47,0.05), 0 4px 20px rgba(30,42,47,0.03);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
}
```

### Sidebar
```css
.sidebar {
  width: 240px;
  flex-shrink: 0;
  height: calc(100vh - 68px);
  position: sticky;
  top: 68px;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #EEF3F5;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #A7B0B5;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.sidebar-item:hover { background: #EEF3F5; color: #1E2A2F; }
.sidebar-item.active {
  background: linear-gradient(135deg, rgba(31,166,181,0.12), rgba(14,142,160,0.08));
  color: #1FA6B5;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(31,166,181,0.15);
}
.sidebar-submenu {
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sidebar-submenu .sidebar-item {
  font-size: 13px;
  padding: 8px 12px;
}
```

### Generator Layout
```css
.generator-layout {
  display: flex;
  height: calc(100vh - 68px);
  overflow: hidden;
}
.generator-panel-left {
  width: 360px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #EEF3F5;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #ffffff;
}
.generator-panel-right {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background: #EEF3F5;
}
```

### Grid Systems
```css
/* Feature cards */
.grid-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Gallery 2x2 */
.grid-gallery-result {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* Dashboard categories */
.grid-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

---

## 11. Responsive Breakpoints

```css
/* Mobile first — base adalah mobile */

/* Tablet */
@media (min-width: 768px) {
  /* Sidebar bisa dishow */
  /* Grid 2+ kolom */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Sidebar fixed show */
  /* Generator 2-panel layout */
}

/* Wide */
@media (min-width: 1280px) {
  /* Max content width applied */
}
```

### Responsive Rules per Halaman
| Elemen | Mobile | Desktop |
|--------|--------|---------|
| Login split screen | Kolom kiri hidden | Dua kolom 60/40 |
| Sidebar | Hidden (drawer/hamburger) | Fixed 240px |
| Generator panels | Stack vertikal | Side by side |
| Gallery result grid | 1 kolom | 2 kolom |
| Feature card grid | 1 kolom | 3 kolom |
| Topbar nav | Hidden (hamburger) | Visible |
| Pricing cards | 1 kolom | 3 kolom |

---

## 12. Accessibility (WCAG AA)

```css
/* Focus visible — WAJIB semua interactive elements */
:focus-visible {
  outline: 2px solid rgba(31,166,181,0.5);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Minimum contrast text */
/* Charcoal #1E2A2F on white → ratio 12.6:1 ✅ */
/* Teal #1FA6B5 on white → ratio 3.8:1 ✅ (untuk UI, bukan body text) */
/* Soft grey #A7B0B5 on white → 3.3:1 (untuk hint text, bukan body) */
```

### Accessibility Checklist
- ✅ Semua input punya `<label>` terhubung
- ✅ Tombol punya accessible name (text atau `aria-label`)
- ✅ Upload input punya `<input type="file" accept="image/*">` yang terhubung ke label visual
- ✅ `alt` text pada semua `<img>`
- ✅ `aria-live` pada toast notifications
- ✅ Keyboard navigable: semua interactive elements bisa dicapai via Tab
- ✅ `role="status"` pada loading state
- ✅ `aria-expanded` pada accordion/FAQ
- ✅ Color bukan satu-satunya penanda state (selalu ada text/icon juga)

---

## 13. Dark Surface Patterns

Untuk section gelap (CTA section, pricing card popular):

```css
/* Dark card text */
.on-dark-heading    { color: #ffffff; }
.on-dark-body       { color: rgba(167,176,181,0.65); }
.on-dark-muted      { color: rgba(167,176,181,0.35); }
.on-dark-label      { color: rgba(167,176,181,0.6); }
.on-dark-check      { background: rgba(31,166,181,0.28); }
.on-dark-border     { border-color: rgba(31,166,181,0.35); }
```

---

## 14. Tailwind Config (Lengkap)

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'ai-teal':    '#1FA6B5',
        'deep-teal':  '#0E8EA0',
        'charcoal':   '#1E2A2F',
        'soft-grey':  '#A7B0B5',
        'light-grey': '#EEF3F5',
        'coral':      '#FF7A5A',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '10px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
      }
    }
  }
}
```

---

## 15. Checklist Sebelum Generate HTML

Sebelum mulai menulis kode, pastikan:

- [ ] Import Google Fonts (Montserrat + Inter + Roboto Mono)
- [ ] Tailwind config sudah include brand colors
- [ ] `body::after` grain texture overlay ada
- [ ] Tidak ada `transition-all` dimanapun
- [ ] Tidak ada default Tailwind `indigo`, `blue`, `purple`
- [ ] Semua shadow menggunakan layered color-tinted
- [ ] Setiap tombol punya: hover + focus-visible + active state
- [ ] Logo menggunakan `assets/Logo_potretai.png` (bukan placeholder)
- [ ] Loading state menggunakan skeleton shimmer (bukan spinner)

---

*PotretAI v3 — UI Design System · v3.0 · Fase 1 Build*
