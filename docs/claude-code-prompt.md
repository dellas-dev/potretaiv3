# Claude Code Prompt — PotretAI v3 Full Menu Integration

Paste this entire prompt into Claude Code in VSCode.

---

You are doing a complete menu restructure of PotretAI v3 (app.html).
Read the full file first, then execute each change below precisely.

The file is at: app.html (in the project root folder)

════════════════════════════════════════════════════════════
CHANGE 1 — Replace gen-tabs (tab pill buttons, 5 → 6 menus)
════════════════════════════════════════════════════════════

Find this exact block (the 5 old tab buttons):
```
<div class="gen-tabs" role="tablist">
      <button class="gen-tab active" data-tab="prewedding" onclick="switchTab('prewedding')" role="tab">&#128141; Prewedding</button>
      <button class="gen-tab" data-tab="wedding"    onclick="switchTab('wedding')"    role="tab">&#128112; Wedding</button>
      <button class="gen-tab" data-tab="engagement" onclick="switchTab('engagement')" role="tab">&#128142; Engagement</button>
      <button class="gen-tab" data-tab="studio"     onclick="switchTab('studio')"     role="tab">&#128247; Studio</button>
      <button class="gen-tab" data-tab="family"     onclick="switchTab('family')"     role="tab">&#128106; Family</button>
    </div>
```

Replace with:
```
<div class="gen-tabs" role="tablist">
      <button class="gen-tab active" data-tab="wisuda"       onclick="switchTab('wisuda')"       role="tab">🎓 Wisuda</button>
      <button class="gen-tab"        data-tab="profesional"  onclick="switchTab('profesional')"  role="tab">💼 Profesional</button>
      <button class="gen-tab"        data-tab="maternity"    onclick="switchTab('maternity')"    role="tab">🤰 Maternity</button>
      <button class="gen-tab"        data-tab="studio_korea" onclick="switchTab('studio_korea')" role="tab">🇰🇷 Studio Korea</button>
      <button class="gen-tab"        data-tab="prewedding"   onclick="switchTab('prewedding')"   role="tab">💍 Prewedding</button>
      <button class="gen-tab"        data-tab="wedding"      onclick="switchTab('wedding')"      role="tab">👰 Wedding</button>
    </div>
```

════════════════════════════════════════════════════════════
CHANGE 2 — Replace sidebar submenu (sb-submenu)
════════════════════════════════════════════════════════════

Find this exact block:
```
  <div class="sb-submenu" id="sb-submenu">
    <button class="sb-subitem" data-tab="prewedding" onclick="navigateTo('generator','prewedding')">&#128141; Prewedding</button>
    <button class="sb-subitem" data-tab="wedding"    onclick="navigateTo('generator','wedding')">&#128112; Wedding</button>
    <button class="sb-subitem" data-tab="engagement" onclick="navigateTo('generator','engagement')">&#128142; Engagement</button>
    <button class="sb-subitem" data-tab="studio"     onclick="navigateTo('generator','studio')">&#128247; Studio</button>
    <button class="sb-subitem" data-tab="family"     onclick="navigateTo('generator','family')">&#128106; Family</button>
  </div>
```

Replace with:
```
  <div class="sb-submenu" id="sb-submenu">
    <button class="sb-subitem" data-tab="wisuda"       onclick="navigateTo('generator','wisuda')">🎓 Wisuda</button>
    <button class="sb-subitem" data-tab="profesional"  onclick="navigateTo('generator','profesional')">💼 Profesional</button>
    <button class="sb-subitem" data-tab="maternity"    onclick="navigateTo('generator','maternity')">🤰 Maternity</button>
    <button class="sb-subitem" data-tab="studio_korea" onclick="navigateTo('generator','studio_korea')">🇰🇷 Studio Korea</button>
    <button class="sb-subitem" data-tab="prewedding"   onclick="navigateTo('generator','prewedding')">💍 Prewedding</button>
    <button class="sb-subitem" data-tab="wedding"      onclick="navigateTo('generator','wedding')">👰 Wedding</button>
  </div>
```

Also find `.sb-submenu{overflow:hidden;max-height:0;` in the CSS and change `max-height:300px` in `.sb-submenu.open` to `max-height:420px`.

════════════════════════════════════════════════════════════
CHANGE 3 — Replace dashboard cat-grid (5 → 6 cards)
════════════════════════════════════════════════════════════

Find the div containing cat-cards starting with `onclick="navigateTo('generator','prewedding')"`. It will be inside a div with class like `cat-grid`. Replace the ENTIRE cat-grid inner content (all 5 cat-card divs) with these 6 cards:

```html
      <div class="cat-card" onclick="navigateTo('generator','wisuda')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/1E2A2F/1FA6B5?text=Wisuda+AI" alt="Wisuda" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">🎓</div><div><div class="cat-title">Wisuda</div><div class="cat-desc">Foto S1 / S2 / S3 profesional</div></div></div>
      </div>
      <div class="cat-card" onclick="navigateTo('generator','profesional')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/0E8EA0/FFFFFF?text=Profesional+AI" alt="Profesional" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">💼</div><div><div class="cat-title">Profesional</div><div class="cat-desc">LinkedIn / CV / KTP</div></div></div>
      </div>
      <div class="cat-card" onclick="navigateTo('generator','maternity')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/FF7A5A/FFFFFF?text=Maternity+AI" alt="Maternity" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">🤰</div><div><div class="cat-title">Maternity</div><div class="cat-desc">Foto kehamilan 7–9 bulan</div></div></div>
      </div>
      <div class="cat-card" onclick="navigateTo('generator','studio_korea')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/1FA6B5/FFFFFF?text=Studio+Korea" alt="Studio Korea" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">🇰🇷</div><div><div class="cat-title">Studio Korea</div><div class="cat-desc">K-drama aesthetic studio</div></div></div>
      </div>
      <div class="cat-card" onclick="navigateTo('generator','prewedding')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/0D1E25/1FA6B5?text=Prewedding+AI" alt="Prewedding" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">💍</div><div><div class="cat-title">Prewedding</div><div class="cat-desc">Ratusan lokasi dunia</div></div></div>
      </div>
      <div class="cat-card" onclick="navigateTo('generator','wedding')">
        <div class="cat-img-wrap"><img class="cat-img" src="https://placehold.co/400x280/1E2A2F/FF7A5A?text=Wedding+AI" alt="Wedding" loading="lazy"><div class="cat-overlay"><span class="cat-start">Mulai Generate &#8594;</span></div></div>
        <div class="cat-body"><div class="cat-emoji">👰</div><div><div class="cat-title">Wedding</div><div class="cat-desc">Foto resepsi & akad nikah</div></div></div>
      </div>
```

Also find `cat-grid` CSS and change `grid-template-columns` to `repeat(3,1fr)` (was repeat(5,1fr)).

════════════════════════════════════════════════════════════
CHANGE 4 — Replace all tab-content forms in gen-left panel
════════════════════════════════════════════════════════════

Find the entire gen-left panel from `<div class="gen-left" id="gen-form-panel">` to its closing `</div><!-- /gen-left -->`.

Replace it entirely with this new gen-left:

