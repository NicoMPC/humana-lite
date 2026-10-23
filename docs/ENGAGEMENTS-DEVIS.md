# Engagements du devis V4 vs code (audit du 20/09/2026, mis à jour après révision produit)

Légende : ✅ codé · ⚠️ partiel · ❌ à développer. Heures = estimation d'audit (à 80 €/h : ×80).

## Socle (Pack Base 899 €)
| Promesse du devis | État | À faire | h |
|---|---|---|---|
| Choix Peau/Cheveux/Lifestyle, diagnostic guidé, passer le questionnaire | ✅ | — | 0 |
| Routine + conseils matin/soir/hebdo | ✅ | — | 0 |
| Catalogue manuel + import CSV/Excel Planity | ✅ | import par défaut du xls (fichier à localiser) | 1-2 |
| Catalogue **partagé** entre les 2 postes | ❌ localStorage | sync Sheet | 6-8 (avec réglages) |
| PDF par boîtes ▲▼, aperçu, 3 thèmes, message/coordonnées, date, auteur | ✅ | PDF allégés (polices réduites, `compress`) | 2-3 |
| Retour à l'accueil à toute étape | ⚠️ | lien Accueil fiable | 1-2 |
| Gmail pré-rempli tu/vous | ✅ | marqueur « envoyé le » | 1-2 |
| Dossier Drive par cliente + historique | ✅ | — | 0 |
| Retrouver une cliente sans ressaisie | ⚠️ homonymes fusionnent (clé nom+prénom) | choix explicite existante/nouvelle | 2-3 |
| Suppression cliente/document (RGPD) | ❌ | actions serveur + UI | 3-4 |
| Réglages (coordonnées, signature) partagés | ❌ localStorage | sync Sheet | (inclus ci-dessus) |
| Code d'accès contrôlé **côté serveur**, jeton hors du code public | ❌ (bundle JS) | vérification Apps Script | 3-4 |
| Fichiers Drive **privés**, ouverts via l'appli | ❌ (lien partagé) | lecture authentifiée via Apps Script | 4-6 |
| Installation sur le site existant, non référencée (noindex) | ⚠️ `base:'./'`+HashRouter OK, pas de noindex | noindex + test sous-dossier | 1-2 |
| Transfert vers compte Google Hu'mana, recette, formation 1 h | ❌ | à la livraison | 3-4 |
| **Mot de passe individuel** (Jessie, Nathalie), vérifié serveur | ❌ (code partagé) | comptes Sheet + session | 8-12 |
| Notes libres + case « consentement » datée sur la fiche cliente | ❌ | champs fiche + sync | 2-3 |
| Charte graphique Hu'mana appliquée (logo, couleurs, typos, 3 thèmes) | ✅ base présente | affinage avec la charte fournie | 2-4 |
| Questions réglées avec elles + catalogue Planity importé à la livraison | ❌ | config à la livraison | 2-4 |
**Total restant ≈ 40-60 h** (soit ≈ 3 200-4 800 € à 80 €/h pour un socle à 899 €).

## Options (V4 révisée)
| Option | Prix | Existant | Effort |
|---|---|---|---|
| Ajouter des praticiennes (≤10, connexion et clientes propres) | 290 € | port (EquipePage, sélecteurs) | 6-8 h |
| Modifier les questions soi-même (tous / une cliente) | 250 € | éditeur global à porter ; « par fiche » à créer | 8-10 h |
| Suivi photo avant/après + tableau de bord relances | 290 € | port depuis l'archive | 8-10 h |
| E-mails + relances automatiques, à la charte (HTML) | 490 € | envoi au clic à porter ; **déclencheur quotidien à créer** ; HTML à créer ; modèles à porter | 16-21 h |
| Panier QR / WhatsApp | 600 € | QR factice (démo) ; page publique, panier, WhatsApp, WooCommerce à créer | 16-24 h |
| Conformité (registre, purge) + sauvegardes hebdo | 350 € | ❌ | 7-11 h |
Retiré des options (décision 20/09) : charte graphique (→ socle), mot de passe individuel (→ socle), sauvegardes seules et e-mails HTML seuls (fusionnés).
Total options 2 270 € ; tout inclus 3 169 € ; Pack Automatisation (suivi + e-mails + conformité = 1 130 €) 1 017 €.

