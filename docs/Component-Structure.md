# Component-Structure.md — PotretAI v3
*Struktur Komponen · Anatomi Halaman · DOM Hierarchy · Interaction Patterns*

---

## 1. Overview Halaman

PotretAI v3 terdiri dari **3 file HTML utama**:

```
login.html          → Halaman Register (buat akun baru)
login-masuk.html    → Halaman Login (masuk akun)
app.html            → Aplikasi utama (Dashboard + Generator + History)
```

Setiap file adalah **self-contained single HTML** — CSS inline + Tailwind CDN + JS inline.

---

## 2. Struktur Global (Semua Halaman)

### `<head>` Template Wajib

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PotretAI — Studio Foto AI Profesional Indonesia">
  <title>PotretAI Studio — [Nama Halaman]</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
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
          }
        }
      }
    }
  </script>

  <!-- Global CSS Variables & Resets -->
  <style>
    /* Semua CSS custom di sini */
    /* Urutan: variables → reset → utilities → animations → component styles */
  </style>
</head>
```

### `<body>` Global Rules

```html
<body style="font-family: 'Inter', sans-serif; background: #ffffff; color: #1E2A2F; overflow-x: hidden;">

  <!-- Grain texture overlay -->
  <div aria-hidden="true" style="
    position: fixed; inset: 0; pointer-events: none; z-index: 9998;
    background-image: url('data:image/svg+xml,...');
    opacity: 0.025;
  "></div>

  <!-- [Page Content] -->

  <!-- Toast Container (semua halaman) -->
  <div id="toast-container" aria-live="polite" style="
    position: fixed; bottom: 24px; right: 24px; z-index: 9997;
    display: flex; flex-direction: column; gap: 10px;
  "></div>

</body>
```

---

## 3. login.html — Halaman Register

### Diagram Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [SPLIT SCREEN — 60% / 40%]                                 │
│                                                             │
│  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │                        │  │                          │  │
│  │   LEFT PANEL           │  │   RIGHT PANEL            │  │
│  │   (gradient teal)      │  │   (white)                │  │
│  │                        │  │                          │  │
│  │   Logo besar           │  │   Logo kecil             │  │
│  │   Tagline              │  │   H2: "Buat Akun Baru"   │  │
│  │   Preview photo cards  │  │   Subtext                │  │
│  │   Trust badges         │  │   Form fields            │  │
│  │   Social proof stats   │  │   CTA buttons            │  │
│  │                        │  │   Link ke login          │  │
│  └────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
Mobile: left panel hidden, hanya right panel (full width)
```

### DOM Structure

```html
<body>

  <!-- Wrapper utama -->
  <div class="auth-split-wrapper">

    <!-- ===== LEFT PANEL ===== -->
    <div class="auth-left-panel">

      <!-- Decorative blobs (position: absolute) -->
      <div class="blob blob-1" aria-hidden="true"></div>
      <div class="blob blob-2" aria-hidden="true"></div>

      <!-- Content wrapper -->
      <div class="auth-left-content">

        <!-- Logo -->
        <a href="#" class="auth-logo-large">
          <img src="assets/Logo_potretai.png" alt="PotretAI" height="36">
        </a>

        <!-- Tagline block -->
        <div class="auth-tagline-block">
          <span class="tag-pill">✦ AI Photo Studio</span>
          <h1 class="auth-hero-heading">
            Foto Studio Profesional,<br>
            <span class="text-gradient">Powered by AI</span>
          </h1>
          <p class="auth-hero-sub">
            Buat foto wedding, prewedding & portrait berkualitas studio tanpa perlu datang ke studio.
          </p>
        </div>

        <!-- Preview Cards (floating animation) -->
        <div class="auth-preview-grid">
          <div class="auth-preview-card float-a">
            <img src="https://placehold.co/220x280" alt="Contoh foto Wedding AI" loading="lazy">
            <div class="auth-preview-label">Wedding · AI Generated</div>
          </div>
          <div class="auth-preview-card float-b">
            <img src="https://placehold.co/180x240" alt="Contoh foto Studio AI" loading="lazy">
            <div class="auth-preview-label">Studio · AI Generated</div>
          </div>
          <div class="auth-preview-card float-a" style="animation-delay: -1.5s;">
            <img src="https://placehold.co/200x260" alt="Contoh foto Family AI" loading="lazy">
            <div class="auth-preview-label">Family · AI Generated</div>
          </div>
        </div>

        <!-- Trust badges -->
        <div class="auth-trust-badges">
          <div class="auth-trust-item">
            <span class="auth-trust-num">50K+</span>
            <span class="auth-trust-label">Foto Dibuat</span>
          </div>
          <div class="auth-trust-divider"></div>
          <div class="auth-trust-item">
            <span class="auth-trust-num">4.9★</span>
            <span class="auth-trust-label">Rating</span>
          </div>
          <div class="auth-trust-divider"></div>
          <div class="auth-trust-item">
            <span class="auth-trust-num">3K+</span>
            <span class="auth-trust-label">Pengguna</span>
          </div>
        </div>

      </div>
    </div>
    <!-- END LEFT PANEL -->


    <!-- ===== RIGHT PANEL ===== -->
    <div class="auth-right-panel">
      <div class="auth-right-content">

        <!-- Logo mobile (hanya tampil saat left panel tersembunyi) -->
        <a href="#" class="auth-logo-mobile">
          <img src="assets/Logo_potretai.png" alt="PotretAI" height="28">
        </a>

        <!-- Form header -->
        <div class="auth-form-header">
          <h2 class="auth-form-title">Buat Akun Baru</h2>
          <p class="auth-form-sub">Mulai buat foto AI profesional — gratis untuk 10 foto pertama</p>
        </div>

        <!-- Register form -->
        <form class="auth-form" id="register-form" novalidate>

          <!-- Row: Nama Depan + Nama Belakang -->
          <div class="auth-form-row">
            <div class="form-field">
              <label for="first-name" class="form-label">Nama Depan</label>
              <input type="text" id="first-name" name="firstName" class="input"
                placeholder="Budi" autocomplete="given-name" required>
            </div>
            <div class="form-field">
              <label for="last-name" class="form-label">Nama Belakang</label>
              <input type="text" id="last-name" name="lastName" class="input"
                placeholder="Santoso" autocomplete="family-name">
            </div>
          </div>

          <!-- Email -->
          <div class="form-field">
            <label for="email" class="form-label">Alamat Email</label>
            <input type="email" id="email" name="email" class="input"
              placeholder="budi@email.com" autocomplete="email" required>
          </div>

          <!-- Telepon -->
          <div class="form-field">
            <label for="phone" class="form-label">Nomor Telepon</label>
            <div class="phone-input-wrap">
              <span class="phone-prefix">+62</span>
              <input type="tel" id="phone" name="phone" class="input phone-input"
                placeholder="812 3456 7890" autocomplete="tel">
            </div>
          </div>

          <!-- Password -->
          <div class="form-field">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-wrap">
              <input type="password" id="password" name="password" class="input"
                placeholder="Min. 8 karakter" autocomplete="new-password" required
                minlength="8">
              <button type="button" class="password-toggle"
                onclick="togglePassword('password', this)"
                aria-label="Tampilkan password">
                <!-- Eye icon SVG -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <span class="form-hint">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka</span>
          </div>

          <!-- Syarat & Ketentuan -->
          <label class="auth-tos-label">
            <input type="checkbox" id="tos" name="tos" required style="accent-color: #1FA6B5;">
            <span>Saya setuju dengan <a href="#" class="auth-link">Syarat & Ketentuan</a> dan <a href="#" class="auth-link">Kebijakan Privasi</a></span>
          </label>

          <!-- Submit button -->
          <button type="submit" class="btn-primary btn-full" id="register-btn">
            <svg width="16" height="16" ...></svg>
            Daftar Sekarang
          </button>

          <!-- Divider -->
          <div class="auth-divider">
            <span>atau</span>
          </div>

          <!-- Google button -->
          <button type="button" class="btn-google btn-full" id="google-register-btn">
            <!-- Google SVG icon -->
            <svg ...></svg>
            Daftar dengan Google
          </button>

        </form>

        <!-- Footer link -->
        <p class="auth-footer-link">
          Sudah punya akun?
          <a href="login-masuk.html" class="auth-link auth-link-bold">Masuk sekarang</a>
        </p>

      </div>
    </div>
    <!-- END RIGHT PANEL -->

  </div>
  <!-- END WRAPPER -->

</body>
```

### Komponen: `.auth-preview-card`