```html
    <!-- LEFT PANEL — 6 menus -->
    <div class="gen-left" id="gen-form-panel">

      <!-- ══════════════ TAB: WISUDA ══════════════ -->
      <div class="tab-content active" id="tab-wisuda">
        <div class="form-sec">
          <div class="form-sec-title">📷 Foto Referensi Wajah</div>
          <div class="upload-grid">
            <div>
              <div class="upload-top-lbl">Foto Wajah Kamu (Solo)</div>
              <div class="upload-relative">
                <div class="upload-box" id="upload-ws-face" onclick="triggerUpload('inp-ws-face')">
                  <input type="file" id="inp-ws-face" accept="image/*" style="display:none" onchange="handleUpload(this,'upload-ws-face')">
                  <svg class="upload-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span class="upload-label-txt">Klik atau drag foto wajah</span>
                  <span class="upload-hint-txt">JPG PNG WEBP · Max 5MB · 1 wajah</span>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(31,166,181,0.06);border-radius:8px;border:1px solid rgba(31,166,181,0.15);">
            <p style="font-family:'Roboto Mono',monospace;font-size:9.5px;color:#0E8EA0;line-height:1.6;">✓ Foto solo wajah menghadap depan · ✓ Pencahayaan cukup · ✗ Foto grup</p>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🎓 Jenjang & Penampilan</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Jenjang</label>
              <select class="form-select" id="ws-jenjang">
                <option value="s1">S1 — Sarjana</option>
                <option value="s2">S2 — Magister</option>
                <option value="s3">S3 — Doktor</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Etnis / Penampilan</label>
              <select class="form-select" id="ws-ethnicity">
                <option value="indonesian_f">Indonesia Wanita</option>
                <option value="indonesian_m">Indonesia Pria</option>
                <option value="javanese_f">Jawa Wanita</option>
                <option value="chinese_indo_f">Chinese-Indo Wanita</option>
                <option value="korean_f">Korea Wanita</option>
                <option value="sea_f">Asia Tenggara Wanita</option>
                <option value="sea_m">Asia Tenggara Pria</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">👗 Outfit</div>
          <div class="form-field">
            <label class="form-label">Outfit Wisuda</label>
            <select class="form-select" id="ws-outfit" onchange="checkCustom(this,'ws-outfit-c')">
              <optgroup label="── WANITA ──">
                <option value="wearing black graduation toga gown, mortarboard cap, white hijab, neat professional appearance">Toga Hitam + Hijab Putih</option>
                <option value="wearing black graduation toga gown, mortarboard cap, elegant hair down with soft waves">Toga Hitam + Rambut Terurai</option>
                <option value="wearing black graduation toga gown, mortarboard cap, neat elegant updo hairstyle">Toga Hitam + Sanggul Modern</option>
                <option value="wearing black graduation toga over white kebaya, Indonesian academic elegance">Toga Hitam + Kebaya Putih</option>
                <option value="wearing maroon graduation toga gown, gold academic regalia, mortarboard cap">Toga Maroon + Gold Regalia (S2)</option>
                <option value="wearing doctoral graduation regalia, PhD hood, distinguished academic">Toga Doctoral + PhD Hood (S3)</option>
                <option value="wearing modern white kebaya with batik kain, graduation sash, Indonesian graduate">Kebaya Modern + Graduation Sash</option>
                <option value="wearing white floral midi dress, holding graduation bouquet, fresh celebratory">Dress Putih Bunga + Bouquet</option>
                <option value="wearing white hijab, elegant gamis or long dress, graduation sash, modest graduate">Hijab Putih + Gamis Elegan</option>
                <option value="wearing Korean graduation style, soft pleated skirt, blazer, modern K-drama graduate">Gaya Wisuda Korea (K-Drama)</option>
              </optgroup>
              <optgroup label="── PRIA ──">
                <option value="wearing black graduation toga, formal black suit underneath, white dress shirt, tie">Toga Hitam + Jas Formal</option>
                <option value="wearing black graduation toga over premium batik shirt, Indonesian male graduate">Toga Hitam + Batik Premium</option>
                <option value="wearing black graduation toga over white baju koko, Muslim male graduate">Toga Hitam + Baju Koko</option>
                <option value="wearing master graduation regalia, academic hood, professional">Toga Master + Academic Hood (S2)</option>
                <option value="wearing doctoral graduation regalia, PhD hood, academic achievement">Toga Doctoral PhD (S3)</option>
                <option value="wearing Korean graduation style, clean modern suit, K-drama aesthetic">Gaya Wisuda Korea Pria</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
            <input type="text" class="form-input-text custom-input" id="ws-outfit-c" placeholder="Contoh: toga biru, kebaya gold, jas coklat...">
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🏛️ Background / Lokasi</div>
          <div class="form-field">
            <label class="form-label">Pilih Background</label>
            <select class="form-select" id="ws-background" onchange="checkCustom(this,'ws-bg-c')">
              <optgroup label="── STUDIO ──">
                <option value="deep navy velvet curtain backdrop, warm studio lighting, formal graduation portrait">Studio Tirai Navy Formal</option>
                <option value="professional soft grey gradient studio backdrop, timeless graduation portrait">Studio Gradient Abu Professional</option>
                <option value="golden bokeh lights backdrop, celebration atmosphere, warm glowing graduation">Studio Bokeh Emas Celebration</option>
                <option value="clean white seamless studio backdrop, high key lighting, bright graduation portrait">Studio Putih Bersih</option>
                <option value="deep blue professional backdrop, sophisticated elegant graduation portrait">Studio Biru Tua Elegan</option>
              </optgroup>
              <optgroup label="── KAMPUS & AKADEMIK ──">
                <option value="grand university building facade, classical architecture, stone columns, academic grandeur">Gedung Kampus Megah</option>
                <option value="grand university library hall, floor-to-ceiling bookshelves, warm academic atmosphere">Aula Perpustakaan</option>
                <option value="lush university garden, manicured lawn, academic building backdrop, soft natural light">Taman Kampus Hijau</option>
                <option value="elegant university colonnade, classical columns, warm stone, architectural dignity">Koridor Berpilar Elegan</option>
                <option value="classic brick archway, ivy-covered walls, collegiate Gothic architecture, timeless">Gerbang Kampus Klasik</option>
              </optgroup>
              <optgroup label="── INDONESIA ──">
                <option value="ancient Buddhist Borobudur monument stone stupas, misty morning, UNESCO heritage Indonesia">Candi Borobudur</option>
                <option value="magnificent Hindu temple towers, dramatic sky, Prambanan Yogyakarta heritage">Candi Prambanan</option>
                <option value="National Monument Monas, grand plaza, Indonesian landmark, formal celebratory">Monas Jakarta</option>
                <option value="royal Javanese palace courtyard, elegant pendopo, traditional architecture">Keraton Yogyakarta</option>
                <option value="iconic Balinese split gate Candi Bentar, lush tropical garden, sacred cultural">Gerbang Pura Bali</option>
              </optgroup>
              <optgroup label="── INTERNASIONAL ──">
                <option value="Eiffel Tower background at golden hour, Champ de Mars garden, Parisian romance">Menara Eiffel Paris</option>
                <option value="cherry blossom trees full bloom, pink sakura canopy, Tokyo spring celebration">Sakura Tokyo</option>
                <option value="Korean university clean modern building, cherry blossom trees, K-drama graduation">Kampus Gaya Korea</option>
              </optgroup>
              <optgroup label="── AESTHETIC & TREND ──">
                <option value="lush fresh flower arch, roses and peonies, romantic floral graduation backdrop">Gapura Bunga Segar</option>
                <option value="thousands of fairy lights bokeh, warm golden glow, magical celebratory atmosphere">Fairy Lights Bokeh</option>
                <option value="open golden field at sunset, long grass, warm backlight, cinematic graduation">Padang Rumput Sunset</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
            <input type="text" class="form-input-text custom-input" id="ws-bg-c" placeholder="Contoh: taman bunga, perpustakaan, pantai...">
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🤸 Pose & Properti</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Pose</label>
              <select class="form-select" id="ws-pose">
                <option value="standing tall and proud, shoulders back, diploma in hand, full body confident portrait">Berdiri Tegak Bangga + Ijazah</option>
                <option value="tossing graduation cap upward, arms raised in celebration, full body dynamic">Lempar Toga ke Udara</option>
                <option value="walking confidently toward camera on campus path, full body natural stride">Berjalan di Kampus</option>
                <option value="3/4 body portrait, holding diploma with both hands, proud academic display">3/4 Body + Ijazah</option>
                <option value="jumping with joy, arms spread wide, full body celebration leap">Lompat Kegembiraan</option>
                <option value="small figure walking in vast campus landscape, wide shot, architectural scale">Wide Shot — Kampus Luas</option>
                <option value="seated on stone campus steps, legs to side, relaxed graduate portrait">Duduk di Tangga Kampus</option>
                <option value="close-up portrait headshot, warm genuine smile, approachable graduation portrait">Close-Up Portrait Tersenyum</option>
                <option value="spinning in graduation gown, gown flowing in circle, joyful movement">Berputar Toga Mengembang</option>
                <option value="waving diploma in air triumphantly, one arm raised, celebratory energy">Melambai Ijazah Triumfan</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Properti</label>
              <select class="form-select" id="ws-props">
                <option value="holding rolled diploma scroll proudly">Gulungan Ijazah</option>
                <option value="holding open diploma certificate, reading proudly">Ijazah Terbuka</option>
                <option value="holding large bouquet of red roses, graduation gift">Buket Mawar Merah</option>
                <option value="holding bright sunflower bouquet, celebratory fresh">Buket Bunga Matahari</option>
                <option value="holding mixed flower bouquet, colorful celebratory">Buket Bunga Mix</option>
                <option value="holding small graduation teddy bear with mini toga, cute prop">Teddy Bear Toga Mini</option>
                <option value="">Tidak Ada Properti</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🎨 Gaya Foto</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Pencahayaan</label>
              <select class="form-select" id="ws-lighting">
                <option value="golden_hour">Golden Hour</option>
                <option value="studio_high_key">Studio Terang (High Key)</option>
                <option value="soft_morning">Pagi Lembut</option>
                <option value="window_natural">Cahaya Jendela</option>
                <option value="overcast_soft">Mendung Soft</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Color Grade</label>
              <select class="form-select" id="ws-grade">
                <option value="bright_airy">Bright & Airy</option>
                <option value="warm_cinematic">Warm Cinematic</option>
                <option value="soft_pastel">Soft Pastel</option>
                <option value="neutral_film">Neutral Film</option>
                <option value="bw_fine_art">Hitam Putih Fine Art</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Lensa</label>
              <select class="form-select" id="ws-lens">
                <option value="35mm f/1.4 wide prime, natural full body perspective, editorial lifestyle full body">35mm f/1.4 — Full Body Natural</option>
                <option value="50mm f/1.4 standard prime, natural human perspective, versatile portrait">50mm f/1.4 — Standard</option>
                <option value="24-70mm f/2.8 professional zoom lens, versatile full body to portrait">24-70mm f/2.8 — Zoom Versatile</option>
                <option value="85mm f/1.4 portrait prime, creamy background separation, classic portrait">85mm f/1.4 — Portrait Bokeh</option>
                <option value="28mm f/1.8 wide prime, environmental full body portrait, context storytelling">28mm f/1.8 — Wide Environmental</option>
              </select>
            </div>
          </div>
        </div>
        <div class="gen-bottom">
          <button class="btn-generate" id="btn-gen-ws" onclick="startGenerate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="btn-gen-ws-label">Generate 4 Foto Wisuda</span>
            <svg id="btn-gen-ws-spin" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="display:none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
        </div>
      </div><!-- /tab-wisuda -->

      <!-- ══════════════ TAB: PROFESIONAL ══════════════ -->
      <div class="tab-content" id="tab-profesional">
        <div class="form-sec">
          <div class="form-sec-title">📷 Foto Referensi Wajah</div>
          <div class="upload-grid">
            <div>
              <div class="upload-top-lbl">Foto Wajah Kamu</div>
              <div class="upload-relative">
                <div class="upload-box" id="upload-pr-face" onclick="triggerUpload('inp-pr-face')">
                  <input type="file" id="inp-pr-face" accept="image/*" style="display:none" onchange="handleUpload(this,'upload-pr-face')">
                  <svg class="upload-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span class="upload-label-txt">Klik atau drag foto wajah</span>
                  <span class="upload-hint-txt">JPG PNG WEBP · Max 5MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">👤 Penampilan & Tipe Foto</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Etnis / Penampilan</label>
              <select class="form-select" id="pr-ethnicity">
                <option value="indonesian_f">Indonesia Wanita</option>
                <option value="indonesian_m">Indonesia Pria</option>
                <option value="javanese_f">Jawa Wanita</option>
                <option value="chinese_indo_f">Chinese-Indo Wanita</option>
                <option value="chinese_indo_m">Chinese-Indo Pria</option>
                <option value="korean_f">Korea Wanita</option>
                <option value="korean_m">Korea Pria</option>
                <option value="sea_m">Asia Tenggara Pria</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Tipe Foto</label>
              <select class="form-select" id="pr-type">
                <option value="linkedin">LinkedIn / CV Profesional</option>
                <option value="ktp">KTP / ID Card</option>
                <option value="passport">Passport / Visa</option>
                <option value="executive">Executive Branding</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">👔 Outfit Profesional</div>
          <div class="form-field">
            <label class="form-label">Pilih Outfit</label>
            <select class="form-select" id="pr-outfit" onchange="checkCustom(this,'pr-outfit-c')">
              <optgroup label="── WANITA ──">
                <option value="wearing navy blue blazer, crisp white dress shirt, polished professional corporate">Blazer Navy + Kemeja Putih</option>
                <option value="wearing tailored black blazer, black trousers, formal corporate executive">Blazer Hitam Formal Eksekutif</option>
                <option value="wearing charcoal grey pantsuit, white blouse, professional powerful">Suit Abu Powerful</option>
                <option value="wearing crisp white button-down shirt, clean professional minimal">Kemeja Putih Bersih</option>
                <option value="wearing blush pink blazer, white shirt, approachable professional">Blazer Blush Approachable</option>
                <option value="wearing formal contemporary batik blouse, tailored trousers, Indonesian professional">Batik Formal Indonesia</option>
                <option value="wearing hijab with formal blazer and long shirt, professional Muslim woman">Hijab + Blazer Formal</option>
                <option value="wearing white medical doctor coat, stethoscope, professional healthcare">Jas Dokter Putih</option>
              </optgroup>
              <optgroup label="── PRIA ──">
                <option value="wearing navy suit, white dress shirt, silk tie, formal corporate professional">Suit Navy + Dasi Formal</option>
                <option value="wearing charcoal grey suit, light blue shirt, tie, polished executive">Suit Charcoal + Dasi</option>
                <option value="wearing dark blue slim suit, white shirt, modern professional">Suit Biru Tua Modern</option>
                <option value="wearing crisp white dress shirt, dark trousers, clean professional">Kemeja Putih Profesional</option>
                <option value="wearing formal batik shirt, dark tailored trousers, Indonesian professional">Batik Formal Indonesia</option>
                <option value="wearing elegant embroidered baju koko, professional Muslim male">Baju Koko Elegan</option>
                <option value="wearing white medical coat, stethoscope, professional doctor">Jas Dokter Putih</option>
                <option value="wearing dark jeans, crisp shirt, blazer, tech startup professional">Smart Casual (Tech/Startup)</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
            <input type="text" class="form-input-text custom-input" id="pr-outfit-c" placeholder="Contoh: jas coklat, batik formal, gamis elegan...">
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🖼️ Background</div>
          <div class="form-field">
            <label class="form-label">Pilih Background</label>
            <select class="form-select" id="pr-background">
              <optgroup label="── LINKEDIN / CV ──">
                <option value="professional soft grey gradient backdrop, timeless corporate headshot">Abu Gradient Profesional</option>
                <option value="clean white seamless studio backdrop, even soft lighting, classic LinkedIn headshot">Putih Bersih Studio</option>
                <option value="warm cream off-white backdrop, approachable warm professional tone">Krem Hangat</option>
                <option value="light navy blue studio backdrop, trust and intelligence, finance professional">Navy Muda (Kepercayaan)</option>
                <option value="deep navy power backdrop, authority and trust, C-suite executive look">Navy Gelap Executive</option>
                <option value="blurred modern office interior bokeh, professional workspace context, corporate">Kantor Blur Profesional</option>
                <option value="softly blurred bookshelf background, intellectual academic professional">Rak Buku Blur</option>
                <option value="large window natural light, softly blurred outside, warm natural professional">Jendela Natural Blur</option>
                <option value="modern urban street, city building background, contemporary professional outdoor">Jalan Urban Modern</option>
              </optgroup>
              <optgroup label="── KTP / ID / PASSPORT ──">
                <option value="plain flat white background, ID card standard, formal identity document">Putih Polos (KTP/ID)</option>
                <option value="plain light blue background, Indonesian ID card standard format">Biru Polos (KTP Standard)</option>
                <option value="plain light grey background, passport application standard">Abu Polos (Passport)</option>
                <option value="plain red background, formal identity document standard">Merah Polos</option>
              </optgroup>
              <optgroup label="── INDUSTRI KHUSUS ──">
                <option value="modern tech office, clean minimal, startup culture, tech professional">Tech Office Modern</option>
                <option value="clean clinical white setting, medical professional, healthcare provider">Setting Medis Bersih</option>
                <option value="elegant law office interior, mahogany desk, legal professional setting">Kantor Hukum Elegan</option>
                <option value="university building backdrop, academic professional, educator or researcher">Kampus / Akademis</option>
              </optgroup>
            </select>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">📐 Framing & Ekspresi</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Framing</label>
              <select class="form-select" id="pr-shot">
                <option value="professional headshot, face and shoulders, face takes up 60% of frame, LinkedIn standard">Headshot Standard (LinkedIn)</option>
                <option value="half body portrait, waist up, arms visible, professional stance">Half Body Formal</option>
                <option value="front-facing ID card style, shoulders and head, neutral expression, identity document standard">KTP / ID Card Style</option>
                <option value="passport-style headshot, shoulders up, neutral expression, white background">Passport Style</option>
                <option value="executive power pose, confident authoritative stance, half body, leadership presence">Executive Power Pose</option>
                <option value="3/4 body portrait, three-quarter length, confident stance, full professional look">3/4 Body Standing</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Ekspresi</label>
              <select class="form-select" id="pr-expression">
                <option value="confident direct eye contact, professional authority, trustworthy gaze">Percaya Diri + Direct Eye Contact</option>
                <option value="warm genuine professional smile with teeth, approachable friendly leadership">Senyum Hangat (Approachable)</option>
                <option value="friendly engaging smile, excellent teeth, high social likability, recruiter magnet">Friendly + Engaging Smile</option>
                <option value="serious authoritative expression, powerful executive presence, no smile">Serius + Autoritatif</option>
                <option value="neutral expression strong direct gaze, no smile, executive confident">Neutral Percaya Diri</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Pencahayaan</label>
              <select class="form-select" id="pr-lighting">
                <option value="studio_butterfly">Studio Butterfly (Glamour)</option>
                <option value="window_natural">Cahaya Jendela Natural</option>
                <option value="golden_hour">Golden Hour Outdoor</option>
                <option value="studio_high_key">High Key Terang</option>
                <option value="studio_rembrandt">Rembrandt (Dramatis)</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Lensa</label>
              <select class="form-select" id="pr-lens">
                <option value="85mm f/1.4 portrait prime, creamy background separation, classic flattering portrait">85mm f/1.4 — Portrait Classic</option>
                <option value="50mm f/1.4 standard prime, natural human perspective">50mm f/1.4 — Natural</option>
                <option value="100mm f/2.0 medium telephoto, flattering portrait compression">100mm f/2.0 — Flattering</option>
                <option value="135mm f/1.8 telephoto, beautiful subject separation, compressed">135mm f/1.8 — Compressed</option>
              </select>
            </div>
          </div>
        </div>
        <div class="gen-bottom">
          <button class="btn-generate" id="btn-gen-pr" onclick="startGenerate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="btn-gen-pr-label">Generate 4 Foto Profesional</span>
            <svg id="btn-gen-pr-spin" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="display:none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
        </div>
      </div><!-- /tab-profesional -->

      <!-- ══════════════ TAB: MATERNITY ══════════════ -->
      <div class="tab-content" id="tab-maternity">
        <div class="form-sec">
          <div class="form-sec-title">📷 Foto Referensi Wajah</div>
          <div class="upload-grid">
            <div>
              <div class="upload-top-lbl">Foto Wajah Bumil (Solo)</div>
              <div class="upload-relative">
                <div class="upload-box" id="upload-mt-face" onclick="triggerUpload('inp-mt-face')">
                  <input type="file" id="inp-mt-face" accept="image/*" style="display:none" onchange="handleUpload(this,'upload-mt-face')">
                  <svg class="upload-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span class="upload-label-txt">Foto wajah bumil</span>
                  <span class="upload-hint-txt">Kehamilan 7–9 bulan · JPG PNG · Max 5MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">👗 Outfit Maternity</div>
          <div class="form-field">
            <label class="form-label">Pilih Outfit</label>
            <select class="form-select" id="mt-outfit" onchange="checkCustom(this,'mt-outfit-c')">
              <optgroup label="── GAUN ELEGAN ──">
                <option value="wearing white flowing silk maternity gown, empire waist, elegant bare shoulder, pregnant belly prominent">Gaun Sutra Putih Mengalir</option>
                <option value="wearing blush pink tulle maternity ball gown, voluminous layered skirt, ethereal princess">Gaun Tulle Blush Pink</option>
                <option value="wearing champagne chiffon flowing maxi gown, off-shoulder, windswept flowing fabric">Gaun Chiffon Champagne</option>
                <option value="wearing deep burgundy velvet maternity gown, fitted top flowing skirt, dramatic jewel tone">Gaun Velvet Burgundy</option>
                <option value="wearing emerald green silk gown, one-shoulder, flowing full length, vibrant dramatic">Gaun Sutra Emerald</option>
                <option value="wearing navy dramatic maternity gown, flowing wide sleeves, powerful elegant">Gaun Navy Dramatis</option>
                <option value="wearing bold red maternity gown, dramatic statement, passionate confident mother">Gaun Merah Bold</option>
                <option value="wearing soft lavender flowing maternity dress, dreamy romantic, flower crown">Gaun Lavender + Flower Crown</option>
              </optgroup>
              <optgroup label="── BOHO & NATURAL ──">
                <option value="wearing boho floral print maxi dress, off shoulder, flowing relaxed pregnancy style">Boho Floral Maxi</option>
                <option value="wearing earth tone linen maternity dress, natural organic, relaxed bohemian pregnant">Linen Earth Tone Natural</option>
                <option value="wearing cream boho lace maternity dress, floral crown, natural field setting">Boho Lace Cream + Floral Crown</option>
              </optgroup>
              <optgroup label="── MINIMALIS MODERN ──">
                <option value="wearing all-white minimal maternity set, clean modern, showing pregnant belly">All-White Minimal Bersih</option>
                <option value="wearing fitted black maternity dress, minimal chic, contemporary, showing bump">Hitam Fitted Modern</option>
                <option value="wearing soft grey knit fitted maternity dress, cozy winter warm, belly visible">Grey Knit Cozy</option>
                <option value="wearing white crop top and flowing maxi skirt, showing pregnant belly, modern">Crop Top + Maxi Skirt</option>
              </optgroup>
              <optgroup label="── INDONESIA ──">
                <option value="wearing modern kebaya maternity version, Indonesian cultural pregnancy, elegant bump">Kebaya Maternity Modern</option>
                <option value="wearing batik wrap maternity dress, contemporary Indonesian, cultural pride">Batik Wrap Maternity</option>
                <option value="wearing flowing gamis maternity, modest Muslim pregnancy style, elegant">Gamis Maternity Elegan</option>
                <option value="wearing hijab with formal maternity dress, modest elegant pregnant Muslim woman">Hijab + Dress Maternity</option>
              </optgroup>
              <optgroup label="── HIGH FASHION ──">
                <option value="wearing couture editorial maternity outfit, high fashion pregnancy, magazine quality">Couture Editorial</option>
                <option value="wearing gold metallic maternity gown, glamorous shimmering, editorial fashion">Gaun Metallic Emas</option>
                <option value="wearing sheer fabric artistically draped over pregnant body, fine art maternity">Sheer Fabric Fine Art</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
            <input type="text" class="form-input-text custom-input" id="mt-outfit-c" placeholder="Contoh: gaun hijau emerald, kebaya putih, gamis pastel...">
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🌸 Background / Lokasi</div>
          <div class="form-field">
            <label class="form-label">Pilih Background</label>
            <select class="form-select" id="mt-background" onchange="checkCustom(this,'mt-bg-c')">
              <optgroup label="── STUDIO ──">
                <option value="clean white studio backdrop, soft box lighting, timeless minimalist maternity portrait">Studio Putih Minimalis</option>
                <option value="soft grey gradient studio, gentle wrap lighting, classic elegant maternity">Studio Abu Lembut</option>
                <option value="black backdrop, dramatic Rembrandt lighting, fine art moody maternity">Studio Hitam Fine Art</option>
                <option value="blush pink studio backdrop, soft feminine lighting, dreamy romantic maternity">Studio Blush Rose Dreamy</option>
                <option value="deep emerald velvet studio, luxurious rich tone, high-end maternity portrait">Studio Emerald Mewah</option>
                <option value="large window natural light, white curtain, soft diffused glow, intimate natural">Cahaya Jendela Natural</option>
              </optgroup>
              <optgroup label="── BUNGA & BOTANICAL ──">
                <option value="lush fresh flower arch, roses and peonies and greenery, romantic floral maternity">Gerbang Bunga Penuh</option>
                <option value="full fresh flower wall, pink and white blooms, Instagram aesthetic maternity">Dinding Bunga Pink</option>
                <option value="open flower field in bloom, wildflowers, sunlight through blooms, organic natural">Ladang Bunga Outdoor</option>
                <option value="bright sunflower field, warm golden sunlight, joyful happy maternity outdoor">Ladang Bunga Matahari</option>
                <option value="Provence-style lavender fields, purple haze, dreamy aromatic maternity outdoor">Ladang Lavender</option>
                <option value="cherry blossom sakura trees full bloom, pink petal shower, Japanese spring maternity">Pohon Sakura Mekar</option>
              </optgroup>
              <optgroup label="── ALAM OUTDOOR ──">
                <option value="tropical beach at golden hour, warm ocean light, silhouette sunset maternity">Pantai Sunset Golden Hour</option>
                <option value="lush green forest, dappled light through trees, organic natural maternity">Hutan Hijau Dappled</option>
                <option value="emerald rice terraces, Bali landscape, lush Indonesian natural maternity">Terasering Padi Bali</option>
                <option value="misty cool highland, soft fog rolling, mystical ethereal maternity outdoor">Highland Berkabut Ethereal</option>
              </optgroup>
              <optgroup label="── BOHO & ARTISTIK ──">
                <option value="macrame boho backdrop, pampas grass, dried flowers, earthy bohemian maternity">Boho Macramé + Pampas</option>
                <option value="sheer white fabric canopy overhead, gentle breeze, ethereal dreamy maternity">Kanopi Sheer Putih</option>
                <option value="vintage bathtub filled with floating flowers and petals, water maternity ethereal">Bathtub Bunga Mengambang</option>
                <option value="cozy prepared nursery, baby crib nearby, window light, intimate motherhood">Kamar Bayi Cozy</option>
              </optgroup>
              <optgroup label="── MODERN & URBAN ──">
                <option value="urban rooftop at sunset, city lights bokeh, modern contemporary maternity">Rooftop Sunset Modern</option>
                <option value="luxury home interior, marble floor, elegant furniture, high-end lifestyle maternity">Interior Mewah Luxe</option>
                <option value="luxury hotel suite, sheer curtains, natural window light, pampered maternity">Suite Hotel Mewah</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
            <input type="text" class="form-input-text custom-input" id="mt-bg-c" placeholder="Contoh: hutan bambu, taman bunga, studio gelap...">
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🤸 Pose Maternity</div>
          <div class="form-field">
            <label class="form-label">Pilih Pose</label>
            <select class="form-select" id="mt-pose">
              <option value="full body standing, both hands gently cradling pregnant belly, peaceful radiant expression">Full Body — Tangan Memeluk Perut</option>
              <option value="full body side profile, pregnant belly silhouette prominent, hands on bump, strong mother">Full Body — Profil Samping Siluet</option>
              <option value="full body silhouette against window light or sunset, pregnant belly profile, artistic shadow">Full Body — Siluet Backlit Artistik</option>
              <option value="full body standing, dramatic gown flowing in breeze, arms slightly out, cinematic maternity">Full Body — Gaun Mengalir Angin</option>
              <option value="full body walking slowly toward camera, gown flowing, confident natural stride">Full Body — Berjalan ke Kamera</option>
              <option value="full body spinning slowly, gown swirling around, joy and movement, maternity dance">Full Body — Berputar Joyful</option>
              <option value="full body standing in scenic outdoor, arms wide spread, embracing motherhood freedom">Full Body — Tangan Terbuka Lebar</option>
              <option value="wide landscape shot, small figure in vast scenic location, sense of scale and wonder">Wide Shot — Figure di Alam Terbuka</option>
              <option value="lying in field of flowers, side view, bump prominent, dreamy serene maternity">Berbaring di Ladang Bunga</option>
              <option value="seated elegantly on chair, hands folded on belly, formal maternity portrait">Duduk Elegan di Kursi</option>
              <option value="sitting on floor, legs to side, gown spreading around, relaxed bohemian maternity">Duduk di Lantai — Gaun Mengembang</option>
              <option value="3/4 body portrait showing full pregnant belly, glowing skin, radiant motherhood">3/4 Body — Glowing Radiant</option>
              <option value="extreme close-up of pregnant belly, hands cradling, intimate detail maternity portrait">Close-Up — Perut Detail</option>
              <option value="full body standing, looking down lovingly at belly, tender maternal connection">Full Body — Memandang Perut Penuh Cinta</option>
            </select>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🎨 Gaya Foto</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Pencahayaan</label>
              <select class="form-select" id="mt-lighting">
                <option value="golden_hour">Golden Hour</option>
                <option value="soft_morning">Pagi Lembut</option>
                <option value="window_natural">Cahaya Jendela</option>
                <option value="studio_low_key">Studio Low Key Moody</option>
                <option value="backlit_rim">Backlit Rim Light</option>
                <option value="candle_warm">Candlelight Hangat</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Color Grade</label>
              <select class="form-select" id="mt-grade">
                <option value="soft_pastel">Soft Pastel Dreamy</option>
                <option value="warm_cinematic">Warm Cinematic</option>
                <option value="dark_moody">Dark Moody Fine Art</option>
                <option value="bright_airy">Bright & Airy</option>
                <option value="bw_fine_art">Hitam Putih Fine Art</option>
                <option value="golden_film">Golden Film Nostalgic</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Gaya Foto</label>
              <select class="form-select" id="mt-style">
                <option value="fine art photography, painterly composition, gallery quality">Fine Art Photography</option>
                <option value="romantic photography, soft intimate light, love story visual">Romantic Photography</option>
                <option value="editorial fashion photography, magazine quality">Editorial Fashion</option>
                <option value="warm lifestyle photography, natural golden candid, real authentic">Warm Lifestyle</option>
                <option value="dark editorial, low-key dramatic, luxury fashion aesthetic">Dark Moody Editorial</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Lensa</label>
              <select class="form-select" id="mt-lens">
                <option value="85mm f/1.4 portrait prime, creamy background separation, classic portrait">85mm f/1.4 — Portrait</option>
                <option value="35mm f/1.4 wide prime, natural full body perspective, editorial lifestyle">35mm f/1.4 — Full Body</option>
                <option value="50mm f/1.2 prime lens, natural perspective, gorgeous bokeh">50mm f/1.2 — Natural</option>
                <option value="24-70mm f/2.8 professional zoom, versatile full body to portrait">24-70mm f/2.8 — Zoom</option>
                <option value="135mm f/1.8 telephoto, beautiful subject separation, compressed romantic">135mm f/1.8 — Compressed</option>
              </select>
            </div>
          </div>
        </div>
        <div class="gen-bottom">
          <button class="btn-generate" id="btn-gen-mt" onclick="startGenerate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="btn-gen-mt-label">Generate 4 Foto Maternity</span>
            <svg id="btn-gen-mt-spin" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="display:none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
        </div>
      </div><!-- /tab-maternity -->

      <!-- ══════════════ TAB: STUDIO KOREA ══════════════ -->
      <div class="tab-content" id="tab-studio_korea">
        <div class="form-sec">
          <div class="form-sec-title">👤 Mode Studio</div>
          <div style="display:flex;gap:8px;">
            <button class="mode-btn active" data-mode="solo_wanita" onclick="setStudioKoreaMode('solo_wanita',this)" style="flex:1;padding:9px 0;border-radius:10px;border:1.5px solid #1FA6B5;background:rgba(31,166,181,0.1);color:#0E8EA0;font-family:'Roboto Mono',monospace;font-size:12px;font-weight:500;cursor:pointer;">Wanita</button>
            <button class="mode-btn" data-mode="solo_pria" onclick="setStudioKoreaMode('solo_pria',this)" style="flex:1;padding:9px 0;border-radius:10px;border:1.5px solid #EEF3F5;background:#F9FAFB;color:#A7B0B5;font-family:'Roboto Mono',monospace;font-size:12px;font-weight:500;cursor:pointer;">Pria</button>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">📷 Foto Referensi Wajah</div>
          <div class="upload-grid">
            <div>
              <div class="upload-top-lbl" id="sk-upload-lbl">Foto Wajah Kamu</div>
              <div class="upload-relative">
                <div class="upload-box" id="upload-sk-face" onclick="triggerUpload('inp-sk-face')">
                  <input type="file" id="inp-sk-face" accept="image/*" style="display:none" onchange="handleUpload(this,'upload-sk-face')">
                  <svg class="upload-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span class="upload-label-txt">Klik atau drag foto wajah</span>
                  <span class="upload-hint-txt">JPG PNG WEBP · Max 5MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">👗 Outfit Studio Korea</div>
          <div class="form-field" id="sk-outfit-female-wrap">
            <label class="form-label">Outfit Wanita</label>
            <select class="form-select" id="sk-outfit-female" onchange="checkCustom(this,'sk-outfit-c')">
              <optgroup label="── PUTIH & CLEAN ──">
                <option value="wearing white puff sleeve mini dress, pearl accessories, classic Korean studio style">White Puff Sleeve Mini Dress</option>
                <option value="wearing simple white A-line midi dress, minimalist clean, soft Korean aesthetic">White A-Line Midi Clean</option>
                <option value="wearing white lace detail midi dress, delicate feminine, Korean elegant">White Lace Detail Midi</option>
                <option value="wearing white corset top and white tulle skirt, Korean bridal studio fashion">White Corset + Tulle Skirt</option>
                <option value="wearing ivory satin slip dress, simple elegant, Korean understated chic">Ivory Satin Slip Dress</option>
              </optgroup>
              <optgroup label="── PASTEL KOREA ──">
                <option value="wearing soft blush pink chiffon midi dress, feminine sweet K-drama style">Blush Pink Chiffon Midi</option>
                <option value="wearing powder blue pleated midi dress, fresh clean Korean feminine">Powder Blue Pleated Midi</option>
                <option value="wearing lavender A-line dress, soft dreamy, Korean romantic aesthetic">Lavender A-Line Dreamy</option>
                <option value="wearing mint green satin dress, fresh and modern Korean studio style">Mint Green Satin Modern</option>
                <option value="wearing peach silk midi dress, soft warm Korean feminine aesthetic">Peach Silk Feminine</option>
              </optgroup>
              <optgroup label="── BRIDAL KOREA ──">
                <option value="wearing white Korean wedding studio gown, layered tulle, elegant traditional Korean bridal">Korean Wedding Studio Gown</option>
                <option value="wearing princess-style ball gown, full layered skirt, flowers, Korean studio">Princess Ball Gown</option>
                <option value="wearing fitted mermaid dress, trailing detail, sophisticated Korean studio">Mermaid Studio Elegant</option>
                <option value="wearing modern fusion hanbok, contemporary Korean traditional bridal dress">Hanbok Modern Fusion</option>
              </optgroup>
              <optgroup label="── DARK & MOODY ──">
                <option value="wearing deep navy evening dress, sophisticated, dark Korean editorial">Navy Evening Sophisticated</option>
                <option value="wearing black minimal slip dress, modern Korean minimal editorial">Black Minimal Editorial</option>
                <option value="wearing burgundy velvet mini dress, moody K-drama style">Burgundy Velvet K-Drama</option>
                <option value="wearing forest green satin wrap dress, dramatic Korean editorial">Forest Green Dramatic</option>
              </optgroup>
              <optgroup label="── TRENDY GEN Z ──">
                <option value="wearing oversized cream cable knit sweater, pleated midi skirt, cozy Korean autumn aesthetic">Cable Knit + Pleated Skirt</option>
                <option value="wearing oversized blazer as dress, belt cinched, Korean power minimal aesthetic">Oversized Blazer Dress</option>
                <option value="wearing pink power suit women, bold Korean fashion editorial">Pink Power Suit</option>
                <option value="wearing floral print mini dress, playful feminine Korean street style">Floral Mini Playful</option>
                <option value="wearing pastel plaid co-ord set, cute Korean campus collegiate fashion">Pastel Plaid Co-ord Cute</option>
              </optgroup>
              <optgroup label="── HANBOK ──">
                <option value="wearing modern hanbok fusion dress, contemporary Korean traditional cultural chic">Hanbok Modern Fusion</option>
                <option value="wearing casual everyday hanbok, simplified Korean traditional lifestyle dress">Hanbok Casual Everyday</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
          </div>
          <div class="form-field" id="sk-outfit-male-wrap" style="display:none">
            <label class="form-label">Outfit Pria</label>
            <select class="form-select" id="sk-outfit-male" onchange="checkCustom(this,'sk-outfit-c')">
              <optgroup label="── FORMAL KOREA ──">
                <option value="wearing white slim-fit groom suit, white shirt, white tie, elegant Korean groom studio">White Slim Suit Korean</option>
                <option value="wearing light grey slim Korean suit, white shirt, no tie, clean minimal">Grey Slim Suit Minimal</option>
                <option value="wearing navy slim suit, white shirt, pocket square, Korean formal">Navy Slim Suit Formal</option>
                <option value="wearing black tuxedo, white shirt, black bow tie, Korean groom classic">Black Tuxedo Classic</option>
                <option value="wearing pastel lavender slim suit, Korean fashion forward editorial">Pastel Suit Fashion</option>
              </optgroup>
              <optgroup label="── CASUAL KOREA ──">
                <option value="wearing clean white fitted t-shirt, dark slim jeans, Korean casual minimal editorial">White T-Shirt + Slim Jeans</option>
                <option value="wearing oversized cream knit sweater, wide-leg trousers, cozy Korean aesthetic">Oversized Cream Knit Cozy</option>
                <option value="wearing dark turtleneck, slim trousers, Korean intellectual minimal">Dark Turtleneck Minimal</option>
                <option value="wearing minimalist navy blazer, clean shirt, Korean smart casual">Minimalist Blazer Smart</option>
                <option value="wearing denim jacket, white shirt, dark jeans, Korean smart casual editorial">Denim Smart Casual</option>
              </optgroup>
              <optgroup label="── HANBOK ──">
                <option value="wearing modern men hanbok fusion, contemporary Korean traditional male dress">Hanbok Male Modern</option>
                <option value="wearing traditional Korean groom hanbok, jeogori, dignified cultural formal">Hanbok Groom Traditional</option>
              </optgroup>
              <optgroup label="── EDITORIAL ──">
                <option value="wearing all-black Korean editorial, black slim shirt, black tailored trousers, fashion forward">All Black Editorial</option>
                <option value="wearing earth tone coordinated Korean outfit, terracotta, warm natural aesthetic">Earth Tones Coordinated</option>
                <option value="wearing bold colorful Korean fashion, statement bright outfit, Gen Z Korean style">Bold Colorful Gen Z</option>
              </optgroup>
              <optgroup label="── CUSTOM ──">
                <option value="custom">✏️ Tulis sendiri...</option>
              </optgroup>
            </select>
          </div>
          <input type="text" class="form-input-text custom-input" id="sk-outfit-c" placeholder="Contoh: gaun merah dramatic, suit putih slim, hanbok biru...">
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🏙️ Background Studio Korea</div>
          <div class="form-field">
            <label class="form-label">Tema Background</label>
            <select class="form-select" id="sk-background">
              <optgroup label="── MINIMAL CLEAN ──">
                <option value="pure white seamless backdrop, clean natural studio light, classic Korean studio minimal">Putih Murni Korea</option>
                <option value="warm cream off-white backdrop, soft wrap light, inviting Korean studio warmth">Krem Lembut Hangat</option>
                <option value="very pale grey gradient, minimal contemporary, Seoul studio modern aesthetic">Abu Pucat Contemporary</option>
                <option value="stark pure black backdrop, single key light, dramatic moody K-drama dark">Hitam Murni Moody K-Drama</option>
                <option value="deep navy blue backdrop, sophisticated Korean editorial, nocturnal chic">Navy Dalam Sophisticated</option>
              </optgroup>
              <optgroup label="── DINDING BUNGA (Korean Signature) ──">
                <option value="full pink flower wall, roses and blooms, iconic Korean studio floral backdrop">Dinding Bunga Pink (Iconic Korea)</option>
                <option value="all-white flower wall, elegant pure floral, Korean studio classic">Dinding Bunga Putih Elegan</option>
                <option value="mixed colorful flower wall, vibrant blooms, Korean studio celebration">Dinding Bunga Mix Colorful</option>
                <option value="lavender and purple flower wall, dreamy romantic Korean studio">Dinding Lavender Dreamy</option>
                <option value="large peony flowers backdrop, soft lush florals, romantic feminine Korean studio">Backdrop Peony Romantic</option>
                <option value="hanging flower installations from ceiling, botanical dream, Korean studio overhead">Bunga Gantung dari Langit</option>
              </optgroup>
              <optgroup label="── EROPA (Korean Studio Style) ──">
                <option value="European chateau interior, ornate arched windows, gilded frames, Korean luxury studio set">Chateau Eropa Interior</option>
                <option value="French vintage interior, antique furniture, soft muted tones, Korean romantic France set">Vintage Prancis Romantic</option>
                <option value="baroque gold ornate wall molding, grand classical architecture, Korean luxury studio">Dinding Baroque Emas Mewah</option>
                <option value="Parisian balcony studio set, iron railing, soft Paris light, Korean romantic Europe">Balkon Paris K-Style</option>
                <option value="English garden indoor studio set, roses, stone wall, romantic British garden Korea">Taman Inggris Indoor</option>
              </optgroup>
              <optgroup label="── ALAM INDOOR ──">
                <option value="indoor forest birch tree set, tall white trees, dappled light, Korean nature studio">Set Hutan Indoor (Birch Trees)</option>
                <option value="indoor cherry blossom sakura set, pink blossoms, Japanese spring, Korean studio">Set Sakura Indoor Spring</option>
                <option value="bamboo indoor set, minimalist Japanese aesthetic, zen calm Korean studio">Set Bambu Zen Japanese</option>
                <option value="indoor autumn maple leaves set, orange red foliage, warm Korean fall studio">Set Maple Autumn Warm</option>
                <option value="indoor pine forest set, evergreen trees, cool northern aesthetic, Korean studio">Set Hutan Pinus Northern</option>
              </optgroup>
              <optgroup label="── SET FURNITURE & PROPS ──">
                <option value="pure white modern staircase, architectural clean lines, iconic Korean studio staircase set">Tangga Putih Elegan (Iconic Korea)</option>
                <option value="white arched doorway, clean minimal Korean studio architectural set">Pintu Lengkung Putih</option>
                <option value="vintage chesterfield sofa, elegant props, classic Korean studio portrait set">Sofa Vintage Chesterfield</option>
                <option value="white window seat, soft curtains, natural-look light, intimate Korean studio">Kursi Jendela Putih</option>
                <option value="curated bookshelf backdrop, cozy intellectual, Korean studio book concept">Rak Buku Cozy</option>
                <option value="large ornate mirror, reflection composition, artistic Korean studio portrait">Cermin Ornate Refleksi</option>
                <option value="garden swing set, blooms around, romantic whimsical Korean studio outdoor set">Ayunan Taman Whimsical</option>
                <option value="sheer white curtains with backlight, ethereal dreamy, Korean studio romantic light">Tirai Sheer Cahaya Ethereal</option>
              </optgroup>
              <optgroup label="── COLOR BLOCK ──">
                <option value="sage green solid color block backdrop, contemporary Korean fashion editorial">Sage Green Block</option>
                <option value="dusty pink solid color backdrop, feminine Korean fashion studio">Pink Dusty Block</option>
                <option value="powder blue solid color backdrop, fresh Korean studio fashion editorial">Powder Blue Block Fresh</option>
                <option value="terracotta warm solid backdrop, earthy Korean editorial fashion">Terracotta Block Earthy</option>
                <option value="forest green solid color backdrop, bold Korean editorial studio">Forest Green Bold</option>
                <option value="mustard yellow solid backdrop, bold warm Korean editorial, trendy">Mustard Yellow Trendy</option>
              </optgroup>
            </select>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🤸 Pose Studio Korea</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Pose</label>
              <select class="form-select" id="sk-pose">
                <option value="full body standing, confident natural posture, direct camera gaze, Korean portrait">Full Body — Standing Percaya Diri</option>
                <option value="full body standing, one hand on hip naturally, Korean fashion editorial pose">Full Body — Satu Tangan di Pinggul</option>
                <option value="full body walking slowly toward camera, confident stride, Korean editorial">Full Body — Berjalan ke Kamera</option>
                <option value="full body spinning slowly, dress or fabric swirling, joyful movement, Korean studio">Full Body — Berputar Swirl</option>
                <option value="full body, one hand holding dress hem elegantly, posed feminine Korean studio">Full Body — Pegang Hem Gaun</option>
                <option value="full body walking away, looking back over shoulder, coy elegant Korean style">Full Body — Menoleh ke Belakang</option>
                <option value="full body standing, arms slightly out at sides, floating natural, Korean fine art">Full Body — Tangan Melayang Natural</option>
                <option value="full body seated on floor, legs to side, gown spreading, Korean studio elegant">Full Body — Duduk di Lantai</option>
                <option value="full body seated on white staircase steps, legs together, architectural Korean">Full Body — Duduk di Tangga</option>
                <option value="full body seated on chair elegantly, upright, Korean portrait formal">Full Body — Duduk di Kursi Elegan</option>
                <option value="full body on swing, mid-swing moment, joyful dynamic Korean outdoor set">Full Body — Di Ayunan</option>
                <option value="3/4 body facing camera, three-quarter length, natural stance, Korean studio">3/4 Body — Menghadap Kamera</option>
                <option value="3/4 body slight side profile, elegant angular Korean editorial">3/4 Body — Profil Samping</option>
                <option value="close-up beauty portrait, face and shoulders, K-beauty dewy glow, Korean studio">Close-Up — K-Beauty Portrait</option>
                <option value="holding flower near face, soft expression, iconic Korean studio romantic pose">Pegang Bunga Dekat Wajah (Iconic)</option>
                <option value="both hands gently under chin, cute sweet Korean studio expression pose">Dua Tangan di Dagu (Cute Korea)</option>
                <option value="looking over shoulder at camera, confident, Korean fashion editorial">Menoleh Bahu — Korean Fashion</option>
                <option value="seated reading book elegantly, intellectual Korean studio lifestyle pose">Duduk Membaca Buku Elegan</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Etnis</label>
              <select class="form-select" id="sk-ethnicity">
                <option value="korean_f">Korea Wanita</option>
                <option value="korean_m">Korea Pria</option>
                <option value="indonesian_f">Indonesia Wanita</option>
                <option value="indonesian_m">Indonesia Pria</option>
                <option value="chinese_indo_f">Chinese-Indo Wanita</option>
                <option value="sea_f">Asia Tenggara Wanita</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-sec">
          <div class="form-sec-title">🎨 Gaya Foto</div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Pencahayaan</label>
              <select class="form-select" id="sk-lighting">
                <option value="studio_butterfly">Studio Butterfly Glamour</option>
                <option value="window_natural">Cahaya Jendela Natural</option>
                <option value="studio_high_key">High Key Terang K-Beauty</option>
                <option value="studio_rembrandt">Rembrandt Dramatis</option>
                <option value="backlit_rim">Backlit Rim Light</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Color Grade</label>
              <select class="form-select" id="sk-grade">
                <option value="korea_soft">Korean Soft Dewy (K-Beauty)</option>
                <option value="bright_airy">Bright & Airy Clean</option>
                <option value="bw_fine_art">Hitam Putih Timeless</option>
                <option value="dark_moody">Dark Moody K-Drama</option>
                <option value="soft_pastel">Soft Pastel Dreamy</option>
                <option value="dark_luxury">Dark Luxury Editorial</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Lensa</label>
              <select class="form-select" id="sk-lens">
                <option value="85mm f/1.4 portrait prime, creamy background separation, classic portrait">85mm f/1.4 — Portrait Creamy</option>
                <option value="35mm f/1.4 wide prime, natural full body perspective, editorial lifestyle">35mm f/1.4 — Full Body Natural</option>
                <option value="50mm f/1.2 prime lens, natural perspective, gorgeous bokeh">50mm f/1.2 — Natural Bokeh</option>
                <option value="24-70mm f/2.8 professional zoom, versatile full body to portrait">24-70mm f/2.8 — Zoom</option>
                <option value="135mm f/1.8 telephoto, beautiful subject separation, compressed">135mm f/1.8 — Compressed</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Kamera</label>
              <select class="form-select" id="sk-camera">
                <option value="shot on Hasselblad X2D 100C medium format">Hasselblad X2D (Ultra Detail)</option>
                <option value="shot on Sony A7R V 61MP full frame">Sony A7R V</option>
                <option value="shot on Fujifilm GFX 100S medium format">Fujifilm GFX 100S</option>
                <option value="shot on Canon EOS R5 45MP">Canon EOS R5</option>
              </select>
            </div>
          </div>
        </div>
        <div class="gen-bottom">
          <button class="btn-generate" id="btn-gen-sk" onclick="startGenerate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="btn-gen-sk-label">Generate 4 Foto Studio Korea</span>
            <svg id="btn-gen-sk-spin" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="display:none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
        </div>
      </div><!-- /tab-studio_korea -->

      <!-- KEEP existing tab-prewedding and tab-wedding content as-is,
           but change their first-div class from "active" to "" (no active class)
           and ensure IDs are still id="tab-prewedding" and id="tab-wedding" -->

      <!-- DELETE tab-engagement and tab-family entirely -->

    </div><!-- /gen-left -->
```

