import React, { useState, useEffect } from 'react';
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
  Zap,
  RotateCcw,
  Trophy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, cleanJsonParse } from '../lib/utils';
import { toast } from 'sonner';
import { useSimulation, ChallengeOption } from '../context/SimulationContext';
import { AcceleratorAnalysis } from './AcceleratorAnalysis';

export function ActiveWorkspace() {
  const { state, updateState, undoDecision } = useSimulation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalMilestones = 3;
  const turnsPerMilestone = 4;
  
  const milestoneDetails = [
    { name: "Strategic Foundation", Goal: "Community Trust & Validation" },
    { name: "Operational Growth", Goal: "Process Efficiency & Scaling" },
    { name: "Global Impact", Goal: "Sustainability & Ecosystem Influence" }
  ];

  const currentMilestone = milestoneDetails[state.currentMilestoneIndex] || milestoneDetails[0];

  useEffect(() => {
    if (state.currentPhase === 'execution' && state.status === 'active' && !state.currentChallenge && !isGenerating && !showReport) {
      generateNextChallenge(state.lastDecision);
    }
  }, [state.currentChallenge, state.status, state.currentPhase, showReport]);

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
        Language: ${state.gameLanguage || 'English'}
        Current Status - Trust: ${state.trust}%, Impact: ${state.socialImpact}%, Budget: $${state.budget.toLocaleString()}
        
        ${isBankrupt ? 'CRITICAL: Out of funds! Focus on emergency measures.' : ''}
        ${previousChoiceText ? `The user last decided: "${previousChoiceText}". Respond specifically to this.` : 'This is the start.'}
        
        Generate a new scenario JSON:
        {
          "title": "Short title",
          "description": "Detailed 2-3 sentence description.",
          "quote": "A quote from a stakeholder",
          "visual_keyword": "object like 'water-tank'",
          "stakeholder_reaction": { "name": "Name", "role": "Role", "message": "Reaction text" },
          "options": [
            { "text": "Option 1", "effect_trust": 5, "effect_impact": 10, "effect_budget": -5000, "effect_momentum": 5 },
            { "text": "Option 2", "effect_trust": -2, "effect_impact": 15, "effect_budget": -12000, "effect_momentum": 8 },
            { "text": "Option 3", "effect_trust": 10, "effect_impact": 5, "effect_budget": -2000, "effect_momentum": 2 },
            { "text": "Option 4", "effect_trust": -8, "effect_impact": 2, "effect_budget": -0, "effect_momentum": 0 }
          ]
        }
      `;
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: `Social Entrepreneurship Simulator. JSON ONLY. Language: ${state.gameLanguage || 'English'}` },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const textResponse = data.choices[0]?.message?.content || '{}';
      const newChallenge = cleanJsonParse(textResponse);
      
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
        stakeholderFeedback: updatedFeedback
      });
    } catch (e) {
      toast.error('Phase Sync Failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDecision = async (option: ChallengeOption) => {
    if (!state.currentChallenge) return;
    
    const newTurnCount = (state.turnCount || 0) + 1;
    const momentumEffect = (option as any).effect_momentum || 0;

    const newState = {
      budget: Math.max(0, state.budget + option.effect_budget),
      socialImpact: Math.min(100, Math.max(0, state.socialImpact + option.effect_impact)),
      trust: Math.min(100, Math.max(0, state.trust + option.effect_trust)),
      momentum: Math.min(100, Math.max(0, state.momentum + momentumEffect)),
      impactScore: Math.round(state.impactScore + (option.effect_impact * 2) + (option.effect_trust * 1.5)),
      turnCount: newTurnCount,
    };

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
      ...newState,
      timeElapsed: state.timeElapsed + 1,
      lastDecision: option.text,
      decisions: [...(state.decisions || []), historyItem],
      currentChallenge: undefined 
    });

    if (newTurnCount % turnsPerMilestone === 0) {
      setShowReport(true);
    }
  };

  const exportCSV = () => {
    try {
      const headers = ['Round', 'Challenge', 'Execution Move', 'Trust Level', 'Impact Level', 'Budget Runway'];
      const rows = (state.decisions || []).map((d, i) => [
        `Round ${i + 1}`,
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
      link.download = `Yukti_Strategic_Report_${state.scenarioId}.csv`;
      link.click();
      toast.success('Strategy Report Exported!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const phases = [
    { id: 'discovery', label: 'Discovery', icon: Radio },
    { id: 'strategy', label: 'Strategy', icon: BarChart3 },
    { id: 'execution', label: 'Execution', icon: Play },
  ];

  const operatingSustainability = Math.round((state.trust * 0.4) + (state.socialImpact * 0.4) + ((state.budget / 100000) * 20));

  return (
    <div className="grid grid-cols-12 gap-10 items-start min-h-[85vh] pb-20">
      {/* PHASE NAVIGATION */}
      <div className="col-span-12 lg:col-span-1 flex flex-col items-center">
        <div className="bg-slate-900 p-4 rounded-full border border-slate-800 shadow-2xl flex flex-col h-fit items-center w-18 gap-8 relative">
           <div className="absolute top-10 bottom-10 w-[2px] bg-slate-800 z-0" />
           {phases.map((p) => (
             <button
               key={p.id}
               onClick={() => updateState({ currentPhase: p.id as any })}
               className={cn(
                 "group relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                 state.currentPhase === p.id 
                   ? "bg-primary border-primary text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.4)]" 
                   : "bg-slate-950 border-slate-800 text-slate-600 hover:border-primary/50 hover:text-primary"
               )}
             >
               <p.icon size={20} />
               <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg font-black tracking-widest uppercase pointer-events-none whitespace-nowrap shadow-2xl z-50">
                 {p.label}
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* STAGE AREA */}
      <div className="col-span-12 lg:col-span-8">
        <AnimatePresence mode="wait">
          {state.status === 'completed' ? (
            <motion.div 
               key="completed"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                  <Trophy size={200} />
               </div>
               <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                     <Trophy size={40} />
                  </div>
                  <h2 className="text-6xl font-black text-white italic tracking-tighter">Strategic Victory.</h2>
                  <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Mission: {state.scenarioName}</p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: 'Social Impact', value: state.socialImpact, icon: Heart, color: 'text-rose-500' },
                    { label: 'Public Trust', value: state.trust, icon: Users, color: 'text-blue-400' },
                    { label: 'Sustainability', value: operatingSustainability, icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Mission Score', value: state.impactScore, icon: Sparkles, color: 'text-primary' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 text-center">
                       <stat.icon className={cn("mx-auto mb-4", stat.color)} size={24} />
                       <p className="text-3xl font-black text-white">{stat.value}{stat.label !== 'Mission Score' ? '%' : ''}</p>
                       <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-2">{stat.label}</p>
                    </div>
                  ))}
               </div>

               <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[3rem] mb-10">
                  <h3 className="text-2xl font-black text-white mb-6 italic flex items-center gap-3">
                    <Zap className="text-primary" /> Strategic Review Conclusion
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed italic opacity-90">
                    "The {state.scenarioName} mission has solidified its position in the ecosystem. 
                    With a sustainability rating of {operatingSustainability}%, your venture has balanced growth with integrity. 
                    Your strategic moves are now archived in the project history."
                  </p>
                  <div className="mt-10 flex gap-6">
                     <button onClick={exportCSV} className="flex-1 bg-white/5 hover:bg-white/10 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all border border-white/5 flex items-center justify-center gap-3">
                        <Download size={18} /> Export Full Report
                     </button>
                     <button onClick={() => updateState({ status: 'active', currentPhase: 'strategy' })} className="flex-1 bg-primary text-slate-950 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                        Re-evaluate Strategy
                     </button>
                  </div>
               </div>
            </motion.div>
          ) : (
            <>
              {state.currentPhase === 'discovery' && (
                <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-20 flex flex-col items-center text-center">
                   <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-10 animate-pulse">
                      <Radio size={48} />
                   </div>
                   <h3 className="text-5xl font-black text-white mb-6 italic">Identifying Opportunity.</h3>
                   <p className="text-slate-500 text-xl max-w-md leading-relaxed mb-12">Capture the core of your mission. Our AI engines are synchronizing with your pitch.</p>
                   <button onClick={() => updateState({ currentPhase: 'strategy' })} className="bg-primary text-slate-950 px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-4 transition-all active:scale-95 shadow-2xl shadow-primary/20">
                      Phase Start: Strategy Lab <ArrowRight />
                   </button>
                </motion.div>
              )}

              {state.currentPhase === 'strategy' && (
                <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                   <AcceleratorAnalysis />
                   <div className="mt-8 flex justify-end">
                      <button onClick={() => updateState({ currentPhase: 'execution' })} className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">
                        Launch Live Execution <Zap size={20} />
                      </button>
                   </div>
                </motion.div>
              )}

              {state.currentPhase === 'execution' && (
                <motion.div key="execution" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   {/* MILESTONE CONTROL */}
                   <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary font-black text-xl">
                            {state.currentMilestoneIndex + 1}<span className="text-slate-700 text-sm">/3</span>
                         </div>
                         <div>
                            <h4 className="text-2xl font-black text-white italic tracking-tight">{currentMilestone.name}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{currentMilestone.Goal}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="bg-slate-950 px-6 py-2 rounded-2xl border border-slate-800 text-center">
                            <p className="text-[9px] font-black uppercase text-slate-700 mb-1">Current Turn</p>
                            <p className="text-xl font-black text-white">{(state.turnCount % 4) || 4}<span className="text-slate-600 text-sm">/4</span></p>
                         </div>
                         {!isGenerating && state.decisions.length > 0 && (
                            <button onClick={handleUndo} className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all">
                               <RotateCcw size={20} />
                            </button>
                         )}
                      </div>
                   </div>

                   {showReport ? (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border-t-8 border-primary p-12 rounded-[3rem] shadow-2xl text-white relative">
                         <h3 className="text-4xl font-black mb-8 italic tracking-tighter">Strategic Review: M{state.currentMilestoneIndex + 1}</h3>
                         <div className="grid grid-cols-2 gap-10 mb-12">
                            <div className="space-y-4">
                               <label className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Growth & Impact</label>
                               <div className="space-y-3">
                                  {state.decisions.slice(-turnsPerMilestone).map((d: any, i) => (
                                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                                       <p className="text-white font-bold leading-tight">{d.chosenOption.text}</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-4">
                               <label className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Resource Allocation</label>
                               <div className="space-y-3">
                                  {state.decisions.slice(-turnsPerMilestone).map((d: any, i) => (
                                    <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                                       <p className="text-rose-500 font-black">-${Math.abs(d.chosenOption.effect_budget).toLocaleString()}</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={() => {
                              if (state.currentMilestoneIndex >= 2) updateState({ status: 'completed' });
                              else {
                                 updateState({ currentMilestoneIndex: state.currentMilestoneIndex + 1 });
                                 setShowReport(false);
                              }
                           }}
                           className="w-full bg-primary text-slate-950 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                         >
                            Proceed to Phase {state.currentMilestoneIndex + 2} <ArrowRight />
                         </button>
                      </motion.div>
                   ) : (
                      <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden flex flex-col min-h-[600px] shadow-2xl relative">
                         {isGenerating ? (
                           <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-slate-900/50 backdrop-blur-md z-50">
                              <Loader2 className="w-16 h-16 text-primary animate-spin" />
                              <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Calculating Multi-Stakeholder Impact...</p>
                           </div>
                         ) : (
                           <>
                             {/* MINIMIZED IMAGE SECTION */}
                             <div className="relative h-64 overflow-hidden border-b border-slate-800">
                                <img 
                                   src={`https://picsum.photos/seed/${(state.currentChallenge as any)?.visual_keyword || 'impact'}/800/400`} 
                                   className="w-full h-full object-cover opacity-50"
                                   alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                <div className="absolute top-8 left-8">
                                   <div className="bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full backdrop-blur-md">
                                      <p className="text-primary uppercase font-black text-[10px] tracking-widest">Active Dilemma</p>
                                   </div>
                                </div>
                             </div>

                             {/* CHALLENGE CONTENT */}
                             <div className="p-12 flex-1 flex flex-col">
                                <h3 className="text-4xl font-black text-white mb-6 italic leading-tight tracking-tighter">
                                   {state.currentChallenge?.title}
                                </h3>
                                <p className="text-xl text-slate-400 font-medium leading-relaxed italic mb-12 opacity-80">
                                   "{state.currentChallenge?.description}"
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                                   {state.currentChallenge?.options.map((opt, i) => (
                                     <button
                                       key={i}
                                       onClick={() => handleDecision(opt)}
                                       className="bg-slate-950 hover:bg-primary border-2 border-slate-800 hover:border-primary p-6 rounded-[2rem] text-left transition-all group flex items-center justify-between active:scale-95"
                                     >
                                        <span className="text-lg font-black text-slate-400 group-hover:text-slate-950 transition-colors leading-tight">{opt.text}</span>
                                        <ArrowRight size={20} className="text-slate-700 group-hover:text-slate-950 opacity-0 group-hover:opacity-100 transition-all" />
                                     </button>
                                   ))}
                                </div>
                             </div>
                           </>
                         )}
                      </div>
                   )}

                   {/* STAKEHOLDER COUNCIL */}
                   <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl overflow-hidden">
                      <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em] mb-8">Executive Sentiment</h4>
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                         {state.stakeholderFeedback.map((f) => (
                           <div key={f.id} className="flex-shrink-0 w-80 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-primary/20 transition-all">
                              <div className="flex items-center gap-4 mb-4">
                                 <img src={f.avatar} className="w-12 h-12 rounded-2xl border border-slate-800" alt="" />
                                 <div>
                                    <p className="text-white font-black text-sm">{f.name}</p>
                                    <p className="text-[9px] font-black uppercase text-primary tracking-widest">{f.role}</p>
                                 </div>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed italic font-medium">"{f.message}"</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* GAUGES SIDEBAR */}
      <div className="col-span-12 lg:col-span-3 space-y-6">
         <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl sticky top-32">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 text-center mb-10">System Vitals</h5>
            <div className="space-y-10">
               {[
                 { label: 'Budget Runway', value: state.budget, max: 100000, color: 'text-emerald-400', bar: 'bg-emerald-400', icon: Wallet, prefix: '$' },
                 { label: 'Impact Factor', value: state.socialImpact, max: 100, color: 'text-rose-500', bar: 'bg-rose-500', icon: Heart, suffix: '%' },
                 { label: 'Stakeholder Trust', value: state.trust, max: 100, color: 'text-blue-400', bar: 'bg-blue-400', icon: Users, suffix: '%' },
                 { label: 'Sustainability Index', value: operatingSustainability, max: 100, color: 'text-primary', bar: 'bg-primary', icon: TrendingUp, suffix: '%' }
               ].map((v) => (
                 <div key={v.label} className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-3">
                          <v.icon className={v.color} size={16} />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">{v.label}</span>
                       </div>
                       <p className="text-xl font-black text-white">{v.prefix}{v.value.toLocaleString()}{v.suffix}</p>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(100, (v.value / v.max) * 100)}%` }}
                         className={cn("h-full", v.bar)}
                       />
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/50 space-y-4">
               <div className="bg-slate-950 p-5 rounded-[1.5rem] border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                     <AlertTriangle size={12} className="text-amber-500" />
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Strategic Alert</label>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                     {state.budget < 10000 ? "🚨 RUNWAY CRITICAL. SOURCE EMERGENCY FUNDING." : 
                      state.trust < 40 ? "⚠️ TRUST BREACH. REDESIGN COMMUNITY CHANNELS." : 
                      "✅ ALL SYSTEMS NOMINAL. MISSION IS STABLE."}
                  </p>
               </div>
               <button onClick={exportCSV} className="w-full flex items-center justify-center gap-3 py-5 bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                  <Download size={18} className="group-hover:translate-y-0.5 transition-all" /> Strategy Report
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