```css
.auth-preview-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(14,142,160,0.2), 0 2px 8px rgba(14,142,160,0.15);
  position: relative;
  flex-shrink: 0;
}
.auth-preview-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.auth-preview-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px 12px 12px;
  background: linear-gradient(to top, rgba(14,26,32,0.85), transparent);
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.05em;
}
```

### Komponen: `.btn-google`

```css
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 24px;
  border-radius: 10px;
  border: 1.5px solid #EEF3F5;
  background: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1E2A2F;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.btn-google:hover {
  background: #EEF3F5;
  border-color: rgba(31,166,181,0.25);
  transform: translateY(-1px);
}
```

---

## 4. login-masuk.html — Halaman Login

### Perbedaan dari login.html

Struktur DOM **identik** dengan login.html. Perbedaan hanya:

| Element | login.html | login-masuk.html |
|---------|-----------|-----------------|
| `<title>` | Daftar — PotretAI | Masuk — PotretAI |
| `auth-form-title` | "Buat Akun Baru" | "Selamat Datang Kembali" |
| `auth-form-sub` | "Mulai buat foto AI..." | "Masuk ke akun PotretAI Studio kamu" |
| Form fields | Nama + Email + Telepon + Password | Email + Password saja |
| Submit btn text | "Daftar Sekarang" | "Masuk Sekarang" |
| Google btn text | "Daftar dengan Google" | "Masuk dengan Google" |
| TOS checkbox | Ada | Tidak ada |
| Forgot password | Tidak ada | Ada (di samping label Password) |
| Footer link | "Sudah punya akun? Masuk" | "Belum punya akun? Daftar" |
| Footer link href | login-masuk.html | login.html |

### Form login-masuk.html

```html
<form class="auth-form" id="login-form" novalidate>

  <!-- Email -->
  <div class="form-field">
    <label for="email" class="form-label">Alamat Email</label>
    <input type="email" id="email" name="email" class="input"
      placeholder="budi@email.com" autocomplete="email" required>
  </div>

  <!-- Password dengan Lupa Password -->
  <div class="form-field">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <label for="password" class="form-label">Password</label>
      <a href="#" class="auth-link" style="font-size: 12px;">Lupa Password?</a>
    </div>
    <div class="password-input-wrap">
      <input type="password" id="password" name="password" class="input"
        placeholder="Masukkan password kamu" autocomplete="current-password" required>
      <button type="button" class="password-toggle"
        onclick="togglePassword('password', this)" aria-label="Tampilkan password">
        <!-- Eye icon SVG -->
      </button>
    </div>
  </div>

  <!-- Remember me -->
  <label class="auth-tos-label">
    <input type="checkbox" name="remember" style="accent-color: #1FA6B5;">
    <span style="font-size: 13px; color: #A7B0B5;">Ingat saya di perangkat ini</span>
  </label>

  <!-- Submit -->
  <button type="submit" class="btn-primary btn-full" id="login-btn">
    Masuk Sekarang
  </button>

  <!-- Divider + Google -->
  ...

</form>
```

---

## 5. app.html — Aplikasi Utama

### Layout Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR  (sticky, height: 68px)                                  │
├───────────────┬──────────────────────────────────────────────────┤
│               │                                                  │
│   SIDEBAR     │   MAIN CONTENT AREA                              │
│   (240px)     │   (flex-1)                                       │
│   sticky      │   overflow-y: auto                               │
│               │                                                  │
│   Nav items   │   [view-dashboard]   ← default                  │
│               │   [view-generator]   ← saat generate             │
│               │   [view-history]     ← riwayat                  │
│               │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

### DOM Root Structure — app.html

```html
<body>

  <!-- Grain overlay -->
  <div class="grain-overlay" aria-hidden="true"></div>

  <!-- App wrapper -->
  <div id="app-wrapper" style="display: flex; flex-direction: column; min-height: 100vh;">

    <!-- ===== TOPBAR ===== -->
    <header id="topbar">...</header>

    <!-- ===== MAIN LAYOUT ===== -->
    <div id="main-layout" style="display: flex; flex: 1; overflow: hidden;">

      <!-- Sidebar -->
      <nav id="sidebar">...</nav>

      <!-- Content Area -->
      <main id="content-area" style="flex: 1; overflow-y: auto;">

        <!-- View: Dashboard -->
        <section id="view-dashboard" class="view-section active">...</section>

        <!-- View: Generator -->
        <section id="view-generator" class="view-section">...</section>

        <!-- View: History -->
        <section id="view-history" class="view-section">...</section>

        <!-- View: Akun -->
        <section id="view-account" class="view-section">...</section>

      </main>

    </div>
    <!-- END MAIN LAYOUT -->

  </div>

  <!-- Toast container -->
  <div id="toast-container" aria-live="polite"></div>

  <!-- Mobile sidebar overlay -->
  <div id="sidebar-overlay" aria-hidden="true"
    onclick="closeMobileSidebar()"
    style="display: none; position: fixed; inset: 0; background: rgba(30,42,47,0.5); z-index: 39; backdrop-filter: blur(2px);">
  </div>

  <!-- Mobile sidebar drawer -->
  <nav id="sidebar-mobile">...</nav>

</body>
```

---

## 6. Komponen: Topbar

### Anatomi

```
┌────────────────────────────────────────────────────────────────┐
│  [Logo]    [Nav: Dashboard · Generate · History]   [Counter] [Avatar▼] │
└────────────────────────────────────────────────────────────────┘
Desktop: semua visible
Mobile:  Nav hidden → hamburger ☰ di kiri
```

### DOM Structure

```html
<header id="topbar" style="
  position: sticky; top: 0; z-index: 50; height: 68px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(238,243,245,0.8);
  display: flex; align-items: center; padding: 0 24px; gap: 20px;
">

  <!-- Hamburger (mobile only) -->
  <button class="topbar-hamburger" onclick="openMobileSidebar()" aria-label="Buka menu">
    <svg ...></svg>
  </button>

  <!-- Logo -->
  <a href="#" onclick="navigateTo('dashboard')" class="topbar-logo">
    <img src="assets/Logo_potretai.png" alt="PotretAI" height="30">
  </a>

  <!-- Spacer -->
  <div style="flex: 1;"></div>

  <!-- Center Nav (desktop) -->
  <nav class="topbar-nav">
    <a href="#" onclick="navigateTo('dashboard')" class="topbar-nav-item active" data-view="dashboard">Dashboard</a>
    <a href="#" onclick="navigateTo('generator')" class="topbar-nav-item" data-view="generator">Generator</a>
    <a href="#" onclick="navigateTo('history')"   class="topbar-nav-item" data-view="history">Riwayat</a>
  </nav>

  <!-- Spacer -->
  <div style="flex: 1;"></div>

  <!-- Right side -->
  <div class="topbar-right">

    <!-- Usage counter -->
    <div class="topbar-usage">
      <div class="usage-dot"></div>
      <span class="usage-text">
        <span id="usage-remaining">23</span> / <span id="usage-total">50</span> foto tersisa
      </span>
    </div>

    <!-- Divider -->
    <div class="topbar-divider"></div>

    <!-- Avatar + Dropdown trigger -->
    <div class="topbar-avatar-wrap" id="avatar-trigger" onclick="toggleAvatarMenu()">
      <div class="topbar-avatar">
        <span id="avatar-initials">BS</span>
      </div>
      <span class="topbar-username" id="topbar-username">Budi</span>
      <svg class="topbar-chevron" ...></svg>
    </div>

    <!-- Avatar Dropdown Menu -->
    <div class="avatar-dropdown" id="avatar-dropdown" style="display: none;">
      <div class="avatar-dropdown-header">
        <div class="avatar-dropdown-name" id="dropdown-fullname">Budi Santoso</div>
        <div class="avatar-dropdown-email" id="dropdown-email">budi@email.com</div>
      </div>
      <hr class="avatar-dropdown-divider">
      <a href="#" onclick="navigateTo('account')" class="avatar-dropdown-item">
        <svg ...></svg> Pengaturan Akun
      </a>
      <a href="#" class="avatar-dropdown-item">
        <svg ...></svg> Bantuan
      </a>
      <hr class="avatar-dropdown-divider">
      <a href="login-masuk.html" class="avatar-dropdown-item avatar-dropdown-logout">
        <svg ...></svg> Keluar
      </a>
    </div>

  </div>

</header>
```

### CSS: Topbar

