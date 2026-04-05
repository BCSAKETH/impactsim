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
  Flame,
  Star,
  Shield,
  ZapOff,
  Map as MapIcon,
  Tent,
  Factory,
  Globe as GlobeIcon
} from 'lucide-react';
import { cn, cleanJsonParse } from '../lib/utils';
import { toast } from 'sonner';

interface SprintProps {
  idea: string;
  language: string;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

const HEROES = {
  Visionary: {
    name: 'The Visionary',
    image: "/assets/cartoon/visionary.png",
    accent: 'bg-primary',
    slogan: 'I see a world of change!'
  },
  Builder: {
    name: 'The Builder',
    image: "/assets/cartoon/builder.png",
    accent: 'bg-amber-400',
    slogan: 'Let\'s build the foundation!'
  }
};

const STAKEHOLDER_EMOJIS: Record<string, string> = {
  success: '😍',
  neutral: '🤔',
  warning: '😲',
  error: '😡'
};

const POPUP_TEXTS = ["BOOM!", "IMPACT!", "CRITICAL!", "STRATEGY!", "LEVEL UP!", "WATTAGE!"];

const PERKS = [
  { id: 'shield', name: 'Policy Shield', desc: 'No energy loss for 1 turn', icon: Shield, color: 'text-blue-500' },
  { id: 'boost', name: 'Impact Boost', desc: '+10% Impact on next win', icon: Zap, color: 'text-amber-500' },
  { id: 'coffee', name: 'Strategic Coffee', desc: '+20 Mental Energy', icon: Coffee, color: 'text-emerald-500' },
  { id: 'magnet', name: 'Trust Magnet', desc: 'Double combo points', icon: Star, color: 'text-fuchsia-500' }
];

export function SprintGame({ idea: initialIdea, language, onComplete, onCancel }: SprintProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [mode, setMode] = useState<'entry' | 'hero' | 'play' | 'perk' | 'report' | 'result'>(initialIdea ? 'hero' : 'entry');
  const [step, setStep] = useState(1);
  const [maxSteps, setMaxSteps] = useState(5);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [score, setScore] = useState(50);
  const [energy, setEnergy] = useState(100);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reactionEmoji, setReactionEmoji] = useState('😊');
  const [selectedHero, setSelectedHero] = useState<'Visionary' | 'Builder'>('Visionary');
  const [combo, setCombo] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'minor' | 'mega' | 'none'>('none');
  const [popups, setPopups] = useState<{ id: string, text: string, x: number, y: number }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activePerks, setActivePerks] = useState<string[]>([]);
  const [isCrisis, setIsCrisis] = useState(false);
  const [availablePerks, setAvailablePerks] = useState<any[]>([]);

  // Calculate dynamic steps based on idea length/complexity
  useEffect(() => {
    if (idea) {
      const complexity = Math.min(8, Math.max(4, Math.floor(idea.length / 40)));
      setMaxSteps(complexity);
    }
  }, [idea]);

  const triggerPopup = (text: string) => {
    const id = Math.random().toString(36).substring(7);
    const newPopup = { id, text, x: Math.random() * 60 + 20, y: Math.random() * 40 + 30 };
    setPopups(prev => [...prev, newPopup]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1000);
  };

  const triggerShake = (intensity: 'minor' | 'mega') => {
    setShakeIntensity(intensity);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setShakeIntensity('none');
    }, intensity === 'mega' ? 800 : 400);
  };

  const generateSprintTurn = async (currentStep: number) => {
    setLoading(true);
    const isNextCrisis = Math.random() < 0.2 && currentStep > 1;
    setIsCrisis(isNextCrisis);

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      const prompt = `
        You are a Cartoon Game Master. Idea: ${idea}. Turn: ${currentStep}/${maxSteps}. 
        Language: ${language}.
        ${isNextCrisis ? 'THIS IS A CRISIS TURN! Make it high stakes and high stress.' : 'Normal turn.'}
        
        Generate a visual scenario.
        {
          "scene": "${isNextCrisis ? 'STOP! EMERGENCY! ' : ''} Cartoonish drama description",
          "visual_keyword": "object like 'water-tank', 'drone', 'clinic', 'protest', 'fire'",
          "options": [
            { "text": "Action A ${isNextCrisis ? '(Risky Fix)' : '(Safe)'}", "impact": ${isNextCrisis ? 30 : 10}, "energy_cost": ${isNextCrisis ? 20 : 5}, "reaction": "Steady progress!", "mood": "success" },
            { "text": "Action B ${isNextCrisis ? '(Emergency Measure)' : '(Bold)'}", "impact": ${isNextCrisis ? 50 : 25}, "energy_cost": ${isNextCrisis ? 40 : 30}, "reaction": "KA-POW!", "mood": "success" },
            { "text": "Action C ${isNextCrisis ? '(Panic Move)' : '(Risky)'}", "impact": ${isNextCrisis ? -30 : -10}, "energy_cost": ${isNextCrisis ? 10 : 15}, "reaction": "Yikes!", "mood": "warning" }
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
            { role: 'system', content: `Cartoon Game Master. STRICT JSON. Language: ${language}` } ,
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const result = cleanJsonParse(data.choices[0]?.message?.content || '{}');
      setChallenge(result);
    } catch (e) {
      toast.error('Sprint generation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'play') {
      generateSprintTurn(step);
    }
  }, [step, mode]);

  const handleAction = (opt: any) => {
    let { impact, energy_cost: energyCost, reaction, mood } = opt;
    
    // Apply Perks
    if (activePerks.includes('shield')) {
      energyCost = 0;
      setActivePerks(prev => prev.filter(p => p !== 'shield'));
      toast.info('🛡️ Policy Shield Protected You!');
    }
    if (activePerks.includes('boost') && impact > 0) {
      impact += 10;
      setActivePerks(prev => prev.filter(p => p !== 'boost'));
      toast.success('⚡ Impact Boost Activated!');
    }

    setFeedback(reaction);
    setReactionEmoji(STAKEHOLDER_EMOJIS[mood] || '😊');
    
    const turnData = {
      step,
      challengeTitle: challenge.scene.substring(0, 40) + '...',
      choice: opt.text,
      impact,
      energyCost,
      mood
    };
    setHistory([...history, turnData]);

    if (impact > 30) {
      triggerShake('mega');
      triggerPopup('MEGA HIT!');
    } else if (impact > 15) {
      setCombo(prev => prev + 1);
      triggerPopup(POPUP_TEXTS[Math.floor(Math.random() * POPUP_TEXTS.length)]);
      triggerShake('minor');
    } else if (impact < 0) {
      setCombo(0);
      triggerShake('mega');
    } else {
      triggerShake('minor');
    }

    setScore(prev => Math.min(100, Math.max(0, prev + impact + (combo * 2))));
    setEnergy(prev => Math.max(0, prev - energyCost));
    
    setTimeout(() => {
      setFeedback(null);
      if (step === 2 || step === 4 || step === 6) {
        setAvailablePerks(PERKS.sort(() => 0.5 - Math.random()).slice(0, 3));
        setMode('perk');
      } else if (step < maxSteps && energy > energyCost) {
        setStep(prev => prev + 1);
      } else {
        setMode('report');
      }
    }, 2000);
  };

  const selectPerk = (perk: any) => {
    if (perk.id === 'coffee') {
      setEnergy(prev => Math.min(100, prev + 20));
      toast.success('☕ Drank Strategic Coffee! +20 Energy');
    } else {
      setActivePerks(prev => [...prev, perk.id]);
      toast.success(`🎁 Equipped ${perk.name}!`);
    }
    
    if (step < maxSteps) {
      setStep(prev => prev + 1);
      setMode('play');
    } else {
      setMode('report');
    }
  };

  // --- RENDERING PROGRESS MAP ---
  const renderJourneyMap = () => {
    const progress = (step / maxSteps) * 100;
    return (
      <div className="w-full bg-slate-100 border-4 border-slate-900 rounded-full h-8 relative p-1 overflow-hidden">
        <div className="absolute inset-0 flex justify-between px-4 items-center">
           <Tent size={14} className={cn("z-10", step >= 1 ? "text-slate-900" : "text-slate-300")} />
           <Factory size={14} className={cn("z-10", step >= maxSteps / 2 ? "text-slate-900" : "text-slate-300")} />
           <GlobeIcon size={14} className={cn("z-10", step >= maxSteps ? "text-slate-900" : "text-slate-300")} />
        </div>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full relative"
        >
           <motion.div 
             animate={{ y: [0, -2, 0] }}
             transition={{ repeat: Infinity, duration: 0.5 }}
             className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center shadow-lg"
           >
              <span className="text-[10px]">{selectedHero === 'Visionary' ? '🔭' : '🔨'}</span>
           </motion.div>
        </motion.div>
      </div>
    );
  };

  // --- RENDERING PERK SELECT (NEW) ---
  if (mode === 'perk') {
    return (
      <div className="max-w-4xl mx-auto pt-10 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="inline-block bg-primary text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6">Strategic Milestone Reached!</div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-10">CHOOSE YOUR PERK</h2>
          <div className="grid grid-cols-3 gap-6 px-10">
            {availablePerks.map((p) => (
               <button
                 key={p.id}
                 onClick={() => selectPerk(p)}
                 className="bg-white border-8 border-slate-900 rounded-[2.5rem] p-6 hover:-translate-y-2 transition-all shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] group"
               >
                 <div className={cn("w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50 border-4 border-slate-900", p.color)}>
                    <p.icon size={32} />
                 </div>
                 <h3 className="font-black text-lg uppercase leading-tight mb-2">{p.name}</h3>
                 <p className="text-xs font-bold text-slate-400">{p.desc}</p>
               </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- RENDERING ENTRY (MINIMIZED) ---
  if (mode === 'entry') {
    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-white border-8 border-slate-900 rounded-[3rem] p-10 space-y-8 shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
               <Rocket size={32} fill="currentColor" />
             </div>
             <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Impact<br />Sprint</h2>
          </div>
          <textarea 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Type your big idea here..."
            className="w-full h-32 p-6 bg-slate-50 border-4 border-slate-900 rounded-2xl outline-none focus:bg-white transition-all font-bold text-lg"
          />
          <button 
            onClick={() => setMode('hero')}
            disabled={!idea.trim()}
            className="w-full py-6 bg-primary text-white border-4 border-slate-900 rounded-2xl font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:translate-y-2 transition-all uppercase italic"
          >
            START SPRINT →
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING HERO SELECT (MINIMIZED) ---
  if (mode === 'hero') {
    return (
      <div className="max-w-4xl mx-auto pt-6 text-center">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-10">CHOOSE YOUR AVATAR</h2>
        <div className="grid grid-cols-2 gap-10 px-10">
          {Object.entries(HEROES).map(([key, h]) => (
             <button
               key={key}
               onClick={() => { setSelectedHero(key as any); setMode('play'); }}
               className="bg-white border-8 border-slate-900 rounded-[3rem] p-8 transition-all hover:-translate-y-4 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center group"
             >
               <div className="h-48 w-full mb-6 bg-slate-50 rounded-2xl border-4 border-slate-900 flex items-center justify-center p-4">
                 <img src={h.image} alt={h.name} className="h-full object-contain" />
               </div>
               <div className={cn("px-6 py-2 rounded-xl text-white font-black uppercase italic text-lg border-2 border-slate-900 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]", h.accent)}>
                 {h.name}
               </div>
               <p className="text-slate-400 font-bold italic text-sm">{h.slogan}</p>
             </button>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDERING STRATEGIC DOSSIER ---
  if (mode === 'report') {
     return (
       <div className="max-w-3xl mx-auto pt-4 pb-20">
          <div className="bg-white border-8 border-slate-900 rounded-[3.5rem] p-10 shadow-[24px_24px_0px_0px_rgba(15,23,42,1)] relative">
            <div className="text-center mb-10">
              <div className="inline-block bg-slate-900 text-white px-6 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.3em] mb-4">Strategic Dossier</div>
              <h2 className="text-5xl font-black uppercase italic italic tracking-tighter">Impact Audit</h2>
            </div>

            <div className="space-y-4 mb-10">
               {history.map((h, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border-4 border-slate-900 rounded-2xl">
                    <div className={cn("w-12 h-12 rounded-xl border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_black]", h.impact >= 10 ? "bg-emerald-400" : h.impact < 0 ? "bg-red-400" : "bg-blue-400")}>
                      {h.impact >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Round {h.step}: {h.challengeTitle}</p>
                       <p className="font-bold text-slate-800 leading-tight">{h.choice}</p>
                    </div>
                    <div className="text-right">
                       <p className={cn("font-black text-xl italic", h.impact >= 0 ? "text-emerald-600" : "text-red-600")}>
                          {h.impact >= 0 ? '+' : ''}{h.impact}
                       </p>
                       <p className="text-[9px] font-black uppercase text-slate-400">Energy: -{h.energyCost}</p>
                    </div>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => setMode('result')}
              className="w-full py-6 bg-primary text-white border-4 border-slate-100 rounded-3xl font-black text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all"
            >
              FINAL SCORECARD <ChevronRight className="inline ml-2" />
            </button>
          </div>
       </div>
     );
  }

  // --- RENDERING RESULTS ---
  if (mode === 'result') {
    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-white border-8 border-slate-900 rounded-[3rem] p-10 text-center space-y-8 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
           {energy <= 0 ? <Skull size={80} className="text-red-500 mx-auto" /> : <Trophy size={100} className="text-primary mx-auto drop-shadow-lg" />}
           <h2 className="text-5xl font-black uppercase italic tracking-tighter">
             {energy <= 0 ? 'BURN OUT' : score > 75 ? 'LEGENDARY' : 'COMPLETE'}
           </h2>
           <div className="space-y-2">
              <div className="flex justify-between items-end px-2">
                 <span className="font-black text-slate-400 text-[10px] uppercase">Maturity</span>
                 <span className="text-3xl font-black italic">{score}%</span>
              </div>
              <div className="h-10 bg-slate-100 border-4 border-slate-900 rounded-full overflow-hidden p-1">
                <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full bg-primary rounded-full" />
              </div>
           </div>
           <div className="flex gap-4">
             <button onClick={() => { setMode('hero'); setStep(1); setScore(50); setEnergy(100); setHistory([]); }} className="flex-1 py-4 bg-slate-50 border-2 border-slate-900 rounded-2xl font-black">REBOOT</button>
             <button onClick={() => onComplete(score)} className="flex-2 py-4 px-6 bg-primary text-white border-2 border-slate-900 rounded-2xl font-black">CONTINUE →</button>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDERING PLAY ---
  const hero = HEROES[selectedHero];
  return (
    <div className={cn(
      "max-w-5xl mx-auto pt-6 flex flex-col gap-6 items-center pb-20 transition-all duration-100", 
      isShaking && shakeIntensity === 'mega' ? "animate-shake origin-center scale-[1.02]" : isShaking ? "animate-shake-minor" : ""
    )}>
      {/* Journey Map Header */}
      <div className="w-full max-w-2xl">
         {renderJourneyMap()}
      </div>

      <div className="w-full grid grid-cols-12 gap-8 items-start">
        <div className="col-span-8 flex flex-col gap-6">
          <div className={cn(
            "bg-white border-8 border-slate-900 rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col relative min-h-[500px] transition-colors duration-300",
            isCrisis ? "bg-red-50 border-red-500" : ""
          )}>
            <div className="h-60 bg-slate-900 relative overflow-hidden flex items-center justify-center">
               {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
                    <span className="font-black italic uppercase tracking-[0.3em] text-white text-[10px]">Loading Round...</span>
                  </div>
               ) : (
                  <img src={`https://picsum.photos/seed/${challenge?.visual_keyword || 'impact'}/800/400`} className="w-full h-full object-cover opacity-70" />
               )}
               {isCrisis && (
                 <div className="absolute inset-0 bg-red-600/20 animate-pulse border-8 border-red-600 flex items-center justify-center">
                    <div className="bg-red-600 text-white px-8 py-2 font-black uppercase italic text-2xl animate-bounce">CRISIS DETECTED!</div>
                 </div>
               )}
               <div className="absolute top-6 left-6 bg-white border-2 border-slate-900 px-4 py-1 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_0px_black] -rotate-2">
                  ROUND {step} / {maxSteps}
               </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h3 className="text-2xl font-black leading-tight text-slate-800 border-l-8 border-primary pl-4 italic">
                      {loading ? "Generating..." : (typeof challenge?.scene === 'string' ? challenge.scene : JSON.stringify(challenge?.scene))}
                    </h3>
                    <div className="grid gap-3">
                      {challenge?.options?.map((opt: any, idx: number) => (
                         <button
                           key={idx}
                           disabled={feedback !== null || loading}
                           onClick={() => handleAction(opt)}
                           className={cn(
                             "p-5 bg-slate-50 border-4 border-slate-900 rounded-2xl text-left font-black group hover:bg-primary/5 hover:border-primary transition-all shadow-[6px_6px_0px_0px_black] active:translate-y-1 relative overflow-hidden",
                             isCrisis ? "hover:bg-red-50 hover:border-red-600" : ""
                           )}
                         >
                           <div className="flex items-center justify-between relative z-10">
                              <span className="text-xl italic">{typeof opt.text === 'string' ? opt.text : JSON.stringify(opt.text)}</span>
                              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100" />
                           </div>
                           {isCrisis && idx === 1 && (
                             <div className="absolute top-0 right-0 p-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-tighter">High Risk</div>
                           )}
                         </button>
                      ))}
                    </div>
                  </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-8">
          <div className="bg-white border-8 border-slate-900 rounded-[3rem] p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative flex flex-col items-center">
             <div className="h-48 w-full flex items-center justify-center p-4">
                <motion.img 
                  animate={{ 
                    y: feedback ? [-10, 0] : [0, -10, 0],
                    scale: isShaking && shakeIntensity === 'mega' ? 1.2 : 1
                  }}
                  transition={{ repeat: !feedback ? Infinity : 0, duration: 2 }}
                  src={hero.image} 
                  className="h-full object-contain drop-shadow-xl" 
                />
             </div>

             <div className="flex gap-2 mt-4">
               {activePerks.map(p => {
                 const perk = PERKS.find(i => i.id === p);
                 return (
                   <div key={p} className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white" title={perk?.name}>
                     {perk && <perk.icon size={16} />}
                   </div>
                 );
               })}
             </div>

             <AnimatePresence>
               {feedback && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-10 -left-6 bg-white border-4 border-slate-900 p-6 rounded-2xl shadow-[8px_8px_0px_0px_black] z-20 w-64 text-center"
                  >
                     <p className="text-lg font-black text-primary uppercase italic tracking-tighter leading-tight italic">
                       {reactionEmoji} {typeof feedback === 'string' ? feedback : JSON.stringify(feedback)}
                     </p>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="bg-white border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_black]">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">Concept maturity</span>
                  <span className="text-xl font-black italic text-primary">{score}%</span>
               </div>
               <div className="h-6 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden p-0.5">
                  <motion.div animate={{ width: `${score}%` }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
               </div>
            </div>
            <div className="bg-white border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_black]">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400">Mental Energy</span>
                  <span className="text-xl font-black italic text-amber-500">{energy}%</span>
               </div>
               <div className="h-6 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden p-0.5">
                  <motion.div animate={{ width: `${energy}%` }} className="h-full bg-amber-400 rounded-full" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups Overlay */}
      <AnimatePresence>
        {popups.map(p => (
           <motion.div
             key={p.id}
             initial={{ opacity: 0, y: 0, scale: 0.5 }}
             animate={{ opacity: 1, y: -100, scale: 1.5 }}
             exit={{ opacity: 0 }}
             className="fixed z-50 pointer-events-none font-black text-4xl italic text-primary uppercase stroke-black stroke-2"
             style={{ left: `${p.x}%`, top: `${p.y}%`, textShadow: '4px 4px 0px black' }}
           >
             {p.text}
           </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
