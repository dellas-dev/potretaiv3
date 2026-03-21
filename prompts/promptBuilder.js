// promptBuilder.js — Central prompt construction engine
// Mirrors PromptBuilder module in app.html (lines 1704-1811)
// Uses all element and photography sub-modules.

import { masterPrompt }      from './masterPrompt.js';
import { applyConsistency }  from './consistencyEngine.js';
import { applyRandomizer }   from './randomizer.js';
import { applyFaceRepair }   from './faceRepair.js';

import { categoryPrompt as studioCategory } from './categories/studioPrompt.js';

import { outfitPrompt }     from './elements/outfitPrompt.js';
import { posePrompt }       from './elements/posePrompt.js';
import { expressionPrompt } from './elements/expressionPrompt.js';

import { colorGradePrompt } from './photography/colorGradePrompt.js';
import { lightingPrompt }   from './photography/lightingPrompt.js';
import { cameraPrompt }     from './photography/cameraPrompt.js';

// ── Internal lookup helpers ──

const categoryModifiers = {
  studio: studioCategory,
};

/**
 * Resolve a label to its AI prompt text from a given map object.
 * Falls back to the label itself if not found.
 * @param {Object} map   - The prompt map to look up (label → prompt text)
 * @param {string} label - The option label or key
 * @param {string} [customText] - Override text when user selects "custom"
 * @returns {string}
 */
function resolve(map, label, customText) {
  if (label === 'custom' || label === '') {
    return customText && customText.trim() ? customText.trim() : '';
  }
  return map[label] || label;
}

// ── Public API ──

/**
 * Build a complete AI prompt string from a config object.
 *
 * @param {Object} config
 * @param {string} config.category        - 'prewedding' | 'wedding' | 'engagement' | 'studio' | 'family'
 *
 * Prewedding / Wedding / Engagement shared:
 * @param {string} [config.etnis_pria]    - Label from pw-etnis-pria (e.g. "Indonesia")
 * @param {string} [config.etnis_wanita]  - Label from pw-etnis-wanita
 * @param {string} [config.outfit_pria]   - Label from outfit select for male
 * @param {string} [config.outfit_wanita] - Label from outfit select for female
 * @param {string} [config.location]      - Label from location/venue select
 * @param {string} [config.location_custom] - Free-text override when "custom" is selected
 * @param {string} [config.pose]          - Label from pose select
 * @param {string} [config.expression]    - Label from expression select
 * @param {string} [config.time]          - Label from waktu select
 * @param {string} [config.atmosphere]    - Label from suasana select
 * @param {string} [config.color_grade]   - Label from grade select
 * @param {string} [config.camera]        - Label from kamera select
 * @param {string} [config.lens]          - Label from lensa select (prewedding only)
 *
 * Studio specific:
 * @param {string} [config.studio_mode]   - 'solo_wanita' | 'solo_pria' | 'pasangan'
 * @param {string} [config.studio_tema]   - Label from st-tema select
 * @param {string} [config.lighting]      - Label from st-lighting select
 *
 * Family specific:
 * @param {string} [config.etnis_family]  - Label from fm-etnis select
 * @param {string} [config.family_anggota] - Label from fm-anggota select
 * @param {string} [config.family_outfit] - Label from fm-outfit select
 * @param {string} [config.family_tema]   - Label from fm-tema select
 * @param {string} [config.family_suasana] - Label from fm-suasana select
 *
 * Face reference flags (suppress physical description if face photo uploaded):
 * @param {boolean} [config.hasFacePria]   - true if male face reference uploaded
 * @param {boolean} [config.hasFaceWanita] - true if female face reference uploaded
 *
 * @returns {string} Full AI prompt string
 */
export function buildPrompt(config) {
  let prompt = buildBasePrompt(config);
  prompt = applyConsistency(prompt);
  prompt = applyRandomizer(prompt);
  prompt = applyFaceRepair(prompt);
  return prompt;
}

