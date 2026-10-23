# Contenu réel V1 — Diagnostic & routine cheveux (transcrit des PDF sources)

Source : pièces jointes de l'onboarding Nathalie (`docs/reponses-onboarding-humana.json`), récupérées via les liens Drive publics le 23/10/2026, PDF conservés dans `docs/sources-onboarding/`. Ce document transcrit leur contenu en texte pour que le Lot 2 (vraies grilles) n'ait pas besoin de rouvrir les PDF. **C'est la vraie matière cheveux** — à utiliser pour remplacer les questions génériques de `src/data/questions.js` et enrichir le compositeur PDF (`src/lib/pdf/`).

---

## A. Cahier des charges — Fiche cliente & grille d'entretien (diagnostic capillaire V1)

Objectif du doc source : centraliser le dossier cliente + une grille complète utilisable pendant le diagnostic, **sans que l'outil ne pose le diagnostic à la place de la praticienne**. Infos recueillies librement puis interprétées par la pro. Principe transversal : saisie rapide pendant l'échange, champs structurés + zones libres, petits mémos uniquement si ça aide à ne rien oublier.

### 1. Fiche cliente

**1.1 Identité et coordonnées**
- Nom * (obligatoire)
- Prénom * (obligatoire)
- Date de naissance (calcule l'âge automatiquement)
- Téléphone * (obligatoire)
- E-mail * (obligatoire)
- Adresse postale complète * (obligatoire — utile pour les futurs envois)

**1.2 Contexte personnel utile**
- Allergies : Oui/Non + précisions
- Grossesse / allaitement : Oui/Non + précisions si nécessaire
- Traitements en cours : infos mentionnées volontairement par la cliente
- Nombre d'enfants : facultatif / contexte utile

**1.3 Acquisition / relation cliente**
- Comment nous a-t-elle connues ? Réseaux sociaux / bouche-à-oreille / passage boutique / recherche internet / autre
- Notes générales : champ libre

### 2. Diagnostic cheveux & cuir chevelu — grille d'entretien

**2.1 Problématique et objectif**
- Problématique : pourquoi la cliente vient-elle ? Quel est son problème principal ?
- Objectif : qu'aimerait-elle obtenir, améliorer ou comprendre grâce au diagnostic ?

**2.2 Analyse du cuir chevelu** (à cocher et/ou commenter, prévoir RAS / cuir chevelu normal)
- Sébum : racines grasses / tendance grasse / équilibre apparent / autre
- Pellicules : aucune / sèches / grasses / autre
- Cuir chevelu sec
- Desquamation
- Démangeaisons : oui/non + intensité ou précisions
- Irritations / rougeurs
- Croûtes
- Autre observation
- RAS / cuir chevelu normal

**Chute de cheveux**
- Présence d'une chute : Oui/Non
- Intensité : légère / modérée / importante + commentaire
- Depuis quand ? (champ libre)
- Répartition : diffuse / localisée + zone(s)
- Alopécie de traction : Oui/Non/suspicion + zone concernée
- Constat de la cliente : ce qu'elle remarque concrètement (douche, brosse, zones clairsemées, etc.)
- Observations praticienne : champ libre

**2.3 Analyse de la fibre capillaire** — état des longueurs et des pointes, plusieurs choix possibles :
RAS · Frisottis · Terne · Sèche · Abîmée · Fourchue · Plate / manque de volume · Autre + précision

**2.4 Porosité**
- Q1 — Temps de séchage : les cheveux sèchent-ils très vite, dans un temps raisonnable, ou très lentement ?
- Q2 — Réaction aux produits : effet lourd/poisseux en surface ; utilisation facile sans effet particulier ; ou cheveux restant secs et sujets à la casse malgré les soins
- Q3 — Aspect : souvent brillants / aspect intermédiaire ou normal / plutôt ternes
- Observations complémentaires : champ libre
- Conclusion praticienne : porosité faible / moyenne / élevée
  - Faible : cuticules bien serrées ; hydratation pénètre difficilement mais, une fois à l'intérieur, bien retenue.
  - Moyenne : cuticules légèrement ouvertes ; hydratation et nutriments bien absorbés et retenus.
  - Élevée : cuticules très ouvertes ou endommagées ; le cheveu absorbe facilement mais perd l'hydratation rapidement.

**2.5 Type de cheveux**
- Forme / nature : raides / ondulés / bouclés / frisés / crépus
- Épaisseur du cheveu : fin / moyen / épais

### 3. Habitudes et routine actuelle

**3.1 Habitudes générales**
- Fréquence de lavage : nombre de lavages/semaine ou intervalle habituel
- Séchage : naturel / sèche-cheveux (air froid, tiède, chaud)
- Appareils chauffants : lisseur / boucleur / autre ; fréquence ; protection thermique oui/non
- Coloration / technique : aucune / végétale / chimique / décoloration / mèches / lissage / permanente / autre
- Produits naturels : oui/non/partiellement + précisions

**3.2 Lavage**
- Fréquence, nombre de shampoings (un seul / deux successifs / autre)
- Shampoing n°1 : nom + marque
- Shampoing n°2 : même produit / produit différent + nom et marque
- Température de l'eau : froide / tiède / chaude / variable
- Shampoing sec : jamais / parfois / régulièrement ; type (aérosol/poudre/mousse/autre) ; produit/marque ; quand et pourquoi (espacer les lavages / absorber le sébum / volume / autre)

**3.3 Petits soins**
- Après-shampoing : Oui/Non, produit (nom+marque), fréquence (à chaque lavage/parfois/autre), zone d'application (longueurs/pointes/jusqu'aux racines/autre)
- Démêlage : sous la douche / après lavage / à sec / autre
- Soin démêlant : Oui/Non + produit utilisé

