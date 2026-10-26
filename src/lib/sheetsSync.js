/**
 * Archivage des PDF + envoi e-mail via Google Apps Script (voir
 * `apps-script/Code.gs`) : chaque PDF part dans un sous-dossier Drive par
 * cliente, indexé dans le classeur partagé, et l'e-mail (sujet/corps déjà
 * composés côté client par `buildEmail()`) part automatiquement — ou reste
 * en attente d'un clic de validation si l'option C est active. Aucune
 * fonction ne lève d'exception : toujours `{ ok:false, error }` en cas
 * d'échec (réseau, token, script indisponible).
 */

// Projet Apps Script LITE autonome (distinct de celui de la boutique), sous essaisautomatisations@gmail.com
// depuis le 27/10/2026 — classeur dédié, plus le classeur partagé avec la boutique (voir Code.gs).
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwBc7gzWLFVBSsbdbxzlitrlz8iRAzXc9PyIo3TRLA3NaebcuJMbgebrPnkpaQxqMIo/exec';
const LITE_TOKEN = 'hl-9mPz4QtXk7Vb';
const isConfigured = () => !SHEETS_API_URL.includes('REMPLACER_APRES_DEPLOIEMENT') && LITE_TOKEN !== 'LITE_TOKEN';
const NOT_CONFIGURED = 'Backend non configuré : renseigner SHEETS_API_URL et LITE_TOKEN dans src/lib/sheetsSync.js après déploiement du script Apps Script.';

async function apiGet(action, params = {}) {
  const p = new URLSearchParams({ token: LITE_TOKEN, action, ...params });
  const res = await fetch(`${SHEETS_API_URL}?${p.toString()}`);
  return res.json();
}

async function apiPost(action, payload) {
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    // text/plain évite le préflight CORS (Apps Script ne gère pas OPTIONS) ;
    // le corps reste du JSON, parsé côté script via e.postData.contents.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: LITE_TOKEN, action, payload }),
  });
  return res.json();
}

const fail = (err) => ({ ok: false, error: String((err && err.message) || err || 'Erreur inconnue') });

/**
 * Test de faisabilité : le backend répond-il avec ce token ?
 * Renvoie { ok, error? }. Un backend encore ancien (sans action `ping`) répond
 * "Action inconnue" : signe qu'il faut redéployer la version lite du script.
 */
export async function pingBackend() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiGet('ping');
    if (res?.ok) return { ok: true };
    return { ok: false, error: res?.error || 'Réponse inattendue du backend' };
  } catch (err) {
    return fail(err);
  }
}

/** Liste des clientes archivées et de leurs documents : { ok, clients, documents }. */
export async function pullArchives() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, clients: [], documents: [] };
  try {
    const res = await apiGet('pull');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', clients: [], documents: [] };
    return {
      ok: true,
      clients: Array.isArray(res.clients) ? res.clients : [],
      documents: Array.isArray(res.documents) ? res.documents : [],
    };
  } catch (err) {
    return { ...fail(err), clients: [], documents: [] };
  }
}

/**
 * Archive un PDF (data-URL base64) dans le dossier Drive de la cliente.
 * `composerDoc` (optionnel, rétrocompatible) : état complet du compositeur
 * (objet `doc` du contrat), stocké côté serveur pour permettre de rouvrir ce
 * document plus tard (Archives → "Reprendre pour modifier"). Garde de taille
 * côté serveur, jamais bloquante pour l'archivage du PDF.
 * -> { ok, clientId, folderUrl, fileUrl, fileId, created } ou { ok:false, error }.
 */
export async function archivePdf({ client, docType, fileName, dataUrl, meta, composerDoc } = {}) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('archivePdf', { client, docType, fileName, dataUrl, meta, composerDoc });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true, clientId: res.clientId, folderUrl: res.folderUrl, fileUrl: res.fileUrl, fileId: res.fileId, created: !!res.created };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Archive le PDF ET envoie l'e-mail (sujet/corps déjà composés côté appli) —
 * pièce jointe = le PDF qui vient d'être archivé, pas de re-téléversement.
 * Si l'option C (validation avant envoi) est active côté Réglages, l'e-mail
 * est mis en attente d'un clic humain : `envoiStatut` vaut alors 'en_attente'
 * au lieu de 'envoye'. La relance à J+14 est programmée côté serveur dès
 * l'envoi réel (immédiat ou validé plus tard), jamais dès l'archivage seul.
 * `composerDoc` (optionnel, rétrocompatible) : voir `archivePdf`.
 * -> { ok, clientId, folderUrl, fileUrl, fileId, created, envoiStatut, pendingId? }
 */
export async function archiveEtEnvoyer({ client, docType, fileName, dataUrl, meta, email, boutique, tutoiement, composerDoc } = {}) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('archiveEtEnvoyer', { client, docType, fileName, dataUrl, meta, email, boutique, tutoiement, composerDoc });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return {
      ok: true, clientId: res.clientId, folderUrl: res.folderUrl, fileUrl: res.fileUrl, fileId: res.fileId,
      created: !!res.created, envoiStatut: res.envoiStatut, pendingId: res.pendingId,
    };
  } catch (err) {
    return fail(err);
  }
}

/** Liste des e-mails archivés mais en attente de validation (option C). -> { ok, envois } */
export async function pullEnvoisEnAttente() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, envois: [] };
  try {
    const res = await apiGet('pullEnvoisEnAttente');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', envois: [] };
    return { ok: true, envois: Array.isArray(res.envois) ? res.envois : [] };
  } catch (err) {
    return { ...fail(err), envois: [] };
  }
}