```css
.topbar-nav { display: flex; align-items: center; gap: 4px; }
.topbar-nav-item {
  font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
  color: #A7B0B5; padding: 8px 14px; border-radius: 8px;
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;
}
.topbar-nav-item:hover  { color: #1E2A2F; background: #EEF3F5; }
.topbar-nav-item.active { color: #1FA6B5; background: rgba(31,166,181,0.09); font-weight: 600; }

.topbar-usage {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 100px;
  background: rgba(31,166,181,0.07);
  border: 1px solid rgba(31,166,181,0.14);
}
.usage-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #1FA6B5;
  animation: pulse-dot 2.2s ease-in-out infinite;
}
.usage-text {
  font-family: 'Roboto Mono', monospace; font-size: 11px; color: #0E8EA0;
}
.topbar-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #1FA6B5, #0E8EA0);
  display: flex; align-items: center; justify-content: center;
  color: white; font-family: 'Roboto Mono', monospace;
  font-size: 12px; font-weight: 500; flex-shrink: 0;
}
.avatar-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0;
  background: white; border: 1px solid #EEF3F5;
  border-radius: 14px; padding: 8px;
  min-width: 220px; z-index: 100;
  box-shadow: 0 4px 20px rgba(30,42,47,0.1), 0 20px 48px rgba(30,42,47,0.08);
}
```

---

## 7. Komponen: Sidebar

### Anatomi

```
┌──────────────────────────────┐
│  [Section: Menu Utama]       │
│  ▣ Dashboard                 │  ← active: teal highlight
│  ◈ Generator                 │
│  ◷ Riwayat                   │
│                              │
│  [Section: Generator]        │  ← collapsible
│    ↳ Prewedding              │
│    ↳ Wedding                 │
│    ↳ Engagement              │
│    ↳ Studio                  │
│    ↳ Family                  │
│                              │
│  [Section: Akun]             │
│  ◎ Pengaturan Akun           │
│                              │
│  [Bottom: Credit Card]       │
│  Upgrade ke Pro ↗            │
└──────────────────────────────┘
```

### DOM Structure

```html
<nav id="sidebar" style="
  width: 240px; flex-shrink: 0;
  height: calc(100vh - 68px); position: sticky; top: 68px;
  overflow-y: auto; background: white;
  border-right: 1px solid #EEF3F5;
  padding: 16px 12px; display: flex; flex-direction: column; gap: 2px;
">

  <!-- Section label -->
  <div class="sidebar-section-label">Menu Utama</div>

  <!-- Dashboard -->
  <a href="#" onclick="navigateTo('dashboard')" class="sidebar-item active" data-view="dashboard">
    <svg class="sidebar-icon" ...><!-- grid icon --></svg>
    Dashboard
  </a>

  <!-- Generator (parent, collapsible) -->
  <div class="sidebar-parent-item" onclick="toggleSidebarSubmenu('submenu-generator')">
    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
      <svg class="sidebar-icon" ...><!-- camera icon --></svg>
      Generator
    </div>
    <svg class="sidebar-chevron" id="chevron-submenu-generator" ...><!-- chevron --></svg>
  </div>

  <!-- Generator submenu -->
  <div class="sidebar-submenu" id="submenu-generator">
    <a href="#" onclick="navigateTo('generator', 'prewedding')" class="sidebar-subitem" data-tab="prewedding">
      💍 Prewedding
    </a>
    <a href="#" onclick="navigateTo('generator', 'wedding')" class="sidebar-subitem" data-tab="wedding">
      👰 Wedding
    </a>
    <a href="#" onclick="navigateTo('generator', 'engagement')" class="sidebar-subitem" data-tab="engagement">
      💎 Engagement
    </a>
    <a href="#" onclick="navigateTo('generator', 'studio')" class="sidebar-subitem" data-tab="studio">
      📸 Studio
    </a>
    <a href="#" onclick="navigateTo('generator', 'family')" class="sidebar-subitem" data-tab="family">
      👨‍👩‍👧‍👦 Family
    </a>
  </div>

  <!-- Riwayat -->
  <a href="#" onclick="navigateTo('history')" class="sidebar-item" data-view="history">
    <svg class="sidebar-icon" ...><!-- clock icon --></svg>
    Riwayat
  </a>

  <!-- Divider -->
  <div class="sidebar-divider"></div>
  <div class="sidebar-section-label">Akun</div>

  <!-- Pengaturan -->
  <a href="#" onclick="navigateTo('account')" class="sidebar-item" data-view="account">
    <svg class="sidebar-icon" ...><!-- settings icon --></svg>
    Pengaturan
  </a>

  <!-- Spacer -->
  <div style="flex: 1;"></div>

  <!-- Upgrade card -->
  <div class="sidebar-upgrade-card">
    <div class="sidebar-upgrade-emoji">⚡</div>
    <div class="sidebar-upgrade-text">
      <div class="sidebar-upgrade-title">Upgrade ke Pro</div>
      <div class="sidebar-upgrade-sub">Unlimited foto & lebih banyak fitur</div>
    </div>
    <button class="sidebar-upgrade-btn" onclick="navigateTo('account')">Upgrade</button>
  </div>

</nav>
```

### CSS: Sidebar

```css
.sidebar-section-label {
  font-family: 'Roboto Mono', monospace; font-size: 10px; font-weight: 500;
  color: #A7B0B5; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 8px 12px 4px; margin-top: 4px;
}
.sidebar-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
  color: #A7B0B5; text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}
.sidebar-item:hover  { background: #EEF3F5; color: #1E2A2F; }
.sidebar-item.active {
  background: linear-gradient(135deg, rgba(31,166,181,0.12), rgba(14,142,160,0.07));
  color: #1FA6B5; font-weight: 600;
  box-shadow: 0 2px 8px rgba(31,166,181,0.15);
}
.sidebar-subitem {
  display: block; padding: 8px 12px 8px 28px; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  color: #A7B0B5; text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}
.sidebar-subitem:hover  { background: #EEF3F5; color: #1E2A2F; }
.sidebar-subitem.active { color: #1FA6B5; background: rgba(31,166,181,0.07); }
.sidebar-divider { height: 1px; background: #EEF3F5; margin: 12px 0; }
.sidebar-upgrade-card {
  background: linear-gradient(135deg, rgba(31,166,181,0.08), rgba(14,142,160,0.04));
  border: 1px solid rgba(31,166,181,0.18);
  border-radius: 14px; padding: 14px; margin-top: 4px;
}
.sidebar-upgrade-title {
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: #1E2A2F;
}
.sidebar-upgrade-sub {
  font-size: 11px; color: #A7B0B5; margin-top: 2px;
}
.sidebar-upgrade-btn {
  margin-top: 10px; width: 100%;
  background: linear-gradient(135deg, #1FA6B5, #0E8EA0);
  color: white; border: none; border-radius: 8px;
  font-family: 'Roboto Mono', monospace; font-size: 12px; font-weight: 500;
  padding: 8px; cursor: pointer;
  box-shadow: 0 3px 10px rgba(31,166,181,0.35);
}
```

---

## 8. View: Dashboard

### Anatomi

```
┌─────────────────────────────────────────────────────────────┐
│  HERO GREETING                                              │
│  "Selamat datang, Budi 👋"                                  │
│  Subtext + usage bar                                        │
├─────────────────────────────────────────────────────────────┤
│  QUICK STATS (3 cards horizontal)                           │
│  Foto Dibuat   |   Sesi Terakhir   |   Plan Aktif          │
├─────────────────────────────────────────────────────────────┤
│  KATEGORI GENERATOR (5 cards grid)                          │
│  Prewedding · Wedding · Engagement · Studio · Family        │
├─────────────────────────────────────────────────────────────┤
│  RIWAYAT TERBARU (grid 2x2 foto)                            │
│  + Lihat semua →                                           │
└─────────────────────────────────────────────────────────────┘
```

### DOM Structure

