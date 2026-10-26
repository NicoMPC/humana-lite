import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { toast, confirmDialog } from '../store/useUI';
import { Button, Field, Input, Notice, Switch, Textarea } from '../components/ui';
import { getReglagesEnvoi, setValidationAvantEnvoi, pullEnvoisEnAttente, validerEnvoi, annulerEnvoi } from '../lib/sheetsSync';

const FIELDS = [
  ['nom', 'Nom de la boutique'], ['slogan', 'Slogan'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'],
  ['email', 'Email'], ['site', 'Site web'], ['instagram', 'Instagram'],
];

/** Réglages : coordonnées de la boutique, message de fin par défaut. */
export default function ReglagesPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [boutique, setBoutique] = useState({ ...settings.boutique });
  const [footer, setFooter] = useState(settings.footerMessage || '');

  const save = () => {
    updateSettings({ boutique, footerMessage: footer });
    toast('Réglages enregistrés — ils s’appliquent aux prochains documents.');
  };

  const envoi = useEnvoiReglages();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Hu’mana</div>
          <h1>Réglages</h1>
          <p className="lead">Valeurs par défaut reprises dans chaque nouveau document (modifiables document par document).</p>
        </div>
        <div className="page-actions"><Button variant="primary" icon="fa-solid fa-check" onClick={save}>Enregistrer</Button></div>
      </div>

      <div className="stack" style={{ maxWidth: 760 }}>
        <div className="card">
          <div className="card-header"><div><div className="eyebrow">Boutique</div><h3>Coordonnées</h3></div></div>
          <div className="form-row">
            {FIELDS.map(([k, label]) => (
              <Field key={k} label={label}>{(id) => <Input id={id} value={boutique[k] || ''} onChange={(e) => setBoutique((b) => ({ ...b, [k]: e.target.value }))} />}</Field>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="eyebrow">Document</div><h3>Signature / message de fin</h3></div></div>
          <Field hint="Message affiché en bas de chaque PDF, modifiable dans chaque document.">
            {(id) => <Textarea id={id} rows={3} value={footer} onChange={(e) => setFooter(e.target.value)} />}
          </Field>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="eyebrow">Envoi des PDF</div><h3>Automatisation</h3></div></div>
          <p className="small muted">
            Chaque document « Envoyer » part désormais seul par e-mail, pièce jointe comprise, et une relance automatique
            part à J+14 si la cliente ne revient pas — avec trace dans l’Agenda à chaque envoi.
          </p>
          <Switch
            checked={!!envoi.validationAvantEnvoi}
            disabled={envoi.status !== 'ready' && envoi.status !== 'saving'}
            onChange={envoi.toggle}
            label="Je valide chaque envoi avant qu’il parte (aperçu avant départ réel)"
          />
          {envoi.status === 'error' && (
            <Notice tone="amber" icon="fa-solid fa-triangle-exclamation" className="mt-2">
              Réglage indisponible : {envoi.error}
            </Notice>
          )}
        </div>

        {envoi.validationAvantEnvoi && <EnvoisEnAttentePanel />}
      </div>
    </>
  );
}

/** Charge/alterne le réglage global « validation avant envoi » (option C) côté backend. */
function useEnvoiReglages() {
  const [state, setState] = useState({ status: 'loading', validationAvantEnvoi: true, error: '' });

  useEffect(() => {
    (async () => {
      const res = await getReglagesEnvoi();
      if (res.ok) setState({ status: 'ready', validationAvantEnvoi: res.validationAvantEnvoi, error: '' });
      else setState({ status: 'error', validationAvantEnvoi: true, error: res.error || 'Erreur inconnue' });
    })();
  }, []);

  const toggle = useCallback(async (checked) => {
    setState((s) => ({ ...s, status: 'saving' }));
    const res = await setValidationAvantEnvoi(checked);
    if (res.ok) {
      setState({ status: 'ready', validationAvantEnvoi: res.validationAvantEnvoi, error: '' });
      toast(checked ? 'Validation avant envoi activée.' : 'Envoi automatique sans validation.');
    } else {
      setState((s) => ({ ...s, status: 'error', error: res.error || 'Erreur inconnue' }));
      toast(`Réglage non enregistré : ${res.error || 'erreur inconnue'}`, { type: 'error' });
    }
  }, []);

  return { ...state, toggle };
}

/** Liste des e-mails archivés mais pas encore partis (option C active) : valider ou rejeter. */
function EnvoisEnAttentePanel() {
  const [state, setState] = useState({ status: 'loading', envois: [], error: '' });
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    const res = await pullEnvoisEnAttente();
    if (res.ok) setState({ status: 'ready', envois: res.envois, error: '' });
    else setState({ status: 'error', envois: [], error: res.error || 'Erreur inconnue' });
  }, []);

  useEffect(() => { load(); }, [load]);

  const valider = async (envoiItem) => {
    setBusyId(envoiItem.id);
    const res = await validerEnvoi(envoiItem.id);
    setBusyId(null);
    if (res.ok) { toast(`E-mail envoyé à ${envoiItem.prenom}.`); load(); }
    else toast(`Envoi impossible : ${res.error || 'erreur inconnue'}`, { type: 'error' });
  };

  const rejeter = async (envoiItem) => {
    const ok = await confirmDialog({ title: 'Rejeter cet e-mail ?', message: `L’e-mail pour ${envoiItem.prenom} ne partira pas. Le PDF reste archivé.`, confirmLabel: 'Rejeter', danger: true });
    if (!ok) return;
    setBusyId(envoiItem.id);
    const res = await annulerEnvoi(envoiItem.id);
    setBusyId(null);
    if (res.ok) { toast('E-mail rejeté.'); load(); }
    else toast(`Rejet impossible : ${res.error || 'erreur inconnue'}`, { type: 'error' });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div><div className="eyebrow">Option C</div><h3>Envois en attente de validation</h3></div>
        <Button variant="ghost" size="sm" icon="fa-solid fa-rotate" onClick={load} loading={state.status === 'loading'}>Actualiser</Button>
      </div>
      {state.status === 'error' && (
        <Notice tone="amber" icon="fa-solid fa-triangle-exclamation">Liste indisponible : {state.error}</Notice>
      )}
      {state.status === 'ready' && state.envois.length === 0 && <p className="small muted">Aucun e-mail en attente.</p>}
      {state.status === 'ready' && state.envois.length > 0 && (
        <div className="stack">
          {state.envois.map((e) => (
            <div key={e.id} className="subtle-card flex between">
              <div className="grow">
                <div className="semibold">{e.prenom}</div>
                <div className="small muted truncate">{e.sujet}</div>
                <div className="xs muted">{e.email}</div>
              </div>
              <div className="row gap-2">
                <Button size="sm" variant="ghost" disabled={busyId === e.id} onClick={() => rejeter(e)}>Rejeter</Button>
                <Button size="sm" variant="primary" icon="fa-regular fa-paper-plane" loading={busyId === e.id} disabled={busyId === e.id} onClick={() => valider(e)}>Valider et envoyer</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
