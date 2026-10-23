/** Sélecteurs et helpers purs. */
import { CATEGORY_MAP } from '../data/constants';

export const answerIsFilled = (answer) =>
  Array.isArray(answer) ? answer.length > 0 : answer !== undefined && answer !== null && String(answer).trim() !== '';

/** Progression du questionnaire à partir de `doc.reponses`. */
export function quizProgress(reponses, questions) {
  const list = questions || [];
  const answered = list.filter((q) => answerIsFilled(reponses?.[q.id])).length;
  return { answered, total: list.length };
}

/** Produits actifs, ceux du type demandé (ou mixtes) d'abord, puis par ordre d'application. */
export function produitsActifs(produits, type) {
  const rank = (p) => (p.cible && p.cible !== 'mixte' && p.cible !== type ? 1 : 0);
  return produits
    .filter((p) => p.actif !== false)
    .sort((a, b) => rank(a) - rank(b) || (CATEGORY_MAP[a.categorie]?.ordre || 9) - (CATEGORY_MAP[b.categorie]?.ordre || 9) || a.nom.localeCompare(b.nom, 'fr'));
}

/** Produit du catalogue -> produit d'un item de routine (contrat : { nom, ref?, prix? }). */
export function toDocProduit(p) {
  const out = { nom: p.nom };
  if (p.reference) out.ref = p.reference;
  if (p.prix !== undefined && p.prix !== null && String(p.prix) !== '' && Number(p.prix) > 0) out.prix = String(p.prix);
  return out;
}