/** Envoie réellement un e-mail resté en attente (clic de validation). -> { ok } */
export async function validerEnvoi(id) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('validerEnvoi', { id });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Rejette un e-mail en attente sans l'envoyer. -> { ok } */
export async function annulerEnvoi(id) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('annulerEnvoi', { id });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Toutes les relances (historique + à venir, pour la fiche cliente). -> { ok, relances } */
export async function pullRelances() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, relances: [] };
  try {
    const res = await apiGet('pullRelances');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', relances: [] };
    return { ok: true, relances: Array.isArray(res.relances) ? res.relances : [] };
  } catch (err) {
    return { ...fail(err), relances: [] };
  }
}

/** Édite le sujet/corps d'une relance pas encore partie (modifiable jusqu'à J-1). -> { ok } */
export async function modifierRelance(id, { sujet, corps } = {}) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('modifierRelance', { id, sujet, corps });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Réglage global (option C). -> { ok, validationAvantEnvoi } */
export async function getReglagesEnvoi() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiGet('getReglages');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend' };
    return { ok: true, validationAvantEnvoi: !!res.validationAvantEnvoi };
  } catch (err) {
    return fail(err);
  }
}

/** Change le réglage global (option C). -> { ok, validationAvantEnvoi } */
export async function setValidationAvantEnvoi(validationAvantEnvoi) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('definirValidationAvantEnvoi', { validationAvantEnvoi: !!validationAvantEnvoi });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true, validationAvantEnvoi: !!res.validationAvantEnvoi };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Catalogue produits partagé entre les 2 postes (onglet `LiteProduits`, distinct
 * de l'onglet `Produits` de la boutique dans le même classeur). -> { ok, produits }
 */
export async function pullProduits() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, produits: [] };
  try {
    const res = await apiGet('pullProduits');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', produits: [] };
    return { ok: true, produits: Array.isArray(res.produits) ? res.produits : [] };
  } catch (err) {
    return { ...fail(err), produits: [] };
  }
}

/** Remplace l'intégralité du catalogue côté Sheet (dernière écriture gagne). -> { ok } */
export async function pushProduits(produits) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('pushProduits', { produits });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Réglages boutique partagés (onglet `Reglages`, document unique). -> { ok, reglages }
 * `reglages` vaut `null` si jamais écrit côté Sheet.
 */
export async function pullReglages() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, reglages: null };
  try {
    const res = await apiGet('pullReglages');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', reglages: null };
    return { ok: true, reglages: res.reglages || null };
  } catch (err) {
    return { ...fail(err), reglages: null };
  }
}

/** Remplace le document unique de réglages côté Sheet (dernière écriture gagne). -> { ok } */
export async function pushReglages(reglages) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('pushReglages', { reglages });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Formulaire pré-rdv (page publique, sans connexion) : dépose coordonnées + photos
 * directement dans le Drive (dossier de la cliente, créé si besoin).
 * -> { ok, clientId, folderUrl, created, photos } ou { ok:false, error }
 */
export async function soumettreFormulairePreRdv(payload) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('soumettreFormulairePreRdv', payload);
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true, clientId: res.clientId, folderUrl: res.folderUrl, created: res.created, photos: res.photos };
  } catch (err) {
    return fail(err);
  }
}

/** Questions de diagnostic personnalisées -> { ok, questions } (objet { peau, cheveux } ou null) */
export async function pullQuestions() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, questions: null };
  try {
    const res = await apiGet('pullQuestions');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', questions: null };
    return { ok: true, questions: res.questions || null };
  } catch (err) {
    return { ...fail(err), questions: null };
  }
}

/** Remplace en entier les questions de diagnostic personnalisées. -> { ok } */
export async function pushQuestions(questions) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('pushQuestions', { questions });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Bibliothèque de conseils personnalisée -> { ok, conseils } (objet { gestes, tips } ou null) */
export async function pullConseils() {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED, conseils: null };
  try {
    const res = await apiGet('pullConseils');
    if (!res?.ok) return { ok: false, error: res?.error || 'Réponse inattendue du backend', conseils: null };
    return { ok: true, conseils: res.conseils || null };
  } catch (err) {
    return { ...fail(err), conseils: null };
  }
}

/** Remplace en entier la bibliothèque de conseils personnalisée. -> { ok } */
export async function pushConseils(conseils) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('pushConseils', { conseils });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Dossier cliente complet (Lot 5) : remplace en entier un ou plusieurs champs permanents
 * du dossier (allergies, grossesse, traitements, consentement, notesSuivi,
 * syntheseProfessionnelle). payload : { clientId, ...champs }. -> { ok } ou { ok:false, error }
 */
export async function pushFicheClient(payload) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('pushFicheClient', payload);
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Bilan à 6 semaines : ajoute une photo avant/après dans le Drive de la cliente.
 * -> { ok, photo, bilanSixSemaines } ou { ok:false, error }
 */
export async function ajouterPhotoBilan({ clientId, moment, dataUrl, notes }) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('ajouterPhotoBilan', { clientId, moment, dataUrl, notes });
    if (!res?.ok) return { ok: false, error: res?.error || 'Échec inconnu' };
    return { ok: true, photo: res.photo, bilanSixSemaines: res.bilanSixSemaines };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Connexion personnelle (Lot 4) : vérifie identifiant + mot de passe côté serveur
 * (Apps Script), jamais côté client. -> { ok, userId, prenom } ou { ok:false, error }
 */
export async function login(identifiant, motDePasse) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('login', { identifiant, motDePasse });
    if (!res?.ok) return { ok: false, error: res?.error || 'Identifiant ou mot de passe incorrect.' };
    return { ok: true, userId: res.userId, prenom: res.prenom };
  } catch (err) {
    return fail(err);
  }
}
