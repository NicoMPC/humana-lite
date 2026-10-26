import { useState } from 'react';
import { Button, Field, Input, Notice, Select, Textarea } from '../components/ui';
import { soumettreFormulairePreRdv } from '../lib/sheetsSync';

const MAX_PHOTOS = 6;

/**
 * Formulaire pré-rdv (devis : « Un formulaire part vers la cliente avant le
 * rendez-vous : coordonnées et photos, déposées directement dans votre Drive »).
 * Page PUBLIQUE, sans connexion — lien envoyé par Jessie/Nathalie à la cliente
 * avant son rendez-vous.
 *
 * HYPOTHÈSE DE CHAMPS À VALIDER AVEC NATHALIE (le devis ne précise pas la liste
 * exacte) : prénom/nom/téléphone/email, motif, date souhaitée, note libre,
 * jusqu'à 6 photos. À ajuster une fois le retour de Nathalie obtenu.
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FormulairePreRdvPage() {
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '', motif: 'cheveux', dateSouhaitee: '', notes: '' });
  const [photos, setPhotos] = useState([]); // [{file, name}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envoye, setEnvoye] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const ajouterPhotos = (fileList) => {
    const nouvelles = Array.from(fileList || []).slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    setPhotos((p) => [...p, ...nouvelles.map((file) => ({ file, name: file.name }))]);
  };

  const retirerPhoto = (i) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.prenom.trim() || !form.nom.trim()) return setError('Prénom et nom sont obligatoires.');
    if (!form.telephone.trim() && !form.email.trim()) return setError('Indiquez un téléphone ou un email pour être recontactée.');
    setLoading(true);
    try {
      const photosDataUrl = await Promise.all(photos.map((p) => fileToDataUrl(p.file)));
      const res = await soumettreFormulairePreRdv({
        client: { prenom: form.prenom.trim(), nom: form.nom.trim(), telephone: form.telephone.trim(), email: form.email.trim() },
        motif: form.motif,
        dateSouhaitee: form.dateSouhaitee,
        notes: form.notes,
        photos: photosDataUrl,
      });
      setLoading(false);
      if (!res.ok) return setError(res.error || 'Échec de l’envoi, réessayez.');
      setEnvoye(true);
    } catch (err) {
      setLoading(false);
      setError(String(err?.message || err));
    }
  };

  if (envoye) {
    return (
      <div className="pre-rdv-page">
        <div className="card pre-rdv-card anim-fade-up">
          <div className="empty-icon"><i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)' }} /></div>
          <h2>Merci, c’est enregistré !</h2>
          <p className="muted">Vos informations sont bien arrivées chez Hu’mana. À très vite pour votre rendez-vous.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pre-rdv-page">
      <form className="card pre-rdv-card anim-fade-up" onSubmit={submit}>
        <img src="./brand/logo-vert-crop.png" alt="Hu'mana – La Boutique" style={{ height: 56, marginBottom: 'var(--sp-3)' }} />
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Avant votre rendez-vous</h1>
        <p className="muted mb-3">Quelques informations pour préparer votre venue chez Hu’mana.</p>

        <div className="form-row">
          <Field label="Prénom" required>{(id) => <Input id={id} value={form.prenom} onChange={set('prenom')} autoFocus />}</Field>
          <Field label="Nom" required>{(id) => <Input id={id} value={form.nom} onChange={set('nom')} />}</Field>
        </div>
        <div className="form-row">
          <Field label="Téléphone">{(id) => <Input id={id} type="tel" value={form.telephone} onChange={set('telephone')} />}</Field>
          <Field label="Email">{(id) => <Input id={id} type="email" value={form.email} onChange={set('email')} />}</Field>
        </div>
        <div className="form-row">
          <Field label="Motif du rendez-vous">
            {(id) => (
              <Select id={id} value={form.motif} onChange={set('motif')}>
                <option value="cheveux">Cheveux</option>
                <option value="peau">Peau</option>
                <option value="les-deux">Cheveux et peau</option>
              </Select>
            )}
          </Field>
          <Field label="Date souhaitée" hint="Facultatif">{(id) => <Input id={id} type="date" value={form.dateSouhaitee} onChange={set('dateSouhaitee')} />}</Field>
        </div>
        <Field label="Une remarque, une envie particulière ?" hint="Facultatif">
          {(id) => <Textarea id={id} rows={3} value={form.notes} onChange={set('notes')} />}
        </Field>

        <Field label={`Photos (jusqu’à ${MAX_PHOTOS})`} hint="Facultatif — ça nous aide à préparer votre routine à l’avance.">
          {(id) => (
            <>
              <input id={id} type="file" accept="image/*" multiple disabled={photos.length >= MAX_PHOTOS}
                onChange={(e) => { ajouterPhotos(e.target.files); e.target.value = ''; }} />
              {photos.length > 0 && (
                <ul className="small muted mt-1" style={{ listStyle: 'none', padding: 0 }}>
                  {photos.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-image" /> {p.name}
                      <button type="button" onClick={() => retirerPhoto(i)} style={{ background: 'none', border: 0, color: 'var(--clay-600)', cursor: 'pointer' }}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Field>

        {error && <Notice tone="amber" icon="fa-solid fa-triangle-exclamation">{error}</Notice>}

        <Button type="submit" variant="primary" size="lg" block className="mt-3" loading={loading} iconRight="fa-solid fa-arrow-right">
          Envoyer
        </Button>
      </form>
    </div>
  );
}
