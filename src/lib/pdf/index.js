/**
 * API publique du moteur PDF Hu'mana Lite.
 *
 *   renderPdf(doc, { loadAsset }) → { blob, url, dataUrl, fileName }
 *
 * `doc` suit docs/CONTRACT.md : le PDF est dessiné bloc par bloc (`doc.blocks`,
 * seulement `on:true`, dans l'ordre du tableau). Le module est pur côté DOM :
 * `loadAsset(relPath) → base64` est injecté (navigateur : browserAssetLoader,
 * Node : lecture de public/).
 */
import { jsPDF } from 'jspdf';
import { registerFonts } from './fonts.js';
import { setTheme, drawFooter } from './brand.js';
import { THEMES, DEFAULT_THEME } from './themes.js';
import { drawEntete, drawMessage, drawCoordonnees, drawReducedChrome } from './commonBlocks.js';
import { drawDiagnostic, drawRoutine, drawConseils } from './routinePdf.js';
import { drawLifestyle } from './lifestylePdf.js';
import { fullName, safeFileName } from '../format.js';
import { formatDateLong } from '../dates.js';

export { THEMES };
export { browserAssetLoader } from './assets.js';

const TYPE_FILE = { peau: 'Peau', cheveux: 'Cheveux', lifestyle: 'Lifestyle' };
const TYPE_TITLES = {
  peau: { top: 'Ma Routine', big: 'VISAGE' },
  cheveux: { top: 'Ma Routine', big: 'CHEVEUX' },
  lifestyle: { top: 'Mes conseils', big: 'LIFESTYLE' },
};

const DRAWERS = {
  diagnostic: drawDiagnostic,
  routine: drawRoutine,
  conseils: drawConseils,
  lifestyle: drawLifestyle,
  message: drawMessage,
  coordonnees: (doc, ctx) => drawCoordonnees(doc, ctx),
};

const DEFAULT_DATA = {
  entete: () => ({}),
  diagnostic: () => ({}),
  routine: () => ({ items: [] }),
  conseils: () => ({ texte: '' }),
  lifestyle: () => ({ tips: [] }),
  message: () => ({ texte: '' }),
  coordonnees: () => ({}),
};

/** Blocs par défaut d'un type de document (tous activés, ordre du contrat). */
export function DEFAULT_BLOCKS(type) {
  const kinds = type === 'lifestyle'
    ? ['entete', 'lifestyle', 'message', 'coordonnees']
    : ['entete', 'diagnostic', 'routine', 'conseils', 'message', 'coordonnees'];
  return kinds.map((kind) => ({ id: kind, kind, on: true, data: DEFAULT_DATA[kind]() }));
}

/** Nom de fichier : `<Type>_<Nom>_<Prenom>_<AAAA-MM-JJ>.pdf`. */
export function pdfFileName(doc) {
  const type = TYPE_FILE[doc.type] || doc.type || 'Document';
  const c = doc.client || {};
  return `${safeFileName(type, c.nom, c.prenom, doc.meta?.date)}.pdf`;
}

export async function renderPdf(doc, { loadAsset } = {}) {
  if (typeof loadAsset !== 'function') throw new Error('renderPdf : loadAsset requis');

  const theme = THEMES[doc.theme] || THEMES[DEFAULT_THEME];
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  // Tous les await avant le dessin : le thème (état module) reste cohérent pendant le rendu synchrone.
  await registerFonts(pdf, loadAsset);
  const logoWhite = await loadAsset(theme.logo);
  setTheme(doc.theme);

  const blocks = (doc.blocks || []).filter((b) => b && b.on);
  const titles = TYPE_TITLES[doc.type] || TYPE_TITLES.peau;
  const auteur = doc.meta?.auteur || '';
  const dateLabel = formatDateLong(doc.meta?.date);
  const ctx = {
    state: { y: 0, page: 1 },
    type: doc.type,
    reponses: doc.reponses,
    questions: doc.questions,
    assets: { logoWhite },
    boutique: doc.boutique || {},
    footerMessage: doc.footerMessage,
    footerContacts: !blocks.some((b) => b.kind === 'coordonnees'),
    footerNote: [dateLabel !== '—' ? `Le ${dateLabel}` : '', auteur && `par ${auteur}`].filter(Boolean).join(' · '),
    titleTop: titles.top,
    titleBig: titles.big,
    clientName: fullName(doc.client),
    auteur,
    dateLabel,
  };
  ctx.redraw = () => drawReducedChrome(pdf, ctx);

  // L'entête ouvre toujours la 1re page, où qu'elle soit dans le tableau ; sans elle, bandeau réduit.
  if (blocks.some((b) => b.kind === 'entete')) drawEntete(pdf, ctx);
  else ctx.state.y = drawReducedChrome(pdf, ctx);

  blocks.forEach((block) => {
    const draw = DRAWERS[block.kind];
    if (draw) draw(pdf, ctx, block);
  });

  const pageCount = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    pdf.setPage(p);
    drawFooter(pdf, ctx, p);
  }
  pdf.putTotalPages('{total_pages}');

  const blob = pdf.output('blob');
  return {
    blob,
    url: URL.createObjectURL(blob),
    dataUrl: pdf.output('datauristring'),
    fileName: pdfFileName(doc),
    pageCount,
  };
}
