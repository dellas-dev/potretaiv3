# Image-Generation-Pipeline.md — PotretAI v3
*AI Generation Engine · API Integration · Queue System · Error Handling*

---

## 1. Overview Pipeline

PotretAI v3 menggunakan **Fal AI** sebagai AI generation engine dengan model **Flux Schnell** (fast) dan **Flux Dev** (quality).

Setiap sesi generate menghasilkan **tepat 4 gambar secara paralel** menggunakan `Promise.all()`.

### Alur Tingkat Tinggi

```
User klik "Generate 4 Foto"
        │
        ▼
[1] collectFormParams(tab)       ← Ambil semua nilai form
        │
        ▼
[2] validateParams()             ← Cek field wajib
        │ (jika invalid → showToast + STOP)
        ▼
[3] PromptBuilder.build()        ← Construct prompt (hidden)
        │
        ▼
[4] UIController.showLoading()   ← Tampilkan 4 skeleton cards
        │
        ▼
[5] FalEngine.generateImages()   ← 4× parallel API calls
        │
        ├─── [Success] ───────────────────────────────────────────┐
        │                                                         ▼
        │                                           GalleryRenderer.render()
        │                                           showToast('Berhasil ✨', 'success')
        │
        └─── [Error] ─────────────────────────────────────────────┐
                                                                  ▼
                                                     UIController.showEmpty()
                                                     showToast('Gagal', 'error')
                                                     console.error(err)
```

---

## 2. Fal AI — Endpoint & Model

### Model Options

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `fal-ai/flux/schnell` | ⚡ ~5–10 detik | Baik | Default — Fast generation |
| `fal-ai/flux/dev` | 🐢 ~15–30 detik | Sangat Baik | High quality mode (Pro plan) |
| `fal-ai/flux-realism` | 🐢 ~20–35 detik | Terbaik | Ultra realism (Premium) |

**Default model untuk Fase 1:** `fal-ai/flux/schnell`

### API Endpoints

#### Endpoint 1 — Direct Image (Synchronous via URL encode)
```
GET https://image.fal.ai/prompt/{URL_ENCODED_PROMPT}
```

Parameter query string:
```
?image_size=portrait_4_3     ← atau custom width/height
&num_inference_steps=28
&guidance_scale=3.5
&seed={random_seed}
```

#### Endpoint 2 — REST API (Recommended untuk produksi)
```
POST https://fal.run/fal-ai/flux/schnell
Content-Type: application/json
Authorization: Key {FAL_API_KEY}

{
  "prompt": "...",
  "image_size": "portrait_4_3",   // atau { "width": 1024, "height": 1280 }
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "seed": 12345,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "output_quality": 92
}
```

Response:
```json
{
  "images": [
    {
      "url": "https://fal.media/files/xxx/generated.jpeg",
      "width": 1024,
      "height": 1280,
      "content_type": "image/jpeg"
    }
  ],
  "timings": { "inference": 4.82 },
  "seed": 12345,
  "has_nsfw_concepts": [false]
}
```

---

## 3. FalEngine Module — Implementasi Lengkap

