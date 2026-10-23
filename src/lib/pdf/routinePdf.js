/**
 * Blocs « diagnostic », « routine » et « conseils » du PDF. Purs (jsPDF
 * seulement, aucune dépendance navigateur) ; dessinent dans `ctx.state`.
 */
import { FONT_FAMILIES } from './fonts.js';
import {
  MARGIN, CONTENT_W, COLORS,
  setText, setDraw, wrapText,
  drawSectionBar, ensureSpace,
} from './brand.js';
import { QUESTIONS_DEMO } from '../../data/questions.js';

const MOMENT_LABELS = { matin: 'Matin', soir: 'Soir', hebdo: 'Hebdo' };
const MOMENT_ORDER = ['matin', 'soir', 'hebdo'];

const HELP_LINE = {
  peau: "Appliquer dans l'ordre indiqué, sur peau propre.",
  cheveux: 'Sur cheveux humides, essorés.',
};

/** Prix « 12,50 € » avec espaces simples (les espaces insécables manquent aux polices). */
function priceLabel(prix) {
  const n = Number(prix);
  if (prix === '' || prix == null || Number.isNaN(n)) return '';
  return `${n.toFixed(2).replace('.', ',')} €`;
}

function answerText(value, question) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value === true) return 'Oui';
  if (value === false) return 'Non';
  const s = String(value ?? '').trim();
  if (question?.type === 'oui_non' && s) return s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

/* ───────────────────────── diagnostic ───────────────────────── */

export function drawDiagnostic(doc, ctx) {
  const { state } = ctx;
  const questions = ctx.questions || QUESTIONS_DEMO[ctx.type] || [];
  const rows = questions
    .map((q) => ({ q, a: answerText(ctx.reponses?.[q.id], q) }))
    .filter((r) => r.a);
  if (!rows.length) return;

  const labelW = 66;
  const gap = 6;
  const answerW = CONTENT_W - labelW - gap;
  const measure = (r) => {
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(8.4);
    const l = wrapText(doc, r.q.texte, labelW);
    doc.setFont(FONT_FAMILIES.sans, 'semibold');
    doc.setFontSize(9.6);
    const a = wrapText(doc, r.a, answerW);
    return { l, a, h: Math.max(l.length * 4, a.length * 4.5) + 4.6 };
  };

  const first = measure(rows[0]);
  ensureSpace(doc, state, 8.4 + 6 + first.h, ctx.redraw);
  state.y = drawSectionBar(doc, state.y, 'Diagnostic') + 5;

  rows.forEach((r) => {
    const m = measure(r);
    ensureSpace(doc, state, m.h, ctx.redraw);
    const y = state.y;
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(8.4);
    setText(doc, COLORS.inkLight);
    m.l.forEach((line, i) => doc.text(line, MARGIN.x0, y + 3.4 + i * 4));
    doc.setFont(FONT_FAMILIES.sans, 'semibold');
    doc.setFontSize(9.6);
    setText(doc, COLORS.ink);
    m.a.forEach((line, i) => doc.text(line, MARGIN.x0 + labelW + gap, y + 3.4 + i * 4.5));
    setDraw(doc, COLORS.creamDeep);
    doc.setLineWidth(0.25);
    doc.line(MARGIN.x0, y + m.h - 0.6, MARGIN.x1, y + m.h - 0.6);
    state.y = y + m.h;
  });
  state.y += 6;
}

/* ───────────────────────── routine (peau — modèle historique matin/soir/hebdo) ───────────────────────── */

const ITEM_TEXT_W = CONTENT_W - 12;

function itemMeta(produit) {
  return [
    produit.categorie,
    produit.ref ? `Réf. ${produit.ref}` : '',
    priceLabel(produit.prix),
  ].filter(Boolean).join('  ·  ');
}

function measureItem(doc, item) {
  let h = 4.4;
  if (itemMeta(item.produit || {})) h += 4.3;
  if (item.conseil) {
    doc.setFont(FONT_FAMILIES.serif, 'italic');
    doc.setFontSize(9.8);
    h += wrapText(doc, item.conseil, ITEM_TEXT_W).length * 4.1 + 1.2;
  }
  return h + 4;
}

