/**
 * Archivage des PDF + envoi e-mail via Google Apps Script (voir
 * `apps-script/Code.gs`) : chaque PDF part dans un sous-dossier Drive par
 * cliente, indexé dans le classeur partagé, et l'e-mail (sujet/corps déjà
 * composés côté client par `buildEmail()`) part automatiquement — ou reste
 * en attente d'un clic de validation si l'option C est active. Aucune
 * fonction ne lève d'exception : toujours `{ ok:false, error }` en cas
 * d'échec (réseau, token, script indisponible).
 */

// Projet Apps Script LITE autonome (distinct de celui de la boutique) : à renseigner après déploiement.
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzCZpsRPNLikVXm1qhyfs8nIsOcM_zmNwXafr0CUrvTaScQJRFsrH2Q6x85BC8LzWNpHg/exec';
const LITE_TOKEN = 'hl-7Kq2Xw9Rm4Tz';
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
 * -> { ok, clientId, folderUrl, fileUrl, fileId, created } ou { ok:false, error }.
 */
export async function archivePdf({ client, docType, fileName, dataUrl, meta } = {}) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('archivePdf', { client, docType, fileName, dataUrl, meta });
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
 * -> { ok, clientId, folderUrl, fileUrl, fileId, created, envoiStatut, pendingId? }
 */
export async function archiveEtEnvoyer({ client, docType, fileName, dataUrl, meta, email, boutique, tutoiement } = {}) {
  if (!isConfigured()) return { ok: false, error: NOT_CONFIGURED };
  try {
    const res = await apiPost('archiveEtEnvoyer', { client, docType, fileName, dataUrl, meta, email, boutique, tutoiement });
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
