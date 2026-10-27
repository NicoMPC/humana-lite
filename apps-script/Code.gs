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
 * Projet Apps Script AUTONOME (pas celui de la boutique), sous le compte
 * essaisautomatisations@gmail.com depuis le 27/10/2026. Classeur dédié à Lite
 * (SPREADSHEET_ID), plus le classeur partagé avec la boutique — abandonné
 * parce que son propriétaire avait le stockage plein, ce qui bloquait toute
 * écriture (lecture seule possible) malgré un partage en Éditeur. Les noms
 * `LiteProduits`/`Reglages` ont été gardés tels quels par cohérence avec le
 * reste du code, même si ce classeur n'est plus partagé avec la boutique.
 *   ArchClientes  : id | cle | prenom | nom | email | folderUrl | date_creation | json
 *   ArchDocuments : id | client_id | type | date | auteur | url | nom | json
 *   EnvoisEnAttente : id | client_id | email | prenom | sujet | date_creation | statut | auteur | json
 *     (json ajoute : corps, fileId, fileUrl, fileName, boutiqueNom, avisLien, tutoiement)
 *   RelanceQueue  : id | client_id | email | prenom | date_envoi_diag | date_relance_prevue | statut | auteur | json
 *     (json ajoute : nom, boutiqueNom, tutoiement, sujet, corps — brouillon généré à la
 *     programmation, éditable jusqu'à J-1 —, modifie:boolean ; avisLien utilisé seulement pour
 *     générer corps à la création, pas stocké séparément sur la relance)
 *   LiteProduits  : id | nom | reference | prix | categorie | actif | stock | json
 *     (json = objet produit complet : id, nom, prix, categorie, actif, stock, cible,
 *     reference, ean, description — catalogue partagé Jessie/Nathalie)
 *   Reglages      : id | boutique_nom | date_maj | json
 *     (document UNIQUE, id fixe 'reglages' ; json = objet settings complet du store :
 *     securite, boutique, footerMessage, stock — remplacé en entier à chaque push)
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
 *           GET  pullProduits -> { ok, produits }
 *           GET  pullReglages -> { ok, reglages }  (objet, ou null si jamais écrit)
 *           POST archivePdf -> { ok, clientId, folderUrl, fileUrl, fileId, created }
 *           POST archiveEtEnvoyer -> { ok, clientId, folderUrl, fileUrl, fileId, created, envoiStatut }
 *           POST validerEnvoi -> { ok }
 *           POST annulerEnvoi -> { ok }
 *           POST definirValidationAvantEnvoi -> { ok, validationAvantEnvoi }
 *           POST modifierRelance -> { ok } ou { ok:false, error }  (sujet/corps, verrouillé à J-1)
 *           POST pushProduits -> { ok }  (payload { produits:[...] }, remplace tout le catalogue)
 *           POST pushReglages -> { ok }  (payload { reglages:{...} }, document unique)
 *           POST login -> { ok, userId, prenom } ou { ok:false, error }  (payload { identifiant, motDePasse })
 *           POST soumettreFormulairePreRdv -> { ok, clientId, folderUrl, created, photos }
 *             (payload { client:{prenom,nom,telephone,email}, motif, dateSouhaitee, notes, photos:[dataUrl,...] })
 *           POST pushFicheClient -> { ok }  (payload { clientId, allergies?, grossesse?, traitements?,
 *             consentement?, notesSuivi?, syntheseProfessionnelle? } — chaque champ fourni remplace sa valeur)
 *           POST ajouterPhotoBilan -> { ok, photo, bilanSixSemaines }  (payload { clientId, moment:'avant'|'apres', dataUrl, notes? })
 *           GET  pullQuestions -> { ok, questions }  (objet { peau, cheveux }, ou null si jamais personnalisé)
 *           POST pushQuestions -> { ok }  (payload { questions:{...} }, document unique, remplace tout)
 *           GET  pullConseils -> { ok, conseils }  (objet { gestes, tips }, ou null si jamais personnalisé)
 *           POST pushConseils -> { ok }  (payload { conseils:{...} }, document unique, remplace tout)
 *
 * Connexion personnelle (Lot 4) : exécuter UNE FOIS `initialiserMotsDePasseTemp_`
 * depuis l'éditeur pour poser les mots de passe temporaires (voir son commentaire).
 */

