/**
 * tests/prompts/promptBuilder.test.js
 *
 * Tests the entire prompt engine:
 *   promptBuilder.js → categories → elements → photography
 *   consistencyEngine → 4 consistent prompts
 *   randomizer → light + camera variation
 *   faceRepair → facial quality anchors
 *   masterPrompt → cinematic suffix
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { buildPrompt } from '@prompts/promptBuilder.js';
import { buildConsistentPrompts, applyConsistency } from '@prompts/consistencyEngine.js';
import { applyRandomizer } from '@prompts/randomizer.js';
import { applyFaceRepair }  from '@prompts/faceRepair.js';
import { CINEMATIC_SUFFIX } from '@prompts/masterPrompt.js';

import {
  preweddingInput,
  studioInput,
  familyInput,
} from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// masterPrompt.js
// ─────────────────────────────────────────────────────────────────────────────
describe('masterPrompt — CINEMATIC_SUFFIX', () => {
  it('is a non-empty string', () => {
    expect(typeof CINEMATIC_SUFFIX).toBe('string');
    expect(CINEMATIC_SUFFIX.length).toBeGreaterThan(10);
  });

  it('contains required quality keywords', () => {
    expect(CINEMATIC_SUFFIX).toContain('ultra realistic');
    expect(CINEMATIC_SUFFIX).toContain('photorealistic');
    expect(CINEMATIC_SUFFIX).toContain('8k resolution');
    expect(CINEMATIC_SUFFIX).toContain('RAW photo');
    expect(CINEMATIC_SUFFIX).toContain('no watermark');
    expect(CINEMATIC_SUFFIX).toContain('bokeh');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// consistencyEngine.js
// ─────────────────────────────────────────────────────────────────────────────
describe('consistencyEngine', () => {
  it('applyConsistency appends BASE_STYLE to prompt', () => {
    const out = applyConsistency('A beautiful couple portrait');
    expect(out).toContain('ultra realistic');
    expect(out).toContain('photorealistic');
    expect(out).toContain('A beautiful couple portrait');
  });

  it('buildConsistentPrompts returns exactly 4 prompts', () => {
    const prompts = buildConsistentPrompts('base prompt', { category: 'prewedding' });
    expect(prompts).toHaveLength(4);
  });

  it('all 4 prompts contain the base prompt', () => {
    const base    = 'A romantic prewedding couple in Bali';
    const prompts = buildConsistentPrompts(base, { category: 'prewedding' });
    prompts.forEach(p => expect(p).toContain(base));
  });

  it('all 4 prompts contain identity-lock anchors', () => {
    const prompts = buildConsistentPrompts('test base', { category: 'wedding' });
    prompts.forEach(p => expect(p).toContain('same person'));
  });

  it('each of the 4 prompts contains a different shot descriptor', () => {
    const prompts = buildConsistentPrompts('base', { category: 'prewedding' });
    const unique  = new Set(prompts.map(p => p.split('base, ')[1]?.split(',')[0]));
    expect(unique.size).toBe(4);
  });

  it('supports all 5 categories', () => {
    const cats = ['prewedding', 'wedding', 'engagement', 'studio', 'family'];
    cats.forEach(cat => {
      const prompts = buildConsistentPrompts('test', { category: cat });
      expect(prompts).toHaveLength(4);
    });
  });

  it('falls back to prewedding for unknown category', () => {
    const prompts = buildConsistentPrompts('test', { category: 'unknown_cat' });
    expect(prompts).toHaveLength(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// randomizer.js
// ─────────────────────────────────────────────────────────────────────────────
describe('randomizer', () => {
  it('applyRandomizer appends light and camera tags', () => {
    const base = 'A beautiful portrait';
    const out  = applyRandomizer(base);
    expect(out).toContain(base);
    expect(out.length).toBeGreaterThan(base.length + 10);
  });

  it('produces different outputs across multiple calls (randomness test)', () => {
    // Run 10 times — expect at least 2 different outputs
    const outputs = new Set(Array.from({ length: 10 }, () => applyRandomizer('base')));
    expect(outputs.size).toBeGreaterThan(1);
  });

  it('always appends "shot on" camera keyword', () => {
    for (let i = 0; i < 5; i++) {
      expect(applyRandomizer('base')).toContain('shot on');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// faceRepair.js
// ─────────────────────────────────────────────────────────────────────────────
describe('faceRepair', () => {
  it('applyFaceRepair appends face quality tags', () => {
    const out = applyFaceRepair('A portrait');
    expect(out).toContain('symmetrical face');
    expect(out).toContain('perfect eyes');
    expect(out).toContain('natural skin texture');
    expect(out).toContain('realistic facial proportions');
    expect(out).toContain('no face distortion');
  });

  it('preserves the original prompt', () => {
    const base = 'A stunning studio portrait';
    const out  = applyFaceRepair(base);
    expect(out).toContain(base);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// promptBuilder — buildPrompt()  (full pipeline)
// ─────────────────────────────────────────────────────────────────────────────
describe('promptBuilder — buildPrompt', () => {
  // ── Prewedding ────────────────────────────────────────────────────────────
  describe('prewedding category', () => {
    let prompt;
    beforeEach(() => { prompt = buildPrompt(preweddingInput()); });

    it('returns a non-empty string', () => {
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(50);
    });

    it('contains male subject description', () => {
      expect(prompt).toContain('handsome Indonesian man');
    });

    it('contains female subject description', () => {
      expect(prompt).toContain('beautiful Indonesian woman');
    });

    it('contains male outfit', () => {
      expect(prompt).toContain('fitted white linen shirt');
    });

    it('contains female outfit', () => {
      expect(prompt).toContain('flowing chiffon maxi dress');
    });

    it('resolves location key to full description', () => {
      // bali_heaven → Pura Lempuyang
      expect(prompt).toContain('Lempuyang');
    });

    it('contains pose', () => {
      expect(prompt).toContain('walking hand-in-hand');
    });

    it('contains expression', () => {
      expect(prompt).toContain('deeply in love');
    });

    it('contains color grade', () => {
      expect(prompt).toContain('warm cinematic film tones');
    });

    it('contains camera info', () => {
      expect(prompt).toContain('Sony A7R V');
    });

    it('contains lens info (shot on or lens)', () => {
      expect(prompt).toContain('85mm f/1.4');
    });

    it('appends cinematic suffix (ultra realistic)', () => {
      expect(prompt).toContain('ultra realistic');
    });

    it('appends face repair tags', () => {
      expect(prompt).toContain('symmetrical face');
    });

    it('does NOT expose internal "custom" option value', () => {
      expect(prompt).not.toContain('"custom"');
      expect(prompt).not.toContain("value='custom'");
    });
  });

  // ── Wedding ───────────────────────────────────────────────────────────────
  describe('wedding category', () => {
    it('contains wedding-specific framing', () => {
      const prompt = buildPrompt({
        category:             'wedding',
        etnis_pria:           'handsome Indonesian groom',
        etnis_wanita:         'beautiful Indonesian bride',
        outfit_pria:          'classic black tuxedo',
        outfit_wanita:        'magnificent white ball gown',
        location:             'wd_bali_cliff',
        pose:                 'couple walking back down the aisle',
        expression:           'pure bliss and overwhelming joy',
        fal_key:              'test',
      });
      expect(prompt).toContain('wedding');
      expect(prompt).toContain('groom');
      expect(prompt).toContain('Uluwatu');
    });
  });

  // ── Engagement ────────────────────────────────────────────────────────────
  describe('engagement category', () => {
    it('builds engagement-specific prompt', () => {
      const prompt = buildPrompt({
        category:     'engagement',
        etnis_pria:   'handsome man',
        etnis_wanita: 'beautiful woman',
        location:     'en_rooftop',
        fal_key:      'test',
      });
      expect(prompt).toContain('engagement');
      expect(prompt).toContain('Rooftop');
    });
  });

  // ── Studio ────────────────────────────────────────────────────────────────
  describe('studio category', () => {
    it('builds solo_wanita studio prompt', () => {
      const prompt = buildPrompt(studioInput());
      expect(prompt).toContain('studio');
      expect(prompt).toContain('ball gown');
      expect(prompt).toContain('butterfly lighting');
    });

    it('builds solo_pria studio prompt', () => {
      const prompt = buildPrompt(studioInput({
        studio_mode:           'solo_pria',
        etnis_pria:            'distinguished Indonesian man',
        face_image_url_pria:   'https://test.r2.dev/faces/pria.jpg',
        outfit_pria:           'classic black tuxedo',
        face_image_url_wanita: null,
      }));
      expect(prompt).toContain('distinguished Indonesian man');
      expect(prompt).toContain('tuxedo');
    });

    it('builds pasangan studio prompt', () => {
      const prompt = buildPrompt(studioInput({
        studio_mode:           'pasangan',
        etnis_pria:            'distinguished man',
        outfit_pria:           'navy blue wedding suit',
        face_image_url_pria:   'https://test.r2.dev/faces/pria.jpg',
      }));
      expect(prompt).toContain('couple');
    });
  });

  // ── Family ───────────────────────────────────────────────────────────────
  describe('family category', () => {
    it('builds family portrait prompt', () => {
      const prompt = buildPrompt(familyInput());
      expect(prompt).toContain('family');
      expect(prompt).toContain('Indonesian family');
    });

    it('contains family outfit', () => {
      const prompt = buildPrompt(familyInput());
      expect(prompt).toContain('white and beige');
    });

    it('contains studio theme', () => {
      const prompt = buildPrompt(familyInput());
      expect(prompt).toContain('warm white family studio');
    });
  });

  // ── Custom outfit override ────────────────────────────────────────────────
  describe('custom outfit field', () => {
    it('uses custom outfit when outfit=custom', () => {
      const prompt = buildPrompt(preweddingInput({
        outfit_pria:        'custom',
        outfit_pria_custom: 'handmade vintage blazer with gold buttons',
      }));
      expect(prompt).toContain('handmade vintage blazer');
    });
  });

  // ── Custom location ───────────────────────────────────────────────────────
  describe('custom location field', () => {
    it('uses custom location string', () => {
      const prompt = buildPrompt(preweddingInput({
        location:        'custom',
        location_custom: 'secret waterfall hidden in Bandung jungle',
      }));
      expect(prompt).toContain('secret waterfall');
    });
  });

  // ── Unknown location key ──────────────────────────────────────────────────
  it('passes unknown location key through as-is', () => {
    const prompt = buildPrompt(preweddingInput({ location: 'some_unknown_key_xyz' }));
    expect(prompt).toContain('some_unknown_key_xyz');
  });

  // ── Fallback for empty category ───────────────────────────────────────────
  it('falls back to prewedding for empty category', () => {
    const input  = { ...preweddingInput(), category: undefined };
    const prompt = buildPrompt(input);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Location resolver — all 5 continent groups
// ─────────────────────────────────────────────────────────────────────────────
describe('locationPrompt — resolveLocation', () => {
  // We test indirectly through buildPrompt
  const locationCases = [
    ['bali_heaven',    'Lempuyang'],
    ['kyoto_inari',    'Inari'],
    ['paris_eiffel',   'Eiffel'],
    ['dubai_desert',   'Dubai'],
    ['santorini',      'Santorini'],
    ['ny_rooftop',     'Manhattan'],
    ['aurora',         'Aurora'],
    ['en_cafe',        'Jakarta'],
    ['wd_masjid',      'Istiqlal'],
  ];

  locationCases.forEach(([key, expectedFragment]) => {
    it(`resolves ${key} → contains "${expectedFragment}"`, () => {
      const prompt = buildPrompt(preweddingInput({ location: key }));
      expect(prompt.toLowerCase()).toContain(expectedFragment.toLowerCase());
    });
  });
});
