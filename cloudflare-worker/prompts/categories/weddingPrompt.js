/**
 * weddingPrompt.js — Build prompt subject block for wedding category
 */
import { formatOutfit }    from '../elements/outfitPrompt.js';
import { resolveLocation } from '../elements/locationPrompt.js';
import { formatPose }      from '../elements/posePrompt.js';
import { formatExpression }from '../elements/expressionPrompt.js';

export function buildWeddingPrompt(input) {
  const parts = [];

  const groomDesc  = input.etnis_pria   || 'handsome groom';
  const brideDesc  = input.etnis_wanita || 'beautiful bride';
  const groomOutfit = formatOutfit(input.outfit_pria, input.outfit_pria_custom);
  const brideOutfit = formatOutfit(input.outfit_wanita, input.outfit_wanita_custom);

  let subject = `${groomDesc}`;
  if (groomOutfit) subject += `, wearing ${groomOutfit}`;
  subject += `, and ${brideDesc}`;
  if (brideOutfit) subject += `, wearing ${brideOutfit}`;

  parts.push(`A stunning wedding portrait: ${subject}`);

  const loc = resolveLocation(input.location, input.location_custom);
  if (loc) parts.push(`at ${loc}`);

  const pose   = formatPose(input.pose);
  const expr   = formatExpression(input.expression);
  const dekor  = input.dekorasi?.trim();
  const time   = input.time?.trim();

  if (pose)  parts.push(pose);
  if (expr)  parts.push(expr);
  if (time)  parts.push(time);
  if (dekor) parts.push(dekor);

  return parts.filter(Boolean).join(', ');
}
