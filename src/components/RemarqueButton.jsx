import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button, Field, Textarea } from './ui';
import { pageLabel } from './layout/AppShell';
import { useCurrentUser } from '../store/useStore';
import { envoyerRemarque } from '../lib/sheetsSync';
import { toast } from '../store/useUI';

/**
 * Bouton flottant permanent, visible sur tout l'appli (hors formulaire public
 * et login) : capture une remarque libre + le contexte exact du moment où on
 * appuie (écran, utilisatrice, date), envoyée dans l'onglet Remarques du Sheet.
 * Sert aux ajustements pendant le chantier, puis en usage normal une fois en
 * prod — relu par Claude en début de session (voir CLAUDE.md).
 */
export function RemarqueButton() {
  const [open, setOpen] = useState(false);
  const [texte, setTexte] = useState('');
  const [sending, setSending] = useState(false);
  const user = useCurrentUser();
  const location = useLocation();

  const close = () => { if (!sending) { setOpen(false); setTexte(''); } };

  const submit = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    setSending(true);
    const res = await envoyerRemarque({
      texte: texte.trim(),
      ecran: pageLabel(location.pathname),
      chemin: location.pathname,
      auteur: user?.prenom || 'inconnue',
      date: new Date().toISOString(),
    });
    setSending(false);
    if (res.ok) { toast('Remarque envoyée, merci !'); setOpen(false); setTexte(''); }
    else toast(`Remarque non envoyée : ${res.error || 'erreur inconnue'}`, { type: 'error' });
  };

  return (
    <>
      <button type="button" className="remarque-fab" onClick={() => setOpen(true)} title="Laisser une remarque">
        <i className="fa-solid fa-comment-dots" /> <span>Une remarque</span>
      </button>
      <Modal open={open} onClose={close} title="Une remarque" subtitle={`Écran actuel : ${pageLabel(location.pathname)}`} labelledBy="remarque-title"
        actions={(
          <>
            <Button variant="ghost" onClick={close} disabled={sending}>Annuler</Button>
            <Button onClick={submit} loading={sending} disabled={!texte.trim()}>Envoyer</Button>
          </>
        )}>
        <form onSubmit={submit}>
          <Field label="Quoi dire ?" hint="Bug, idée, truc bizarre — en une phrase ou deux, c'est très bien.">
            {(id) => (
              <Textarea id={id} rows={4} autoFocus value={texte} onChange={(e) => setTexte(e.target.value)}
                placeholder="Ex. : je ne comprends pas où retrouver une cliente déjà enregistrée…" />
            )}
          </Field>
        </form>
      </Modal>
    </>
  );
}
