/**
 * share/sharePage.js
 *
 * Renders the public HTML share page for a single generated image.
 * Used when a share record exists in SHARE_KV.
 *
 * Includes OpenGraph + Twitter Card meta tags so WhatsApp, Instagram,
 * Twitter, and Telegram all render a rich link preview.
 *
 * Function:
 *   renderSharePage(shareId, metadata) → HTML string
 *
 * @param {string} shareId  — the share ID (from URL path)
 * @param {object} metadata — SHARE_KV record: { user_id, image_url, prompt, created_at, views }
 * @returns {string}        — full HTML document
 */

const SITE_URL    = 'https://potretai.studiocreative.id';
const OG_TITLE    = 'Foto AI Profesional — PotretAI';
const OG_DESC     = 'Lihat foto AI profesional yang dibuat di PotretAI — AI Photography Studio Indonesia.';

export function renderSharePage(shareId, metadata) {
  const imageUrl  = metadata.image_url || '';
  const shareUrl  = `${SITE_URL}/share/${shareId}`;
  const views     = metadata.views || 0;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${OG_TITLE}</title>
  <meta name="description" content="${OG_DESC}">

  <!-- OpenGraph — WhatsApp, Facebook, Instagram, Telegram -->
  <meta property="og:title"       content="${OG_TITLE}">
  <meta property="og:description" content="${OG_DESC}">
  <meta property="og:image"       content="${imageUrl}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1280">
  <meta property="og:url"         content="${shareUrl}">
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="PotretAI">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${OG_TITLE}">
  <meta name="twitter:description" content="${OG_DESC}">
  <meta name="twitter:image"       content="${imageUrl}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Inter, sans-serif;
      background: #1E2A2F;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 16px 60px;
    }

    /* ── Header ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .brand-dot {
      width: 10px; height: 10px;
      background: #1FA6B5;
      border-radius: 50%;
    }
    .brand-name {
      font-family: Montserrat, sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1FA6B5;
      letter-spacing: .04em;
    }

    /* ── Card ── */
    .card {
      background: #253238;
      border-radius: 16px;
      overflow: hidden;
      max-width: 480px;
      width: 100%;
      box-shadow:
        0 1px 2px rgba(14,142,160,.06),
        0 6px 20px rgba(14,142,160,.12),
        0 24px 48px rgba(14,142,160,.08);
    }

    /* ── Image ── */
    .img-wrap {
      position: relative;
      display: block;
      width: 100%;
      background: #1E2A2F;
      border-bottom: 1.5px solid #0E8EA030;
    }
    .img-wrap img {
      width: 100%;
      display: block;
      object-fit: cover;
    }
    .views-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(14,142,160,.85);
      backdrop-filter: blur(4px);
      color: #fff;
      font-size: .7rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: .02em;
    }

    /* ── Body ── */
    .card-body {
      padding: 24px 24px 28px;
    }
    .card-title {
      font-family: Montserrat, sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }
    .card-sub {
      color: #A7B0B5;
      font-size: .85rem;
      margin-bottom: 20px;
    }

    /* ── Actions ── */
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn-primary {
      flex: 1;
      background: #1FA6B5;
      color: #fff;
      text-align: center;
      padding: 11px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: .875rem;
      transition: background .2s cubic-bezier(.34,1.56,.64,1), transform .15s cubic-bezier(.34,1.56,.64,1);
      display: block;
    }
    .btn-primary:hover  { background: #0E8EA0; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-secondary {
      background: #1E2A2F;
      color: #A7B0B5;
      padding: 11px 14px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      font-size: .875rem;
      border: 1.5px solid #2E3E45;
      transition: border-color .2s, color .2s;
      white-space: nowrap;
    }
    .btn-secondary:hover { border-color: #1FA6B5; color: #1FA6B5; }

    /* ── Footer ── */
    .footer {
      margin-top: 28px;
      color: #A7B0B5;
      font-size: .78rem;
      text-align: center;
    }
    .footer a { color: #1FA6B5; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <div class="brand">
    <span class="brand-dot"></span>
    <span class="brand-name">PotretAI</span>
  </div>

  <div class="card">
    <a class="img-wrap" href="${imageUrl}" target="_blank" rel="noopener">
      <img src="${imageUrl}" alt="Foto AI — PotretAI" loading="eager">
      <span class="views-badge">👁 ${views} views</span>
    </a>
    <div class="card-body">
      <div class="card-title">✦ Generated with PotretAI</div>
      <div class="card-sub">AI Photography Studio · Foto profesional instan</div>
      <div class="actions">
        <a class="btn-primary" href="${SITE_URL}" target="_blank" rel="noopener">
          Generate Your Own AI Photo →
        </a>
        <a class="btn-secondary" href="${imageUrl}" download="potretai-${shareId}.jpg">
          ⬇ Save
        </a>
      </div>
    </div>
  </div>

  <div class="footer">
    Dibuat dengan <a href="${SITE_URL}">PotretAI</a> — AI Photography Studio Indonesia
  </div>

</body>
</html>`;
}