```html
<section id="view-dashboard" class="view-section active" style="padding: 32px;">

  <!-- Greeting Hero -->
  <div class="dashboard-greeting">
    <div>
      <h1 class="dashboard-greeting-title">Selamat datang, <span id="user-firstname">Budi</span> 👋</h1>
      <p class="dashboard-greeting-sub">Mulai buat foto AI profesional sekarang — pilih kategori di bawah.</p>
    </div>
    <!-- Usage progress bar -->
    <div class="dashboard-usage-card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span class="dashboard-usage-label">Penggunaan bulan ini</span>
        <span class="dashboard-usage-count"><span id="d-used">27</span> / <span id="d-total">50</span> foto</span>
      </div>
      <div class="dashboard-usage-bar">
        <div class="dashboard-usage-fill" id="d-usage-fill" style="width: 54%;"></div>
      </div>
      <span class="dashboard-usage-plan">Plan Free · <a href="#" onclick="navigateTo('account')" style="color: #1FA6B5;">Upgrade ke Pro →</a></span>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="dashboard-stats-grid">
    <div class="dashboard-stat-card">
      <div class="dashboard-stat-icon">📸</div>
      <div class="dashboard-stat-num" id="stat-total-photos">27</div>
      <div class="dashboard-stat-label">Total Foto Dibuat</div>
    </div>
    <div class="dashboard-stat-card">
      <div class="dashboard-stat-icon">🕐</div>
      <div class="dashboard-stat-num" id="stat-last-session">2 jam lalu</div>
      <div class="dashboard-stat-label">Sesi Terakhir</div>
    </div>
    <div class="dashboard-stat-card">
      <div class="dashboard-stat-icon">⭐</div>
      <div class="dashboard-stat-num">Free</div>
      <div class="dashboard-stat-label">Plan Aktif</div>
    </div>
  </div>

  <!-- Section: Kategori Generator -->
  <div class="dashboard-section">
    <div class="dashboard-section-header">
      <h2 class="dashboard-section-title">Pilih Kategori Foto</h2>
      <p class="dashboard-section-sub">Klik kategori untuk mulai generate foto AI</p>
    </div>
    <div class="dashboard-categories-grid">

      <!-- Card: Prewedding -->
      <div class="dashboard-category-card" onclick="navigateTo('generator', 'prewedding')">
        <div class="category-card-img-wrap">
          <img src="https://placehold.co/400x280" alt="Prewedding AI" loading="lazy" class="category-card-img">
          <div class="category-card-overlay">
            <span class="category-card-start">Mulai Generate →</span>
          </div>
        </div>
        <div class="category-card-body">
          <div class="category-card-icon-wrap">💍</div>
          <div>
            <h3 class="category-card-title">Prewedding</h3>
            <p class="category-card-desc">Foto prewedding di ratusan lokasi dunia</p>
          </div>
        </div>
      </div>

      <!-- Card: Wedding -->
      <div class="dashboard-category-card" onclick="navigateTo('generator', 'wedding')">...</div>

      <!-- Card: Engagement -->
      <div class="dashboard-category-card" onclick="navigateTo('generator', 'engagement')">...</div>

      <!-- Card: Studio -->
      <div class="dashboard-category-card" onclick="navigateTo('generator', 'studio')">...</div>

      <!-- Card: Family -->
      <div class="dashboard-category-card" onclick="navigateTo('generator', 'family')">...</div>

    </div>
  </div>

  <!-- Section: Riwayat Terbaru -->
  <div class="dashboard-section">
    <div class="dashboard-section-header">
      <h2 class="dashboard-section-title">Foto Terbaru</h2>
      <a href="#" onclick="navigateTo('history')" class="dashboard-see-all">Lihat semua →</a>
    </div>
    <div id="dashboard-recent-photos" class="dashboard-recent-grid">
      <!-- Diisi oleh JS dari localStorage / API -->
      <!-- Fallback: empty state -->
      <div class="dashboard-empty-state" id="dashboard-empty">
        <div class="dashboard-empty-icon">🖼️</div>
        <p class="dashboard-empty-text">Belum ada foto yang dibuat. Mulai generate sekarang!</p>
        <button class="btn-primary btn-sm" onclick="navigateTo('generator')">Buat Foto Pertama</button>
      </div>
    </div>
  </div>

</section>
```

---

## 9. View: Generator

### Anatomi Keseluruhan

```
┌─────────────────────────────────────────────────────────────────┐
│  GENERATOR HEADER                                               │
│  Tab pills: Prewedding · Wedding · Engagement · Studio · Family │
├───────────────────────────────┬─────────────────────────────────┤
│                               │                                 │
│  LEFT PANEL (360px)           │  RIGHT PANEL (flex-1)           │
│  Form controls                │  Output area                    │
│                               │                                 │
│  ┌ Upload Section           ┐ │  [Empty state / Loading /       │
│  │  Face Upload (per tab)   │ │   Results 2x2 grid]             │
│  └──────────────────────────┘ │                                 │
│  ┌ Form Fields              ┐ │                                 │
│  │  Dropdown fields         │ │                                 │
│  │  Text inputs             │ │                                 │
│  │  Custom inputs           │ │                                 │
│  └──────────────────────────┘ │                                 │
│  ┌ Generate Button          ┐ │                                 │
│  │  [Generate 4 Foto ▶]     │ │                                 │
│  └──────────────────────────┘ │                                 │
└───────────────────────────────┴─────────────────────────────────┘
```

### DOM Structure — Generator Layout

```html
<section id="view-generator" class="view-section" style="
  display: flex; flex-direction: column; height: calc(100vh - 68px);
">

  <!-- Generator Header + Tab Switcher -->
  <div class="generator-header">
    <div class="generator-header-top">
      <div>
        <h2 class="generator-title">AI Photo Generator</h2>
        <p class="generator-sub">Pilih kategori dan isi parameter untuk generate foto AI</p>
      </div>
    </div>
    <!-- Tab Pills -->
    <div class="generator-tabs" role="tablist">
      <button class="gen-tab active" data-tab="prewedding" onclick="switchTab('prewedding')" role="tab" aria-selected="true">
        💍 Prewedding
      </button>
      <button class="gen-tab" data-tab="wedding" onclick="switchTab('wedding')" role="tab">
        👰 Wedding
      </button>
      <button class="gen-tab" data-tab="engagement" onclick="switchTab('engagement')" role="tab">
        💎 Engagement
      </button>
      <button class="gen-tab" data-tab="studio" onclick="switchTab('studio')" role="tab">
        📸 Studio
      </button>
      <button class="gen-tab" data-tab="family" onclick="switchTab('family')" role="tab">
        👨‍👩‍👧‍👦 Family
      </button>
    </div>
  </div>

  <!-- Two-panel body -->
  <div class="generator-body">

    <!-- LEFT: Form panel -->
    <div class="generator-panel-left" id="generator-form-panel">

      <!-- Tab contents (hanya 1 yang visible) -->
      <div class="tab-content active" id="tab-prewedding" data-tab="prewedding">
        <!-- Isi form Prewedding - lihat Section 9.1 -->
      </div>
      <div class="tab-content" id="tab-wedding" data-tab="wedding">
        <!-- Isi form Wedding - lihat Section 9.2 -->
      </div>
      <div class="tab-content" id="tab-engagement">...</div>
      <div class="tab-content" id="tab-studio">...</div>
      <div class="tab-content" id="tab-family">...</div>

    </div>

    <!-- RIGHT: Output panel -->
    <div class="generator-panel-right" id="generator-output-panel">
      <!-- Empty State -->
      <div id="output-empty" class="output-empty-state">
        <div class="output-empty-icon">✨</div>
        <h3 class="output-empty-title">Siap untuk generate</h3>
        <p class="output-empty-sub">Isi form di sebelah kiri, lalu klik "Generate 4 Foto"</p>
        <div class="output-example-grid">
          <!-- 4 placeholder images sebagai preview -->
          <img src="https://placehold.co/260x325" alt="" loading="lazy" class="output-example-img">
          <img src="https://placehold.co/260x325" alt="" loading="lazy" class="output-example-img">
          <img src="https://placehold.co/260x325" alt="" loading="lazy" class="output-example-img">
          <img src="https://placehold.co/260x325" alt="" loading="lazy" class="output-example-img">
        </div>
      </div>

      <!-- Loading State (skeleton) -->
      <div id="output-loading" style="display: none;">
        <div class="output-loading-header">
          <div class="loading-badge">
            <span class="loading-dot"></span>
            Sedang memproses AI...
          </div>
          <p class="loading-sub">Estimasi waktu: 15–30 detik</p>
        </div>
        <div class="output-grid">
          <div class="skeleton-result-card">
            <div class="skeleton-box skeleton-image" style="aspect-ratio: 4/5;"></div>
            <div class="skeleton-result-footer">
              <div class="skeleton-box skeleton-text" style="width: 80px;"></div>
              <div class="skeleton-box skeleton-text" style="width: 60px;"></div>
            </div>
          </div>
          <!-- x4 skeleton cards -->
        </div>
      </div>

      <!-- Result Grid -->
      <div id="output-results" style="display: none;">
        <div class="output-results-header">
          <div class="results-badge">
            ✓ 4 foto berhasil dibuat
          </div>
          <button class="btn-secondary btn-sm" onclick="regenerateAll()">
            🔄 Generate Ulang Semua
          </button>
        </div>
        <div class="output-grid" id="results-grid">
          <!-- Diisi oleh renderGallery() -->
        </div>
      </div>

    </div>

  </div>

</section>
```

### CSS: Generator Layout

