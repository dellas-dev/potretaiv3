# Face-Reference-System.md — PotretAI v3
*Upload System · Preview · Validasi · UploadManager Module · DOM per Tab*

---

## 1. Overview

Face Reference System adalah komponen upload foto wajah yang digunakan sebagai **referensi identitas** untuk AI generation. Foto yang diupload user dikirim bersama prompt ke Fal AI agar AI menghasilkan gambar dengan wajah yang mirip referensi.

### Prinsip Dasar

| Prinsip | Detail |
|---------|--------|
| **Opsional tapi direkomendasikan** | Upload tidak wajib — tanpa upload, AI generate wajah random yang fotorealistik |
| **Per tab, per sesi** | Setiap tab punya upload box sendiri — tidak share state antar tab |
| **Langsung preview** | Foto yang dipilih langsung tampil sebagai thumbnail di dalam box |
| **Mudah dihapus** | Tombol × di pojok kanan atas thumbnail untuk clear foto |
| **Validasi client-side** | Format dan ukuran dicek sebelum render — tidak perlu upload ke server |

### Upload Box per Tab

| Tab | Jumlah Box | Label |
|-----|-----------|-------|
| Prewedding | 2 | Foto Pria · Foto Wanita |
| Wedding | 2 | Foto Pengantin Pria · Foto Pengantin Wanita |
| Engagement | 2 | Foto Pria · Foto Wanita |
| Studio — Solo | 1 | Foto Subject (dengan toggle Pria/Wanita) |
| Studio — Pasangan | 2 | Foto Pria · Foto Wanita |
| Family | 2–6 | Ayah · Ibu · Anak 1–4 (Anak 2–4 opsional) |

---

## 2. Spesifikasi Visual Upload Box

### Tampilan Default (Kosong)

```
┌─────────────────────────────────────┐
│                                     │  height: 86px
│   [↑ ikon upload]                   │  border: 1.5px dashed #1FA6B5
│   Klik atau seret foto              │  border-radius: 16px
│   JPG, PNG · Maks 5MB               │  background: rgba(31,166,181,0.03)
│                                     │
└─────────────────────────────────────┘
Label di atas box: "Foto Pria"  (font Inter 13px 600)
```

### Tampilan Hover

```
border: 1.5px solid #1FA6B5        ← solid (dari dashed)
background: rgba(31,166,181,0.07)  ← sedikit lebih gelap
box-shadow: 0 0 0 3px rgba(31,166,181,0.12)
cursor: pointer
```

### Tampilan Setelah Upload (Has File)

```
┌─────────────────────────────────────┐
│  ████████████████████████████████  │  Foto mengisi penuh box
│  ████████ [thumbnail foto] ███████  │  object-fit: cover
│  ████████████████████████[×]██████  │  Tombol × di pojok kanan atas
│  ████████████████████████████████  │
└─────────────────────────────────────┘
border: 1.5px solid #1FA6B5  ← solid
background: rgba(31,166,181,0.05)
```

### Tombol Clear (×)

```
width: 22px · height: 22px
border-radius: 50%
background: rgba(30,42,47,0.72)
backdrop-filter: blur(4px)
position: absolute · top: 6px · right: 6px
color: white · font-size: 11px
```

---

## 3. CSS — Upload Box