function buildBasePrompt(config) {
  const cat = config.category;
  const catMod = categoryModifiers[cat] || '';

  switch (cat) {

    case 'studio': {
      const mode = config.studio_mode || 'solo_wanita';

      const deskMapM = {
        "Indonesia":      "handsome Indonesian man",
        "Asia Tenggara":  "handsome Southeast Asian man",
        "Asia Timur":     "handsome East Asian man",
        "Kaukasia":       "handsome Caucasian man",
      };
      const deskMapF = {
        "Indonesia":      "beautiful Indonesian woman",
        "Asia Tenggara":  "beautiful Southeast Asian woman",
        "Asia Timur":     "beautiful East Asian woman",
        "Kaukasia":       "beautiful Caucasian woman",
      };

      let subjek;
      if (mode === 'solo_wanita') {
        const subj = config.hasFaceWanita ? 'a woman' : (deskMapF[config.etnis_wanita] || 'beautiful Indonesian woman');
        const outfitW = resolve(outfitPrompt.studio.female, config.outfit_wanita);
        subjek = `${subj}, ${outfitW}`;
      } else if (mode === 'solo_pria') {
        const subj = config.hasFacePria ? 'a man' : (deskMapM[config.etnis_pria] || 'handsome Indonesian man');
        const outfitP = resolve(outfitPrompt.studio.male, config.outfit_pria);
        subjek = `${subj}, ${outfitP}`;
      } else {
        const subP = config.hasFacePria   ? 'a man'   : (deskMapM[config.etnis_pria]   || 'handsome Indonesian man');
        const subW = config.hasFaceWanita ? 'a woman' : (deskMapF[config.etnis_wanita] || 'beautiful Indonesian woman');
        const outfitP = resolve(outfitPrompt.studio.male,   config.outfit_pria);
        const outfitW = resolve(outfitPrompt.studio.female, config.outfit_wanita);
        subjek = `${subP} and ${subW}, man ${outfitP}, woman ${outfitW}`;
      }

      // Studio tema map (from STUDIO_TEMA_MAP in app.html lines 1542-1553)
      const studioTemaMap = {
        "Korean Soft Studio":    "Korean soft studio background, minimalist white backdrop with subtle gradient",
        "Luxury White Seamless": "luxury white seamless studio, flawless bright backdrop, high-end fashion",
        "Marble Elegant":        "marble textured studio background, elegant veined marble white and grey",
        "Editorial Abstract":    "editorial fashion studio, abstract dramatic backdrop, fashion magazine set",
        "Vogue Style":           "Vogue-style studio, sophisticated fashion backdrop, editorial luxury",
        "Pastel Dreamy":         "pastel studio background, soft pink lavender mint, dreamy aesthetic",
        "Concrete Industrial":   "minimalist concrete studio, raw industrial grey, modern editorial",
        "Penthouse City View":   "penthouse lifestyle studio, floor-to-ceiling windows, city view",
        "Japanese Minimal":      "Japanese minimalist studio, off-white washi paper backdrop, zen aesthetic",
        "Velvet Luxury":         "deep velvet luxury backdrop, rich jewel tones, sumptuous texture",
      };

      const tema  = studioTemaMap[config.studio_tema] || config.studio_tema || '';
      const light = resolve(lightingPrompt.studio,      config.lighting);
      const pose  = resolve(posePrompt.studio,          config.pose);
      const eks   = resolve(expressionPrompt.studio,    config.expression);
      const grd   = resolve(colorGradePrompt.studio,    config.color_grade);
      const kam   = resolve(cameraPrompt.studio,        config.camera);

      return [
        subjek,
        pose, eks,
        `studio background: ${tema}`,
        light, grd, kam,
        "85mm f/1.4",
        catMod,
        masterPrompt,
      ].filter(Boolean).join(', ');
    }

    default:
      return masterPrompt;
  }
}