```js
// ================================================================
// MODULE: FalEngine
// Tanggung jawab: Semua komunikasi dengan Fal AI API
// ================================================================
const FalEngine = {

  // ── Config ────────────────────────────────────────────────────
  MODEL_FAST:    'fal-ai/flux/schnell',
  MODEL_QUALITY: 'fal-ai/flux/dev',
  BASE_URL:      'https://fal.run',

  // State
  isGenerating:  false,   // Generation lock — cegah double-click
  currentModel:  'fal-ai/flux/schnell',

  // ── Aspect Ratio Map ──────────────────────────────────────────
  ASPECT_MAP: {
    '16:9': { width: 1536, height: 1024 },
    '3:2':  { width: 1536, height: 1024 },
    '4:3':  { width: 1024, height: 768  },
    '1:1':  { width: 1024, height: 1024 },
    '9:16': { width: 1024, height: 1820 },
    '4:5':  { width: 1024, height: 1280 },
    '21:9': { width: 2048, height: 878  },
    '2:3':  { width: 1024, height: 1536 },
    '3:4':  { width: 768,  height: 1024 },
  },

  // ── Main Entry Point ──────────────────────────────────────────
  /**
   * Generate 4 images in parallel
   * @param {string} prompt       - Full constructed prompt dari PromptBuilder
   * @param {number} count        - Jumlah gambar (selalu 4)
   * @param {string} aspectRatio  - e.g. '4:5'
   * @returns {Promise<string[]>} - Array 4 image URLs
   */
  async generateImages(prompt, count = 4, aspectRatio = '4:5') {
    if (this.isGenerating) {
      showToast('Generate sedang berlangsung, harap tunggu...', 'info');
      return null;
    }

    this.isGenerating = true;
    this._updateGenerateBtn(true);

    const dimensions = this.ASPECT_MAP[aspectRatio] || this.ASPECT_MAP['4:5'];

    try {
      // 4 parallel generate calls — setiap gambar punya seed berbeda
      const promises = Array.from({ length: count }, (_, i) =>
        this.generateSingle(prompt, dimensions, this._randomSeed(i))
      );

      const results = await Promise.all(promises);

      // Validasi — pastikan semua URL ada
      const validResults = results.filter(url => url && typeof url === 'string');
      if (validResults.length === 0) {
        throw new Error('Semua generate gagal — tidak ada gambar yang berhasil');
      }

      return validResults;

    } catch (err) {
      throw err;  // Re-throw ke caller (generateImages() di app)
    } finally {
      this.isGenerating = false;
      this._updateGenerateBtn(false);
    }
  },

  // ── Single Image Generate ─────────────────────────────────────
  /**
   * Generate satu gambar via Fal AI REST API
   */
  async generateSingle(prompt, dimensions, seed) {
    const endpoint = `${this.BASE_URL}/${this.currentModel}`;

    const requestBody = {
      prompt:               prompt,
      image_size:           { width: dimensions.width, height: dimensions.height },
      num_inference_steps:  28,
      guidance_scale:       3.5,
      num_images:           1,
      seed:                 seed,
      enable_safety_checker: true,
      output_format:        'jpeg',
      output_quality:       92,
      sync_mode:            true,  // Tunggu response — tidak perlu polling
    };

    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Fal AI error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Extract URL dari response structure
    const imageUrl = data?.images?.[0]?.url
                  || data?.image?.url
                  || data?.output?.[0];

    if (!imageUrl) {
      throw new Error('URL gambar tidak ditemukan dalam response API');
    }

    return imageUrl;
  },

  // ── URL-based Generate (Fallback / Simple) ────────────────────
  /**
   * Fallback method — gunakan URL encode endpoint
   * Tidak butuh API key — untuk testing
   */
  buildImageURL(prompt, aspectRatio = '4:5', seed = null) {
    const dims = this.ASPECT_MAP[aspectRatio] || this.ASPECT_MAP['4:5'];
    const encodedPrompt = encodeURIComponent(prompt);
    const params = new URLSearchParams({
      width:                dims.width,
      height:               dims.height,
      num_inference_steps:  28,
      guidance_scale:       3.5,
      ...(seed !== null && { seed }),
    });
    return `https://image.fal.ai/prompt/${encodedPrompt}?${params}`;
  },

  // ── Regenerate Single ─────────────────────────────────────────
  /**
   * Re-generate hanya 1 gambar dengan prompt & params yang sama
   * Dipanggil saat user klik tombol "Ulang" pada 1 card
   */
  async regenerateSingle(prompt, aspectRatio, cardIndex) {
    const dimensions = this.ASPECT_MAP[aspectRatio] || this.ASPECT_MAP['4:5'];
    const seed = this._randomSeed(cardIndex + 100);  // seed berbeda dari awal

    GalleryRenderer.showCardLoading(cardIndex);

    try {
      const url = await this.generateSingle(prompt, dimensions, seed);
      GalleryRenderer.updateCard(cardIndex, url);
      showToast(`Foto ${cardIndex + 1} berhasil di-generate ulang`, 'success');
    } catch (err) {
      GalleryRenderer.showCardError(cardIndex);
      showToast(`Gagal generate ulang foto ${cardIndex + 1}`, 'error');
      console.error('[FalEngine] regenerateSingle error:', err);
    }
  },

  // ── Helpers ───────────────────────────────────────────────────
  _randomSeed(offset = 0) {
    return Math.floor(Math.random() * 2147483647) + offset;
  },

  _updateGenerateBtn(isLoading) {
    const btn = document.getElementById('btn-generate');
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Memproses...`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Generate 4 Foto AI`;
    }
  },

  // ── Model Switch ──────────────────────────────────────────────
  setModel(model) {
    const allowed = [this.MODEL_FAST, this.MODEL_QUALITY];
    if (allowed.includes(model)) {
      this.currentModel = model;
    }
  },
};
```

---

## 4. Generate Button — HTML & State

```html
<!-- Generate Button — di bagian bawah left panel -->
<div class="generate-section">
  <button id="btn-generate" class="btn-generate" onclick="generateImages()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    Generate 4 Foto AI
  </button>
  <p class="generate-hint">
    ✦ 4 variasi foto &nbsp;·&nbsp; Kualitas studio profesional &nbsp;·&nbsp; ~15–30 detik
  </p>