```css
/* ── Upload Box Container ────────────────────────────────────── */
.upload-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 86px;
  border: 1.5px dashed #1FA6B5;
  border-radius: 16px;
  background: rgba(31, 166, 181, 0.03);
  cursor: pointer;
  overflow: hidden;
  transition:
    border-style    0.18s ease,
    border-color    0.18s ease,
    background      0.18s ease,
    box-shadow      0.18s ease;
  user-select: none;
  -webkit-user-select: none;
}

/* Hover state */
.upload-box:hover {
  border-style: solid;
  background: rgba(31, 166, 181, 0.07);
  box-shadow: 0 0 0 3px rgba(31, 166, 181, 0.12);
}

/* Dragover state (saat file di-drag ke atas box) */
.upload-box.drag-over {
  border-style: solid;
  border-color: #0E8EA0;
  background: rgba(31, 166, 181, 0.12);
  box-shadow: 0 0 0 4px rgba(31, 166, 181, 0.2);
}

/* Has file state */
.upload-box.has-file {
  border-style: solid;
  border-color: #1FA6B5;
  background: rgba(31, 166, 181, 0.05);
}

/* Focus visible (keyboard navigation) */
.upload-box:focus-visible {
  outline: 3px solid rgba(31, 166, 181, 0.5);
  outline-offset: 3px;
}

/* ── Inner Elements ──────────────────────────────────────────── */
.upload-icon {
  color: #1FA6B5;
  opacity: 0.65;
  flex-shrink: 0;
  pointer-events: none;
}
.upload-main-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  color: #1FA6B5;
  letter-spacing: 0.04em;
  text-align: center;
  pointer-events: none;
}
.upload-hint-label {
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  color: #A7B0B5;
  letter-spacing: 0.02em;
  text-align: center;
  pointer-events: none;
}

/* ── Preview Image (saat has-file) ───────────────────────────── */
.upload-preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  pointer-events: none;
}

/* ── Clear Button ────────────────────────────────────────────── */
.upload-clear-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  background: rgba(30, 42, 47, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  z-index: 2;
  transition: background 0.15s ease, transform 0.15s ease;
}
.upload-clear-btn:hover {
  background: rgba(229, 62, 62, 0.85);
  transform: scale(1.1);
}
.upload-clear-btn:active {
  transform: scale(0.95);
}

/* ── Upload Label Top (di atas box) ──────────────────────────── */
.upload-field-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1E2A2F;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.upload-field-label .upload-optional-badge {
  font-family: 'Roboto Mono', monospace;
  font-size: 9px;
  color: #A7B0B5;
  background: #EEF3F5;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 400;
}

/* ── Upload Wrap (label + box) ───────────────────────────────── */
.upload-field-wrap {
  display: flex;
  flex-direction: column;
}
```

---

## 4. HTML Template per Tab

### 4.1 Prewedding / Wedding / Engagement — 2 Box

```html
<!-- UPLOAD SECTION: Prewedding -->
<div class="form-section">
  <div class="form-section-title">📷 Foto Referensi Wajah</div>
  <p class="form-section-desc">
    Upload foto wajah untuk referensi AI. Gunakan foto close-up wajah yang jelas.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

    <!-- Pria -->
    <div class="upload-field-wrap">
      <div class="upload-field-label">
        Foto Pria
        <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box"
        id="upload-pw-pria"
        role="button"
        tabindex="0"
        aria-label="Upload foto referensi pria"
        onclick="UploadManager.trigger('upload-pw-pria')"
        onkeydown="if(event.key==='Enter'||event.key===' ')UploadManager.trigger('upload-pw-pria')"
        ondragover="UploadManager.onDragOver(event,'upload-pw-pria')"
        ondragleave="UploadManager.onDragLeave('upload-pw-pria')"
        ondrop="UploadManager.onDrop(event,'upload-pw-pria')">

        <!-- Default empty state -->
        <svg class="upload-icon" width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span class="upload-main-label">Klik atau seret foto</span>
        <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>

        <!-- Hidden file input -->
        <input type="file" id="upload-pw-pria-input"
          accept="image/jpeg,image/png,image/webp"
          style="display:none"
          onchange="UploadManager.handleFileInput(this,'upload-pw-pria')">
      </div>
    </div>

    <!-- Wanita -->
    <div class="upload-field-wrap">
      <div class="upload-field-label">
        Foto Wanita
        <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box"
        id="upload-pw-wanita"
        role="button"
        tabindex="0"
        aria-label="Upload foto referensi wanita"
        onclick="UploadManager.trigger('upload-pw-wanita')"
        onkeydown="if(event.key==='Enter'||event.key===' ')UploadManager.trigger('upload-pw-wanita')"
        ondragover="UploadManager.onDragOver(event,'upload-pw-wanita')"
        ondragleave="UploadManager.onDragLeave('upload-pw-wanita')"
        ondrop="UploadManager.onDrop(event,'upload-pw-wanita')">

        <svg class="upload-icon" width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span class="upload-main-label">Klik atau seret foto</span>
        <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>

        <input type="file" id="upload-pw-wanita-input"
          accept="image/jpeg,image/png,image/webp"
          style="display:none"
          onchange="UploadManager.handleFileInput(this,'upload-pw-wanita')">
      </div>
    </div>

  </div>
</div>

<!-- ID Reference per tab:
  Prewedding : upload-pw-pria     / upload-pw-wanita
  Wedding    : upload-wd-pria     / upload-wd-wanita
  Engagement : upload-en-pria     / upload-en-wanita
-->
```

---

