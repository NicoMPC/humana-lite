import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store/useStore';
import { Avatar, Button, Field, Input } from '../components/ui';
import { fullName } from '../lib/format';

/**
 * Écran de connexion : un code d'accès partagé (réglable dans Réglages) protège d'abord l'app, puis on choisit un profil sans mot de
 * passe individuel.
 */
export default function LoginPage() {
  const users = useStore(useShallow((s) => s.users.filter((u) => u.actif !== false)));
  const login = useStore((s) => s.login);
  const codeAttendu = useStore((s) => s.settings.securite?.code || '');
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [selected, setSelected] = useState(users[0]?.id);
  const [loading, setLoading] = useState(false);

  const submitCode = (e) => {
    e.preventDefault();
    if (code === codeAttendu) { setCodeError(''); setUnlocked(true); }
    else setCodeError('Code incorrect.');
  };

  const submit = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => { login(selected); navigate('/'); }, 450);
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
        {!unlocked ? (
          <form className="login-card anim-fade-up" onSubmit={submitCode}>
            <div className="eyebrow mb-1">Accès protégé</div>
            <h2 style={{ fontSize: 'var(--fs-3xl)' }}>Code d’accès</h2>
            <p className="muted mt-1 mb-3">Saisissez le code partagé de la boutique pour continuer.</p>
            <Field label="Code d’accès" required>
              {(id) => <Input id={id} type="password" autoFocus value={code} onChange={(e) => { setCode(e.target.value); setCodeError(''); }} />}
            </Field>
            {codeError && <p className="xs mt-1" style={{ color: 'var(--clay-600)' }}>{codeError}</p>}
            <Button type="submit" variant="primary" size="lg" block className="mt-3" disabled={!code} iconRight="fa-solid fa-arrow-right">
              Continuer
            </Button>
          </form>
        ) : (
          <div className="login-card anim-fade-up">
            <div className="eyebrow mb-1">Bienvenue</div>
            <h2 style={{ fontSize: 'var(--fs-3xl)' }}>Qui êtes-vous ?</h2>
            <p className="muted mt-1 mb-3">Choisissez votre profil pour ouvrir votre espace.</p>
            <div className="account-list stagger">
              {users.map((u) => (
                <button key={u.id} type="button" className={`account ${selected === u.id ? 'is-selected' : ''}`} onClick={() => setSelected(u.id)} onDoubleClick={submit}>
                  <Avatar person={u} size="lg" color={u.couleur} />
                  <span className="who">
                    <b>{fullName(u)}</b>
                    <span>Gérante</span>
                  </span>
                  {selected === u.id && <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
            <Button variant="primary" size="lg" block className="mt-3" onClick={submit} loading={loading} iconRight="fa-solid fa-arrow-right">
              Ouvrir mon espace
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
