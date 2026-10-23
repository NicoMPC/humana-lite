/** Questionnaires de diagnostic par défaut (modifiables dans Paramètres). */

export const QUESTIONS_DEMO = {
  // TODO: grille peau réelle non reçue, voir docs/ROADMAP-EXECUTION.md
  peau: [
    { id: 'qp-type', texte: 'Quel type de peau observez-vous ?', type: 'choix_unique', options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible'], obligatoire: true, aide: 'Observez la zone T et les joues après nettoyage.' },
    { id: 'qp-preoccupations', texte: 'Quelles sont les préoccupations principales ?', type: 'choix_multiple', options: ['Déshydratation', 'Imperfections', 'Rides & ridules', 'Taches', 'Rougeurs', 'Manque d’éclat', 'Pores dilatés'], obligatoire: true },
    { id: 'qp-sensibilite', texte: 'La peau réagit-elle facilement aux produits ?', type: 'oui_non', options: [], obligatoire: true },
    { id: 'qp-routine', texte: 'Quelle est sa routine actuelle ?', type: 'texte', options: [], obligatoire: false, aide: 'Produits utilisés, fréquence, ce qu’elle aime ou non.' },
    { id: 'qp-soleil', texte: 'Utilise-t-elle une protection solaire au quotidien ?', type: 'oui_non', options: [], obligatoire: false },
    { id: 'qp-allergies', texte: 'Allergies ou ingrédients à éviter ?', type: 'texte', options: [], obligatoire: false },
    { id: 'qp-objectif', texte: 'Quel est l’objectif principal de la routine ?', type: 'choix_unique', options: ['Hydratation', 'Anti-âge', 'Éclat', 'Purification', 'Apaisement'], obligatoire: true },
  ],
  // Grille réelle transcrite depuis docs/CONTENU-CHEVEUX-V1.md (section A, points 2.1 à 2.5).
  // Les sections 3 (habitudes et routine actuelle) et 4 (contraintes & préférences) du doc source
  // ne sont pas reprises ici : elles ne décrivent pas l'état de la cliente mais la manière de
  // construire sa future routine (quels produits, quelle fréquence, quelles contraintes) — ce
  // contenu est capturé directement dans les champs structurés du compositeur de routine
  // (RoutineBuilderCheveux : produit, localisation, quantité, méthode… par étape), pas ici.
  cheveux: [
    // 2.1 — Problématique et objectif
    { id: 'qc-problematique', texte: 'Quelle est la problématique ? Pourquoi la cliente vient-elle ?', type: 'texte', options: [], obligatoire: false, aide: 'Le problème principal, dans ses propres mots.' },
    { id: 'qc-objectif', texte: 'Quel est son objectif ?', type: 'texte', options: [], obligatoire: true, aide: 'Qu’aimerait-elle obtenir, améliorer ou comprendre grâce au diagnostic ?' },

    // 2.2 — Analyse du cuir chevelu
    { id: 'qc-cuir-observations', texte: 'Analyse du cuir chevelu', type: 'choix_multiple', options: ['Racines grasses', 'Tendance grasse', 'Pellicules sèches', 'Pellicules grasses', 'Cuir chevelu sec', 'Desquamation', 'Démangeaisons', 'Irritations / rougeurs', 'Croûtes', 'RAS / cuir chevelu normal'], obligatoire: true, aide: 'Plusieurs réponses possibles. Cochez « RAS / cuir chevelu normal » si rien de particulier.' },
    { id: 'qc-cuir-demangeaisons-precisions', texte: 'Si démangeaisons : intensité ou précisions', type: 'texte', options: [], obligatoire: false },
    { id: 'qc-cuir-autre', texte: 'Autre observation sur le cuir chevelu', type: 'texte', options: [], obligatoire: false },

    // Chute de cheveux
    { id: 'qc-chute', texte: 'Présence d’une chute de cheveux ?', type: 'oui_non', options: [], obligatoire: true },
    { id: 'qc-chute-intensite', texte: 'Si chute : quelle intensité ?', type: 'choix_unique', options: ['Légère', 'Modérée', 'Importante'], obligatoire: false, aide: 'Un commentaire libre peut être ajouté dans les observations ci-dessous.' },
    { id: 'qc-chute-depuis', texte: 'Depuis quand ?', type: 'texte', options: [], obligatoire: false },
    { id: 'qc-chute-repartition', texte: 'Répartition de la chute', type: 'choix_unique', options: ['Diffuse', 'Localisée'], obligatoire: false },
    { id: 'qc-chute-zone', texte: 'Si localisée : quelle(s) zone(s) ?', type: 'texte', options: [], obligatoire: false },
    { id: 'qc-chute-traction', texte: 'Alopécie de traction ?', type: 'choix_unique', options: ['Oui', 'Non', 'Suspicion'], obligatoire: false, aide: 'Préciser la zone concernée dans les observations si oui ou suspicion.' },
    { id: 'qc-chute-constat', texte: 'Constat de la cliente', type: 'texte', options: [], obligatoire: false, aide: 'Ce qu’elle remarque concrètement : douche, brosse, zones clairsemées…' },
    { id: 'qc-chute-observations', texte: 'Observations de la praticienne', type: 'texte', options: [], obligatoire: false },

    // 2.3 — Analyse de la fibre capillaire
    { id: 'qc-fibre', texte: 'État de la fibre capillaire (longueurs et pointes)', type: 'choix_multiple', options: ['RAS', 'Frisottis', 'Terne', 'Sèche', 'Abîmée', 'Fourchue', 'Plate / manque de volume', 'Autre'], obligatoire: true, aide: 'Plusieurs choix possibles.' },
    { id: 'qc-fibre-autre', texte: 'Si « Autre » : précisez', type: 'texte', options: [], obligatoire: false },

    // 2.4 — Porosité
    { id: 'qc-porosite-sechage', texte: 'Temps de séchage des cheveux', type: 'choix_unique', options: ['Très vite', 'Temps raisonnable', 'Très lentement'], obligatoire: false },
    { id: 'qc-porosite-produits', texte: 'Réaction aux produits', type: 'choix_unique', options: ['Effet lourd / poisseux en surface', 'Utilisation facile, sans effet particulier', 'Cheveux secs et sujets à la casse malgré les soins'], obligatoire: false },
    { id: 'qc-porosite-aspect', texte: 'Aspect général des cheveux', type: 'choix_unique', options: ['Souvent brillants', 'Aspect intermédiaire ou normal', 'Plutôt ternes'], obligatoire: false },
    { id: 'qc-porosite-observations', texte: 'Observations complémentaires sur la porosité', type: 'texte', options: [], obligatoire: false },
    { id: 'qc-porosite-conclusion', texte: 'Conclusion de la praticienne : porosité', type: 'choix_unique', options: ['Faible', 'Moyenne', 'Élevée'], obligatoire: false, aide: 'Faible : cuticules bien serrées, hydratation pénètre difficilement mais bien retenue une fois à l’intérieur. Moyenne : cuticules légèrement ouvertes, hydratation et nutriments bien absorbés et retenus. Élevée : cuticules très ouvertes ou endommagées, le cheveu absorbe facilement mais perd l’hydratation rapidement.' },

    // 2.5 — Type de cheveux
    { id: 'qc-type-forme', texte: 'Forme / nature des cheveux', type: 'choix_unique', options: ['Raides', 'Ondulés', 'Bouclés', 'Frisés', 'Crépus'], obligatoire: true },
    { id: 'qc-type-epaisseur', texte: 'Épaisseur du cheveu', type: 'choix_unique', options: ['Fin', 'Moyen', 'Épais'], obligatoire: true },
  ],
};
