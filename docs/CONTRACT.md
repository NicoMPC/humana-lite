# Contrat inter-agents — Humana Lite (seule interface entre A, B, C)

Dossier : `/home/liline/Bureau/freelance/HUMANA/humana-lite/`. Ne jamais toucher `../humana-boutique*` ni `../humana-demo-prospects`.
Chaque agent ne modifie QUE ses fichiers (listés dans son brief). Réponse finale ≤150 mots, sans dump de code.

## Objet `doc` (état du compositeur, sérialisable)
```js
doc = {
  type: 'peau' | 'cheveux',
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
  routine     // structure différente selon doc.type (voir détail juste après ce tableau)
  conseils    { texte: string }                    // conseils généraux libres
  lifestyle   { tips: [{ titre, texte }] }
  message     { texte: string }                    // = footerMessage par défaut
  coordonnees {}                                   // doc.boutique
```
Défauts (26/10/2026, conforme au devis « onglet Lifestyle en fin de questionnaire ») : peau/cheveux →
entete, diagnostic, routine, conseils, **lifestyle**, message, coordonnees. Le lifestyle n'est plus un
`doc.type` séparé : c'est un bloc systématique en fin de chaque diagnostic (voir
`docs/CONTRACT-ADDENDUM-lifestyle-tab.md` pour le détail du changement).
Thèmes (`src/lib/pdf/themes.js`, propriétaire : agent A) : `THEMES[key] = { label, colors: <mêmes clés que COLORS de brand.js> }` ; sauge = palette actuelle.

### Détail `BlockKind: 'routine'` — structure selon `doc.type`

**`peau`** (grille réelle pas encore reçue côté peau, modèle historique conservé) :
```js
data = { items: [{ produit: {nom, ref?, prix?}, moments: ('matin'|'soir'|'hebdo')[], conseil: string }] }
```

**`cheveux`** (7 rubriques réelles V1, transcrites depuis `docs/CONTENU-CHEVEUX-V1.md` section B) :
```js
data = {
  objectifs: string[],                 // 1. Ma routine cheveux — objectifs principaux, pas de diagnostic
  jourLavage: Etape[],                  // 2. Mon jour de lavage (ordre réel d'utilisation)
  entreShampoings: Etape[],             // 3. Entre mes shampoings (refresh), disparaît si vide
  soinsProfonds: { hebdo: Etape[], mensuel: Etape[], trimestriel: Etape[] },  // 4. Mes soins profonds
  soinsSpecifiques: Etape[],            // 5. Mes soins spécifiques (lotion, cure, HE…)
  gestes: [{ categorie: string, texte: string }],  // 6. Mes gestes & habitudes — sélection personnalisée de data/conseilsCheveux.js
  tips: string[],                       // 7. Mes tips à ne pas oublier — 3 à 6 formulations, data/conseilsCheveux.js
}
// Etape = { produit?: {nom, ref?, prix?}, geste?: string, localisation?, quantite?, methode?,
//           tempsDePose?, nombre?, frequence?, dureeCure? }
// Une étape sans produit ET sans geste est ignorée ; un champ vide n'est pas affiché dans le PDF.
// `geste` (texte libre, sans produit) seulement pour entreShampoings/soinsSpecifiques.
```
Rendu : `src/lib/pdf/routinePdf.js` (`drawRoutine` dispatch selon `ctx.type` : `drawRoutineCheveux` / `drawRoutineMoments`).
Édition : `src/components/studio/BlockBox.jsx` dispatch selon `doc.type` vers `RoutineBuilderCheveux.jsx` ou `RoutineBuilder.jsx` (peau).
Défauts vierges : `DEFAULT_DATA.routine(type)` dans `src/lib/pdf/index.js` / `emptyRoutineCheveux()` dans `src/lib/pdf/routineModel.js`.

## API A → B (src/lib/pdf/index.js)
`renderPdf(doc, { loadAsset }) → Promise<{ blob, url, dataUrl, fileName }>`  (`dataUrl` = `doc.output('datauristring')`)
`fileName` = `<Type>_<Nom>_<Prenom>_<AAAA-MM-JJ>.pdf`. Export aussi `THEMES`, `DEFAULT_BLOCKS(type)`, `browserAssetLoader`.
`node scripts/test-pdf.mjs` (écrit par A) doit générer 3 types × 3 thèmes.

