/**
 * Préparation de l'email : sujet + corps en texte brut.
 * Deux usages : (1) `autoAttache=true` — le texte est envoyé tel quel au
 * backend (`archiveEtEnvoyer`), qui joint lui-même le PDF déjà archivé ;
 * (2) `autoAttache=false` (répli manuel, si l'envoi auto échoue) — ouverture
 * de Gmail (onglet pré-rempli), la pièce jointe ne pouvant pas être
 * pré-remplie par URL : la praticienne la glisse depuis le dossier archivé
 * (ou le dossier Téléchargements si l'archivage a aussi échoué).
 */

const SUJETS = {
  peau: 'Votre routine visage personnalisée',
  cheveux: 'Votre routine capillaire personnalisée',
  lifestyle: 'Vos conseils lifestyle',
};
const OBJETS = {
  vous: { peau: 'votre routine visage personnalisée', cheveux: 'votre routine capillaire personnalisée', lifestyle: 'vos conseils bien-être' },
  tu: { peau: 'ta routine visage personnalisée', cheveux: 'ta routine capillaire personnalisée', lifestyle: 'tes conseils bien-être' },
};

// Les 2 lignes vraiment « génériques » de l'e-mail (le reste — salutation, pièce
// jointe, signature — est mécanique, pas la voix de Nathalie/Jessie). Éditables
// dans Réglages → Templates d'e-mail (settings.templates), avec repli sur ces
// valeurs par défaut tant qu'elles n'ont rien personnalisé. Placeholders
// disponibles : {contexte}, {objet}, {boutique}.
export const DEFAULT_TEMPLATES = {
  vous: 'Merci pour {contexte}. Vous trouverez ci-joint {objet}.\nN’hésitez pas à me poser vos questions.',
  tu: 'Merci pour {contexte}. Tu trouveras ci-joint {objet}.\nN’hésite pas à me poser tes questions.',
};

/**
 * @param {object} p
 * @param {object} p.doc       document (contrat)
 * @param {string} [p.fileUrl] lien Drive du PDF archivé
 * @param {string} [p.folderUrl] lien du dossier de la cliente
 * @param {string} [p.fileName] nom du PDF à joindre
 * @param {boolean} [p.tutoiement=false] « tu » au lieu de « vous »
 * @param {boolean} [p.archiveOk=true] false si l'archivage a échoué (PDF téléchargé en local)
 * @param {boolean} [p.autoAttache=false] true si le backend joint lui-même le PDF (pas de geste manuel à décrire)
 * @param {object} [p.templates] { vous, tu } — surcharge éditable de DEFAULT_TEMPLATES (settings.templates)
 */
export function buildEmail({ doc, fileUrl, folderUrl, fileName, tutoiement = false, archiveOk = true, autoAttache = false, templates }) {
  const m = tutoiement ? 'tu' : 'vous';
  const boutique = doc.boutique?.nom || 'Hu’mana';
  const prenom = doc.client?.prenom || '';
  const contexte = doc.meta?.lieu === 'visio' ? 'notre échange en visio' : tutoiement ? 'ta visite à la boutique' : 'votre visite à la boutique';
  const objet = OBJETS[m][doc.type] || OBJETS[m].peau;
  const tpl = (templates && templates[m]) || DEFAULT_TEMPLATES[m];
  const corpsPrincipal = tpl
    .replace(/\{contexte\}/g, contexte)
    .replace(/\{objet\}/g, objet)
    .replace(/\{boutique\}/g, boutique)
    .split('\n');
  const lignes = [
    prenom ? `Bonjour ${prenom},` : 'Bonjour,',
    '',
    ...corpsPrincipal,
  ];
  if (!autoAttache) {
    lignes.push(
      '',
      `Pièce jointe : ${fileName || 'le PDF'}${archiveOk ? ' (à glisser depuis le dossier archivé)' : ' (téléchargé sur cet ordinateur, à glisser depuis le dossier Téléchargements)'}`,
    );
  }
  if (fileUrl) lignes.push(`Lien du document : ${fileUrl}`);
  else if (folderUrl) lignes.push(`Dossier : ${folderUrl}`);
  lignes.push('', 'À très vite,', doc.meta?.auteur || '', boutique);
  return {
    to: doc.client?.email || '',
    sujet: `${SUJETS[doc.type] || SUJETS.peau} – ${boutique}`,
    corps: lignes.join('\n'),
  };
}

/** Ouvre Gmail (web) dans un nouvel onglet, message pré-rempli. */
export function gmailComposeUrl({ to, sujet, corps }) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: to || '', su: sujet || '', body: corps || '' });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