════════════════════════════════════════════════════════════
CHANGE 5 — Update JavaScript: CATEGORY_MODIFIERS
════════════════════════════════════════════════════════════

Find:
```javascript
const CATEGORY_MODIFIERS = {
  prewedding: `romantic couple photography, love story session, engagement editorial, soft romantic atmosphere`,
  wedding:    `wedding photography, bridal portrait, elegant ceremony, luxury wedding editorial`,
  engagement: `casual couple portrait, lifestyle engagement, modern couple photography, natural candid`,
  studio:     `professional studio photography, controlled studio lighting, fashion editorial, clean studio setup`,
  family:     `family portrait photography, warm family lifestyle, natural family candid, heartfelt family session`,
};
```

Replace with:
```javascript
const CATEGORY_MODIFIERS = {
  wisuda:       'graduation photography, academic achievement, milestone portrait, proud graduation moment, university graduate',
  profesional:  'professional headshot photography, corporate portrait, personal branding, clean studio quality, LinkedIn ready',
  maternity:    'maternity photography, pregnancy portrait, glowing mother-to-be, beautiful baby bump, 7-9 months pregnant',
  studio_korea: 'Korean studio photography, K-drama aesthetic, studio portrait, clean minimalist Korean style, beauty editorial',
  prewedding:   'romantic couple photography, love story session, prewedding editorial, soft romantic atmosphere, genuine connection',
  wedding:      'wedding photography, bridal portrait, elegant ceremony, luxury wedding editorial, timeless romantic',
};
```

