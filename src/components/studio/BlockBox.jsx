import { useState } from 'react';
import { BLOCK_LABELS, LIFESTYLE_TIPS } from '../../data/constants';
import { answerIsFilled } from '../../store/selectors';
import { QUESTIONS_DEMO as QUESTIONS } from '../../data/questions';
import { Button, Field, Input, Switch, Textarea } from '../ui';
import { RoutineBuilder } from '../diagnostic/RoutineBuilder';
import { RoutineBuilderCheveux } from '../diagnostic/RoutineBuilderCheveux';

const BOUTIQUE_FIELDS = [
  ['nom', 'Nom'], ['slogan', 'Slogan'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'],
  ['email', 'Email'], ['site', 'Site web'], ['instagram', 'Instagram'],
];

/** Une boîte = une partie du PDF : interrupteur, ▲ ▼, contenu éditable dépliable. */
export function BlockBox({ block, index, count, doc, actions }) {
  const [open, setOpen] = useState(block.kind === 'routine');
  const meta = BLOCK_LABELS[block.kind];
  return (
    <section className={`block-box ${block.on ? '' : 'is-off'}`}>
      <header className="block-head">
        <button type="button" className="block-title" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <i className={`fa-solid fa-chevron-${open ? 'down' : 'right'} chev`} />
          <i className={`${meta.icon} kind-icon`} />
          <span>{meta.titre}</span>
        </button>
        <span className="block-tools">
          <Switch checked={block.on} onChange={() => actions.toggleBlock(block.id)} />
          <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-up" aria-label={`Monter ${meta.titre}`} disabled={index === 0} onClick={() => actions.moveBlock(block.id, -1)} />
          <Button variant="ghost" size="sm" icon="fa-solid fa-arrow-down" aria-label={`Descendre ${meta.titre}`} disabled={index === count - 1} onClick={() => actions.moveBlock(block.id, 1)} />
        </span>
      </header>
      {open && (
        <div className="block-body">
          <BlockEditor block={block} doc={doc} actions={actions} />
        </div>
      )}
    </section>
  );
}

function BlockEditor({ block, doc, actions }) {
  const meta = BLOCK_LABELS[block.kind];
  const set = (patch) => actions.setBlockData(block.id, patch);

  switch (block.kind) {
    case 'routine':
      // cheveux : 7 rubriques réelles V1 (voir docs/CONTRACT.md) · peau : grille réelle non reçue, modèle historique matin/soir/hebdo.
      return doc.type === 'cheveux'
        ? <RoutineBuilderCheveux data={block.data} onChange={set} />
        : <RoutineBuilder type={doc.type} items={block.data.items || []} onChange={(items) => set({ items })} />;
    case 'conseils':
      return (
        <Field hint="Apparaît dans la section « Conseils » du PDF.">
          {(id) => <Textarea id={id} rows={4} placeholder="Ex. Boire un grand verre d’eau au réveil, éviter l’eau trop chaude…" value={block.data.texte || ''} onChange={(e) => set({ texte: e.target.value })} />}
        </Field>
      );
    case 'message':
      return <Field>{(id) => <Textarea id={id} rows={3} value={block.data.texte || ''} onChange={(e) => set({ texte: e.target.value })} />}</Field>;
    case 'lifestyle': {
      const tips = block.data.tips || [];
      const isOn = (t) => tips.some((x) => x.titre === t.titre);
      const toggle = (t) => {
        // Ordre stable = ordre de LIFESTYLE_TIPS.
        const next = LIFESTYLE_TIPS.filter((x) => (x.id === t.id ? !isOn(t) : isOn(x))).map(({ titre, texte }) => ({ titre, texte }));
        set({ tips: next });
      };
      return (
        <div className="tips-grid tips-grid-compact">
          {LIFESTYLE_TIPS.map((t) => (
            <button key={t.id} type="button" className={`tip-card ${isOn(t) ? 'is-on' : ''}`} onClick={() => toggle(t)} aria-pressed={isOn(t)}>
              <span className="tip-icon"><i className={t.icon} /></span>
              <span><b>{t.titre}</b><p>{t.texte}</p></span>
            </button>
          ))}
        </div>
      );
    }
    case 'coordonnees':
      return (
        <div className="stack">
          <p className="xs muted">Propre à ce document (les valeurs par défaut se règlent dans Réglages).</p>
          <div className="form-row">
            {BOUTIQUE_FIELDS.map(([k, label]) => (
              <Field key={k} label={label}>{(id) => <Input id={id} size="sm" value={doc.boutique[k] || ''} onChange={(e) => actions.setBoutique({ [k]: e.target.value })} />}</Field>
            ))}
          </div>
        </div>
      );
    case 'diagnostic': {
      const qs = QUESTIONS[doc.type] || [];
      const n = qs.filter((q) => answerIsFilled(doc.reponses[q.id])).length;
      return <p className="small muted">{meta.aide} {n}/{qs.length} réponse{n > 1 ? 's' : ''} renseignée{n > 1 ? 's' : ''}.</p>;
    }
    default:
      return <p className="small muted">{meta.aide}</p>;
  }
}
