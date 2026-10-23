/**
 * Modèle de données du bloc `routine` côté cheveux (7 rubriques réelles V1,
 * voir docs/CONTRACT.md et docs/CONTENU-CHEVEUX-V1.md section B). Fichier à
 * part, sans dépendance jsPDF/navigateur, pour pouvoir être importé aussi
 * bien par le store (`useStudio.js`) que par le moteur PDF (`pdf/index.js`).
 */
export function emptyRoutineCheveux() {
  return {
    objectifs: [],
    jourLavage: [],
    entreShampoings: [],
    soinsProfonds: { hebdo: [], mensuel: [], trimestriel: [] },
    soinsSpecifiques: [],
    gestes: [],
    tips: [],
  };
}