</div>
```

```css
.btn-generate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 24px;
  background: linear-gradient(135deg, #1FA6B5 0%, #0E8EA0 100%);
  color: white;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(31,166,181,0.42), 0 2px 6px rgba(31,166,181,0.22);
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.22s ease,
    opacity 0.2s ease;
}
.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(31,166,181,0.5), 0 4px 10px rgba(31,166,181,0.28);
}
.btn-generate:active:not(:disabled) {
  transform: translateY(0);
}
.btn-generate:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.generate-hint {
  text-align: center;
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: #A7B0B5;
  letter-spacing: 0.04em;
  margin-top: 10px;
}
```

---

## 5. Loading State — Skeleton System

### DOM: Skeleton 4 Cards

```html
<!-- Loading State — ditampilkan saat generate berlangsung -->
<div id="output-loading" style="display: none;">

  <!-- Status indicator -->
  <div class="loading-status-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div class="loading-spinner-ring"></div>
      <div>
        <div class="loading-status-title">Menghasilkan 4 foto AI...</div>
        <div class="loading-status-sub">Estimasi waktu: 15–30 detik</div>
      </div>
    </div>
    <div class="loading-progress-wrap">
      <div class="loading-progress-bar" id="loading-progress"></div>
    </div>
  </div>

  <!-- 4 Skeleton Cards — 2×2 grid -->
  <div class="output-grid">
    <!-- Card 1 -->
    <div class="skeleton-result-card">
      <div class="skeleton-image skeleton-box" style="aspect-ratio: 4/5;"></div>
      <div class="skeleton-result-footer">
        <div class="skeleton-text skeleton-box" style="width: 90px; height: 12px;"></div>
        <div style="display: flex; gap: 6px;">
          <div class="skeleton-btn skeleton-box" style="width: 50px; height: 28px;"></div>
          <div class="skeleton-btn skeleton-box" style="width: 60px; height: 28px;"></div>
        </div>
      </div>
    </div>
    <!-- Card 2, 3, 4 — identik, dengan animation-delay berbeda -->
    <div class="skeleton-result-card" style="animation-delay: 0.15s;">...</div>
    <div class="skeleton-result-card" style="animation-delay: 0.3s;">...</div>
    <div class="skeleton-result-card" style="animation-delay: 0.45s;">...</div>
  </div>

</div>
```

### CSS: Loading & Skeleton

```css
/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.skeleton-box {
  background: linear-gradient(
    90deg,
    #EEF3F5 25%,
    #e0e8eb 50%,
    #EEF3F5 75%
  );
  background-size: 1200px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 8px;
}
.skeleton-image {
  width: 100%;
  border-radius: 12px 12px 0 0;
}
.skeleton-result-card {
  background: white;
  border: 1px solid #EEF3F5;
  border-radius: 16px;
  overflow: hidden;
}
.skeleton-result-footer {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #EEF3F5;
}