**3.4 Coiffage après lavage** (pour chaque catégorie : nom/marque, application cheveux mouillés/essorés/secs, quantité, fréquence, ressenti/effet)
Soin sans rinçage (lait/crème/leave-in) · Gelée capillaire · Spray capillaire · Sérum · Huile · Produits fixants (laque/cire/pâte/autre + utilisation)

**3.5 Refresh entre deux lavages**
- Fait-elle des refresh ? Oui/Non + fréquence
- Produits utilisés : catégories/noms/marques
- Support d'application : cheveux secs / ré-humidifiés / mouillés
- Quantité : champ libre
- Résultat/ressenti : ce qui fonctionne, alourdit, assèche, cartonne, etc.

**3.6 Soins profonds** (pour chaque soin : produit/marque, fréquence, durée de pose, ressenti)
Masque · Bain d'huile · Gommage du cuir chevelu · Soin protéiné · Masque aux poudres · Autre

**3.7 Habitudes nocturnes**
- Cheveux la nuit : attachés/détachés ; si attachés, type de coiffure protectrice/attache
- Protection : taie en soie / bonnet / foulard / autre / aucune
- Objectif : préserver les boucles / limiter les nœuds / préserver le volume / limiter les frottements / autre

**3.8 Piscine, mer, sport et protections** (pour chaque situation : concernée ? avant ? après ?)
Piscine (fréquence/habitudes) · Mer (fréquence/habitudes) · Sport (type/fréquence) · Avant (produit protecteur / coiffure ou technique protectrice / rien / autre) · Après (rien / rinçage seul / shampoing / routine complète / autre) · Techniques particulières (libre)

**3.9 Remarques et perception de la routine**
- Remarques / autres habitudes : champ libre pour tout élément non prévu dans la grille
- Satisfaction : Oui/Non/partiellement
- Pourquoi : ce qu'elle aime, ce qui ne fonctionne pas, ce qu'elle aimerait améliorer

### 4. Contraintes & préférences pour la future routine

Question d'ouverture : « Y a-t-il des choses que vous ne souhaitez pas faire, ou que vous n'êtes pas prête à changer dans votre routine ? »
- Temps à consacrer : très court / raisonnable / prête à consacrer davantage de temps
- Nombre de produits : minimaliste / intermédiaire / pas de limite particulière
- Budget : petit / moyen / confortable + montant libre si la cliente donne une enveloppe
- Habitudes à ne pas modifier : libre
- Gestes/techniques refusés : libre
- Produits non souhaités : libre
- Autres contraintes/préférences : libre

