/**
 * Bloc « lifestyle » du PDF : cartes de conseils (1 ou 2 colonnes selon le
 * nombre). Pur (jsPDF seulement) ; dessine dans `ctx.state`.
 */
import { FONT_FAMILIES } from './fonts.js';
import {
  MARGIN, CONTENT_W, BOTTOM_LIMIT, COLORS,
  setFill, setText, wrapText,
  drawSectionBar, ensureSpace,
} from './brand.js';

function measureCardHeight(doc, tip, colW) {
  doc.setFont(FONT_FAMILIES.sans, 'normal');
  doc.setFontSize(9.4);
  return 9 + 7 + 5.2 + wrapText(doc, tip.texte || '', colW - 16).length * 4.3 + 8;
}

function drawCard(doc, x, y, w, h, tip, index) {
  setFill(doc, COLORS.sageVeryLight);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  const cx = x + 13;
  const cy = y + 13;
  setFill(doc, COLORS.clay);
  doc.circle(cx, cy, 4.3, 'F');
  doc.setFont(FONT_FAMILIES.sans, 'bold');
  doc.setFontSize(9.5);
  setText(doc, COLORS.white);
  doc.text(String(index + 1).padStart(2, '0'), cx, cy + 1.3, { align: 'center' });

  doc.setFont(FONT_FAMILIES.sans, 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.ink);
  doc.text(tip.titre || '', x + 21, cy + 1.3);

  doc.setFont(FONT_FAMILIES.sans, 'normal');
  doc.setFontSize(9.4);
  setText(doc, COLORS.inkLight);
  let ty = y + 9 + 7 + 5.2;
  wrapText(doc, tip.texte || '', w - 16).forEach((line) => {
    doc.text(line, x + 8, ty);
    ty += 4.3;
  });
}

export function drawLifestyle(doc, ctx, block) {
  const tips = (block.data?.tips || []).filter((t) => t && (t.titre || t.texte));
  if (!tips.length) return;
  const { state } = ctx;

  // Sous un titre « lifestyle » l'entête suffit ; dans un document peau/cheveux on ajoute une barre.
  if (ctx.type !== 'lifestyle') {
    ensureSpace(doc, state, 8.4 + 6 + 40, ctx.redraw);
    state.y = drawSectionBar(doc, state.y, 'Lifestyle') + 6;
  }

  const columns = tips.length >= 4 ? 2 : 1;
  const colGap = 8;
  const colW = columns === 2 ? (CONTENT_W - colGap) / 2 : CONTENT_W;
  const colX = [MARGIN.x0, MARGIN.x0 + colW + colGap];
  let colY = [state.y, state.y];

  tips.forEach((tip, i) => {
    const col = columns === 2 ? i % 2 : 0;
    const h = measureCardHeight(doc, tip, colW);
    if (colY[col] + h > BOTTOM_LIMIT) {
      doc.addPage();
      state.page += 1;
      const y = ctx.redraw(doc, state.page);
      colY = [y, y];
    }
    drawCard(doc, colX[col], colY[col], colW, h, tip, i);
    colY[col] += h + 6;
  });
  state.y = Math.max(...colY);
}
