# Contrat inter-agents — Humana Lite (seule interface entre A, B, C)

Dossier : `/home/liline/Bureau/freelance/HUMANA/humana-lite/`. Ne jamais toucher `../humana-boutique*` ni `../humana-demo-prospects`.
Chaque agent ne modifie QUE ses fichiers (listés dans son brief). Réponse finale ≤150 mots, sans dump de code.

## Objet `doc` (état du compositeur, sérialisable)
```js
doc = {
  type: 'peau' | 'cheveux' | 'lifestyle',
  theme: 'sauge' | 'argile' | 'ardoise',
  client: { id?: string, prenom: string, nom: string, email?: string },
  meta: { date: 'YYYY-MM-DD', auteur: 'Jessie' | 'Nathalie' | string, lieu: 'boutique' | 'visio' },
  boutique: { nom, slogan, adresse, telephone, email, site, instagram },
  footerMessage: string,            // message de fin, éditable
  reponses: { [questionId]: string | string[] },   // diagnostic (vide pour lifestyle)
  blocks: [ { id: string, kind: BlockKind, on: boolean, data: object } ]   // l'ORDRE du tableau = ordre dans le PDF
}
BlockKind = 'entete' | 'diagnostic' | 'routine' | 'conseils' | 'lifestyle' | 'message' | 'coordonnees'
data par kind :
  entete      {}                                   // logo, titre, « préparée pour », date, « par <auteur> »
  diagnostic  {}                                   // synthèse de doc.reponses (questions data/questions.js)
  routine     { items: [{ produit: {nom, ref?, prix?}, moments: ('matin'|'soir'|'hebdo')[], conseil: string }] }
  conseils    { texte: string }                    // conseils généraux libres
  lifestyle   { tips: [{ titre, texte }] }
  message     { texte: string }                    // = footerMessage par défaut
  coordonnees {}                                   // doc.boutique
```
Défauts : peau/cheveux → entete, diagnostic, routine, conseils, message, coordonnees. lifestyle → entete, lifestyle, message, coordonnees.
Thèmes (`src/lib/pdf/themes.js`, propriétaire : agent A) : `THEMES[key] = { label, colors: <mêmes clés que COLORS de brand.js> }` ; sauge = palette actuelle.

## API A → B (src/lib/pdf/index.js)
`renderPdf(doc, { loadAsset }) → Promise<{ blob, url, dataUrl, fileName }>`  (`dataUrl` = `doc.output('datauristring')`)
`fileName` = `<Type>_<Nom>_<Prenom>_<AAAA-MM-JJ>.pdf`. Export aussi `THEMES`, `DEFAULT_BLOCKS(type)`, `browserAssetLoader`.
`node scripts/test-pdf.mjs` (écrit par A) doit générer 3 types × 3 thèmes.

## API C → B (src/lib/sheetsSync.js + store)
`pullArchives() → Promise<{ ok, clients: [{id,prenom,nom,email,folderUrl}], documents: [{id,client_id,type,date,auteur,url,nom}] }>`
`archivePdf({ client, docType, fileName, dataUrl, meta:{date,auteur,lieu} }) → Promise<{ ok, clientId, folderUrl, fileUrl, created:boolean }>`
Règle serveur : clé cliente = nom+prénom normalisés (minuscules, sans accents/espaces multiples) ; existante → même dossier, sinon création dossier + fiche.
Composants C exposent : `pages/ArchivesPage.jsx` (défaut), `components/studio/ClientPicker.jsx` (`<ClientPicker value onChange />`, autocomplete sur `pullArchives`, saisie libre = nouvelle cliente).
Stub attendu côté B tant que C n'a pas fini : appels via `lib/sheetsSync.js` uniquement (jamais `fetch` direct).

## Store / données locales
Produits en localStorage (Zustand, `store/useStore.js`, propriétaire : B) : `{ id, nom, ref?, prix?, categorie?, actif }` ; import CSV/Planity via `lib/planityImport.js` existant.
Réglages boutique + signature + code d'accès (`Humanabeta`) : `settings` du store, propriétaire : B.
