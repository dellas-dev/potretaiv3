/**
 * tests/test.config.js — Vitest configuration for PotretAI v3
 *
 * Run with:
 *   npm test                     — run all tests once
 *   npm run test:watch           — watch mode
 *   npm run test:coverage        — coverage report
 *   npm run test:ui              — browser UI
 *   npm run test:prompts         — prompt engine only
 *   npm run test:security        — security layer only
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const WORKER    = path.resolve(ROOT, 'cloudflare-worker');

export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',

    // Only pick up test files inside tests/
    include: [path.join(__dirname, '**/*.test.js')],
    exclude: ['**/node_modules/**'],

    // Global setup — polyfills for Node compat
    setupFiles: [path.join(__dirname, 'setup.js')],

    // Per-test timeout (fal.ai mocks can be slow)
    testTimeout: 10_000,

    // Coverage
    coverage: {
      provider:         'v8',
      reportsDirectory: path.join(ROOT, 'coverage'),
      reporter:         ['text', 'html', 'lcov'],
      include: [
        'cloudflare-worker/utils/**/*.js',
        'cloudflare-worker/prompts/**/*.js',
        'cloudflare-worker/payments/**/*.js',
        'cloudflare-worker/queue/**/*.js',
        'cloudflare-worker/ai/**/*.js',
        'cloudflare-worker/affiliate/**/*.js',
      ],
      exclude: ['cloudflare-worker/worker.js'],
      thresholds: {
        statements: 70,
        branches:   65,
        functions:  70,
        lines:      70,
      },
    },

    // Human-readable reporter
    reporter: ['verbose'],
  },

  // Path aliases — import '@worker/utils/foo' instead of '../../cloudflare-worker/utils/foo'
  resolve: {
    alias: {
      '@worker':   WORKER,
      '@prompts':  path.join(WORKER, 'prompts'),
      '@utils':    path.join(WORKER, 'utils'),
      '@ai':       path.join(WORKER, 'ai'),
      '@payments': path.join(WORKER, 'payments'),
      '@queue':    path.join(WORKER, 'queue'),
      '@affiliate':path.join(WORKER, 'affiliate'),
      '@share':    path.join(WORKER, 'share'),
      '@helpers':  path.join(__dirname, 'helpers'),
    },
  },
});