Question complémentaire : « À l'inverse, qu'est-ce que vous êtes prête à changer ou à mettre en place ? »
- Changements acceptés : libre (niveau d'engagement, propositions réalistes)

### 5. Philosophie de la future solution (intentions produit de Nathalie)
- Une fiche cliente unique regroupant toutes les informations et l'historique.
- La grille est remplie librement pendant l'entretien ; elle ne décide pas à la place de la praticienne.
- Les mémos sont courts, aide ponctuelle uniquement.
- Saisie rapide, même pendant une visio ou plusieurs diagnostics la même journée.
- À terme le dossier doit aussi accueillir : analyse finale, besoins identifiés, propositions de routines, routine choisie, PDF cliente, **suivi J+10** (note : le devis signé retient finalement **J+14**, cf. `reponses-onboarding-humana.json` → `delai_relance_jours: 14` et le devis signé), bilan à 6-8 semaines, photos avant/après.
- Objectif à long terme : une méthode HU''MANA structurée, transmissible à d'autres praticiennes.

---

## B. Fiche routine finale — Construction, bibliothèque de conseils et maquette visuelle V1

Objectif du doc source : une fiche pratique que la cliente comprend en quelques secondes — quoi utiliser, quand, dans quel ordre, combien et comment. **Les rubriques inutiles pour une cliente disparaissent automatiquement.**

### 1. Construction de la fiche routine finale

**1 — Ma routine cheveux**
- Prénom de la cliente et date.
- Uniquement les objectifs principaux, ex. « Apaiser mon cuir chevelu » + « Définir mes boucles ».
- Pas de diagnostic détaillé, de porosité ni d'analyse professionnelle sur cette fiche pratique.

**2 — Mon jour de lavage** (présentation dans l'ordre réel d'utilisation : Étape 1, Étape 2, Étape 3…)
- Shampoing : produit + localisation + quantité + méthode + nombre de shampoings si utile
- Après-shampoing : produit + localisation + quantité + méthode + temps de pose si pertinent
- Coiffants : chaque produit dans l'ordre, produit + localisation + quantité + méthode
- Les champs sans intérêt pour un produit ne sont pas affichés.

**3 — Entre mes shampoings** (routine de refresh/entretien entre deux lavages, étape par étape)
- Étape 1 : geste éventuel (humidifier, démêler légèrement, etc.)
- Étapes suivantes : produit + localisation + quantité + méthode, dans l'ordre exact
- Si aucune action n'est recommandée entre les shampoings, cette rubrique disparaît.

**4 — Mes soins profonds**
- Soin hebdomadaire : produit + fréquence + localisation + quantité + méthode + temps de pose
- Soin mensuel : même structure
- Soin trimestriel : même structure
- Exemples : masque, détox, masque aux poudres, bain d'huile ponctuel, soin profond ciblé

**5 — Mes soins spécifiques** (tout protocole régulier ou ciblé qui ne rentre ni dans le jour de lavage, ni le coiffage, ni les soins profonds)
- Lotion quotidienne ou lotion pousse
- Complément alimentaire / cure
- Huiles essentielles selon protocole défini
- Autre soin ciblé avec fréquence particulière
- Afficher selon le besoin : produit + fréquence/moment + localisation si applicable + quantité + méthode + durée de cure si pertinent

**6 — Mes gestes & habitudes** : conseils personnalisés liés aux gestes du quotidien, au matériel, à la nuit, au sport, aux baignades, au soleil, à la chaleur. **Remplace les anciennes rubriques séparées « nuit », « sport », « piscine » et « cas particuliers ».**

**7 — Mes tips à ne pas oublier** : 3 à 6 rappels maximum, courts, chaleureux, immédiatement applicables. Pense-bête, pas règlement intérieur.

### 2. Principe de personnalisation
Les infos d'utilisation enregistrées dans la base produit servent de **valeurs par défaut**. Lors de la création de la routine, la praticienne peut les adapter à la cliente **sans modifier la fiche produit d'origine**.
Exemple : la base indique « masque 1 fois/semaine » ; pour une cliente donnée, la routine peut indiquer « 1 fois toutes les 2 semaines ».

### Bibliothèque interne — Gestes & habitudes (banque de formulations à sélectionner et personnaliser)

**Jour de lavage / shampoing**
- Adapter la fréquence des lavages aux besoins réels du cuir chevelu.
- Faire un seul shampoing par lavage lorsque cela suffit.
- Faire deux shampoings uniquement lorsque cela est réellement nécessaire.
- Appliquer le shampoing principalement sur le cuir chevelu et les racines.
- Faire des sections pour mieux répartir le shampoing sur le cuir chevelu.
- Masser avec la pulpe des doigts sans griffer avec les ongles.
- Rincer soigneusement afin de ne pas laisser de résidus.
- Privilégier une eau tiède plutôt que très chaude.

**Démêlage / manipulation**
- Démêler en douceur en commençant par les pointes puis remonter progressivement.
- Profiter de l'après-shampoing pour faciliter le démêlage si cela convient à la chevelure.
- Éviter de tirer sur les nœuds ou de démêler brutalement.
- Limiter les manipulations répétées lorsque les cheveux sont fragiles.
- Utiliser une brosse ou un peigne adapté à la nature et à l'épaisseur des cheveux.

**Séchage / serviette**
- Utiliser une serviette microfibre ou une matière douce adaptée.
- Essorer en pressant ou en tamponnant sans frotter les cheveux.
- Éviter de garder les cheveux mouillés enfermés trop longtemps dans une serviette.
- Privilégier un séchage doux et maîtrisé.
- Ne pas se coucher avec les cheveux encore mouillés si cela favorise les nœuds, frottements ou inconforts.

**Chaleur**
- Limiter l'utilisation du lisseur et des appareils très chauds.
- Utiliser une protection thermique avant toute exposition à la chaleur.
- Privilégier une température modérée adaptée aux cheveux.
- Utiliser le sèche-cheveux sur air froid ou tiède lorsque possible.
- Éviter de repasser plusieurs fois sur la même mèche.
- Espacer les coiffages chauffants autant que possible.

**Nuit / protection**
- Adopter une coiffure protectrice pour dormir.
- Éviter les attaches trop serrées pendant la nuit.
- Utiliser une taie d'oreiller en soie ou satin adaptée.
- Utiliser un bonnet ou foulard de protection si cela convient à la coiffure.
- Protéger les longueurs des frottements pendant la nuit.
- Adapter la coiffure nocturne pour préserver les boucles et limiter les nœuds.

**Coiffures / tractions**
- Éviter les coiffures très serrées et les tractions répétées.
- Varier l'emplacement des attaches pour ne pas solliciter toujours les mêmes zones.
- Privilégier des accessoires qui accrochent et cassent moins la fibre.
- Éviter de serrer excessivement élastiques, pinces ou coiffures protectrices.
- Relâcher régulièrement les cheveux lorsqu'ils sont souvent attachés.

**Sport**
- Adapter l'attache pendant le sport afin de limiter frottements et tractions.
- Éviter de laisser la transpiration sécher longtemps sur le cuir chevelu si elle provoque de l'inconfort.
- Après le sport : rincer, laver ou faire un refresh selon les besoins du cuir chevelu et la fréquence des séances.
- Éviter de multiplier les shampoings agressifs uniquement à cause du sport.
- Prévoir une routine simplifiée les jours d'activité sportive fréquente.

**Piscine / mer / baignade**
- Mouiller les cheveux à l'eau claire avant la baignade lorsque pertinent.
- Utiliser la protection capillaire recommandée avant la baignade.
- Rincer soigneusement les cheveux à l'eau claire après la piscine ou la mer.
- Ne pas laisser durablement chlore, sel ou eau de baignade sécher sur les cheveux.
- Prévoir un lavage ou un soin adapté après les baignades répétées.
- Attacher ou protéger les longueurs pendant la baignade si nécessaire.

**Soleil / extérieur**
- Protéger les cheveux lors d'expositions solaires prolongées.
- Utiliser un chapeau, foulard ou accessoire de protection lorsque pertinent.
- Renforcer la protection des longueurs en période d'expositions répétées.
- Adapter hydratation et soins lorsque soleil, vent ou chaleur assèchent davantage les cheveux.

**Produits / quantités**
- Commencer par une petite quantité de produit puis en ajouter seulement si nécessaire.
- Répartir les produits par sections pour une application plus homogène.
- Respecter les zones d'application : cuir chevelu, longueurs ou pointes selon le produit.
- Éviter d'accumuler trop de produits si les cheveux s'alourdissent facilement.
- Clarifier ou détoxifier ponctuellement lorsque les accumulations le nécessitent.
- Adapter la quantité de coiffants à l'épaisseur et à la longueur des cheveux.

**Shampoing sec / fixants**
- Utiliser le shampoing sec ponctuellement plutôt que comme remplacement systématique du lavage.
- Éviter l'accumulation répétée de shampoing sec sur le cuir chevelu.
- Éliminer correctement les résidus lors du lavage suivant.
- Limiter les produits fixants très desséchants si la fibre devient sèche ou cassante.
- Privilégier une alternative de coiffage plus adaptée lorsque possible.

**Accessoires / entretien**
- Nettoyer régulièrement brosses, peignes et accessoires.
- Laisser sécher correctement les produits solides entre deux utilisations.
- Utiliser un support adapté aux produits solides fragiles.
- Remplacer les accessoires abîmés susceptibles d'accrocher les cheveux.
- Veiller à la propreté des bonnets, foulards et taies utilisés au contact des cheveux.

### Bibliothèque interne — Mes tips à ne pas oublier (formulations courtes prêtes à sélectionner, au « je »)

- Mon shampoing s'applique surtout sur mon cuir chevelu, pas sur mes longueurs.
- Je protège mes longueurs pendant la nuit.
- Je masse mon cuir chevelu avec la pulpe des doigts, jamais avec les ongles.
- Je privilégie une coiffure protectrice qui ne tire pas sur mes racines.
- Je rince toujours soigneusement mes produits.
- Je varie mes attaches pour éviter les tractions toujours au même endroit.
- Je privilégie une eau tiède plutôt que très chaude.
- Je protège mes cheveux du soleil lors des expositions prolongées.
- Je commence toujours par une petite quantité de produit : j'en ajoute seulement si besoin.
- Je rince mes cheveux après la piscine ou la mer.
- Je fais des sections pour mieux répartir mes produits.
- Je pense à protéger mes cheveux avant une baignade lorsque cela est prévu dans ma routine.
- Je démêle mes cheveux en douceur, en commençant par les pointes.
- Après le sport, j'adapte lavage, rinçage ou refresh à l'état réel de mon cuir chevelu.
- Je profite de mon après-shampoing pour démêler si c'est ce qui convient le mieux à mes cheveux.
- Je n'utilise pas le shampoing sec pour repousser indéfiniment mes lavages.
- Je ne frotte pas mes cheveux avec ma serviette : je presse ou je tamponne.
- Je nettoie régulièrement ma brosse et mes accessoires.
- Je privilégie ma serviette microfibre pour limiter les frottements.
- Je laisse bien sécher mon shampoing solide entre deux utilisations.
- Mes coiffants s'appliquent sur le niveau d'humidité conseillé dans ma routine.
- Je respecte la fréquence de mes soins profonds : plus n'est pas toujours mieux.
- Si mes cheveux sont beaux entre deux lavages, je ne suis pas obligée de faire un refresh.
- Je respecte le temps de pose conseillé plutôt que de laisser systématiquement mes soins toute la nuit.
- Je n'ajoute pas de produit automatiquement : j'observe d'abord ce dont mes cheveux ont besoin.
- Je concentre les huiles et les soins riches là où mes cheveux en ont réellement besoin.
- Je protège mes cheveux avant d'utiliser de la chaleur.
- Je garde ma routine simple et régulière : la constance compte plus que l'accumulation de produits.
- Je privilégie une chaleur modérée et j'évite les passages répétés.
- Si un produit provoque un inconfort inhabituel, j'arrête son utilisation et je demande conseil.

> Conseil d'utilisation interne (du doc source) : sélectionner idéalement 3 à 6 tips réellement pertinents pour la cliente. Cette bibliothèque peut devenir un menu déroulant / multi-sélection dans l'outil.

### Ébauche visuelle (exemple fictif de fiche remise à la cliente, pour référence de mise en page)

```
MA ROUTINE CHEVEUX HU''MANA          MES OBJECTIFS
Alison - 22 août 2026                Apaiser mon cuir chevelu
                                      Définir mes boucles

MON JOUR DE LAVAGE
Étape 1 — Shampooing Avoine - Orée des Sens
  Localisation : cuir chevelu / racines · Quantité : selon besoin
  Méthode : faire des sections, appliquer directement sur le cuir chevelu, masser doucement puis rincer
  Nombre : 1 shampoing
Étape 2 — Après-shampoing X
  Localisation : longueurs et pointes · Quantité : 1 noix
  Méthode : répartir, démêler délicatement puis rincer · Temps de pose : 3 min
Étape 3 — Leave-in Y
  Localisation : longueurs · Quantité : 1 petite noisette
  Méthode : répartir sur cheveux bien mouillés puis scruncher
Étape 4 — Gelée Z
  Localisation : longueurs · Quantité : petite quantité par section
  Méthode : répartir puis scruncher pour définir les boucles

ENTRE MES SHAMPOINGS
1. Humidifier légèrement les longueurs
2. Spray Y — longueurs, 3-4 sprays, répartir légèrement
3. Gelée Z — zones à redéfinir, très peu, scruncher

MES SOINS PROFONDS
HEBDOMADAIRE : Masque X (longueurs, 1 noix, sur cheveux essorés, pose 10 min)
MENSUEL : Détox Y (cuir chevelu, selon protocole, par sections, pose 5 min)
TRIMESTRIEL : Bain d'huile Z (cuir chevelu, légère, masser puis laver, pose 30 min)

MES SOINS SPÉCIFIQUES
Lotion pousse — tous les soirs, cuir chevelu, 5 pulvérisations, répartir par sections puis masser
Complément alimentaire — 1 prise/jour pendant la cure, suivre les recommandations du produit

MES GESTES & HABITUDES
NUIT : coiffure protectrice souple + taie adaptée
SÉCHAGE : serviette microfibre, sans frotter
CHALEUR : limiter le lisseur, privilégier l'air tiède/froid
SPORT : après la séance, adapter rinçage ou lavage selon l'état du cuir chevelu

MES TIPS À NE PAS OUBLIER
♡ Mon shampoing s'applique surtout sur mon cuir chevelu, pas sur mes longueurs.
♡ Je commence par une petite quantité de coiffant puis j'ajuste.
♡ Je ne frotte pas mes cheveux avec ma serviette.
♡ Si mes boucles sont belles, je ne suis pas obligée de faire un refresh.
```

Note du doc source : « Cette maquette est une base fonctionnelle : logo, couleurs exactes, typographies et photos réelles pourront être appliqués dans la version graphique finale. »

---

## Ce que ça implique pour le code (Lot 2)

- `src/data/questions.js` (section `cheveux`) : remplacer par la vraie grille (fiche cliente §1 + diagnostic §2 + habitudes §3 + contraintes §4 ci-dessus) — c'est beaucoup plus riche que les 8 questions génériques actuelles, à découper en sous-sections/étapes.
- `doc.client` (structure dans `docs/CONTRACT.md`) : à enrichir — adresse, date de naissance, allergies, grossesse, traitements, enfants, acquisition — recoupe largement les champs promis par l'**option B** (dossier cliente complet) du devis signé, donc double emploi à clarifier : quels champs vont dans le Pack Base (diagnostic ponctuel) vs dans l'option B (dossier permanent) ?
- `BlockKind: 'routine'` (`docs/CONTRACT.md`, `src/lib/pdf/routinePdf.js`) : le modèle actuel (`items: [{produit, moments: matin/soir/hebdo, conseil}]`) est trop simple face aux 7 rubriques réelles (jour de lavage / entre shampoings / soins profonds hebdo-mensuel-trimestriel / soins spécifiques / gestes & habitudes / tips) — à repenser pour coller à la structure V1.
- Bibliothèque de conseils : les deux listes ci-dessus (gestes & habitudes, tips) sont prêtes à devenir la bibliothèque préchargée et modifiable promise dans le Pack Base.
- Toujours en attente : la grille **peau/visage**, pas encore reçue (cf. `ROADMAP-EXECUTION.md`).
