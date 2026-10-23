# Brief de référence — devis Hu'mana (à relire avant toute demande de devis)

## Règles de Nicolas (20/09/2026)
1. **Jamais d'heures ni de tarif horaire** dans le devis ou dans les commentaires. Les prix sont des prix de vente, pas des calculs.
2. **Pack Base < 1 000 €** (990 €), suffisant pour travailler au quotidien.
3. **Options en lignes** « Je peux… », à ajouter plus tard (cases Maintenant / Plus tard, prix figés 6 mois). **Tout inclus ≈ 3 400 €** au maximum.
4. **Dans le Pack Base** : modifier les questions des diagnostics, modifier le PDF, archiver les PDF par cliente.
5. **Écrire du point de vue de Nathalie et Jessie** : phrases courtes, leurs mots (rubriques, fiche routine, archives, conseils), zéro jargon technique (backend, token, Apps Script, boîtes ▲▼).
6. **3 pages**, chaque demande de leur questionnaire retrouvable en un coup d'œil.

## Principe produit
Un moteur de questionnaire **modifiable** (grille cheveux chargée à la livraison, grille visage à réception de leur trame) + un PDF fait de **rubriques** qu'elles montent/descendent/retirent (jour de lavage, entre mes shampoings, soins profonds, soins spécifiques, gestes & habitudes, tips ; matin/soir/hebdo pour le visage) + une bibliothèque de conseils modifiable.