### 4.2 Studio — Toggle Solo/Pasangan

```html
<!-- UPLOAD SECTION: Studio -->
<div class="form-section">
  <div class="form-section-title">📷 Foto Referensi Wajah</div>

  <!-- Mode Toggle -->
  <div class="studio-mode-toggle">
    <button class="studio-mode-btn active" data-mode="solo"
      onclick="StudioUpload.setMode('solo')">
      Solo
    </button>
    <button class="studio-mode-btn" data-mode="pasangan"
      onclick="StudioUpload.setMode('pasangan')">
      Pasangan
    </button>
  </div>

  <!-- SOLO mode -->
  <div id="studio-upload-solo" class="studio-upload-panel">

    <!-- Gender toggle untuk solo -->
    <div class="solo-gender-toggle">
      <label class="solo-gender-option">
        <input type="radio" name="solo-gender" value="pria"
          onchange="StudioUpload.setGender('pria')" checked>
        <span class="solo-gender-label">
          <svg ...><!-- male icon --></svg>
          Pria
        </span>
      </label>
      <label class="solo-gender-option">
        <input type="radio" name="solo-gender" value="wanita"
          onchange="StudioUpload.setGender('wanita')">
        <span class="solo-gender-label">
          <svg ...><!-- female icon --></svg>
          Wanita
        </span>
      </label>
    </div>

    <!-- 1 upload box solo -->
    <div class="upload-field-wrap" style="width: 100%;">
      <div class="upload-field-label" id="studio-solo-label">
        Foto Subject Pria
        <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box"
        id="upload-st-solo"
        role="button" tabindex="0"
        aria-label="Upload foto subject solo"
        onclick="UploadManager.trigger('upload-st-solo')"
        onkeydown="if(event.key==='Enter'||event.key===' ')UploadManager.trigger('upload-st-solo')"
        ondragover="UploadManager.onDragOver(event,'upload-st-solo')"
        ondragleave="UploadManager.onDragLeave('upload-st-solo')"
        ondrop="UploadManager.onDrop(event,'upload-st-solo')">

        <svg class="upload-icon" width="22" height="22" ...></svg>
        <span class="upload-main-label">Klik atau seret foto</span>
        <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>

        <input type="file" id="upload-st-solo-input"
          accept="image/jpeg,image/png,image/webp"
          style="display:none"
          onchange="UploadManager.handleFileInput(this,'upload-st-solo')">
      </div>
    </div>
  </div>

  <!-- PASANGAN mode (hidden by default) -->
  <div id="studio-upload-pasangan" class="studio-upload-panel" style="display:none;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

      <!-- Pria -->
      <div class="upload-field-wrap">
        <div class="upload-field-label">Foto Pria <span class="upload-optional-badge">opsional</span></div>
        <div class="upload-box" id="upload-st-pria"
          role="button" tabindex="0"
          onclick="UploadManager.trigger('upload-st-pria')"
          ondragover="UploadManager.onDragOver(event,'upload-st-pria')"
          ondragleave="UploadManager.onDragLeave('upload-st-pria')"
          ondrop="UploadManager.onDrop(event,'upload-st-pria')">
          <svg class="upload-icon" ...></svg>
          <span class="upload-main-label">Klik atau seret foto</span>
          <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>
          <input type="file" id="upload-st-pria-input" accept="image/jpeg,image/png,image/webp"
            style="display:none" onchange="UploadManager.handleFileInput(this,'upload-st-pria')">
        </div>
      </div>

      <!-- Wanita -->
      <div class="upload-field-wrap">
        <div class="upload-field-label">Foto Wanita <span class="upload-optional-badge">opsional</span></div>
        <div class="upload-box" id="upload-st-wanita"
          role="button" tabindex="0"
          onclick="UploadManager.trigger('upload-st-wanita')"
          ondragover="UploadManager.onDragOver(event,'upload-st-wanita')"
          ondragleave="UploadManager.onDragLeave('upload-st-wanita')"
          ondrop="UploadManager.onDrop(event,'upload-st-wanita')">
          <svg class="upload-icon" ...></svg>
          <span class="upload-main-label">Klik atau seret foto</span>
          <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>
          <input type="file" id="upload-st-wanita-input" accept="image/jpeg,image/png,image/webp"
            style="display:none" onchange="UploadManager.handleFileInput(this,'upload-st-wanita')">
        </div>
      </div>

    </div>
  </div>
</div>
```