## API C → B (src/lib/sheetsSync.js + store)
`pullArchives() → Promise<{ ok, clients: [{id,prenom,nom,email,folderUrl}], documents: [{id,client_id,type,date,auteur,url,nom}] }>`
`archivePdf({ client, docType, fileName, dataUrl, meta:{date,auteur,lieu} }) → Promise<{ ok, clientId, folderUrl, fileUrl, fileId, created:boolean }>`
Règle serveur : clé cliente = nom+prénom normalisés (minuscules, sans accents/espaces multiples) ; existante → même dossier, sinon création dossier + fiche.
Composants C exposent : `pages/ArchivesPage.jsx` (défaut), `components/studio/ClientPicker.jsx` (`<ClientPicker value onChange />`, autocomplete sur `pullArchives`, saisie libre = nouvelle cliente).
Stub attendu côté B tant que C n'a pas fini : appels via `lib/sheetsSync.js` uniquement (jamais `fetch` direct).

### Envoi auto + relance J+14 + option C (devis signé 22/10/2026)
Le backend (`apps-script/Code.gs`) sait maintenant envoyer l'e-mail (`GmailApp`/`MailApp`), programmer une
relance à J+14 (`RELANCE_DELAI_JOURS`, constante figée) et tracer chaque envoi dans l'Agenda Google. Le sujet
et le corps restent composés côté client (`lib/email.js#buildEmail`, `autoAttache:true` pour ce flux : pas de
phrase « glisser le PDF », le backend joint lui-même le fichier déjà archivé) ; le serveur ne fait qu'envoyer
ce qu'on lui donne.

`archiveEtEnvoyer({ client, docType, fileName, dataUrl, meta:{date,auteur,lieu}, email:{to,sujet,corps}, boutique:{nom}, tutoiement }) → Promise<{ ok, clientId, folderUrl, fileUrl, fileId, created, envoiStatut:'envoye'|'en_attente', pendingId? }>`
— `envoiStatut:'en_attente'` quand le réglage global « validation avant envoi » (option C) est actif : rien n'est
parti, l'e-mail attend un clic humain.

`pullEnvoisEnAttente() → Promise<{ ok, envois:[{id,client_id,email,prenom,sujet,date_creation,statut}] }>`
`validerEnvoi(id) → Promise<{ ok }>` — envoie réellement un e-mail resté en attente (+ programme sa relance J+14).
`annulerEnvoi(id) → Promise<{ ok }>` — rejette un e-mail en attente sans l'envoyer.
`getReglagesEnvoi() → Promise<{ ok, validationAvantEnvoi:boolean }>`
`setValidationAvantEnvoi(bool) → Promise<{ ok, validationAvantEnvoi }>` — réglage global (pas par cliente), exposé dans `pages/ReglagesPage.jsx`.

### Fiche cliente : historique des mails + relance personnalisable (23/10/2026)
`pullRelances() → Promise<{ ok, relances:[{id,client_id,email,prenom,date_envoi_diag,date_relance_prevue,statut,auteur,sujet,corps,modifie,boutiqueNom,tutoiement,editable:boolean}] }>`
— toutes les relances (historique + à venir), pas seulement celles en attente. `editable` (calculé serveur) : vrai
seulement si `statut:'en_attente'` ET la date prévue n'est pas encore atteinte (modifiable jusqu'à J-1 inclus,
verrouillé le jour même de l'envoi).
`modifierRelance(id, { sujet, corps }) → Promise<{ ok }>` — édite le brouillon d'une relance pas encore partie ;
rejeté (`{ ok:false, error }`) si `editable` est déjà faux côté serveur (règle J-1 revérifiée à l'écriture, pas
seulement affichée côté appli).

Toutes ces fonctions suivent le pattern existant : jamais d'exception, toujours `{ ok, ... }` ou `{ ok:false, error }`.
Déploiement manuel requis côté Apps Script (scopes Gmail/Agenda à autoriser + `installerDeclencheurs_()` à exécuter
une fois) : voir l'en-tête de `apps-script/Code.gs`.

## Store / données locales
Produits en localStorage (Zustand, `store/useStore.js`, propriétaire : B) : `{ id, nom, ref?, prix?, categorie?, actif }` ; import CSV/Planity via `lib/planityImport.js` existant.
Réglages boutique + signature + code d'accès (`Humanabeta`) : `settings` du store, propriétaire : B.
