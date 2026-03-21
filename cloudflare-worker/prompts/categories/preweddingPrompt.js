/**
 * preweddingPrompt.js — Build prompt subject block for prewedding category
 *
 * Assembles: subjects (pria + wanita with outfits) + location + scene elements.
 * promptBuilder.js calls buildPreweddingPrompt(input) then appends photography.
 */
import { formatOutfit }    from '../elements/outfitPrompt.js';
import { resolveLocation } from '../elements/locationPrompt.js';
import { formatPose }      from '../elements/posePrompt.js';
import { formatExpression }from '../elements/expressionPrompt.js';
import { formatWeather }   from '../elements/weatherPrompt.js';
import { formatProps }     from '../elements/propsPrompt.js';

export function buildPreweddingPrompt(input) {
  const parts = [];

  // ── Subjects ───────────────────────────────────────────────────────────────
  const maleDesc   = input.etnis_pria   || 'handsome man';
  const femaleDesc = input.etnis_wanita || 'beautiful woman';
  const maleOutfit = formatOutfit(input.outfit_pria, input.outfit_pria_custom);
  const femOutfit  = formatOutfit(input.outfit_wanita, input.outfit_wanita_custom);

  let subject = `${maleDesc}`;
  if (maleOutfit) subject += `, wearing ${maleOutfit}`;
  subject += `, and ${femaleDesc}`;
  if (femOutfit) subject += `, wearing ${femOutfit}`;

  parts.push(`A romantic prewedding couple portrait: ${subject}`);

  // ── Location ───────────────────────────────────────────────────────────────
  const loc = resolveLocation(input.location, input.location_custom);
  if (loc) parts.push(`photographed at ${loc}`);

  // ── Scene ──────────────────────────────────────────────────────────────────
  const pose    = formatPose(input.pose);
  const expr    = formatExpression(input.expression);
  const weather = formatWeather(input.atmosphere);
  const props   = formatProps(input.props);
  const time    = input.time?.trim();

  if (pose)    parts.push(pose);
  if (expr)    parts.push(expr);
  if (time)    parts.push(time);
  if (weather) parts.push(weather);
  if (props)   parts.push(props);

  return parts.filter(Boolean).join(', ');
}
