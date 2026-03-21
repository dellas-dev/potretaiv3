# Access-Control.md — PotretAI v3
*Kontrol Akses · Feature Gating · Tier Sistem · UI States per Paket*

---

## 1. Tier Hierarchy

```
FREE
  └── Bisa login, bisa lihat UI, tidak bisa generate
  └── Tidak ada batas waktu

FOUNDING_BASE  (Fase 1 saja)
  └── AI Studio saja
  └── 50 generate/bulan
  └── Lifetime — tidak ada expiry

FOUNDING_PREMIUM  (Fase 1 saja)
  └── Semua generator (5 kategori)
  └── 200 generate/bulan
  └── Lifetime — tidak ada expiry

STUDIO_ANNUAL  (Fase 2+)
  └── AI Studio saja
  └── 50 generate/bulan
  └── Expires 365 hari dari aktivasi

PREMIUM_ANNUAL  (Fase 2+)
  └── Semua generator (5 kategori)
  └── 200 generate/bulan
  └── Expires 365 hari dari aktivasi
```

---

## 2. Feature Matrix per Tier

| Feature | Free | Base* | Premium* |
|---------|------|-------|---------|
| Login & dashboard | ✅ | ✅ | ✅ |
| Lihat UI generator | ✅ | ✅ | ✅ |
| **Tab Studio** | ❌ | ✅ | ✅ |
| **Tab Prewedding** | ❌ | ❌ | ✅ |
| **Tab Wedding** | ❌ | ❌ | ✅ |
| **Tab Engagement** | ❌ | ❌ | ✅ |
| **Tab Family** | ❌ | ❌ | ✅ |
| Upload face reference | ❌ | ✅ | ✅ |
| Generate foto | ❌ | ✅ (50/bln) | ✅ (200/bln) |
| Download hasil | ❌ | ✅ | ✅ |
| Riwayat foto | ❌ | ✅ | ✅ |
| 120+ lokasi premium | ❌ | ❌ | ✅ |
| Founding badge | ❌ | ✅ (Founding) | ✅ (Founding) |

*Base = Founding Base + Studio Annual · Premium = Founding Premium + Premium Annual

---

## 3. Gating Logic — JavaScript

```js
// ================================================================
// ACCESS CONTROL MODULE
// ================================================================
const AccessControl = {

  // Tier definitions
  TIERS: {
    free:              { generateLimit: 0,   hasStudio: false, hasFull: false },
    founding_base:     { generateLimit: 50,  hasStudio: true,  hasFull: false, isFounding: true,  isLifetime: true  },
    founding_premium:  { generateLimit: 200, hasStudio: true,  hasFull: true,  isFounding: true,  isLifetime: true  },
    studio_annual:     { generateLimit: 50,  hasStudio: true,  hasFull: false, isFounding: false, isLifetime: false },
    premium_annual:    { generateLimit: 200, hasStudio: true,  hasFull: true,  isFounding: false, isLifetime: false },
  },

  // Tabs yang butuh akses premium (hasFull)
  PREMIUM_TABS: ['prewedding', 'wedding', 'engagement', 'family'],

  // Tabs yang butuh minimal base (hasStudio)
  BASE_TABS: ['studio'],

  /**
   * Cek apakah user boleh akses tab tertentu
   */
  canAccessTab(userTier, tabName) {
    const tier = this.TIERS[userTier] || this.TIERS.free;
    if (this.PREMIUM_TABS.includes(tabName)) return tier.hasFull;
    if (this.BASE_TABS.includes(tabName))    return tier.hasStudio;
    return false;
  },

  /**
   * Cek apakah user bisa generate (ada sisa limit)
   */
  canGenerate(user) {
    const tier = this.TIERS[user.tier] || this.TIERS.free;
    if (tier.generateLimit === 0) return false;
    if (user.generateUsed >= tier.generateLimit) return false;
    return true;
  },

  /**
   * Hitung sisa generate bulan ini
   */
  getRemainingGenerates(user) {
    const tier = this.TIERS[user.tier] || this.TIERS.free;
    return Math.max(0, tier.generateLimit - user.generateUsed);
  },

  /**
   * Apakah akun expired (untuk annual tier)
   */
  isExpired(user) {
    if (!user.expiresAt) return false;  // lifetime — tidak pernah expired
    return new Date() > new Date(user.expiresAt);
  },

  /**
   * Get display info untuk badge tier
   */
  getTierBadge(tier) {
    const badges = {
      free:             { label: 'Gratis',           color: '#A7B0B5', icon: null },
      founding_base:    { label: '🥉 Founding Base',  color: '#CD7F32', icon: '🥉' },
      founding_premium: { label: '💎 Founding Premium', color: '#1FA6B5', icon: '💎' },
      studio_annual:    { label: '📸 Studio',          color: '#1FA6B5', icon: '📸' },
      premium_annual:   { label: '⭐ Premium',          color: '#0E8EA0', icon: '⭐' },
    };
    return badges[tier] || badges.free;
  },
};
```

