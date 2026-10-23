# Cadrage produit — application Hu'mana (PO, 20/09/2026)

Sources : devis V6, `reponses-onboarding-humana.json` (25 réponses), cahier des charges cheveux V1, fiche routine V1, code `humana-lite/src`, briques réutilisables de `../humana-boutique*`. Difficulté en S/M/L/XL, jamais en heures.

## 1. Ce que je change par rapport au devis V6 (5 lignes)

1. **La grille visage sort du Pack Base** → Option A « Je peux aussi faire les diagnostics visage » : leur trame visage n'existe pas encore (« nous compléterons dès que possible »), la promettre dans un Base à 990 € est un chèque en blanc.
2. **Entrent dans le Base sans supplément** : la suppression d'une cliente (obligation légale, pas une option), la distinction des homonymes (aujourd'hui deux clientes du même nom fusionnent — fuite de dossier), le rappel d'import du stock (sorti de l'option Suivi, où il n'a rien à faire).
3. **6 options → 7** (A Visage, B Suivi, C Envoi automatique, D Synthèse pro, E Praticiennes, F Conformité, G Panier QR), prix réajustés pour rester à **990 € + 2 410 € = 3 400 €**.
4. **Deux promesses V6 à retirer** : l'e-mail « aux couleurs de Hu'mana » (HTML : contraire à la règle du projet, et classé spam) et les « fichiers privés ouverts via l'appli » → e-mail texte + PDF joint, et dossier Drive privé ouvert avec leur compte Google.
5. **Base à 990 € maintenu**, mais recentré sur la chaîne cheveux complète (grille V1 → fiche routine 6 rubriques → archives) : c'est le poste le plus lourd du projet, aujourd'hui sous-estimé dans V6.

## 2. La praticienne et ses six moments de friction (jobs à accomplir)

| Moment | Ce qu'elle veut accomplir | Friction aujourd'hui | Ce qui la lève |
|---|---|---|---|
| **Accueil** | Ouvrir la bonne fiche en 3 secondes, voir son historique | Retaper les coordonnées ; deux « Marie Dupont » écrasent le même dossier | Recherche + choix explicite « cliente existante / nouvelle », historique daté |
| **Entretien** | Noter vite sans casser le rythme, en visio comme en boutique | Grille papier de 150 points ; l'écran vole l'attention | Sections repliables, « RAS » en un clic, texte libre sous **chaque** question, mémos courts |
| **Composition** | Ne faire figurer que ce qui sert à cette cliente | Tout retaper à chaque fiche | Rubriques qu'on monte/descend/retire, rubrique vide masquée, valeurs d'usage du produit adaptables sans toucher la fiche produit |
| **Envoi** | Un document propre, le bon ton, routine + lifestyle ensemble | PDF à joindre à la main, ton à réécrire | Gmail pré-rempli, tutoiement/vouvoiement retenu **par cliente**, marqueur « envoyé le » |
| **J+14** | Savoir qui relancer sans y penser, avec son texte à elle | Rien : repose sur la mémoire | Liste du jour + message de relance déjà écrit (option B) |
| **Bilan 6 semaines** | Montrer le résultat, ajuster | Photos éparpillées dans le téléphone | Avant/après côte à côte dans le dossier (option B) |

