/**
 * Store global (Zustand + persistance localStorage) : session, produits,
 * réglages. Le document en cours de composition est dans `useStudio.js`.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { buildSeed, SCHEMA_VERSION } from '../data/seed';
import { uid } from '../lib/ids';
import { nowISO, todayISO } from '../lib/dates';

export const STORAGE_KEY = 'humana.lite.v1';

export const useStore = create(
  persist(
    (set) => ({
      ...buildSeed(),
      session: { userId: null },

      /* Session */
      login: (userId) => set({ session: { userId } }),
      logout: () => set({ session: { userId: null } }),

      /* Produits */
      addProduit: (payload) => {
        const p = { id: uid('p'), actif: true, stock: 0, prix: '', categorie: '', cible: 'mixte', reference: '', ean: '', description: '', ...payload };
        set((s) => ({ produits: [...s.produits, p] }));
        return p;
      },
      updateProduit: (id, patch) => set((s) => ({ produits: s.produits.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProduit: (id) => set((s) => ({ produits: s.produits.filter((p) => p.id !== id) })),

      /** Applique un plan d'import Planity/CSV (voir `lib/planityImport.js`). */
      applyStockImport: (plan, auteurId) => {
        const created = plan.toCreate.map((p) => ({ id: uid('p'), actif: true, description: '', cible: 'mixte', reference: '', ean: '', ...p }));
        const updateMap = new Map(plan.toUpdate.map((u) => [u.id, u.patch]));
        set((s) => ({
          produits: [...s.produits.map((p) => (updateMap.has(p.id) ? { ...p, ...updateMap.get(p.id) } : p)), ...created],
          settings: {
            ...s.settings,
            stock: {
              dernierImport: todayISO(),
              historique: [
                { date: nowISO(), auteur_id: auteurId, crees: plan.stats.crees, maj: plan.stats.maj, ignores: plan.stats.ignores },
                ...(s.settings.stock?.historique || []),
              ].slice(0, 10),
            },
          },
        }));
        return created;
      },

      /* Réglages */
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...(typeof patch === 'function' ? patch(s.settings) : patch) } })),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => (version === SCHEMA_VERSION ? persisted : { ...buildSeed(), session: { userId: null } }),
      partialize: (s) => ({ version: s.version, users: s.users, produits: s.produits, settings: s.settings, session: s.session }),
    }
  )
);

/** Hook pratique : utilisatrice connectée (ou null). */
export const useCurrentUser = () => useStore((s) => s.users.find((u) => u.id === s.session.userId) || null);
