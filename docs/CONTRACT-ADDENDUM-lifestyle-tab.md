# Addendum au contrat — Lifestyle = onglet de fin, pas un type de diagnostic

Conforme au devis signé (« Diagnostic lifestyle ; onglet Lifestyle en fin de questionnaire ») :
le lifestyle n'est plus un type de document sélectionnable, mais un bloc qui termine
systématiquement chaque diagnostic Cheveux/Peau.

## Ce qui change

- `doc.type` : seulement `'peau' | 'cheveux'` désormais (plus de `'lifestyle'`). `BlockKind`
  reste inchangé (`'lifestyle'` existe toujours comme nature de bloc, au même titre que
  `'routine'` ou `'conseils'`).
- `DEFAULT_KINDS.peau` et `DEFAULT_KINDS.cheveux` (`src/data/constants.js`) incluent désormais
  `'lifestyle'`, juste avant `'message'` : `[..., 'conseils', 'lifestyle', 'message', 'coordonnees']`.
  La clé `DEFAULT_KINDS.lifestyle` a disparu.
- `DEFAULT_BLOCKS(type)` (`src/lib/pdf/index.js`) n'a plus de branche spéciale pour
  `type === 'lifestyle'` : même liste de kinds pour peau et cheveux, synchronisée avec
  `DEFAULT_KINDS`.
- `DIAG_TYPES` (`src/data/constants.js`) et `TYPE_CARDS` (`src/pages/StudioPage.jsx`) n'ont
  plus d'entrée `lifestyle` — l'écran de choix du type ne propose plus que Cheveux/Peau.

## Ce qui ne change pas

- Le kind de bloc `'lifestyle'` (édition générique dans `BlockBox.jsx`, dessin dans
  `lifestylePdf.js#drawLifestyle`, données `{ tips: [...] }`) fonctionne à l'identique — il
  était déjà indépendant du type de diagnostic.
- `drawLifestyle` ajoutait déjà une barre de section « Lifestyle » dès que `ctx.type !== 'lifestyle'` ;
  ce comportement (barre affichée) devient donc permanent puisque ce cas est désormais systématique.
- Des mappings historiques conservent une entrée `lifestyle` pour l'affichage/rendu de documents
  existants ou comme filet de repli (`src/lib/email.js#SUJETS/OBJETS`, `src/lib/pdf/index.js#TYPE_FILE/TYPE_TITLES`,
  `src/pages/ArchivesPage.jsx#TYPE_LABELS`) : volontairement non touchés, ce ne sont pas des types
  sélectionnables dans le flux actuel.

## Impact test

`scripts/test-pdf.mjs` teste désormais 2 types (peau, cheveux) × 3 thèmes, et vérifie en plus
que `DEFAULT_BLOCKS('peau')`/`DEFAULT_BLOCKS('cheveux')` contiennent bien un bloc de kind
`'lifestyle'`. Avec ce bloc ajouté, le PDF peau passe à 3 pages (limite haute acceptée, test
toujours vert) ; le PDF cheveux reste à 2 pages.