```css
.generator-header {
  padding: 20px 24px 0;
  background: white;
  border-bottom: 1px solid #EEF3F5;
  flex-shrink: 0;
}
.generator-title {
  font-family: 'Montserrat', sans-serif; font-weight: 700;
  font-size: 20px; color: #1E2A2F;
}
.generator-tabs {
  display: flex; gap: 6px; margin-top: 14px; overflow-x: auto;
  padding-bottom: 0; scrollbar-width: none;
}
.generator-tabs::-webkit-scrollbar { display: none; }
.gen-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 100px;
  font-family: 'Roboto Mono', monospace; font-size: 12px; font-weight: 500;
  color: #A7B0B5; border: 1.5px solid #EEF3F5;
  background: white; cursor: pointer; white-space: nowrap;
  transition: all 0.2s ease;
}
.gen-tab:hover  { color: #1E2A2F; border-color: rgba(31,166,181,0.3); }
.gen-tab.active { background: #1FA6B5; color: white; border-color: #1FA6B5; }

.generator-body { display: flex; flex: 1; overflow: hidden; }

.generator-panel-left {
  width: 360px; flex-shrink: 0; overflow-y: auto;
  border-right: 1px solid #EEF3F5; padding: 20px;
  display: flex; flex-direction: column; gap: 20px;
  background: white;
}
.generator-panel-right {
  flex: 1; overflow-y: auto;
  padding: 24px; background: #EEF3F5;
}
.output-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 14px; margin-top: 16px;
}
.tab-content { display: none; }
.tab-content.active { display: flex; flex-direction: column; gap: 20px; }
```

---

## 10. Form Section per Tab — Left Panel

### 10.1 Upload Section (Wajib Semua Tab)

```html
<!-- UPLOAD SECTION (identik struktur di semua tab, hanya label berbeda) -->
<div class="form-section">
  <div class="form-section-title">📷 Foto Referensi Wajah</div>

  <!-- Prewedding: 2 upload (Pria + Wanita) -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

    <div class="upload-wrap">
      <div class="upload-label-top">Foto Pria</div>
      <div class="upload-box" id="upload-pw-pria" onclick="triggerUpload('upload-pw-pria-input')">
        <input type="file" id="upload-pw-pria-input" accept="image/*" style="display:none"
          onchange="handleFaceUpload(this, 'upload-pw-pria')">
        <svg class="upload-icon" ...></svg>
        <span class="upload-label">Klik atau drag foto</span>
        <span class="upload-hint">JPG, PNG, WEBP · Max 5MB</span>
      </div>
    </div>

    <div class="upload-wrap">
      <div class="upload-label-top">Foto Wanita</div>
      <div class="upload-box" id="upload-pw-wanita" onclick="triggerUpload('upload-pw-wanita-input')">
        <input type="file" id="upload-pw-wanita-input" accept="image/*" style="display:none"
          onchange="handleFaceUpload(this, 'upload-pw-wanita')">
        <svg class="upload-icon" ...></svg>
        <span class="upload-label">Klik atau drag foto</span>
        <span class="upload-hint">JPG, PNG, WEBP · Max 5MB</span>
      </div>
    </div>

  </div>
  <!-- Studio & Family: 1 upload saja (grid-template-columns: 1fr) -->
</div>
```

### Upload Box per Tab

| Tab | Upload Fields |
|-----|--------------|
| Prewedding | 2 kotak: Pria + Wanita |
| Wedding | 2 kotak: Pria (Pengantin) + Wanita (Pengantin) |
| Engagement | 2 kotak: Pria + Wanita |
| Studio | 1 kotak: Foto Subject |
| Family | 1 kotak: Foto Keluarga (opsional) |

### 10.2 Struktur Form Fields (Per Tab)

#### Combo Custom Pattern (Select + Custom Input)

```html
<!-- Select field dengan opsi "Tulis sendiri..." -->
<div class="form-field">
  <label class="form-label">Outfit Pria</label>
  <select class="select" id="pw-outfit-pria" onchange="checkCustom(this, 'pw-outfit-pria-custom')">
    <optgroup label="── KASUAL ELEGAN ──">
      <option value="wearing white linen shirt, khaki chinos, brown leather loafers">
        Kemeja Putih Linen + Celana Khaki
      </option>
      <!-- ...lebih banyak option... -->
    </optgroup>
    <optgroup label="── CUSTOM ──">
      <option value="custom">✏️ Tulis sendiri...</option>
    </optgroup>
  </select>
  <!-- Custom input (tersembunyi secara default) -->
  <input type="text" class="input" id="pw-outfit-pria-custom"
    placeholder="Deskripsikan outfit pria..." style="display: none; margin-top: 8px;">
</div>
```

#### Location Field Pattern

```html
<!-- Location select + auto-fill hidden detail -->
<div class="form-field">
  <label class="form-label">Lokasi</label>
  <select class="select" id="pw-lokasi" onchange="fillLocationDetail(this, 'pw-lokasi-detail')">
    <optgroup label="🇮🇩 Indonesia">
      <option value="bali_heaven">Pura Lempuyang (Gates of Heaven), Bali</option>
      <option value="bali_ubud">Tegallalang Rice Terrace, Ubud, Bali</option>
      <!-- ...semua lokasi... -->
    </optgroup>
    <optgroup label="🌏 Asia">...</optgroup>
    <optgroup label="🇪🇺 Eropa">...</optgroup>
    <!-- ...dst... -->
    <optgroup label="── CUSTOM ──">
      <option value="custom">✏️ Tulis lokasi sendiri...</option>
    </optgroup>
  </select>
  <!-- Hidden input untuk detail lokasi (auto-fill dari LOCATION_DATA) -->
  <input type="hidden" id="pw-lokasi-detail">
  <!-- Custom location input (tersembunyi) -->
  <input type="text" class="input" id="pw-lokasi-custom"
    placeholder="Nama lokasi & detail suasana..." style="display: none; margin-top: 8px;">
</div>
```

---

## 11. Result Image Card (Output)

### DOM per Image Card

```html
<!-- 1 card dalam output-grid (4x total) -->
<div class="result-card" data-index="0">
  <div class="result-image-wrap">
    <img src="[generated-url]" alt="Foto AI hasil generate 1"
      class="result-image" loading="lazy">
    <div class="result-overlay">
      <button class="result-overlay-btn" onclick="openImageFull(0)">
        🔍 Buka Penuh
      </button>
    </div>
  </div>
  <div class="result-footer">
    <span class="result-label">4:5 · 1024×1280</span>
    <div class="result-actions">
      <button class="result-btn" onclick="regenerateSingle(0)" title="Generate ulang foto ini">
        <svg ...></svg> Ulang
      </button>
      <button class="result-btn result-btn-download" onclick="downloadImage(0, 'potretai-prewedding-1')" title="Download foto">
        <svg ...></svg> Unduh
      </button>
    </div>
  </div>
</div>
```

---

## 12. View: History

### DOM Structure

```html
<section id="view-history" class="view-section" style="padding: 32px;">

  <!-- Header -->
  <div class="history-header">
    <div>
      <h2 class="history-title">Riwayat Foto</h2>
      <p class="history-sub">Semua foto yang pernah kamu buat</p>
    </div>
    <!-- Filter tabs -->
    <div class="history-filter-tabs">
      <button class="cat-tab active" data-filter="all" onclick="filterHistory('all')">Semua</button>
      <button class="cat-tab" data-filter="prewedding" onclick="filterHistory('prewedding')">Prewedding</button>
      <button class="cat-tab" data-filter="wedding" onclick="filterHistory('wedding')">Wedding</button>
      <button class="cat-tab" data-filter="studio" onclick="filterHistory('studio')">Studio</button>
      <button class="cat-tab" data-filter="family" onclick="filterHistory('family')">Family</button>
    </div>
  </div>

  <!-- Photo grid -->
  <div id="history-grid" class="history-photo-grid">
    <!-- Diisi oleh JS -->
    <!-- Empty state jika kosong -->
    <div id="history-empty" class="history-empty-state">
      <div>🖼️</div>
      <p>Belum ada foto di riwayat</p>
      <button class="btn-primary btn-sm" onclick="navigateTo('generator')">Generate Sekarang</button>
    </div>
  </div>

</section>
```

```css
.history-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}
```

---

## 13. JavaScript Architecture

### Module Declarations (di bawah `</body>`)

