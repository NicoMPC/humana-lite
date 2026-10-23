import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { produitsActifs, toDocProduit } from '../../store/selectors';
import { normalize } from '../../lib/format';
import { GESTES_HABITUDES_CHEVEUX, TIPS_CHEVEUX } from '../../data/conseilsCheveux';
import { Button, SearchBar } from '../ui';

/**
 * Éditeur de routine cheveux (contenu d'une boîte « routine » quand
 * `doc.type === 'cheveux'`) : les 7 rubriques réelles V1 (voir
 * docs/CONTENU-CHEVEUX-V1.md section B et docs/CONTRACT.md). Contrôlé :
 * `data` = block.data, `onChange(patch)` fusionne superficiellement dans
 * block.data (même contrat que les autres boîtes, voir BlockBox.jsx).
 * Pour la routine peau (matin/soir/hebdo), voir RoutineBuilder.jsx.
 */
export function RoutineBuilderCheveux({ data, onChange }) {
  const soinsProfonds = { hebdo: [], mensuel: [], trimestriel: [], ...(data.soinsProfonds || {}) };

  return (
    <div className="stack">
      <RubriqueObjectifs value={data.objectifs || []} onChange={(objectifs) => onChange({ objectifs })} />

      <RubriqueEtapes
        titre="Mon jour de lavage"
        aide="Étapes dans l'ordre réel d'utilisation : shampoing, après-shampoing, coiffants…"
        value={data.jourLavage || []}
        onChange={(jourLavage) => onChange({ jourLavage })}
        fields={['localisation', 'quantite', 'nombre', 'methode', 'tempsDePose']}
        allowGeste={false}
      />

      <RubriqueEtapes
        titre="Entre mes shampoings"
        aide="Refresh/entretien entre deux lavages. Si rien n'est recommandé, laissez vide : la rubrique disparaît du PDF."
        value={data.entreShampoings || []}
        onChange={(entreShampoings) => onChange({ entreShampoings })}
        fields={['localisation', 'quantite', 'methode']}
        allowGeste
      />

      <section className="routine-rubrique">
        <h4>Mes soins profonds</h4>
        <p className="xs muted">Masque, détox, bain d'huile… par fréquence.</p>
        {['hebdo', 'mensuel', 'trimestriel'].map((key) => (
          <div key={key} className="stack">
            <p className="small semibold">{{ hebdo: 'Hebdomadaire', mensuel: 'Mensuel', trimestriel: 'Trimestriel' }[key]}</p>
            <EtapeListEditor
              value={soinsProfonds[key]}
              onChange={(list) => onChange({ soinsProfonds: { ...soinsProfonds, [key]: list } })}
              fields={['localisation', 'quantite', 'methode', 'tempsDePose']}
              allowGeste={false}
            />
          </div>
        ))}
      </section>

      <RubriqueEtapes
        titre="Mes soins spécifiques"
        aide="Lotion pousse, complément alimentaire, huiles essentielles… tout protocole régulier ou ciblé hors jour de lavage, coiffage et soins profonds."
        value={data.soinsSpecifiques || []}
        onChange={(soinsSpecifiques) => onChange({ soinsSpecifiques })}
        fields={['frequence', 'localisation', 'quantite', 'methode', 'dureeCure']}
        allowGeste
      />

      <RubriqueGestes value={data.gestes || []} onChange={(gestes) => onChange({ gestes })} />
      <RubriqueTips value={data.tips || []} onChange={(tips) => onChange({ tips })} />
    </div>
  );
}

/* ───────────────────────── 1. Ma routine cheveux (objectifs) ───────────────────────── */

