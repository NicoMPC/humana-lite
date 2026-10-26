import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { Avatar, Button, Field, Input } from '../components/ui';
import { fullName } from '../lib/format';
import { login as loginBackend } from '../lib/sheetsSync';

/**
 * Écran de connexion (Lot 4) : chaque gérante choisit son profil puis entre son
 * propre mot de passe, vérifié côté serveur (apps-script/Code.gs, action `login`)
 * — plus de code d'accès partagé dans le bundle public.
 */
export default function LoginPage() {
  const users = useStore(useShallow((s) => s.users.filter((u) => u.actif !== false)));
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(users[0]?.id);
  const [step, setStep] = useState('choix'); // 'choix' | 'motdepasse'
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const utilisatrice = users.find((u) => u.id === selected);

  const choisir = (id) => { setSelected(id); setError(''); setMotDePasse(''); setStep('motdepasse'); };

  const submit = async (e) => {
    e.preventDefault();
    if (!utilisatrice || !motDePasse) return;
    setLoading(true);
    setError('');
    const res = await loginBackend(utilisatrice.prenom, motDePasse);
    setLoading(false);
    if (!res.ok) { setError(res.error || 'Identifiant ou mot de passe incorrect.'); return; }
    login(utilisatrice.id);
    navigate('/');
  };

  return (
    <div className="login-screen">
      <section className="login-visual">
        <span className="blob" style={{ width: 420, height: 420, right: -120, top: -140 }} />
        <span className="blob" style={{ width: 260, height: 260, left: -80, bottom: 60, opacity: .18 }} />
        <img className="logo-mark" src="./brand/logo-blanc-crop.png" alt="Hu'mana – La Boutique" style={{ width: 190, position: 'relative' }} />
        <div style={{ position: 'relative' }}>
          <h1>Vos documents beauté, simplement.</h1>
          <p className="lead">Questionnaire, routine sur-mesure, PDF à l’image de la boutique, envoi et archivage par cliente, au même endroit.</p>
        </div>
        <p className="small foot-note" style={{ color: 'rgba(255,255,255,.7)', position: 'relative' }}>Accès réservé à l’équipe Hu’mana</p>
      </section>
      <section className="login-panel">
        {step === 'choix' ? (
          <div className="login-card anim-fade-up">
            <div className="eyebrow mb-1">Bienvenue</div>
            <h2 style={{ fontSize: 'var(--fs-3xl)' }}>Qui êtes-vous ?</h2>
            <p className="muted mt-1 mb-3">Choisissez votre profil pour continuer.</p>
            <div className="account-list stagger">
              {users.map((u) => (
                <button key={u.id} type="button" className="account" onClick={() => choisir(u.id)}>
                  <Avatar person={u} size="lg" color={u.couleur} />
                  <span className="who">
                    <b>{fullName(u)}</b>
                    <span>Gérante</span>
                  </span>
                  <i className="fa-solid fa-chevron-right" style={{ color: 'var(--muted)' }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className="login-card anim-fade-up" onSubmit={submit}>
            <button type="button" className="link-back xs mb-1" onClick={() => setStep('choix')} style={{ background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>
              <i className="fa-solid fa-arrow-left" /> Changer de profil
            </button>
            <div className="eyebrow mb-1">Bonjour {utilisatrice?.prenom}</div>
            <h2 style={{ fontSize: 'var(--fs-3xl)' }}>Votre mot de passe</h2>
            <p className="muted mt-1 mb-3">Connexion personnelle, vérifiée côté serveur.</p>
            <Field label="Mot de passe" required>
              {(id) => <Input id={id} type="password" autoFocus value={motDePasse} onChange={(e) => { setMotDePasse(e.target.value); setError(''); }} />}
            </Field>
            {error && <p className="xs mt-1" style={{ color: 'var(--clay-600)' }}>{error}</p>}
            <Button type="submit" variant="primary" size="lg" block className="mt-3" disabled={!motDePasse} loading={loading} iconRight="fa-solid fa-arrow-right">
              Ouvrir mon espace
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