// Classeur dédié à Lite (créé le 27/10/2026 sous essaisautomatisations@gmail.com) : plus le
// classeur partagé avec humana-boutique — celui-ci était possédé par un compte dont le stockage
// était plein, ce qui bloquait toute écriture (lecture OK, écriture refusée) malgré un partage en
// Éditeur correct. Ici le classeur est possédé directement par le compte qui exécute le script.
const SPREADSHEET_ID = '1fxbv0dfItF_SDzO26idtSFg2Oec3eMKVbJ2rTrReZ3E';
const SHEETS = {
  clients: 'ArchClientes',
  documents: 'ArchDocuments',
  pending: 'EnvoisEnAttente',
  relances: 'RelanceQueue',
  // Noms distincts des onglets `Produits`/`Settings` de la boutique — gardés même si ce classeur
  // n'est plus partagé avec elle, pour rester cohérent avec le reste du code et la doc.
  produits: 'LiteProduits',
  reglages: 'Reglages',
  questions: 'LiteQuestions',
  conseils: 'LiteConseils',
};
const HEADERS = {
  ArchClientes: ['id', 'cle', 'prenom', 'nom', 'email', 'folderUrl', 'date_creation', 'json'],
  ArchDocuments: ['id', 'client_id', 'type', 'date', 'auteur', 'url', 'nom', 'json'],
  EnvoisEnAttente: ['id', 'client_id', 'email', 'prenom', 'sujet', 'date_creation', 'statut', 'auteur', 'json'],
  RelanceQueue: ['id', 'client_id', 'email', 'prenom', 'date_envoi_diag', 'date_relance_prevue', 'statut', 'auteur', 'json'],
  LiteProduits: ['id', 'nom', 'reference', 'prix', 'categorie', 'actif', 'stock', 'json'],
  Reglages: ['id', 'boutique_nom', 'date_maj', 'json'],
  LiteQuestions: ['id', 'date_maj', 'json'],
  LiteConseils: ['id', 'date_maj', 'json'],
  Remarques: ['id', 'date', 'auteur', 'ecran', 'chemin', 'texte', 'json'],
};

// Id fixe de l'unique ligne de réglages (pas une liste, un seul document partagé).
const REGLAGES_ID = 'reglages';
// Même principe pour les questions de diagnostic et la bibliothèque de conseils
// (Lot « éditeur de questions/conseils ») : un seul document partagé par les 2 postes,
// remplacé en entier à chaque sauvegarde (cohérent avec pushProduits/pushReglages).
const QUESTIONS_ID = 'questions';
const CONSEILS_ID = 'conseils';
const ROOT_FOLDER_NAME = "Archives Hu'mana";
const MAX_BASE64_LENGTH = 35 * 1024 * 1024;

// Limite non bloquante pour le champ `composerDoc` (état complet du compositeur,
// stocké tel quel dans la colonne "json" de ArchDocuments pour permettre de
// rouvrir un document archivé) : une cellule Google Sheets plafonne vers 50 000
// caractères, on se garde une marge. Si `composerDoc` dépasse, on l'omet
// silencieusement (null) — l'archivage du PDF ne doit JAMAIS échouer pour ça.
const MAX_COMPOSER_DOC_LENGTH = 40000;

/** Renvoie `obj` tel quel si sa sérialisation JSON passe sous la limite, sinon null. */
function clampComposerDoc_(obj) {
  if (obj == null) return null;
  try {
    const s = JSON.stringify(obj);
    if (s && s.length <= MAX_COMPOSER_DOC_LENGTH) return obj;
  } catch (e) {
    // sérialisation impossible (référence circulaire, etc.) : on n'échoue jamais pour ça.
  }
  return null;
}

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