```html
<script>
// ================================================================
// MODULE: AppController — Global State & Navigation
// ================================================================
const AppController = {
  currentView: 'dashboard',
  currentTab: 'prewedding',
  
  navigateTo(view, tab = null) {
    // Hide semua sections
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    // Show target section
    document.getElementById(`view-${view}`)?.classList.add('active');
    // Update sidebar active state
    this.updateSidebarActive(view);
    // Update topbar nav active
    this.updateTopbarActive(view);
    // Update state
    this.currentView = view;
    if (tab) { switchTab(tab); this.currentTab = tab; }
  },
  
  updateSidebarActive(view) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });
  },
  updateTopbarActive(view) {
    document.querySelectorAll('.topbar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });
  }
};

// Global alias
function navigateTo(view, tab) { AppController.navigateTo(view, tab); }


// ================================================================
// MODULE: PromptBuilder — Prompt Construction (HIDDEN dari user)
// ================================================================
const PromptBuilder = {
  AUTO_MODIFIERS: `ultra realistic, photorealistic, 8k resolution, professional photography, 
    sharp focus, high detail skin texture, cinematic lighting, natural lighting, 
    depth of field, bokeh, professional lens, 85mm lens, full frame camera, 
    RAW photo, HDR, realistic skin tones, no text, no watermark`,

  buildPrewedding(params) {
    const loc = LOCATION_DATA[params.lokasi];
    return `${params.deskripsi}, ${params.outfitPria}, ${params.outfitWanita}, ` +
           `at ${loc?.detail || params.lokasiCustom}, ` +
           `${params.waktu}, ${params.suasana}, ${params.kamera}, ${params.lensa}, ` +
           `${params.pose}, ${params.colorGrade}, ${this.AUTO_MODIFIERS}`;
  },

  buildWedding(params) { /* ... */ },
  buildEngagement(params) { /* ... */ },
  buildStudio(params) { /* ... */ },
  buildFamily(params) { /* ... */ },

  build(tab, params) {
    const builders = {
      prewedding: this.buildPrewedding.bind(this),
      wedding:    this.buildWedding.bind(this),
      engagement: this.buildEngagement.bind(this),
      studio:     this.buildStudio.bind(this),
      family:     this.buildFamily.bind(this),
    };
    return builders[tab]?.(params) || '';
  }
};


// ================================================================
// MODULE: FalEngine — AI Generation API Calls
// ================================================================
const FalEngine = {
  isGenerating: false,   // Generation lock

  async generateImages(prompt, count = 4, aspectRatio = '4:5') {
    if (this.isGenerating) {
      showToast('Generate sedang berlangsung...', 'info');
      return null;
    }
    this.isGenerating = true;
    try {
      // Generate 4 images in parallel
      const promises = Array(count).fill(null).map((_, i) =>
        this.generateSingle(prompt, aspectRatio, i)
      );
      const results = await Promise.all(promises);
      return results;
    } finally {
      this.isGenerating = false;
    }
  },

  async generateSingle(prompt, aspectRatio, seed = null) {
    const url = this.buildFalURL(prompt, aspectRatio, seed);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Generation failed: ${response.status}`);
    const data = await response.json();
    return data.images?.[0]?.url || data.image?.url;
  },

  buildFalURL(prompt, aspectRatio, seed) {
    const params = new URLSearchParams({
      prompt,
      aspect_ratio: aspectRatio,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      ...(seed !== null && { seed: Math.floor(Math.random() * 1000000) + seed })
    });
    return `https://fal.run/fal-ai/flux/schnell?${params}`;
  }
};


// ================================================================
// MODULE: GalleryRenderer — DOM Rendering
// ================================================================
const GalleryRenderer = {
  render(imageUrls, tab) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = imageUrls.map((url, i) =>
      this.createCard(url, i, tab)
    ).join('');
    UIController.showResults();
  },

  createCard(url, index, tab) {
    return `
      <div class="result-card" data-index="${index}">
        <div class="result-image-wrap">
          <img src="${url}" alt="Foto AI ${index + 1}" class="result-image" loading="lazy"
            onerror="this.src='https://placehold.co/400x500?text=Gagal+Load'">
          <div class="result-overlay">
            <button class="result-overlay-btn" onclick="openImageFull(${index})">🔍 Buka</button>
          </div>
        </div>
        <div class="result-footer">
          <span class="result-label">4:5 · 1024×1280</span>
          <div class="result-actions">
            <button class="result-btn" onclick="regenerateSingle(${index})">🔄 Ulang</button>
            <button class="result-btn result-btn-dl" onclick="downloadImage('${url}', '${tab}-${index + 1}')">⬇ Unduh</button>
          </div>
        </div>
      </div>`;
  }
};


// ================================================================
// MODULE: UploadManager — Face Reference Uploads
// ================================================================
const UploadManager = {
  files: {},   // { boxId: File }

  handleUpload(input, boxId) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maks 5MB', 'error');
      return;
    }
    this.files[boxId] = file;
    const reader = new FileReader();
    reader.onload = (e) => this.renderPreview(boxId, e.target.result);
    reader.readAsDataURL(file);
  },

  renderPreview(boxId, dataUrl) {
    const box = document.getElementById(boxId);
    box.innerHTML = `
      <img src="${dataUrl}" alt="Preview">
      <button class="btn-clear" onclick="UploadManager.clearUpload('${boxId}')" aria-label="Hapus foto">×</button>`;
    box.classList.add('has-file');
  },

  clearUpload(boxId) {
    this.files[boxId] = null;
    const box = document.getElementById(boxId);
    box.innerHTML = `<!-- default empty state SVG + label -->`;
    box.classList.remove('has-file');
  },

  getFile(boxId) { return this.files[boxId] || null; }
};

// Global aliases
function handleFaceUpload(input, boxId) { UploadManager.handleUpload(input, boxId); }


// ================================================================
// MODULE: UIController — UI State & Interactions
// ================================================================
const UIController = {
  showLoading() {
    document.getElementById('output-empty').style.display = 'none';
    document.getElementById('output-loading').style.display = 'block';
    document.getElementById('output-results').style.display = 'none';
  },
  showResults() {
    document.getElementById('output-loading').style.display = 'none';
    document.getElementById('output-results').style.display = 'block';
  },
  showEmpty() {
    document.getElementById('output-empty').style.display = 'block';
    document.getElementById('output-loading').style.display = 'none';
    document.getElementById('output-results').style.display = 'none';
  }
};


// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function switchTab(tab) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  // Show target tab
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  // Update tab buttons
  document.querySelectorAll('.gen-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
    btn.setAttribute('aria-selected', btn.dataset.tab === tab);
  });
  AppController.currentTab = tab;
}

function checkCustom(select, customInputId) {
  const customInput = document.getElementById(customInputId);
  customInput.style.display = select.value === 'custom' ? 'block' : 'none';
  if (select.value === 'custom') customInput.focus();
}

function fillLocationDetail(select, detailInputId) {
  const locationData = LOCATION_DATA[select.value];
  const detailInput = document.getElementById(detailInputId);
  const customInput = document.getElementById(detailInputId.replace('-detail', '-custom'));
  
  if (select.value === 'custom') {
    customInput.style.display = 'block';
    detailInput.value = '';
  } else {
    customInput.style.display = 'none';
    detailInput.value = locationData?.detail || '';
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Tampilkan password');
  // Toggle eye/eye-off icon
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `potretai-${filename}-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Foto berhasil diunduh! 🎉', 'success');
  } catch {
    showToast('Gagal mengunduh foto', 'error');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>`;
  container.appendChild(toast);
  // Trigger enter animation
  requestAnimationFrame(() => toast.classList.add('show'));
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function toggleAvatarMenu() {
  const menu = document.getElementById('avatar-dropdown');
  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';
  // Close on outside click
  if (!isVisible) {
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('#avatar-trigger') && !e.target.closest('#avatar-dropdown')) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }
}

// ================================================================
// MAIN GENERATE FLOW
// ================================================================
async function generateImages() {
  const tab = AppController.currentTab;
  const params = collectFormParams(tab);

  // Validate
  if (!validateParams(tab, params)) return;

  // Build prompt (internal, tidak pernah ditampilkan ke user)
  const prompt = PromptBuilder.build(tab, params);

  // Show loading
  UIController.showLoading();

  try {
    const urls = await FalEngine.generateImages(prompt, 4, params.aspectRatio || '4:5');
    if (urls && urls.every(Boolean)) {
      GalleryRenderer.render(urls, tab);
      showToast('4 foto berhasil dibuat! ✨', 'success');
    } else {
      throw new Error('Sebagian foto gagal dibuat');
    }
  } catch (err) {
    UIController.showEmpty();
    showToast('Gagal generate foto. Coba lagi.', 'error');
    console.error('[PotretAI] Generate error:', err);
  }
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  AppController.navigateTo('dashboard');
  switchTab('prewedding');
  // Set user display name dari session/localStorage
  // const user = JSON.parse(localStorage.getItem('potretai_user') || '{}');
  // if (user.firstName) document.getElementById('user-firstname').textContent = user.firstName;
});
</script>
```

---

## 14. Interaction Flow — Generate

```
User klik tab (misal: Prewedding)
    ↓
