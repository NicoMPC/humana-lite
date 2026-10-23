/**
 * Préparation de l'email : sujet + corps en texte brut, ouverture de Gmail
 * (onglet pré-rempli). Jamais d'envoi automatique : la pièce jointe (PDF)
 * ne peut pas être pré-remplie par URL, la praticienne la glisse depuis le
 * dossier archivé (ou le dossier Téléchargements si l'archivage a échoué).
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

/**
 * @param {object} p
 * @param {object} p.doc       document (contrat)
 * @param {string} [p.fileUrl] lien Drive du PDF archivé
 * @param {string} [p.folderUrl] lien du dossier de la cliente
 * @param {string} [p.fileName] nom du PDF à joindre
 * @param {boolean} [p.tutoiement=false] « tu » au lieu de « vous »
 * @param {boolean} [p.archiveOk=true] false si l'archivage a échoué (PDF téléchargé en local)
 */
export function buildEmail({ doc, fileUrl, folderUrl, fileName, tutoiement = false, archiveOk = true }) {
  const m = tutoiement ? 'tu' : 'vous';
  const boutique = doc.boutique?.nom || 'Hu’mana';
  const prenom = doc.client?.prenom || '';
  const contexte = doc.meta?.lieu === 'visio' ? 'notre échange en visio' : tutoiement ? 'ta visite à la boutique' : 'votre visite à la boutique';
  const objet = OBJETS[m][doc.type] || OBJETS[m].peau;
  const lignes = [
    prenom ? `Bonjour ${prenom},` : 'Bonjour,',
    '',
    `Merci pour ${contexte}. ${tutoiement ? 'Tu trouveras' : 'Vous trouverez'} ci-joint ${objet}.`,
    tutoiement ? 'N’hésite pas à me poser tes questions.' : 'N’hésitez pas à me poser vos questions.',
    '',
    `Pièce jointe : ${fileName || 'le PDF'}${archiveOk ? ' (à glisser depuis le dossier archivé)' : ' (téléchargé sur cet ordinateur, à glisser depuis le dossier Téléchargements)'}`,
  ];
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
