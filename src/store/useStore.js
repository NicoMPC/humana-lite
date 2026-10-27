/**
 * Store global (Zustand + persistance localStorage) : session, produits,
 * réglages. Le document en cours de composition est dans `useStudio.js`.
 *
 * Produits et réglages sont aussi synchronisés avec le classeur partagé
 * (onglets `LiteProduits`/`Reglages`, voir `apps-script/Code.gs` et
 * `lib/sheetsSync.js`) pour que Jessie et Nathalie voient le même catalogue
 * sur leurs 2 postes : pull au démarrage (`hydrateFromSheet`, appelé une fois
 * depuis `App.jsx`), push debounced (500 ms) après chaque mutation locale.
 * Best-effort dans les deux sens : un pull ou un push qui échoue (backend pas
 * encore déployé, hors ligne) laisse le cache localStorage tel quel, jamais
 * de blocage ni de plantage de l'UI — dernière écriture gagne, pas de fusion
 * fine (2 utilisatrices, volume faible : choix de simplicité volontaire).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { buildSeed, SCHEMA_VERSION } from '../data/seed';
import { uid } from '../lib/ids';
import { nowISO, todayISO } from '../lib/dates';
import {
  pullProduits, pushProduits, pullReglages, pushReglages,
  pullQuestions, pushQuestions, pullConseils, pushConseils,
} from '../lib/sheetsSync';

export const STORAGE_KEY = 'humana.lite.v1';

const SYNC_DEBOUNCE_MS = 500;
let produitsSyncTimer = null;
let reglagesSyncTimer = null;
let questionsSyncTimer = null;
let conseilsSyncTimer = null;

/** Push best-effort, debounced : la valeur poussée est celle lue au moment du tir, pas celle de l'appel. */
function schedulePushProduits(getProduits) {
  clearTimeout(produitsSyncTimer);
  produitsSyncTimer = setTimeout(() => { pushProduits(getProduits()); }, SYNC_DEBOUNCE_MS);
}

function schedulePushReglages(getSettings) {
  clearTimeout(reglagesSyncTimer);
  reglagesSyncTimer = setTimeout(() => { pushReglages(getSettings()); }, SYNC_DEBOUNCE_MS);
}

function schedulePushQuestions(getQuestions) {
  clearTimeout(questionsSyncTimer);
  questionsSyncTimer = setTimeout(() => { pushQuestions(getQuestions()); }, SYNC_DEBOUNCE_MS);
}

function schedulePushConseils(getConseils) {
  clearTimeout(conseilsSyncTimer);
  conseilsSyncTimer = setTimeout(() => { pushConseils(getConseils()); }, SYNC_DEBOUNCE_MS);
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...buildSeed(),
      session: { userId: null },

      /* Session */
      login: (userId) => set({ session: { userId } }),
      logout: () => set({ session: { userId: null } }),

      /**
       * Pull initial depuis le Sheet partagé (appelé une fois au montage de l'app).
       * Ne remplace l'état local que si la requête réussit ; sinon le cache
       * localStorage existant reste en place, silencieusement.
       */
      hydrateFromSheet: async () => {
        const [produitsRes, reglagesRes, questionsRes, conseilsRes] = await Promise.all([
          pullProduits(), pullReglages(), pullQuestions(), pullConseils(),
        ]);
        set((s) => ({
          produits: produitsRes.ok ? produitsRes.produits : s.produits,
          // Fusion imbriquée sur `boutique` (pas un simple écrasement au 1er niveau) : un
          // champ ajouté au défaut local (ex. avisLien, 27/10) ne doit pas disparaître juste
          // parce que le Sheet garde encore une ancienne version de l'objet sans ce champ.
          settings: reglagesRes.ok && reglagesRes.reglages
            ? { ...s.settings, ...reglagesRes.reglages, boutique: { ...s.settings.boutique, ...(reglagesRes.reglages.boutique || {}) } }
            : s.settings,
          questions: questionsRes.ok && questionsRes.questions ? questionsRes.questions : s.questions,
          conseilsCheveux: conseilsRes.ok && conseilsRes.conseils ? conseilsRes.conseils : s.conseilsCheveux,
        }));
      },

      /* Produits */
      addProduit: (payload) => {
        const p = { id: uid('p'), actif: true, stock: 0, prix: '', categorie: '', cible: 'mixte', reference: '', ean: '', description: '', ...payload };
        set((s) => ({ produits: [...s.produits, p] }));
        schedulePushProduits(() => get().produits);
        return p;
      },
      updateProduit: (id, patch) => {
        set((s) => ({ produits: s.produits.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
        schedulePushProduits(() => get().produits);
      },
      deleteProduit: (id) => {
        set((s) => ({ produits: s.produits.filter((p) => p.id !== id) }));
        schedulePushProduits(() => get().produits);
      },

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
        schedulePushProduits(() => get().produits);
        schedulePushReglages(() => get().settings);
        return created;
      },

      /* Réglages */
      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...(typeof patch === 'function' ? patch(s.settings) : patch) } }));
        schedulePushReglages(() => get().settings);
      },

      /** Remplace en entier les questions d'un type de diagnostic ('peau' | 'cheveux'). */
      updateQuestions: (type, questionsList) => {
        set((s) => ({ questions: { ...s.questions, [type]: questionsList } }));
        schedulePushQuestions(() => get().questions);
      },

      /** Remplace en entier gestes et/ou tips de la bibliothèque de conseils cheveux. */
      updateConseilsCheveux: (patch) => {
        set((s) => ({ conseilsCheveux: { ...s.conseilsCheveux, ...(typeof patch === 'function' ? patch(s.conseilsCheveux) : patch) } }));
        schedulePushConseils(() => get().conseilsCheveux);
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => (version === SCHEMA_VERSION ? persisted : { ...buildSeed(), session: { userId: null } }),
      partialize: (s) => ({
        version: s.version, users: s.users, produits: s.produits, settings: s.settings, session: s.session,
        questions: s.questions, conseilsCheveux: s.conseilsCheveux,
      }),
    }
  )
);

/** Hook pratique : utilisatrice connectée (ou null). */
export const useCurrentUser = () => useStore((s) => s.users.find((u) => u.id === s.session.userId) || null);