/**
 * Connexion personnelle (Lot 4) : chaque gérante a son identifiant + mot de passe,
 * vérifiés ici, jamais côté client (le bundle public ne doit plus contenir aucun
 * secret). Mots de passe stockés hashés (SHA-256) dans les Script Properties,
 * clé `AUTH_<identifiant>`. HYPOTHÈSE À REMPLACER : les mots de passe posés par
 * `initialiserMotsDePasseTemp_` sont temporaires, à communiquer une fois à Jessie
 * et Nathalie puis à faire remplacer (pas d'UI de changement de mot de passe pour
 * l'instant, non promise par le devis — à construire si elles le demandent).
 */
const UTILISATRICES = [
  { identifiant: 'jessie', userId: 'u-jessie', prenom: 'Jessie' },
  { identifiant: 'nathalie', userId: 'u-nathalie', prenom: 'Nathalie' },
];
// Mots de passe temporaires HYPOTHÉTIQUES, posés une seule fois par
// initialiserMotsDePasseTemp_ (jamais écrasés si déjà configurés) — à remplacer.
const MOTS_DE_PASSE_TEMP_HYPOTHESE = { jessie: 'Jessie-Humana-2026', nathalie: 'Nathalie-Humana-2026' };

function hashMotDePasse_(motDePasse) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(motDePasse || ''), Utilities.Charset.UTF_8);
  return digest.map((b) => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

/** Pose les mots de passe temporaires HYPOTHÈSE s'ils n'existent pas encore. Ne touche
 * jamais un mot de passe déjà configuré (changé depuis) — idempotent et sûr à
 * relancer par erreur. Appelée via le raccourci visible `initialiserMotsDePasse`
 * ci-dessous (même piège que debugDrive_/autoriserAccesTemp : Apps Script masque
 * du menu Exécuter toute fonction qui se termine par « _ »).
 */
function initialiserMotsDePasseTemp_() {
  const props = PropertiesService.getScriptProperties();
  const resultat = {};
  UTILISATRICES.forEach((u) => {
    const cle = 'AUTH_' + u.identifiant;
    if (props.getProperty(cle)) { resultat[u.identifiant] = 'déjà configuré, inchangé'; return; }
    const motDePasse = MOTS_DE_PASSE_TEMP_HYPOTHESE[u.identifiant];
    props.setProperty(cle, hashMotDePasse_(motDePasse));
    resultat[u.identifiant] = motDePasse; // en clair UNE fois, pour transmission à l'utilisatrice
  });
  return resultat;
}

/** Raccourci visible dans le menu « Exécuter » — sélectionner CETTE fonction (pas
 * `initialiserMotsDePasseTemp_`, cachée). À exécuter UNE SEULE FOIS. */
function initialiserMotsDePasse() {
  return initialiserMotsDePasseTemp_();
}

function login_(identifiant, motDePasse) {
  const id = String(identifiant || '').trim().toLowerCase();
  const u = UTILISATRICES.find((x) => x.identifiant === id);
  if (!u) throw new Error('Identifiant ou mot de passe incorrect.');
  const hashAttendu = PropertiesService.getScriptProperties().getProperty('AUTH_' + id);
  if (!hashAttendu || hashAttendu !== hashMotDePasse_(motDePasse)) {
    throw new Error('Identifiant ou mot de passe incorrect.');
  }
  return { userId: u.userId, prenom: u.prenom };
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

/**
 * Bouton flottant « Une remarque » : simple journal, pas de notion de cliente —
 * un texte libre + le contexte figé au moment du clic (écran, autrice, date).
 * Jamais mis à jour une fois écrit, juste accumulé pour relecture (par Nicolas
 * pendant le chantier, puis par Claude en début de session une fois en prod).
 */
function envoyerRemarque_(p) {
  const texte = cleanName_(p && p.texte);
  if (!texte) throw new Error('Remarque vide.');
  const obj = {
    id: uid_('rq'),
    date: (p && p.date) || new Date().toISOString(),
    auteur: (p && p.auteur) || '',
    ecran: (p && p.ecran) || '',
    chemin: (p && p.chemin) || '',
    texte,
  };
  sheet_('Remarques').appendRow([obj.id, obj.date, obj.auteur, obj.ecran, obj.chemin, obj.texte, JSON.stringify(obj)]);
  return { ok: true };
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
    // État complet du compositeur, pour pouvoir rouvrir ce document plus tard (Archives →
    // "Reprendre pour modifier"). `upsert_` sérialise tout `doc` dans la colonne "json" — pas
    // besoin de toucher HEADERS ni doGet/doPost, `readAll_`/pull le renvoient déjà tel quel.
    // Garde de taille non bloquante : voir clampComposerDoc_.
    doc.composerDoc = clampComposerDoc_(p.composerDoc || null);
    upsert_(SHEETS.documents, doc, {
      client_id: doc.client_id, type: doc.type, date: doc.date, auteur: doc.auteur, url: doc.url, nom: doc.nom,
    });
    incrementerStatsDiagnostic_(docType);
    SpreadsheetApp.flush();
    return { client, clientId: client.id, folderUrl: client.folderUrl, fileUrl, fileId: file.getId(), created };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Compteur interne (pas pour Nathalie/Jessie, pour nous) du nombre de diagnostics
 * réellement générés — un par appel de archivePdf_ réussi (envoi auto, validation
 * manuelle ou simple archivage prennent tous ce chemin). Stocké dans les
 * Script Properties (pas le Sheet Reglages : celui-ci est remplacé en entier à
 * chaque push front-end, un compteur y serait écrasé). Demandé par Nicolas le 27/10.
 */
function incrementerStatsDiagnostic_(docType) {
  const props = PropertiesService.getScriptProperties();
  const cle = 'STATS_DIAG_' + (docType === 'peau' || docType === 'cheveux' ? docType.toUpperCase() : 'AUTRE');
  props.setProperty(cle, String((parseInt(props.getProperty(cle), 10) || 0) + 1));
  props.setProperty('STATS_DIAG_TOTAL', String((parseInt(props.getProperty('STATS_DIAG_TOTAL'), 10) || 0) + 1));
  if (!props.getProperty('STATS_DIAG_DEPUIS')) props.setProperty('STATS_DIAG_DEPUIS', new Date().toISOString());
}

/** Lecture des compteurs ci-dessus — exposé en API (action statsDiagnostics) ET utilisable à la main. */
function statsDiagnostics_() {
  const props = PropertiesService.getScriptProperties();
  return {
    total: parseInt(props.getProperty('STATS_DIAG_TOTAL'), 10) || 0,
    peau: parseInt(props.getProperty('STATS_DIAG_PEAU'), 10) || 0,
    cheveux: parseInt(props.getProperty('STATS_DIAG_CHEVEUX'), 10) || 0,
    autre: parseInt(props.getProperty('STATS_DIAG_AUTRE'), 10) || 0,
    depuis: props.getProperty('STATS_DIAG_DEPUIS') || null,
  };
}

/** Wrapper SANS underscore : visible dans le menu Exécuter de l'éditeur Apps Script, pour un coup d'oeil rapide sans curl. */
function voirStatsDiagnostics() {
  Logger.log(JSON.stringify(statsDiagnostics_(), null, 2));
}

const MAX_PHOTOS_PRE_RDV = 6;

/**
 * Formulaire pré-rdv (devis : « Un formulaire part vers la cliente avant le
 * rendez-vous : coordonnées et photos, déposées directement dans votre Drive »).
 * Page PUBLIQUE côté appli (pas de connexion) : la cliente remplit elle-même,
 * donc validation stricte ici — aucune confiance dans ce qui arrive.
 *
 * HYPOTHÈSE DE CHAMPS À VALIDER AVEC NATHALIE (le devis ne détaille pas la
 * liste exacte) : prénom/nom/téléphone/email, motif (cheveux|peau|les-deux),
 * date souhaitée, note libre, jusqu'à 6 photos. Si Nathalie veut d'autres
 * champs, les ajouter ici ET dans src/pages/FormulairePreRdvPage.jsx.
 *
 * payload : { client:{prenom,nom,telephone,email}, motif, dateSouhaitee, notes, photos:[dataUrl,...] }
 */
function soumettreFormulairePreRdv_(p) {
  if (!p || typeof p !== 'object') throw new Error('Requête vide');
  const c = p.client || {};
  const prenom = cleanName_(c.prenom);
  const nom = cleanName_(c.nom);
  if (!prenom) throw new Error('Prénom manquant');
  if (!nom) throw new Error('Nom manquant');
  const telephone = cleanName_(c.telephone);
  const email = cleanName_(c.email);
  if (!telephone && !email) throw new Error('Un téléphone ou un email est nécessaire pour vous recontacter.');

  const photosIn = Array.isArray(p.photos) ? p.photos.slice(0, MAX_PHOTOS_PRE_RDV) : [];
  const photoBlobs = photosIn.map((dataUrl, i) => {
    const m = /^data:([^;,]+)?(?:;[^;,]+)*;base64,(.+)$/.exec(String(dataUrl || ''));
    if (!m) throw new Error('Photo ' + (i + 1) + ' invalide.');
    if (m[2].length > MAX_BASE64_LENGTH) throw new Error('Photo ' + (i + 1) + ' trop volumineuse.');
    const type = (m[1] && m[1].indexOf('image/') === 0) ? m[1] : 'image/jpeg';
    return Utilities.newBlob(Utilities.base64Decode(m[2]), type, 'photo-pre-rdv-' + (i + 1) + '.jpg');
  });

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
      client = { id: uid_('cli'), prenom, nom, email, cle: key, date_creation: new Date().toISOString() };
    } else if (!client.email && email) {
      client.email = email;
    }
    client.folderId = folder.getId();
    client.folderUrl = folder.getUrl();
    upsert_(SHEETS.clients, client, {
      prenom: client.prenom, nom: client.nom, email: client.email || '',
      date_creation: client.date_creation || '', cle: client.cle, folderUrl: client.folderUrl,
    });

    const photoUrls = photoBlobs.map((blob) => {
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return { url: file.getUrl(), fileId: file.getId() };
    });

    const doc = {
      id: uid_('doc'), client_id: client.id, type: 'formulaire-pre-rdv',
      date: dateStr_(new Date()), auteur: 'Cliente (formulaire)', lieu: '',
      url: photoUrls[0]?.url || client.folderUrl, nom: 'Formulaire pré-rdv', fileId: photoUrls[0]?.fileId || '',
    };
    doc.composerDoc = clampComposerDoc_({
      telephone, email, motif: cleanName_(p.motif), dateSouhaitee: cleanName_(p.dateSouhaitee),
      notes: cleanName_(p.notes), photos: photoUrls,
    });
    upsert_(SHEETS.documents, doc, {
      client_id: doc.client_id, type: doc.type, date: doc.date, auteur: doc.auteur, url: doc.url, nom: doc.nom,
    });
    SpreadsheetApp.flush();
    return { clientId: client.id, folderUrl: client.folderUrl, created, photos: photoUrls.length };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------- *
 * Dossier cliente complet (Lot 5 — Option B) : champs permanents du dossier,
 * distincts des réponses de diagnostic (ArchClientes.json fait foi, comme pour
 * folderId/folderUrl déjà stockés là — pas de nouvel onglet nécessaire).
 * ---------------------------------------------------------------------- */

const CHAMPS_FICHE_CLIENT = ['allergies', 'grossesse', 'traitements', 'consentement', 'notesSuivi', 'syntheseProfessionnelle'];

/**
 * payload : { clientId, allergies?, grossesse?, traitements?, consentement?:{ok,date},
 *             notesSuivi?:[{id,date,texte,auteur}], syntheseProfessionnelle?:{besoins,routinesProposees,routineChoisie} }
 * Chaque champ fourni REMPLACE sa valeur précédente en entier (le client renvoie l'état
 * complet du champ, comme pour pushProduits/pushReglages) ; les champs absents du payload
 * ne sont pas touchés.
 */
function pushFicheClient_(p) {
  if (!p || !p.clientId) throw new Error('clientId manquant');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const clients = readAll_(SHEETS.clients);
    const client = clients.find((x) => x && x.id === p.clientId);
    if (!client) throw new Error('Cliente introuvable');
    CHAMPS_FICHE_CLIENT.forEach((k) => { if (p[k] !== undefined) client[k] = p[k]; });
    upsert_(SHEETS.clients, client, {
      prenom: client.prenom, nom: client.nom, email: client.email || '',
      date_creation: client.date_creation || '', cle: client.cle, folderUrl: client.folderUrl,
    });
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Bilan à 6 semaines (promesse du Lot 5) : ajoute UNE photo avant/après dans le dossier
 * Drive de la cliente et l'indexe dans client.bilanSixSemaines. payload : { clientId,
 * moment:'avant'|'apres', dataUrl, notes? }. -> { ok, photo, bilanSixSemaines }
 */
function ajouterPhotoBilan_(p) {
  if (!p || !p.clientId) throw new Error('clientId manquant');
  const moment = p.moment === 'apres' ? 'apres' : 'avant';
  const m = /^data:([^;,]+)?(?:;[^;,]+)*;base64,(.+)$/.exec(String(p.dataUrl || ''));
  if (!m) throw new Error('Photo invalide (base64 attendu).');
  if (m[2].length > MAX_BASE64_LENGTH) throw new Error('Photo trop volumineuse.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const clients = readAll_(SHEETS.clients);
    const client = clients.find((x) => x && x.id === p.clientId);
    if (!client) throw new Error('Cliente introuvable.');
    let folder;
    try { folder = DriveApp.getFolderById(client.folderId); } catch (e) { throw new Error('Dossier Drive introuvable pour cette cliente.'); }

    const type = (m[1] && m[1].indexOf('image/') === 0) ? m[1] : 'image/jpeg';
    const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), type, 'bilan-6-semaines-' + moment + '-' + Date.now() + '.jpg');
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const photo = { url: file.getUrl(), fileId: file.getId(), date: dateStr_(new Date()) };

    const bilan = client.bilanSixSemaines || { photosAvant: [], photosApres: [], notes: '' };
    if (moment === 'avant') bilan.photosAvant = (bilan.photosAvant || []).concat([photo]);
    else bilan.photosApres = (bilan.photosApres || []).concat([photo]);
    if (p.notes !== undefined) bilan.notes = cleanName_(p.notes);
    client.bilanSixSemaines = bilan;

    upsert_(SHEETS.clients, client, {
      prenom: client.prenom, nom: client.nom, email: client.email || '',
      date_creation: client.date_creation || '', cle: client.cle, folderUrl: client.folderUrl,
    });
    SpreadsheetApp.flush();
    return { photo, bilanSixSemaines: bilan };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------- *
 * Catalogue produits + réglages boutique, partagés entre les 2 postes
 * ---------------------------------------------------------------------- */

/**
 * Remplace l'intégralité du catalogue côté Sheet (le client renvoie toujours
 * l'état complet après chaque mutation locale — cohérent avec le faible
 * volume, 2 utilisatrices, dernière écriture gagne). On vide d'abord les
 * lignes existantes puis on réécrit via upsert_ comme les autres onglets.
 */
function pushProduits_(produits) {
  if (!Array.isArray(produits)) throw new Error('Liste de produits invalide');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_(SHEETS.produits);
    const lastRow = sh.getLastRow();
    if (lastRow > 1) sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).clearContent();
    produits.forEach((p) => {
      if (!p || !p.id) return;
      upsert_(SHEETS.produits, p, {
        nom: p.nom || '', reference: p.reference || '', prix: p.prix || '',
        categorie: p.categorie || '', actif: p.actif !== false, stock: p.stock || 0,
      });
    });
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/** Document unique (id fixe REGLAGES_ID) ; renvoie l'objet directement, ou null si jamais écrit. */
function pullReglages_() {
  const all = readAll_(SHEETS.reglages);
  return all.find((r) => r && r.id === REGLAGES_ID) || null;
}

/** Écrit (upsert_) le document unique de réglages, toujours sur le même id fixe. */
function pushReglages_(reglages) {
  if (!reglages || typeof reglages !== 'object') throw new Error('Réglages invalides');
  const obj = Object.assign({}, reglages, { id: REGLAGES_ID });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    upsert_(SHEETS.reglages, obj, {
      boutique_nom: (obj.boutique && obj.boutique.nom) || '',
      date_maj: new Date().toISOString(),
    });
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------- *
 * Questions de diagnostic + bibliothèque de conseils, éditables par Jessie et
 * Nathalie (devis : « vous ajoutez, modifiez et réordonnez vos questions et
 * votre bibliothèque de conseils vous-même, à tout moment »). Même principe
 * que les réglages : document unique, remplacé en entier à chaque sauvegarde.
 * ---------------------------------------------------------------------- */

/** { peau: [...], cheveux: [...] } ou null si jamais personnalisé (l'appli garde alors ses valeurs par défaut). */
function pullQuestions_() {
  const all = readAll_(SHEETS.questions);
  return all.find((r) => r && r.id === QUESTIONS_ID) || null;
}

function pushQuestions_(questions) {
  if (!questions || typeof questions !== 'object') throw new Error('Questions invalides');
  const obj = Object.assign({}, questions, { id: QUESTIONS_ID });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    upsert_(SHEETS.questions, obj, { date_maj: new Date().toISOString() });
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/** { gestes: [{categorie, items:[...]}], tips: [...] } ou null si jamais personnalisé. */
function pullConseils_() {
  const all = readAll_(SHEETS.conseils);
  return all.find((r) => r && r.id === CONSEILS_ID) || null;
}

function pushConseils_(conseils) {
  if (!conseils || typeof conseils !== 'object') throw new Error('Conseils invalides');
  const obj = Object.assign({}, conseils, { id: CONSEILS_ID });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    upsert_(SHEETS.conseils, obj, { date_maj: new Date().toISOString() });
    SpreadsheetApp.flush();
    return { ok: true };
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

// Demande d'avis Google ajoutée à la relance (surprise du 27/10/2026, pas encore
// validée par Nathalie) : n'apparaît que si un lien d'avis est renseigné dans les
// Réglages (settings.boutique.avisLien) — vide par défaut, donc dormant jusqu'à
// ce qu'elle fournisse le vrai lien et valide ce texte.
const DEMANDE_AVIS_TEXTE = {
  vous: 'Si vous êtes satisfaite, un petit avis sur Google nous aiderait énormément à nous faire connaître : {avisLien}',
  tu: 'Si tu es contente, un petit avis Google nous aiderait énormément à nous faire connaître : {avisLien}',
};

function texteRelance_(prenom, tutoiement, boutiqueNom, avisLien) {
  const tpl = tutoiement ? RELANCE_TEXTE.tu : RELANCE_TEXTE.vous;
  const signature = "L'équipe " + (boutiqueNom || "Hu'mana");
  let texte = tpl
    .replace('{prenom}', prenom || '')
    .replace('{delai}', String(RELANCE_DELAI_JOURS))
    .replace('{signature}', signature);
  if (avisLien) {
    const demandeAvis = (tutoiement ? DEMANDE_AVIS_TEXTE.tu : DEMANDE_AVIS_TEXTE.vous).replace('{avisLien}', avisLien);
    texte = texte.replace('\nÀ très vite,', '\n' + demandeAvis + '\n\nÀ très vite,');
  }
  return texte;
}

function sujetRelance_(boutiqueNom) {
  return 'Des nouvelles de votre routine — ' + (boutiqueNom || "Hu'mana");
}

/**
 * Programme la relance J+14 pour ce client (une ligne par envoi initial/validé).
 * Génère tout de suite le brouillon par défaut (sujet/corps) : c'est ce texte qui
 * part tel quel à J+14, sauf si la praticienne l'édite avant (modifierRelance_, jusqu'à J-1).
 */
function programmerRelance_(client, boutiqueNom, tutoiement, auteur, avisLien) {
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
    corps: texteRelance_(client.prenom, tutoiement, boutiqueNom, avisLien),
    modifie: false,
  };
  upsert_(SHEETS.relances, relance, {
    client_id: relance.client_id, email: relance.email, prenom: relance.prenom,
    date_envoi_diag: relance.date_envoi_diag, date_relance_prevue: relance.date_relance_prevue,
    statut: relance.statut, auteur: relance.auteur,
  });
}

/**
 * payload : { client, docType, fileName, dataUrl, meta, email:{to,sujet,corps}, boutique:{nom,avisLien}, tutoiement }
 * Archive (réutilise archivePdf_) puis, selon le réglage global :
 *  - validation désactivée : envoie tout de suite, trace Agenda, programme la relance J+14 ;
 *  - validation activée (option C) : met l'e-mail en attente, rien n'est envoyé sans clic humain.
 */
function archiveEtEnvoyer_(p) {
  const archive = archivePdf_(p);
  const email = (p && p.email) || {};
  const boutiqueNom = (p && p.boutique && p.boutique.nom) || "Hu'mana";
  const avisLien = (p && p.boutique && p.boutique.avisLien) || '';
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
      avisLien,
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
  programmerRelance_(client, boutiqueNom, p.tutoiement, (p.meta && p.meta.auteur) || '', avisLien);
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
    programmerRelance_(client, pending.boutiqueNom, pending.tutoiement, pending.auteur, pending.avisLien);
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
    if (action === 'pullProduits') {
      return json_({ ok: true, produits: readAll_(SHEETS.produits) });
    }
    if (action === 'pullReglages') {
      return json_({ ok: true, reglages: pullReglages_() });
    }
    if (action === 'pullQuestions') {
      return json_({ ok: true, questions: pullQuestions_() });
    }
    if (action === 'pullConseils') {
      return json_({ ok: true, conseils: pullConseils_() });
    }
    if (action === 'pullRemarques') {
      return json_({ ok: true, remarques: readAll_('Remarques') });
    }
    if (action === 'statsDiagnostics') {
      return json_({ ok: true, stats: statsDiagnostics_() });
    }
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
      case 'login':
        return json_(Object.assign({ ok: true }, login_(payload && payload.identifiant, payload && payload.motDePasse)));
      case 'soumettreFormulairePreRdv':
        return json_(Object.assign({ ok: true }, soumettreFormulairePreRdv_(payload)));
      case 'pushFicheClient':
        return json_(pushFicheClient_(payload));
      case 'ajouterPhotoBilan':
        return json_(Object.assign({ ok: true }, ajouterPhotoBilan_(payload)));
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
      case 'pushProduits':
        return json_(Object.assign({ ok: true }, pushProduits_(payload && payload.produits)));
      case 'pushReglages':
        return json_(Object.assign({ ok: true }, pushReglages_(payload && payload.reglages)));
      case 'pushQuestions':
        return json_(Object.assign({ ok: true }, pushQuestions_(payload && payload.questions)));
      case 'pushConseils':
        return json_(Object.assign({ ok: true }, pushConseils_(payload && payload.conseils)));
      case 'envoyerRemarque':
        return json_(envoyerRemarque_(payload));
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
  try {
    const sh = sheet_(SHEETS.produits);
    out.sheetProduitsOk = !!sh;
  } catch (e) { out.sheetProduitsErr = String(e); }
  return out;
}

/**
 * Raccourci visible dans le menu « Exécuter » de l'éditeur (Apps Script masque
 * les fonctions se terminant par « _ », donc debugDrive_ n'y apparaît pas).
 * Exécuter CETTE fonction une fois depuis l'éditeur force Google à (re)demander
 * les autorisations nécessaires aux nouvelles API utilisées (Session.getEffectiveUser,
 * création de nouveaux onglets Sheet) — un redéploiement seul ne redemande jamais
 * ces autorisations, seule une exécution manuelle le fait.
 */
function autoriserAccesTemp() {
  return debugDrive_();
}
