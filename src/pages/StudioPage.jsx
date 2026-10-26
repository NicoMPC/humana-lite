import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useStore, useCurrentUser } from '../store/useStore';
import { useStudio } from '../store/useStudio';
import { toast, confirmDialog } from '../store/useUI';
import { DIAG_TYPES, THEME_SWATCHES } from '../data/constants';
import { QUESTIONS_DEMO } from '../data/questions';
import { renderPdf, archivePdf, archiveEtEnvoyer } from '../lib/studioBridge';
import { buildEmail, gmailComposeUrl } from '../lib/email';
import { Button, Field, Input, Modal, Notice, Segmented, Select } from '../components/ui';
import { QuizStep } from '../components/diagnostic/QuizStep';
import { BlockBox } from '../components/studio/BlockBox';
import { PdfPreview } from '../components/studio/PdfPreview';
import { ClientPicker } from '../components/studio/ClientPicker';

const TYPE_CARDS = [
  { key: 'cheveux', label: 'Cheveux', text: 'Questionnaire capillaire, routine, conseils.', icon: 'fa-solid fa-wind' },
  { key: 'peau', label: 'Peau', text: 'Questionnaire visage, routine, conseils.', icon: 'fa-solid fa-spa' },
];
const STEPS = ['Choix', 'Rendez-vous', 'Composition'];