---

## 4. UI States — Tampilan per Kondisi Akses

### 4.1 Sidebar Navigation — Tab yang Terkunci

```html
<!-- Tab yang BISA diakses (Studio untuk Base tier) -->
<button class="sidebar-nav-item active" onclick="navigateTo('studio')">
  <svg><!-- camera icon --></svg>
  Studio
</button>

<!-- Tab yang TERKUNCI (Prewedding untuk Base tier) -->
<button class="sidebar-nav-item locked"
  onclick="AccessGate.showUpgradePrompt('prewedding')"
  title="Butuh paket Premium">
  <svg><!-- rings icon --></svg>
  Prewedding
  <span class="lock-badge">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  </span>
</button>
```

```css
.sidebar-nav-item.locked {
  opacity: 0.5;
  cursor: pointer;
  position: relative;
}
.sidebar-nav-item.locked:hover {
  opacity: 0.75;
  background: rgba(255,122,90,0.06);
}
.lock-badge {
  margin-left: auto;
  color: #A7B0B5;
  display: flex;
  align-items: center;
}
```

### 4.2 Generator Tabs — Locked State

```html
<!-- Tab pill locked di bagian atas generator -->
<button class="gen-tab locked"
  onclick="AccessGate.showUpgradePrompt('wedding')"
  aria-label="Wedding — Butuh paket Premium">
  👰 Wedding
  <svg class="lock-icon" width="11" height="11" ...></svg>
</button>
```

```css
.gen-tab.locked {
  opacity: 0.45;
  border-style: dashed;
  cursor: pointer;
  position: relative;
}
.gen-tab.locked::after {
  content: '🔒';
  font-size: 9px;
  margin-left: 4px;
}
```

### 4.3 Upgrade Prompt Modal

Muncul ketika user klik tab yang terkunci:

```html
<div id="upgrade-modal" class="modal-overlay" style="display:none;">
  <div class="modal-box">

    <!-- Icon -->
    <div class="modal-icon-wrap">
      <svg ...><!-- lock icon --></svg>
    </div>

    <!-- Content -->
    <h3 class="modal-title">Fitur ini butuh paket Premium</h3>
    <p class="modal-body">
      Generator <strong id="modal-feature-name">Prewedding</strong> hanya tersedia
      untuk pengguna paket Premium.
    </p>

    <!-- Feature highlight -->
    <div class="modal-features">
      <div class="modal-feature-item">✓ Semua 5 generator AI</div>
      <div class="modal-feature-item">✓ 200 foto per bulan</div>
      <div class="modal-feature-item">✓ 120+ lokasi premium</div>
      <div class="modal-feature-item">✓ Akses seumur hidup</div>
    </div>

    <!-- Harga singkat -->
    <div class="modal-price-strip">
      <span class="modal-price-label">Founding Premium</span>
      <span class="modal-price-value">Rp 497.000</span>
      <span class="modal-price-note">sekali bayar, seumur hidup</span>
    </div>

    <!-- CTA -->
    <a href="/pricing" class="btn-primary" style="width:100%;justify-content:center;">
      Lihat Paket Premium
    </a>
    <button onclick="AccessGate.closeModal()" class="modal-dismiss">
      Nanti saja
    </button>

  </div>
</div>
```

