import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { produitsActifs, toDocProduit } from '../../store/selectors';
import { MOMENTS } from '../../data/constants';
import { normalize } from '../../lib/format';
import { Button, SearchBar } from '../ui';

/**
 * Éditeur de routine (contenu d'une boîte « routine ») : recherche/choix dans
 * le catalogue (ou produit libre saisi à la volée), moments matin/soir/hebdo
 * et conseil sous chaque produit. Contrôlé : `items` = block.data.items,
 * `onChange(items)`.
 */
export function RoutineBuilder({ items, onChange, type }) {
  const produits = useStore((s) => s.produits);
  const [search, setSearch] = useState('');
  const catalogue = useMemo(() => produitsActifs(produits, type), [produits, type]);
  const q = normalize(search.trim());
  const found = useMemo(() => catalogue.filter((p) => !q || normalize(p.nom).includes(q) || normalize(p.reference).includes(q)), [catalogue, q]);
  const exact = catalogue.some((p) => normalize(p.nom) === q);

  const isIn = (nom) => items.some((it) => normalize(it.produit.nom) === normalize(nom));
  const add = (produit) => {
    if (isIn(produit.nom)) return;
    onChange([...items, { produit, moments: ['matin'], conseil: '' }]);
  };
  const patch = (i, p) => onChange(items.map((it, k) => (k === i ? { ...it, ...p } : it)));
  const toggleMoment = (i, m) => {
    const cur = items[i].moments;
    const next = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
    patch(i, { moments: next.length ? next : cur });
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="stack">
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit du catalogue…" />
      <div className="product-list product-list-compact">
        {found.slice(0, 40).map((p) => {
          const checked = isIn(p.nom);
          return (
            <button key={p.id} type="button" className={`product-pick ${checked ? 'is-selected' : ''}`} onClick={() => (checked ? onChange(items.filter((it) => normalize(it.produit.nom) !== normalize(p.nom))) : add(toDocProduit(p)))} aria-pressed={checked}>
              <span className="pick-box">{checked && <i className="fa-solid fa-check" />}</span>
              <span className="pick-body">
                <span className="pick-name">{p.nom}</span>
                <span className="pick-meta">{p.categorie && <span>{p.categorie}</span>}{p.reference && <span>Réf. {p.reference}</span>}</span>
              </span>
              {Number(p.prix) > 0 && <span className="pick-price">{p.prix} €</span>}
            </button>
          );
        })}
        {!catalogue.length && !q && <p className="xs muted">Catalogue vide : tapez un nom pour ajouter un produit libre, ou importez le stock dans Produits.</p>}
        {q && !exact && (
          <button type="button" className="product-pick" onClick={() => { add({ nom: search.trim() }); setSearch(''); }}>
            <span className="pick-box"><i className="fa-solid fa-plus" /></span>
            <span className="pick-body"><span className="pick-name">Ajouter « {search.trim()} » (produit libre)</span></span>
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="routine-items">
          {items.map((item, i) => (
            <div key={`${item.produit.nom}-${i}`} className="routine-item">
              <div className="ri-top">
                <span className="ri-num">{i + 1}</span>
                <span className="ri-name truncate">{item.produit.nom}</span>
                <span className="ri-actions">
                  <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-up" aria-label="Monter" onClick={() => move(i, -1)} disabled={i === 0} />
                  <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-down" aria-label="Descendre" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
                  <Button variant="ghost" size="sm" icon="fa-solid fa-xmark" aria-label="Retirer" onClick={() => onChange(items.filter((_, k) => k !== i))} />
                </span>
              </div>
              <div className="ri-moments">
                {MOMENTS.map((m) => (
                  <button key={m.key} type="button" className={`moment-chip ${m.key} ${item.moments.includes(m.key) ? 'is-on' : ''}`} onClick={() => toggleMoment(i, m.key)} title={m.hint}>
                    <i className={m.icon} /> {m.label}
                  </button>
                ))}
              </div>
              <input className="input input-sm" placeholder="Conseil d’utilisation (ex. 2 gouttes, sur peau humide…)" value={item.conseil || ''} onChange={(e) => patch(i, { conseil: e.target.value })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