════════════════════════════════════════════════════════════
CHANGE 6 — Update JavaScript: AppState currentTab
════════════════════════════════════════════════════════════

Find `currentTab: 'prewedding'` in the AppState object.
Replace with: `currentTab: 'wisuda'`

Also find any line that says `switchTab('prewedding')` in DOMContentLoaded.
Replace with: `switchTab('wisuda')`

════════════════════════════════════════════════════════════
CHANGE 7 — Add setStudioKoreaMode JS function
════════════════════════════════════════════════════════════

Find the existing `setStudioMode` function (or add after `switchTab` function if not exists).
Add this new function:

```javascript
function setStudioKoreaMode(mode, btn) {
  AppState.studioMode = mode;
  document.querySelectorAll('[data-mode]').forEach(b => {
    if (b.closest('#tab-studio_korea')) {
      const isActive = b === btn;
      b.style.background = isActive ? 'rgba(31,166,181,0.1)' : '#F9FAFB';
      b.style.borderColor = isActive ? '#1FA6B5' : '#EEF3F5';
      b.style.color = isActive ? '#0E8EA0' : '#A7B0B5';
    }
  });
  const lbl = document.getElementById('sk-upload-lbl');
  if (lbl) lbl.textContent = mode === 'solo_pria' ? 'Foto Wajah Pria' : 'Foto Wajah Wanita';
  const fw = document.getElementById('sk-outfit-female-wrap');
  const mw = document.getElementById('sk-outfit-male-wrap');
  if (fw) fw.style.display = mode === 'solo_pria' ? 'none' : '';
  if (mw) mw.style.display = mode === 'solo_pria' ? '' : 'none';
}
```

