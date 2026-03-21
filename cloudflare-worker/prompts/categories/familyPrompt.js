/**
 * familyPrompt.js — Build prompt subject block for family category
 *
 * Family uses studio themes only (no outdoor location keys).
 */
import { formatExpression }from '../elements/expressionPrompt.js';

export function buildFamilyPrompt(input) {
  const parts = [];

  const composition = input.family_anggota?.trim() || 'loving Indonesian family';
  const etnis       = input.etnis_family?.trim() || 'beautiful Indonesian family';
  const outfit      = input.family_outfit?.trim();
  const tema        = input.family_tema?.trim() || 'warm white family studio, soft warm-toned white seamless backdrop';
  const suasana     = input.family_suasana?.trim();
  const expr        = formatExpression(input.expression);

  let subject = `${composition}, ${etnis}`;
  if (outfit) subject += `, wearing ${outfit}`;

  parts.push(`A warm family portrait: ${subject}`);
  if (tema)    parts.push(tema);
  if (suasana) parts.push(suasana);
  if (expr)    parts.push(expr);

  return parts.filter(Boolean).join(', ');
}