/* Loading status bar */
.loading-status-bar {
  background: white;
  border: 1px solid #EEF3F5;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.loading-status-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1E2A2F;
}
.loading-status-sub {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: #A7B0B5;
  margin-top: 2px;
}
.loading-spinner-ring {
  width: 32px;
  height: 32px;
  border: 3px solid #EEF3F5;
  border-top-color: #1FA6B5;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
  flex-shrink: 0;
}
.loading-progress-wrap {
  height: 4px;
  background: #EEF3F5;
  border-radius: 100px;
  overflow: hidden;
}
.loading-progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #1FA6B5, #0E8EA0);
  border-radius: 100px;
  transition: width 0.4s ease;
}
```

### JavaScript: Progress Bar Simulasi

```js
// Simulasi progress bar selama generate berlangsung
const ProgressBar = {
  interval: null,
  current: 0,

  start() {
    this.current = 0;
    this.set(0);
    // Fase 1: 0→75% dalam 20 detik (simulasi lambat)
    this.interval = setInterval(() => {
      if (this.current < 75) {
        this.current += 1.5;
        this.set(this.current);
      }
    }, 400);
  },

  complete() {
    clearInterval(this.interval);
    this.set(100);
    // Reset setelah animasi selesai
    setTimeout(() => this.set(0), 600);
  },

  error() {
    clearInterval(this.interval);
    // Progress bar merah saat error
    const bar = document.getElementById('loading-progress');
    if (bar) bar.style.background = '#E53E3E';
    setTimeout(() => {
      this.set(0);
      if (bar) bar.style.background = 'linear-gradient(90deg, #1FA6B5, #0E8EA0)';
    }, 1000);
  },

  set(percent) {
    const bar = document.getElementById('loading-progress');
    if (bar) bar.style.width = `${Math.min(percent, 100)}%`;
  }
};
```

---

## 6. Output: GalleryRenderer Module

```js
// ================================================================
// MODULE: GalleryRenderer
// Tanggung jawab: Render hasil gambar ke DOM
// ================================================================
const GalleryRenderer = {

  // Cache prompt & params terakhir (untuk regenerate)
  _lastPrompt: null,
  _lastAspectRatio: '4:5',
  _lastTab: 'prewedding',

  /**
   * Render 4 image cards ke output grid
   */
  render(imageUrls, tab, aspectRatio = '4:5') {
    this._lastTab = tab;
    this._lastAspectRatio = aspectRatio;

    const grid = document.getElementById('results-grid');
    if (!grid) return;

    const dims = FalEngine.ASPECT_MAP[aspectRatio] || FalEngine.ASPECT_MAP['4:5'];
    const label = `${aspectRatio} · ${dims.width}×${dims.height}`;

    // Render semua cards sekaligus — satu DOM update
    grid.innerHTML = imageUrls.map((url, i) =>
      this._createCardHTML(url, i, label, tab)
    ).join('');

    // Lazy load images
    grid.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });

    UIController.showResults();

    // Simpan ke history (localStorage)
    this._saveToHistory(imageUrls, tab);
  },

  _createCardHTML(url, index, label, tab) {
    return `
      <div class="result-card" id="result-card-${index}">
        <div class="result-image-wrap">
          <img
            src="${url}"
            alt="Foto AI ${tab} hasil generate ${index + 1}"
            class="result-image"
            loading="lazy"
            onerror="GalleryRenderer.handleImageError(${index})"
          >
          <div class="result-overlay">
            <button class="result-overlay-btn"
              onclick="GalleryRenderer.openFull(${index})"
              aria-label="Buka foto ${index + 1} ukuran penuh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              Buka Penuh
            </button>
          </div>
        </div>
        <div class="result-footer">
          <span class="result-label">${label}</span>
          <div class="result-actions">
            <button class="result-btn"
              onclick="GalleryRenderer.regenerateOne(${index})"
              title="Generate ulang foto ini saja">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Ulang
            </button>
            <button class="result-btn result-btn-dl"
              onclick="downloadImage('${url}', '${tab}-${index + 1}')"
              title="Download foto ini">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Unduh
            </button>
          </div>
        </div>
      </div>`;
  },

  /** Tampilkan loading skeleton pada 1 card (saat regenerate single) */
  showCardLoading(index) {
    const card = document.getElementById(`result-card-${index}`);
    if (!card) return;
    card.innerHTML = `
      <div class="skeleton-image skeleton-box" style="aspect-ratio: 4/5;"></div>
      <div class="skeleton-result-footer">
        <div class="skeleton-text skeleton-box" style="width: 80px; height: 12px;"></div>
        <div class="skeleton-text skeleton-box" style="width: 60px; height: 28px;"></div>
      </div>`;
  },

  /** Update 1 card dengan URL baru setelah regenerate */
  updateCard(index, newUrl) {
    const card = document.getElementById(`result-card-${index}`);
    if (!card) return;
    const dims = FalEngine.ASPECT_MAP[this._lastAspectRatio];
    const label = `${this._lastAspectRatio} · ${dims.width}×${dims.height}`;
    card.outerHTML = this._createCardHTML(newUrl, index, label, this._lastTab);
  },

  /** Tampilkan error state pada 1 card */
  showCardError(index) {
    const card = document.getElementById(`result-card-${index}`);
    if (!card) return;
    card.innerHTML = `
      <div style="aspect-ratio: 4/5; display: flex; flex-direction: column; align-items: center;
        justify-content: center; background: #EEF3F5; border-radius: 12px 12px 0 0; gap: 8px;">
        <span style="font-size: 24px;">⚠️</span>
        <span style="font-family: 'Roboto Mono', monospace; font-size: 10px; color: #A7B0B5;">Gagal dimuat</span>
        <button class="result-btn" onclick="GalleryRenderer.regenerateOne(${index})" style="margin-top: 4px;">
          🔄 Coba Lagi
        </button>
      </div>`;
  },

  /** Buka gambar di tab baru ukuran penuh */
  openFull(index) {
    const img = document.querySelector(`#result-card-${index} img`);
    if (img?.src) window.open(img.src, '_blank');
  },

  /** Regenerate 1 gambar — ambil prompt terakhir */
  async regenerateOne(index) {
    if (!this._lastPrompt) {
      showToast('Tidak ada prompt tersimpan. Generate ulang semua.', 'info');
      return;
    }
    await FalEngine.regenerateSingle(this._lastPrompt, this._lastAspectRatio, index);
  },

  /** Handle image load error */
  handleImageError(index) {
    this.showCardError(index);
  },

  /** Simpan hasil ke history localStorage */
  _saveToHistory(urls, tab) {
    try {
      const history = JSON.parse(localStorage.getItem('potretai_history') || '[]');
      const entry = {
        id:        Date.now(),
        tab:       tab,
        urls:      urls,
        createdAt: new Date().toISOString(),
      };
      history.unshift(entry);           // terbaru di depan
      const trimmed = history.slice(0, 100);  // max 100 entries
      localStorage.setItem('potretai_history', JSON.stringify(trimmed));
    } catch (e) {
      // localStorage penuh atau disabled — silent fail
      console.warn('[PotretAI] History save failed:', e);
    }
  },

  /** Set prompt terakhir (dipanggil dari generateImages()) */
  setLastPrompt(prompt, aspectRatio, tab) {
    this._lastPrompt = prompt;
    this._lastAspectRatio = aspectRatio;
    this._lastTab = tab;
  },
};
```

---

## 7. Main Generate Flow — Full Integration

```js
// ================================================================
// MAIN GENERATE FUNCTION — dipanggil saat klik tombol
// ================================================================
async function generateImages() {
  const tab = AppController.currentTab;

  // 1. Kumpulkan parameter form
  const params = collectFormParams(tab);

  // 2. Validasi
  if (!validateParams(tab, params)) return;

  // 3. Build prompt (internal — tidak ditampilkan)
  const prompt = PromptBuilder.build(tab, params);
  const aspectRatio = params.aspectRatio || '4:5';

  // Cache untuk regenerate
  GalleryRenderer.setLastPrompt(prompt, aspectRatio, tab);

  // 4. Tampilkan loading
  UIController.showLoading();
  ProgressBar.start();

  try {
    // 5. Generate 4 gambar paralel
    const urls = await FalEngine.generateImages(prompt, 4, aspectRatio);

    if (!urls || urls.length === 0) {
      throw new Error('Tidak ada gambar yang berhasil dibuat');
    }

    // 6. Complete progress + render hasil
    ProgressBar.complete();
    GalleryRenderer.render(urls, tab, aspectRatio);

    // 7. Notifikasi sukses
    showToast(`${urls.length} foto berhasil dibuat ✨`, 'success');

    // 8. Update usage counter
    updateUsageCounter();

  } catch (err) {
    // Error handling
    ProgressBar.error();
    UIController.showEmpty();
    showToast('Gagal generate foto. Silakan coba lagi.', 'error');
    console.error('[PotretAI] generateImages error:', err);

    // Analitik error (opsional)
    // Analytics.trackError('generate_failed', { tab, error: err.message });
  }
}