════════════════════════════════════════════════════════════
CHANGE 8 — Update startGenerate() for new menus
════════════════════════════════════════════════════════════

In startGenerate(), find the section where it detects the current tab and collects face files / builds prompt. Update the tab detection logic to handle the 4 new tabs.

Find the block that references `AppState.currentTab` and the switch/if for tabs. After reading the existing logic, add cases for wisuda, profesional, maternity, studio_korea:

```javascript
// Inside startGenerate, update/add these cases:
const tab = AppState.currentTab;

let faceFileId = null;
if      (tab === 'wisuda')       faceFileId = 'upload-ws-face';
else if (tab === 'profesional')  faceFileId = 'upload-pr-face';
else if (tab === 'maternity')    faceFileId = 'upload-mt-face';
else if (tab === 'studio_korea') faceFileId = 'upload-sk-face';
else if (tab === 'prewedding')   faceFileId = null; // couple — handled separately
else if (tab === 'wedding')      faceFileId = null; // couple — handled separately

const soloMenus = ['wisuda','profesional','maternity','studio_korea'];
const coupleMenus = ['prewedding','wedding'];
```

════════════════════════════════════════════════════════════
CHANGE 9 — Update PromptBuilder to handle new menus
════════════════════════════════════════════════════════════

Find the PromptBuilder object (or the prompt building function). Add build cases for each new menu.

