import { useRef, useState } from 'react';
import { useCurrentUser } from '../../store/useStore';
import { toast } from '../../store/useUI';
import { pushFicheClient, ajouterPhotoBilan } from '../../lib/sheetsSync';
import { uid } from '../../lib/ids';
import { todayISO, formatDate } from '../../lib/dates';
import { Button, Field, Input, Switch, Textarea } from '../ui';

/**
 * Dossier cliente complet (Lot 5 — Option B du devis signé) : champs permanents
 * distincts des réponses de diagnostic — allergies, grossesse, traitements,
 * consentement daté, notes de suivi datées, bilan + photos avant/après à 6
 * semaines, synthèse professionnelle. Replié par défaut (une cliente n'a pas
 * toujours besoin de ce niveau de détail ouvert), sous le détail d'une seule
 * cliente sélectionnée dans Archives.
 */
export default function DossierClientPanel({ client, onSaved }) {
  const [open, setOpen] = useState(false);
  if (!client) return null;
  return (
    <div className="card" style={{ marginTop: 'var(--sp-3)' }}>
      <button type="button" className="flex between" style={{ width: '100%', background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => setOpen((o) => !o)}>
        <h4 style={{ margin: 0 }}>Dossier cliente</h4>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} muted`} />
      </button>
      {open && (
        <div className="stack mt-3">
          <InfosMedicales client={client} onSaved={onSaved} />
          <div className="divider" />
          <Consentement client={client} onSaved={onSaved} />
          <div className="divider" />
          <NotesSuivi client={client} onSaved={onSaved} />
          <div className="divider" />
          <BilanSixSemaines client={client} onSaved={onSaved} />
          <div className="divider" />
          <SyntheseProfessionnelle client={client} onSaved={onSaved} />
        </div>
      )}
    </div>
  );
}

function useSaveField(client, onSaved) {
  const [saving, setSaving] = useState(false);
  const save = async (fields) => {
    setSaving(true);
    const res = await pushFicheClient({ clientId: client.id, ...fields });
    setSaving(false);
    if (res.ok) { toast('Dossier mis à jour.'); onSaved?.(); }
    else toast(`Échec : ${res.error || 'erreur inconnue'}`, { type: 'error' });
    return res.ok;
  };
  return { saving, save };
}

function InfosMedicales({ client, onSaved }) {
  const [allergies, setAllergies] = useState(client.allergies || '');
  const [grossesse, setGrossesse] = useState(client.grossesse || '');
  const [traitements, setTraitements] = useState(client.traitements || '');
  const { saving, save } = useSaveField(client, onSaved);

  return (
    <div>
      <p className="eyebrow mb-1">Informations médicales</p>
      <div className="form-row">
        <Field label="Allergies">{(id) => <Input id={id} value={allergies} onChange={(e) => setAllergies(e.target.value)} />}</Field>
        <Field label="Grossesse">{(id) => <Input id={id} value={grossesse} onChange={(e) => setGrossesse(e.target.value)} />}</Field>
      </div>
      <Field label="Traitements en cours">{(id) => <Textarea id={id} rows={2} value={traitements} onChange={(e) => setTraitements(e.target.value)} />}</Field>
      <Button size="sm" variant="soft" icon="fa-solid fa-check" loading={saving} onClick={() => save({ allergies, grossesse, traitements })}>Enregistrer</Button>
    </div>
  );
}

function Consentement({ client, onSaved }) {
  const consentement = client.consentement || { ok: false, date: '' };
  const { saving, save } = useSaveField(client, onSaved);
  const toggle = (checked) => save({ consentement: { ok: checked, date: checked ? todayISO() : consentement.date } });

  return (
    <div>
      <p className="eyebrow mb-1">Consentement RGPD</p>
      <div className="flex between">
        <Switch checked={!!consentement.ok} onChange={toggle} disabled={saving} label={consentement.ok ? `Obtenu le ${formatDate(consentement.date)}` : 'Pas encore obtenu'} />
      </div>
      <p className="small muted mt-1">Texte de consentement en cours de rédaction — ici on trace seulement la date d’obtention.</p>
    </div>
  );
}

function NotesSuivi({ client, onSaved }) {
  const user = useCurrentUser();
  const [texte, setTexte] = useState('');
  const { saving, save } = useSaveField(client, onSaved);
  const notes = (client.notesSuivi || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const ajouter = async () => {
    if (!texte.trim()) return;
    const nouvelles = [{ id: uid('note'), date: todayISO(), texte: texte.trim(), auteur: user?.prenom || '' }, ...(client.notesSuivi || [])];
    const ok = await save({ notesSuivi: nouvelles });
    if (ok) setTexte('');
  };

  return (
    <div>
      <p className="eyebrow mb-1">Notes de suivi</p>
      {notes.length === 0 && <p className="small muted">Aucune note pour l’instant.</p>}
      {notes.map((n) => (
        <div key={n.id} className="subtle-card mb-1">
          <div className="small muted">{formatDate(n.date)}{n.auteur ? ` · ${n.auteur}` : ''}</div>
          <div className="small">{n.texte}</div>
        </div>
      ))}
      <Field label="Nouvelle note" hint="Datée automatiquement.">
        {(id) => <Textarea id={id} rows={2} value={texte} onChange={(e) => setTexte(e.target.value)} />}
      </Field>
      <Button size="sm" variant="soft" icon="fa-solid fa-plus" loading={saving} disabled={!texte.trim()} onClick={ajouter}>Ajouter la note</Button>
    </div>
  );
}

function PhotoColonne({ client, moment, label, onSaved }) {
  const bilan = client.bilanSixSemaines || { photosAvant: [], photosApres: [] };
  const photos = moment === 'avant' ? (bilan.photosAvant || []) : (bilan.photosApres || []);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const ajouter = async (file) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await ajouterPhotoBilan({ clientId: client.id, moment, dataUrl: reader.result });
      setLoading(false);
      if (res.ok) onSaved?.();
      else toast(`Échec : ${res.error || 'erreur inconnue'}`, { type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="small semibold mb-1">{label} ({photos.length})</div>
      <div className="flex wrap" style={{ gap: 6 }}>
        {photos.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="small" title={p.date}>
            <i className="fa-solid fa-image" /> {i + 1}
          </a>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => ajouter(e.target.files?.[0])} />
      <Button size="sm" variant="soft" icon="fa-solid fa-camera" loading={loading} className="mt-1" onClick={() => inputRef.current?.click()}>Ajouter une photo</Button>
    </div>
  );
}

function BilanSixSemaines({ client, onSaved }) {
  const bilan = client.bilanSixSemaines || { notes: '' };
  const [notes, setNotes] = useState(bilan.notes || '');
  const { saving, save } = useSaveField(client, onSaved);

  return (
    <div>
      <p className="eyebrow mb-1">Bilan à 6 semaines</p>
      <div className="form-row">
        <PhotoColonne client={client} moment="avant" label="Avant" onSaved={onSaved} />
        <PhotoColonne client={client} moment="apres" label="Après" onSaved={onSaved} />
      </div>
      <Field label="Notes du bilan">{(id) => <Textarea id={id} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
      <Button size="sm" variant="soft" icon="fa-solid fa-check" loading={saving} onClick={() => save({ bilanSixSemaines: { ...(client.bilanSixSemaines || {}), notes } })}>
        Enregistrer les notes
      </Button>
    </div>
  );
}

function SyntheseProfessionnelle({ client, onSaved }) {
  const s = client.syntheseProfessionnelle || { besoins: '', routinesProposees: '', routineChoisie: '' };
  const [besoins, setBesoins] = useState(s.besoins || '');
  const [routinesProposees, setRoutinesProposees] = useState(s.routinesProposees || '');
  const [routineChoisie, setRoutineChoisie] = useState(s.routineChoisie || '');
  const { saving, save } = useSaveField(client, onSaved);

  return (
    <div>
      <p className="eyebrow mb-1">Synthèse professionnelle</p>
      <Field label="Besoins identifiés">{(id) => <Textarea id={id} rows={2} value={besoins} onChange={(e) => setBesoins(e.target.value)} />}</Field>
      <Field label="Routines proposées">{(id) => <Textarea id={id} rows={2} value={routinesProposees} onChange={(e) => setRoutinesProposees(e.target.value)} />}</Field>
      <Field label="Routine choisie">{(id) => <Textarea id={id} rows={2} value={routineChoisie} onChange={(e) => setRoutineChoisie(e.target.value)} />}</Field>
      <Button size="sm" variant="soft" icon="fa-solid fa-check" loading={saving} onClick={() => save({ syntheseProfessionnelle: { besoins, routinesProposees, routineChoisie } })}>
        Enregistrer la synthèse
      </Button>
    </div>
  );
}
