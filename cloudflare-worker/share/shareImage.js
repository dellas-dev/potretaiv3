/**
 * share/shareImage.js — GET /share/:id  public share handler
 *
 * Resolution order:
 *   1. SHARE_KV  — metadata created by shareGenerator.createShareLink()
 *      → renders single-image page via sharePage.renderSharePage()
 *      → increments view counter via shareTracking.incrementShareViews()
 *
 *   2. RESULT_BUCKET (fallback) — results/{id}.json written by queue processor
 *      → renders all 4 generated images (legacy / job_id-based share links)
 *
 * Route registered in worker.js:
 *   if (request.method === 'GET' && url.pathname.startsWith('/share/'))
 *
 * Requires:
 *   env.SHARE_KV      — KV namespace for share metadata (Task 1–3)
 *   env.RESULT_BUCKET — R2 bucket for generation results (fallback)
 */

import { renderSharePage }      from './sharePage.js';
import { incrementShareViews,
         getShareMetadata }     from './shareTracking.js';

const SITE_URL = 'https://potretai.studiocreative.id';

// ─────────────────────────────────────────────────────────────────────────────
export async function handleShare(request, env) {
  const url = new URL(request.url);
  const id  = url.pathname.replace('/share/', '').replace(/\//g, '').trim();

  if (!id) {
    return html404('ID tidak ditemukan.');
  }

  // ── 1. Try SHARE_KV first (single-image share via shareGenerator) ──────────
  const kvMeta = await getShareMetadata(id, env);
  if (kvMeta) {
    // Increment view counter asynchronously — don't await, don't block response
    incrementShareViews(id, env).catch(() => {});

    // Render with updated views count (+1 for this view)
    const metaWithView = { ...kvMeta, views: (kvMeta.views || 0) + 1 };
    const page = renderSharePage(id, metaWithView);
    return new Response(page, {
      status:  200,
      headers: {
        'Content-Type':  'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=60',   // short cache — views counter updates
      },
    });
  }

  // ── 2. Fallback: RESULT_BUCKET (job_id-based share links) ─────────────────
  if (!env?.RESULT_BUCKET) {
    return html500('Server error: RESULT_BUCKET tidak terkonfigurasi.');
  }

  let metadata;
  try {
    const obj = await env.RESULT_BUCKET.get(`results/${id}.json`);
    if (!obj) {
      return html404(`Foto dengan ID "${id}" tidak ditemukan atau sudah kadaluarsa.`);
    }
    metadata = await obj.json();
  } catch (err) {
    console.error('[share] R2 get error:', err.message);
    return html500('Gagal memuat data foto.');
  }

  if (!metadata?.success || !Array.isArray(metadata.images) || metadata.images.length === 0) {
    return html404('Data foto tidak valid atau belum selesai diproses.');
  }

  const page = renderLegacySharePage(id, metadata.images[0], metadata.images);
  return new Response(page, {
    status:  200,
    headers: {
      'Content-Type':  'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy share page — shows all 4 generated images for job_id-based links
// ─────────────────────────────────────────────────────────────────────────────
function renderLegacySharePage(id, previewUrl, allImages) {
  const shareUrl = `${SITE_URL}/share/${id}`;
  const imgGrid  = allImages
    .map((url, i) =>
      `<a href="${url}" download="potretai-${id}-${i + 1}.jpg" class="img-wrap">
        <img src="${url}" alt="PotretAI foto ${i + 1}" loading="lazy">
        <span class="dl">⬇ Download</span>
       </a>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Foto AI saya — PotretAI</title>
  <meta name="description" content="Foto AI profesional yang dibuat dengan PotretAI">
  <!-- Open Graph -->
  <meta property="og:title"       content="Foto AI Profesional — PotretAI">
  <meta property="og:description" content="Lihat foto AI profesional yang saya buat di PotretAI!">
  <meta property="og:image"       content="${previewUrl}">
  <meta property="og:url"         content="${shareUrl}">
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="PotretAI">
  <!-- Twitter Card -->
  <meta name="twitter:card"       content="summary_large_image">
  <meta name="twitter:image"      content="${previewUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Inter,sans-serif;background:#1E2A2F;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:32px 16px 60px}
    h1{font-family:Montserrat,sans-serif;font-size:1.5rem;font-weight:700;margin-bottom:8px;color:#1FA6B5}
    p{color:#A7B0B5;font-size:.9rem;margin-bottom:24px}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:680px;width:100%}
    .img-wrap{position:relative;display:block;border-radius:12px;overflow:hidden;border:1.5px solid #0E8EA0}
    .img-wrap img{width:100%;display:block}
    .dl{position:absolute;bottom:8px;right:8px;background:rgba(14,142,160,.9);color:#fff;font-size:.75rem;padding:4px 10px;border-radius:20px;cursor:pointer}
    .cta{margin-top:28px;background:#1FA6B5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.95rem;transition:background .2s}
    .cta:hover{background:#0E8EA0}
  </style>
</head>
<body>
  <h1>✦ Foto AI Profesional</h1>
  <p>Dibuat dengan PotretAI — AI Photography Studio</p>
  <div class="grid">${imgGrid}</div>
  <a class="cta" href="${SITE_URL}" target="_blank">Generate Your Own AI Photo →</a>
</body>
</html>`;
}

function html404(msg) {
  return new Response(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>404</title><style>body{font-family:Inter,sans-serif;background:#1E2A2F;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px}a{color:#1FA6B5}</style></head><body><h2>404 — ${msg}</h2><a href="${SITE_URL}">Kembali ke PotretAI →</a></body></html>`, {
    status:  404,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

function html500(msg) {
  return new Response(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>500</title><style>body{font-family:Inter,sans-serif;background:#1E2A2F;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px}a{color:#1FA6B5}</style></head><body><h2>500 — ${msg}</h2><a href="${SITE_URL}">Kembali ke PotretAI →</a></body></html>`, {
    status:  500,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
