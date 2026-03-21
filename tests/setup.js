/**
 * tests/setup.js — Global test setup
 *
 * Runs once before every test file.
 * Polyfills globals that Cloudflare Worker runtime provides natively
 * but Node.js 18 exposes slightly differently.
 */

import { webcrypto } from 'node:crypto';

// Ensure crypto.subtle is available (same API as CF Workers)
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Silence expected console.warn / console.error output during tests
// (rate-limit hits, moderation blocks, etc. are intentionally triggered)
// Comment this out while debugging a specific test to see all output.
const SUPPRESS_PATTERNS = [
  '[rateLimiter]',
  '[moderation]',
  '[turnstile]',
  '[Queue]',
  '[PotretAI]',
  '[verifyPayment]',
  '[analytics]',
];

const _warn  = console.warn.bind(console);
const _error = console.error.bind(console);

console.warn = (...args) => {
  const msg = String(args[0] ?? '');
  if (SUPPRESS_PATTERNS.some(p => msg.includes(p))) return;
  _warn(...args);
};

console.error = (...args) => {
  const msg = String(args[0] ?? '');
  if (SUPPRESS_PATTERNS.some(p => msg.includes(p))) return;
  _error(...args);
};
