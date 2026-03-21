/**
 * studioPrompt.js — Build prompt subject block for studio category
 *
 * studio_mode: solo_wanita | solo_pria | pasangan
 */
import { formatOutfit }    from '../elements/outfitPrompt.js';
import { formatPose }      from '../elements/posePrompt.js';
import { formatExpression }from '../elements/expressionPrompt.js';

export function buildStudioPrompt(input) {
  const parts = [];
  const mode  = input.studio_mode || 'solo_wanita';
  const tema  = input.studio_tema?.trim() || 'professional studio portrait, seamless white backdrop';
  const light = input.lighting?.trim();
  const pose  = formatPose(input.pose);
  const expr  = formatExpression(input.expression);

  if (mode === 'solo_wanita') {
    const desc   = input.etnis_wanita || 'stunning woman';
    const outfit = formatOutfit(input.outfit_wanita, input.outfit_wanita_custom);
    let subject = desc;
    if (outfit) subject += `, wearing ${outfit}`;
    parts.push(`A professional studio portrait: ${subject}`);

  } else if (mode === 'solo_pria') {
    const desc   = input.etnis_pria || 'distinguished man';
    const outfit = formatOutfit(input.outfit_pria, input.outfit_pria_custom);
    let subject = desc;
    if (outfit) subject += `, wearing ${outfit}`;
    parts.push(`A professional studio portrait: ${subject}`);

  } else {
    // pasangan
    const maleDesc   = input.etnis_pria   || 'distinguished man';
    const femaleDesc = input.etnis_wanita || 'stunning woman';
    const maleOutfit = formatOutfit(input.outfit_pria, input.outfit_pria_custom);
    const femOutfit  = formatOutfit(input.outfit_wanita, input.outfit_wanita_custom);

    let subject = maleDesc;
    if (maleOutfit) subject += `, wearing ${maleOutfit}`;
    subject += `, and ${femaleDesc}`;
    if (femOutfit) subject += `, wearing ${femOutfit}`;
    parts.push(`A professional studio couple portrait: ${subject}`);
  }

  if (tema)  parts.push(tema);
  if (light) parts.push(light);
  if (pose)  parts.push(pose);
  if (expr)  parts.push(expr);

  return parts.filter(Boolean).join(', ');
}