### CSS — Studio Mode Toggle

```css
.studio-mode-toggle {
  display: flex;
  gap: 6px;
  background: #EEF3F5;
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
  margin-bottom: 14px;
}
.studio-mode-btn {
  padding: 7px 18px;
  border-radius: 8px;
  border: none;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #A7B0B5;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.studio-mode-btn.active {
  background: white;
  color: #1FA6B5;
  box-shadow: 0 1px 4px rgba(31,166,181,0.18), 0 2px 8px rgba(31,166,181,0.1);
}

.solo-gender-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.solo-gender-option input[type="radio"] { display: none; }
.solo-gender-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px solid #EEF3F5;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #A7B0B5;
  cursor: pointer;
  transition: all 0.18s ease;
}
.solo-gender-option input:checked + .solo-gender-label {
  border-color: #1FA6B5;
  color: #1FA6B5;
  background: rgba(31,166,181,0.06);
}
```

---

### 4.3 Family — 2–6 Box (Grid 3 Kolom)

```html
<!-- UPLOAD SECTION: Family -->
<div class="form-section">
  <div class="form-section-title">📷 Foto Referensi Anggota Keluarga</div>
  <p class="form-section-desc">
    Upload foto tiap anggota keluarga. Anak 2–4 opsional sesuai jumlah anak.
  </p>

  <!-- Baris 1: Ayah + Ibu + Anak 1 -->
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">

    <div class="upload-field-wrap">
      <div class="upload-field-label">Ayah</div>
      <div class="upload-box" id="upload-fm-ayah"
        role="button" tabindex="0"
        onclick="UploadManager.trigger('upload-fm-ayah')"
        ondragover="UploadManager.onDragOver(event,'upload-fm-ayah')"
        ondragleave="UploadManager.onDragLeave('upload-fm-ayah')"
        ondrop="UploadManager.onDrop(event,'upload-fm-ayah')">
        <svg class="upload-icon" width="18" height="18" ...></svg>
        <span class="upload-main-label" style="font-size:9px;">Klik upload</span>
        <input type="file" id="upload-fm-ayah-input" accept="image/*"
          style="display:none" onchange="UploadManager.handleFileInput(this,'upload-fm-ayah')">
      </div>
    </div>

    <div class="upload-field-wrap">
      <div class="upload-field-label">Ibu</div>
      <div class="upload-box" id="upload-fm-ibu"
        role="button" tabindex="0"
        onclick="UploadManager.trigger('upload-fm-ibu')"
        ondragover="UploadManager.onDragOver(event,'upload-fm-ibu')"
        ondragleave="UploadManager.onDragLeave('upload-fm-ibu')"
        ondrop="UploadManager.onDrop(event,'upload-fm-ibu')">
        <svg class="upload-icon" width="18" height="18" ...></svg>
        <span class="upload-main-label" style="font-size:9px;">Klik upload</span>
        <input type="file" id="upload-fm-ibu-input" accept="image/*"
          style="display:none" onchange="UploadManager.handleFileInput(this,'upload-fm-ibu')">
      </div>
    </div>

    <div class="upload-field-wrap">
      <div class="upload-field-label">Anak 1</div>
      <div class="upload-box" id="upload-fm-anak1"
        role="button" tabindex="0"
        onclick="UploadManager.trigger('upload-fm-anak1')"
        ondragover="UploadManager.onDragOver(event,'upload-fm-anak1')"
        ondragleave="UploadManager.onDragLeave('upload-fm-anak1')"
        ondrop="UploadManager.onDrop(event,'upload-fm-anak1')">
        <svg class="upload-icon" width="18" height="18" ...></svg>
        <span class="upload-main-label" style="font-size:9px;">Klik upload</span>
        <input type="file" id="upload-fm-anak1-input" accept="image/*"
          style="display:none" onchange="UploadManager.handleFileInput(this,'upload-fm-anak1')">
      </div>
    </div>

  </div>

  <!-- Baris 2: Anak 2 + 3 + 4 (opsional) -->
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">

    <div class="upload-field-wrap">
      <div class="upload-field-label">
        Anak 2 <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box upload-box-optional" id="upload-fm-anak2"
        role="button" tabindex="0"
        onclick="UploadManager.trigger('upload-fm-anak2')"
        ondragover="UploadManager.onDragOver(event,'upload-fm-anak2')"
        ondragleave="UploadManager.onDragLeave('upload-fm-anak2')"
        ondrop="UploadManager.onDrop(event,'upload-fm-anak2')">
        <svg class="upload-icon" width="16" height="16" style="opacity:0.4" ...></svg>
        <span class="upload-main-label" style="font-size:9px; opacity:0.5;">Opsional</span>
        <input type="file" id="upload-fm-anak2-input" accept="image/*"
          style="display:none" onchange="UploadManager.handleFileInput(this,'upload-fm-anak2')">
      </div>
    </div>

    <div class="upload-field-wrap">
      <div class="upload-field-label">
        Anak 3 <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box upload-box-optional" id="upload-fm-anak3" ...>
        ...
      </div>
    </div>

    <div class="upload-field-wrap">
      <div class="upload-field-label">
        Anak 4 <span class="upload-optional-badge">opsional</span>
      </div>
      <div class="upload-box upload-box-optional" id="upload-fm-anak4" ...>
        ...
      </div>
    </div>

  </div>
</div>
```

