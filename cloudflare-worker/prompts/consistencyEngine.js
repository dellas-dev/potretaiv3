/**
 * consistencyEngine.js — 4-image shot consistency for PotretAI
 *
 * Produces 4 compositionally varied but visually consistent prompts from
 * a single base prompt so the 2×2 output grid tells a coherent story.
 *
 * Also exports applyConsistency() which appends BASE_STYLE quality anchors.
 *
 * Used by:
 *   queue/generateQueue.js  → buildConsistentPrompts(basePrompt, config)
 *   prompts/promptBuilder.js → applyConsistency(prompt)
 */

// ── Base quality anchors injected into every prompt ──────────────────────────
const BASE_STYLE = [
  'ultra realistic',
  'photorealistic',
  '8k resolution',
  'professional photography',
  'sharp focus',
  'high detail skin texture',
  'cinematic lighting',
  'natural lighting',
  'depth of field',
  'bokeh',
  'professional lens',
  'full frame camera',
  'RAW photo',
  'HDR',
  'realistic skin tones',
  'no text',
  'no watermark',
];

// ── Consistency anchors — appended to every slot to lock identity ─────────────
const CONSISTENCY_ANCHORS =
  'same person same face same outfit throughout, consistent identity, consistent clothing';

// ── Shot variant descriptors per category (4 per category = 4 images) ────────
const SHOT_VARIANTS = {
  prewedding: [
    'cinematic wide angle establishing shot, couple small in vast landscape',
    'medium portrait shot, upper body, intimate couple moment',
    'close-up portrait, emotional faces, tender connection, bokeh background',
    'full body head-to-toe portrait, complete couple and environment',
  ],
  wedding: [
    'grand cinematic wide shot, couple and full venue visible',
    'elegant medium portrait, upper body, formal couple pose',
    'intimate close-up, faces near, emotional bridal moment',
    'full body formal portrait, head-to-toe, complete bridal look',
  ],
  engagement: [
    'lifestyle wide shot, couple in natural environment',
    'candid medium shot, natural moment, organic couple interaction',
    'intimate close-up portrait, warm emotional connection',
    'full body environmental portrait, couple and surroundings',
  ],
  studio: [
    'full body studio portrait, head-to-toe, complete outfit visible',
    'three-quarter studio portrait, knee-up, classic pose',
    'medium studio portrait, waist-up, detailed expression',
    'dramatic bust portrait, neck-up, maximum facial detail',
  ],
  family: [
    'wide family group portrait, all members visible, joyful',
    'medium family portrait, upper body, warm family interaction',
    'candid family moment, natural laughter and togetherness',
    'formal family portrait, composed, dignified, everyone looking at camera',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// applyConsistency — appends BASE_STYLE to a single prompt
// Used in the promptBuilder pipeline step.
// ─────────────────────────────────────────────────────────────────────────────
export function applyConsistency(prompt) {
  return `${prompt}, ${BASE_STYLE.join(', ')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildConsistentPrompts — returns 4 shot-varied prompts from one base prompt
// ─────────────────────────────────────────────────────────────────────────────
export function buildConsistentPrompts(basePrompt, config = {}) {
  const category = config.category || 'prewedding';
  const variants  = SHOT_VARIANTS[category] || SHOT_VARIANTS.prewedding;

  return variants.map((shot) =>
    `${basePrompt}, ${shot}, ${CONSISTENCY_ANCHORS}, ${BASE_STYLE.join(', ')}`
  );
}
