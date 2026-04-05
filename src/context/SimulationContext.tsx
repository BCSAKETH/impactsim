import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { TRANSLATIONS } from '../lib/translations';

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
  pitch: string;
  location?: string;
  stage?: string;
  currentChallenge?: Challenge;
  turnCount: number;
  currentMilestoneIndex: number;
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
  draftIdea?: string;
  showBoardroom?: boolean;
  mentorFeedback?: {
    critique: string;
    improvement: string;
    consequences: string;
  } | null;
}

export interface SimulationContextType {
  state: SimulationState;
  localSims: any[];
  updateState: (updates: Partial<SimulationState>) => Promise<void>;
  startNewSimulation: (scenario: { id: string; name: string; region: string; pitch?: string; location?: string; stage?: string }) => Promise<void>;
  addLocalSimulation: (sim: any) => void;
  resetSimulation: () => Promise<void>;
  undoDecision: () => Promise<void>;
  t: (key: string) => string;
}

const initialState: SimulationState = {
  impactScore: 0,
  timeElapsed: 0,
  socialImpact: 0,
  budget: 0,
  trust: 0,
  momentum: 0,
  currentPhase: 'discovery',
  scenarioId: '',
  scenarioName: '',
  region: '',
  status: 'idle',
  turnCount: 0,
  currentMilestoneIndex: 0,
  decisions: [],
  gameLanguage: 'English',
  resourceAllocation: {
    staff: 0,
    tech: 0,
    marketing: 0
  },
  stakeholderFeedback: [],
  notifications: [],
  draftIdea: '',
  pitch: '',
  showBoardroom: false,
  mentorFeedback: null,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>(initialState);
  const [localSims, setLocalSims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial State Hydration from LocalStorage
    const local = localStorage.getItem('yukti_sim_state');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.status === 'active') {
          setState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse local state');
      }
    }

    // 2. Local Portfolio Hydration
    const storedSims = localStorage.getItem('yukti_local_portfolio');
    if (storedSims) {
      try {
        setLocalSims(JSON.parse(storedSims));
      } catch (e) {
        console.error('Failed to parse local portfolio');
      }
    }

    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // 3. Cloud State Sync via Snapshot
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), (snapshot) => {
      if (snapshot.exists()) {
        const cloudState = snapshot.data() as SimulationState;
        setState(cloudState);
        localStorage.setItem('yukti_sim_state', JSON.stringify(cloudState));
      } else {
        // Only reset if we aren't currently in an active local session
        // This prevents flickering/reset when permissions are missing
        setState(prev => {
          if (prev.status === 'active' && prev.scenarioId.startsWith('temp-')) {
            return prev; // Keep the local session
          }
          return initialState;
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Simulation sync error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (state.status === 'active') {
       localStorage.setItem('yukti_sim_state', JSON.stringify(state));
    }
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
      turnCount: 0,
      impactScore: 50,
      socialImpact: 50,
      budget: 50000,
      trust: 100,
      momentum: 50,
      currentPhase: 'discovery',
      pitch: scenario.pitch || '',
      location: scenario.location || '',
      stage: scenario.stage || 'Idea Stage',
      gameLanguage: state.gameLanguage || 'English',
      decisions: [],
      currentChallenge: undefined,
    };
    
    // Update local state first for immediate UI response
    setState(newState);
    
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), newState);
    } catch (error) {
      console.error('Failed to save active simulation:', error);
      toast.error('Simulation started locally, but cloud sync failed.');
    }
  };

  const addLocalSimulation = (sim: any) => {
    const newSim = { ...sim, createdAt: new Date().toISOString() };
    const updated = [newSim, ...localSims];
    setLocalSims(updated);
    localStorage.setItem('yukti_local_portfolio', JSON.stringify(updated));
  };

  const resetSimulation = async () => {
    if (!auth.currentUser) return;
    setState(initialState);
    await setDoc(doc(db, 'users', auth.currentUser.uid, 'simulations', 'active'), initialState);
  };

  const undoDecision = async () => {
    if (!auth.currentUser || state.decisions.length === 0) return;
    
    const activePitch = state.pitch || state.draftIdea || '';
    const hasPitch = activePitch.trim().length > 0;
    const hasStage = state.stage && state.stage.trim().length > 0;
    
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

  const t = (key: string): string => {
    const lang = state.gameLanguage || 'English';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English']?.[key] || key;
  };

  return (
    <SimulationContext.Provider value={{ state, localSims, updateState, startNewSimulation, addLocalSimulation, resetSimulation, undoDecision, t }}>
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