```css
/* Optional box — lebih subtle */
.upload-box-optional {
  border-color: rgba(167, 176, 181, 0.35);
  border-style: dashed;
}
.upload-box-optional:hover {
  border-color: rgba(31, 166, 181, 0.5);
  border-style: solid;
}
```

---

## 5. UploadManager Module — Lengkap

```js
// ================================================================
// MODULE: UploadManager
// Tanggung jawab: semua upload logic, validasi, preview, drag & drop
// ================================================================
const UploadManager = {

  // ── State ─────────────────────────────────────────────────────
  // Map: boxId → { file: File, dataUrl: string }
  _files: {},

  // ── Config ────────────────────────────────────────────────────
  MAX_SIZE_MB:    5,
  ALLOWED_TYPES:  ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXT:    ['jpg', 'jpeg', 'png', 'webp'],

  // ── ID Registry per Tab ───────────────────────────────────────
  // Mapping tab ke daftar boxId yang dimilikinya
  TAB_BOXES: {
    prewedding: ['upload-pw-pria', 'upload-pw-wanita'],
    wedding:    ['upload-wd-pria', 'upload-wd-wanita'],
    engagement: ['upload-en-pria', 'upload-en-wanita'],
    studio:     ['upload-st-solo', 'upload-st-pria', 'upload-st-wanita'],
    family:     ['upload-fm-ayah', 'upload-fm-ibu',
                 'upload-fm-anak1', 'upload-fm-anak2',
                 'upload-fm-anak3', 'upload-fm-anak4'],
  },

  // ── Trigger File Dialog ───────────────────────────────────────
  trigger(boxId) {
    const input = document.getElementById(`${boxId}-input`);
    if (input) input.click();
  },

  // ── Handle File dari <input type="file"> ──────────────────────
  handleFileInput(inputEl, boxId) {
    const file = inputEl.files?.[0];
    if (!file) return;
    this._processFile(file, boxId);
    // Reset input value — agar event onchange tetap fire jika pilih file yang sama
    inputEl.value = '';
  },

  // ── Core: Process & Validate File ────────────────────────────
  _processFile(file, boxId) {
    // Validasi tipe
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      showToast(`Format tidak didukung. Gunakan JPG, PNG, atau WEBP.`, 'error');
      return;
    }

    // Validasi ukuran
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > this.MAX_SIZE_MB) {
      showToast(`Ukuran file terlalu besar (${sizeMB.toFixed(1)}MB). Maksimal ${this.MAX_SIZE_MB}MB.`, 'error');
      return;
    }

    // Validasi dimensi minimum via Image (async)
    this._validateImageDimensions(file)
      .then(isValid => {
        if (!isValid) {
          showToast('Foto terlalu kecil. Gunakan foto minimal 200×200px.', 'error');
          return;
        }
        // Lanjut proses
        this._readAndPreview(file, boxId);
      })
      .catch(() => {
        // Jika cek dimensi gagal, tetap lanjut (graceful)
        this._readAndPreview(file, boxId);
      });
  },

  // ── Validate Image Dimensions ─────────────────────────────────
  _validateImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img.width >= 200 && img.height >= 200);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(true); // Gagal cek → lolos saja
      };
      img.src = url;
    });
  },

  // ── Read File & Render Preview ────────────────────────────────
  _readAndPreview(file, boxId) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Simpan ke state
      this._files[boxId] = { file, dataUrl };
      // Render preview ke DOM
      this._renderPreview(boxId, dataUrl);
      // Toast sukses
      showToast('Foto berhasil diupload ✓', 'success');
    };
    reader.onerror = () => {
      showToast('Gagal membaca file. Coba lagi.', 'error');
    };
    reader.readAsDataURL(file);
  },

  // ── Render Preview ke Upload Box ──────────────────────────────
  _renderPreview(boxId, dataUrl) {
    const box = document.getElementById(boxId);
    if (!box) return;

    // Tandai box sebagai has-file
    box.classList.add('has-file');

    // Kosongkan isi box
    // (simpan dulu hidden input agar tetap ada)
    const hiddenInput = box.querySelector(`input[type="file"]`);

    box.innerHTML = '';

    // Re-append hidden input
    if (hiddenInput) box.appendChild(hiddenInput);

    // Tambahkan preview image
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'Preview foto referensi';
    img.className = 'upload-preview-img';
    box.appendChild(img);

    // Tambahkan tombol clear
    const clearBtn = document.createElement('button');
    clearBtn.className = 'upload-clear-btn';
    clearBtn.setAttribute('aria-label', 'Hapus foto');
    clearBtn.setAttribute('type', 'button');
    clearBtn.innerHTML = '×';
    clearBtn.onclick = (e) => {
      e.stopPropagation(); // Jangan trigger upload dialog
      this.clear(boxId);
    };
    box.appendChild(clearBtn);
  },

  // ── Clear / Hapus Upload ──────────────────────────────────────
  clear(boxId) {
    // Hapus dari state
    delete this._files[boxId];

    const box = document.getElementById(boxId);
    if (!box) return;

    // Hapus class has-file
    box.classList.remove('has-file');

    // Simpan hidden input
    const hiddenInput = box.querySelector(`input[type="file"]`);

    // Reset ke empty state
    box.innerHTML = '';
    if (hiddenInput) {
      hiddenInput.value = '';
      box.appendChild(hiddenInput);
    }

    // Restore empty state HTML
    box.insertAdjacentHTML('afterbegin', `
      <svg class="upload-icon" width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span class="upload-main-label">Klik atau seret foto</span>
      <span class="upload-hint-label">JPG, PNG, WEBP · Maks 5MB</span>
    `);
  },

  // ── Clear All per Tab ─────────────────────────────────────────
  clearTab(tab) {
    const boxes = this.TAB_BOXES[tab] || [];
    boxes.forEach(boxId => {
      if (this._files[boxId]) this.clear(boxId);
    });
  },

  // ── Getters ───────────────────────────────────────────────────
  getFile(boxId) {
    return this._files[boxId]?.file || null;
  },

  getDataUrl(boxId) {
    return this._files[boxId]?.dataUrl || null;
  },

  hasFile(boxId) {
    return !!this._files[boxId];
  },

  /**
   * Ambil semua file yang diupload untuk tab tertentu
   * Returns object: { pria: File|null, wanita: File|null, ... }
   */
  getTabFiles(tab) {
    const idMap = {
      prewedding: { pria: 'upload-pw-pria',  wanita: 'upload-pw-wanita' },
      wedding:    { pria: 'upload-wd-pria',  wanita: 'upload-wd-wanita' },
      engagement: { pria: 'upload-en-pria',  wanita: 'upload-en-wanita' },
      studio:     {
        solo:  'upload-st-solo',
        pria:  'upload-st-pria',
        wanita:'upload-st-wanita',
      },
      family:     {
        ayah:  'upload-fm-ayah',
        ibu:   'upload-fm-ibu',
        anak1: 'upload-fm-anak1',
        anak2: 'upload-fm-anak2',
        anak3: 'upload-fm-anak3',
        anak4: 'upload-fm-anak4',
      },
    };

    const map = idMap[tab] || {};
    const result = {};
    for (const [key, boxId] of Object.entries(map)) {
      result[key] = this.getFile(boxId);
    }
    return result;
  },

  // ── Drag & Drop ───────────────────────────────────────────────
  onDragOver(event, boxId) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById(boxId)?.classList.add('drag-over');
  },

  onDragLeave(boxId) {
    document.getElementById(boxId)?.classList.remove('drag-over');
  },

  onDrop(event, boxId) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById(boxId)?.classList.remove('drag-over');

    const file = event.dataTransfer?.files?.[0];
    if (file) this._processFile(file, boxId);
  },
};
```

