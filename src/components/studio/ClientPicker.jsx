import { useEffect, useMemo, useRef, useState } from 'react';
import { pullArchives } from '../../lib/sheetsSync';
import { normalize } from '../../lib/format';
import { Field, Input } from '../ui';

// Cache module : une seule lecture des archives par session (ou jusqu'à invalidation).
let cachePromise = null;
function loadClients(force = false) {
  if (!cachePromise || force) {
    cachePromise = pullArchives().then((res) => {
      if (!res.ok) cachePromise = null; // ne pas mémoriser un échec
      return res.ok ? res.clients : [];
    });
  }
  return cachePromise;
}

/** À appeler après un archivage réussi pour que la nouvelle cliente apparaisse dans les suggestions. */
export function invalidateClientCache() {
  cachePromise = null;
}

/**
 * Sélecteur de cliente : prénom + nom avec suggestions des clientes archivées.
 * value = { id?, prenom, nom, email? } ; saisie libre = nouvelle cliente (id retiré).
 */
export function ClientPicker({ value, onChange }) {
  const v = value || {};
  const [clients, setClients] = useState([]);
  const [openFor, setOpenFor] = useState(null); // 'prenom' | 'nom' | null
  const boxRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadClients().then((list) => { if (alive) setClients(list); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpenFor(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const suggestions = useMemo(() => {
    if (!openFor) return [];
    const q = normalize(v[openFor]).trim();
    if (!q) return [];
    return clients
      .filter((c) => normalize(c[openFor]).includes(q))
      .filter((c) => !(v.id && c.id === v.id && normalize(c.prenom) === normalize(v.prenom) && normalize(c.nom) === normalize(v.nom)))
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr', { sensitivity: 'base' }))
      .slice(0, 6);
  }, [clients, openFor, v]);

  const type = (field, text) => {
    // Toute frappe sur prénom/nom détache la sélection : nouvelle cliente (ou retrouvée par nom côté serveur).
    onChange({ prenom: v.prenom || '', nom: v.nom || '', email: v.email || '', [field]: text });
    setOpenFor(field);
  };

  const pick = (c) => {
    onChange({ id: c.id, prenom: c.prenom || '', nom: c.nom || '', email: c.email || '' });
    setOpenFor(null);
  };

  const renderField = (field, label, placeholder) => (
    <Field label={label} required>
      {(id) => (
        <div style={{ position: 'relative' }}>
          <Input
            id={id}
            value={v[field] || ''}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(e) => type(field, e.target.value)}
            onFocus={() => setOpenFor(field)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpenFor(null); }}
          />
          {openFor === field && suggestions.length > 0 && (
            <div className="dropdown-menu" style={{ left: 0, right: 0 }} role="listbox">
              {suggestions.map((c) => (
                <button key={c.id} type="button" role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)}>
                  <i className="fa-regular fa-user" aria-hidden="true" />
                  <span>{c.prenom} {c.nom}{c.email ? <span className="muted"> · {c.email}</span> : null}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Field>
  );

  return (
    <div ref={boxRef}>
      <div className="form-row">
        {renderField('prenom', 'Prénom', 'Prénom')}
        {renderField('nom', 'Nom', 'Nom')}
      </div>
      <Field label="E-mail (facultatif)" hint={v.id ? 'Cliente déjà archivée : le dossier Drive sera réutilisé.' : 'Nouvelle cliente : un dossier Drive sera créé.'}>
        <Input type="email" value={v.email || ''} placeholder="prenom.nom@exemple.fr" autoComplete="off" onChange={(e) => onChange({ ...v, email: e.target.value })} />
      </Field>
    </div>
  );
}

export default ClientPicker;
