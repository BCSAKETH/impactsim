/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SimulationHub } from './components/SimulationHub';
import { ActiveWorkspace } from './components/ActiveWorkspace';
import { Budgeting } from './components/Budgeting';
import { Analytics } from './components/Analytics';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { LoginView } from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';

// --- Auth Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'hub':
        return <SimulationHub />;
      case 'workspace':
        return <ActiveWorkspace />;
      case 'budgeting':
        return <Budgeting />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 min-h-screen flex flex-col">
        <TopBar activeTab={activeTab} />
        
        <main className="flex-1 mt-20 p-10 lg:p-16 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-10 border-t border-slate-200 bg-white/50 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            ImpactSim © 2026 • Visionary Architect Simulation Engine v4.2.0
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
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