switchTab('prewedding') → show tab-prewedding form
    ↓
User isi form (upload foto, pilih outfit, lokasi, dll)
    ↓
User klik "Generate 4 Foto"
    ↓
generateImages()
    ↓
validateParams() → jika invalid: showToast(error) + stop
    ↓
collectFormParams() → ambil semua nilai form
    ↓
PromptBuilder.build('prewedding', params) → construct prompt (hidden)
    ↓
UIController.showLoading() → tampilkan skeleton 4 cards
    ↓
FalEngine.generateImages(prompt, 4) → 4x Promise.all parallel API calls
    ↓
[Sukses] GalleryRenderer.render(urls) → render 4 image cards
         showToast('4 foto berhasil dibuat! ✨', 'success')
    ↓
[Gagal]  UIController.showEmpty()
         showToast('Gagal generate foto. Coba lagi.', 'error')
```

---

## 15. View State Management

```
view-dashboard    → default active
view-generator    → aktif saat navigateTo('generator')
view-history      → aktif saat navigateTo('history')
view-account      → aktif saat navigateTo('account')

CSS rule:
.view-section         { display: none; }
.view-section.active  { display: block; }  /* atau flex tergantung layout */
```

---

## 16. Mobile Responsive Patterns

### Topbar — Mobile
```css
@media (max-width: 1023px) {
  .topbar-nav    { display: none; }     /* hidden, replaced by sidebar drawer */
  .topbar-hamburger { display: flex; }  /* visible */
  .topbar-usage  { display: none; }     /* save space on mobile */
}
```

### Sidebar — Mobile (Drawer)
```css
/* Sidebar normal: hidden di mobile */
#sidebar { display: none; }
@media (min-width: 1024px) {
  #sidebar { display: flex; }
}
/* Sidebar mobile: drawer dari kiri */
#sidebar-mobile {
  position: fixed; left: -280px; top: 0; bottom: 0;
  width: 280px; z-index: 40;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* sama isinya dengan sidebar desktop */
}
#sidebar-mobile.open { left: 0; }
```

### Generator — Mobile
```css
@media (max-width: 1023px) {
  .generator-body { flex-direction: column; height: auto; }
  .generator-panel-left { width: 100%; border-right: none; border-bottom: 1px solid #EEF3F5; }
  .generator-panel-right { height: auto; }
  .output-grid { grid-template-columns: 1fr; }
}
```

### Auth — Mobile
```css
@media (max-width: 767px) {
  .auth-split-wrapper { grid-template-columns: 1fr; }
  .auth-left-panel    { display: none; }
  .auth-right-panel   { padding: 32px 20px; }
  .auth-logo-mobile   { display: block; }
}
@media (min-width: 768px) {
  .auth-logo-mobile { display: none; }
}
```

---

## 17. File Checklist Sebelum Generate HTML

### login.html & login-masuk.html
- [ ] Split screen layout 60/40
- [ ] Left panel: logo, tagline, preview cards float animation, trust badges
- [ ] Right panel: form dengan semua fields
- [ ] Toggle show/hide password
- [ ] Google login button
- [ ] Mobile responsive (left panel hidden)
- [ ] Link antar halaman login ↔ login-masuk

### app.html
- [ ] Topbar sticky dengan usage counter + avatar dropdown
- [ ] Sidebar dengan 5 menu utama + generator submenu
- [ ] Mobile sidebar drawer
- [ ] 4 views: dashboard, generator, history, account
- [ ] Dashboard: greeting + stats + 5 category cards + recent photos
- [ ] Generator: 5 tabs + left panel form + right panel output
- [ ] Upload boxes per tab (2 atau 1 sesuai tab)
- [ ] Combo custom pattern pada select fields
- [ ] Location database LOCATION_DATA lengkap
- [ ] 6 JS modules: AppController, PromptBuilder, FalEngine, GalleryRenderer, UploadManager, UIController
- [ ] Loading skeleton shimmer (4 cards)
- [ ] Result grid (4 cards) dengan download + regenerate
- [ ] Toast notification system
- [ ] History view dengan filter tabs
- [ ] navigateTo() berfungsi di semua nav items

---

## 18. Modal Lightbox — Foto Fullscreen

Dipanggil oleh `GalleryRenderer.openFull(index)` — menampilkan satu foto dalam overlay fullscreen.

### DOM Structure

```html
<!-- Modal Lightbox — letakkan di akhir <body>, sebelum </body> -->
<div id="modal-lightbox" class="modal-lightbox" role="dialog" aria-modal="true"
  aria-label="Foto ukuran penuh" style="display:none;"
  onclick="LightboxModal.closeOnBackdrop(event)">

  <!-- Close button -->
  <button class="modal-close-btn" onclick="LightboxModal.close()"
    aria-label="Tutup">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>

  <!-- Navigation prev/next -->
  <button class="modal-nav-btn modal-nav-prev" id="modal-prev"
    onclick="LightboxModal.prev()" aria-label="Foto sebelumnya">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  </button>

  <!-- Image container -->
  <div class="modal-img-container">
    <img id="modal-img" src="" alt="Foto AI fullscreen"
      class="modal-img" draggable="false">
    <!-- Loading shimmer saat gambar dimuat -->
    <div id="modal-loading" class="modal-img-loading skeleton-box"></div>
  </div>

  <!-- Navigation next -->
  <button class="modal-nav-btn modal-nav-next" id="modal-next"
    onclick="LightboxModal.next()" aria-label="Foto berikutnya">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </button>

  <!-- Footer bar -->
  <div class="modal-footer">
    <span class="modal-counter" id="modal-counter">1 / 4</span>
    <div class="modal-footer-actions">
      <button class="modal-action-btn"
        onclick="LightboxModal.downloadCurrent()" title="Download foto ini">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Unduh
      </button>
      <button class="modal-action-btn"
        onclick="window.open(document.getElementById('modal-img').src,'_blank')"
        title="Buka di tab baru">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Buka Tab
      </button>
    </div>
  </div>

</div>
```

### CSS

```css
/* ── Lightbox Overlay ─────────────────────────────────────────── */
.modal-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(14, 26, 32, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* Animasi masuk */
  animation: modalFadeIn 0.22s ease;
}
@keyframes modalFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Close Button ─────────────────────────────────────────────── */
.modal-close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: background 0.18s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
}
.modal-close-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg) scale(1.1);
}
.modal-close-btn:focus-visible {
  outline: 2px solid rgba(31,166,181,0.7);
  outline-offset: 3px;
}

/* ── Image Container ──────────────────────────────────────────── */
.modal-img-container {
  position: relative;
  max-width: min(90vw, 600px);
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
}
.modal-img {
  display: block;
  max-width: 100%;
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
  user-select: none;
  transition: opacity 0.2s ease;
}
.modal-img.loading { opacity: 0; }
.modal-img-loading {
  position: absolute;
  inset: 0;
  border-radius: 16px;
}

/* ── Navigation Buttons ───────────────────────────────────────── */
.modal-nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: background 0.18s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
}
.modal-nav-btn:hover {
  background: rgba(31,166,181,0.35);
  border-color: rgba(31,166,181,0.4);
}
.modal-nav-prev { left: 20px; }
.modal-nav-next { right: 20px; }
.modal-nav-btn:hover { transform: translateY(-50%) scale(1.1); }
.modal-nav-btn:disabled { opacity: 0.25; cursor: default; }
.modal-nav-btn:disabled:hover { background: rgba(255,255,255,0.1); transform: translateY(-50%); }

