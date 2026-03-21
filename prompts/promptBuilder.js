// promptBuilder.js — Central prompt construction engine
// Mirrors PromptBuilder module in app.html (lines 1704-1811)
// Uses all element and photography sub-modules.

import { masterPrompt }      from './masterPrompt.js';
import { applyConsistency }  from './consistencyEngine.js';
import { applyRandomizer }   from './randomizer.js';
import { applyFaceRepair }   from './faceRepair.js';

import { categoryPrompt as preweddingCategory } from './categories/preweddingPrompt.js';
import { categoryPrompt as weddingCategory }    from './categories/weddingPrompt.js';
import { categoryPrompt as engagementCategory } from './categories/engagementPrompt.js';
import { categoryPrompt as studioCategory }     from './categories/studioPrompt.js';
import { categoryPrompt as familyCategory }     from './categories/familyPrompt.js';

import { outfitPrompt }      from './elements/outfitPrompt.js';
import { locationPrompt }    from './elements/locationPrompt.js';
import { posePrompt }        from './elements/posePrompt.js';
import { expressionPrompt }  from './elements/expressionPrompt.js';
import { atmospherePrompt }  from './elements/atmospherePrompt.js';
import { timePrompt }        from './elements/timePrompt.js';

import { colorGradePrompt }  from './photography/colorGradePrompt.js';
import { lightingPrompt }    from './photography/lightingPrompt.js';
import { cameraPrompt }      from './photography/cameraPrompt.js';
import { lensPrompt }        from './photography/lensPrompt.js';
import { aperturePrompt }    from './photography/aperturePrompt.js';

// ── Internal lookup helpers ──

