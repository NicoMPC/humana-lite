#!/usr/bin/env node
/**
 * Test de la fonctionnalité "rouvrir un document archivé" (voir
 * docs/CONTRACT-ADDENDUM-reopen-doc.md). Deux choses à vérifier :
 *
 *  1. Un `doc` compositeur complet (cheveux, réponses + routine 7 rubriques
 *     remplies) survit à un aller-retour `JSON.parse(JSON.stringify(doc))`
 *     (= passage par la colonne "json" du Sheet) sans perte de donnée utile
 *     au rendu, puis `renderPdf(docRechargé, { loadAsset })` fonctionne sans
 *     erreur sur ce doc rechargé.
 *  2. La garde de taille `clampComposerDoc_` (apps-script/Code.gs) ne lève
 *     jamais d'exception, même sur une entrée artificiellement énorme ou
 *     non sérialisable — testée en isolation en extrayant sa source du
 *     fichier .gs (du JS pur, sans API Apps Script) et en l'évaluant dans
 *     une petite sandbox Node.
 *
 * Usage : node scripts/test-reopen-doc.mjs
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
register(pathToFileURL(path.join(__dirname, 'extensionless-loader.mjs')));

const { renderPdf, DEFAULT_BLOCKS } = await import('../src/lib/pdf/index.js');

const loadAsset = async (rel) => (await fs.promises.readFile(path.join(ROOT, 'public', rel))).toString('base64');

let failures = 0;
function check(label, fn) {
  try {
    fn();
    console.log(`OK   ${label}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL ${label}: ${err.stack || err}`);
  }
}
async function checkAsync(label, fn) {
  try {
    await fn();
    console.log(`OK   ${label}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL ${label}: ${err.stack || err}`);
  }
}

/* ---------------------------------------------------------------------- *
 * 1. Aller-retour JSON d'un doc cheveux complet + rendu PDF après reprise
 * ---------------------------------------------------------------------- */

const boutique = {
  nom: "Hu'mana", slogan: 'Beauté naturelle', adresse: '12 rue des Lilas, 44000 Nantes',
  telephone: '02 40 00 00 00', email: 'contact@humana-beaute.fr', site: 'www.humana-beaute.fr', instagram: '@humana.beaute',
};
const client = { id: 'cli_test123', prenom: 'Élodie', nom: 'Marchand-Lefèvre', email: 'elodie@example.fr' };
const meta = { date: '2026-10-20', auteur: 'Jessie', lieu: 'boutique' };
const footerMessage = 'Merci de votre confiance, à bientôt pour faire le point sur votre routine.';

const reponses = {
  'qc-problematique': 'Cheveux secs et frisottis en fin de journée.',
  'qc-objectif': 'Boucles définies, moins de frisottis.',
  'qc-cuir-observations': ['Cuir chevelu sec', 'Démangeaisons'],
  'qc-chute': 'non',
};

function routineCheveuxRemplie() {
  return {
    objectifs: ['Hydrater en profondeur', 'Définir les boucles', 'Réduire les frisottis'],
    jourLavage: [
      { produit: { nom: 'Shampoing doux hydratant', ref: 'HM-410', prix: 14.9 }, methode: 'Masser le cuir chevelu, rincer longuement.' },
      { produit: { nom: 'Après-shampoing nourrissant', ref: 'HM-415', prix: 15.5 }, localisation: 'Longueurs et pointes', tempsDePose: '3 minutes' },
      { produit: { nom: 'Crème définition boucles', ref: 'HM-432', prix: 19 }, methode: 'En praying hands, sur cheveux humides.' },
    ],
    entreShampoings: [
      { geste: 'Brumisation à l’eau + crème légère sur les pointes.' },
    ],
    soinsProfonds: {
      hebdo: [{ produit: { nom: 'Masque réparateur', ref: 'HM-450', prix: 24 }, tempsDePose: '15 minutes' }],
      mensuel: [{ produit: { nom: 'Bain d’huile chaud' }, frequence: '1x / mois' }],
      trimestriel: [],
    },
    soinsSpecifiques: [
      { geste: 'Cure de vitamines capillaires', dureeCure: '3 mois' },
    ],
    gestes: [
      { categorie: 'Protection', texte: 'Attacher les cheveux la nuit avec un foulard en soie.' },
      { categorie: 'Chaleur', texte: 'Toujours appliquer un protecteur thermique avant le lisseur.' },
    ],
    tips: [
      'Ne jamais brosser les cheveux secs, démêler au doigt sous la douche.',
      'Changer la taie d’oreiller en soie régulièrement.',
      'Couper les pointes tous les 3 mois pour éviter les fourches.',
    ],
  };
}