function drawItem(doc, y, index, item) {
  const x = MARGIN.x0;
  const textX = x + 12;
  const produit = item.produit || {};

  doc.setFont(FONT_FAMILIES.serif, 'bold');
  doc.setFontSize(13.5);
  setText(doc, COLORS.clay);
  doc.text(String(index + 1).padStart(2, '0'), x, y + 4.3);

  doc.setFont(FONT_FAMILIES.sans, 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.ink);
  doc.text(produit.nom || 'Produit', textX, y + 4.3);

  let cy = y + 4.3;
  const meta = itemMeta(produit);
  if (meta) {
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(8);
    setText(doc, COLORS.inkLight);
    cy += 4.3;
    doc.text(meta, textX, cy);
  }
  if (item.conseil) {
    doc.setFont(FONT_FAMILIES.serif, 'italic');
    doc.setFontSize(9.8);
    setText(doc, COLORS.clayDark);
    wrapText(doc, item.conseil, ITEM_TEXT_W).forEach((line) => {
      cy += 4.1;
      doc.text(line, textX, cy);
    });
  }
  return cy;
}

/**
 * Rendu historique (matin/soir/hebdo) : utilisé pour `peau`, qui n'a pas
 * encore de vraie grille/structure de routine reçue (voir docs/CONTRACT.md).
 */
function drawRoutineMoments(doc, ctx, block) {
  const { state } = ctx;
  const items = (block.data?.items || []).filter((it) => it?.produit?.nom);

  MOMENT_ORDER.forEach((moment) => {
    const list = items.filter((it) => (it.moments || []).includes(moment));
    if (!list.length) return;

    ensureSpace(doc, state, 8.4 + 6 + measureItem(doc, list[0]), ctx.redraw);
    state.y = drawSectionBar(doc, state.y, MOMENT_LABELS[moment]) + 6;

    list.forEach((item, idx) => {
      ensureSpace(doc, state, measureItem(doc, item), ctx.redraw);
      state.y = drawItem(doc, state.y, idx, item) + 5.4;
    });

    if ((moment === 'matin' || moment === 'soir') && HELP_LINE[ctx.type]) {
      ensureSpace(doc, state, 6, ctx.redraw);
      doc.setFont(FONT_FAMILIES.serif, 'italic');
      doc.setFontSize(9.5);
      setText(doc, COLORS.inkLight);
      doc.text(HELP_LINE[ctx.type], MARGIN.x0, state.y);
      state.y += 6;
    }
    state.y += 3;
  });
}

/* ───────────────────────── routine cheveux (7 rubriques réelles, V1) ─────────────────────────
 * Modèle `data` documenté dans docs/CONTRACT.md (BlockKind: 'routine', branche cheveux).
 */

const SOIN_PROFOND_LABELS = { hebdo: 'Hebdomadaire', mensuel: 'Mensuel', trimestriel: 'Trimestriel' };

/** Étiquette principale d'une étape : nom du produit, ou le geste libre s'il n'y a pas de produit. */
function etapeTitle(etape) {
  return etape.produit?.nom || etape.geste || 'Étape';
}

/** Ligne de méta courte (localisation, quantité, nombre, fréquence, temps de pose, durée de cure). */
function etapeMetaLine(etape) {
  return [
    etape.localisation ? `Localisation : ${etape.localisation}` : '',
    etape.quantite ? `Quantité : ${etape.quantite}` : '',
    etape.nombre ? `Nombre : ${etape.nombre}` : '',
    etape.frequence ? `Fréquence : ${etape.frequence}` : '',
    etape.tempsDePose ? `Temps de pose : ${etape.tempsDePose}` : '',
    etape.dureeCure ? `Durée de cure : ${etape.dureeCure}` : '',
  ].filter(Boolean).join('  ·  ');
}

