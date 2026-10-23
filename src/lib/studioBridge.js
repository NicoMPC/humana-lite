import { archivePdf as archive } from './sheetsSync.js';

import * as sheets from './sheetsSync.js';

/**
 * Pont vers les modules PDF (agent A) et archivage (agent C), interface =
 * docs/CONTRACT.md. `renderPdf` fournit ici le `loadAsset` navigateur ;
 * `archivePdf` n'est jamais bloquant (une exception devient { ok:false }).
 * Le moteur PDF est chargé à la demande (jsPDF hors du bundle initial).
 */

/** renderPdf(doc) -> { blob, url, dataUrl, fileName } */
export async function renderPdf(doc) {
  const m = await import('./pdf/index.js');
  return m.renderPdf(doc, { loadAsset: m.browserAssetLoader(import.meta.env.BASE_URL) });
}

/** archivePdf({ client, docType, fileName, dataUrl, meta }) -> { ok, clientId, folderUrl, fileUrl, created } */
export async function archivePdf(args) {
  try {
    return await archive(args);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
