import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore, useCurrentUser } from './store/useStore';
import { AppShell } from './components/layout/AppShell';
import { Toaster, ConfirmDialog } from './components/ui';
import LoginPage from './pages/LoginPage';
import StudioPage from './pages/StudioPage';
import ProduitsPage from './pages/ProduitsPage';
import ReglagesPage from './pages/ReglagesPage';
import ArchivesPage from './pages/ArchivesPage';

function RequireAuth({ children }) {
  const user = useCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  const user = useCurrentUser();
  // Pull unique du catalogue produits + réglages depuis le Sheet partagé au
  // démarrage (voir useStore#hydrateFromSheet) : best-effort, ne bloque jamais
  // l'affichage, garde le cache localStorage si le backend est indisponible.
  useEffect(() => { useStore.getState().hydrateFromSheet(); }, []);
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppShell>
                  <Routes>
                    <Route index element={<StudioPage />} />
                    <Route path="archives" element={<ArchivesPage />} />
                    <Route path="produits" element={<ProduitsPage />} />
                    <Route path="reglages" element={<ReglagesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
              </AppShell>
            </RequireAuth>
          }
        />
      </Routes>
      <Toaster />
      <ConfirmDialog />
    </>
  );
}
