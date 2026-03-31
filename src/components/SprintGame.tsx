import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  Coffee,
  Skull,
  Rocket,
  ShieldCheck,
  TrendingDown,
  ChevronRight,
  Users,
  Loader2,
  Coins,
  Info,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useSimulation } from '../context/SimulationContext';

interface SprintProps {
  idea: string;
  language: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface SprintTurn {
  scene: string;
  question: string;
  options: {
    text: string;
    impact: number;
    trust: number;
  }[];
  feedback: string;
  impactChange: number;
  trustChange: number;
  shake?: boolean;
}

interface Perk {
  id: string;
  name: string;
  description: string;
  icon: any;
  bonus: string;
}

const STRATEGY_PERKS: Perk[] = [
  { id: 'catalyst', name: 'Impact Catalyst', description: 'Double Social Impact for 2 rounds.', icon: Sparkles, bonus: '2x Impact' },
  { id: 'shield', name: 'Policy Shield', description: 'Protect Trust from negative events.', icon: ShieldCheck, bonus: 'Trust Guard' },
  { id: 'booster', name: 'Budget Booster', description: 'Reduce operational costs by 30%.', icon: Coins, bonus: '-30% Cost' },
];

export function SprintGame({ idea, language, onComplete, onCancel }: SprintProps) {
  const { state, updateState } = useSimulation();
  const [currentTurn, setCurrentTurn] = useState<SprintTurn | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [inventory, setInventory] = useState<Perk[]>([]);
  const [showPerkSelector, setShowPerkSelector] = useState(false);
  const [shake, setShake] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [summary, setSummary] = useState<string>('');

  const generateSprintTurn = async (decision?: string) => {
    setLoading(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: `You are a high-stakes startup simulation engine. Create a realistic strategic crisis or opportunity based on the user's idea: "${idea}". 
            If the decision is risky, set "shake": true in the response.
            Return JSON: { scene, question, options: [{text, impact, trust}], feedback, impactChange, trustChange, shake }` },
            { role: 'user', content: `Round ${round}/${totalRounds}. Current Status: Impact ${state.impactScore}, Trust ${state.trust}. Previous Decision: "${decision || 'Initial'}"` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const data = await resp.json();
      const nextTurn = JSON.parse(data.choices[0]?.message?.content || '{}') as SprintTurn;
      
      if (nextTurn.shake) {
        setShake(true);
        setTimeout(() => setShake(false), 800);
      }

      setCurrentTurn(nextTurn);
      
      if (decision) {
        updateState({
          impactScore: Math.max(0, state.impactScore + (nextTurn.impactChange || 0)),
          trust: Math.max(0, Math.min(100, state.trust + (nextTurn.trustChange || 0))),
          notifications: [
            ...state.notifications,
            {
              id: Date.now().toString(),
              type: (nextTurn.impactChange || 0) >= 0 ? 'success' : 'warning',
              title: 'Round Result',
              message: nextTurn.feedback,
              time: 'Just now',
              read: false
            }
          ]
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate next round.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSprintTurn();
  }, []);

  const handleTurn = async (decision: string) => {
    if (round >= totalRounds) {
      setGameEnded(true);
      return;
    }
    
    setRound(prev => prev + 1);
    await generateSprintTurn(decision);
    
    if ((round + 1) % 2 === 0 && round < totalRounds) {
      setShowPerkSelector(true);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-10rem)] bg-slate-950 rounded-[3rem] border border-slate-900 overflow-hidden relative shadow-2xl transition-transform duration-100", 
      shake && "animate-shake"
    )}>
      {/* Journey Map Header */}
      <header className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
             <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">Journey Progress</h3>
             <div className="flex items-center gap-2 w-64 h-1.5 bg-slate-950 rounded-full border border-white/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(round / totalRounds) * 100}%` }}
                  className="h-full bg-gradient-to-r from-primary to-fuchsia-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                />
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                   {[...Array(totalRounds)].map((_, i) => (
                     <div key={i} className="w-1 h-full bg-white/10" />
                   ))}
                </div>
             </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-950 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <Heart className="text-rose-500" size={14} />
                <span className="text-white font-black text-xs">{state.impactScore}</span>
             </div>
             <div className="bg-slate-950 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <Users className="text-blue-400" size={14} />
                <span className="text-white font-black text-xs">{state.trust}%</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {inventory.map((p, i) => (
             <div key={p.id + i} className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group relative hover:bg-primary/20 transition-all">
                <p.icon size={20} />
                <div className="absolute top-full right-0 mt-3 w-48 p-4 bg-slate-950 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl">
                   <p className="font-black text-xs text-white uppercase tracking-widest">{p.name}</p>
                   <p className="text-[10px] text-slate-500 mt-1">{p.description}</p>
                </div>
             </div>
          ))}
          <div className="bg-slate-950 px-6 py-2.5 rounded-2xl border border-white/5 text-primary text-xs font-black uppercase tracking-widest">
            Iteration <span className="text-white text-base ml-1">{round}</span>
          </div>
        </div>
      </header>

      {/* Game Stage */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
        </div>

        <AnimatePresence mode="wait">
          {gameEnded ? (
            <motion.div 
              key="end" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex-1 flex flex-col items-center justify-center p-12 text-center z-10"
            >
               <Trophy size={100} className="text-primary mb-8" />
               <h2 className="text-6xl font-black text-white italic mb-4">Sprint Complete.</h2>
               <p className="text-slate-500 max-w-md text-xl mb-12">You have successfully navigated the strategic complexities of your mission. Review your Impact Portfolio for details.</p>
               <button 
                 onClick={() => onComplete?.()}
                 className="bg-primary text-slate-950 px-12 py-5 rounded-full font-black text-xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
               >
                 Back to Dashboard
               </button>
            </motion.div>
          ) : showPerkSelector ? (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 z-50 flex items-center justify-center p-12"
            >
               <div className="max-w-4xl w-full">
                  <div className="text-center mb-12">
                     <label className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-4 block">Strategy Upgrade Available</label>
                     <h2 className="text-5xl font-black text-white italic">Evolve Your <span className="text-fuchsia-400">Toolkit.</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {STRATEGY_PERKS.map((perk) => (
                       <button
                         key={perk.id}
                         onClick={() => {
                            setInventory([...inventory, perk]);
                            setShowPerkSelector(false);
                            toast.success(`Acquired: ${perk.name}`);
                         }}
                         className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2.5rem] hover:border-primary hover:bg-slate-800 transition-all group flex flex-col items-center"
                       >
                          <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary mb-6 transition-all">
                             <perk.icon size={32} />
                          </div>
                          <h4 className="text-xl font-black text-white mb-2">{perk.name}</h4>
                          <p className="text-sm text-slate-500 mb-6 font-medium">{perk.description}</p>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">{perk.bonus}</span>
                       </button>
                     ))}
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key={round}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 z-10 flex flex-col"
            >
              <div className="flex-1 grid grid-cols-12 gap-12 p-12 overflow-y-auto no-scrollbar">
                <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
                   <div className="relative aspect-square w-full max-w-[400px] mx-auto">
                      <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-3xl" />
                      <div className="relative aspect-square bg-slate-900 rounded-[3.5rem] border-4 border-slate-800 overflow-hidden shadow-2xl">
                         <img 
                           src={round % 2 === 0 ? "https://img.freepik.com/premium-photo/cartoon-scene-village-water-tank-pipes_1020697-39145.jpg" : "https://img.freepik.com/premium-photo/cartoon-hero-builder-character-full-height-on-white-background_1020697-39328.jpg"} 
                           className="w-full h-full object-cover" 
                           alt="Round" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      </div>
                   </div>
                </div>

                <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
                  <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-white/5 p-10 shadow-2xl relative">
                    <label className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Strategic Landscape</label>
                    <h4 className="text-2xl text-white font-medium mb-8 italic opacity-90 leading-relaxed font-body">
                      "{currentTurn?.scene || 'Analyzing entry points...'}"
                    </h4>

                    <div className="pt-8 border-t border-white/5">
                      <h3 className="text-3xl font-black text-white mb-8 tracking-tighter">
                        {currentTurn?.question || 'Identify your next move:'}
                      </h3>

                      <div className="space-y-4">
                        {(currentTurn?.options || []).map((opt, i) => (
                          <button
                            key={i}
                            disabled={loading}
                            onClick={() => handleTurn(opt.text)}
                            className="w-full text-left p-6 bg-slate-950 hover:bg-primary text-slate-400 hover:text-slate-950 border border-slate-800 rounded-[1.8rem] transition-all font-black flex justify-between items-center group disabled:opacity-50"
                          >
                            <span className="text-lg">{opt.text}</span>
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {loading && (
        <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center">
           <Loader2 className="animate-spin text-primary mb-4" size={48} />
           <p className="text-primary font-black uppercase tracking-[0.4em] text-xs">Simulating Stakeholders...</p>
        </div>
      )}
    </div>
  );
}
