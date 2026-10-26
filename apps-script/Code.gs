/**
 * Hu'mana Lite — backend Google Apps Script lié au classeur.
 *
 * Rôle : archiver les PDF produits par l'appli (fiches conseil) dans Google
 * Drive, un sous-dossier par cliente, tenir un index dans le Sheet, ET —
 * depuis le devis signé du 22/10/2026 — envoyer l'e-mail à la cliente,
 * programmer sa relance à J+14 et tracer chaque envoi dans l'Agenda Google.
 * Option C (déjà acquise par les deux gérantes) : un réglage global peut
 * forcer une validation humaine avant départ réel de chaque e-mail.
 *
 * Projet Apps Script AUTONOME (pas celui de la boutique) : il ouvre le
 * classeur partagé par id (SPREADSHEET_ID) mais n'utilise que ses propres
 * onglets, créés automatiquement s'ils manquent. Il ne lit ni n'écrit jamais
 * Clientes / Diagnostics / Produits / Settings (onglets de la boutique) :
 *   ArchClientes  : id | cle | prenom | nom | email | folderUrl | date_creation | json
 *   ArchDocuments : id | client_id | type | date | auteur | url | nom | json
 *   EnvoisEnAttente : id | client_id | email | prenom | sujet | date_creation | statut | auteur | json
 *     (json ajoute : corps, fileId, fileUrl, fileName, boutiqueNom, tutoiement)
 *   RelanceQueue  : id | client_id | email | prenom | date_envoi_diag | date_relance_prevue | statut | auteur | json
 *     (json ajoute : nom, boutiqueNom, tutoiement, sujet, corps — brouillon généré à la
 *     programmation, éditable jusqu'à J-1 —, modifie:boolean)
 * La colonne "json" fait foi ; les autres colonnes sont là pour un coup d'oeil.
 *
 * Sécurité : toute requête (GET ou POST) doit porter le `token`, comparé à la
 * Script Property TOKEN. POST en text/plain (évite le préflight CORS), corps
 * JSON : { token, action, payload }.
 *
 * Déploiement : Nouveau projet script.google.com (autonome) > coller ce fichier
 * (ou Code.min.js en plusieurs morceaux) > Paramètres du projet > Propriétés du script >
 * TOKEN = <nouveau token, identique à LITE_TOKEN de src/lib/sheetsSync.js> >
 * Déployer > Nouveau déploiement > Application
 * Web > Exécuter en tant que "Moi" > Accès "Tout le monde". Au premier
 * lancement, autoriser les accès Drive, Sheets, Gmail et Agenda.
 * Une fois déployé, exécuter UNE SEULE FOIS `installerDeclencheurs_` depuis
 * l'éditeur (sélectionner la fonction en haut, Exécuter) pour poser le
 * déclencheur quotidien des relances — voir commentaire sur la fonction.
 *
 * Actions : GET  pull -> { ok, clients, documents }
 *           GET  ping -> { ok }
 *           GET  getReglages -> { ok, validationAvantEnvoi }
 *           GET  pullEnvoisEnAttente -> { ok, envois }
 *           GET  pullRelances -> { ok, relances }  (historique + à venir, champ calculé `editable`)
 *           POST archivePdf -> { ok, clientId, folderUrl, fileUrl, fileId, created }
 *           POST archiveEtEnvoyer -> { ok, clientId, folderUrl, fileUrl, fileId, created, envoiStatut }
 *           POST validerEnvoi -> { ok }
 *           POST annulerEnvoi -> { ok }
 *           POST definirValidationAvantEnvoi -> { ok, validationAvantEnvoi }
 *           POST modifierRelance -> { ok } ou { ok:false, error }  (sujet/corps, verrouillé à J-1)
 */