function buildChevauxDoc() {
  const blocks = DEFAULT_BLOCKS('cheveux');
  for (const b of blocks) {
    if (b.kind === 'routine') b.data = routineCheveuxRemplie();
    if (b.kind === 'conseils') b.data = { texte: 'Éviter les brushings trop chauds.\nPrivilégier le séchage à l’air libre.' };
  }
  return { type: 'cheveux', theme: 'argile', client, meta, boutique, footerMessage, reponses, blocks };
}

const original = buildChevauxDoc();
let reloaded;

check('aller-retour JSON sans perte (deep-equal)', () => {
  const serialized = JSON.stringify(original);
  reloaded = JSON.parse(serialized);
  assert.deepStrictEqual(reloaded, original, 'le doc rechargé diffère du doc original');
});

check('routine cheveux rechargée garde ses 7 rubriques et leur contenu', () => {
  const routineBlock = reloaded.blocks.find((b) => b.kind === 'routine');
  assert.ok(routineBlock, 'bloc routine manquant après rechargement');
  const r = routineBlock.data;
  assert.equal(r.objectifs.length, 3);
  assert.equal(r.jourLavage.length, 3);
  assert.equal(r.entreShampoings.length, 1);
  assert.equal(r.soinsProfonds.hebdo.length, 1);
  assert.equal(r.soinsProfonds.mensuel.length, 1);
  assert.equal(r.soinsSpecifiques.length, 1);
  assert.equal(r.gestes.length, 2);
  assert.equal(r.tips.length, 3);
  assert.equal(r.jourLavage[0].produit.nom, 'Shampoing doux hydratant');
});

check('réponses au questionnaire rechargées intactes', () => {
  assert.deepStrictEqual(reloaded.reponses, reponses);
});

await checkAsync('renderPdf() fonctionne sur le doc rechargé', async () => {
  const res = await renderPdf(reloaded, { loadAsset });
  const buf = Buffer.from(await res.blob.arrayBuffer());
  assert.ok(buf.length > 0, 'PDF vide');
  assert.ok(res.dataUrl.startsWith('data:application/pdf'), 'dataUrl invalide');
  assert.ok(res.fileName.includes('Cheveux'), 'nom de fichier inattendu');
});

/* ---------------------------------------------------------------------- *
 * 2. Garde de taille clampComposerDoc_ (apps-script/Code.gs), en isolation
 * ---------------------------------------------------------------------- */

function loadClampComposerDoc() {
  const src = fs.readFileSync(path.join(ROOT, 'apps-script/Code.gs'), 'utf8');
  const constMatch = src.match(/const MAX_COMPOSER_DOC_LENGTH = [^\n]+\n/);
  const fnMatch = src.match(/function clampComposerDoc_\([^]*?\n}\n/);
  assert.ok(constMatch, 'MAX_COMPOSER_DOC_LENGTH introuvable dans Code.gs — extraction impossible');
  assert.ok(fnMatch, 'clampComposerDoc_ introuvable dans Code.gs — extraction impossible');
  const sandboxSrc = `${constMatch[0]}\n${fnMatch[0]}\nmodule.exports = { clampComposerDoc_, MAX_COMPOSER_DOC_LENGTH };\n`;
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  new vm.Script(sandboxSrc, { filename: 'Code.gs (extrait isolé)' }).runInContext(sandbox);
  return sandbox.module.exports;
}

const { clampComposerDoc_, MAX_COMPOSER_DOC_LENGTH } = loadClampComposerDoc();

check('clampComposerDoc_ garde un composerDoc sous la limite', () => {
  const small = { type: 'cheveux', reponses: { a: 'b' } };
  assert.deepStrictEqual(clampComposerDoc_(small), small);
});

check('clampComposerDoc_ renvoie null (sans exception) pour un composerDoc énorme', () => {
  const huge = { texte: 'x'.repeat(MAX_COMPOSER_DOC_LENGTH + 10000) };
  assert.equal(JSON.stringify(huge).length > MAX_COMPOSER_DOC_LENGTH, true);
  assert.equal(clampComposerDoc_(huge), null);
});

check('clampComposerDoc_ renvoie null (sans exception) pour un objet non sérialisable', () => {
  const circular = {};
  circular.self = circular; // JSON.stringify lève TypeError normalement
  assert.doesNotThrow(() => clampComposerDoc_(circular));
  assert.equal(clampComposerDoc_(circular), null);
});

check('clampComposerDoc_ renvoie null pour null/undefined (pas d’exception)', () => {
  assert.equal(clampComposerDoc_(null), null);
  assert.equal(clampComposerDoc_(undefined), null);
});

console.log(failures ? `\n${failures} échec(s)` : '\nTout est OK');
process.exit(failures ? 1 : 0);