---

## 6. StudioUpload Helper

```js
// ================================================================
// HELPER: StudioUpload — khusus tab Studio
// ================================================================
const StudioUpload = {
  currentMode:   'solo',   // 'solo' | 'pasangan'
  currentGender: 'pria',   // 'pria' | 'wanita'

  setMode(mode) {
    this.currentMode = mode;

    // Toggle tombol aktif
    document.querySelectorAll('.studio-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Toggle panel visibility
    const soloPanel     = document.getElementById('studio-upload-solo');
    const pasanganPanel = document.getElementById('studio-upload-pasangan');

    if (mode === 'solo') {
      soloPanel    && (soloPanel.style.display     = 'block');
      pasanganPanel && (pasanganPanel.style.display = 'none');
    } else {
      soloPanel    && (soloPanel.style.display     = 'none');
      pasanganPanel && (pasanganPanel.style.display = 'block');
    }

    // Sync ke AppController — mode studio dipakai PromptBuilder
    AppController.studioMode = mode;
  },

  setGender(gender) {
    this.currentGender = gender;
    // Update label box
    const label = document.getElementById('studio-solo-label');
    if (label) {
      label.firstChild.textContent = gender === 'pria'
        ? 'Foto Subject Pria '
        : 'Foto Subject Wanita ';
    }
    // Sync ke AppController
    AppController.studioGender = gender;
  },

  getUploadedFile() {
    if (this.currentMode === 'solo') {
      return UploadManager.getFile('upload-st-solo');
    }
    return {
      pria:   UploadManager.getFile('upload-st-pria'),
      wanita: UploadManager.getFile('upload-st-wanita'),
    };
  },
};
```

