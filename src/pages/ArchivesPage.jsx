import { useCallback, useEffect, useMemo, useState } from 'react';
import { pullArchives } from '../lib/sheetsSync';
import { normalize } from '../lib/format';
import { formatDate } from '../lib/dates';
import { Avatar, Badge, Button, EmptyState, Notice, SearchBar, SkeletonCard } from '../components/ui';

const TYPE_LABELS = { peau: 'Peau', cheveux: 'Cheveux', lifestyle: 'Lifestyle' };
const typeLabel = (t) => TYPE_LABELS[String(t || '').toLowerCase()] || t || 'Document';
const fullName = (c) => `${c.prenom || ''} ${c.nom || ''}`.trim();

function dateLabel(iso) {
  if (!iso) return '—';
  try { return formatDate(String(iso).slice(0, 10)); } catch { return String(iso); }
}

export default function ArchivesPage() {
  const [state, setState] = useState({ status: 'loading', clients: [], documents: [], error: '' });
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    const res = await pullArchives();
    if (res.ok) setState({ status: 'ready', clients: res.clients, documents: res.documents, error: '' });
    else setState({ status: 'error', clients: [], documents: [], error: res.error || 'Erreur inconnue' });
  }, []);

  useEffect(() => { load(); }, [load]);

  const { clients, documents, status, error } = state;

  const docsByClient = useMemo(() => {
    const map = new Map();
    documents.forEach((d) => {
      if (!map.has(d.client_id)) map.set(d.client_id, []);
      map.get(d.client_id).push(d);
    });
    map.forEach((list) => list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))));
    return map;
  }, [documents]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return clients
      .filter((c) => !q || normalize(fullName(c)).includes(q) || normalize(`${c.nom} ${c.prenom}`).includes(q) || normalize(c.email).includes(q))
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr', { sensitivity: 'base' }));
  }, [clients, search]);

  const selected = clients.find((c) => c.id === selectedId) || null;
  const selectedDocs = selected ? docsByClient.get(selected.id) || [] : [];

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

      {status === 'ready' && clients.length > 0 && (
        <div className="grid-side">
          <div className="stack">
            {filtered.length === 0 && <EmptyState compact icon="fa-solid fa-magnifying-glass" title="Aucun résultat" text="Aucune cliente ne correspond à cette recherche." />}
            {filtered.map((c) => {
              const n = (docsByClient.get(c.id) || []).length;
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
                  <span className="count-pill" title="Documents">{n}</span>
                </div>
              );
            })}
          </div>

          <aside className="card" aria-live="polite">
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
                {selected.folderUrl && (
                  <a className="btn btn-soft btn-sm" href={selected.folderUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-google-drive" aria-hidden="true" /> Ouvrir le dossier Drive
                  </a>
                )}
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
                    {d.url && (
                      <a className="btn btn-sm" href={d.url} target="_blank" rel="noopener noreferrer">
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Ouvrir
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
