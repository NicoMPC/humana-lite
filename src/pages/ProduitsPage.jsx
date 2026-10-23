import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/constants';
import { normalize } from '../lib/format';
import { toast, confirmDialog } from '../store/useUI';
import { Button, Dropdown, EmptyState, Field, Input, Modal, SearchBar, Select, Switch } from '../components/ui';
import { PlanityImportModal, lastImportLabel } from '../components/produits/PlanityImportModal';

export default function ProduitsPage() {
  const produits = useStore((s) => s.produits);
  const dernierImport = useStore((s) => s.settings.stock?.dernierImport);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null); // null | {} (nouveau) | produit
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return [...produits]
      .filter((p) => !q || normalize(p.nom).includes(q) || normalize(p.reference).includes(q))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }, [produits, search]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Catalogue Hu’mana</div>
          <h1>Produits</h1>
          <p className="lead">{produits.length} produit{produits.length > 1 ? 's' : ''} · {lastImportLabel(dernierImport)}</p>
        </div>
        <div className="page-actions">
          <div style={{ width: 220 }}><SearchBar value={search} onChange={setSearch} placeholder="Nom ou référence…" /></div>
          <Button variant="soft" icon="fa-solid fa-file-arrow-up" onClick={() => setImportOpen(true)}>Importer CSV / Planity</Button>
          <Button variant="primary" icon="fa-solid fa-plus" onClick={() => setForm({})}>Ajouter un produit</Button>
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState icon="fa-solid fa-box-open" title={produits.length ? 'Aucun résultat' : 'Catalogue vide'} text={produits.length ? 'Ajustez la recherche.' : 'Ajoutez un produit à la main ou importez un export CSV / Planity. Vous pouvez aussi saisir un produit libre directement dans une routine.'} />
      ) : (
        <div className="table-wrap card flush">
          <table className="table">
            <thead><tr><th>Produit</th><th>Catégorie</th><th>Réf.</th><th>Prix</th><th /></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`interactive ${p.actif === false ? 'muted' : ''}`} onClick={() => setForm(p)}>
                  <td className="semibold">{p.nom} {p.actif === false && <span className="badge badge-ink xs">Masqué</span>}</td>
                  <td>{p.categorie || '—'}</td>
                  <td className="muted small">{p.reference || '—'}</td>
                  <td>{Number(p.prix) > 0 ? `${p.prix} €` : '—'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Dropdown trigger={<Button variant="ghost" size="sm" icon="fa-solid fa-ellipsis-vertical" aria-label="Actions" />} items={[
                      { label: 'Modifier', icon: 'fa-solid fa-pen', onClick: () => setForm(p) },
                      { label: 'Supprimer', icon: 'fa-solid fa-trash-can', danger: true, onClick: () => removeProduit(p) },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal open={!!form} product={form?.id ? form : null} onClose={() => setForm(null)} />
      <PlanityImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}

function removeProduit(p) {
  confirmDialog({ title: 'Supprimer ce produit ?', message: `« ${p.nom} » sera retiré du catalogue. Les documents déjà créés ne changent pas.`, confirmLabel: 'Supprimer', danger: true }).then((ok) => {
    if (ok) { useStore.getState().deleteProduit(p.id); toast('Produit supprimé'); }
  });
}

const EMPTY = { nom: '', reference: '', prix: '', categorie: '', actif: true };

function ProductFormModal({ open, product, onClose }) {
  const addProduit = useStore((s) => s.addProduit);
  const updateProduit = useStore((s) => s.updateProduit);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { if (open) setForm(product ? { ...EMPTY, ...product } : EMPTY); }, [open, product]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e?.preventDefault();
    if (!form.nom.trim()) return toast('Le nom du produit est requis', { type: 'warning' });
    const prix = String(form.prix).replace(',', '.').trim();
    if (prix && Number.isNaN(Number(prix))) return toast('Prix invalide', { type: 'warning' });
    const payload = { ...form, nom: form.nom.trim(), reference: form.reference.trim(), prix: prix ? Number(prix).toFixed(2) : '' };
    if (product) { updateProduit(product.id, payload); toast('Produit mis à jour'); } else { addProduit(payload); toast('Produit ajouté au catalogue'); }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Modifier le produit' : 'Nouveau produit'}
      actions={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button variant="primary" icon="fa-solid fa-check" onClick={submit}>Enregistrer</Button></>}>
      <form className="stack" onSubmit={submit}>
        <Field label="Nom" required>{(id) => <Input id={id} value={form.nom} onChange={set('nom')} autoFocus />}</Field>
        <div className="form-row">
          <Field label="Référence" hint="Optionnel">{(id) => <Input id={id} value={form.reference} onChange={set('reference')} />}</Field>
          <Field label="Prix (€)" hint="Optionnel">{(id) => <Input id={id} inputMode="decimal" value={form.prix} onChange={set('prix')} />}</Field>
        </div>
        <Field label="Catégorie" hint="Optionnel">
          {(id) => <Select id={id} value={form.categorie} onChange={set('categorie')}><option value="">—</option>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}</Select>}
        </Field>
        <Switch checked={form.actif !== false} onChange={(v) => setForm((f) => ({ ...f, actif: v }))} label="Proposé dans les routines" />
        <button type="submit" className="sr-only">Enregistrer</button>
      </form>
    </Modal>
  );
}
