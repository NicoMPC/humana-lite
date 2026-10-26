import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/ids';
import { Button, Field, Input, Segmented, Select, Switch, Textarea } from '../components/ui';

const TYPES_QUESTION = [
  { value: 'texte', label: 'Texte libre' },
  { value: 'choix_unique', label: 'Choix unique' },
  { value: 'choix_multiple', label: 'Choix multiple' },
  { value: 'oui_non', label: 'Oui / non' },
];

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Flèches ▲▼ + corbeille, communes aux listes réordonnables de cette page. */
function RowActions({ index, count, onUp, onDown, onDelete }) {
  return (
    <div className="row gap-1">
      <Button size="sm" variant="ghost" icon="fa-solid fa-chevron-up" disabled={index === 0} onClick={onUp} />
      <Button size="sm" variant="ghost" icon="fa-solid fa-chevron-down" disabled={index === count - 1} onClick={onDown} />
      <Button size="sm" variant="ghost" icon="fa-solid fa-trash" onClick={onDelete} />
    </div>
  );
}

/**
 * Éditeur de questions + bibliothèque de conseils (devis : « vous ajoutez, modifiez
 * et réordonnez vos questions et votre bibliothèque de conseils vous-même, à tout
 * moment »). 4 onglets : questions peau, questions cheveux, gestes & habitudes, tips.
 * Chaque document déjà envoyé garde un instantané des questions telles qu'elles
 * étaient (voir useStudio.newDoc) — modifier ici n'affecte que les PROCHAINS documents.
 */
export default function ContenuPage() {
  const [tab, setTab] = useState('peau');

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Hu’mana</div>
          <h1>Contenu</h1>
          <p className="lead">Vos questions de diagnostic et votre bibliothèque de conseils — modifiables à tout moment, sans toucher au code.</p>
        </div>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'peau', label: 'Questions peau' },
          { value: 'cheveux', label: 'Questions cheveux' },
          { value: 'gestes', label: 'Gestes & habitudes' },
          { value: 'tips', label: 'Tips' },
        ]}
        className="mb-3"
      />

      {(tab === 'peau' || tab === 'cheveux') && <QuestionsEditor type={tab} />}
      {tab === 'gestes' && <GestesEditor />}
      {tab === 'tips' && <TipsEditor />}
    </>
  );
}