---

## 7. Integrasi ke FalEngine

Saat ini (Fase 1), foto referensi wajah digunakan sebagai **context dalam prompt** — bukan dikirim langsung ke API (karena Flux Schnell tidak support image-to-image secara langsung).

### Fase 1 — Prompt Enhancement (Tanpa Image Input)

```js
// Di PromptBuilder — jika ada foto referensi, tambahkan descriptor ke prompt
function injectFaceReferenceContext(basePrompt, tab) {
  const files = UploadManager.getTabFiles(tab);
  const hints = [];

  // Jika ada foto, tambahkan hint kualitas ke prompt
  if (files.pria || files.solo) {
    hints.push('face reference provided for male subject');
  }
  if (files.wanita) {
    hints.push('face reference provided for female subject');
  }
  if (files.ayah || files.ibu) {
    hints.push('family face references provided');
  }

  // Hint tidak mengubah prompt substansial — hanya marker untuk Fase 2
  return basePrompt;  // Di Fase 1: return as-is
}
```

### Fase 2 — Image-to-Image / InstantID (Rencana)

```js
// RENCANA Fase 2: Kirim foto ke Fal AI InstantID untuk face swap
// Endpoint: fal-ai/instant-id atau fal-ai/ip-adapter-face-id

async function generateWithFaceReference(prompt, faceFile, aspectRatio) {
  // 1. Convert file ke base64
  const base64 = await fileToBase64(faceFile);

  // 2. Kirim ke InstantID endpoint
  const response = await fetch('https://fal.run/fal-ai/instant-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      face_image_url: `data:image/jpeg;base64,${base64}`,
      image_size: { width: 1024, height: 1280 },
      num_inference_steps: 30,
      guidance_scale: 5.0,
      ip_adapter_scale: 0.8,
    }),
  });

  const data = await response.json();
  return data?.images?.[0]?.url;
}

// Helper: File → Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 8. Tips Upload — Panduan untuk User

Teks panduan yang ditampilkan di bawah upload section:

```html
<div class="upload-tips">
  <div class="upload-tips-title">Tips foto referensi terbaik:</div>
  <ul class="upload-tips-list">
    <li>✓ Foto close-up wajah yang jelas, menghadap kamera</li>
    <li>✓ Pencahayaan cukup — tidak gelap atau silau</li>
    <li>✓ Wajah tidak tertutup (kacamata, masker, rambut)</li>
    <li>✓ 1 orang per foto — jangan foto grup</li>
    <li>✗ Hindari foto blur, terlalu kecil, atau hitam putih</li>
  </ul>
