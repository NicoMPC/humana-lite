import { useState } from 'react';
import { useStore } from '../store/useStore';
import { toast } from '../store/useUI';
import { Button, Field, Input, Textarea } from '../components/ui';

const FIELDS = [
  ['nom', 'Nom de la boutique'], ['slogan', 'Slogan'], ['adresse', 'Adresse'], ['telephone', 'Téléphone'],
  ['email', 'Email'], ['site', 'Site web'], ['instagram', 'Instagram'],
];

/** Réglages : coordonnées de la boutique, message de fin par défaut, code d'accès. */
export default function ReglagesPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [boutique, setBoutique] = useState({ ...settings.boutique });
  const [footer, setFooter] = useState(settings.footerMessage || '');
  const [code, setCode] = useState(settings.securite?.code || '');

  const save = () => {
    if (!code.trim()) return toast('Le code d’accès ne peut pas être vide.', { type: 'warning' });
    updateSettings({ boutique, footerMessage: footer, securite: { ...settings.securite, code: code.trim() } });
    toast('Réglages enregistrés — ils s’appliquent aux prochains documents.');
  };

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
          <div className="card-header"><div><div className="eyebrow">Sécurité</div><h3>Code d’accès</h3></div></div>
          <Field label="Code partagé" hint="Demandé à l’ouverture de l’application, avant le choix du profil (Jessie / Nathalie).">
            {(id) => <Input id={id} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />}
          </Field>
        </div>
      </div>
    </>
  );
}