const SPREADSHEET_ID = '1SrQZBSWigFrw3H62_j56iRowGgWXOFfJZGMZG2UO83U';
const SHEETS = {
  clients: 'ArchClientes',
  documents: 'ArchDocuments',
  pending: 'EnvoisEnAttente',
  relances: 'RelanceQueue',
};
const HEADERS = {
  ArchClientes: ['id', 'cle', 'prenom', 'nom', 'email', 'folderUrl', 'date_creation', 'json'],
  ArchDocuments: ['id', 'client_id', 'type', 'date', 'auteur', 'url', 'nom', 'json'],
  EnvoisEnAttente: ['id', 'client_id', 'email', 'prenom', 'sujet', 'date_creation', 'statut', 'auteur', 'json'],
  RelanceQueue: ['id', 'client_id', 'email', 'prenom', 'date_envoi_diag', 'date_relance_prevue', 'statut', 'auteur', 'json'],
};
const ROOT_FOLDER_NAME = "Archives Hu'mana";
const MAX_BASE64_LENGTH = 35 * 1024 * 1024;

// Chiffre figé par le devis signé + les réponses d'onboarding (14 jours,
// confirmé deux fois) : ne jamais le changer sans instruction explicite.
const RELANCE_DELAI_JOURS = 14;

// Option C (« chaque envoi/relance attend votre clic, avec aperçu ») déjà
// acquise par Jessie et Nathalie pour elles-mêmes : activée par défaut tant
// qu'aucun réglage n'a encore été écrit en Propriétés du script.
const VALIDATION_AVANT_ENVOI_DEFAUT = true;

function getToken_() {
  return PropertiesService.getScriptProperties().getProperty('TOKEN');
}

function checkToken_(token) {
  const expected = getToken_();
  if (!expected || token !== expected) throw new Error('Token invalide');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function errMsg_(err) {
  return String((err && err.message) || err).replace(/^Error:\s*/, '');
}

/** Renvoie l'onglet, le crée avec ses en-têtes s'il manque, ajoute les colonnes manquantes. */
function sheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const wanted = HEADERS[name];
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, wanted.length).setValues([wanted]);
    sh.setFrozenRows(1);
    return sh;
  }
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  if (header.every((h) => h === '')) {
    sh.getRange(1, 1, 1, wanted.length).setValues([wanted]);
    return sh;
  }
  wanted.forEach((h) => {
    if (header.indexOf(h) === -1) {
      sh.getRange(1, header.length + 1).setValue(h);
      header.push(h);
    }
  });
  return sh;
}

/** Lit toutes les lignes d'un onglet et renvoie les objets JSON parsés (colonne "json"). */
function readAll_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  const header = values[0] || [];
  const jsonCol = header.indexOf('json');
  const out = [];
  if (jsonCol === -1) return out;
  for (let i = 1; i < values.length; i++) {
    const raw = values[i][jsonCol];
    if (!raw) continue;
    try { out.push(JSON.parse(raw)); } catch (e) { /* ligne corrompue, ignorée */ }
  }
  return out;
}

/** Insère ou met à jour une ligne par id ; colonnes lisibles selon readableCols, json = objet complet. */
function upsert_(name, obj, readableCols) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  const header = values[0] || [];
  const idCol = header.indexOf('id');
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === obj.id) { rowIndex = i + 1; break; }
  }
  const row = header.map((h) => {
    if (h === 'id') return obj.id;
    if (h === 'json') return JSON.stringify(obj);
    return readableCols[h] != null ? readableCols[h] : '';
  });
  if (rowIndex === -1) {
    sh.appendRow(row);
  } else {
    sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  }
}

