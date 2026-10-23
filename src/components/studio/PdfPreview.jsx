import { useEffect, useRef, useState } from 'react';
import { renderPdf } from '../../lib/studioBridge';
/**
 * Aperçu PDF live : <iframe> sur l'URL blob de `renderPdf(doc)`, régénéré
 * ~400 ms après chaque modification (debounce) ; les anciennes URL sont révoquées.
 */
export function PdfPreview({ doc }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [error, setError] = useState('');
  const current = useRef(null);
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current;
    setState((s) => (s === 'ok' ? 'refresh' : 'loading'));
    const t = setTimeout(async () => {
      try {
        const res = await renderPdf(doc);
        if (n !== seq.current) { URL.revokeObjectURL(res.url); return; }
        const old = current.current;
        current.current = res.url;
        setUrl(res.url);
        setState('ok');
        if (old) setTimeout(() => URL.revokeObjectURL(old), 1500);
      } catch (e) {
        if (n !== seq.current) return;
        console.error(e);
        setError(e?.message || String(e));
        setState('error');
      }
    }, 400);
    return () => clearTimeout(t);
  }, [doc]);

  useEffect(() => () => { seq.current++; if (current.current) URL.revokeObjectURL(current.current); }, []);

  return (
    <div className="pdf-preview">
      {url && <iframe title="Aperçu du PDF" src={`${url}#toolbar=0&navpanes=0&view=FitH`} />}
      {state !== 'ok' && state !== 'error' && <div className="pdf-status"><i className="fa-solid fa-circle-notch fa-spin" /> Mise à jour de l’aperçu…</div>}
      {state === 'error' && <div className="pdf-status is-error"><i className="fa-solid fa-triangle-exclamation" /> Aperçu indisponible : {error}</div>}
    </div>
  );
}