/* ── Footer Bar ──────────────────────────────────────────────── */
.modal-footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(30,42,47,0.8);
  backdrop-filter: blur(12px);
  border-radius: 100px;
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.1);
}
.modal-counter {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.modal-footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  color: white;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.18s ease;
}
.modal-action-btn:hover {
  background: rgba(31,166,181,0.3);
  border-color: rgba(31,166,181,0.4);
}
```

### JavaScript — LightboxModal Module

```js
// ================================================================
// MODULE: LightboxModal
// ================================================================
const LightboxModal = {
  _urls:    [],     // Array 4 image URLs dari sesi terakhir
  _current: 0,      // Index yang sedang ditampilkan
  _tab:     '',     // Tab terakhir — untuk nama file download

  /** Buka lightbox pada index tertentu */
  open(index, urls, tab) {
    this._urls    = urls || [];
    this._current = index;
    this._tab     = tab || 'foto';

    const modal = document.getElementById('modal-lightbox');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';   // lock scroll

    this._loadImage(index);
    this._updateNav();

    // ESC key handler
    document.addEventListener('keydown', this._keyHandler);
  },

  /** Tutup lightbox */
  close() {
    const modal = document.getElementById('modal-lightbox');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._keyHandler);
  },

  /** Tutup saat klik backdrop (bukan konten) */
  closeOnBackdrop(event) {
    if (event.target === document.getElementById('modal-lightbox')) {
      this.close();
    }
  },

  /** Navigasi ke foto berikutnya */
  next() {
    if (this._current < this._urls.length - 1) {
      this._current++;
      this._loadImage(this._current);
      this._updateNav();
    }
  },

  /** Navigasi ke foto sebelumnya */
  prev() {
    if (this._current > 0) {
      this._current--;
      this._loadImage(this._current);
      this._updateNav();
    }
  },

  /** Download foto yang sedang ditampilkan */
  async downloadCurrent() {
    const url = this._urls[this._current];
    if (url) {
      await downloadImage(url, `${this._tab}-${this._current + 1}`);
    }
  },

  /** Load + tampilkan image di index tertentu */
  _loadImage(index) {
    const img     = document.getElementById('modal-img');
    const loading = document.getElementById('modal-loading');
    const url     = this._urls[index];
    if (!img || !url) return;

    // Tampilkan shimmer, sembunyikan gambar
    img.classList.add('loading');
    if (loading) loading.style.display = 'block';

    const newImg = new Image();
    newImg.onload = () => {
      img.src = url;
      img.classList.remove('loading');
      if (loading) loading.style.display = 'none';
    };
    newImg.onerror = () => {
      img.src = 'https://placehold.co/400x500?text=Gagal+Load';
      img.classList.remove('loading');
      if (loading) loading.style.display = 'none';
    };
    newImg.src = url;
  },

  /** Update counter teks + disable prev/next */
  _updateNav() {
    const counter  = document.getElementById('modal-counter');
    const prevBtn  = document.getElementById('modal-prev');
    const nextBtn  = document.getElementById('modal-next');
    const n = this._urls.length;

    if (counter) counter.textContent = `${this._current + 1} / ${n}`;
    if (prevBtn) prevBtn.disabled = this._current === 0;
    if (nextBtn) nextBtn.disabled = this._current === n - 1;
  },

  /** Keyboard handler (ESC, Arrow keys) */
  _keyHandler: (e) => {
    if (e.key === 'Escape')     LightboxModal.close();
    if (e.key === 'ArrowRight') LightboxModal.next();
    if (e.key === 'ArrowLeft')  LightboxModal.prev();
  },
};
```

### Cara Memanggil dari GalleryRenderer

```js
// Di dalam GalleryRenderer._createCardHTML()
// Ganti onclick "Buka Penuh" dari:
//   onclick="GalleryRenderer.openFull(${index})"
// Menjadi:
//   onclick="LightboxModal.open(${index}, GalleryRenderer._lastUrls, GalleryRenderer._lastTab)"

// Dan di GalleryRenderer.render() — simpan URLs:
render(imageUrls, tab, aspectRatio) {
  this._lastUrls = imageUrls;   // ← simpan untuk lightbox
  // ... rest of render code
}
```

---

## 19. index.html — Landing Page Component Map

### Struktur DOM index.html

```
<body>
  <nav #navbar>                          ← Sticky, blur on scroll
    .logo-wrap → brand_asset/Logo potretai.png
    .nav-links  → Fitur · Cara Kerja · Gallery · Harga · FAQ
    .nav-cta    → btn-secondary "Masuk" + btn-primary "Daftar Gratis"
    #hamburger  → mobile toggle
  </nav>

  <div #mobileOverlay>                   ← Mobile sidebar drawer
    .mobile-panel → nav links + CTA buttons

  <section #hero .hero-bg>               ← min-height: 100svh
    .hero-text                           ← kiri/atas
      .tag-pill "AI-Powered Studio · v3"
      h1 "Studio Foto Profesional, Powered by AI"
      p  subtext manfaat produk
      .cta-row
        btn-primary → login.html "Buat Foto Pertama Gratis →"
        btn-secondary → #cara-kerja "Lihat Cara Kerjanya"
      .stats-row → 50K+ Foto · 4.9★ · 3K+ Pengguna
    .hero-visual                         ← kanan, hidden mobile
      .photo-card.float-a → placeholder wedding
      .photo-card.float-b → placeholder studio
      .badge-chip.float-b "AI Enhanced · In < 30s"
      .badge-chip "Prewedding · Wedding · Studio · Family"

  <div .trust-bar>                       ← Background #EEF3F5
    "Dipercaya fotografer & pasangan Indonesia"
    5 category pills

  <section #fitur>
    .tag-pill "Fitur"
    h2 "Semua yang kamu butuhkan untuk foto profesional"
    .features-grid (3 kolom)
      6× .feature-card (ikon + judul + deskripsi)
      Cepat 30 Detik · Ratusan Gaya · Wajah Akurat
      Hemat Biaya · Privasi Terjaga · Mobile Friendly

  <section #cara-kerja>
    .tag-pill "Cara Kerja"
    h2 "3 langkah mudah"
    .steps-row (3 kolom)
      Step 1: Upload Foto · Step 2: Pilih Gaya · Step 3: Download

  <section #gallery>
    .tag-pill "Hasil AI"
    h2 "Hasil foto berkualitas studio"
    .filter-tabs → Semua · Prewedding · Wedding · Studio · Family
    .gallery-grid (3 kolom) → 6 placeholder foto dengan hover overlay + badge

  <section #harga>
    .tag-pill "Harga"
    h2 "Harga transparan, tanpa biaya tersembunyi"
    .pricing-grid (3 kolom)
      .pricing-card "Gratis"   → 10 foto/bulan → login.html
      .pricing-card.popular "Pro Rp 99.000/bln" → 100 foto → login.html
      .pricing-card "Business Rp 299.000/bln" → Unlimited → login.html

  <section #testimoni>
    .tag-pill "Testimoni"
    h2 "Apa kata pengguna kami"
    .testimonials-grid (3 kolom)
      3× .testimonial-card (avatar + nama + kota + bintang + teks)

  <section #faq>
    .tag-pill "FAQ"
    h2 "Pertanyaan yang sering diajukan"
    .faq-list
      8× .faq-item (trigger + body accordion)

  <section .cta-final>                   ← Background charcoal dark
    h2 "Mulai buat foto AI profesional sekarang"
    p  "10 foto pertama gratis — tanpa kartu kredit"
    btn-primary → login.html

  <footer>
    .footer-top (logo + desc + social icons)
    .footer-links (Produk · Perusahaan · Legal)
    .footer-bottom "© 2025 PotretAI. All rights reserved."
</body>
```

### JavaScript index.html (Minimal)

```js
// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 40);
});

// Hamburger menu
function toggleMenu() { /* toggle mobileOverlay.open */ }
function closeMenu()  { /* remove mobileOverlay.open */ }

// FAQ accordion
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Gallery filter tabs
function filterGallery(category) {
  document.querySelectorAll('.filter-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.cat === category));
  document.querySelectorAll('.gallery-item').forEach(card =>
    card.style.display =
      (category === 'all' || card.dataset.cat === category) ? 'block' : 'none');
}

// Scroll fade-up (IntersectionObserver)
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
```

---

## Checklist Revisi (Ditambahkan)

### index.html (Baru)
- [ ] Semua teks dalam **Bahasa Indonesia**
- [ ] Logo: `brand_asset/Logo potretai.png`
- [ ] Link "Daftar Gratis" → `login.html`
- [ ] Link "Masuk" → `login-masuk.html`
- [ ] Navbar scroll effect (class `.scrolled`)
- [ ] FAQ accordion berfungsi
- [ ] Gallery filter tabs berfungsi
- [ ] Pricing card tengah (Pro) dengan dark background + badge "Populer"
- [ ] Scroll fade-up via IntersectionObserver
- [ ] CTA final section dark background → `login.html`

### Modal Lightbox (Baru — app.html)
- [ ] `#modal-lightbox` ada di akhir `<body>` app.html
- [ ] `LightboxModal.open(index, urls, tab)` berfungsi dari result card
- [ ] ESC key menutup modal
- [ ] Arrow keys navigasi prev/next
- [ ] Counter "1 / 4" update saat navigasi
- [ ] Prev button disabled di foto pertama, Next disabled di foto terakhir
- [ ] Shimmer loading saat gambar dimuat ke modal
- [ ] Download button dalam modal footer berfungsi
- [ ] `GalleryRenderer._lastUrls` tersimpan saat `render()` dipanggil

---

*PotretAI v3 — Component Structure · v3.0 · Fase 1 Build (Revised)*
