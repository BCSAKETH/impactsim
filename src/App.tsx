import React, { useState } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SimulationHub } from './components/SimulationHub';
import { ActiveWorkspace } from './components/ActiveWorkspace';
import { SprintGame } from './components/SprintGame';
import { FounderLexicon } from './components/FounderLexicon';
import { AnimatePresence, motion } from 'motion/react';
import { LoginView } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SimulationProvider, useSimulation } from './context/SimulationContext';

import { Toaster } from 'sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const { state } = useSimulation();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Yukti Engine...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-primary/20">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 min-h-screen flex flex-col">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 mt-20 p-10 lg:p-16 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'hub' && <SimulationHub setActiveTab={setActiveTab} />}
              {activeTab === 'lexicon' && <FounderLexicon />}
              {activeTab === 'workspace' && <ActiveWorkspace />}
              {activeTab === 'sprint' && <SprintGame 
                idea={state.draftIdea || state.pitch || ''} 
                language={state.gameLanguage || 'English'} 
                onComplete={() => setActiveTab('workspace')}
                onCancel={() => setActiveTab('dashboard')}
              />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-10 border-t border-white/5 bg-slate-950 text-center relative z-10">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] italic">
            Yukti Simulation Engine • Visionary Architect v4.2.0 • Forge Your Impact
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