const categoryModifiers = {
  prewedding: preweddingCategory,
  wedding:    weddingCategory,
  engagement: engagementCategory,
  studio:     studioCategory,
  family:     familyCategory,
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

    case 'prewedding': {
      const deskMap = {
        "Indonesia":      "handsome Indonesian man",
        "Asia Tenggara":  "handsome Southeast Asian man",
        "Asia Timur":     "handsome East Asian man",
        "Kaukasia":       "handsome Caucasian man",
      };
      const deskMapW = {
        "Indonesia":      "beautiful Indonesian woman",
        "Asia Tenggara":  "beautiful Southeast Asian woman",
        "Asia Timur":     "beautiful East Asian woman",
        "Kaukasia":       "beautiful Caucasian woman",
      };
      const subjectP = config.hasFacePria   ? 'a man'   : (deskMap[config.etnis_pria]   || 'handsome Indonesian man');
      const subjectW = config.hasFaceWanita ? 'a woman' : (deskMapW[config.etnis_wanita] || 'beautiful Indonesian woman');

      const opP  = resolve(outfitPrompt.prewedding.male,   config.outfit_pria,   config.outfit_pria_custom);
      const opW  = resolve(outfitPrompt.prewedding.female, config.outfit_wanita, config.outfit_wanita_custom);
      const lok  = resolve(locationPrompt.prewedding,      config.location,      config.location_custom);
      const pose = resolve(posePrompt.prewedding,          config.pose);
      const eks  = resolve(expressionPrompt.prewedding,    config.expression);
      const wkt  = resolve(timePrompt.prewedding,          config.time);
      const sua  = resolve(atmospherePrompt.prewedding,    config.atmosphere);
      const grd  = resolve(colorGradePrompt.prewedding,    config.color_grade);
      const kam  = resolve(cameraPrompt.prewedding,        config.camera);
      const len  = resolve(lensPrompt.prewedding,          config.lens);
      const apt  = aperturePrompt.prewedding.default;

      return [
        `${subjectP} and ${subjectW}`,
        pose,
        `man ${opP}`,
        `woman ${opW}`,
        `at ${lok}`,
        wkt, sua, eks,
        grd, kam, len, apt,
        catMod,
        masterPrompt,
      ].filter(Boolean).join(', ');
    }

    case 'wedding': {
      const deskMap = {
        "Indonesia":      "handsome Indonesian man",
        "Asia Tenggara":  "handsome Southeast Asian man",
        "Asia Timur":     "handsome East Asian man",
        "Kaukasia":       "handsome Caucasian man",
      };
      const deskMapW = {
        "Indonesia":      "beautiful Indonesian woman",
        "Asia Tenggara":  "beautiful Southeast Asian woman",
        "Asia Timur":     "beautiful East Asian woman",
        "Kaukasia":       "beautiful Caucasian woman",
      };
      const subjectP = (config.hasFacePria   ? 'a man'   : (deskMap[config.etnis_pria]   || 'handsome Indonesian man'))   + ' groom';
      const subjectW = (config.hasFaceWanita ? 'a woman' : (deskMapW[config.etnis_wanita] || 'beautiful Indonesian woman')) + ' bride';

      const opP   = resolve(outfitPrompt.wedding.male,   config.outfit_pria);
      const opW   = resolve(outfitPrompt.wedding.female, config.outfit_wanita);
      const venue = resolve(locationPrompt.wedding,      config.location, config.location_custom);
      const pose  = resolve(posePrompt.wedding,          config.pose);
      const wkt   = resolve(timePrompt.wedding,          config.time);
      const grd   = resolve(colorGradePrompt.wedding,    config.color_grade);
      const kam   = resolve(cameraPrompt.wedding,        config.camera);

      // Decoration inline map (from buildWedding line 1734)
      const dekorasiMap = {
        "Fresh Flower Arch Elegan":  "fresh flower arch floral arrangement surrounding",
        "Candle & Rose Petals":      "candles and rose petals romantic setting",
        "Hanging Fairy Lights":      "hanging fairy lights warm glow",
        "Tropical Lush Greenery":    "tropical lush greenery decoration",
        "Minimal White Modern":      "minimal white modern decoration",
      };
      const dkr = dekorasiMap[config.dekorasi] || '';

      return [
        `${subjectP} and ${subjectW}`,
        pose,
        `groom ${opP}`,
        `bride ${opW}`,
        `at ${venue}`,
        dkr,
        wkt,
        "deeply in love expression soulful romantic gaze",
        "medium portrait",
        grd, kam, "85mm f/1.4",
        catMod,
        masterPrompt,
      ].filter(Boolean).join(', ');
    }

    case 'engagement': {
      const subjectP = config.hasFacePria   ? 'a man'   : 'handsome Indonesian man';
      const subjectW = config.hasFaceWanita ? 'a woman' : 'beautiful Indonesian woman';

      const opP  = resolve(outfitPrompt.engagement.male,   config.outfit_pria);
      const opW  = resolve(outfitPrompt.engagement.female, config.outfit_wanita);
      const lok  = resolve(locationPrompt.engagement,      config.location, config.location_custom);
      const pose = resolve(posePrompt.engagement,          config.pose);
      const sua  = resolve(atmospherePrompt.engagement,    config.atmosphere);
      const wkt  = resolve(timePrompt.engagement,          config.time);
      const grd  = resolve(colorGradePrompt.engagement,    config.color_grade);

      return [
        `${subjectP} and ${subjectW}`,
        pose,
        `man ${opP}`,
        `woman ${opW}`,
        `at ${lok}`,
        wkt, sua,
        "candid natural expression",
        "medium portrait shot",
        grd,
        "shot on Sony A7R V",
        "85mm f/1.4",
        catMod,
        masterPrompt,
      ].filter(Boolean).join(', ');
    }

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

    case 'family': {
      // Etnis map
      const familyDeskMap = {
        "Keluarga Indonesia":  "Indonesian family",
        "Asia Tenggara":       "Southeast Asian family",
        "Campuran (Mixed)":    "mixed ethnicity family",
      };
      // Anggota map (from FAMILY_ANGGOTA_MAP in app.html lines 1562-1568)
      const anggotaMap = {
        "Pasangan (Tanpa Anak)":    "couple portrait, two people together, intimate",
        "Ayah + Ibu + 1 Anak":      "family of three, mother father and one child",
        "Ayah + Ibu + 2 Anak":      "family of four, mother father and two children",
        "Ayah + Ibu + 3 Anak":      "family of five, mother father and three children",
        "Keluarga Besar":           "large extended family group, multiple generations",
      };

      const etnis   = familyDeskMap[config.etnis_family]   || 'Indonesian family';
      const anggota = anggotaMap[config.family_anggota]     || 'family portrait';
      const outfit  = resolve(outfitPrompt.family,           config.family_outfit);
      const tema    = resolve(locationPrompt.family,         config.family_tema);
      const sua     = resolve(atmospherePrompt.family,       config.family_suasana);
      const grd     = resolve(colorGradePrompt.family,       config.color_grade);
      const kam     = resolve(cameraPrompt.family,           config.camera);
      const apt     = aperturePrompt.family.default;

      return [
        `${etnis} ${anggota}`,
        `wearing ${outfit}`,
        tema, sua, grd, kam, apt,
        catMod,
        masterPrompt,
      ].filter(Boolean).join(', ');
    }

    default:
      return masterPrompt;
  }
}
