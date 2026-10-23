# Humana Lite — repères

Version « et c'est tout » pour Hu'mana (Nathalie & Jessie, 2 PC) : choisir type → diagnostic (questions | fiche RDV) → composer le PDF par boîtes ▲▼ avec aperçu live, 3 thèmes → Envoyer (Gmail pré-rempli) / Archiver (dossier Drive par cliente via Apps Script) + Produits (manuel/CSV). Rien d'autre (pas de dashboard, relances, photos, notifs, onboarding).
Forké de `../humana-boutique` (non touché). Interface entre modules : `docs/CONTRACT.md`. Backend : projet Apps Script SÉPARÉ de celui de la boutique (compte seopourvous@gmail.com), même classeur mais onglets ArchClientes/ArchDocuments (`apps-script/Code.gs`, `src/lib/sheetsSync.js` : URL + LITE_TOKEN). Jamais de code d'envoi de mail côté Apps Script. Lancer : `./humana.sh` (port 4176) ou `npm run dev`.
