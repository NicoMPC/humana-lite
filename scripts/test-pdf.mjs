#!/usr/bin/env node
/**
 * Test du moteur PDF : 3 types (peau, cheveux, lifestyle) × 3 thèmes, tous
 * blocs activés, données fictives. Vérifie : pas d'erreur, taille > 0, ≤ 3 pages.
 * Écrit les PDF dans /tmp/humana-lite-pdf (ou $OUT_DIR) pour inspection.
 *
 * Usage : node scripts/test-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// Les sources sont écrites pour Vite (imports sans extension) : loader de repli « .js ».
register(pathToFileURL(path.join(__dirname, 'extensionless-loader.mjs')));

const { renderPdf, THEMES, DEFAULT_BLOCKS } = await import('../src/lib/pdf/index.js');

const OUT_DIR = process.env.OUT_DIR || '/tmp/humana-lite-pdf';
fs.mkdirSync(OUT_DIR, { recursive: true });

const loadAsset = async (rel) => (await fs.promises.readFile(path.join(ROOT, 'public', rel))).toString('base64');

const boutique = {
  nom: "Hu'mana", slogan: 'Beauté naturelle', adresse: '12 rue des Lilas, 44000 Nantes',
  telephone: '02 40 00 00 00', email: 'contact@humana-beaute.fr', site: 'www.humana-beaute.fr', instagram: '@humana.beaute',
};
const client = { prenom: 'Élodie', nom: 'Marchand-Lefèvre', email: 'elodie@example.fr' };
const meta = { date: '2026-09-18', auteur: 'Jessie', lieu: 'boutique' };
const footerMessage = 'Merci de votre confiance. N’hésitez pas à revenir nous voir dans un mois pour faire le point sur votre routine.';

const REPONSES = {
  peau: {
    'qp-type': 'Mixte', 'qp-preoccupations': ['Déshydratation', 'Manque d’éclat', 'Pores dilatés'],
    'qp-sensibilite': 'oui', 'qp-routine': 'Nettoyant le soir, crème hydratante de temps en temps. Pas de sérum.',
    'qp-soleil': 'non', 'qp-allergies': 'Parfums de synthèse', 'qp-objectif': 'Éclat',
  },
  cheveux: {
    'qc-type': 'Bouclés', 'qc-cuir': 'Sec', 'qc-problemes': ['Sécheresse', 'Frisottis', 'Manque de brillance'],
    'qc-lavage': '2 à 3 fois / semaine', 'qc-chaleur': 'oui', 'qc-routine': 'Shampoing doux, après-shampoing sur les longueurs.',
    'qc-allergies': 'Aucune', 'qc-objectif': 'Définition des boucles',
  },
  lifestyle: {},
};

const ROUTINES = {
  peau: [
    { produit: { nom: 'Gel nettoyant douceur', ref: 'HM-101', prix: 18.9, categorie: 'Nettoyants' }, moments: ['matin', 'soir'], conseil: 'Masser 30 secondes sur peau humide, rincer à l’eau tiède.' },
    { produit: { nom: 'Sérum hydratant acide hyaluronique', ref: 'HM-214', prix: 29 }, moments: ['matin', 'soir'], conseil: 'Trois gouttes sur peau encore légèrement humide, avant la crème.' },
    { produit: { nom: 'Crème éclat vitamine C', ref: 'HM-230', prix: 34.5 }, moments: ['matin'], conseil: 'Appliquer en pressant doucement, sans oublier le cou.' },
    { produit: { nom: 'Crème de nuit réparatrice' }, moments: ['soir'], conseil: '' },
    { produit: { nom: 'Masque purifiant argile blanche', ref: 'HM-305', prix: 22 }, moments: ['hebdo'], conseil: 'Une fois par semaine, 10 minutes, ne pas laisser sécher complètement.' },
  ],
  cheveux: [
    { produit: { nom: 'Shampoing doux hydratant', ref: 'HM-410', prix: 14.9 }, moments: ['hebdo'], conseil: 'Masser le cuir chevelu du bout des doigts, rincer longuement.' },
    { produit: { nom: 'Après-shampoing nourrissant', ref: 'HM-415', prix: 15.5 }, moments: ['hebdo'], conseil: 'Sur les longueurs uniquement, laisser poser 3 minutes.' },
    { produit: { nom: 'Crème définition boucles', ref: 'HM-432', prix: 19 }, moments: ['matin'], conseil: 'Sur cheveux humides, en « praying hands », puis laisser sécher à l’air.' },
    { produit: { nom: 'Huile brillance', prix: 21 }, moments: ['matin', 'soir'], conseil: 'Deux gouttes sur les pointes.' },
    { produit: { nom: 'Masque réparateur', ref: 'HM-450', prix: 24 }, moments: ['hebdo'], conseil: 'Une fois par semaine, 15 minutes sous une serviette chaude.' },
  ],
};

const TIPS = [
  { titre: 'Sommeil réparateur', texte: 'Visez 7 à 8 h de sommeil par nuit : c’est la nuit que la peau se régénère.' },
  { titre: 'Hydratation', texte: 'Buvez 1,5 L d’eau par jour, répartis dans la journée.' },
  { titre: 'Protection solaire', texte: 'Appliquez une protection solaire chaque matin, même par temps couvert.' },
  { titre: 'Auto-massage', texte: 'Deux minutes d’auto-massage stimulent la circulation et détendent les tissus.' },
  { titre: 'Assiette beauté', texte: 'Privilégiez les légumes colorés, les bonnes graisses et limitez les sucres rapides.' },
  { titre: 'Gestion du stress', texte: 'Quelques minutes de respiration profonde chaque jour apaisent la peau.' },
];

function buildDoc(type, theme) {
  const blocks = DEFAULT_BLOCKS(type);
  for (const b of blocks) {
    if (b.kind === 'routine') b.data = { items: ROUTINES[type] };
    if (b.kind === 'conseils') b.data = { texte: 'Nettoyez votre visage matin et soir.\nÉvitez les eaux de douche trop chaudes.\nRevenez nous voir dans 4 semaines pour ajuster la routine.' };
    if (b.kind === 'lifestyle') b.data = { tips: TIPS };
  }
  return { type, theme, client, meta, boutique, footerMessage, reponses: REPONSES[type], blocks };
}

let failures = 0;
for (const type of ['peau', 'cheveux', 'lifestyle']) {
  for (const theme of Object.keys(THEMES)) {
    const label = `${type} × ${theme}`;
    try {
      const res = await renderPdf(buildDoc(type, theme), { loadAsset });
      const buf = Buffer.from(await res.blob.arrayBuffer());
      const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      if (!buf.length) throw new Error('PDF vide');
      if (!res.dataUrl.startsWith('data:application/pdf')) throw new Error('dataUrl invalide');
      if (pages > 3) throw new Error(`${pages} pages (> 3)`);
      fs.writeFileSync(path.join(OUT_DIR, `${type}-${theme}.pdf`), buf);
      console.log(`OK   ${label.padEnd(20)} ${res.fileName}  ${(buf.length / 1024).toFixed(0)} Ko  ${pages} p.`);
    } catch (err) {
      failures += 1;
      console.error(`FAIL ${label}: ${err.stack || err}`);
    }
  }
}
console.log(failures ? `\n${failures} échec(s)` : `\nTout est OK (PDF dans ${OUT_DIR})`);
process.exit(failures ? 1 : 0);
