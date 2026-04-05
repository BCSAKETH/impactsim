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
  Circle, 
  FileText, 
  LayoutDashboard, 
  Target, 
  Rocket, 
  ChevronRight, 
  Brain, 
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, cleanJsonParse } from '../lib/utils';
import { toast } from 'sonner';
import { useSimulation, ChallengeOption } from '../context/SimulationContext';
import { AcceleratorAnalysis } from './AcceleratorAnalysis';
import { RoadmapFlowchart } from './RoadmapFlowchart';
import { AIMeetingRoom } from './AIMeetingRoom';
import { useAuth } from '../context/AuthContext';
import { getMentorFeedback } from '../services/geminiService';

export function ActiveWorkspace({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { state, updateState, undoDecision, t } = useSimulation();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalMilestones = 3;
  const turnsPerMilestone = 4;
  
  const milestoneDetails = [
    { name: t('milestone_1_name'), Goal: t('milestone_1_goal') },
    { name: t('milestone_2_name'), Goal: t('milestone_2_goal') },
    { name: t('milestone_3_name'), Goal: t('milestone_3_goal') }
  ];

  const currentMilestone = milestoneDetails[state.currentMilestoneIndex] || milestoneDetails[0];

  useEffect(() => {
    // Kick off generation if we are in execution phase and don't have a challenge
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
        Language: ${state.gameLanguage || 'English'} (ALL JSON values must be in this language)
        Current Status - Trust: ${state.trust}%, Impact: ${state.socialImpact}%, Budget: $${(state.budget ?? 0).toLocaleString()}, Momentum: ${state.momentum}%
        
        ${isBankrupt ? 'CRITICAL: Out of funds! Focus on emergency measures.' : ''}
        ${previousChoiceText ? `The user last decided: "${previousChoiceText}". Respond specifically to this.` : 'This is the start.'}
        
        Generate a new scenario JSON:
        {
          "title": "Short title",
          "description": "Detailed 2-3 sentence description of the dilemma.",
          "quote": "A quote from a stakeholder",
          "visual_keyword": "A single descriptive word for an image (e.g., 'solar-farm')",
          "stakeholder_reaction": { 
            "name": "Stakeholder Name", 
            "role": "Role", 
            "message": "Reaction to user's PREVIOUS action: '${previousChoiceText}'. Was it smart? risky? Why?" 
          },
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
            { role: 'system', content: `Social Entrepreneurship Simulator. STRICT JSON ONLY. Language: ${state.gameLanguage || 'English'}` },
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
      toast.error(t('error_generation'));
    } finally {
      setIsGenerating(false);
    }
  };

  const [isShaking, setIsShaking] = useState(false);

  const handleDecision = async (option: ChallengeOption) => {
    if (!state.currentChallenge) return;
    
    const newTurnCount = (state.turnCount || 0) + 1;
    const momentumEffect = (option as any).effect_momentum || 0;

    const fatigueMultiplier = 1 + (newTurnCount * 0.05);
    
    let adjustedTrustEffect = option.effect_trust;
    if (adjustedTrustEffect > 0) {
      adjustedTrustEffect = Math.round(adjustedTrustEffect / fatigueMultiplier);
    } else if (adjustedTrustEffect < 0) {
      adjustedTrustEffect = Math.round(adjustedTrustEffect * fatigueMultiplier);
    }

    if (adjustedTrustEffect <= -3 || option.effect_budget <= -5000) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.warning(t('friction_warning'), {
        description: t('friction_desc')
      });
    }

    const newState = {
      budget: Math.max(0, state.budget + option.effect_budget),
      socialImpact: Math.min(100, Math.max(0, state.socialImpact + option.effect_impact)),
      trust: Math.min(100, Math.max(0, state.trust + adjustedTrustEffect)),
      momentum: Math.min(100, Math.max(0, state.momentum + momentumEffect)),
      impactScore: Math.round(state.impactScore + (option.effect_impact * 2) + (adjustedTrustEffect * 1.5)),
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

    // Trigger Mentor Feedback after every decision
    try {
      const feedback = await getMentorFeedback(state, option);
      updateState({ mentorFeedback: feedback });
    } catch (err) {
      console.error("Mentor Feedback Error:", err);
    }

    if (newTurnCount % turnsPerMilestone === 0) {
      setShowReport(true);
    }
  };

  const nextMilestone = async () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      await updateState({ currentMilestoneIndex: Math.min(totalMilestones - 1, state.currentMilestoneIndex + 1) });
      setShowReport(false);
      setIsTransitioning(false);
    }, 800);
  };

  const handleUndo = async () => {
    await undoDecision();
    toast.info(t('reverted_decision'));
  };

  const exportCSV = () => {
    try {
      const headers = ['Milestone', 'Challenge', 'Decision', 'Trust', 'Impact', 'Budget'];
      const rows = (state.decisions || []).map((d, i) => [
        `Milestone ${Math.floor(i / 4) + 1}`,
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
      link.download = `Yukti_Blueprint_${state.scenarioId}.csv`;
      link.click();
      toast.success(t('report_exported'));
    } catch (err) {
      toast.error(t('export_failed'));
    }
  };

  const phases = [
    { id: 'discovery', label: t('discovery'), icon: Radio },
    { id: 'strategy', label: t('strategy'), icon: BarChart3 },
    { id: 'execution', label: t('execution'), icon: Play },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 items-start min-h-[85vh]">
      <div className="col-span-12 lg:col-span-1 flex justify-center">
        <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 flex flex-col h-fit items-center w-16">
          <div className="space-y-8 relative w-full flex flex-col items-center py-4">
            <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-0.5 bg-slate-100 z-0" />
            {phases.map((p) => (
              <button
                key={p.id}
                onClick={() => updateState({ currentPhase: p.id as any })}
                className={cn(
                  "group relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md border-2",
                  state.currentPhase === p.id 
                    ? "bg-primary border-primary text-white scale-125" 
                    : "bg-white border-slate-100 text-slate-300 hover:border-primary/30 hover:text-primary"
                )}
              >
                <p.icon size={16} />
                <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-2 py-1 rounded font-black whitespace-nowrap pointer-events-none uppercase tracking-widest">
                  {p.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 h-full min-h-[700px]">
        <AnimatePresence mode="wait">
          {state.status === 'completed' ? (
            <motion.div 
               key="completion"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="space-y-12"
            >
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-emerald-500/20 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
                
                <div className="text-center mb-12">
                   <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                      <Trophy size={40} />
                   </div>
                   <h2 className="text-5xl font-headline font-black text-slate-900 tracking-tighter">{t('mission_accomplished')}</h2>
                   <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">{t('dossier')}: {state.scenarioName}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                   {[
                     { label: t('final_impact'), value: Math.max(0, Math.min(100, state.socialImpact)), icon: Heart, color: 'text-primary' },
                     { label: t('public_trust'), value: Math.max(0, Math.min(100, state.trust)), icon: Users, color: 'text-blue-500' },
                     { label: t('sustainability'), value: Math.min(100, Math.max(0, Math.round((state.trust * 0.4) + (state.socialImpact * 0.4) + ((state.budget / 100000) * 20)))), icon: TrendingUp, color: 'text-emerald-500' },
                     { label: t('total_score'), value: state.impactScore, icon: Sparkles, color: 'text-amber-500' }
                   ].map(kpi => (
                     <div key={kpi.label} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                        <kpi.icon className={cn("mx-auto mb-3", kpi.color)} size={24} />
                        <p className="text-3xl font-black text-slate-900">{(kpi.value ?? 0).toLocaleString()}{kpi.label !== t('total_score') ? '%' : ''}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{kpi.label}</p>
                     </div>
                   ))}
                </div>

                <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white mb-10 border-t-8 border-emerald-500">
                   <h3 className="text-2xl font-black mb-4 italic tracking-tight flex items-center gap-2">
                      <Zap className="text-emerald-400" /> Executive Strategic Review
                   </h3>
                   <p className="text-slate-400 text-lg leading-relaxed italic">
                      "Your leadership across the {state.scenarioName} mission has demonstrated exceptional {state.trust > 70 ? 'community trust building' : 'resource utilization'}. 
                      With a final sustainability index of {Math.round((state.trust * 0.4) + (state.socialImpact * 0.4) + ((state.budget / 100000) * 20))}%, 
                      your model qualifies for Tier-1 accelerator considerations and scale-up grants."
                   </p>

                   {/* Final Mentor Review Card */}
                   {state.mentorFeedback && (
                      <div className="mt-10 bg-emerald-500/5 rounded-3xl p-8 border border-emerald-500/10">
                         <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-emerald-500" size={20} />
                            <h4 className="text-sm font-black uppercase text-emerald-400 tracking-widest">Yukti's Final Strategic Critique</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                               <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mentor Critique</span>
                               <p className="text-sm font-medium text-slate-300 italic">"{state.mentorFeedback.critique}"</p>
                            </div>
                            <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 text-center flex flex-col justify-center">
                               <p className="text-[10px] font-black uppercase text-emerald-400 block mb-2">Final Strategic Improvement</p>
                               <p className="text-lg font-black text-white leading-tight tracking-tight">"{state.mentorFeedback.improvement}"</p>
                            </div>
                         </div>
                      </div>
                   )}

                   <div className="mt-8 flex gap-4">
                      <button onClick={exportCSV} className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Download Master Report</button>
                      <button onClick={() => updateState({ status: 'active', currentPhase: 'strategy' })} className="flex-1 bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center">Optimize Strategy</button>
                   </div>
                </div>
              </div>

              <RoadmapFlowchart decisions={state.decisions || []} />

              <button 
                onClick={() => updateState({ currentPhase: 'discovery', status: 'active', decisions: [], turnCount: 0, budget: 50000, socialImpact: 0, trust: 50, impactScore: 0, currentMilestoneIndex: 0 })}
                className="w-full py-6 bg-white text-slate-400 hover:text-primary rounded-3xl font-black uppercase tracking-widest text-sm transition-all border-2 border-dashed border-slate-200"
              >
                Archive Mission & Restart Simulator
              </button>
            </motion.div>
          ) : (
            <React.Fragment>
              {state.currentPhase === 'discovery' && (
                <motion.div 
                   key="discovery"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center text-center space-y-8"
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
                    Enter Strategy Lab →
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
                      className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:translate-y-[-2px] transition-all"
                    >
                      Enter Live Execution <Zap size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {state.currentPhase === 'execution' && (
                <motion.div 
                   key={`execution-milestone-${state.currentMilestoneIndex}`}
                   initial={isTransitioning ? { x: "100%", opacity: 0 } : { opacity: 0, y: 20 }}
                   animate={{ x: 0, opacity: 1, y: 0 }}
                   exit={{ x: "-100%", opacity: 0 }}
                   transition={{ type: "spring", damping: 25, stiffness: 120 }}
                   className="space-y-6 relative"
                >
                  <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                           <motion.circle 
                             cx="32" cy="32" r="28" 
                             stroke="currentColor" 
                             className="text-primary"
                             strokeWidth="5" 
                             fill="none"
                             strokeDasharray="175.9"
                             animate={{ strokeDashoffset: 175.9 - (175.9 * ((state.turnCount % turnsPerMilestone || turnsPerMilestone) / turnsPerMilestone)) }}
                             strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-on-surface text-sm">
                           {state.currentMilestoneIndex + 1}/3
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-on-surface uppercase tracking-tight">
                          {currentMilestone.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{currentMilestone.Goal}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex gap-3">
                       <div className="bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-center">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Turn</p>
                         <p className="text-lg font-black text-primary">{(state.turnCount % 4) || 4}<span className="text-sm text-slate-300">/4</span></p>
                       </div>
                    </div>
                  </div>

                  {showReport ? (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                          <Trophy size={200} />
                        </div>
                        <h3 className="text-4xl font-headline font-black mb-1 tracking-tighter">
                          {state.currentMilestoneIndex >= 2 && state.turnCount >= 12 ? 'FINAL BLUEPRINT AUDIT' : `Milestone ${state.currentMilestoneIndex + 1} Briefing`}
                        </h3>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[9px] mb-8">Impact & Resource Audit</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                           <div className="space-y-4">
                             <h4 className="font-black text-emerald-400 uppercase text-xs tracking-widest flex items-center gap-2">
                               <CheckCircle size={14} /> Strategic Benefits
                             </h4>
                             <div className="space-y-3">
                               {state.decisions.slice(-turnsPerMilestone).map((d: any, i) => (
                                 <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                   <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{d.challenge.title}</p>
                                   <p className="font-bold text-slate-200 text-sm">{d.chosenOption.text}</p>
                                 </div>
                               ))}
                             </div>
                           </div>
                           <div className="space-y-4">
                             <h4 className="font-black text-amber-400 uppercase text-xs tracking-widest flex items-center gap-2">
                               <AlertCircle size={14} /> Resource Burn
                             </h4>
                             <div className="space-y-3">
                               {state.decisions.slice(-turnsPerMilestone).map((d: any, i) => (
                                 <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                   <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{d.challenge.title}</p>
                                   <p className="text-lg font-black text-red-400">-${(Math.abs(d.chosenOption.effect_budget) ?? 0).toLocaleString()}</p>
                                 </div>
                               ))}
                             </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <button 
                          onClick={() => {
                            if (state.currentMilestoneIndex >= 2) {
                              updateState({ status: 'completed' });
                            } else {
                              nextMilestone();
                            }
                          }}
                          className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          {state.currentMilestoneIndex >= 2 ? 'VIEW FINAL ANALYSIS' : 'PROCEED TO NEXT MILESTONE'} <ArrowRight />
                        </button>
                        <button 
                          onClick={() => setActiveTab('boardroom')}
                          className="group/btn relative px-8 py-5 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-500 transition-all shadow-xl shadow-teal-900/10 overflow-hidden flex items-center gap-3"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-800 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
                          <Users size={16} className="relative z-10" />
                          <span className="relative z-10">Boardroom Simulation</span>
                        </button>
                      </div>
                     </motion.div>
                  ) : (
                    <motion.section 
                      animate={isShaking ? {
                        x: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.4 }
                      } : {}}
                      className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-slate-100 flex flex-col min-h-[500px] relative overflow-hidden group"
                    >
                      <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                           <span className="bg-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">Active Simulation</span>
                           {!isGenerating && state.decisions.length > 0 && (
                             <button onClick={handleUndo} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-all">
                               <RotateCcw size={16} />
                             </button>
                           )}
                        </div>

                        {isGenerating ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                              <div className="w-20 h-20 border-6 border-primary/10 border-t-primary rounded-full animate-spin" />
                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
                            </div>
                            <div className="text-center">
                              <p className="text-slate-400 font-black tracking-[0.2em] uppercase text-[10px]">Synchronizing Social Landscape...</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative h-60 -mx-8 -mt-2 mb-8 overflow-hidden border-b-4 border-slate-50">
                              <img 
                                src={`https://picsum.photos/seed/${(state.currentChallenge as any)?.visual_keyword || 'impact'}/800/400`} 
                                alt="Visual Context" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                            </div>
                            <h3 className="text-3xl font-headline font-black text-on-surface mb-4 leading-tight tracking-tight">
                              {typeof state.currentChallenge?.title === 'string' ? state.currentChallenge?.title : JSON.stringify(state.currentChallenge?.title)}
                            </h3>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8 italic font-medium opacity-80">
                              {typeof state.currentChallenge?.description === 'string' ? state.currentChallenge?.description : JSON.stringify(state.currentChallenge?.description)}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                              {state.currentChallenge?.options.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleDecision(opt)}
                                  className="bg-slate-50 border-2 border-transparent p-6 rounded-[2rem] text-left hover:border-primary hover:bg-white transition-all group relative active:scale-[0.98] shadow-sm hover:shadow-xl"
                                >
                                  <p className="font-black text-on-surface text-lg mb-1 group-hover:text-primary transition-colors pr-8 leading-tight">
                                    {typeof opt.text === 'string' ? opt.text : JSON.stringify(opt.text)}
                                  </p>
                                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all absolute top-6 right-6">
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.section>
                  )}

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
                      <Users size={14} className="text-primary" /> Council Sentiment
                    </h4>
                    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
                       {state.stakeholderFeedback.length === 0 ? (
                         <div className="w-full text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-bold italic text-sm">Observing baseline metrics...</p>
                         </div>
                       ) : (
                         state.stakeholderFeedback.map((f) => (
                           <div key={f.id} className="flex-shrink-0 w-80 bg-slate-50 p-6 rounded-[2rem] border-2 border-white hover:bg-white hover:shadow-lg transition-all group">
                             <div className="flex items-center gap-3 mb-4">
                               <img src={f.avatar} className="w-10 h-10 rounded-xl shadow-md border-2 border-white" alt={f.name} />
                               <div>
                                 <p className="text-sm font-black text-on-surface leading-tight">{f.name}</p>
                                 <p className="text-[8px] text-primary uppercase font-black tracking-widest">{f.role}</p>
                               </div>
                             </div>
                             <p className="text-xs text-slate-600 leading-relaxed italic font-medium">"{f.message}"</p>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 text-center flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-slate-100" />
            Core Vitals
            <div className="w-8 h-0.5 bg-slate-100" />
          </p>
          
          <div className="space-y-8">
            {[
              { 
                label: 'Financial Runway', 
                icon: Wallet, 
                value: state.budget || 0, 
                max: 100000, 
                color: 'emerald', 
                prefix: '$' 
              },
              { 
                label: 'Social Impact', 
                icon: Sparkles, 
                value: state.socialImpact || 0, 
                max: 100, 
                color: 'primary', 
                suffix: '%' 
              },
              { 
                label: 'Stakeholder Trust', 
                icon: Heart, 
                value: state.trust || 0, 
                max: 100, 
                color: 'blue', 
                suffix: '%' 
              },
              { 
                label: 'Operational Sustainability', 
                icon: TrendingUp, 
                value: Math.round(((state.trust || 0) * 0.4) + ((state.socialImpact || 0) * 0.4) + (((state.budget || 0) / 100000) * 20)), 
                max: 100, 
                color: 'amber', 
                suffix: '%' 
              },
            ].map((g) => (
              <div key={g.label} className="space-y-3">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-lg border", `bg-${g.color}-50 text-${g.color}-600 border-${g.color}-100`)}>
                        <g.icon size={14} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{g.label}</span>
                   </div>
                   <span className="text-xl font-black text-on-surface">
                     {g.prefix}{(g.value ?? 0).toLocaleString()}{g.suffix}
                   </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
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

          <div className="mt-12 pt-8 border-t-2 border-slate-50 space-y-4">
             <div className="bg-slate-50 p-4 rounded-[1.5rem] border-2 border-slate-100">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle size={12} className="text-amber-500" />
                 <span className="text-[9px] font-black uppercase text-slate-400">Survival Report</span>
               </div>
               <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                 {state.budget < 10000 ? "🚨 INSUFFICIENT FUNDS. RUNWAY DEPLETED." : 
                  state.trust < 40 ? "⚠️ TRUST BREACH. STAKEHOLDERS RETREATING." : 
                  "✅ MODEL STABLE. PROCEED WITH GROWTH."}
               </p>
             </div>
             
             <button 
               onClick={exportCSV}
               className="w-full flex items-center justify-center gap-2 py-4 bg-primary/5 border-2 border-primary/10 rounded-2xl text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm group"
             >
               <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Project Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