### 4.4 Limit Habis — Generate Button State

```html
<!-- Generate button saat limit HABIS -->
<button class="btn-generate btn-generate-disabled" disabled>
  <svg><!-- lock icon --></svg>
  Limit Bulan Ini Habis
</button>

<!-- Info strip di bawah button -->
<div class="limit-info-strip limit-exhausted">
  <svg width="14" height="14" ...><!-- info icon --></svg>
  <span>
    Limit 50 foto/bulan sudah terpakai.
    Reset otomatis tanggal 1 bulan depan.
  </span>
</div>
```

### 4.5 Usage Counter di Topbar

```html
<!-- Tampilan usage counter, klik untuk lihat detail -->
<div class="usage-counter" onclick="navigateTo('account')" title="Lihat detail penggunaan">
  <div class="usage-bar-wrap">
    <div class="usage-bar-fill" id="topbar-usage-fill" style="width: 72%;"></div>
  </div>
  <span class="usage-text" id="topbar-usage-text">36 / 50 foto</span>
</div>

<!-- Warna bar berubah berdasarkan persentase -->
<!-- < 60%  → teal (#1FA6B5) -->
<!-- 60–85% → amber (#F59E0B) -->
<!-- > 85%  → red (#EF4444) -->
```

```js
function updateUsageBar(used, limit) {
  const pct = limit === 0 ? 100 : Math.min((used / limit) * 100, 100);
  const fill = document.getElementById('topbar-usage-fill');
  const text = document.getElementById('topbar-usage-text');

  if (fill) {
    fill.style.width = `${pct}%`;
    fill.style.background =
      pct < 60 ? '#1FA6B5' :
      pct < 85 ? '#F59E0B' :
                 '#EF4444';
  }
  if (text) {
    text.textContent = limit === 0 ? 'Upgrade untuk Generate' : `${used} / ${limit} foto`;
  }
}
```

### 4.6 Dashboard — Tier Badge & Info

```html
<!-- Di dashboard, section akun user -->
<div class="account-tier-card">

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <div class="tier-icon-wrap">
      <!-- Icon sesuai tier -->
    </div>
    <div>
      <div class="tier-name" id="dash-tier-name">💎 Founding Premium</div>
      <div class="tier-sub" id="dash-tier-sub">Akses seumur hidup · Tidak perlu perpanjang</div>
    </div>
  </div>

  <!-- Usage bar -->
  <div class="usage-detail">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span class="usage-label">Generate bulan ini</span>
      <span class="usage-count" id="dash-usage-count">36 / 200</span>
    </div>
    <div class="usage-bar-bg">
      <div class="usage-bar-fill" id="dash-usage-fill" style="width:18%;"></div>
    </div>
    <div class="usage-reset-note">Reset otomatis pada 1 April 2025</div>
  </div>

</div>
```

---

## 5. AccessGate Module — JavaScript

