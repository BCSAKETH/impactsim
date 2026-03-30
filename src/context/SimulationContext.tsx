import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export interface ChallengeOption {
  text: string;
  effect_trust: number;
  effect_impact: number;
  effect_budget: number;
}

export interface Challenge {
  title: string;
  description: string;
  quote?: string;
  options: ChallengeOption[];
}

export interface DecisionHistory {
  id: string;
  challenge: Challenge;
  chosenOption: ChallengeOption;
  previousState: {
    trust: number;
    socialImpact: number;
    budget: number;
    timeElapsed: number;
    impactScore: number;
  };
}

export interface SimulationState {
  impactScore: number;
  timeElapsed: number;
  socialImpact: number;
  budget: number;
  trust: number;
  momentum: number;
  currentPhase: 'discovery' | 'strategy' | 'execution';
  scenarioId: string;
  scenarioName: string;
  region: string;
  status: 'idle' | 'active' | 'completed';
  lastDecision?: string;
  pitch?: string;
  location?: string;
  stage?: string;
  currentChallenge?: Challenge;
  decisions: DecisionHistory[];
  gameLanguage?: string;
  resourceAllocation: {
    staff: number;
    tech: number;
    marketing: number;
  };
  stakeholderFeedback: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    message: string;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'success' | 'warning' | 'info' | 'error';
  }[];
}

export interface SimulationContextType {
  state: SimulationState;
  updateState: (updates: Partial<SimulationState>) => Promise<void>;
  startNewSimulation: (scenario: { id: string; name: string; region: string; pitch?: string; location?: string; stage?: string }) => Promise<void>;
  resetSimulation: () => Promise<void>;
  undoDecision: () => Promise<void>;
}

const initialState: SimulationState = {
  impactScore: 84,
  timeElapsed: 14,
  socialImpact: 62,
  budget: 12450,
  trust: 41,
  momentum: 50,
  currentPhase: 'discovery',
  scenarioId: 'RURAL-MH-042',
  scenarioName: 'Mental Health Outreach',
  region: 'Central Appalachian Region',
  status: 'idle',
  decisions: [],
  gameLanguage: 'English',
  resourceAllocation: {
    staff: 45,
    tech: 25,
    marketing: 30
  },
  stakeholderFeedback: [],
  notifications: [{
    id: 'welcome',
    title: 'Simulation Started',
    message: 'Welcome to your social entrepreneurship environment.',
    time: 'Just now',
    read: false,
    type: 'info'
  }]
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), (snapshot) => {
      if (snapshot.exists()) {
        setState(snapshot.data() as SimulationState);
      } else {
        setState(initialState);
      }
      setLoading(false);
    }, (error) => {
      console.error('Simulation sync error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('yukti_sim_state', JSON.stringify(state));
  }, [state]);

  const updateState = async (updates: Partial<SimulationState>) => {
    if (!auth.currentUser) return;
    const newState = { ...state, ...updates };
    setState(newState);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), newState, { merge: true });
    } catch (error) {
      console.error('Failed to update simulation state:', error);
    }
  };

  const startNewSimulation = async (scenario: { id: string; name: string; region: string; pitch?: string; location?: string; stage?: string }) => {
    if (!auth.currentUser) return;
    const newState: SimulationState = {
      ...initialState,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      region: scenario.region,
      status: 'active',
      timeElapsed: 0,
      impactScore: 50,
      socialImpact: 50,
      budget: 50000,
      trust: 50,
      momentum: 50,
      currentPhase: 'discovery',
      pitch: scenario.pitch || '',
      location: scenario.location || '',
      stage: scenario.stage || 'Idea Stage',
      gameLanguage: state.gameLanguage || 'English',
      decisions: [],
      currentChallenge: undefined,
    };
    setState(newState);
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), newState);
  };

  const resetSimulation = async () => {
    if (!auth.currentUser) return;
    setState(initialState);
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), initialState);
  };

  const undoDecision = async () => {
    if (!auth.currentUser || state.decisions.length === 0) return;
    
    const lastDecision = state.decisions[state.decisions.length - 1];
    const newDecisions = state.decisions.slice(0, -1);
    
    const newState: SimulationState = {
      ...state,
      trust: lastDecision.previousState.trust,
      socialImpact: lastDecision.previousState.socialImpact,
      budget: lastDecision.previousState.budget,
      timeElapsed: lastDecision.previousState.timeElapsed,
      impactScore: lastDecision.previousState.impactScore,
      decisions: newDecisions,
      currentChallenge: lastDecision.challenge,
      lastDecision: newDecisions.length > 0 ? newDecisions[newDecisions.length - 1].chosenOption.text : undefined
    };
    
    setState(newState);
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), newState);
  };

  return (
    <SimulationContext.Provider value={{ state, updateState, startNewSimulation, resetSimulation, undoDecision }}>
      {!loading && children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
