/**
 * resultCache.js — Prompt-based result cache via RESULT_CACHE KV
 *
 * Avoids duplicate fal.ai calls for identical prompts within 24 hours.
 * Key: cache:{sha256(prompt)}   TTL: 86400s (24 h)
 *
 * Flow:
 *   buildPrompt() → checkCache() → hit: return cached
 *                                → miss: generateImage() → saveCache()
 *
 * Usage:
 *   import { checkCache, saveCache } from '../utils/resultCache.js';
 *
 *   const cached = await checkCache(prompt, env);
 *   if (cached) return cached;
 *   const result = await generateImageWithFace(...);
 *   await saveCache(prompt, result, env);
 *
 * Requires binding in wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "RESULT_CACHE"
 */

const CACHE_TTL = 86400;   // 24 hours

// ─────────────────────────────────────────────────────────────────────────────
async function hashPrompt(prompt) {
  const data = new TextEncoder().encode(prompt);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// checkCache
// Returns cached result object, or null on miss / KV unavailable.
// ─────────────────────────────────────────────────────────────────────────────

export async function checkCache(prompt, env) {
  if (!env?.RESULT_CACHE || !prompt) return null;

  try {
    const key    = `cache:${await hashPrompt(prompt)}`;
    const cached = await env.RESULT_CACHE.get(key);

    if (!cached) return null;

    console.log(`[resultCache] HIT — ${key.slice(0, 22)}…`);
    return JSON.parse(cached);
  } catch (err) {
    console.warn('[resultCache] checkCache error:', err.message);
    return null;   // fail open — always allow generation on cache error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// saveCache
// Persists a generation result keyed by prompt hash. Non-fatal on error.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveCache(prompt, result, env) {
  if (!env?.RESULT_CACHE || !prompt || !result) return;

  try {
    const key = `cache:${await hashPrompt(prompt)}`;

    await env.RESULT_CACHE.put(key, JSON.stringify(result), {
      expirationTtl: CACHE_TTL,
    });

    console.log(`[resultCache] SAVED — ${key.slice(0, 22)}… TTL: ${CACHE_TTL}s`);
  } catch (err) {
    console.warn('[resultCache] saveCache error:', err.message);
  }
}