// ================================================================
// REGENERATE ALL
// ================================================================
async function regenerateAll() {
  const lastPrompt = GalleryRenderer._lastPrompt;
  const lastRatio  = GalleryRenderer._lastAspectRatio;
  const lastTab    = GalleryRenderer._lastTab;

  if (!lastPrompt) {
    showToast('Tidak ada sesi sebelumnya. Isi form dan generate ulang.', 'info');
    return;
  }

  UIController.showLoading();
  ProgressBar.start();

  try {
    const urls = await FalEngine.generateImages(lastPrompt, 4, lastRatio);
    ProgressBar.complete();
    GalleryRenderer.render(urls, lastTab, lastRatio);
    showToast('4 foto berhasil di-generate ulang ✨', 'success');
  } catch (err) {
    ProgressBar.error();
    UIController.showEmpty();
    showToast('Gagal generate ulang. Coba lagi.', 'error');
    console.error('[PotretAI] regenerateAll error:', err);
  }
}
```

---

## 8. Download System

```js
// ================================================================
// DOWNLOAD FUNCTION
// ================================================================
async function downloadImage(url, filename) {
  const btn = event?.currentTarget;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="btn-spinner" ...></svg> Mengunduh...`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `potretai-${filename}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup setelah delay
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

    showToast('Foto berhasil diunduh! 🎉', 'success');

  } catch (err) {
    showToast('Gagal mengunduh. Coba klik kanan → Simpan Gambar.', 'error');
    console.error('[PotretAI] download error:', err);

  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg ...></svg> Unduh`;
    }
  }
}

// Download semua 4 gambar sekaligus
async function downloadAll() {
  const images = document.querySelectorAll('.result-image');
  if (images.length === 0) {
    showToast('Tidak ada foto untuk diunduh', 'info');
    return;
  }
  showToast('Mengunduh semua foto...', 'info');
  for (let i = 0; i < images.length; i++) {
    const url = images[i].src;
    if (url) {
      await downloadImage(url, `${GalleryRenderer._lastTab}-${i + 1}`);
      await new Promise(r => setTimeout(r, 500)); // Delay antar download
    }
  }
}
```

---

## 9. Error Handling Matrix

| Error Type | Penyebab | Response ke User | Action |
|-----------|---------|-----------------|--------|
| `rate_limit` | Terlalu banyak request | "Terlalu banyak request. Tunggu beberapa saat." | toast error + enable btn |
| `network_error` | Koneksi internet mati | "Koneksi bermasalah. Periksa internet kamu." | toast error + show empty |
| `api_timeout` | Request > 60 detik | "Generate terlalu lama. Coba lagi." | toast error + show empty |
| `invalid_response` | Response API aneh | "Terjadi kesalahan pada server AI." | toast error + log |
| `safety_filter` | Konten diblokir safety | "Foto tidak bisa dibuat. Coba parameter berbeda." | toast warning + keep form |
| `quota_exceeded` | Kredit habis | "Kredit foto habis. Upgrade plan kamu." | toast + link upgrade |
| `generate_lock` | Double click | "Generate sedang berlangsung..." | toast info (no state change) |
| `download_fail` | Fetch blob error | "Gagal unduh. Coba klik kanan → Simpan." | toast error |
| `image_load_fail` | URL expired / invalid | Card error state dengan tombol "Coba Lagi" | showCardError() |

### Error Handler Global

```js
// Centralized error handler
const ErrorHandler = {
  handle(err, context = '') {
    const message = err?.message || String(err);

    // Classify error
    if (message.includes('429') || message.includes('rate'))
      return showToast('Terlalu banyak request. Tunggu sebentar.', 'error');

    if (message.includes('quota') || message.includes('credits'))
      return showToast('Kredit foto habis. Silakan upgrade.', 'error');

    if (message.includes('safety') || message.includes('nsfw'))
      return showToast('Foto tidak bisa dibuat dengan parameter ini.', 'error');

    if (!navigator.onLine)
      return showToast('Koneksi internet terputus.', 'error');

    if (message.includes('timeout') || message.includes('AbortError'))
      return showToast('Generate terlalu lama. Coba lagi.', 'error');

    // Default
    showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    console.error(`[PotretAI][${context}]`, err);
  }
};
```

---

## 10. Timeout & Abort Control

```js
// Generate dengan timeout 90 detik
async function generateSingleWithTimeout(prompt, dimensions, seed) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(`${FalEngine.BASE_URL}/${FalEngine.currentModel}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        prompt, seed,
        image_size:           { width: dimensions.width, height: dimensions.height },
        num_inference_steps:  28,
        guidance_scale:       3.5,
        num_images:           1,
        sync_mode:            true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API ${response.status}`);
    return await response.json();

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Generate timeout — coba lagi');
    throw err;
  }
}
```

---

## 11. UIController — State Management

```js
// ================================================================
// MODULE: UIController
// Tanggung jawab: Semua state transisi UI output panel
// ================================================================
const UIController = {

  showLoading() {
    document.getElementById('output-empty')?.style.setProperty('display', 'none');
    document.getElementById('output-loading')?.style.setProperty('display', 'block');
    document.getElementById('output-results')?.style.setProperty('display', 'none');
    // Scroll output panel ke atas
    document.getElementById('generator-output-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showResults() {
    document.getElementById('output-loading')?.style.setProperty('display', 'none');
    document.getElementById('output-results')?.style.setProperty('display', 'block');
    // Fade in animation
    const results = document.getElementById('output-results');
    if (results) {
      results.style.opacity = '0';
      requestAnimationFrame(() => {
        results.style.transition = 'opacity 0.35s ease';
        results.style.opacity = '1';
      });
    }
  },

  showEmpty() {
    document.getElementById('output-loading')?.style.setProperty('display', 'none');
    document.getElementById('output-results')?.style.setProperty('display', 'none');
    document.getElementById('output-empty')?.style.setProperty('display', 'flex');
  },

  updateUsageDisplay(used, total) {
    const remaining = total - used;
    document.getElementById('usage-remaining')?.textContent = remaining;
    document.getElementById('usage-total')?.textContent = total;
    document.getElementById('d-used')?.textContent = used;
    document.getElementById('d-total')?.textContent = total;
    const pct = Math.min((used / total) * 100, 100);
    const fill = document.getElementById('d-usage-fill');
    if (fill) fill.style.width = `${pct}%`;
    // Warna bar berubah merah jika > 85%
    if (pct > 85 && fill) fill.style.background = '#E53E3E';
  },
};

// Update usage counter setelah setiap generate berhasil
function updateUsageCounter() {
  try {
    const usage = JSON.parse(localStorage.getItem('potretai_usage') || '{"used":0,"total":50}');
    usage.used = Math.min(usage.used + 4, usage.total); // +4 per generate
    localStorage.setItem('potretai_usage', JSON.stringify(usage));
    UIController.updateUsageDisplay(usage.used, usage.total);

    // Warning jika hampir habis
    const remaining = usage.total - usage.used;
    if (remaining <= 10 && remaining > 0) {
      showToast(`⚠️ Sisa ${remaining} foto di plan kamu`, 'info');
    } else if (remaining === 0) {
      showToast('Kredit foto habis. Upgrade untuk melanjutkan.', 'error');
    }
  } catch (e) {
    console.warn('[PotretAI] Usage update failed:', e);
  }
}
```

---

## 12. History System

```js
// ================================================================
// HISTORY: Load & Render riwayat foto
// ================================================================
const HistorySystem = {

  /** Load history dari localStorage */
  load() {
    try {
      return JSON.parse(localStorage.getItem('potretai_history') || '[]');
    } catch {
      return [];
    }
  },

  /** Render history grid di view-history */
  render(filter = 'all') {
    const history = this.load();
    const grid = document.getElementById('history-grid');
    const empty = document.getElementById('history-empty');
    if (!grid) return;

    const filtered = filter === 'all'
      ? history
      : history.filter(entry => entry.tab === filter);

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      return;
    }

    if (empty) empty.style.display = 'none';

    // Flatten: setiap entry (sesi) punya 4 URLs → tampilkan semua
    const allPhotos = filtered.flatMap(entry =>
      entry.urls.map((url, i) => ({ url, tab: entry.tab, date: entry.createdAt, index: i }))
    );

    grid.innerHTML = allPhotos.map(photo => `
      <div class="history-card">
        <div class="history-card-img-wrap">
          <img src="${photo.url}" alt="Foto ${photo.tab}" loading="lazy"
            class="history-card-img"
            onerror="this.src='https://placehold.co/200x250?text=Gagal+Load'">
          <div class="history-card-overlay">
            <button onclick="downloadImage('${photo.url}', '${photo.tab}-history')" class="history-dl-btn">
              ⬇ Unduh
            </button>
          </div>
        </div>
        <div class="history-card-footer">
          <span class="history-badge">${this._tabLabel(photo.tab)}</span>
          <span class="history-date">${this._formatDate(photo.date)}</span>
        </div>
      </div>`).join('');
  },

  _tabLabel(tab) {
    const labels = {
      prewedding: '💍 Prewedding',
      wedding:    '👰 Wedding',
      engagement: '💎 Engagement',
      studio:     '📸 Studio',
      family:     '👨‍👩‍👧‍👦 Family',
    };
    return labels[tab] || tab;
  },

  _formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  },
};

// Filter tabs di history page
function filterHistory(filter) {
  document.querySelectorAll('.history-filter-tabs .cat-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  HistorySystem.render(filter);
}
```

---

## 13. Checklist Implementasi Pipeline

### API & Engine
- [ ] `FalEngine.generateImages()` berhasil mengembalikan 4 URL
- [ ] `Promise.all()` berjalan paralel — bukan sequential
- [ ] Generation lock (`isGenerating`) mencegah double-click
- [ ] Timeout 90 detik dengan `AbortController`
- [ ] Seed berbeda untuk setiap 4 gambar (agar hasil bervariasi)
- [ ] `sync_mode: true` di request body

### UI State
- [ ] Loading state muncul sebelum API call dimulai
- [ ] Skeleton 4 cards shimmer saat loading
- [ ] Progress bar simulasi berjalan
- [ ] Result grid muncul dengan fade-in saat selesai
- [ ] Empty state kembali tampil saat error
- [ ] Generate button disabled saat loading + spinner icon

### Output
- [ ] 4 cards dalam grid 2×2 (desktop) / 1 kolom (mobile)
- [ ] Setiap card: label aspect ratio + tombol Ulang + Unduh
- [ ] `loading="lazy"` pada semua `<img>` result
- [ ] `onerror` handler pada setiap image
- [ ] Download trigger file download ke device

### History
- [ ] Setiap generate berhasil → tersimpan ke localStorage
- [ ] History page load dari localStorage
- [ ] Filter by tab berfungsi
- [ ] Empty state saat history kosong

### Usage Counter
- [ ] Counter di topbar update setelah generate
- [ ] Dashboard progress bar update
- [ ] Warning toast saat sisa ≤ 10 foto

---

*PotretAI v3 — Image Generation Pipeline · v3.0 · Fase 1 Build*