export default function StudioPage() {
  const { step, doc } = useStudio(useShallow((s) => ({ step: s.step, doc: s.doc })));
  const actions = useStudio.getState();

  const restart = async () => {
    const ok = await confirmDialog({ title: 'Recommencer un nouveau document ?', message: 'Le document en cours (réponses, routine…) sera effacé. S’il a déjà été archivé, il reste dans Archives.', confirmLabel: 'Recommencer', danger: true });
    if (ok) actions.reset();
  };

  return (
    <div className="studio">
      <div className="studio-head">
        <div>
          <div className="eyebrow">Nouveau document</div>
          <h1>{doc && step > 0 ? `${DIAG_TYPES[doc.type].label}${doc.client.prenom || doc.client.nom ? ` · ${doc.client.prenom} ${doc.client.nom}`.trimEnd() : ''}` : 'Que souhaitez-vous préparer ?'}</h1>
        </div>
        <ol className="wizard-steps" aria-label="Étapes">
          {STEPS.map((label, i) => (
            <li key={label} className={`${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}>
              <button type="button" disabled={!doc || i >= step} onClick={() => actions.setStep(i)}>
                <span className="num">{i < step ? <i className="fa-solid fa-check" /> : i + 1}</span>{label}
              </button>
            </li>
          ))}
        </ol>
        {doc && step > 0 && <Button variant="ghost" size="sm" icon="fa-solid fa-rotate-left" onClick={restart}>Recommencer</Button>}
      </div>

      {(!doc || step === 0) && <TypeChoice />}
      {doc && step === 1 && <RdvStep doc={doc} />}
      {doc && step === 2 && <ComposeStep doc={doc} />}
    </div>
  );
}

/* ---------------- 0 · Choix ---------------- */
function TypeChoice() {
  const user = useCurrentUser();
  const { doc, start, setStep } = useStudio.getState();
  const pick = (type) => {
    // Même type que le brouillon en cours : on le reprend ; sinon nouveau brouillon.
    if (doc && doc.type === type) setStep(1);
    else start(type, user?.prenom || '');
  };
  return (
    <>
      {doc && (
        <Notice icon="fa-regular fa-clock" className="mb-3">
          Un document {DIAG_TYPES[doc.type].label.toLowerCase()} est en cours{doc.client.prenom || doc.client.nom ? ` (${doc.client.prenom} ${doc.client.nom})` : ''}. Choisir le même type le reprend ; un autre type repart de zéro.
        </Notice>
      )}
      <div className="type-cards stagger">
        {TYPE_CARDS.map((c) => (
          <button key={c.key} type="button" className="type-card" onClick={() => pick(c.key)}>
            <span className="type-icon"><i className={c.icon} /></span>
            <b>{c.label}</b>
            <span className="muted">{c.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------- 1 · Questions (gauche) + fiche RDV (droite) ---------------- */
function RdvStep({ doc }) {
  const actions = useStudio.getState();
  const users = useStore(useShallow((s) => s.users.filter((u) => u.actif !== false)));
  const questions = QUESTIONS_DEMO[doc.type];
  const clientOk = doc.client.prenom.trim() && doc.client.nom.trim();
  const auteurs = users.some((u) => u.prenom === doc.meta.auteur) ? users : [...users, { id: 'x', prenom: doc.meta.auteur }];

  const fiche = (
    <div className="card pane-card">
      <div className="card-header"><div><div className="eyebrow">Fiche rendez-vous</div><h3>Cliente et contexte</h3></div></div>
      <div className="stack">
        <ClientPicker value={doc.client} onChange={actions.setClient} />
        <div className="form-row">
          <Field label="Date">{(id) => <Input id={id} type="date" value={doc.meta.date} onChange={(e) => actions.setMeta({ date: e.target.value })} />}</Field>
          <Field label="Fait par">
            {(id) => <Select id={id} value={doc.meta.auteur} onChange={(e) => actions.setMeta({ auteur: e.target.value })}>{auteurs.map((u) => <option key={u.id} value={u.prenom}>{u.prenom}</option>)}</Select>}
          </Field>
        </div>
        <Field label="Lieu">
          {() => <Segmented value={doc.meta.lieu} onChange={(lieu) => actions.setMeta({ lieu })} options={[{ value: 'boutique', label: 'Boutique', icon: 'fa-solid fa-store' }, { value: 'visio', label: 'Visio', icon: 'fa-solid fa-video' }]} />}
        </Field>
      </div>
      <div className="step-nav">
        <Button variant="ghost" icon="fa-solid fa-arrow-left" onClick={() => actions.setStep(0)}>Retour</Button>
        <Button variant="primary" iconRight="fa-solid fa-arrow-right" disabled={!clientOk} onClick={() => actions.setStep(2)} title={clientOk ? '' : 'Prénom et nom de la cliente requis'}>
          Composer le document
        </Button>
      </div>
      {!clientOk && <p className="xs muted mt-1">Prénom et nom requis pour archiver le document.</p>}
    </div>
  );

  if (!questions) return <div className="studio-single">{fiche}</div>; // lifestyle : pas de questionnaire
  return (
    <div className="studio-grid">
      <div className="pane">
        <div className="eyebrow mb-1">Questionnaire</div>
        <QuizStep questions={questions} reponses={doc.reponses} onAnswer={actions.setAnswer} onDone={() => document.getElementById('rdv-fiche')?.scrollIntoView({ behavior: 'smooth' })} doneLabel="Passer à la fiche" />
      </div>
      <div className="pane" id="rdv-fiche">{fiche}</div>
    </div>
  );
}

/* ---------------- 2 · Composition + aperçu ---------------- */
function downloadBlob(blob, fileName) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function ComposeStep({ doc }) {
  const navigate = useNavigate();
  const actions = useStudio.getState();
  const tutoiement = useStudio((s) => s.tutoiement);
  const users = useStore(useShallow((s) => s.users.filter((u) => u.actif !== false)));
  const [busy, setBusy] = useState(null); // 'send' | 'archive'
  const [result, setResult] = useState(null);
  const auteurs = users.some((u) => u.prenom === doc.meta.auteur) ? users : [...users, { id: 'x', prenom: doc.meta.auteur }];
  const clientOk = doc.client.prenom.trim() && doc.client.nom.trim();

  const run = async (mode) => {
    if (!clientOk) { toast('Prénom et nom de la cliente requis.', { type: 'warning' }); actions.setStep(1); return; }
    setBusy(mode);
    try {
      const pdf = await renderPdf(doc);
      const meta = { date: doc.meta.date, auteur: doc.meta.auteur, lieu: doc.meta.lieu };

      if (mode === 'archive') {
        let res;
        try {
          res = await archivePdf({ client: doc.client, docType: doc.type, fileName: pdf.fileName, dataUrl: pdf.dataUrl, meta, composerDoc: doc });
        } catch (e) {
          res = { ok: false, error: String(e) };
        }
        const archiveOk = !!res?.ok;
        if (archiveOk) {
          if (res.clientId && res.clientId !== doc.client.id) actions.setClient({ ...doc.client, id: res.clientId });
          toast(res.created ? 'Archivé — nouveau dossier créé pour la cliente.' : 'Archivé dans le dossier de la cliente.', { duration: 9000, action: res.fileUrl ? { label: 'Ouvrir le PDF', onClick: () => window.open(res.fileUrl, '_blank') } : undefined });
        } else {
          downloadBlob(pdf.blob, pdf.fileName); // ne jamais perdre le document
          toast(`Archivage impossible : le PDF a été téléchargé sur cet ordinateur (${pdf.fileName}). Gardez-le, puis réessayez plus tard.`, { type: 'error', duration: 15000 });
        }
        URL.revokeObjectURL(pdf.url);
        setResult({ mode, archiveOk });
        return;
      }

      // mode === 'send' : envoi automatique par défaut (archive + e-mail en un seul
      // aller-retour serveur), avec le PDF déjà joint côté backend ; repli manuel
      // (Gmail pré-rempli, pièce jointe à glisser) si le serveur échoue — jamais
      // d'échec silencieux, c'est une promesse du devis.
      const emailDraft = buildEmail({ doc, fileName: pdf.fileName, tutoiement, archiveOk: true, autoAttache: true });
      let res;
      try {
        res = await archiveEtEnvoyer({
          client: doc.client, docType: doc.type, fileName: pdf.fileName, dataUrl: pdf.dataUrl, meta,
          email: { to: emailDraft.to, sujet: emailDraft.sujet, corps: emailDraft.corps },
          boutique: { nom: doc.boutique?.nom }, tutoiement, composerDoc: doc,
        });
      } catch (e) {
        res = { ok: false, error: String(e) };
      }
      const archiveOk = !!res?.ok;
      if (archiveOk && res.clientId && res.clientId !== doc.client.id) actions.setClient({ ...doc.client, id: res.clientId });
      if (!archiveOk) downloadBlob(pdf.blob, pdf.fileName); // ne jamais perdre le document
      URL.revokeObjectURL(pdf.url);

      if (archiveOk && res.envoiStatut === 'envoye') {
        toast(`E-mail envoyé automatiquement à ${emailDraft.to || 'la cliente'}.`, { duration: 9000, action: res.fileUrl ? { label: 'Ouvrir le PDF', onClick: () => window.open(res.fileUrl, '_blank') } : undefined });
        setResult({ mode, archiveOk, auto: true, sent: true, fileUrl: res.fileUrl, folderUrl: res.folderUrl, fileName: pdf.fileName });
      } else if (archiveOk && res.envoiStatut === 'en_attente') {
        toast('Archivé — e-mail en attente de votre validation (Réglages → Envois en attente).', { duration: 11000 });
        setResult({ mode, archiveOk, auto: true, pending: true, fileUrl: res.fileUrl, folderUrl: res.folderUrl, fileName: pdf.fileName });
      } else {
        // Envoi automatique indisponible (serveur non configuré, erreur réseau…) : repli manuel.
        const mailUrl = gmailComposeUrl(buildEmail({ doc, fileUrl: res?.fileUrl, folderUrl: res?.folderUrl, fileName: pdf.fileName, tutoiement, archiveOk }));
        window.open(mailUrl, '_blank');
        toast(`Envoi automatique indisponible${res?.error ? ` (${res.error})` : ''} : Gmail ouvert pour un envoi manuel.`, { type: 'warning', duration: 13000 });
        setResult({ mode, archiveOk, auto: false, mailUrl, fileUrl: res?.fileUrl, folderUrl: res?.folderUrl, fileName: pdf.fileName, error: res?.error });
      }
    } catch (e) {
      console.error(e);
      toast(`Génération du PDF impossible : ${e?.message || e}`, { type: 'error', duration: 10000 });
    } finally {
      setBusy(null);
    }
  };

  const restartAfter = () => { actions.reset(); setResult(null); navigate('/'); };

  return (
    <div className="studio-grid compose">
      <div className="pane">
        <div className="card pane-card mb-3">
          <div className="compose-meta">
            <div>
              <div className="xs muted">Préparée pour</div>
              <div className="semibold">{doc.client.prenom} {doc.client.nom}</div>
              {doc.client.email && <div className="xs muted">{doc.client.email}</div>}
            </div>
            <Button variant="ghost" size="sm" icon="fa-solid fa-pen" onClick={() => actions.setStep(1)}>Rendez-vous</Button>
          </div>
          <div className="form-row mt-2">
            <Field label="Date">{(id) => <Input id={id} size="sm" type="date" value={doc.meta.date} onChange={(e) => actions.setMeta({ date: e.target.value })} />}</Field>
            <Field label="Fait par">{(id) => <Select id={id} size="sm" value={doc.meta.auteur} onChange={(e) => actions.setMeta({ auteur: e.target.value })}>{auteurs.map((u) => <option key={u.id} value={u.prenom}>{u.prenom}</option>)}</Select>}</Field>
          </div>
          <div className="theme-picker mt-2" role="radiogroup" aria-label="Thème du PDF">
            <span className="xs muted">Thème</span>
            {Object.entries(THEME_SWATCHES).map(([key, t]) => (
              <button key={key} type="button" role="radio" aria-checked={doc.theme === key} className={`theme-dot ${doc.theme === key ? 'is-on' : ''}`} onClick={() => actions.setTheme(key)} title={t.label}>
                <span className="swatch" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="block-list">
          {doc.blocks.map((b, i) => <BlockBox key={b.id} block={b} index={i} count={doc.blocks.length} doc={doc} actions={actions} />)}
        </div>

        <div className="action-bar">
          <Button variant="ghost" icon="fa-solid fa-arrow-left" onClick={() => actions.setStep(1)}>Retour</Button>
          <span className="grow" />
          <Segmented size="sm" value={tutoiement ? 'tu' : 'vous'} onChange={(v) => actions.setTutoiement(v === 'tu')} options={[{ value: 'vous', label: 'Vous' }, { value: 'tu', label: 'Tu' }]} />
          <Button variant="soft" icon="fa-solid fa-box-archive" loading={busy === 'archive'} disabled={!!busy} onClick={() => run('archive')}>Archiver seulement</Button>
          <Button variant="primary" icon="fa-regular fa-paper-plane" loading={busy === 'send'} disabled={!!busy} onClick={() => run('send')}>Envoyer</Button>
        </div>
      </div>

      <div className="pane pane-sticky"><PdfPreview doc={doc} /></div>

      <Modal
        open={!!result}
        onClose={() => setResult(null)}
        title={
          !result?.archiveOk ? 'Archivage impossible'
          : result.mode === 'archive' ? 'Document archivé'
          : result.sent ? 'E-mail envoyé'
          : result.pending ? 'En attente de validation'
          : 'Envoi manuel'
        }
        actions={<><Button variant="ghost" onClick={() => setResult(null)}>Continuer à modifier</Button><Button variant="primary" icon="fa-solid fa-plus" onClick={restartAfter}>Nouveau document</Button></>}
      >
        <div className="stack">
          {result && !result.archiveOk && (
            <Notice tone="amber" icon="fa-solid fa-triangle-exclamation">
              Le document n’a pas pu être archivé dans le dossier de la cliente{result.error ? ` (${result.error})` : ''}. Le PDF a été <strong>téléchargé sur cet ordinateur</strong> (dossier Téléchargements) : rien n’est perdu.
            </Notice>
          )}
          {result?.mode === 'send' && result.sent && (
            <p className="small">Le PDF est parti par e-mail à la cliente, pièce jointe comprise — rien à faire de plus.</p>
          )}
          {result?.mode === 'send' && result.pending && (
            <Notice tone="sage" icon="fa-regular fa-clock">
              Document archivé. L’e-mail attend votre validation dans <strong>Réglages → Envois en attente</strong> avant de partir (option « je valide chaque envoi »).
            </Notice>
          )}
          {result?.mode === 'send' && result.auto === false && (
            <>
              <p className="small">Envoi automatique indisponible{result.error ? ` (${result.error})` : ''}. Gmail s’est ouvert dans un nouvel onglet. Glissez le PDF <strong>{result.fileName}</strong> {result.archiveOk ? 'depuis le dossier archivé' : 'depuis vos Téléchargements'} en pièce jointe.</p>
              <a className="btn btn-accent" href={result.mailUrl} target="_blank" rel="noreferrer"><i className="fa-regular fa-envelope" /> Rouvrir Gmail</a>
            </>
          )}
          {result?.archiveOk && (result.fileUrl || result.folderUrl) && (
            <div className="row gap-2">
              {result.fileUrl && <a className="btn" href={result.fileUrl} target="_blank" rel="noreferrer"><i className="fa-regular fa-file-pdf" /> Ouvrir le PDF</a>}
              {result.folderUrl && <a className="btn" href={result.folderUrl} target="_blank" rel="noreferrer"><i className="fa-regular fa-folder-open" /> Dossier de la cliente</a>}
            </div>
          )}
          {result?.archiveOk && result.mode === 'archive' && !result.fileUrl && !result.folderUrl && <p className="small">Le document est bien archivé.</p>}
        </div>
      </Modal>
    </div>
  );
}
