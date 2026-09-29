import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import BottomNav, { type Tab } from '@/components/BottomNav';
import HomeScreen from '@/screens/HomeScreen';
import QuickCalcScreen from '@/screens/QuickCalcScreen';
import ProjectsScreen from '@/screens/ProjectsScreen';
import ProjectDetailScreen from '@/screens/ProjectDetailScreen';
import NewProjectScreen from '@/screens/NewProjectScreen';
import AIScreen from '@/screens/AIScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import AuthScreen from '@/screens/AuthScreen';

type Screen =
  | { name: 'main' }
  | { name: 'quickcalc' }
  | { name: 'newproject' }
  | { name: 'project'; projectId: string };

function AppContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('home');
  const [screen, setScreen] = useState<Screen>({ name: 'main' });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-3 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">Eletricista IA</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  // Full-screen overlays
  if (screen.name === 'quickcalc') {
    return <QuickCalcScreen onBack={() => setScreen({ name: 'main' })} />;
  }
  if (screen.name === 'newproject') {
    return <NewProjectScreen onBack={() => setScreen({ name: 'main' })} onCreated={(id) => { setScreen({ name: 'project', projectId: id }); }} />;
  }
  if (screen.name === 'project') {
    return <ProjectDetailScreen projectId={screen.projectId} onBack={() => setScreen({ name: 'main' })} />;
  }

  // Tabbed screens
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {tab === 'home' && (
        <HomeScreen
          onNavigate={setTab}
          onNewProject={() => setScreen({ name: 'newproject' })}
          onQuickCalc={() => setScreen({ name: 'quickcalc' })}
        />
      )}
      {tab === 'calculator' && (
        <QuickCalcScreen onBack={() => setTab('home')} />
      )}
      {tab === 'projects' && (
        <ProjectsScreen
          onOpenProject={(id) => setScreen({ name: 'project', projectId: id })}
          onNewProject={() => setScreen({ name: 'newproject' })}
        />
      )}
      {tab === 'ai' && <AIScreen />}
      {tab === 'profile' && <ProfileScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