function RubriqueObjectifs({ value, onChange }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft('');
  };
  return (
    <section className="routine-rubrique">
      <h4>Ma routine cheveux</h4>
      <p className="xs muted">Objectifs principaux affichés en tête de la fiche (ex. « Apaiser mon cuir chevelu »). Pas de diagnostic ni de porosité ici : c'est la fiche pratique remise à la cliente.</p>
      <div className="tag-input-row">
        <input
          className="input input-sm"
          placeholder="Ex. Définir mes boucles"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <Button variant="default" size="sm" icon="fa-solid fa-plus" onClick={add}>Ajouter</Button>
      </div>
      {value.length > 0 && (
        <div className="tag-list">
          {value.map((obj, i) => (
            <span key={`${obj}-${i}`} className="tag-chip">
              {obj}
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Retirer l’objectif">
                <i className="fa-solid fa-xmark" />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────────────────── rubriques à étapes (jour de lavage, entre shampoings, soins profonds, soins spécifiques) ───────────────────── */

function RubriqueEtapes({ titre, aide, value, onChange, fields, allowGeste }) {
  return (
    <section className="routine-rubrique">
      <h4>{titre}</h4>
      {aide && <p className="xs muted">{aide}</p>}
      <EtapeListEditor value={value} onChange={onChange} fields={fields} allowGeste={allowGeste} />
    </section>
  );
}

const FIELD_META = {
  localisation: { placeholder: 'Localisation (ex. racines, longueurs, pointes)' },
  quantite: { placeholder: 'Quantité (ex. 1 noix)' },
  nombre: { placeholder: 'Nombre (ex. 1 shampoing)' },
  frequence: { placeholder: 'Fréquence / moment (ex. tous les soirs)' },
  methode: { placeholder: 'Méthode (ex. masser, répartir puis rincer…)' },
  tempsDePose: { placeholder: 'Temps de pose (ex. 10 min)' },
  dureeCure: { placeholder: 'Durée de cure (ex. 1 mois)' },
};

/** Recherche produit (catalogue cheveux) + geste libre, liste réordonnable de `{produit|geste, …champs}`. */
function EtapeListEditor({ value, onChange, fields, allowGeste }) {
  const produits = useStore((s) => s.produits);
  const [search, setSearch] = useState('');
  const catalogue = useMemo(() => produitsActifs(produits, 'cheveux'), [produits]);
  const q = normalize(search.trim());
  const found = useMemo(
    () => catalogue.filter((p) => !q || normalize(p.nom).includes(q) || normalize(p.reference).includes(q)),
    [catalogue, q]
  );

  const addProduit = (produit) => { onChange([...value, { produit }]); setSearch(''); };
  const addGeste = () => {
    const v = search.trim();
    if (!v) return;
    onChange([...value, { geste: v }]);
    setSearch('');
  };
  const patch = (i, p) => onChange(value.map((it, k) => (k === i ? { ...it, ...p } : it)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(value.filter((_, k) => k !== i));

  return (
    <div className="stack">
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit du catalogue cheveux…" />
      {(found.length > 0 || search.trim()) && (
        <div className="product-list product-list-compact">
          {found.slice(0, 20).map((p) => (
            <button key={p.id} type="button" className="product-pick" onClick={() => addProduit(toDocProduit(p))}>
              <span className="pick-box"><i className="fa-solid fa-plus" /></span>
              <span className="pick-body">
                <span className="pick-name">{p.nom}</span>
                <span className="pick-meta">{p.categorie && <span>{p.categorie}</span>}{p.reference && <span>Réf. {p.reference}</span>}</span>
              </span>
            </button>
          ))}
          {search.trim() && (
            <button type="button" className="product-pick" onClick={() => addProduit({ nom: search.trim() })}>
              <span className="pick-box"><i className="fa-solid fa-plus" /></span>
              <span className="pick-body"><span className="pick-name">Ajouter « {search.trim()} » (produit libre)</span></span>
            </button>
          )}
          {allowGeste && search.trim() && (
            <button type="button" className="product-pick" onClick={addGeste}>
              <span className="pick-box"><i className="fa-solid fa-hand" /></span>
              <span className="pick-body"><span className="pick-name">Ajouter « {search.trim()} » comme geste (sans produit)</span></span>
            </button>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="routine-items">
          {value.map((etape, i) => (
            <div key={i} className="routine-item">
              <div className="ri-top">
                <span className="ri-num">{i + 1}</span>
                <span className="ri-name truncate">{etape.produit?.nom || etape.geste || '—'}</span>
                <span className="ri-actions">
                  <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-up" aria-label="Monter" onClick={() => move(i, -1)} disabled={i === 0} />
                  <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-down" aria-label="Descendre" onClick={() => move(i, 1)} disabled={i === value.length - 1} />
                  <Button variant="ghost" size="sm" icon="fa-solid fa-xmark" aria-label="Retirer" onClick={() => remove(i)} />
                </span>
              </div>
              {!etape.geste && (
                <div className="etape-fields">
                  {fields.map((key) => (
                    <input
                      key={key}
                      className="input input-sm"
                      placeholder={FIELD_META[key].placeholder}
                      value={etape[key] || ''}
                      onChange={(e) => patch(i, { [key]: e.target.value })}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 6. Mes gestes & habitudes ───────────────────────── */

function RubriqueGestes({ value, onChange }) {
  const [openLib, setOpenLib] = useState(false);
  const isOn = (categorie, texte) => value.some((g) => g.categorie === categorie && g.texte === texte);
  const toggle = (categorie, texte) => {
    onChange(isOn(categorie, texte)
      ? value.filter((g) => !(g.categorie === categorie && g.texte === texte))
      : [...value, { categorie, texte }]);
  };
  const editTexte = (i, texte) => onChange(value.map((g, k) => (k === i ? { ...g, texte } : g)));
  const remove = (i) => onChange(value.filter((_, k) => k !== i));

  return (
    <section className="routine-rubrique">
      <h4>Mes gestes &amp; habitudes</h4>
      <p className="xs muted">Conseils liés au quotidien, au matériel, à la nuit, au sport, aux baignades, au soleil, à la chaleur. Remplace les anciennes rubriques séparées « nuit », « sport », « piscine » et « cas particuliers ».</p>
      <button type="button" className="library-toggle" onClick={() => setOpenLib((o) => !o)}>
        <i className={`fa-solid fa-chevron-${openLib ? 'down' : 'right'}`} />
        Choisir dans la bibliothèque ({GESTES_HABITUDES_CHEVEUX.reduce((n, c) => n + c.items.length, 0)} formulations)
      </button>
      {openLib && (
        <div className="library-groups">
          {GESTES_HABITUDES_CHEVEUX.map((cat) => (
            <div key={cat.categorie} className="library-group">
              <h5>{cat.categorie}</h5>
              <div className="options-grid">
                {cat.items.map((texte) => {
                  const checked = isOn(cat.categorie, texte);
                  return (
                    <label key={texte} className={`option ${checked ? 'is-checked' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(cat.categorie, texte)} />
                      <span className="box">{checked && <i className="fa-solid fa-check" />}</span>
                      <span>{texte}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <div className="selected-list">
          {value.map((g, i) => (
            <div key={i} className="selected-item">
              <span className="xs muted selected-cat truncate">{g.categorie}</span>
              <input className="input input-sm" value={g.texte} onChange={(e) => editTexte(i, e.target.value)} />
              <Button variant="ghost" size="sm" icon="fa-solid fa-xmark" aria-label="Retirer" onClick={() => remove(i)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── 7. Mes tips à ne pas oublier ───────────────────────── */

function RubriqueTips({ value, onChange }) {
  const [openLib, setOpenLib] = useState(false);
  const isOn = (texte) => value.includes(texte);
  const toggle = (texte) => onChange(isOn(texte) ? value.filter((t) => t !== texte) : [...value, texte]);
  const editTexte = (i, texte) => onChange(value.map((t, k) => (k === i ? texte : t)));
  const remove = (i) => onChange(value.filter((_, k) => k !== i));

  return (
    <section className="routine-rubrique">
      <h4>Mes tips à ne pas oublier</h4>
      <p className="xs muted">3 à 6 rappels maximum, courts et chaleureux — un pense-bête, pas un règlement intérieur. {value.length} sélectionné{value.length > 1 ? 's' : ''}.</p>
      <button type="button" className="library-toggle" onClick={() => setOpenLib((o) => !o)}>
        <i className={`fa-solid fa-chevron-${openLib ? 'down' : 'right'}`} />
        Choisir dans la bibliothèque ({TIPS_CHEVEUX.length} formulations)
      </button>
      {openLib && (
        <div className="library-groups">
          <div className="options-grid">
            {TIPS_CHEVEUX.map((texte) => {
              const checked = isOn(texte);
              return (
                <label key={texte} className={`option ${checked ? 'is-checked' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(texte)} />
                  <span className="box">{checked && <i className="fa-solid fa-check" />}</span>
                  <span>{texte}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      {value.length > 0 && (
        <div className="selected-list">
          {value.map((texte, i) => (
            <div key={i} className="selected-item">
              <input className="input input-sm" value={texte} onChange={(e) => editTexte(i, e.target.value)} />
              <Button variant="ghost" size="sm" icon="fa-solid fa-xmark" aria-label="Retirer" onClick={() => remove(i)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