The PromptBuilder.build(tab) function should handle tab values: 'wisuda', 'profesional', 'maternity', 'studio_korea'.

For each new tab, read select values and concatenate into a descriptive English prompt string.

Add this build function for new solo menus:

```javascript
function buildSoloPrompt(tab) {
  const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const getCustom = (selectId, customId) => {
    const v = get(selectId);
    return v === 'custom' ? get(customId) : v;
  };

  const SUBJECT_MAP = {
    indonesian_f:'beautiful Indonesian woman, warm golden skin, dark lustrous hair',
    indonesian_m:'handsome Indonesian man, warm skin tone, dark neat hair',
    javanese_f:'beautiful Javanese woman, graceful refined features, warm complexion',
    chinese_indo_f:'beautiful Chinese-Indonesian woman, fair porcelain skin',
    chinese_indo_m:'handsome Chinese-Indonesian man, fair skin, sharp features',
    korean_f:'beautiful Korean woman, fair dewy skin, K-beauty natural makeup',
    korean_m:'handsome Korean man, fair clean skin, K-drama style',
    sea_f:'beautiful Southeast Asian woman, warm tan skin, graceful',
    sea_m:'handsome Southeast Asian man, warm tan skin',
  };

  const LIGHTING_MAP = {
    golden_hour:'warm golden hour sunlight, elongated soft shadows, magic hour glow',
    soft_morning:'gentle morning diffused light, dewy fresh atmosphere',
    window_natural:'natural window side light, soft diffused organic indoor',
    studio_butterfly:'butterfly glamour studio lighting, symmetrical catchlight in eyes',
    studio_high_key:'high-key soft box, bright even shadow-free, clean beauty lighting',
    studio_rembrandt:'Rembrandt dramatic side lighting, painterly triangle shadow',
    studio_low_key:'low-key single dramatic light, deep shadows, fine art moody',
    backlit_rim:'backlit rim light, glowing outline, hair light halo contre-jour',
    candle_warm:'warm candlelight intimate, amber glow, romantic soft orange',
    overcast_soft:'overcast sky, soft diffused natural light, no harsh shadows',
  };

  const GRADE_MAP = {
    warm_cinematic:'warm cinematic color grade, golden honey tones, film-like warmth',
    bright_airy:'bright and airy, clean lifted whites, soft light-filled ethereal',
    soft_pastel:'soft pastel muted palette, dreamy washed colors, romantic',
    dark_moody:'dark and moody, deep rich shadows, high contrast, cinematic blacks',
    bw_fine_art:'black and white fine art, rich silver gelatin tones, timeless',
    neutral_film:'neutral true-to-life film grain, organic texture, authentic',
    korea_soft:'Korean aesthetic soft grade, slightly lifted, dewy bright skin, K-beauty',
    golden_film:'warm golden film tones, vintage warmth, nostalgic analog glow',
    dark_luxury:'dark luxury editorial, velvet blacks, rich sophisticated tone',
  };

  const AUTO = 'ultra realistic, photorealistic, 8k resolution, professional photography, sharp focus, high detail skin texture, depth of field, bokeh, full frame camera, RAW photo, HDR, realistic skin tones, no text, no watermark, no logo';

  if (tab === 'wisuda') {
    const subject = SUBJECT_MAP[get('ws-ethnicity')] || SUBJECT_MAP.indonesian_f;
    const outfit  = getCustom('ws-outfit','ws-outfit-c');
    const bg      = getCustom('ws-background','ws-bg-c');
    const pose    = get('ws-pose');
    const props   = get('ws-props');
    const light   = LIGHTING_MAP[get('ws-lighting')] || LIGHTING_MAP.golden_hour;
    const grade   = GRADE_MAP[get('ws-grade')] || GRADE_MAP.bright_airy;
    const lens    = get('ws-lens') || '35mm f/1.4 wide prime, natural full body portrait';
    return [subject, pose, outfit, bg, light, props, grade, lens, 'shot on Canon EOS R5', 'editorial lifestyle graduation photography', CATEGORY_MODIFIERS.wisuda, AUTO].filter(Boolean).join(', ');
  }

  if (tab === 'profesional') {
    const subject = SUBJECT_MAP[get('pr-ethnicity')] || SUBJECT_MAP.indonesian_f;
    const outfit  = getCustom('pr-outfit','pr-outfit-c');
    const bg      = get('pr-background');
    const shot    = get('pr-shot');
    const expr    = get('pr-expression');
    const light   = LIGHTING_MAP[get('pr-lighting')] || LIGHTING_MAP.studio_butterfly;
    const lens    = get('pr-lens') || '85mm f/1.4 portrait prime';
    return [subject, shot, outfit, bg, light, expr, grade, lens, 'shot on Canon EOS R5', 'professional headshot photography, personal branding portrait, LinkedIn quality', CATEGORY_MODIFIERS.profesional, AUTO].filter(Boolean).join(', ');
  }

  if (tab === 'maternity') {
    const subject = (SUBJECT_MAP[get('mt-ethnicity')] || SUBJECT_MAP.indonesian_f) + ', visibly pregnant 7-9 months, beautiful radiant pregnant belly';
    const outfit  = getCustom('mt-outfit','mt-outfit-c');
    const bg      = getCustom('mt-background','mt-bg-c');
    const pose    = get('mt-pose');
    const light   = LIGHTING_MAP[get('mt-lighting')] || LIGHTING_MAP.golden_hour;
    const grade   = GRADE_MAP[get('mt-grade')] || GRADE_MAP.soft_pastel;
    const style   = get('mt-style') || 'fine art photography, painterly composition';
    const lens    = get('mt-lens') || '85mm f/1.4 portrait prime';
    return [subject, pose, outfit, bg, light, 'radiant glowing pregnant expression, serene maternal joy, peaceful anticipation', grade, style, lens, 'shot on Sony A7R V', CATEGORY_MODIFIERS.maternity, AUTO].filter(Boolean).join(', ');
  }

  if (tab === 'studio_korea') {
    const mode    = AppState.studioMode || 'solo_wanita';
    const ethKey  = get('sk-ethnicity');
    const subject = SUBJECT_MAP[ethKey] || (mode === 'solo_pria' ? SUBJECT_MAP.korean_m : SUBJECT_MAP.korean_f);
    const outfit  = mode === 'solo_pria' ? getCustom('sk-outfit-male','sk-outfit-c') : getCustom('sk-outfit-female','sk-outfit-c');
    const bg      = get('sk-background');
    const pose    = get('sk-pose');
    const light   = LIGHTING_MAP[get('sk-lighting')] || LIGHTING_MAP.studio_butterfly;
    const grade   = GRADE_MAP[get('sk-grade')] || GRADE_MAP.korea_soft;
    const lens    = get('sk-lens') || '85mm f/1.4 portrait prime';
    const cam     = get('sk-camera') || 'shot on Hasselblad X2D';
    return [subject, pose, outfit, bg, light, 'soft natural Korean beauty expression, dewy glowing skin, K-drama mood', grade, lens, cam, 'Korean studio photography, K-drama aesthetic, fashion editorial', CATEGORY_MODIFIERS.studio_korea, AUTO].filter(Boolean).join(', ');
  }

  return '';
}
```

