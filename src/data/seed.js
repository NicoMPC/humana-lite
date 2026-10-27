/**
 * État initial de Humana Lite : base VIERGE (aucune cliente, aucun
 * diagnostic, aucun produit d'exemple). Seuls les 2 profils des gérantes et
 * les réglages par défaut sont pré-remplis.
 */
import { QUESTIONS_DEMO } from './questions';
import { GESTES_HABITUDES_CHEVEUX, TIPS_CHEVEUX } from './conseilsCheveux';

export const SCHEMA_VERSION = 1;

// Jessie ET Nathalie sont gérantes, accès identique (aucune vue restreinte).
// Jessie en premier : l'écran de connexion l'affiche en haut.
export const USERS = [
  { id: 'u-jessie', prenom: 'Jessie', nom: '', role: 'gerante', actif: true, couleur: '#8fa379' },
  { id: 'u-nathalie', prenom: 'Nathalie', nom: '', role: 'gerante', actif: true, couleur: '#647653' },
];

export const SETTINGS_DEFAULT = {
  boutique: {
    nom: 'Hu’mana – La Boutique',
    slogan: 'Beauté naturelle',
    adresse: '85 Impasse des Amandiers, 07170 Saint-Germain',
    // Vrai numéro, retrouvé par Nicolas le 27/10/2026 dans la signature mail
    // réelle de Nathalie/Jessie (boîte humanabeautenaturelle@gmail.com) — remplace
    // un placeholder inventé (04 75 00 00 00).
    telephone: '07.49.54.30.20',
    email: 'contact@humana-boutique.fr',
    site: 'www.humana-boutique.fr',
    instagram: '@humana.laboutique',
    // Lien d'avis Google (relance J+14) : valeur par défaut trouvée par Nicolas
    // le 27/10/2026 (fiche Google Business "HU"MANA Massages et Beauté Naturelle),
    // modifiable à tout moment dans Réglages → Fidélisation.
    avisLien: 'https://www.google.com/maps/place/HU%22MANA+Massages+et+Beaut%C3%A9+Naturelle/@44.549656,4.4343391,525m/data=!3m1!1e3!4m8!3m7!1s0x12b4df463e443ec3:0x133d2cd29ec6fdec!8m2!3d44.549656!4d4.436914!9m1!1b1!16s%2Fg%2F11p67_p4bv',
  },
  // Message de fin par défaut (= « signature » du PDF) ; repris dans chaque nouveau document.
  footerMessage: 'Prenez soin de vous, simplement.',
  stock: { dernierImport: null, historique: [] },
  // Bandeau « Démarrage » (27/10/2026) : rappel non bloquant tant qu'il n'a pas été
  // vu une fois par Jessie ou Nathalie — partagé entre les 2 postes comme le reste
  // des réglages, pas par utilisatrice.
  demarrageVu: false,
};

export function buildSeed() {
  return {
    version: SCHEMA_VERSION,
    users: USERS,
    produits: [], // catalogue vierge : import Planity/CSV ou ajout à la main
    settings: SETTINGS_DEFAULT,
    // Éditables par Jessie/Nathalie (Paramètres → Contenu) ; valeurs par défaut reprises du
    // contenu réel V1 tant qu'elles n'ont rien personnalisé côté Sheet (voir hydrateFromSheet).
    questions: { peau: QUESTIONS_DEMO.peau, cheveux: QUESTIONS_DEMO.cheveux },
    conseilsCheveux: { gestes: GESTES_HABITUDES_CHEVEUX, tips: TIPS_CHEVEUX },
  };
}