## Sources
`docs/reponses-onboarding-humana.json` (25 réponses), cahier des charges cheveux V1 et fiche routine V1 (pièces jointes de l'onboarding, dans le Drive de la boutique).

## Prix V6
Pack Base 990 € · A Suivi 390 · B Envoi automatique 490 · C Praticiennes 290 · D Synthèse pro 390 · E Panier QR/WhatsApp 600 · F Conformité + sauvegardes 250 → options 2 410 € · tout inclus 3 400 €.

## V7 (20/09/2026) — décisions issues du cadrage du Product Owner (`PRODUIT-CADRAGE.md`)
Pack Base 990 € (cheveux complets, questions modifiables, fiche cliente, fiche routine par rubriques, produits, archives, suppression, homonymes, connexion personnelle) · options A visage 360 · B suivi 330 · C envoi en un clic + relances du jour 370 · D synthèse 300 · E praticiennes 220 · F conformité + sauvegardes 230 · G panier QR 600 = 2 410 € · tout inclus 3 400 €. Retirés : e-mail HTML « aux couleurs » ; fichiers Drive « privés ouverts via l'appli » → dossier privé ouvert avec leur compte Google.
**Ton** : « vous », phrases affirmatives de 8 à 18 mots, bénéfice d'abord, jamais « simple / facile / petit / sans y penser », pas d'exclamation ni de métaphore, jargon banni (voir §7 du cadrage). Texte source : `COPY-DEVIS-V7.md`.
À confirmer par Nicolas : délai « environ 4 semaines », facture payable sous 30 jours, e-mail du prestataire à ajouter.

## V8 (20/09/2026) — décisions de Nicolas après discussion
Tous les diagnostics (cheveux, peau/visage, lifestyle) dans le **Pack Base 990 €** ; questions réglées avec elles à la livraison. Options (total 2 410 € → tout inclus 3 400 €) : A modifier questions + diagnostics + conseils 240 · B suivi 270 · C envoi en un clic + relances 320 (nécessite B) · D agenda Google 190 (nécessite B) · E synthèse pro 240 · F praticiennes 180 (≤10 ; +10 pour 90 €, jusqu'à 30 ; au-delà sur devis + migration base de données) · G boutique en ligne WooCommerce/Shopify 190 · H panier QR/WhatsApp 600 · I obligations + sauvegardes 180. Clause : adaptation aux changements de Google/Shopify/WooCommerce sur devis.

## Perspective réseau (20/09/2026) — décisions de Nicolas
Hu'mana vise ~30 praticiennes indépendantes à 12 mois. NF Studio = plateforme, fournisseur exclusif (exclusivité acceptée). Hu'mana facture ses praticiennes et paie à NF Studio un montant fixe par praticienne active (hypothèse 15-19 €/mois, non écrite). Contrat dédié (protection des données, propriété méthode/logiciel) à rédiger plus tard. Dans le devis : simple encadré « Perspective » hors total. Technique future : base multi-clients (Supabase), comptes individuels, modèles maîtres, vue d'ensemble Hu'mana sans accès aux fiches. Idée « tout gratuit + 10 % » écartée.

## Valeur perçue (21/09/2026)
Ajout en tête du Pack Base d'un bloc « Votre fiche routine, conçue pour Hu'mana — conception graphique incluse » (maquette V1, charte, une fiche par cliente, maquette validée avant livraison, valeur repère 400-600 € à valider par Nicolas). Import du fichier Excel Planity mis en avant dans le Base (ligne « Demandes » + bloc Produits) ; l'option G (boutique en ligne) l'automatise depuis WooCommerce/Shopify, pas depuis Planity (pas de passerelle).

## V9 (21/09/2026) — devis paiement unique uniquement (l'abonnement est mis de côté)
- **Option B offerte à la signature** (valeur 270 €, sans date limite ni pression) ; bandeau en haut de la page 2, prix barré. **C passe de 320 à 250 €, F de 180 à 240 €** → options 2 400 €, tout inclus **3 390 €**, **3 120 €** avec B offerte.
- **Délais** : à réception de l'acompte (50 %), Pack Base **7 jours ouvrés max**, formation 1 h en visio comprise ; +1 jour ouvré par option (boutique en ligne 2 j, panier QR 3 j).
- **Révisions 30 jours** à compter de chaque livraison : dispo par e-mail, ajustements de la mise en place + bugs, dans le cadre du devis, réponse sous 2 jours ouvrés ; nouvelle fonction = devis.
- **Encadré « j'ai besoin de vous »** (page 3) : interlocutrice joignable, compte Google dédié (admin par invitation), accès hébergement du site, fichiers (logos, charte, modèle visage, Planity) ; aucun mot de passe par e-mail.
- PDF : `Devis_NFS_DEV_2026_0912_HUM_APP_V9.pdf` (V8 archivé dans `archives/anciens-devis-pdf/`).
- Retouches finales V9 : encart « Perspective réseau » retiré du devis ; délai de 7 jours pour signaler une anomalie retiré ; e-mail de Nicolas ajouté (bloc prestataire + révisions) ; WordPress ajouté à l'option G ; cliente = Nathalie GUNZLE EI seule (societe.com 21/09 : EI, aucun associé), Jessie utilisatrice ; pas de clause de suspension du délai.
- Numéro de devis : **NFS-DEV-2026-0921-HUM-APP-V9** (la date du numéro suit la date d'émission, 21/09). RIB (Nickel, titulaire Nicolas FOLLEZOU) ajouté en page 3, bloc « Règlement par virement ».
- Relecture « Nathalie » (agent, 21/09) : corrigé = voix « Je peux » (A, D, G au « je » de la cliente), « trois modèles de mise en page », ligne lifestyle, validité jusqu'au 21/10/2026, « Ma sélection » (dont acompte 50 %), signatures Date/Lieu/Signature des deux côtés + case « Bon pour accord ». Laissé à Nicolas : A/C attendues dans le Base par la cliente, échéance du solde (livraison vs 30 jours), délai total « tout inclus » ≈ 19 jours ouvrés, durée de l'accès admin, RGPD/Base, jargon (Workspace, hébergement), ton de la clause de retard.
- Décisions finales V9 : paiement 50 % à la signature / solde à la livraison payable sous 30 jours ; pénalités adoucies (3× taux légal + 40 €) ; accès Google de Nicolas retiré après les 30 jours de révisions ; mention « valeur 400 à 600 € » retirée.

## V9 → remplacé le 14/10/2026 par une formule abonnement « Lite »
Nicolas a besoin de cash rapidement ; le paiement unique (495 € d'acompte) freinait trop une petite indépendante. Nouveau modèle, **ce devis remplace le V9** (paiement unique, mis en archives) :
- **Pack Base 100 €/mois + 150 € de mise en place.** Diagnostic cheveux/peau/lifestyle + PDF à la charte envoyé automatiquement par e-mail + formulaire pré-rdv (infos + photos, upload direct dans son Drive, **pas de Twilio** — jugé trop lourd/coûteux pour ce qu'il apporte) + trace dans Google Agenda (pas de fiche cliente). **Aucune fiche cliente ni archive dans le Base** — c'est la plus grosse différence avec V9 : l'option B absorbe maintenant le stockage de la fiche cliente et l'historique (avant, B supposait que la fiche existait déjà dans le Base).
- **Propriété du code : dépôt GitHub privé**, Nathalie et Jessie invitées comme collaboratrices dès la signature (remplace l'hébergement sur son site + Apps Script/Sheet sécurisé prévu pour V9 — plus simple, plus rapide à livrer, scope très réduit par rapport à l'audit du 21/09 qui avait établi que V9 n'était qu'à 30-40 % fait).
- **Vesting 12 mois par brique** : chaque brique (Base, puis chaque option à son activation) devient gratuite et définitivement acquise après 12 mois réglés. Si elle arrête de payer une brique avant, elle garde le code tel quel mais plus de corrections/support dessus, et le compteur s'arrête là où il en est (confirmé par Nicolas).
- **Options** : même catalogue A→I, mais B remonte à 180 €+12 €/mois (absorbe la fiche cliente) ; C, D, E dépendent désormais de B. Repère toutes options : +1 260 € de mises en place + 73 €/mois.
- Mise en service annoncée à 5 jours ouvrés — **estimation non vérifiée**, le code de ce périmètre réduit n'existe pas encore (rien n'a bougé dans `humana-lite/src` depuis le 21/09).
- Devis source : `devis-humana/sources/devis-humana-lite-abonnement.html`, PDF dans `devis-humana/a-envoyer/Devis_NFS-DEV-2026-1014-HUM-LITE-ABO-V1.pdf`. V9 et l'ancienne formule abonnement archivés dans `devis-humana/archives/remplaces-14-10-2026/`.
- Perspective réseau (30 praticiennes, exclusivité NF Studio) : mise de côté pour l'instant par décision de Nicolas, non traitée dans ce devis.

### Retouches du 14/10/2026 (même jour, avant envoi)
- Modifier ses questions/diagnostics/conseils passe du statut option au **Pack Base** (demande de Nicolas).
- La lettre A est réaffectée à une **nouvelle option** : installer l'application sur le site de la cliente (ex. `monsite.fr/diagnostic`), 120 € + 6 €/mois, dépend de l'accès à son hébergement. Sans elle, l'appli reste sur une adresse indépendante incluse dans le Base (B→I inchangées).
- Mise en place du Pack Base : 150 € → **200 €**, 100 €/mois inchangé. Totaux "repère toutes options" inchangés (1 260 €/73 €/mois, les montants de la lettre A étant restés identiques).

### Discussion et retouches du 14/10/2026 (2e passage, avant envoi)
- **Tout le process mail est dans le Base dès le départ**, relance à J+14 comprise (plus seulement l'envoi initial). Nuance technique assumée dans le devis : une mémoire minimale (nom, e-mail, date d'envoi) est nécessaire en coulisses pour que la relance parte seule, sans que ce soit une fiche visible ni un historique consultable.
- **Option B recentrée** : perd la responsabilité de l'envoi (déjà dans le Base), garde fiche cliente + historique + bilan/photos à 6 semaines + notes de suivi. Prix ajusté en conséquence : 180 €+12 €/mois → **150 €+10 €/mois**.
- **Option C repensée** : « envoi en un clic » n'avait plus de sens si le Base envoie déjà tout seul. Devient **« je peux valider chaque message avant son départ »** — un cran de contrôle manuel au-dessus de l'automatisme par défaut. Prix : 160 €+10 €/mois → **100 €+6 €/mois**.
- Option D : wording ajusté (liée aux envois/relances/bilans automatiques, plus de mention de case à cocher manuelle).
- **Totaux "repère toutes options" recalculés : 1 260 €+73 €/mois → 1 170 €+67 €/mois.**
- **Page 1 redensifiée** : bandeau "en bref" tout en haut (prix + pitch en 3 lignes), suppression du tableau "vos demandes, où les trouver" (redondant avec le Base juste en dessous), les 7 petites boîtes du Base fusionnées en 4 (diagnostics, fiche routine, le process de bout en bout, code+mise en route) + le encadré "ce que le Base ne garde pas".

### Retouche du 15/10/2026 — produits remis dans le Base
Nicolas a listé ce qu'il veut dans le Base : génération/modification du PDF, **import des produits pour les mettre dans le PDF** (oublié lors de l'allégement précédent — ce n'est pas une donnée cliente, aucune raison de l'exclure), charte, PDF modifiable, mails avant/après rdv, relance 14j, toujours pas de fiche cliente. Code d'import Planity déjà prêt côté Nicolas, réutilisable. Ajouté au bloc « 2 · Votre fiche routine et vos produits » : import Excel Planity ou saisie à la main + précision explicite que textes/couleurs/ordre des rubriques sont modifiables par elle-même. Résout aussi une incohérence latente : l'option G disait déjà "sans fichier à importer", qui sous-entendait un chemin "avec import" qui n'existait plus dans le Base.
Nicolas demande maintenant de prendre le temps : lire tous les .md de toutes les versions d'Humana avant de continuer la discussion produit/devis.

### Retouche du 15/10/2026 (2e passage) — retrouver une cliente, remis dans le Base
Après lecture complète de tous les .md du projet (dont `PRODUIT-CADRAGE.md`, le cadrage PO du 20/09) : tension identifiée entre « pas de fiche cliente » et le job n°1 du cadrage (« ouvrir la bonne fiche en 3 secondes, voir son historique », classé Indispensable/Base) + la demande de Nicolas du 19/09 (`TODO-remarques.md` #3 : sélectionner une cliente déjà enregistrée). La relance automatique du Base nécessitait déjà une mémoire minimale en coulisses — incohérence avec le discours « aucune mémoire ».
**Décision** : le Base retrouve désormais une cliente par son nom et montre la liste de ce qu'elle a déjà reçu (réutilise `ArchivesPage.jsx`, `ClientPicker.jsx`, `pullArchives`, `archivePdf_`, déjà codés — n'allonge pas significativement le délai). Reste exclu du Base, toujours réservé à l'option B : allergies, grossesse, traitements, consentement, notes de suivi, bilan et photos avant/après — **B renommée « Je peux tenir un vrai dossier de chaque cliente »**, recentrée sur ces champs. Prix de B inchangé (150 €+10 €/mois). Bloc 3 et l'encadré « ce que le Base ne garde pas » reformulés en conséquence. Totaux « repère toutes options » inchangés (1 170 €+67 €/mois).
Rappel technique noté pour rassurer Nicolas : contrairement à l'automatisation « une fois par jour au login » de `humana-boutique` (pas de vrai backend), le Lite a un vrai Apps Script côté serveur — un déclencheur temporel réel est possible, la promesse « ça part tout seul » est donc plus solide ici.
Devis toujours non envoyé, numéro et date (1014, 14 octobre) pas encore mis à jour — à faire au moment de l'envoi réel.

### Mise à jour du 15/10/2026 — numéro et date finalisés pour l'envoi
Devis renuméroté NFS-DEV-2026-1014 → **NFS-DEV-2026-1015-HUM-LITE-ABO-V1** (date d'émission 15/10/2026, validité jusqu'au 14/11/2026). Décision de Nicolas sur le modèle abonnement, assumée explicitement : volontaire pour éviter à Nathalie un passage par la banque (~2 mois de délai) et répondre à son propre besoin de cash immédiat — pas une formule "moins chère", un étalement. Pas d'option de prépaiement annuel ajoutée (irait à l'encontre de cette raison d'être). PDF prêt dans `a-envoyer/`, ancienne version (1014) archivée dans `archives/remplaces-15-10-2026/`.

### 22/10/2026 — Signature avec Nathalie, devis finalisé en call
Décidé en direct pendant l'appel : plus le mot "abonnement" → **"échéancier"** partout dans le devis. Renuméroté NFS-DEV-2026-1022-HUM-LITE-ECH-V1 (ABO→ECH, date du jour). Pack Base + options **B et H prises dès la signature**.
- **Pack Base** : octobre et novembre offerts (geste visible en page 1, badge "Geste à la signature"), mais l'échéancier démarre quand même en octobre 2026 → à vie dès octobre 2027. Présenté comme une économie de 200 €, pas comme un délai gratuit hors compteur.
- **Option E (synthèse pro) supprimée, fusionnée dans B** — B garde son prix (150 €+10 €/mois), catalogue réduit à 8 options, relettrées proprement A→H (plus de trou).
- **Option I → H, enrichie** : ajout d'un consentement RGPD envoyé/signé par e-mail par la cliente (collecte photos + diagnostics) et d'une autorisation séparée, proposée au cas par cas, d'utiliser la photo d'une cliente à des fins de communication. Set up à -50 % pour la signature (90 €→45 €), concession ponctuelle liée à cette signature, pas un nouveau prix catalogue.
- **B et H : échéancier démarre en décembre 2026** (pas de geste gratuit comme le Base, confirmé par Nicolas) → à vie en décembre 2027.
- **Plan de paiement des set up, étalé** : 275 € en octobre (200 € Base + 75 € moitié de B), 120 € en novembre (75 € reste de B + 45 € H) = 395 € au total. Mensualités réelles (116 €/mois = 100+10+6) à partir de décembre.
- **Nouvelles clauses page 3** : "Mettre une brique en pause" exige un préavis d'un mois (avant : "à tout moment" sans préavis). "Ce qui vous appartient" dit maintenant explicitement "à vie".
- Table "Mes options actives" (page 2) pré-remplie avec les vraies dates pour ce signataire (Pack Base, B, H), au lieu d'être laissée vierge.
- Totaux "repère toutes options" recalculés pour 8 options : 1 170 €/67 €/mois → **1 050 €/61 €/mois**.
- Point non traité, à vérifier avec Nicolas avant un futur envoi similaire : la clause "Mise en service" (page 3) garde la mention "estimation à confirmer avant signature, le périmètre n'a pas encore été chiffré en détail" — bizarre de la garder telle quelle sur un devis qui vient d'être signé le jour même. Signalé à Nicolas, pas retiré sans sa confirmation.

### 22/10/2026 (suite) — bandeau du haut corrigé
Nicolas a repéré que la toute première ligne vue par Nathalie (bandeau page 1) affichait encore le générique "100 €/mois · 200 € pour démarrer", alors que le détail personnalisé plus bas disait 395 €/2 fois. Corrigé : le bandeau montre maintenant "275 € ce mois-ci / 116 €/mois dès décembre", et le texte mentionne explicitement qu'elle démarre avec Base + B + H. Les autres cartes génériques (page 2 : "Pack Base seul" / "Repère toutes options") restent volontairement comme repères (plancher/plafond), à côté de la carte personnalisée "Vous démarrez avec" — gardées pour la suite, comme demandé par Nicolas.

### 22/10/2026 (suite 2) — deux dernières retouches avant signature définitive
- Clause "Mise en service" : retiré "(estimation à confirmer avant signature, le périmètre réduit n'a pas encore été chiffré en détail)" — devis signé le jour même, plus de sens de garder ce doute visible.
- Bandeau "Geste à la signature" : "200 € d'économisés sur votre première année" sonnait comme un abonnement qui continuerait après — reformulé "200 € en moins sur les 12 mensualités à régler, et le Pack Base à vie dès octobre 2027 — définitivement, rien à payer ensuite."

### 22/10/2026 (suite 3) — correction du compteur B/H : octobre, pas décembre
Nicolas a corrigé une mauvaise compréhension : B et H sont mises en place « D1 », avec le Pack Base — donc leur échéancier démarre aussi en octobre 2026, pas en décembre. Les trois deviennent à vie ensemble en **octobre 2027**. Ce qui ne change pas : le paiement des set up reste étalé (275 € octobre, 120 € novembre — un plan de règlement des frais fixes, distinct du compteur de vesting) et les mensualités réelles démarrent bien en décembre (le geste gratuit porte sur les 2 premiers mois de mensualité des trois briques, mais ces 2 mois comptent quand même dans les 12).
Corrigé : bandeau "Geste à la signature" étendu à B et H (plus seulement le Base), avec le vrai montant du geste (232 € = 116 €/mois × 2 mois offerts, et non 200 €). Table "Mes options actives" : B et H passent de Décembre 2026→2027 à **Octobre 2026→2027**.
Devis relu et validé par Nicolas, prêt à l'envoi.

### 22/10/2026 (suite 4) — page 1 montre tout, page 2 marque ce qui est choisi
Nicolas voulait que la page 1 seule suffise à comprendre ce que fait l'appli (Base + options prises), et que la page 2 garde le catalogue complet avec un marquage visuel de ce qui est déjà choisi. Ajouté :
- Page 1 : nouveau bloc "Vos options, choisies à la signature" (bordure bleue, distincte du Base en bleu marine) juste après le Pack Base, détaillant B et H en style "✓ Comprend" comme le reste de la page.
- Page 2 : lignes B et H surlignées (fond bleu clair) + badge "✓ Choisie à la signature" à côté du titre, le reste du catalogue (A, C, D, E, F, G) inchangé pour plus tard.
- Phrase d'intro allégée : "Ce devis remplace la proposition du 21 septembre ; elle n'est plus valable" devient "Ce devis remplace la proposition du 21 septembre ; seule celle-ci reste valable" (retiré "un ticket d'entrée léger plutôt qu'un gros paiement d'un coup", jugé maladroit).

### 22/10/2026 (suite 5) — Option C offerte en intégralité, -50% H plus visible, retrait GitHub du "need"
- **Option C ajoutée au paquet, offerte en intégralité** (0 € de mise en place, 0 €/mois, à vie dès octobre 2027 comme Base/B/H) — distinct du geste "2 mois offerts" de Base/B/H : pour C, c'est tout l'échéancier (12 mois) qui est gratuit. Catalogue page 2 (prix générique 100€+6€/mois) gardé pour référence, avec prix barré → 0€ et badge doré "★ Offerte en intégralité" sur sa ligne.
- **-50 % sur H rendu visible** : badge doré "-50 %" à côté du titre (page 1 et page 2), prix barré 90€→45€ dans le tableau page 2 (avant, seulement mentionné en petit texte dans la carte récap).
- Page 1 : bloc "Vos options, choisies à la signature" repensé en 3 colonnes compactes (B, C, H) avec titres courts (sans le "Je peux…" du catalogue) pour éviter le débordement de page observé avec la mise en page large à 2 colonnes.
- Page 3 : retiré la ligne "Un compte GitHub pour chacune... dites-moi vos identifiants" de l'encadré "j'ai besoin de vous" — c'est Nicolas qui invite directement, pas une étape à la charge de Nathalie.
- Totaux inchangés (C et le -50% de H ne modifient ni le 395 €/116 €/mois personnalisés, ni le repère catalogue générique 1 050 €/61 €/mois).
