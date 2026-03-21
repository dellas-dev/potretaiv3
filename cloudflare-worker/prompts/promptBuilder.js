/**
 * promptBuilder.js — Central prompt assembly engine for PotretAI v3
 *
 * Pipeline:
 *   buildBasePrompt(input)    ← category-specific subject + scene
 *   → applyConsistency()      ← append BASE_STYLE quality anchors
 *   → applyRandomizer()       ← random light + camera variation
 *   → applyFaceRepair()       ← face quality anchors
 *   → append photography      ← color grade, camera, lens
 *   → append CINEMATIC_SUFFIX ← auto-injected quality tags
 *
 * Per CLAUDE.md: prompts are NEVER shown to the user.
 *
 * Used by:
 *   queue/generateQueue.js → buildPrompt(input)
 */

import { buildPreweddingPrompt } from './categories/preweddingPrompt.js';
import { buildWeddingPrompt }    from './categories/weddingPrompt.js';
import { buildEngagementPrompt } from './categories/engagementPrompt.js';
import { buildStudioPrompt }     from './categories/studioPrompt.js';
import { buildFamilyPrompt }     from './categories/familyPrompt.js';

import { formatColorGrade } from './photography/colorGradePrompt.js';
import { formatCamera }     from './photography/cameraPrompt.js';
import { formatLens }       from './photography/lensPrompt.js';

import { applyConsistency } from './consistencyEngine.js';
import { applyRandomizer }  from './randomizer.js';
import { applyFaceRepair }  from './faceRepair.js';
import { CINEMATIC_SUFFIX } from './masterPrompt.js';

// ─────────────────────────────────────────────────────────────────────────────
// buildBasePrompt — delegates to category-specific builder
// ─────────────────────────────────────────────────────────────────────────────
function buildBasePrompt(input) {
  const category = input.category || 'prewedding';

  switch (category) {
    case 'prewedding':  return buildPreweddingPrompt(input);
    case 'wedding':     return buildWeddingPrompt(input);
    case 'engagement':  return buildEngagementPrompt(input);
    case 'studio':      return buildStudioPrompt(input);
    case 'family':      return buildFamilyPrompt(input);
    default:            return buildPreweddingPrompt(input);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildPrompt — full pipeline, returns single prompt string
// Called by generateQueue.js before buildConsistentPrompts()
// ─────────────────────────────────────────────────────────────────────────────
export function buildPrompt(input) {
  let prompt = buildBasePrompt(input);

  // Photography style — from dropdowns (already prompt strings)
  const colorGrade = formatColorGrade(input.color_grade);
  const camera     = formatCamera(input.camera);
  const lens       = formatLens(input.lens);

  const photoTags = [colorGrade, camera, lens].filter(Boolean).join(', ');
  if (photoTags) prompt = `${prompt}, ${photoTags}`;

  // Pipeline steps
  prompt = applyConsistency(prompt);
  prompt = applyRandomizer(prompt);
  prompt = applyFaceRepair(prompt);

  // Always append cinematic suffix last
  prompt = `${prompt}, ${CINEMATIC_SUFFIX}`;

  return prompt;
}
