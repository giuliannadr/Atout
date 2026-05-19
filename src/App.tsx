import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import AtoutLogo from './components/brand/AtoutLogo';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CMDashboard from './pages/CMDashboard';
import CMAccountDetail from './pages/CMAccountDetail';
import ProjectDetail from './pages/ProjectDetail';
import ClientView from './pages/ClientView';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import BookingPage from './pages/BookingPage';
import CalendarPage from './pages/CalendarPage';
import ToastContainer from './components/layout/ToastContainer';
import OnboardingModal from './components/layout/OnboardingModal';
import AuthGuard from './components/layout/AuthGuard';

import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import { useSettingsStore } from './store/settingsStore';
import { useNotificationStore } from './store/notificationStore';

const SIGN_OUT_EVENTS = new Set<AuthChangeEvent>(['SIGNED_OUT']);

const SIGN_IN_EVENTS = new Set<AuthChangeEvent>([
  'INITIAL_SESSION',
  'SIGNED_IN',
  'TOKEN_REFRESHED',
  'USER_UPDATED',
]);

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { settings, isLoaded } = useSettingsStore();
  const needsOnboarding = user && isLoaded && settings.hasCompletedOnboarding === false;

  return (
    <AuthGuard>
      <>
        {children}
        {needsOnboarding && <OnboardingModal />}
      </>
    </AuthGuard>
  );
};

const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { settings } = useSettingsStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AtoutLogo size="lg" />
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Cargando...</p>
      </div>
    );
  }

  if (user) {
    return (
      <PrivateLayout>
        {settings.profile === 'community_manager' ? <CMDashboard /> : <Dashboard />}
      </PrivateLayout>
    );
  }

  return <LandingPage />;
};


function App() {
  const { user, setUser, setLoading } = useAuthStore();
  const { fetchProjects, clearProjects } = useProjectStore();
  const { fetchSettings, settings, clearSettings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  const loadedForUser = useRef<string | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    const authTimeout = setTimeout(() => setLoading(false), 8_000);

    const startAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          clearTimeout(authTimeout);
          const user = session?.user ?? null;

          if (SIGN_IN_EVENTS.has(event) && user) {
            setUser(user);

            if (loadedForUser.current === user.id) return;
            loadedForUser.current = user.id;

            try {
              await Promise.all([fetchProjects(), fetchSettings()]);
            } catch {
              addNotification(
                'No se pudieron cargar los datos. Verificá tu conexión.',
                'error'
              );
            }

          } else if (SIGN_OUT_EVENTS.has(event)) {
            loadedForUser.current = null;
            setUser(null);
            clearProjects();
            clearSettings();

          } else if (event === 'INITIAL_SESSION' && !user) {
            setLoading(false);
          }
        }
      );
      subscriptionRef.current = subscription;
    };

    // Validate the cached session against the server BEFORE subscribing.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          await supabase.auth.signOut({ scope: 'local' });
          clearTimeout(authTimeout);
          setLoading(false);
          startAuthListener();
          return;
        }
      }
      startAuthListener();
    }).catch(() => {
      startAuthListener();
    });

    return () => {
      clearTimeout(authTimeout);
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/project/:id/client-view" element={<ClientView />} />
        <Route path="/book/:slug" element={<BookingPage />} />

        <Route
          path="/"
          element={<RootRoute />}
        />
        <Route path="/project/:id" element={<PrivateLayout><ProjectDetail /></PrivateLayout>} />
        <Route path="/account/:id" element={<PrivateLayout><CMAccountDetail /></PrivateLayout>} />
        <Route path="/project/:id/invoice" element={<PrivateLayout><InvoiceGenerator /></PrivateLayout>} />
        <Route path="/settings" element={<PrivateLayout><Settings /></PrivateLayout>} />
        <Route path="/calendar" element={<PrivateLayout><CalendarPage /></PrivateLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;
