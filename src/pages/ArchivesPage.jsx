import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pullArchives, pullRelances, pullEnvoisEnAttente, modifierRelance } from '../lib/sheetsSync';
import { normalize } from '../lib/format';
import { formatDate } from '../lib/dates';
import { toast, confirmDialog } from '../store/useUI';
import { useStudio } from '../store/useStudio';
import { useCurrentUser } from '../store/useStore';
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, Notice, SearchBar, SkeletonCard, Textarea } from '../components/ui';
import DossierClientPanel from '../components/archives/DossierClientPanel';

const TYPE_LABELS = { peau: 'Peau', cheveux: 'Cheveux', lifestyle: 'Lifestyle', 'formulaire-pre-rdv': 'Demande pré-rdv' };
const MOTIF_LABELS = { cheveux: 'Cheveux', peau: 'Peau', 'les-deux': 'Cheveux et peau' };
const typeLabel = (t) => TYPE_LABELS[String(t || '').toLowerCase()] || t || 'Document';
const fullName = (c) => `${c.prenom || ''} ${c.nom || ''}`.trim();

function dateLabel(iso) {
  if (!iso) return '—';
  try { return formatDate(String(iso).slice(0, 10)); } catch { return String(iso); }
}

/** Regroupe une liste par client_id, triée du plus récent au plus ancien selon `dateKey`. */
function groupByClient(list, dateKey) {
  const map = new Map();
  list.forEach((x) => {
    if (!x || !x.client_id) return;
    if (!map.has(x.client_id)) map.set(x.client_id, []);
    map.get(x.client_id).push(x);
  });
  map.forEach((l) => l.sort((a, b) => String(b[dateKey] || '').localeCompare(String(a[dateKey] || ''))));
  return map;
}