Vocabulaire à garder : *fiche cliente, grille, rubrique, fiche routine, bibliothèque, archives, relance, bilan*. Repère marché : les logiciels du secteur (Jupi'Terre 29 €/mois ≈ 348 €/an, Naturooo, Consult) vendent un **abonnement** et parlent d'*anamnèse / bilan / cabinet*. Argument : ici, pas d'abonnement, et les fiches restent chez Hu'mana.

## 3. Inventaire complet (questionnaire + 2 PDF + code)

MoSCoW : **I** indispensable · **Imp** important · **C** confort · **PM** pas maintenant.

| Fonctionnalité | Mo | Dif | Dépend de | Existant / à créer | Risque | Verdict |
|---|---|---|---|---|---|---|
| Identité + téléphone/e-mail/adresse obligatoires, naissance→âge | I | S | — | `humana-boutique/src/components/clients/ClientFormModal.jsx` à porter | faible | **Base** |
| Allergies, grossesse/allaitement, traitements, enfants, « comment connues » | I | S | fiche cliente | à créer | données de santé | **Base** |
| Notes libres + consentement daté | I | S | fiche cliente | à créer | — | **Base** |
| Modalité visio / boutique par document | Imp | S | — | `src/store/useStudio.js` (`meta.lieu`) ✅ | — | **Base** |
| Retrouver une cliente sans ressaisie + **homonymes distincts** | I | M | classeur | `src/components/studio/ClientPicker.jsx` ✅ ; clé serveur à corriger (`apps-script/Code.gs`, `clientKey_`) | fusion de dossiers = fuite | **Base** |
| Plusieurs diagnostics du même type, historique daté | I | S | archives | `archivePdf_` ✅ | — | **Base** |
| Supprimer une cliente / un document | I | M | archives | à créer | obligation légale ; V6 dit « sur demande », trop flou | **Base** |
| Grille cheveux V1 complète (cuir chevelu, chute, fibre, porosité, type, habitudes 3.1→3.9, contraintes) | I | **L** | — | moteur `QuizStep.jsx` ✅, ~150 champs à créer | entretien trop long | **Base** |
| Texte libre sous chaque question + « RAS » | I | S | grille | `QuizStep.jsx` à étendre | — | **Base** |
| Mémos praticienne courts + conclusion praticienne (porosité) | Imp | S | grille | champ `aide` ✅ | — | **Base** |
| Éditeur de questions (ajouter / supprimer / réordonner) | I | M | grille | `humana-boutique/src/components/settings/QuestionsEditorModal.jsx` à porter | — | **Base** |
| Portée du changement : toutes les clientes **ou** cette cliente seulement | I | M | éditeur | à créer | confusion d'usage | **Base** |
| Questions, produits et réglages **partagés entre les 2 postes** | I | M | classeur | aujourd'hui `localStorage` → à passer au classeur | Jessie et Nathalie divergent sans le voir | **Base** |
| Onglet Lifestyle en fin de questionnaire | I | S | grille | `LifestyleStep.jsx` (boutique) | — | **Base** |
| Passer le questionnaire, aller directement au PDF | I | S | — | `src/pages/StudioPage.jsx` (étapes) | — | **Base** |
| Retour à l'accueil à toute étape | Imp | S | — | `docs/TODO-remarques.md` #1 | — | **Base** |
| Objectifs principaux de la cliente (en tête de la fiche routine) | I | S | grille | à créer | — | **Base** |
| Rubriques qu'on monte / descend / retire, rubrique vide masquée | I | M | — | `BlockBox.jsx` + `useStudio.moveBlock` ✅ | — | **Base** |
| **Rubriques cheveux réelles** : jour de lavage (étapes ordonnées), entre mes shampoings, soins profonds (hebdo/mensuel/trimestriel), soins spécifiques, gestes & habitudes, tips | I | **L** | rubriques | `src/lib/pdf/routinePdf.js` (matin/soir/hebdo) à refondre | **le poste caché du Base** | **Base** |
| Étape = produit + localisation + quantité + méthode (+ pose, nb de shampoings) | I | M | rubriques cheveux | `RoutineBuilder.jsx` à étendre | — | **Base** |
| Rubrique **hebdomadaire** visage matin/soir/hebdo (manque signalé par la cliente) | I | S | rubriques | `MOMENTS` ✅ | à afficher en clair dans le devis, pas entre parenthèses | **Base** |
| En-tête plus esthétique, encadré du bas réduit | Imp | S | — | `src/lib/pdf/brand.js`, `commonBlocks.js` | affaire de goût : valider sur une maquette | **Base** |
| Charte (logo, couleurs, typos) + 3 thèmes | Imp | S | charte fournie | `themes.js`, `fonts.js` ✅ | charte à recevoir | **Base** |
| Photo du produit dans l'étape (maquette V1) | C | M | catalogue | `pdf/assets.js` ✅, mise en page à créer | poids du PDF | **Base** si photo fournie |
| Bibliothèque « gestes & habitudes » (10 familles, ~60 formulations) éditable | I | M | — | `LIFESTYLE_TIPS` (8 entrées) à remplacer par le contenu V1 | — | **Base** |
| Bibliothèque « tips » (34 formulations, 3 à 6 cochées) | I | S | bibliothèque | idem | — | **Base** |
| Valeurs d'usage par défaut du produit, adaptables par cliente sans modifier la fiche | I | M | catalogue | à créer | — | **Base** |
| Message de fin, coordonnées, date, auteur, signature « L'équipe HU"MANA » | I | S | — | ✅ | guillemet typographique exact à respecter | **Base** |
| Catalogue par saisie + import du fichier Planity | I | S | — | `planityImport.js` + `PlanityImportModal.jsx` ✅ | fichier .xls à localiser | **Base** |
| Rappel d'import du stock (1 semaine) | C | S | catalogue | `humana-boutique/src/hooks/useStockReminder.js` ✅ | — | **Base** (V6 : option A) |
| Connexion personnelle Jessie / Nathalie vérifiée côté serveur | I | M | classeur | `LoginPage.jsx` = code partagé `Humanabeta` | code visible dans le code public | **Base** |
| E-mail Gmail pré-rempli, routine + lifestyle **ensemble**, tu/vous par cliente | I | S | — | `src/lib/email.js` ✅ | PJ à glisser à la main | **Base** |
| Marqueur « envoyé le » | Imp | S | e-mail | à créer | — | **Base** |
| Installation sur leur site (page non visible sur Google), séance de validation, formation, 30 jours de corrections | I | M | accès hébergeur | — | prestataire tiers | **Base** |
| Dossiers Drive ouverts **sans lien public** (via leur compte) | Imp | S | Drive | `setSharing(ANYONE_WITH_LINK)` aujourd'hui → à retirer | lien public = fuite | **Base** |
| Ouverture des fichiers par l'appli avec contrôle d'accès | C | L | comptes | à créer | — | Plus tard |
| **Grille visage + fiche routine visage** | Imp | L | trame cliente | rien | trame inexistante : chèque en blanc | **Option A** |
| Relance J+14 avec leur texte | Imp | M | envoyé le | `useRelances.js` ✅, texte fourni dans le questionnaire | J+10 (cahier) vs J+14 (questionnaire) : trancher | **Option B** |
| Bilan 6 semaines + photos avant/après | Imp | M | relance | `humana-boutique-archive/apps-script/Code.gs` (`uploadPhoto_`) ✅ | photos = données de santé | **Option B** |
| Notes de suivi datées | Imp | S | relance | `JournalTimeline.jsx` ✅ | — | **Option B** |
| Tableau de bord du jour | C | M | relance | `DashboardPage.jsx` ✅ | — | **Option B** |
| Envoi au clic avec aperçu + PDF joint | Imp | M | e-mail | `sendEmail_` (archive) + `AutoSendConfirmModal.jsx` ✅ | un e-mail parti ne se rattrape pas | **Option C** |
| Relances qui partent seules chaque matin | C | L | option B | déclencheur quotidien **jamais codé nulle part** | quota Gmail (100/j, 1 500 avec Workspace) ; envoi à tort | **Option C** |
| E-mail HTML à la charte (logo, couleurs) | PM | M | envoi | — | contraire à la règle du projet ; délivrabilité | **Non** |
| Synthèse professionnelle (analyse, besoins, propositions, routine choisie) | Imp | L | fiche cliente | à créer + atelier | méthode encore à inventer avec elles | **Option D** |
| Plusieurs praticiennes (≤ 10, chacune ses clientes) | C | M | connexions du Base | `humana-boutique/src/pages/EquipePage.jsx` ✅ | 2 gérantes : besoin non avéré | **Option E** |
| Registre des données + durée de conservation avec effacement automatique | Imp | M | suppression | à créer | légal | **Option F** |
| Sauvegarde hebdomadaire + alerte | Imp | S | classeur/Drive | à créer | — | **Option F** |
| Panier personnalisé QR code / WhatsApp | C | **XL** | boutique en ligne + n° WhatsApp | QR factice de démo seulement | dépendance tierce non vérifiée ; **absent de leur questionnaire** | **Option G** |
| Méthode Hu'mana transmissible à d'autres praticiennes | PM | XL | D + E | — | ambition long terme | Plus tard |

## 4. Découpage et prix proposés

**Pack Base — 990 €** (50 % signature / 50 % livraison) : fiche cliente complète · grille cheveux V1 modifiable par elles (pour toutes ou pour une seule) · texte libre partout · onglet Lifestyle · fiche routine par rubriques qu'on monte/descend/retire · bibliothèques gestes & tips éditables · catalogue Planity + valeurs d'usage · archives par cliente sur les 2 postes, homonymes distingués, suppression · e-mail pré-rempli tu/vous · connexions personnelles · installation, formation, 30 jours de corrections.

| | Option (« Je peux… ») | Prix |
|---|---|---|
| A | …faire aussi les diagnostics visage | 390 € |
| B | …suivre chaque cliente (relance J+14, bilan 6 semaines, photos avant/après, notes) | 350 € |
| C | …envoyer mes documents et mes relances sans y penser | 390 € |
| D | …écrire ma synthèse professionnelle | 350 € |
| E | …travailler à plusieurs praticiennes | 250 € |
| F | …tenir mes obligations et être sauvegardée | 230 € |
| G | …proposer le panier en un QR code | 450 € |

**Vérification : options 390+350+390+350+250+230+450 = 2 410 € · tout inclus 990 + 2 410 = 3 400 €.** ✅

*Variante si l'on refuse de brader le panier (G sorti du devis, sur devis séparé) : A 490 · B 420 · C 490 · D 390 · E 290 · F 250 = 2 330 € → tout inclus **3 320 €** (dans la fourchette).*

## 5. Feuille de route

- **Livraison (Base)** — 1. classeur partagé + connexions + archives corrigées (homonymes, suppression, dossiers privés) ; 2. grille cheveux V1 + éditeur de questions ; 3. fiche routine 6 rubriques + bibliothèques + charte ; 4. produits Planity ; 5. installation + séance de validation + formation.
- **Étape 2** — A (visage, dès réception de leur trame) **ou** B (suivi), selon ce qui arrive en premier : ce sont les deux seules options sans dépendance technique.
- **Étape 3** — C (envoi automatique) puis F (conformité).
- **Étape 4** — D (atelier synthèse), E, et G seulement si la boutique en ligne existe.

Dépendances : **C → B** (pas de relance automatique sans suivi) et **C → Base** (e-mail, archives) · **E → connexions du Base** · **F → suppression du Base**, et devient plus urgente dès que B est pris (photos) · **G → boutique en ligne + WhatsApp + références produits** · **D → fiche cliente + atelier avec elles** · **A → trame visage fournie par Hu'mana**.

## 6. Risques produit et 5 décisions pour Nicolas

**Risques.** (1) *Longueur de l'entretien* : 150 points de grille en visio → l'outil doit rester une prise de notes, pas un formulaire. (2) *Trame visage inconnue* → seul vrai chèque en blanc du projet ; la sortir du Base le referme. (3) *Homonymes* : la clé nom+prénom fusionne deux dossiers — anomalie bloquante avant toute mise en service. (4) *Envoi automatique* : déclencheur quotidien jamais construit, quota Gmail, et un e-mail parti par erreur est irrattrapable. (5) *Données de santé* (allergies, grossesse, traitements, photos) sur un compte Google grand public : la conformité n'est pas vraiment optionnelle, seule son industrialisation l'est. (6) *Dépendances tierces* : accès à l'hébergeur du site, Planity sans passerelle, boutique en ligne pour G. (7) *Écart promesse/réalité* : V6 vend un Base « tout prêt » alors que la chaîne cheveux est à construire entièrement.

**Décisions à trancher.** 1. Visage en Option A, ou dans le Base avec plafond explicite (« reprend votre trame, sans refonte ») ? 2. Panier QR à 450 € dans le devis, ou sorti (variante à 3 320 €) ? 3. Relances vraiment autonomes, ou « un clic après aperçu » — qui assume un envoi à tort ? 4. On retire la promesse d'e-mail « aux couleurs de Hu'mana » ? 5. Le compte Google Workspace de Hu'mana est-il un prérequis de livraison (quota, Drive, double protection) ou un conseil ?

## 7. Mots à bannir du devis

| À bannir | Mot du métier |
|---|---|
| backend, jeton, Apps Script, API | (ne rien dire) ou « le classeur Google de Hu'mana » |
| synchronisation, localStorage, cache | « visible depuis vos 2 postes » |
| boîtes ▲▼, compositeur, wizard | « rubriques », « vous montez ou descendez une rubrique » |
| RGPD, registre de traitement | « le cahier des données que la loi demande » |
| template, gabarit | « modèle de message » |
| import CSV / export | « votre fichier Planity » |
| déployer, build, noindex | « mettre en ligne », « page qui n'apparaît pas sur Google » |
| onboarding, recette | « mise en route », « séance de validation » |
| dashboard | « votre écran du jour » |
| responsive, bundle, sur-mesure « scalable » | (supprimer) |
