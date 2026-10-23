/**
 * Blocs communs à tous les types de document : entête, message de fin,
 * coordonnées. Chaque dessinateur reçoit (doc, ctx) et fait avancer
 * `ctx.state.y` ; `ctx.redraw` redessine le chrome d'une page suivante.
 */
import { FONT_FAMILIES } from './fonts.js';
import {
  PAGE, MARGIN, CONTENT_W, HEADER_H, COLORS,
  setFill, setText, wrapText, drawSpacedText,
  drawHeaderBand, drawSectionBar, drawLeaves, ensureSpace,
} from './brand.js';

/** Bandeau réduit des pages suivantes (et de la 1re page sans bloc entête). */
export function drawReducedChrome(doc, ctx) {
  drawHeaderBand(doc, ctx, { big: false, running: `${ctx.titleTop} ${ctx.titleBig} · ${ctx.clientName}` });
  return HEADER_H.next + 12;
}

/** Bloc « entete » : bandeau + logo, titre, cartouche « préparée pour ». */
export function drawEntete(doc, ctx) {
  const { state } = ctx;
  drawHeaderBand(doc, ctx, { big: true, subtitle: ctx.boutique?.slogan || 'Beauté naturelle' });

  const titleX = MARGIN.x0;
  doc.setFont(FONT_FAMILIES.serif, 'italic');
  doc.setFontSize(27);
  setText(doc, COLORS.clay);
  doc.text(ctx.titleTop, titleX, HEADER_H.first + 18);

  doc.setFont(FONT_FAMILIES.serif, 'bold');
  doc.setFontSize(32);
  setText(doc, COLORS.sageDark);
  drawSpacedText(doc, ctx.titleBig, titleX, HEADER_H.first + 32.5, { spacing: 3.1, align: 'left' });

  const boxW = 60;
  const boxH = 25;
  const boxX = PAGE.w - MARGIN.right - boxW;
  const boxY = HEADER_H.first + 6;
  setFill(doc, COLORS.sageVeryLight);
  doc.roundedRect(boxX, boxY, boxW, boxH, 1.6, 1.6, 'F');

  const padX = boxX + 5;
  doc.setFont(FONT_FAMILIES.sans, 'semibold');
  doc.setFontSize(9);
  setText(doc, COLORS.ink);
  let ly = boxY + 7.5;
  wrapText(doc, `Préparée pour ${ctx.clientName}`, boxW - 10).slice(0, 2).forEach((line) => {
    doc.text(line, padX, ly);
    ly += 4.2;
  });

  doc.setFont(FONT_FAMILIES.sans, 'normal');
  doc.setFontSize(8);
  setText(doc, COLORS.inkLight);
  if (ctx.auteur) { doc.text(`par ${ctx.auteur}`, padX, ly); ly += 4; }
  doc.text(`le ${ctx.dateLabel}`, padX, ly);

  drawLeaves(doc, 'top-right', { x: PAGE.w - 22, y: HEADER_H.first + 2, count: 6 });
  state.y = HEADER_H.first + 42;
}

/** Bloc « message » : encart doux avec le message de fin en italique. */
export function drawMessage(doc, ctx, block) {
  const texte = String(block.data?.texte || ctx.footerMessage || '').trim();
  if (!texte) return;
  const { state } = ctx;
  doc.setFont(FONT_FAMILIES.serif, 'italic');
  doc.setFontSize(14);
  const lines = wrapText(doc, texte, CONTENT_W - 30);
  const h = Math.max(30, lines.length * 6.2 + 20);
  ensureSpace(doc, state, h + 6, ctx.redraw);

  const y = state.y + 2;
  setFill(doc, COLORS.sageVeryLight);
  doc.roundedRect(MARGIN.x0, y, CONTENT_W, h, 3, 3, 'F');
  drawLeaves(doc, 'bottom-left', { x: MARGIN.x0 + 14, y: y + h - 6, count: 6 });

  doc.setFont(FONT_FAMILIES.serif, 'italic');
  doc.setFontSize(14);
  setText(doc, COLORS.sageDark);
  let ty = y + (h - lines.length * 6.2) / 2 + 4.2;
  lines.forEach((line) => {
    doc.text(line, PAGE.w / 2, ty, { align: 'center' });
    ty += 6.2;
  });
  state.y = y + h + 6;
}

/** Bloc « coordonnees » : coordonnées de la boutique (doc.boutique). */
export function drawCoordonnees(doc, ctx) {
  const b = ctx.boutique || {};
  const rows = [
    b.adresse,
    [b.telephone, b.email].filter(Boolean).join('   ·   '),
    [b.site, b.instagram].filter(Boolean).join('   ·   '),
  ].filter(Boolean);
  if (!b.nom && !rows.length) return;
  const { state } = ctx;

  const h = 12 + (b.nom ? 6.5 : 0) + rows.length * 4.8;
  ensureSpace(doc, state, 8.4 + 6 + h, ctx.redraw);
  state.y = drawSectionBar(doc, state.y, 'Contact') + 6;

  const y = state.y;
  setFill(doc, COLORS.sageVeryLight);
  doc.roundedRect(MARGIN.x0, y, CONTENT_W, h, 2, 2, 'F');
  let ty = y + 8;
  if (b.nom) {
    doc.setFont(FONT_FAMILIES.serif, 'bold');
    doc.setFontSize(14);
    setText(doc, COLORS.sageDark);
    doc.text(b.nom, PAGE.w / 2, ty, { align: 'center' });
    ty += 6.5;
  }
  doc.setFont(FONT_FAMILIES.sans, 'normal');
  doc.setFontSize(9);
  setText(doc, COLORS.ink);
  rows.forEach((row) => {
    doc.text(row, PAGE.w / 2, ty, { align: 'center' });
    ty += 4.8;
  });
  state.y = y + h + 6;
}