```js
// ================================================================
// MODULE: AccessGate
// Tanggung jawab: Tampilkan prompt upgrade, handle locked features
// ================================================================
const AccessGate = {

  _currentUser: null,

  init(user) {
    this._currentUser = user;
    this._applyTabLocks();
    this._updateUsageDisplay();
  },

  /**
   * Apply lock state ke semua tab berdasarkan tier user
   */
  _applyTabLocks() {
    const tabs = ['prewedding', 'wedding', 'engagement', 'studio', 'family'];
    tabs.forEach(tab => {
      const canAccess = AccessControl.canAccessTab(this._currentUser.tier, tab);
      const tabEls = document.querySelectorAll(`[data-tab="${tab}"]`);
      tabEls.forEach(el => {
        el.classList.toggle('locked', !canAccess);
        if (!canAccess) {
          el.setAttribute('onclick', `AccessGate.showUpgradePrompt('${tab}')`);
        }
      });
    });
  },

  /**
   * Tampilkan modal upgrade
   */
  showUpgradePrompt(featureName) {
    const labels = {
      prewedding: 'Prewedding',
      wedding:    'Wedding',
      engagement: 'Engagement',
      family:     'Family Portrait',
    };
    const label = labels[featureName] || featureName;

    const nameEl = document.getElementById('modal-feature-name');
    if (nameEl) nameEl.textContent = label;

    document.getElementById('upgrade-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('upgrade-modal').style.display = 'none';
    document.body.style.overflow = '';
  },

  /**
   * Cek akses sebelum generate
   * Dipanggil dari generateImages() sebelum mulai proses
   */
  checkBeforeGenerate(tab) {
    const user = this._currentUser;

    // Cek tier akses tab
    if (!AccessControl.canAccessTab(user.tier, tab)) {
      this.showUpgradePrompt(tab);
      return false;
    }

    // Cek limit generate
    if (!AccessControl.canGenerate(user)) {
      if (user.tier === 'free') {
        this.showUpgradePrompt('generate');
      } else {
        showToast('Limit generate bulan ini sudah habis. Reset tanggal 1 bulan depan.', 'info');
      }
      return false;
    }

    return true;
  },

  /**
   * Update semua display usage
   */
  _updateUsageDisplay() {
    const user = this._currentUser;
    const used  = user.generateUsed  || 0;
    const limit = user.generateLimit || 0;

    updateUsageBar(used, limit);

    // Update counter di topbar
    const remaining = AccessControl.getRemainingGenerates(user);
    const topbarCount = document.getElementById('usage-remaining');
    if (topbarCount) topbarCount.textContent = remaining;
  },
};
```

---

## 6. Halaman Account — Status Lengkap

```html
<!-- View: Account / Profil -->
<div id="view-account">

  <h2 class="view-title">Akun Saya</h2>

  <!-- Status Paket -->
  <div class="account-section">
    <div class="account-section-title">Status Paket</div>

    <div class="tier-status-card">
      <div class="tier-badge" id="acc-tier-badge">💎 Founding Premium</div>
      <div class="tier-duration" id="acc-tier-duration">
        Akses seumur hidup · Aktif sejak 14 Maret 2025
      </div>

      <!-- Untuk annual tier: tampilkan expiry -->
      <div class="tier-expiry" id="acc-tier-expiry" style="display:none;">
        Aktif hingga: <strong>14 Maret 2026</strong>
        <a href="/pricing" class="link-renew">Perpanjang Sekarang</a>
      </div>
    </div>
  </div>

  <!-- Penggunaan Bulan Ini -->
  <div class="account-section">
    <div class="account-section-title">Penggunaan Bulan Ini</div>
    <div class="usage-card">
      <div class="usage-numbers">
        <span class="usage-used" id="acc-used">36</span>
        <span class="usage-sep">/</span>
        <span class="usage-limit" id="acc-limit">200</span>
        <span class="usage-unit">foto dibuat</span>
      </div>
      <div class="usage-bar-large">
        <div class="usage-bar-fill-large" id="acc-usage-fill"></div>
      </div>
      <div class="usage-reset-info">
        Limit reset otomatis pada <strong id="acc-reset-date">1 April 2025</strong>
      </div>
    </div>
  </div>

  <!-- Akses Generator -->
  <div class="account-section">
    <div class="account-section-title">Generator yang Bisa Diakses</div>
    <div class="access-grid" id="acc-access-grid">
      <!-- Di-render dinamis berdasarkan tier -->
    </div>
  </div>

</div>
```

---

## 7. Redirect Rules

```js
// Proteksi halaman app — harus login
// Tapi tidak harus berbayar untuk lihat UI

router.beforeEach((to, from, next) => {
  const user = AuthController.getCurrentUser();

  // Halaman yang butuh login
  const authRequired = ['/app', '/account', '/history'];
  if (authRequired.includes(to.path) && !user) {
    return next('/login-masuk');
  }

  // Halaman payment — harus login tapi tidak harus berbayar
  if (to.path === '/payment' && !user) {
    return next('/login?redirect=/payment');
  }

  next();
});
```

---

*PotretAI v3 — Access Control · Feature Gating · v3.0*