function measureEtape(doc, etape) {
  let h = 4.4;
  if (etapeMetaLine(etape)) h += 4.3;
  if (etape.methode) {
    doc.setFont(FONT_FAMILIES.serif, 'italic');
    doc.setFontSize(9.8);
    h += wrapText(doc, `Méthode : ${etape.methode}`, ITEM_TEXT_W).length * 4.1 + 1.2;
  }
  return h + 4;
}

function drawEtape(doc, y, index, etape) {
  const x = MARGIN.x0;
  const textX = x + 12;

  doc.setFont(FONT_FAMILIES.serif, 'bold');
  doc.setFontSize(13.5);
  setText(doc, COLORS.clay);
  doc.text(String(index + 1).padStart(2, '0'), x, y + 4.3);

  doc.setFont(FONT_FAMILIES.sans, 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.ink);
  doc.text(etapeTitle(etape), textX, y + 4.3);

  let cy = y + 4.3;
  const meta = etapeMetaLine(etape);
  if (meta) {
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(8);
    setText(doc, COLORS.inkLight);
    cy += 4.3;
    doc.text(meta, textX, cy);
  }
  if (etape.methode) {
    doc.setFont(FONT_FAMILIES.serif, 'italic');
    doc.setFontSize(9.8);
    setText(doc, COLORS.clayDark);
    wrapText(doc, `Méthode : ${etape.methode}`, ITEM_TEXT_W).forEach((line) => {
      cy += 4.1;
      doc.text(line, textX, cy);
    });
  }
  return cy;
}

/** Filtre : une étape n'est affichée que si elle a un produit ou un geste renseigné. */
function validEtapes(list) {
  return (list || []).filter((e) => e?.produit?.nom || e?.geste);
}

function drawEtapesList(doc, ctx, list) {
  const { state } = ctx;
  list.forEach((etape, idx) => {
    ensureSpace(doc, state, measureEtape(doc, etape), ctx.redraw);
    state.y = drawEtape(doc, state.y, idx, etape) + 5.4;
  });
}

/** Rubrique « Mon jour de lavage », « Entre mes shampoings » ou « Mes soins spécifiques ». */
function drawEtapeSection(doc, ctx, title, rawList) {
  const list = validEtapes(rawList);
  if (!list.length) return;
  const { state } = ctx;
  ensureSpace(doc, state, 8.4 + 6 + measureEtape(doc, list[0]), ctx.redraw);
  state.y = drawSectionBar(doc, state.y, title) + 6;
  drawEtapesList(doc, ctx, list);
  state.y += 3;
}

/** Rubrique « Mes soins profonds » : trois sous-listes hebdo/mensuel/trimestriel. */
function drawSoinsProfonds(doc, ctx, soins) {
  const groups = ['hebdo', 'mensuel', 'trimestriel']
    .map((key) => ({ key, list: validEtapes(soins?.[key]) }))
    .filter((g) => g.list.length);
  if (!groups.length) return;
  const { state } = ctx;

  ensureSpace(doc, state, 8.4 + 6 + measureEtape(doc, groups[0].list[0]), ctx.redraw);
  state.y = drawSectionBar(doc, state.y, 'Mes soins profonds') + 6;

  groups.forEach(({ key, list }) => {
    ensureSpace(doc, state, 7, ctx.redraw);
    doc.setFont(FONT_FAMILIES.sans, 'bold');
    doc.setFontSize(9.5);
    setText(doc, COLORS.clay);
    doc.text(SOIN_PROFOND_LABELS[key].toUpperCase(), MARGIN.x0, state.y + 3.6);
    state.y += 7;
    drawEtapesList(doc, ctx, list);
    state.y += 2;
  });
  state.y += 3;
}

