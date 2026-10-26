# Addendum au contrat — rouvrir un document archivé pour l'éditer

À fusionner dans `docs/CONTRACT.md` (ne pas l'éditer directement ici).

## Problème résolu

Depuis Archives, on ne pouvait retrouver que l'identité de la cliente d'un
document archivé, jamais le contenu du compositeur (réponses, routine
composée, thème, blocs activés/désactivés) : impossible de reprendre un
diagnostic déjà envoyé pour le corriger.

## Nouveau champ `composerDoc`

- Ajouté à l'objet document de l'onglet `ArchDocuments` (`apps-script/Code.gs`,
  `archivePdf_`), **avant l'`upsert_`** : `doc.composerDoc = clampComposerDoc_(p.composerDoc || null)`.
  `upsert_` sérialise tout l'objet `doc` dans la colonne `json` — `composerDoc`
  est donc automatiquement renvoyé par l'action `pull` existante
  (`readAll_()` reparse cette colonne intégralement), sans toucher à `HEADERS`
  ni à `doGet`/`doPost`.
- `archiveEtEnvoyer_` ne construit pas son propre objet document pour
  `ArchDocuments` : il délègue entièrement à `archivePdf_(p)`, qui reçoit le
  même payload `p` (donc le même `p.composerDoc`). Aucune modification
  supplémentaire n'était nécessaire côté `archiveEtEnvoyer_` pour ce champ.
- Valeur stockée : l'objet `doc` complet du compositeur, tel que défini dans
  ce contrat (`type, theme, client, meta, boutique, footerMessage, reponses,
  blocks`).

## Garde de taille (non bloquante)

`clampComposerDoc_(obj)` (`apps-script/Code.gs`) : si
`JSON.stringify(p.composerDoc).length` dépasse **40 000 caractères** (marge
sous la limite ~50 000 caractères d'une cellule Google Sheets), `composerDoc`
est stocké à `null` — **l'archivage du PDF continue normalement**, c'est la
fonction critique. "Rouvrir pour éditer" devient simplement indisponible pour
ce document, sans aucune erreur ni blocage visible pour l'utilisatrice.

## API (`src/lib/sheetsSync.js`)

`archivePdf({ client, docType, fileName, dataUrl, meta, composerDoc? })` et
`archiveEtEnvoyer({ client, docType, fileName, dataUrl, meta, email, boutique,
tutoiement, composerDoc? })` acceptent désormais ce paramètre optionnel,
transmis tel quel dans le payload POST. Omis → comportement inchangé
(rétrocompatible).

Côté `pull` (inchangé en signature), chaque document de la liste `documents`
peut maintenant porter un champ `composerDoc` (objet ou absent) :

```js
documents: [{ id, client_id, type, date, auteur, lieu, url, nom, fileId, composerDoc? }]
```

`composerDoc` est **absent** (pas juste `null`) pour :
- les documents archivés avant cette version (jamais envoyé) ;
- les documents dont le compositeur dépassait la garde de taille.

## Flux de reprise (front)

1. `src/pages/StudioPage.jsx` (`ComposeStep.run`) passe `composerDoc: doc`
   (l'état complet du compositeur) à chaque appel `archivePdf`/`archiveEtEnvoyer`.
2. `src/store/useStudio.js` expose `loadDoc(doc)` : `set({ doc, step: 2 })` —
   reprend directement à l'étape composition (le bouton "Retour" existant de
   `ComposeStep` permet de revenir aux questions si besoin).
3. `src/pages/ArchivesPage.jsx` affiche un bouton "Reprendre pour modifier"
   à côté de "Ouvrir", **uniquement si `d.composerDoc` existe** (sinon : pas de
   bouton, pas de message). Au clic : confirmation (pattern `confirmDialog` de
   `src/store/useUI.js`, identique à `restart()` dans `StudioPage.jsx`) si un
   brouillon est déjà en cours dans le compositeur, puis
   `useStudio.getState().loadDoc(d.composerDoc)` et navigation vers `/`.

## Limites connues

- Documents archivés avant ce changement : pas de `composerDoc`, donc pas
  rouvrables (pas de rétro-remplissage possible, le contenu n'a jamais été
  envoyé au backend).
- Documents dont le `doc` compositeur dépasse ~40 000 caractères sérialisés
  (routine très longue, beaucoup de texte libre) : non rouvrables, sans que
  l'archivage échoue pour autant.
- Rouvrir un document ne restaure pas le `client.id` serveur si celui-ci a
  changé depuis (cas rare) ; `doc.client` reste celui capturé au moment de
  l'archivage.
