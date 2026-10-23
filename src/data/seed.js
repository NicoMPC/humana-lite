/**
 * État initial de Humana Lite : base VIERGE (aucune cliente, aucun
 * diagnostic, aucun produit d'exemple). Seuls les 2 profils des gérantes et
 * les réglages par défaut sont pré-remplis.
 */

export const SCHEMA_VERSION = 1;

// Jessie ET Nathalie sont gérantes, accès identique (aucune vue restreinte).
// Jessie en premier : l'écran de connexion l'affiche en haut.
export const USERS = [
  { id: 'u-jessie', prenom: 'Jessie', nom: '', role: 'gerante', actif: true, couleur: '#8fa379' },
  { id: 'u-nathalie', prenom: 'Nathalie', nom: '', role: 'gerante', actif: true, couleur: '#647653' },
];

export const SETTINGS_DEFAULT = {
  securite: { code: 'Humanabeta' },
  boutique: {
    nom: 'Hu’mana – La Boutique',
    slogan: 'Beauté naturelle',
    adresse: '85 Impasse des Amandiers, 07170 Saint-Germain',
    telephone: '04 75 00 00 00',
    email: 'contact@humana-boutique.fr',
    site: 'www.humana-boutique.fr',
    instagram: '@humana.laboutique',
  },
  // Message de fin par défaut (= « signature » du PDF) ; repris dans chaque nouveau document.
  footerMessage: 'Prenez soin de vous, simplement.',
  stock: { dernierImport: null, historique: [] },
};

export function buildSeed() {
  return {
    version: SCHEMA_VERSION,
    users: USERS,
    produits: [], // catalogue vierge : import Planity/CSV ou ajout à la main
    settings: SETTINGS_DEFAULT,
  };
}
