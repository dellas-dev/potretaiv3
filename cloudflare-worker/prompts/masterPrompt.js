/**
 * masterPrompt.js — Cinematic quality suffix auto-injected into every prompt
 *
 * Per CLAUDE.md: these tags are ALWAYS appended by PromptBuilder.
 * They must never be shown to or modified by the user.
 *
 * Used by promptBuilder.js → CINEMATIC_SUFFIX
 */

export const CINEMATIC_SUFFIX = [
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
  '85mm lens',
  'full frame camera',
  'RAW photo',
  'HDR',
  'realistic skin tones',
  'no text',
  'no watermark',
].join(', ');