/** Clé cliente : nom + prénom, minuscules, sans accents, espaces réduits. */
function normalize_(s) {
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function clientKey_(prenom, nom) {
  return normalize_(nom) + '|' + normalize_(prenom);
}

function cleanName_(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

function uid_(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function safeFileName_(s) {
  const n = String(s || '').replace(/[\\/:*?"<>|\r\n]+/g, '_').trim();
  return n || 'document.pdf';
}

function getRootFolder_() {
  const it = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(ROOT_FOLDER_NAME);
}

/** Sous-dossier "Nom Prénom" du dossier racine (réutilisé s'il existe déjà). */
function getClientFolder_(root, label) {
  const it = root.getFoldersByName(label);
  if (it.hasNext()) return it.next();
  return root.createFolder(label);
}

/** yyyy-MM-dd, fuseau du script (évite les décalages UTC sur les comparaisons de dates). */
function dateStr_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function ajourdhui_() {
  return dateStr_(new Date());
}

function ajouterJours_(dateStrDepart, n) {
  const d = new Date(dateStrDepart + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return dateStr_(d);
}

/** payload: { client:{id?,prenom,nom,email?}, docType, fileName, dataUrl, meta:{date,auteur,lieu} } */
function archivePdf_(p) {
  if (!p || typeof p !== 'object') throw new Error('Requête vide');
  const c = p.client || {};
  const prenom = cleanName_(c.prenom);
  const nom = cleanName_(c.nom);
  if (!prenom) throw new Error('Prénom manquant');
  if (!nom) throw new Error('Nom manquant');
  const m = /^data:([^;,]+)?(?:;[^;,]+)*;base64,(.+)$/.exec(String(p.dataUrl || ''));
  if (!m) throw new Error('dataUrl invalide (base64 attendu)');
  if (m[2].length > MAX_BASE64_LENGTH) throw new Error('PDF trop volumineux');
  if (m[1] && m[1].indexOf('pdf') === -1) throw new Error('Le fichier doit être un PDF');
  const meta = p.meta || {};
  const docType = String(p.docType || '').trim() || 'document';
  const fileName = safeFileName_(p.fileName || (docType + '.pdf'));

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const key = clientKey_(prenom, nom);
    const clients = readAll_(SHEETS.clients);
    let client = clients.find((x) => x && x.cle === key);
    let created = false;
    let folder = null;

    if (client && client.folderId) {
      try { folder = DriveApp.getFolderById(client.folderId); if (folder.isTrashed()) folder = null; } catch (e) { folder = null; }
    }
    if (!folder) folder = getClientFolder_(getRootFolder_(), nom + ' ' + prenom);

    if (!client) {
      created = true;
      let id = cleanName_(c.id);
      if (!id || clients.some((x) => x && x.id === id)) id = uid_('cli');
      client = { id, prenom, nom, email: cleanName_(c.email), cle: key, date_creation: new Date().toISOString() };
    } else if (!client.email && c.email) {
      client.email = cleanName_(c.email);
    }
    client.folderId = folder.getId();
    client.folderUrl = folder.getUrl();
    upsert_(SHEETS.clients, client, {
      prenom: client.prenom, nom: client.nom, email: client.email || '',
      date_creation: client.date_creation || '', cle: client.cle, folderUrl: client.folderUrl,
    });

    const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), 'application/pdf', fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    const doc = {
      id: uid_('doc'), client_id: client.id, type: docType, date: String(meta.date || '').slice(0, 10),
      auteur: cleanName_(meta.auteur), lieu: cleanName_(meta.lieu), url: fileUrl, nom: fileName, fileId: file.getId(),
    };
    upsert_(SHEETS.documents, doc, {
      client_id: doc.client_id, type: doc.type, date: doc.date, auteur: doc.auteur, url: doc.url, nom: doc.nom,
    });
    SpreadsheetApp.flush();
    return { client, clientId: client.id, folderUrl: client.folderUrl, fileUrl, fileId: file.getId(), created };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------- *
 * Envoi auto, relance J+14, trace Agenda, validation humaine (option C)
 * ---------------------------------------------------------------------- */

function getValidationAvantEnvoi_() {
  const raw = PropertiesService.getScriptProperties().getProperty('VALIDATION_AVANT_ENVOI');
  if (raw == null) return VALIDATION_AVANT_ENVOI_DEFAUT;
  return raw === 'true';
}

function definirValidationAvantEnvoi_(bool) {
  PropertiesService.getScriptProperties().setProperty('VALIDATION_AVANT_ENVOI', bool ? 'true' : 'false');
  return getValidationAvantEnvoi_();
}

/** Envoie le mail avec le PDF déjà archivé en pièce jointe (pas de re-téléchargement). */
function envoyerMail_(to, sujet, corps, fileId, nomExpediteur) {
  if (!to) throw new Error('E-mail de la cliente manquant');
  const file = DriveApp.getFileById(fileId);
  const options = { name: nomExpediteur || "Hu'mana", attachments: [file.getBlob()] };
  GmailApp.sendEmail(to, sujet, corps, options);
}

/** Trace contractuelle dans l'Agenda Google : nom cliente, date, lien du PDF. */
function creerTraceAgenda_(titre, description) {
  try {
    CalendarApp.getDefaultCalendar().createEvent(titre, new Date(), new Date(Date.now() + 15 * 60 * 1000), { description });
  } catch (e) {
    // La trace agenda est une preuve, pas une condition d'envoi : un échec ici ne doit jamais bloquer l'e-mail déjà parti.
  }
}

// Texte de relance RÉEL rédigé par la cliente (onboarding, clé relance_texte_remarque),
// gardé fidèle au fond ; variante « tu » dérivée à la main (même contenu, pronoms adaptés).
const RELANCE_TEXTE = {
  vous: [
    'Bonjour {prenom},',
    '',
    "Cela fait déjà {delai} jours depuis votre diagnostic Hu'mana et nous voulions prendre de vos nouvelles.",
    '',
    'Comment se passe votre nouvelle routine ?',
    '- Arrivez-vous à la suivre facilement ?',
    '- Comment votre peau / vos cheveux réagissent-ils ?',
    '- Avez-vous déjà remarqué une évolution, même légère ?',
    '- Y a-t-il un produit, une étape ou une fréquence qui vous pose difficulté ?',
    '- Êtes-vous satisfaite et prenez-vous plaisir à utiliser votre routine ?',
    '- Avez-vous des questions ou quelque chose que vous aimeriez ajuster ?',
    '',
    'Vous pouvez simplement nous répondre par SMS. Et si vous préférez en parler de vive voix, nous pouvons aussi vous proposer un petit appel de suivi.',
    '',
    'À très vite,',
    '{signature}',
  ].join('\n'),
  tu: [
    'Bonjour {prenom},',
    '',
    "Cela fait déjà {delai} jours depuis ton diagnostic Hu'mana et on voulait prendre de tes nouvelles.",
    '',
    'Comment se passe ta nouvelle routine ?',
    '- Arrives-tu à la suivre facilement ?',
    '- Comment ta peau / tes cheveux réagissent-ils ?',
    '- As-tu déjà remarqué une évolution, même légère ?',
    '- Y a-t-il un produit, une étape ou une fréquence qui te pose difficulté ?',
    '- Es-tu satisfaite et prends-tu plaisir à utiliser ta routine ?',
    '- As-tu des questions ou quelque chose que tu aimerais ajuster ?',
    '',
    'Tu peux simplement nous répondre par SMS. Et si tu préfères en parler de vive voix, on peut aussi te proposer un petit appel de suivi.',
    '',
    'À très vite,',
    '{signature}',
  ].join('\n'),
};

function texteRelance_(prenom, tutoiement, boutiqueNom) {
  const tpl = tutoiement ? RELANCE_TEXTE.tu : RELANCE_TEXTE.vous;
  const signature = "L'équipe " + (boutiqueNom || "Hu'mana");
  return tpl
    .replace('{prenom}', prenom || '')
    .replace('{delai}', String(RELANCE_DELAI_JOURS))
    .replace('{signature}', signature);
}

function sujetRelance_(boutiqueNom) {
  return 'Des nouvelles de votre routine — ' + (boutiqueNom || "Hu'mana");
}

/**
 * Programme la relance J+14 pour ce client (une ligne par envoi initial/validé).
 * Génère tout de suite le brouillon par défaut (sujet/corps) : c'est ce texte qui
 * part tel quel à J+14, sauf si la praticienne l'édite avant (modifierRelance_, jusqu'à J-1).
 */
function programmerRelance_(client, boutiqueNom, tutoiement, auteur) {
  if (!client.email) return; // pas d'email, pas de relance possible
  const aujourdhui = ajourdhui_();
  const relance = {
    id: uid_('rel'),
    client_id: client.id,
    email: client.email,
    prenom: client.prenom,
    nom: client.nom,
    boutiqueNom: boutiqueNom || "Hu'mana",
    tutoiement: !!tutoiement,
    date_envoi_diag: aujourdhui,
    date_relance_prevue: ajouterJours_(aujourdhui, RELANCE_DELAI_JOURS),
    statut: 'en_attente',
    auteur: cleanName_(auteur),
    sujet: sujetRelance_(boutiqueNom),
    corps: texteRelance_(client.prenom, tutoiement, boutiqueNom),
    modifie: false,
  };
  upsert_(SHEETS.relances, relance, {
    client_id: relance.client_id, email: relance.email, prenom: relance.prenom,
    date_envoi_diag: relance.date_envoi_diag, date_relance_prevue: relance.date_relance_prevue,
    statut: relance.statut, auteur: relance.auteur,
  });
}

/**
 * payload : { client, docType, fileName, dataUrl, meta, email:{to,sujet,corps}, boutique:{nom}, tutoiement }
 * Archive (réutilise archivePdf_) puis, selon le réglage global :
 *  - validation désactivée : envoie tout de suite, trace Agenda, programme la relance J+14 ;
 *  - validation activée (option C) : met l'e-mail en attente, rien n'est envoyé sans clic humain.
 */
function archiveEtEnvoyer_(p) {
  const archive = archivePdf_(p);
  const email = (p && p.email) || {};
  const boutiqueNom = (p && p.boutique && p.boutique.nom) || "Hu'mana";
  const client = archive.client;

  if (getValidationAvantEnvoi_()) {
    const pending = {
      id: uid_('env'),
      client_id: client.id,
      email: email.to || client.email || '',
      prenom: client.prenom,
      sujet: email.sujet || '',
      corps: email.corps || '',
      fileId: archive.fileId,
      fileUrl: archive.fileUrl,
      fileName: p.fileName,
      boutiqueNom,
      tutoiement: !!p.tutoiement,
      auteur: cleanName_((p.meta && p.meta.auteur) || ''),
      date_creation: new Date().toISOString(),
      statut: 'en_attente',
    };
    upsert_(SHEETS.pending, pending, {
      client_id: pending.client_id, email: pending.email, prenom: pending.prenom,
      sujet: pending.sujet, date_creation: pending.date_creation, statut: pending.statut, auteur: pending.auteur,
    });
    SpreadsheetApp.flush();
    return { clientId: archive.clientId, folderUrl: archive.folderUrl, fileUrl: archive.fileUrl, fileId: archive.fileId, created: archive.created, envoiStatut: 'en_attente', pendingId: pending.id };
  }

  envoyerMail_(email.to || client.email, email.sujet, email.corps, archive.fileId, boutiqueNom);
  creerTraceAgenda_("Envoi — " + client.prenom + ' ' + client.nom, 'PDF : ' + archive.fileUrl);
  programmerRelance_(client, boutiqueNom, p.tutoiement, (p.meta && p.meta.auteur) || '');
  SpreadsheetApp.flush();
  return { clientId: archive.clientId, folderUrl: archive.folderUrl, fileUrl: archive.fileUrl, fileId: archive.fileId, created: archive.created, envoiStatut: 'envoye' };
}

/** Envoie réellement un e-mail resté en attente (clic de validation côté appli). */
function validerEnvoi_(id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const pendings = readAll_(SHEETS.pending);
    const pending = pendings.find((x) => x && x.id === id);
    if (!pending) throw new Error('E-mail en attente introuvable');
    if (pending.statut !== 'en_attente') throw new Error('Cet e-mail a déjà été traité');

    envoyerMail_(pending.email, pending.sujet, pending.corps, pending.fileId, pending.boutiqueNom);
    creerTraceAgenda_('Envoi (validé) — ' + pending.prenom, 'PDF : ' + pending.fileUrl);

    pending.statut = 'envoye';
    upsert_(SHEETS.pending, pending, {
      client_id: pending.client_id, email: pending.email, prenom: pending.prenom,
      sujet: pending.sujet, date_creation: pending.date_creation, statut: pending.statut, auteur: pending.auteur || '',
    });

    const clients = readAll_(SHEETS.clients);
    const client = clients.find((x) => x && x.id === pending.client_id) || { id: pending.client_id, prenom: pending.prenom, nom: '', email: pending.email };
    programmerRelance_(client, pending.boutiqueNom, pending.tutoiement, pending.auteur);
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/** Rejette un e-mail en attente sans l'envoyer (la praticienne a changé d'avis). */
function annulerEnvoi_(id) {
  const pendings = readAll_(SHEETS.pending);
  const pending = pendings.find((x) => x && x.id === id);
  if (!pending) throw new Error('E-mail en attente introuvable');
  if (pending.statut !== 'en_attente') throw new Error('Cet e-mail a déjà été traité');
  pending.statut = 'annule';
  upsert_(SHEETS.pending, pending, {
    client_id: pending.client_id, email: pending.email, prenom: pending.prenom,
    sujet: pending.sujet, date_creation: pending.date_creation, statut: pending.statut, auteur: pending.auteur || '',
  });
  SpreadsheetApp.flush();
  return { ok: true };
}

/** Liste des e-mails encore en attente de validation (pour l'écran Réglages). */
function listerEnvoisEnAttente_() {
  return readAll_(SHEETS.pending).filter((x) => x && x.statut === 'en_attente');
}

/**
 * Toutes les relances (historique + à venir, pour la fiche cliente côté appli) —
 * contrairement à listerEnvoisEnAttente_, pas de filtre sur le statut.
 * `editable` : calculé ici, jamais stocké — vrai seulement si la relance n'est
 * pas encore partie ET que la date prévue n'est pas encore atteinte (règle J-1,
 * voir modifierRelance_).
 */
function listerRelances_() {
  const today = ajourdhui_();
  return readAll_(SHEETS.relances).map((r) => Object.assign({}, r, {
    editable: !!r && r.statut === 'en_attente' && today < String((r && r.date_relance_prevue) || ''),
  }));
}

/**
 * Édite le brouillon (sujet/corps) d'une relance pas encore partie, tant qu'on
 * n'est pas encore au jour J de l'envoi prévu (modifiable jusqu'à J-1 inclus).
 */
function modifierRelance_(id, data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!id) throw new Error('Identifiant de relance manquant');
    const relances = readAll_(SHEETS.relances);
    const r = relances.find((x) => x && x.id === id);
    if (!r) throw new Error('Relance introuvable');
    if (r.statut !== 'en_attente') throw new Error('Cette relance a déjà été traitée.');
    if (ajourdhui_() >= String(r.date_relance_prevue || '')) {
      throw new Error('Cette relance part aujourd\'hui, elle n\'est plus modifiable.');
    }
    if (data && data.sujet != null) r.sujet = String(data.sujet);
    if (data && data.corps != null) r.corps = String(data.corps);
    r.modifie = true;
    upsert_(SHEETS.relances, r, {
      client_id: r.client_id, email: r.email, prenom: r.prenom,
      date_envoi_diag: r.date_envoi_diag, date_relance_prevue: r.date_relance_prevue,
      statut: r.statut, auteur: r.auteur || '',
    });
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Déclencheur quotidien (voir installerDeclencheurs_) : envoie chaque relance
 * dont la date prévue est atteinte, trace l'Agenda, puis marque la ligne.
 * Envoie le texte STOCKÉ (sujet/corps écrits à la programmation, potentiellement
 * édités par la praticienne via modifierRelance_) — jamais régénéré ici depuis
 * le template ; le repli ci-dessous ne sert qu'aux lignes créées avant cette
 * version, qui n'ont pas encore de brouillon stocké.
 */
function verifierRelances_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const today = ajourdhui_();
    const relances = readAll_(SHEETS.relances);
    relances.forEach((r) => {
      if (!r || r.statut !== 'en_attente') return;
      if (String(r.date_relance_prevue || '') > today) return;
      try {
        const sujet = r.sujet || sujetRelance_(r.boutiqueNom);
        const corps = r.corps || texteRelance_(r.prenom, r.tutoiement, r.boutiqueNom);
        MailApp.sendEmail(r.email, sujet, corps, { name: r.boutiqueNom || "Hu'mana" });
        creerTraceAgenda_('Relance J+' + RELANCE_DELAI_JOURS + ' — ' + r.prenom, 'Relance automatique envoyée à ' + r.email);
        r.statut = 'envoyee';
      } catch (e) {
        r.erreur = errMsg_(e); // on retente le lendemain, statut reste en_attente
      }
      upsert_(SHEETS.relances, r, {
        client_id: r.client_id, email: r.email, prenom: r.prenom,
        date_envoi_diag: r.date_envoi_diag, date_relance_prevue: r.date_relance_prevue,
        statut: r.statut, auteur: r.auteur || '',
      });
    });
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

/**
 * À exécuter UNE SEULE FOIS manuellement depuis l'éditeur Apps Script après
 * déploiement (sélectionner `installerDeclencheurs_` dans le menu déroulant
 * en haut, puis Exécuter — autorise alors les accès Gmail/Agenda demandés).
 * Un déclencheur posé par du code poussé seul ne s'active pas : il faut ce
 * geste manuel une fois, ensuite tout tourne seul. Ré-exécutable sans risque
 * de doublon (supprime l'ancien déclencheur avant d'en poser un nouveau).
 */
function installerDeclencheurs_() {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === 'verifierRelances_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('verifierRelances_').timeBased().everyDays(1).atHour(9).create();
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    checkToken_(params.token);
    const action = params.action || 'pull';
    if (action === 'ping') return json_({ ok: true, pong: true });
    if (action === 'pull') {
      return json_({ ok: true, clients: readAll_(SHEETS.clients), documents: readAll_(SHEETS.documents) });
    }
    if (action === 'getReglages') {
      return json_({ ok: true, validationAvantEnvoi: getValidationAvantEnvoi_() });
    }
    if (action === 'pullEnvoisEnAttente') {
      return json_({ ok: true, envois: listerEnvoisEnAttente_() });
    }
    if (action === 'pullRelances') {
      return json_({ ok: true, relances: listerRelances_() });
    }
    if (action === 'debugDrive') return json_(Object.assign({ ok: true }, debugDrive_()));
    return json_({ ok: false, error: 'Action inconnue : ' + action });
  } catch (err) {
    return json_({ ok: false, error: errMsg_(err) });
  }
}

function doPost(e) {
  try {
    let body;
    try { body = JSON.parse((e && e.postData && e.postData.contents) || ''); } catch (x) { throw new Error('Corps JSON invalide'); }
    checkToken_(body.token);
    const action = body.action;
    const payload = body.payload;
    switch (action) {
      case 'archivePdf':
        return json_(Object.assign({ ok: true }, archivePdf_(payload)));
      case 'archiveEtEnvoyer':
        return json_(Object.assign({ ok: true }, archiveEtEnvoyer_(payload)));
      case 'validerEnvoi':
        return json_(Object.assign({ ok: true }, validerEnvoi_(payload && payload.id)));
      case 'annulerEnvoi':
        return json_(Object.assign({ ok: true }, annulerEnvoi_(payload && payload.id)));
      case 'definirValidationAvantEnvoi':
        return json_({ ok: true, validationAvantEnvoi: definirValidationAvantEnvoi_(!!(payload && payload.validationAvantEnvoi)) });
      case 'modifierRelance':
        return json_(modifierRelance_(payload && payload.id, payload));
      default:
        return json_({ ok: false, error: 'Action inconnue : ' + action });
    }
  } catch (err) {
    return json_({ ok: false, error: errMsg_(err) });
  }
}

// Diagnostic temporaire (erreur "non autorisé à accéder au document" sur archivePdf/archiveEtEnvoyer,
// alors que ping/pull fonctionnent) — à enlever une fois la cause confirmée.
function debugDrive_() {
  const out = {};
  try { out.activeUser = Session.getActiveUser().getEmail(); } catch (e) { out.activeUserErr = String(e); }
  try { out.effectiveUser = Session.getEffectiveUser().getEmail(); } catch (e) { out.effectiveUserErr = String(e); }
  try {
    const it = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    out.rootFolderFound = it.hasNext();
  } catch (e) { out.getFoldersByNameErr = String(e); }
  try {
    const f = DriveApp.createFolder('ClaudeDebugTest_' + Date.now());
    out.createFolderOk = true;
    out.createdFolderId = f.getId();
    f.setTrashed(true);
  } catch (e) { out.createFolderErr = String(e); }
  return out;
}
