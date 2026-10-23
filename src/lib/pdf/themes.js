/**
 * Thèmes de couleurs des PDF Hu'mana. Chaque thème expose le même jeu de clés
 * que COLORS (brand.js) : `sage*` = teinte dominante (bandeau, barres de
 * section), `clay*` = teinte d'accent (titres, numéros, puces), `cream*` =
 * fonds et filets. Les noms « sage/clay » sont historiques : ils désignent des
 * rôles, pas des couleurs littérales.
 * `logo` : logo détouré lisible sur le bandeau du thème (tous les bandeaux
 * sont assez foncés pour le logo blanc).
 */
export const THEMES = {
  sauge: {
    label: 'Sauge',
    logo: 'brand/logo-blanc-crop.png',
    colors: {
      sage: [143, 163, 121],
      sageDark: [100, 118, 83],
      sageLight: [199, 211, 183],
      sageVeryLight: [243, 246, 238],
      cream: [251, 248, 243],
      creamDeep: [232, 217, 196],
      clay: [216, 128, 118],
      clayDark: [164, 84, 74],
      ink: [38, 42, 35],
      inkLight: [111, 116, 106],
      white: [255, 255, 255],
    },
  },
  argile: {
    label: 'Argile',
    logo: 'brand/logo-blanc-crop.png',
    colors: {
      sage: [188, 122, 108],
      sageDark: [138, 76, 66],
      sageLight: [228, 200, 192],
      sageVeryLight: [250, 240, 236],
      cream: [253, 248, 245],
      creamDeep: [238, 218, 208],
      clay: [168, 104, 84],
      clayDark: [124, 70, 56],
      ink: [46, 36, 33],
      inkLight: [124, 108, 101],
      white: [255, 255, 255],
    },
  },
  ardoise: {
    label: 'Ardoise',
    logo: 'brand/logo-blanc-crop.png',
    colors: {
      sage: [66, 88, 106],
      sageDark: [40, 58, 74],
      sageLight: [176, 190, 201],
      sageVeryLight: [239, 242, 245],
      cream: [250, 247, 241],
      creamDeep: [228, 214, 188],
      clay: [184, 144, 88],
      clayDark: [130, 96, 48],
      ink: [30, 38, 46],
      inkLight: [98, 110, 120],
      white: [255, 255, 255],
    },
  },
};

export const DEFAULT_THEME = 'sauge';
