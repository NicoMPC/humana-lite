#!/usr/bin/env node
/**
 * Test de contrôle (sans réseau) : vérifie que pullProduits/pushProduits/
 * pullReglages/pushReglages (src/lib/sheetsSync.js) appellent la bonne action
 * avec le bon payload, parsent correctement une réponse `{ ok:true, ... }`,
 * et renvoient proprement `{ ok:false, error }` sur une réponse `{ ok:false }`
 * ou une erreur réseau — sans jamais lever d'exception. Même esprit que
 * `scripts/test-planity-import.mjs`, mais ici on mocke `global.fetch` au lieu
 * de lire un vrai fichier : le vrai backend Apps Script n'a pas encore ces
 * actions (voir CLAUDE.md), impossible de taper SHEETS_API_URL en vrai ici.
 *
 * Usage : node scripts/test-produits-sync.mjs
 */

let failures = 0;

function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

/** Installe un mock de fetch qui répond `response` et enregistre l'appel dans `calls`. */
function mockFetchOnce(response, { throwError } = {}) {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    if (throwError) throw throwError;
    return { json: async () => response };
  };
  return calls;
}

/** Reconstruit { action, payload } envoyés en POST (corps text/plain JSON). */
function parsePostBody(call) {
  return JSON.parse(call.options.body);
}

/** Reconstruit { action, ...params } envoyés en GET (query string). */
function parseGetParams(call) {
  const u = new URL(call.url);
  return Object.fromEntries(u.searchParams.entries());
}

const { pullProduits, pushProduits, pullReglages, pushReglages } = await import('../src/lib/sheetsSync.js');

const PRODUIT = { id: 'p_1', nom: 'Crème sauge', prix: '18.00', categorie: 'Crème', actif: true, stock: 4, cible: 'peau', reference: 'PL-0001', ean: '', description: '' };
const REGLAGES = { securite: { code: 'Humanabeta' }, boutique: { nom: "Hu'mana – La Boutique" }, footerMessage: 'Prenez soin de vous.', stock: { dernierImport: null, historique: [] } };

console.log('pullProduits — succès');
{
  const calls = mockFetchOnce({ ok: true, produits: [PRODUIT] });
  const res = await pullProduits();
  assert(parseGetParams(calls[0]).action === 'pullProduits', 'appelle bien l’action pullProduits');
  assert(res.ok === true, 'renvoie ok:true');
  assert(Array.isArray(res.produits) && res.produits.length === 1 && res.produits[0].id === 'p_1', 'parse correctement la liste de produits');
}

console.log('pullProduits — réponse { ok:false }');
{
  mockFetchOnce({ ok: false, error: 'Token invalide' });
  const res = await pullProduits();
  assert(res.ok === false && res.error === 'Token invalide', 'relaie l’erreur du backend sans lever');
  assert(Array.isArray(res.produits) && res.produits.length === 0, 'produits reste un tableau vide en cas d’échec');
}

console.log('pullProduits — erreur réseau');
{
  mockFetchOnce(null, { throwError: new Error('fetch failed') });
  let threw = false;
  let res;
  try { res = await pullProduits(); } catch { threw = true; }
  assert(!threw, 'ne laisse jamais fuiter l’exception réseau');
  assert(res?.ok === false && typeof res.error === 'string', 'renvoie { ok:false, error } sur erreur réseau');
}

console.log('pushProduits — succès');
{
  const calls = mockFetchOnce({ ok: true });
  const res = await pushProduits([PRODUIT]);
  const body = parsePostBody(calls[0]);
  assert(body.action === 'pushProduits', 'appelle bien l’action pushProduits');
  assert(Array.isArray(body.payload.produits) && body.payload.produits[0].id === 'p_1', 'envoie la liste complète des produits en payload');
  assert(res.ok === true, 'renvoie ok:true');
}

console.log('pushProduits — échec backend');
{
  mockFetchOnce({ ok: false, error: 'Liste de produits invalide' });
  const res = await pushProduits([PRODUIT]);
  assert(res.ok === false && res.error === 'Liste de produits invalide', 'relaie l’erreur sans lever');
}

console.log('pullReglages — succès');
{
  const calls = mockFetchOnce({ ok: true, reglages: REGLAGES });
  const res = await pullReglages();
  assert(parseGetParams(calls[0]).action === 'pullReglages', 'appelle bien l’action pullReglages');
  assert(res.ok === true && res.reglages?.boutique?.nom === "Hu'mana – La Boutique", 'parse correctement l’objet réglages');
}

console.log('pullReglages — jamais écrit côté Sheet (reglages:null)');
{
  mockFetchOnce({ ok: true, reglages: null });
  const res = await pullReglages();
  assert(res.ok === true && res.reglages === null, 'renvoie reglages:null sans planter');
}

console.log('pullReglages — erreur réseau');
{
  mockFetchOnce(null, { throwError: new Error('offline') });
  let threw = false;
  let res;
  try { res = await pullReglages(); } catch { threw = true; }
  assert(!threw, 'ne laisse jamais fuiter l’exception réseau');
  assert(res?.ok === false, 'renvoie { ok:false, error } sur erreur réseau');
}

console.log('pushReglages — succès');
{
  const calls = mockFetchOnce({ ok: true });
  const res = await pushReglages(REGLAGES);
  const body = parsePostBody(calls[0]);
  assert(body.action === 'pushReglages', 'appelle bien l’action pushReglages');
  assert(body.payload.reglages?.boutique?.nom === "Hu'mana – La Boutique", 'envoie l’objet réglages complet en payload');
  assert(res.ok === true, 'renvoie ok:true');
}

console.log('pushReglages — échec backend');
{
  mockFetchOnce({ ok: false, error: 'Réglages invalides' });
  const res = await pushReglages(REGLAGES);
  assert(res.ok === false && res.error === 'Réglages invalides', 'relaie l’erreur sans lever');
}

console.log('pushReglages — erreur réseau');
{
  mockFetchOnce(null, { throwError: new Error('timeout') });
  let threw = false;
  let res;
  try { res = await pushReglages(REGLAGES); } catch { threw = true; }
  assert(!threw, 'ne laisse jamais fuiter l’exception réseau');
  assert(res?.ok === false, 'renvoie { ok:false, error } sur erreur réseau');
}

console.log(failures ? `\n${failures} échec(s).` : '\nTout est vert.');
process.exit(failures ? 1 : 0);
