/**
 * Brouillon du compositeur (écran « Nouveau document ») : étape du wizard +
 * objet `doc` du contrat (docs/CONTRACT.md). Persisté en localStorage pour ne
 * jamais perdre un document en cours (rechargement de page, onglet fermé).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_KINDS } from '../data/constants';
import { todayISO } from '../lib/dates';
import { useStore } from './useStore';
import { emptyRoutineCheveux } from '../lib/pdf/routineModel';

// peau : grille réelle non reçue, modèle historique matin/soir/hebdo conservé.
// cheveux : 7 rubriques réelles V1 (voir docs/CONTRACT.md et data/conseilsCheveux.js).
const emptyData = (kind, footerMessage, type) => {
  switch (kind) {
    case 'routine': return type === 'cheveux' ? emptyRoutineCheveux() : { items: [] };
    case 'conseils': return { texte: '' };
    case 'lifestyle': return { tips: [] };
    case 'message': return { texte: footerMessage };
    default: return {};
  }
};

/** Construit un doc vierge (blocs par défaut selon le type). */
export function newDoc(type, auteur) {
  const { settings, questions } = useStore.getState();
  const footerMessage = settings.footerMessage || '';
  return {
    type,
    theme: 'sauge',
    client: { prenom: '', nom: '', email: '' },
    meta: { date: todayISO(), auteur, lieu: 'boutique' },
    boutique: { ...settings.boutique },
    footerMessage,
    reponses: {},
    // Snapshot des questions au moment de la création : un document déjà envoyé garde les
    // questions telles qu'elles étaient alors, même si Jessie/Nathalie les modifient ensuite
    // dans Paramètres → Contenu (voir lib/pdf/index.js qui lit doc.questions).
    questions: questions[type] || [],
    blocks: DEFAULT_KINDS[type].map((kind) => ({ id: kind, kind, on: true, data: emptyData(kind, footerMessage, type) })),
  };
}

export const useStudio = create(
  persist(
    (set) => {
      const upd = (fn) => set((s) => (s.doc ? { doc: fn(s.doc) } : {}));
      return {
        step: 0, // 0 choix · 1 fiche RDV (+ questions) · 2 composition
        doc: null,
        tutoiement: false,

        setStep: (step) => set({ step }),
        setTutoiement: (tutoiement) => set({ tutoiement }),
        start: (type, auteur) => set({ doc: newDoc(type, auteur), step: 1 }),
        reset: () => set({ doc: null, step: 0 }),
        // Reprend un document déjà archivé (Archives → "Reprendre pour modifier") : repart
        // directement à l'étape composition, pas au choix de type ni au questionnaire — le
        // bouton "Retour" de ComposeStep permet d'y revenir si besoin.
        loadDoc: (doc) => set({ doc, step: 2 }),

        setClient: (client) => upd((d) => ({ ...d, client: { prenom: '', nom: '', email: '', ...client } })),
        setMeta: (patch) => upd((d) => ({ ...d, meta: { ...d.meta, ...patch } })),
        setBoutique: (patch) => upd((d) => ({ ...d, boutique: { ...d.boutique, ...patch } })),
        setTheme: (theme) => upd((d) => ({ ...d, theme })),
        setAnswer: (qid, value) => upd((d) => ({ ...d, reponses: { ...d.reponses, [qid]: value } })),

        toggleBlock: (id) => upd((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === id ? { ...b, on: !b.on } : b)) })),
        moveBlock: (id, dir) =>
          upd((d) => {
            const i = d.blocks.findIndex((b) => b.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= d.blocks.length) return d;
            const blocks = [...d.blocks];
            [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
            return { ...d, blocks };
          }),
        setBlockData: (id, patch) =>
          upd((d) => {
            const blocks = d.blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...patch } } : b));
            // Le message de fin reste synchronisé avec `doc.footerMessage` (contrat).
            const isMessage = d.blocks.find((b) => b.id === id)?.kind === 'message' && 'texte' in patch;
            return { ...d, blocks, ...(isMessage ? { footerMessage: patch.texte } : {}) };
          }),
      };
    },
    {
      name: 'humana.lite.studio.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ step: s.step, doc: s.doc, tutoiement: s.tutoiement }),
    }
  )
);
