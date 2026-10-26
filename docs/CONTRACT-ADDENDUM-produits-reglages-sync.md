# Addendum CONTRACT — synchro produits + réglages (catalogue partagé)

À fusionner dans `docs/CONTRACT.md` (section « Store / données locales »)
après coup — pas touché directement dans ce chantier.

## Pourquoi

`produits` et `settings` (réglages boutique) n'étaient persistés qu'en
localStorage : chaque poste (Jessie / Nathalie) avait son propre catalogue.
Le devis promet un catalogue **partagé**. On étend le mécanisme déjà utilisé
pour les archives clientes (`apps-script/Code.gs` + `lib/sheetsSync.js`),
pas un nouveau système.

## Nom des onglets — attention collision

Le classeur Google Sheets est **partagé avec la boutique** (même
`SPREADSHEET_ID`), qui a son propre projet Apps Script avec des onglets
`Clientes` / `Diagnostics` / `Produits` / `Settings`. Un onglet Lite nommé
`Produits` aurait donc pointé vers l'onglet réel de la boutique et risqué
d'écraser ses données de production. D'où :
- Produits → onglet **`LiteProduits`** (pas `Produits`), même logique que
  `ArchClientes`/`ArchDocuments` qui évitent déjà `Clientes`/`Diagnostics`.
- Réglages → onglet **`Reglages`** (français) : pas de collision avec
  `Settings` (anglais) de la boutique, gardé tel quel.

## Nouvelles actions API

### GET `pullProduits`
→ `{ ok, produits: [...] }` — tableau d'objets produit complets (`id, nom,
prix, categorie, actif, stock, cible, reference, ean, description`), lu
directement depuis la colonne `json` de l'onglet `LiteProduits` (comme tous
les autres onglets de ce backend, la colonne `json` fait foi).

### GET `pullReglages`
→ `{ ok, reglages }` — objet `settings` complet (`securite, boutique,
footerMessage, stock`, etc.), ou `reglages: null` si jamais encore écrit
côté Sheet. Document **unique** (id fixe `'reglages'`), pas une liste.

### POST `pushProduits`
Payload : `{ produits: [...] }` — remplace l'intégralité du catalogue côté
Sheet (le client renvoie toujours l'état complet après chaque mutation
locale). Protégé par `LockService.getScriptLock()` comme `archivePdf_`.
→ `{ ok }`.

### POST `pushReglages`
Payload : `{ reglages: {...} }` — `upsert_` la ligne unique (id fixe).
→ `{ ok }`.

Les 4 fonctions suivent le pattern déjà en place : jamais d'exception qui
remonte sans être catchée, toujours `{ ok, ... }` ou `{ ok:false, error }`.

## Stratégie de synchro côté client (`useStore.js`)

- **Pull au démarrage** : `hydrateFromSheet()` (nouvelle action du store)
  appelée une seule fois depuis `App.jsx` (composant racine, `useEffect` au
  montage). Si le pull réussit, remplace `produits`/`settings` en mémoire ;
  s'il échoue (backend pas encore redéployé, hors ligne), garde
  silencieusement le cache localStorage existant. Ne bloque jamais l'UI :
  comme la persistance localStorage charge déjà l'état avant ce pull, l'appli
  n'affiche jamais un état vide pendant l'attente — pas d'indicateur de
  chargement ajouté (resterait trompeur de l'ajouter pour un cas qui ne se
  voit pas).
- **Push après mutation** : `addProduit`, `updateProduit`, `deleteProduit`,
  `applyStockImport` déclenchent un push debounced de `produits` ;
  `updateSettings` et `applyStockImport` (qui touche aussi `settings.stock`)
  déclenchent un push debounced de `settings`. Debounce de 500 ms (deux
  timers de module séparés, un par flux) pour éviter de spammer l'API à
  chaque frappe dans un champ de Réglages.
- **Best-effort, optimiste** : l'UI ne dépend jamais du résultat du push
  (pas de `await`, pas de rollback si ça échoue). Le prochain pull (rechargement
  de l'appli) réconciliera.
- **Dernière écriture gagne, pas de fusion fine** : choix de simplicité
  volontaire pour une appli à 2 utilisatrices, volume faible.

## Tests

`scripts/test-produits-sync.mjs` — mocke `global.fetch`, vérifie que les 4
fonctions appellent la bonne action avec le bon payload, parsent `{ ok:true,
... }`, et renvoient `{ ok:false, error }` sans lever sur erreur réseau ou
réponse `{ ok:false }`. Le vrai backend déployé ne connaît pas encore ces
actions : redéploiement de `Code.gs` nécessaire avant test en conditions
réelles.
