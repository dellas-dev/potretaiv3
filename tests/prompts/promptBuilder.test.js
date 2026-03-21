/**
 * tests/prompts/promptBuilder.test.js
 *
 * Tests the prompt engine for studio category:
 *   promptBuilder.js → studioPrompt → elements → photography
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

import { studioInput } from '@helpers/mockEnv.js';

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
    const out = applyConsistency('A beautiful studio portrait');
    expect(out).toContain('ultra realistic');
    expect(out).toContain('photorealistic');
    expect(out).toContain('A beautiful studio portrait');
  });

  it('buildConsistentPrompts returns exactly 4 prompts', () => {
    const prompts = buildConsistentPrompts('base prompt', { category: 'studio' });
    expect(prompts).toHaveLength(4);
  });

  it('all 4 prompts contain the base prompt', () => {
    const base    = 'A studio portrait with butterfly lighting';
    const prompts = buildConsistentPrompts(base, { category: 'studio' });
    prompts.forEach(p => expect(p).toContain(base));
  });

  it('all 4 prompts contain identity-lock anchors', () => {
    const prompts = buildConsistentPrompts('test studio', { category: 'studio' });
    prompts.forEach(p => expect(p).toContain('same person'));
  });

  it('each of the 4 prompts contains a different shot descriptor', () => {
    const prompts = buildConsistentPrompts('base', { category: 'studio' });
    const unique  = new Set(prompts.map(p => p.split('base, ')[1]?.split(',')[0]));
    expect(unique.size).toBe(4);
  });

  it('falls back to studio for unknown category', () => {
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
// promptBuilder — buildPrompt() (full pipeline)
// ─────────────────────────────────────────────────────────────────────────────
describe('promptBuilder — buildPrompt', () => {
  describe('studio category', () => {
    let prompt;
    beforeEach(() => { prompt = buildPrompt(studioInput()); });

    it('returns a non-empty string', () => {
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(50);
    });

    it('contains studio backdrop description', () => {
      expect(prompt).toContain('studio');
    });

    it('contains subject description', () => {
      expect(prompt).toContain('beautiful Indonesian woman');
    });

    it('contains lighting info', () => {
      expect(prompt).toContain('butterfly lighting');
    });

    it('contains pose', () => {
      expect(prompt).toContain('elegant standing portrait');
    });

    it('contains expression', () => {
      expect(prompt).toContain('confident editorial gaze');
    });

    it('contains color grade', () => {
      expect(prompt).toContain('ultra clean pure white studio grade');
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

  describe('studio solo_pria mode', () => {
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
  });

  describe('studio pasangan mode', () => {
    it('builds pasangan studio prompt', () => {
      const prompt = buildPrompt(studioInput({
        studio_mode:           'pasangan',
        etnis_pria:            'distinguished man',
        outfit_pria:           'navy blue wedding suit',
        face_image_url_pria:   'https://test.r2.dev/faces/pria.jpg',
      }));
      expect(prompt).toContain('distinguished man');
    });
  });

  describe('fallback for empty category', () => {
    it('falls back to studio for empty category', () => {
      const input  = { ...studioInput(), category: undefined };
      const prompt = buildPrompt(input);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(10);
    });
  });
});