## Dépendances tierces
Accès hébergement du site (FTP/hébergeur, prestataire tiers éventuel) · compte Google Hu'mana (Workspace recommandé) · boutique en ligne + numéro WhatsApp (O7) · Planity sans API (import manuel) · code d'envoi d'e-mails : à porter depuis `humana-boutique-archive` (le classificateur de Claude Code bloque son écriture directe).

---
## Devis V5 (20/09/2026) — refonte « lignes, maintenant / plus tard »
Basé sur `reponses-onboarding-humana.json` + cahier des charges cheveux V1 + fiche routine V1. Le devis V5 remplace les tableaux ci-dessus (socle 899 € / options) : 19 lignes, 5 blocs, total toutes lignes 9 890 €.
| Bloc | Lignes | Montant |
|---|---|---|
| Socle (espace sécurisé, fiche cliente complète, produits+valeurs d'usage, PDF charte+envoi, mise en service) | S1-S5 | 2 150 € |
| Module Cheveux (grille, fiche routine 7 rubriques, bibliothèque gestes/tips éditable) | H1-H3 | 2 270 € |
| Module Visage (trame à fournir) | V1-V2 | 1 380 € |
| Suivi (J+14, bilan 6-8 sem., photos), tableau de bord, envoi auto avec aperçu, synthèse pro | R1-R4 | 2 360 € |
| Évolutions (questions éditables, praticiennes, panier QR 600 €, RGPD+sauvegardes) | E1-E4 | 1 730 € |
Vague 1 conseillée = Socle + Cheveux = 4 420 €. Écarts code : la lite actuelle a un compositeur générique par boîtes ; la fiche routine cheveux (jour de lavage / entre shampoings / soins profonds / spécifiques / gestes / tips), la grille cheveux (~80 champs), la fiche cliente complète et la base produits à valeurs d'usage sont à développer. Relance = 14 jours (réponse client), téléphone/e-mail/adresse obligatoires.

---
## Devis V6 (20/09/2026) — Pack Base 990 € + 6 options (tout inclus 3 400 €)
Voir `BRIEF-DEVIS.md`. Périmètre du **Pack Base** à développer (aucune mention d'heures) :
- Moteur de questionnaire modifiable (sections, types choix/oui-non/texte libre, « afficher si », pour toutes les clientes ou une seule) ; grille cheveux chargée depuis le cahier des charges V1 ; grille visage à réception de la trame ; onglet Lifestyle en fin ; passer le questionnaire.
- Fiche cliente complète (nom, prénom, téléphone, e-mail, adresse obligatoires ; naissance→âge ; allergies, grossesse, traitements, enfants, origine ; notes ; consentement daté ; historique).
- PDF par rubriques (cheveux : jour de lavage, entre shampoings, soins profonds, soins spécifiques, gestes, tips ; visage : matin/soir/hebdo) avec étapes produit+localisation+quantité+méthode ; rubriques vides masquées ; aperçu direct ; 3 thèmes à la charte ; bibliothèque gestes/tips préchargée et modifiable ; en-tête plus esthétique, rectangle du bas réduit.
- Produits : import Excel Planity, valeurs d'usage par défaut, photo, catalogue partagé.
- Archives : dossier privé par cliente, retrouver une cliente (homonymes), suppression, 2 postes, Gmail pré-rempli tu/vous ; connexion personnelle serveur ; fichiers privés ; compte Google Hu'mana ; installation site + formation.
Options : A suivi (relance 14 j, bilan 6-8 sem., photos, notes, tableau de bord, rappel stock) 390 · B envoi auto avec aperçu 490 · C praticiennes 290 · D synthèse pro 390 · E panier QR/WhatsApp 600 · F conformité + sauvegardes 250.

---
## Devis V8 (20/09/2026)
Périmètre Base : ajouter la grille peau/visage (à réception du modèle) et le diagnostic lifestyle ; l'éditeur de questions/diagnostics/conseils sort du Base (option A) : questions chargées depuis des fichiers de configuration. Nouvelles options : D agenda Google (rappels J+14 et bilan 6 sem., rendez-vous du jour → fiche), G boutique en ligne (catalogue/prix/stock WooCommerce ou Shopify), tranches de praticiennes. Détails de prix : BRIEF-DEVIS.md.
