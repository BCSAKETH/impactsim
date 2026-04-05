import React, { useState } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SimulationHub } from './components/SimulationHub';
import { ActiveWorkspace } from './components/ActiveWorkspace';
import { SprintGame } from './components/SprintGame';
import { AnimatePresence, motion } from 'motion/react';
import { LoginView } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SimulationProvider, useSimulation } from './context/SimulationContext';

import { Toaster } from 'sonner';

import { StartupDictionary } from './components/StartupDictionary';
import { AIMeetingRoom } from './components/AIMeetingRoom';

function AppContent() {
  const { user, loading } = useAuth();
  const { state, updateState } = useSimulation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customSprintIdea, setCustomSprintIdea] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-900/10 border-t-teal-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleSprint = (idea: string) => {
    setCustomSprintIdea(idea);
    setActiveTab('sprint');
  };

  return (
    <div className="min-h-screen mesh-gradient-light selection:bg-primary/20 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 min-h-screen flex flex-col">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 mt-20 p-10 lg:p-16 max-w-7xl mx-auto w-full">
          <AnimatePresence>
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'hub' && <SimulationHub setActiveTab={setActiveTab} onSprint={handleSprint} />}
              {activeTab === 'workspace' && <ActiveWorkspace setActiveTab={setActiveTab} />}
              {activeTab === 'boardroom' && <AIMeetingRoom onClose={() => setActiveTab('hub')} />}
              {activeTab === 'dictionary' && <StartupDictionary />}
              {activeTab === 'sprint' && <SprintGame 
                idea={customSprintIdea || state.draftIdea || ''} 
                language={state.gameLanguage || 'English'} 
                onComplete={() => {
                  setCustomSprintIdea(null);
                  setActiveTab('workspace');
                }}
                onCancel={() => {
                  setCustomSprintIdea(null);
                  setActiveTab('dashboard');
                }}
              />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-10 border-t border-slate-200 bg-white/50 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Yukti © 2026 • Visionary Architect Simulation Engine v4.2.0
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SimulationProvider>
          <AppContent />
          <Toaster position="top-right" richColors />
        </SimulationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