export default function ArchivesPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [state, setState] = useState({ status: 'loading', clients: [], documents: [], relances: [], pendingEnvois: [], error: '' });
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null); // relance en cours d'édition, ou null

  /** Ouvre la fiche de cette cliente (depuis « Demandes pré-rdv ») et scrolle vers le panneau détail. */
  const voirFiche = (clientId) => {
    setSelectedId(clientId);
    document.getElementById('archives-detail')?.scrollIntoView({ behavior: 'smooth' });
  };

  /** Démarre un diagnostic pré-rempli (prénom/nom/email) depuis une demande pré-rdv. */
  const demarrerDepuisDemande = async (type, client) => {
    if (!client) { toast('Cliente introuvable pour cette demande.', { type: 'error' }); return; }
    if (useStudio.getState().doc) {
      const ok = await confirmDialog({
        title: 'Démarrer ce diagnostic ?',
        message: 'Le document en cours dans le compositeur (réponses, routine…) sera remplacé. S’il a déjà été archivé, il reste dans Archives.',
        confirmLabel: 'Démarrer',
        danger: true,
      });
      if (!ok) return;
    }
    useStudio.getState().start(type, user?.prenom || '');
    useStudio.getState().setClient({ id: client.id, prenom: client.prenom, nom: client.nom, email: client.email || '' });
    navigate('/');
  };

  /** Rouvre un document archivé dans le compositeur (Studio), en confirmant si un brouillon est en cours. */
  const reprendre = async (d) => {
    if (useStudio.getState().doc) {
      const ok = await confirmDialog({
        title: 'Reprendre ce document ?',
        message: 'Le document en cours dans le compositeur (réponses, routine…) sera remplacé. S’il a déjà été archivé, il reste dans Archives.',
        confirmLabel: 'Reprendre',
        danger: true,
      });
      if (!ok) return;
    }
    useStudio.getState().loadDoc(d.composerDoc);
    navigate('/');
  };

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    const [archives, relancesRes, pendingRes] = await Promise.all([pullArchives(), pullRelances(), pullEnvoisEnAttente()]);
    if (archives.ok) {
      setState({
        status: 'ready', clients: archives.clients, documents: archives.documents,
        relances: relancesRes.ok ? relancesRes.relances : [], pendingEnvois: pendingRes.ok ? pendingRes.envois : [], error: '',
      });
    } else {
      setState({ status: 'error', clients: [], documents: [], relances: [], pendingEnvois: [], error: archives.error || 'Erreur inconnue' });
    }
  }, []);

  /** Recharge juste relances + envois en attente (après édition), sans re-tirer tous les documents. */
  const reloadMails = useCallback(async () => {
    const [relancesRes, pendingRes] = await Promise.all([pullRelances(), pullEnvoisEnAttente()]);
    setState((s) => ({
      ...s,
      relances: relancesRes.ok ? relancesRes.relances : s.relances,
      pendingEnvois: pendingRes.ok ? pendingRes.envois : s.pendingEnvois,
    }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const { clients, documents, relances, pendingEnvois, status, error } = state;

  const docsByClient = useMemo(() => groupByClient(documents, 'date'), [documents]);
  const relancesByClient = useMemo(() => groupByClient(relances, 'date_relance_prevue'), [relances]);
  const pendingByClient = useMemo(() => groupByClient(pendingEnvois, 'date_creation'), [pendingEnvois]);

  // Demandes pré-rdv : documents à part (type 'formulaire-pre-rdv'), pas des diagnostics —
  // invisibles sinon tant qu'on n'ouvre pas la fiche de la bonne cliente une par une.
  const demandesPreRdv = useMemo(() => {
    const clientsById = new Map(clients.map((c) => [c.id, c]));
    return documents
      .filter((d) => d && d.type === 'formulaire-pre-rdv')
      .map((d) => ({ ...d, client: clientsById.get(d.client_id) }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [documents, clients]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return clients
      .filter((c) => !q || normalize(fullName(c)).includes(q) || normalize(`${c.nom} ${c.prenom}`).includes(q) || normalize(c.email).includes(q))
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr', { sensitivity: 'base' }));
  }, [clients, search]);

  const selected = clients.find((c) => c.id === selectedId) || null;
  const selectedDocs = selected ? docsByClient.get(selected.id) || [] : [];
  const selectedRelances = selected ? relancesByClient.get(selected.id) || [] : [];
  const selectedPending = selected ? pendingByClient.get(selected.id) || [] : [];

  // Mails envoyés : envoi initial (documents archivés, déjà listés ci-dessus) + relances déjà parties.
  const mailsEnvoyes = [
    ...selectedDocs.map((d) => ({ id: d.id, date: d.date, auteur: d.auteur, label: `${typeLabel(d.type)} (envoi initial)` })),
    ...selectedRelances.filter((r) => r.statut === 'envoyee').map((r) => ({ id: r.id, date: r.date_relance_prevue, auteur: r.auteur, label: 'Relance' })),
  ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  // Mails à venir : relances programmées (éditables jusqu'à J-1) + envois en attente de validation (option C).
  const relancesAVenir = selectedRelances.filter((r) => r.statut === 'en_attente').sort((a, b) => String(a.date_relance_prevue || '').localeCompare(String(b.date_relance_prevue || '')));
  const pendingAVenir = selectedPending.filter((p) => p.statut === 'en_attente');

  const openEdit = (r) => setEditing({ id: r.id, sujet: r.sujet || '', corps: r.corps || '', prenom: r.prenom });
  const closeEdit = () => setEditing(null);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Google Drive</div>
          <h1>Archives</h1>
          <p className="lead">
            {status === 'ready' ? `${clients.length} cliente${clients.length > 1 ? 's' : ''} · ${documents.length} document${documents.length > 1 ? 's' : ''}` : 'Fiches conseil archivées, par cliente.'}
          </p>
        </div>
        <div className="page-actions">
          <div style={{ width: 240 }}><SearchBar value={search} onChange={setSearch} placeholder="Nom, prénom, e-mail…" /></div>
          <Button variant="soft" icon="fa-solid fa-rotate" onClick={load} loading={status === 'loading'}>Actualiser</Button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="grid-auto"><SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
      )}

      {status === 'error' && (
        <Notice tone="amber" icon="fa-solid fa-triangle-exclamation">
          <strong>Archives indisponibles.</strong> {error}
          <div className="mt-1"><Button size="sm" variant="soft" icon="fa-solid fa-rotate" onClick={load}>Réessayer</Button></div>
        </Notice>
      )}

      {status === 'ready' && clients.length === 0 && (
        <EmptyState icon="fa-regular fa-folder-open" title="Aucune cliente archivée pour l’instant" text="Les fiches conseil archivées apparaîtront ici, classées par cliente." />
      )}

      {status === 'ready' && demandesPreRdv.length > 0 && (
        <div className="card mb-3">
          <div className="card-header"><div><div className="eyebrow">À traiter</div><h3>Demandes pré-rdv reçues ({demandesPreRdv.length})</h3></div></div>
          <div className="stack">
            {demandesPreRdv.map((d) => {
              const motif = d.composerDoc?.motif;
              return (
                <div key={d.id} className="subtle-card flex between wrap" style={{ gap: '.5rem' }}>
                  <div className="grow">
                    <div className="semibold">{d.client ? fullName(d.client) : 'Cliente inconnue'}</div>
                    <div className="small muted">
                      Reçue le {dateLabel(d.date)}
                      {d.composerDoc?.dateSouhaitee ? ` · RDV souhaité le ${dateLabel(d.composerDoc.dateSouhaitee)}` : ''}
                      {motif ? ` · ${MOTIF_LABELS[motif] || motif}` : ''}
                    </div>
                  </div>
                  <div className="row gap-2">
                    <Button size="sm" variant="ghost" icon="fa-solid fa-arrow-right" onClick={() => voirFiche(d.client?.id)} disabled={!d.client}>Voir la fiche</Button>
                    {(motif === 'cheveux' || motif === 'peau') && (
                      <Button size="sm" variant="soft" icon="fa-solid fa-wand-magic-sparkles" onClick={() => demarrerDepuisDemande(motif, d.client)} disabled={!d.client}>
                        Démarrer le diagnostic
                      </Button>
                    )}
                    {motif === 'les-deux' && (
                      <>
                        <Button size="sm" variant="soft" onClick={() => demarrerDepuisDemande('cheveux', d.client)} disabled={!d.client}>Diag. cheveux</Button>
                        <Button size="sm" variant="soft" onClick={() => demarrerDepuisDemande('peau', d.client)} disabled={!d.client}>Diag. peau</Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {status === 'ready' && clients.length > 0 && (
        <div className="grid-side">
          <div className="stack">
            {filtered.length === 0 && <EmptyState compact icon="fa-solid fa-magnifying-glass" title="Aucun résultat" text="Aucune cliente ne correspond à cette recherche." />}
            {filtered.map((c) => {
              const n = (docsByClient.get(c.id) || []).length;
              const aMailEnAttente = (pendingByClient.get(c.id) || []).length > 0;
              const aRelanceAVenir = (relancesByClient.get(c.id) || []).some((r) => r.statut === 'en_attente');
              return (
                <div
                  key={c.id}
                  className="card interactive flex between"
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedId === c.id}
                  style={selectedId === c.id ? { borderColor: 'var(--primary)' } : undefined}
                  onClick={() => setSelectedId(c.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(c.id); } }}
                >
                  <div className="flex grow">
                    <Avatar person={c} />
                    <div className="grow">
                      <div className="semibold truncate">{fullName(c)}</div>
                      {c.email && <div className="small muted truncate">{c.email}</div>}
                    </div>
                  </div>
                  <div className="flex" style={{ gap: '.4rem' }}>
                    {aMailEnAttente ? (
                      <Badge tone="gold" dot title="Mail en attente de validation" />
                    ) : aRelanceAVenir ? (
                      <Badge tone="clay" dot title="Relance programmée" />
                    ) : null}
                    <span className="count-pill" title="Documents">{n}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="card" id="archives-detail" aria-live="polite">
            {!selected ? (
              <EmptyState compact icon="fa-regular fa-file-lines" title="Sélectionnez une cliente" text="Ses documents s’afficheront ici." />
            ) : (
              <div className="stack">
                <div className="flex between">
                  <div className="flex">
                    <Avatar person={selected} size="lg" />
                    <div>
                      <h3>{fullName(selected)}</h3>
                      {selected.email && <div className="small muted">{selected.email}</div>}
                    </div>
                  </div>
                </div>
                {(pendingAVenir.length > 0 || relancesAVenir.length > 0) && (
                  <div className="flex wrap" style={{ gap: '.5rem' }}>
                    {pendingAVenir.length > 0 && (
                      <Badge tone="gold" title="Mail archivé, en attente de votre validation dans Réglages">Mail en attente de validation</Badge>
                    )}
                    {relancesAVenir.length > 0 && (
                      <Badge tone="clay" title="Date de la prochaine relance automatique J+14">Prochaine relance : {dateLabel(relancesAVenir[0].date_relance_prevue)}</Badge>
                    )}
                  </div>
                )}
                {selected.folderUrl && (
                  <a className="btn btn-soft btn-sm" href={selected.folderUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-google-drive" aria-hidden="true" /> Ouvrir le dossier Drive
                  </a>
                )}
                <DossierClientPanel client={selected} onSaved={load} />
                <div className="divider" />
                {selectedDocs.length === 0 && <p className="small muted">Aucun document pour cette cliente.</p>}
                {selectedDocs.map((d) => (
                  <div key={d.id} className="subtle-card flex between">
                    <div className="grow">
                      <div className="flex wrap" style={{ gap: '.5rem' }}>
                        <Badge tone="sage">{typeLabel(d.type)}</Badge>
                        <span className="small semibold">{dateLabel(d.date)}</span>
                      </div>
                      <div className="small muted truncate" title={d.nom}>{d.auteur ? `par ${d.auteur}` : d.nom}</div>
                    </div>
                    <div className="row gap-2">
                      {d.composerDoc && (
                        <Button size="sm" variant="soft" icon="fa-solid fa-pen-to-square" onClick={() => reprendre(d)}>Reprendre pour modifier</Button>
                      )}
                      {d.url && (
                        <a className="btn btn-sm" href={d.url} target="_blank" rel="noopener noreferrer">
                          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                <div className="divider" />
                <h4>Mails envoyés</h4>
                {mailsEnvoyes.length === 0 && <p className="small muted">Aucun mail envoyé pour l’instant.</p>}
                {mailsEnvoyes.map((m) => (
                  <div key={m.id} className="subtle-card flex between">
                    <div className="grow">
                      <div className="flex wrap" style={{ gap: '.5rem' }}>
                        <Badge tone="sage">{m.label}</Badge>
                        <span className="small semibold">{dateLabel(m.date)}</span>
                      </div>
                      <div className="small muted truncate">{m.auteur ? `par ${m.auteur}` : '—'}</div>
                    </div>
                  </div>
                ))}

                <div className="divider" />
                <h4>Mails à venir</h4>
                {relancesAVenir.length === 0 && pendingAVenir.length === 0 && <p className="small muted">Rien de programmé pour l’instant.</p>}
                {relancesAVenir.map((r) => (
                  <div key={r.id} className="subtle-card flex between">
                    <div className="grow">
                      <div className="flex wrap" style={{ gap: '.5rem' }}>
                        <Badge tone="clay">Relance</Badge>
                        <span className="small semibold">{dateLabel(r.date_relance_prevue)}</span>
                        {r.modifie && <Badge tone="ink" outline>Personnalisée</Badge>}
                      </div>
                      <div className="small muted truncate">{r.auteur ? `programmée par ${r.auteur}` : 'Programmée automatiquement'}</div>
                      <div className="small muted truncate" title={r.sujet}>{r.sujet}</div>
                    </div>
                    {r.editable ? (
                      <Button size="sm" variant="soft" icon="fa-solid fa-pen" onClick={() => openEdit(r)}>Modifier</Button>
                    ) : (
                      <Badge tone="amber" outline>Part aujourd’hui — plus modifiable</Badge>
                    )}
                  </div>
                ))}
                {pendingAVenir.map((p) => (
                  <div key={p.id} className="subtle-card flex between">
                    <div className="grow">
                      <div className="flex wrap" style={{ gap: '.5rem' }}>
                        <Badge tone="gold">En attente de validation</Badge>
                      </div>
                      <div className="small muted truncate">{p.prenom ? `pour ${p.prenom}` : ''}</div>
                      <div className="small muted truncate" title={p.sujet}>{p.sujet}</div>
                    </div>
                    <span className="small muted">À valider dans Réglages</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <EditRelanceModal editing={editing} onClose={closeEdit} onSaved={reloadMails} />
    </>
  );
}

/** Modale d'édition d'une relance à venir : sujet + corps, pré-remplis du brouillon par défaut. */
function EditRelanceModal({ editing, onClose, onSaved }) {
  const [draft, setDraft] = useState({ sujet: '', corps: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (editing) setDraft({ sujet: editing.sujet, corps: editing.corps }); }, [editing]);

  const save = async () => {
    setSaving(true);
    const res = await modifierRelance(editing.id, draft);
    setSaving(false);
    if (res.ok) {
      toast('Relance mise à jour.');
      onSaved();
      onClose();
    } else {
      toast(`Modification impossible : ${res.error || 'erreur inconnue'}`, { type: 'error' });
    }
  };

  return (
    <Modal
      open={!!editing}
      onClose={onClose}
      title={editing ? `Modifier la relance — ${editing.prenom || ''}` : ''}
      subtitle="Texte brut uniquement (pas de mise en forme) — laissez tel quel si le message par défaut convient."
      actions={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button variant="primary" icon="fa-solid fa-check" loading={saving} disabled={saving} onClick={save}>Enregistrer</Button></>}
    >
      {editing && (
        <div className="stack">
          <Field label="Sujet">{(id) => <Input id={id} value={draft.sujet} onChange={(e) => setDraft((d) => ({ ...d, sujet: e.target.value }))} autoFocus />}</Field>
          <Field label="Corps du mail" hint="Texte brut — aucune mise en forme, aucun logo.">
            {(id) => <Textarea id={id} rows={12} value={draft.corps} onChange={(e) => setDraft((d) => ({ ...d, corps: e.target.value }))} />}
          </Field>
        </div>
      )}
    </Modal>
  );
}
