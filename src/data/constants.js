/** Constantes métier partagées (statuts, moments, types, catégories). */

export const DIAG_TYPES = {
  peau: { key: 'peau', label: 'Peau', icon: 'fa-solid fa-spa', color: 'sage' },
  cheveux: { key: 'cheveux', label: 'Cheveux', icon: 'fa-solid fa-wind', color: 'clay' },
};

/** Libellé des « boîtes » du compositeur, une par kind de bloc du PDF (voir docs/CONTRACT.md). */
export const BLOCK_LABELS = {
  entete: { titre: 'En-tête', icon: 'fa-regular fa-id-card', aide: 'Logo, titre, « préparée pour », date et « par … » : générés automatiquement.' },
  diagnostic: { titre: 'Diagnostic', icon: 'fa-solid fa-clipboard-list', aide: 'Synthèse des réponses au questionnaire.' },
  routine: { titre: 'Routine', icon: 'fa-solid fa-jar', aide: 'Produits, moments de la journée et conseils d’utilisation.' },
  conseils: { titre: 'Conseils', icon: 'fa-regular fa-lightbulb', aide: 'Conseils généraux libres.' },
  lifestyle: { titre: 'Conseils lifestyle', icon: 'fa-solid fa-seedling', aide: 'Cochez les conseils bien-être à inclure.' },
  message: { titre: 'Message de fin', icon: 'fa-regular fa-envelope', aide: 'Petit mot en bas du document.' },
  coordonnees: { titre: 'Coordonnées de la boutique', icon: 'fa-solid fa-location-dot', aide: 'Adresse, téléphone, site… propres à ce document.' },
};

/** Blocs par défaut (ordre = ordre dans le PDF), voir docs/CONTRACT.md. */
export const DEFAULT_KINDS = {
  peau: ['entete', 'diagnostic', 'routine', 'conseils', 'lifestyle', 'message', 'coordonnees'],
  cheveux: ['entete', 'diagnostic', 'routine', 'conseils', 'lifestyle', 'message', 'coordonnees'],
};

/** Pastilles du sélecteur de thème (affichage seulement — la vraie palette est dans lib/pdf/themes.js). */
export const THEME_SWATCHES = {
  sauge: { label: 'Sauge', colors: ['#647653', '#8fa379', '#f7f3ec'] },
  argile: { label: 'Argile', colors: ['#b0684f', '#d39a80', '#f8efe8'] },
  ardoise: { label: 'Ardoise', colors: ['#3d4a57', '#71808f', '#eef1f4'] },
};

export const MOMENTS = [
  { key: 'matin', label: 'Matin', icon: 'fa-regular fa-sun', hint: 'Au réveil, avant le maquillage' },
  { key: 'soir', label: 'Soir', icon: 'fa-regular fa-moon', hint: 'Avant le coucher' },
  { key: 'hebdo', label: 'Hebdo', icon: 'fa-regular fa-calendar', hint: '1 à 2 fois par semaine' },
];

export const QUESTION_TYPES = {
  choix_multiple: 'Choix multiple',
  choix_unique: 'Choix unique',
  oui_non: 'Oui / Non',
  texte: 'Texte libre',
};

/** Catégories de produits et ordre logique d'application dans une routine. */
export const CATEGORIES = [
  { key: 'Nettoyant', cible: 'peau', ordre: 1, icon: 'fa-solid fa-droplet' },
  { key: 'Lotion', cible: 'peau', ordre: 2, icon: 'fa-solid fa-spray-can-sparkles' },
  { key: 'Sérum', cible: 'peau', ordre: 3, icon: 'fa-solid fa-vial' },
  { key: 'Crème', cible: 'peau', ordre: 4, icon: 'fa-solid fa-jar' },
  { key: 'Huile', cible: 'mixte', ordre: 5, icon: 'fa-solid fa-leaf' },
  { key: 'Masque', cible: 'mixte', ordre: 6, icon: 'fa-solid fa-mask' },
  { key: 'Shampoing', cible: 'cheveux', ordre: 1, icon: 'fa-solid fa-pump-soap' },
  { key: 'Après-shampoing', cible: 'cheveux', ordre: 2, icon: 'fa-solid fa-bottle-droplet' },
  { key: 'Soin capillaire', cible: 'cheveux', ordre: 3, icon: 'fa-solid fa-wand-magic-sparkles' },
  { key: 'Complément alimentaire', cible: 'mixte', ordre: 9, icon: 'fa-solid fa-capsules' },
  { key: 'Accessoire', cible: 'mixte', ordre: 10, icon: 'fa-solid fa-spa' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

export const LIFESTYLE_TIPS = [
  { id: 'sommeil', titre: 'Sommeil réparateur', icon: 'fa-regular fa-moon', texte: 'Visez 7 à 8 h de sommeil par nuit : c’est la nuit que la peau et le cuir chevelu se régénèrent.' },
  { id: 'hydratation', titre: 'Hydratation', icon: 'fa-solid fa-glass-water', texte: 'Buvez 1,5 L d’eau par jour, répartis dans la journée, pour soutenir l’hydratation de l’intérieur.' },
  { id: 'soleil', titre: 'Protection solaire', icon: 'fa-regular fa-sun', texte: 'Appliquez une protection solaire chaque matin, même par temps couvert, pour prévenir taches et vieillissement prématuré.' },
  { id: 'massage', titre: 'Auto-massage', icon: 'fa-regular fa-hand', texte: 'Deux minutes d’auto-massage du visage ou du cuir chevelu stimulent la circulation et détendent les tissus.' },
  { id: 'alimentation', titre: 'Assiette beauté', icon: 'fa-solid fa-seedling', texte: 'Privilégiez les légumes colorés, les bonnes graisses (huile d’olive, oléagineux) et limitez sucres rapides et alcool.' },
  { id: 'stress', titre: 'Gestion du stress', icon: 'fa-solid fa-spa', texte: 'Quelques minutes de respiration profonde chaque jour apaisent le système nerveux, et la peau le ressent.' },
  { id: 'chaleur', titre: 'Chaleur douce', icon: 'fa-solid fa-temperature-low', texte: 'Rincez à l’eau tiède et limitez les appareils chauffants : la chaleur excessive fragilise peau et fibre capillaire.' },
  { id: 'taie', titre: 'Linge propre', icon: 'fa-solid fa-bed', texte: 'Changez taie d’oreiller et serviettes chaque semaine pour limiter bactéries et frottements.' },
];