/** Puces génériques (gestes & habitudes, tips) — même style que le bloc « conseils ». */
function drawBulletSection(doc, ctx, title, lines) {
  if (!lines.length) return;
  const { state } = ctx;
  const bulletW = CONTENT_W - 8;
  const wrap = (text) => {
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(9.6);
    return wrapText(doc, text, bulletW);
  };

  ensureSpace(doc, state, 8.4 + 7 + wrap(lines[0]).length * 4.6 + 3.4, ctx.redraw);
  state.y = drawSectionBar(doc, state.y, title) + 7;

  lines.forEach((text) => {
    const wrapped = wrap(text);
    ensureSpace(doc, state, wrapped.length * 4.6 + 3.4, ctx.redraw);
    doc.setFont(FONT_FAMILIES.sans, 'bold');
    doc.setFontSize(10);
    setText(doc, COLORS.clay);
    doc.text('•', MARGIN.x0, state.y + 3.6);
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(9.6);
    setText(doc, COLORS.ink);
    wrapped.forEach((line, i) => doc.text(line, MARGIN.x0 + 6, state.y + 3.6 + i * 4.6));
    state.y += wrapped.length * 4.6 + 3.4;
  });
  state.y += 4;
}

/**
 * Rendu de la fiche routine cheveux réelle (7 rubriques, V1) :
 * 1. Ma routine cheveux (objectifs) — 2. Mon jour de lavage — 3. Entre mes
 * shampoings — 4. Mes soins profonds — 5. Mes soins spécifiques —
 * 6. Mes gestes & habitudes — 7. Mes tips à ne pas oublier.
 * Chaque rubrique vide disparaît du PDF.
 */
function drawRoutineCheveux(doc, ctx, block) {
  const data = block.data || {};

  drawBulletSection(doc, ctx, 'Mes objectifs', (data.objectifs || []).filter(Boolean));
  drawEtapeSection(doc, ctx, 'Mon jour de lavage', data.jourLavage);
  drawEtapeSection(doc, ctx, 'Entre mes shampoings', data.entreShampoings);
  drawSoinsProfonds(doc, ctx, data.soinsProfonds || {});
  drawEtapeSection(doc, ctx, 'Mes soins spécifiques', data.soinsSpecifiques);
  drawBulletSection(
    doc, ctx, 'Mes gestes & habitudes',
    (data.gestes || []).filter((g) => g?.texte).map((g) => (g.categorie ? `${g.categorie} : ${g.texte}` : g.texte))
  );
  drawBulletSection(doc, ctx, 'Mes tips à ne pas oublier', (data.tips || []).filter(Boolean));
}

/** Dispatch : cheveux → 7 rubriques réelles (V1) ; peau (grille réelle non reçue) → historique matin/soir/hebdo. */
export function drawRoutine(doc, ctx, block) {
  if (ctx.type === 'cheveux') return drawRoutineCheveux(doc, ctx, block);
  return drawRoutineMoments(doc, ctx, block);
}

/* ───────────────────────── conseils ───────────────────────── */

export function drawConseils(doc, ctx, block) {
  const lines = String(block.data?.texte || '')
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return;
  const { state } = ctx;
  const bulletW = CONTENT_W - 8;
  const wrap = (text) => {
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(9.6);
    return wrapText(doc, text, bulletW);
  };

  ensureSpace(doc, state, 8.4 + 7 + wrap(lines[0]).length * 4.6 + 3.4, ctx.redraw);
  state.y = drawSectionBar(doc, state.y, 'Conseils') + 7;

  lines.forEach((text) => {
    const wrapped = wrap(text);
    ensureSpace(doc, state, wrapped.length * 4.6 + 3.4, ctx.redraw);
    doc.setFont(FONT_FAMILIES.sans, 'bold');
    doc.setFontSize(10);
    setText(doc, COLORS.clay);
    doc.text('•', MARGIN.x0, state.y + 3.6);
    doc.setFont(FONT_FAMILIES.sans, 'normal');
    doc.setFontSize(9.6);
    setText(doc, COLORS.ink);
    wrapped.forEach((line, i) => doc.text(line, MARGIN.x0 + 6, state.y + 3.6 + i * 4.6));
    state.y += wrapped.length * 4.6 + 3.4;
  });
  state.y += 4;
}