</div>
```

```css
.upload-tips {
  background: rgba(31,166,181,0.04);
  border: 1px solid rgba(31,166,181,0.12);
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 4px;
}
.upload-tips-title {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #1E2A2F;
  margin-bottom: 6px;
}
.upload-tips-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.upload-tips-list li {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #A7B0B5;
  line-height: 1.5;
}
```

---

## 9. Box ID Registry Lengkap

Daftar lengkap semua `boxId` yang digunakan di seluruh aplikasi:

```js
const UPLOAD_BOX_IDS = {
  // Tab Prewedding
  'upload-pw-pria':    { tab: 'prewedding', role: 'pria',   label: 'Foto Pria' },
  'upload-pw-wanita':  { tab: 'prewedding', role: 'wanita', label: 'Foto Wanita' },

  // Tab Wedding
  'upload-wd-pria':    { tab: 'wedding', role: 'pria',   label: 'Foto Pengantin Pria' },
  'upload-wd-wanita':  { tab: 'wedding', role: 'wanita', label: 'Foto Pengantin Wanita' },

  // Tab Engagement
  'upload-en-pria':    { tab: 'engagement', role: 'pria',   label: 'Foto Pria' },
  'upload-en-wanita':  { tab: 'engagement', role: 'wanita', label: 'Foto Wanita' },

  // Tab Studio
  'upload-st-solo':    { tab: 'studio', role: 'solo',   label: 'Foto Subject' },
  'upload-st-pria':    { tab: 'studio', role: 'pria',   label: 'Foto Pria' },
  'upload-st-wanita':  { tab: 'studio', role: 'wanita', label: 'Foto Wanita' },

  // Tab Family
  'upload-fm-ayah':    { tab: 'family', role: 'ayah',  label: 'Foto Ayah' },
  'upload-fm-ibu':     { tab: 'family', role: 'ibu',   label: 'Foto Ibu' },
  'upload-fm-anak1':   { tab: 'family', role: 'anak1', label: 'Foto Anak 1' },
  'upload-fm-anak2':   { tab: 'family', role: 'anak2', label: 'Foto Anak 2', optional: true },
  'upload-fm-anak3':   { tab: 'family', role: 'anak3', label: 'Foto Anak 3', optional: true },
  'upload-fm-anak4':   { tab: 'family', role: 'anak4', label: 'Foto Anak 4', optional: true },
};
```

---

## 10. Checklist Implementasi

### Upload Box Visual
- [ ] Default state: dashed teal border, ikon upload, label teks
- [ ] Hover state: solid border, background lebih terang, glow shadow
- [ ] Drag-over state: class `.drag-over` ditambahkan saat file di-drag ke atas
- [ ] Has-file state: thumbnail mengisi box, tombol × di pojok kanan atas
- [ ] Optional box: border lebih pudar (`rgba(167,176,181,0.35)`)
- [ ] `role="button"` + `tabindex="0"` + `onkeydown` untuk keyboard navigation

### Fungsionalitas
- [ ] Klik box → trigger `<input type="file">` tersembunyi
- [ ] Drag & drop berfungsi di semua box
- [ ] Validasi tipe file (JPG/PNG/WEBP saja)
- [ ] Validasi ukuran maks 5MB
- [ ] Validasi dimensi minimum 200×200px
- [ ] Preview thumbnail langsung setelah pilih file
- [ ] Tombol × menghapus preview dan reset state
- [ ] `input.value = ''` direset setelah setiap upload (agar bisa pilih file sama)
- [ ] Toast sukses saat upload berhasil
- [ ] Toast error dengan pesan spesifik saat validasi gagal

### Studio Tab
- [ ] Toggle Solo/Pasangan berfungsi
- [ ] Panel Solo: 1 box dengan gender toggle Pria/Wanita
- [ ] Label box berubah sesuai gender yang dipilih
- [ ] Panel Pasangan: 2 box (Pria + Wanita)
- [ ] `AppController.studioMode` dan `studioGender` tersinkron

### Family Tab
- [ ] Grid 3 kolom baris 1: Ayah, Ibu, Anak 1
- [ ] Grid 3 kolom baris 2: Anak 2, 3, 4 (opsional, border lebih pudar)
- [ ] Semua 6 box berfungsi independen

### State Management
- [ ] `UploadManager._files` menyimpan `{ file, dataUrl }` per boxId
- [ ] `UploadManager.getTabFiles(tab)` mengembalikan semua file tab
- [ ] Clear tab saat user pindah ke tab berbeda (opsional UX decision)
- [ ] State tidak bocor antar tab

---

*PotretAI v3 — Face Reference System · v3.0 · Fase 1 Build*
