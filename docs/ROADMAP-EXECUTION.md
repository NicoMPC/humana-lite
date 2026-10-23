# Feuille de route d'exécution — Humana Lite (devis signé 22/10/2026)

Référence : devis NFS-DEV-2026-1022-HUM-LITE-ECH-V1 (source `devis-humana/sources/devis-humana-lite-abonnement.html`, signé dans `devis-humana/a-envoyer/Devis_NFS-DEV-2026-1022-HUM-LITE-ECH-V1 signe 2 parties.pdf`). Acompte 275 € reçu le 23/10/2026.

## Constat de départ (audit du 23/10/2026)

Le code actuel de `humana-lite/` correspond à l'ancienne version "et c'est tout" (voir `CLAUDE.md` local, désormais obsolète sur ce point) : compositeur PDF par boîtes + archive manuelle + envoi Gmail au clic + code d'accès partagé. Le devis signé va beaucoup plus loin, et B, C, H ont été choisies **à la signature**, pas en option différée.

Écarts constatés :
- Pas de dépôt git pour `humana-lite/` (à créer entièrement).
- `data/questions.js` = questions génériques, pas la vraie grille cheveux V1 ni le modèle de fiche visage de Nathalie.
- `apps-script/Code.gs` interdit explicitement l'envoi d'e-mail ("volontairement") — contradictoire avec le Base signé (envoi auto + relance J+14).
- Pas de formulaire pré-rdv, pas d'intégration Google Agenda.
- `LoginPage.jsx` = code partagé + choix de profil, pas de connexion individuelle serveur.
- Aucun champ "dossier cliente" (allergies, grossesse, traitements, consentement, bilan/photos, synthèse) — option B.
- Aucune option C (validation avant envoi) ni H (RGPD, sauvegarde, purge) codées.

Risque à surveiller : la clause "Mise en service" (5 jours ouvrés après signature + réception des accès) ne vaut explicitement que pour le Pack Base ; B/C/H prises à la signature devraient avoir un délai annoncé maintenant, pas se glisser dans les 5 jours du Base sans le dire à Nathalie.

## Décisions tranchées (23/10/2026)

- **Compte Google** : pendant le dev/les essais, on utilise le compte Google personnel de Nicolas. Un compte dédié à Hu'mana (nouveau, ou celui de Nathalie) ne sera créé/branché qu'à la toute fin, au moment du transfert (Lot 8). Donc le Lot 1 n'attend pas ce compte pour démarrer.
- **GitHub** : nouveau repo privé sous le compte `NicoMPC` existant (comme humana-boutique, mais privé).
- **Hébergement** : GitHub Pages, même mécanique que humana-boutique (`gh-pages -d dist`).
- **Grille peau (visage)** et **cahier des charges cheveux V1 réel** : statut à vérifier (pas confirmés reçus/intégrés). Consigne de Nicolas : ⚠️ **à récupérer absolument, warning permanent tant que non résolu — mais ça ne bloque pas le code.** On avance avec les grilles actuelles (génériques) en attendant, à remplacer dès que les vrais fichiers sont en main.

## ⚠️ À récupérer absolument (ne bloque pas le code, mais à ne jamais perdre de vue)

- [x] **Cahier des charges cheveux V1 + Fiche routine/bibliothèque V1** — récupérés le 23/10/2026 (liens Drive publics trouvés dans `docs/reponses-onboarding-humana.json`). PDF originaux dans `docs/sources-onboarding/`, contenu intégralement transcrit et prêt à l'emploi dans `docs/CONTENU-CHEVEUX-V1.md`. Reste à faire au Lot 2 : l'intégrer dans `data/questions.js` et repenser `BlockKind: 'routine'` pour coller aux 7 vraies rubriques (voir fin de `CONTENU-CHEVEUX-V1.md`).
- [ ] Modèle de fiche visage de Nathalie (pour la grille peau) — toujours pas reçu, à vérifier/redemander.
- [ ] Charte graphique complète (logos, couleurs, typographies) si pas déjà dans `brand/`.
- [ ] Compte Google dédié Hu'mana définitif — à créer/brancher seulement en fin de chantier (Lot 8), pas avant.

## Lots de travail

| Lot | Contenu | Agent | Dépend de | Test de validation |
|---|---|---|---|---|
| 0 | Cadrage & accès : cahier des charges cheveux V1, modèle fiche visage, charte, compte Google dédié, décision GitHub/hébergement | — (pas de code) | — | Checklist d'accès cochée |
| 1 | Fondations : git init + repo GitHub privé + invitations, compte Google dédié configuré, premier déploiement en ligne | Infra | Lot 0 | ✅ repo privé créé et poussé (`github.com/NicoMPC/humana-lite`). Reste : go pour GitHub Pages (en attente), invitations Nathalie/Jessie (comptes GitHub à vérifier) |
| 2 | Vraies grilles Hu'mana (cheveux V1 + peau si reçue) + vraie charte sur les 3 thèmes PDF | Contenu/Diagnostic | Lot 0 | ✅ cheveux fait (23/10, agent) : vraie grille dans `questions.js`, 7 rubriques réelles dans le compositeur PDF (`routinePdf.js`, `routineModel.js`, `RoutineBuilderCheveux.jsx`), bibliothèque de conseils (`conseilsCheveux.js`). `npm run build` + `test-pdf.mjs` OK. Peau toujours générique, en attente du modèle |
| 3 | Process auto bout-en-bout : formulaire pré-rdv → Drive, envoi auto e-mail, relance J+14, trace Agenda | Backend Apps Script + Intégration front | Lot 1 | ✅ envoi auto + relance J+14 (figée) + trace Agenda + toggle option C fait (23/10, agent), code prêt mais **déploiement manuel Apps Script requis** (voir tracker). Formulaire pré-rdv délibérément reporté à une session dédiée |
| 4 | Connexion personnelle (remplace le code partagé) | Auth | Lot 1 | Connexion individuelle testée |
| 5 | Option B : dossier cliente complet (santé, notes, bilan/photos, synthèse) | Dossier cliente | Lot 3 | Fiche test avec note + photo persistée |
| 6 | Option C : validation avant envoi (bascule manuel/auto) | Backend Apps Script + Intégration front | Lots 3, 5 | Mode validation testé dans les deux sens |
| 7 | Option H : RGPD + sauvegarde + purge + consentement signé | Conformité | Lot 5 | Consentement tracé, sauvegarde + purge vérifiées |
| 8 | Recette finale + transfert accès + formation 1h | Chef de chantier (Nicolas) | Tous | Engagements du devis cochés un par un |

Backlog (non pris à la signature, pas de lot maintenant) : options A, D, E, F, G.

## Décisions encore ouvertes

- Texte de consentement RGPD (option H) : à rédiger et faire valider.
- Annoncer à Nathalie un délai spécifique pour B/C/H (distinct du délai Base).
