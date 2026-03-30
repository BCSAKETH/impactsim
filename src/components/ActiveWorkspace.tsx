import React, { useState } from 'react';
import { 
  Megaphone,
  Users,
  Radio,
  Clock,
  AlertTriangle,
  Leaf,
  Wallet,
  Heart,
  BarChart3,
  MapPin,
  Send,
  MessageSquare,
  TrendingUp,
  Download,
  Info,
  ArrowDown,
  Globe,
  Calendar,
  Filter,
  Play,
  Sparkles,
  ArrowRight,
  Plus,
  Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FEEDBACK } from '../constants';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useSimulation, ChallengeOption } from '../context/SimulationContext';
import { AcceleratorAnalysis } from './AcceleratorAnalysis';

const COLORS = ['#005050', '#3a5f94', '#006a6a', '#bec9c8'];

export function ActiveWorkspace() {
  const { state, updateState, undoDecision } = useSimulation();
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    // Kick off generation if we are in execution phase and don't have a challenge
    if (state.currentPhase === 'execution' && state.status === 'active' && !state.currentChallenge && !isGenerating) {
      generateNextChallenge(state.lastDecision);
    }
  }, [state.currentChallenge, state.status, state.currentPhase]);

  const generateNextChallenge = async (previousChoiceText?: string) => {
    setIsGenerating(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const isBankrupt = state.budget <= 0;
      
      const prompt = `
        You are the game master for a social entrepreneurship simulation. Provide the ENTIRE JSON response strictly.
        Project: ${state.scenarioName}
        Region: ${state.location || state.region}
        Current Status - Trust: ${state.trust}%, Impact: ${state.socialImpact}%, Budget: $${state.budget.toLocaleString()}, Momentum: ${state.momentum}%
        
        ${isBankrupt ? 'CRITICAL: Out of funds! Focus on emergency measures.' : ''}
        ${previousChoiceText ? `The user previously decided: "${previousChoiceText}".` : 'This is the start.'}
        
        Generate a new scenario JSON:
        {
          "title": "Short title",
          "description": "Detailed 2-3 sentence description of the dilemma.",
          "quote": "A quote from a stakeholder",
          "stakeholder_reaction": { "name": "Someone", "role": "Their role", "message": "Reaction to previous dev" },
          "options": [
            { "text": "Option 1", "effect_trust": 5, "effect_impact": 10, "effect_budget": -5000, "effect_momentum": 5 },
            ... (total 4 options)
          ]
        }
      `;
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a social entrepreneurship expert. The output MUST be valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const textResponse = data.choices[0]?.message?.content || '{}';
      const cleanText = textResponse.replace(/^```json/mi, '').replace(/```$/m, '').trim();
      const newChallenge = JSON.parse(cleanText);
      
      const newFeedback = newChallenge.stakeholder_reaction;
      let updatedFeedback = state.stakeholderFeedback || [];
      
      if (newFeedback && newFeedback.name && newFeedback.message) {
        updatedFeedback = [{
          id: Math.random().toString(36).substring(7),
          name: newFeedback.name,
          role: newFeedback.role || 'Stakeholder',
          avatar: `https://i.pravatar.cc/150?u=${newFeedback.name.replace(/ /g, '')}`,
          message: `"${newFeedback.message}"`
        }, ...updatedFeedback].slice(0, 5);
      }

      await updateState({ 
        currentChallenge: newChallenge,
        stakeholderFeedback: updatedFeedback,
        notifications: [{
          id: Math.random().toString(36).substring(7),
          title: 'Strategic Update',
          message: 'The AI Consultant has analyzed the current landscape.',
          time: 'Just now',
          read: false,
          type: 'success'
        }, ...(state.notifications || [])]
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate next phase.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDecision = async (option: ChallengeOption) => {
    if (!state.currentChallenge) return;
    
    // Safety check for effect_momentum if it's missing in AI response
    const momentumChange = (option as any).effect_momentum || 0;

    const newTrust = Math.min(100, Math.max(0, state.trust + option.effect_trust));
    const newImpact = Math.min(100, Math.max(0, state.socialImpact + option.effect_impact));
    const newBudget = Math.max(0, state.budget + option.effect_budget);
    const newMomentum = Math.min(100, Math.max(0, state.momentum + momentumChange));
    const newScore = Math.round((newTrust * 0.3) + (newImpact * 0.5) + (newMomentum * 0.2));
    
    const historyItem = {
      id: Math.random().toString(36).substring(7),
      challenge: state.currentChallenge,
      chosenOption: option,
      previousState: {
        trust: state.trust,
        socialImpact: state.socialImpact,
        budget: state.budget,
        timeElapsed: state.timeElapsed,
        impactScore: state.impactScore,
      }
    };
    
    await updateState({
      trust: newTrust,
      socialImpact: newImpact,
      budget: newBudget,
      momentum: newMomentum,
      impactScore: newScore,
      timeElapsed: state.timeElapsed + 1,
      lastDecision: option.text,
      decisions: [...(state.decisions || []), historyItem],
      currentChallenge: undefined 
    });
  };

  const handleUndo = async () => {
    await undoDecision();
    toast.info('Reverted to previous decision');
  };

  const handleResourceChange = (key: 'staff' | 'tech' | 'marketing', value: number) => {
    if (!state.resourceAllocation) return;
    const current = state.resourceAllocation[key];
    const diff = value - current;
    
    const keys = ['staff', 'tech', 'marketing'] as const;
    const others = keys.filter(k => k !== key);
    
    let newAlloc = { ...state.resourceAllocation, [key]: value };
    let remainder = 100 - value;
    
    const otherTotal = newAlloc[others[0]] + newAlloc[others[1]];
    if (otherTotal === 0) {
      newAlloc[others[0]] = Math.round(remainder / 2);
      newAlloc[others[1]] = remainder - newAlloc[others[0]];
    } else {
      newAlloc[others[0]] = Math.round((newAlloc[others[0]] / otherTotal) * remainder);
      newAlloc[others[1]] = remainder - newAlloc[others[0]];
    }

    updateState({ resourceAllocation: newAlloc });
  };

  const exportCSV = () => {
    try {
      const headers = ['Day', 'Challenge', 'Decision', 'Trust', 'Impact', 'Budget'];
      const rows = (state.decisions || []).map((d, i) => [
        `Day ${i + 1}`,
        `"${d.challenge.title.replace(/"/g, '""')}"`,
        `"${d.chosenOption.text.replace(/"/g, '""')}"`,
        d.previousState.trust,
        d.previousState.socialImpact,
        d.previousState.budget
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Yukti_Report_${state.scenarioId}.csv`;
      link.click();
      toast.success('Report Exported!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const phases = [
    { id: 'discovery', label: 'Discovery', description: 'Mission Ideation', icon: Radio },
    { id: 'strategy', label: 'Strategy', description: 'Pitch & Analysis', icon: BarChart3 },
    { id: 'execution', label: 'Execution', description: 'Live Simulation', icon: Play },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 min-h-[85vh]">
      {/* LEFT NAV: THE TIMELINE */}
      <div className="col-span-12 lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 ml-2">Phase Timeline</p>
          <div className="space-y-4">
            {phases.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => updateState({ currentPhase: p.id as any })}
                className={cn(
                  "w-full text-left p-4 rounded-3xl transition-all relative group",
                  state.currentPhase === p.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    state.currentPhase === p.id ? "bg-white/20" : "bg-slate-100 group-hover:bg-primary/5"
                  )}>
                    <p.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tighter leading-none">{p.label}</p>
                    <p className={cn("text-[10px] opacity-60 mt-1 truncate max-w-[80px]", state.currentPhase === p.id ? "text-white" : "text-slate-400")}>{p.description}</p>
                  </div>
                </div>
                {idx < phases.length - 1 && (
                  <div className="absolute left-9 -bottom-4 w-[2px] h-4 bg-slate-100" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER STAGE */}
      <div className="col-span-12 lg:col-span-7">
        <AnimatePresence mode="wait">
          {state.currentPhase === 'discovery' && (
            <motion.div 
               key="discovery"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center text-center space-y-8"
            >
              <div className="p-8 bg-primary/5 rounded-full animate-pulse">
                <Radio className="text-primary w-16 h-16" />
              </div>
              <div className="max-w-md">
                <h3 className="text-4xl font-headline font-black text-on-surface mb-4">Mission Discovery</h3>
                <p className="text-slate-500 text-lg leading-relaxed">The AI has captured your vision. You can refine your ideation in the <b>Simulation Hub</b> or proceed to strategy mapping.</p>
              </div>
              <button 
                onClick={() => updateState({ currentPhase: 'strategy' })}
                className="bg-primary text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Enter Discovery Strategy →
              </button>
            </motion.div>
          )}

          {state.currentPhase === 'strategy' && (
            <motion.div 
               key="strategy"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="h-full"
            >
              <AcceleratorAnalysis />
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => updateState({ currentPhase: 'execution' })}
                  className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
                >
                  Proceed to Execution Stage <Zap size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {state.currentPhase === 'execution' && (
            <motion.div 
               key="execution"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-8"
            >
              <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group min-h-[500px] flex flex-col border-b-[8px] border-primary/20">
                <div className="relative flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <span className="bg-teal-50 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">Active Simulation</span>
                     {state.decisions.length > 0 && !isGenerating && (
                       <button onClick={handleUndo} className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                         <Play size={10} className="rotate-180" /> Undo Move
                       </button>
                     )}
                  </div>

                  {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Simulating next challenge...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-4xl font-headline font-black text-on-surface mb-6 leading-tight">
                        {state.currentChallenge?.title || "Evaluating Environment..."}
                      </h3>
                      <p className="text-xl text-slate-600 leading-relaxed mb-10 font-body">
                        {state.currentChallenge?.description}
                      </p>
                      
                      {state.currentChallenge?.quote && (
                        <div className="bg-slate-50 p-6 rounded-3xl border-l-4 border-primary italic text-slate-500 mb-10 text-lg">
                          "{state.currentChallenge.quote}"
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                        {state.currentChallenge?.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleDecision(opt)}
                            className="bg-white border-2 border-slate-100 p-6 rounded-3xl text-left hover:border-primary hover:bg-primary/5 transition-all group relative active:scale-[0.98]"
                          >
                            <p className="font-bold text-on-surface mb-3 group-hover:text-primary transition-colors pr-8 leading-snug">{opt.text}</p>
                            <div className="flex gap-4">
                              <span className={cn("text-[10px] font-black uppercase", opt.effect_impact > 0 ? "text-emerald-600" : "text-slate-400")}>Impact {opt.effect_impact >= 0 ? '+' : ''}{opt.effect_impact}</span>
                              <span className={cn("text-[10px] font-black uppercase", opt.effect_trust > 0 ? "text-blue-600" : "text-slate-400")}>Trust {opt.effect_trust >= 0 ? '+' : ''}{opt.effect_trust}</span>
                              <span className={cn("text-[10px] font-black uppercase", opt.effect_budget < 0 ? "text-red-500" : "text-emerald-600")}>Budget {opt.effect_budget >= 0 ? '+' : ''}${Math.abs(opt.effect_budget).toLocaleString()}</span>
                            </div>
                            <ArrowRight size={20} className="absolute bottom-6 right-6 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Insights */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Users size={14} /> Stakeholder Council
                </h4>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                   {state.stakeholderFeedback.length === 0 ? (
                     <div className="w-full text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 text-sm italic">Observing decisions... feedback pending.</p>
                     </div>
                   ) : (
                     state.stakeholderFeedback.map((f) => (
                       <div key={f.id} className="flex-shrink-0 w-80 bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                         <div className="flex items-center gap-3 mb-4">
                           <img src={f.avatar} className="w-10 h-10 rounded-full shadow-sm" alt={f.name} />
                           <div>
                             <p className="text-sm font-bold text-on-surface">{f.name}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-black">{f.role}</p>
                           </div>
                         </div>
                         <p className="text-sm text-slate-600 leading-relaxed italic">"{f.message}"</p>
                       </div>
                     ))
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT PANEL: GAUGES */}
      <div className="col-span-12 lg:col-span-3 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 ml-2 flex items-center gap-2">
            <BarChart3 size={12} /> Execution Dashboard
          </p>
          
          <div className="space-y-12">
            {[
              { label: 'Financial Runway', icon: Wallet, value: state.budget, max: 100000, color: 'emerald', prefix: '$' },
              { label: 'Social Impact', icon: Sparkles, value: state.socialImpact, max: 100, color: 'primary', suffix: '%' },
              { label: 'Stakeholder Trust', icon: Heart, value: state.trust, max: 100, color: 'blue', suffix: '%' },
              { label: 'Team Momentum', icon: TrendingUp, value: state.momentum, max: 100, color: 'amber', suffix: '%' },
            ].map((g) => (
              <div key={g.label} className="space-y-4">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-xl", `bg-${g.color}-50 text-${g.color}-600`)}>
                        <g.icon size={16} />
                      </div>
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-tighter">{g.label}</span>
                   </div>
                   <span className="text-xl font-headline font-black text-on-surface">
                     {g.prefix}{g.value.toLocaleString()}{g.suffix}
                   </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (g.value / g.max) * 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 shadow-inner",
                      g.color === 'primary' ? "bg-primary" : `bg-${g.color}-500`
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle size={14} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase text-slate-400">Risk Assessment</span>
               </div>
               <p className="text-xs text-slate-600 leading-snug">
                 {state.trust < 40 ? "Trust levels critical. Stakeholders may withdraw support soon." : 
                  state.budget < 10000 ? "Low runway detected. Focus on revenue-generating decisions." :
                  "Execution trajectory stable. Momentum is high."}
               </p>
             </div>
             
             <button 
               onClick={exportCSV}
               className="w-full flex items-center justify-center gap-2 py-4 bg-primary/5 border-2 border-primary/10 rounded-3xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
             >
               <Download size={18} /> Export Data
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