function QuestionsEditor({ type }) {
  const questions = useStore((s) => s.questions[type] || []);
  const updateQuestions = useStore((s) => s.updateQuestions);
  const set = (next) => updateQuestions(type, next);

  const patchAt = (i, patch) => set(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const ajouter = () => set([...questions, { id: uid('q'), texte: '', type: 'texte', options: [], obligatoire: false, aide: '' }]);

  return (
    <div className="stack">
      {questions.length === 0 && <p className="small muted">Aucune question pour l’instant.</p>}
      {questions.map((q, i) => (
        <div key={q.id} className="card">
          <div className="flex between">
            <span className="small muted">Question {i + 1}</span>
            <RowActions
              index={i} count={questions.length}
              onUp={() => set(move(questions, i, i - 1))}
              onDown={() => set(move(questions, i, i + 1))}
              onDelete={() => set(questions.filter((_, idx) => idx !== i))}
            />
          </div>
          <Field label="Intitulé">{(id) => <Input id={id} value={q.texte} onChange={(e) => patchAt(i, { texte: e.target.value })} />}</Field>
          <div className="form-row">
            <Field label="Type de réponse">
              {(id) => (
                <Select id={id} value={q.type} onChange={(e) => patchAt(i, { type: e.target.value })}>
                  {TYPES_QUESTION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              )}
            </Field>
            <div className="flex" style={{ alignItems: 'center', marginTop: 'var(--sp-5)' }}>
              <Switch checked={!!q.obligatoire} onChange={(v) => patchAt(i, { obligatoire: v })} label="Obligatoire" />
            </div>
          </div>
          {(q.type === 'choix_unique' || q.type === 'choix_multiple') && (
            <Field label="Options" hint="Une option par ligne.">
              {(id) => (
                <Textarea
                  id={id} rows={3}
                  value={(q.options || []).join('\n')}
                  onChange={(e) => patchAt(i, { options: e.target.value.split('\n') })}
                  onBlur={(e) => patchAt(i, { options: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                />
              )}
            </Field>
          )}
          <Field label="Aide" hint="Facultatif — affichée sous la question pendant le diagnostic.">
            {(id) => <Input id={id} value={q.aide || ''} onChange={(e) => patchAt(i, { aide: e.target.value })} />}
          </Field>
        </div>
      ))}
      <Button variant="soft" icon="fa-solid fa-plus" onClick={ajouter}>Ajouter une question</Button>
      <p className="small muted">Enregistré automatiquement — visible pour les prochains documents, pas pour ceux déjà envoyés.</p>
    </div>
  );
}

function GestesEditor() {
  const gestes = useStore((s) => s.conseilsCheveux.gestes || []);
  const updateConseilsCheveux = useStore((s) => s.updateConseilsCheveux);
  const set = (next) => updateConseilsCheveux({ gestes: next });

  const renameCat = (i, categorie) => set(gestes.map((c, idx) => (idx === i ? { ...c, categorie } : c)));
  const patchItems = (i, items) => set(gestes.map((c, idx) => (idx === i ? { ...c, items } : c)));
  const ajouterCategorie = () => set([...gestes, { categorie: 'Nouvelle catégorie', items: [] }]);
  const ajouterItem = (i) => patchItems(i, [...(gestes[i].items || []), '']);

  return (
    <div className="stack">
      {gestes.length === 0 && <p className="small muted">Aucune catégorie pour l’instant.</p>}
      {gestes.map((cat, i) => (
        <div key={i} className="card">
          <div className="flex between">
            <Input value={cat.categorie} onChange={(e) => renameCat(i, e.target.value)} />
            <RowActions
              index={i} count={gestes.length}
              onUp={() => set(move(gestes, i, i - 1))}
              onDown={() => set(move(gestes, i, i + 1))}
              onDelete={() => set(gestes.filter((_, idx) => idx !== i))}
            />
          </div>
          <div className="stack mt-2">
            {(cat.items || []).map((texte, j) => (
              <div key={j} className="flex" style={{ gap: 6 }}>
                <Input
                  value={texte}
                  onChange={(e) => patchItems(i, cat.items.map((t, idx) => (idx === j ? e.target.value : t)))}
                />
                <RowActions
                  index={j} count={cat.items.length}
                  onUp={() => patchItems(i, move(cat.items, j, j - 1))}
                  onDown={() => patchItems(i, move(cat.items, j, j + 1))}
                  onDelete={() => patchItems(i, cat.items.filter((_, idx) => idx !== j))}
                />
              </div>
            ))}
            <Button size="sm" variant="ghost" icon="fa-solid fa-plus" onClick={() => ajouterItem(i)}>Ajouter une formulation</Button>
          </div>
        </div>
      ))}
      <Button variant="soft" icon="fa-solid fa-plus" onClick={ajouterCategorie}>Ajouter une catégorie</Button>
    </div>
  );
}

function TipsEditor() {
  const tips = useStore((s) => s.conseilsCheveux.tips || []);
  const updateConseilsCheveux = useStore((s) => s.updateConseilsCheveux);
  const set = (next) => updateConseilsCheveux({ tips: next });
  const ajouter = () => set([...tips, '']);

  return (
    <div className="stack">
      {tips.length === 0 && <p className="small muted">Aucun tip pour l’instant.</p>}
      {tips.map((texte, i) => (
        <div key={i} className="flex" style={{ gap: 6 }}>
          <Input value={texte} onChange={(e) => set(tips.map((t, idx) => (idx === i ? e.target.value : t)))} />
          <RowActions
            index={i} count={tips.length}
            onUp={() => set(move(tips, i, i - 1))}
            onDown={() => set(move(tips, i, i + 1))}
            onDelete={() => set(tips.filter((_, idx) => idx !== i))}
          />
        </div>
      ))}
      <Button variant="soft" icon="fa-solid fa-plus" onClick={ajouter}>Ajouter un tip</Button>
    </div>
  );
}