Then update startGenerate() to call buildSoloPrompt(tab) for solo menus.

════════════════════════════════════════════════════════════
CHANGE 10 — Update Account view: generator list
════════════════════════════════════════════════════════════

Find the AKSES GENERATOR section in the account view (lines containing ✓ Prewedding, ✓ Wedding etc.).
Replace with:
```html
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">🎓 Wisuda</span></div>
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">💼 Profesional</span></div>
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">🤰 Maternity</span></div>
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">🇰🇷 Studio Korea</span></div>
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">💍 Prewedding</span></div>
<div style="display:flex;align-items:center;gap:10px;"><span style="color:#10B981;">&#10003;</span><span style="font-family:'Inter',sans-serif;font-size:13.5px;color:#1E2A2F;">👰 Wedding</span></div>
```

Also update the plan-badge-sub text from "Akses semua 5 generator" to "Akses semua 6 generator".

════════════════════════════════════════════════════════════
AFTER ALL CHANGES — Verify and Test
════════════════════════════════════════════════════════════

1. Save app.html
2. Run: open app.html
3. Verify:
   - Tab bar shows: 🎓 Wisuda | 💼 Profesional | 🤰 Maternity | 🇰🇷 Studio Korea | 💍 Prewedding | 👰 Wedding
   - Clicking each tab shows its form with full dropdowns
   - Dashboard shows 6 category cards
   - Sidebar submenu shows 6 items
   - Studio Korea has Wanita/Pria mode toggle
   - Account page shows 6 generators

If any tab form is empty or missing, re-check that the gen-left replacement was complete.
