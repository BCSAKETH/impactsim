import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Zap, 
  TrendingUp, 
  Clock, 
  Network,
  Loader2,
  CheckCircle,
  Plus,
  Sparkles,
  MessageSquare,
  X,
  Trash2,
  Wrench,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, cleanJsonParse } from '../lib/utils';
import { db, auth } from '../firebase';
import { 
  doc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useSimulation } from '../context/SimulationContext';

export function SimulationHub({ setActiveTab, onSprint }: { setActiveTab: (tab: string) => void, onSprint: (idea: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [userSims, setUserSims] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  
  const [localDraft, setLocalDraft] = useState('');
  
  const { state, updateState, startNewSimulation, localSims, addLocalSimulation, t } = useSimulation();
  const { user } = useAuth();

  const [chatHistory, setChatHistory] = useState<{
    id: string;
    role: 'ai' | 'user';
    text: string;
    inputType?: 'text' | 'options';
    options?: string[];
  }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // 1. Sync initial state if any
  useEffect(() => {
    if (state.draftIdea && !localDraft) {
      setLocalDraft(state.draftIdea);
    }
  }, [state.draftIdea]);

  // 2. Fetch User Simulations
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'simulations'), where('authorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims: any[] = [];
      snapshot.forEach((doc) => {
        sims.push({ id: doc.id, ...doc.data() });
      });
      setUserSims(sims);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Hub Error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // 3. Combine Local and Cloud Simulations
  const allSims = [
    ...userSims,
    ...localSims.filter(ls => !userSims.some(cs => cs.id === ls.id))
  ].sort((a, b) => {
    const timeA = new Date(a.updatedAt?.seconds ? a.updatedAt.toDate() : a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt?.seconds ? b.updatedAt.toDate() : b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const handleWizardStep = async (userAnswer?: string) => {
    if (!localDraft.trim() && chatHistory.length === 0) return;
    setIsGenerating(true);

    let updatedHistory = [...chatHistory];
    if (chatHistory.length === 0) {
      updatedHistory = [{ id: Math.random().toString(), role: 'user', text: `My Pitch: ${localDraft}` }];
      setChatHistory(updatedHistory);
    } else if (userAnswer) {
      updatedHistory.push({ id: Math.random().toString(), role: 'user', text: userAnswer });
      setChatHistory(updatedHistory);
      setCurrentAnswer('');
    }

    const userMessageCount = updatedHistory.filter(m => m.role === 'user').length;
    const forceGenerate = userMessageCount >= 3;

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      const conversationContext = updatedHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

      const basePrompt = `
        You are a Social Entrepreneurship Lab AI. 
        Idea Context: ${localDraft}
        Conversation so far: ${conversationContext}
        Language: ${state.gameLanguage || 'English'}.

        ${forceGenerate 
          ? 'TASK: Generate the final simulation scenario object. Format as: {"type": "scenario", "scenario": {"title": "Brand Name", "category": "Sector", "description": "Compelling hook", "image": "Keyword"}}' 
          : 'TASK: Ask ONE critical question to refine the strategy. Provide 3 clear options. Format as: {"type": "question", "text": "Question?", "options": ["A", "B", "C"]}'
        }
        OUTPUT MUST BE STRICT JSON ONLY.
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
            { role: 'system', content: `SOCIAL IMPACT LAB. JSON ONLY. Be strategic and inspiring.` },
            { role: 'user', content: basePrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const rawContent = data.choices[0]?.message?.content || '{}';
      const result = cleanJsonParse(rawContent);

      if (result.type === 'question') {
        setChatHistory(prev => [...prev, { ...result, id: Math.random().toString(), role: 'ai' }]);
      } else if (result.scenario || result.type === 'scenario') {
        setAiResponse(result.scenario || result);
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Wizard error:', error);
      toast.error('The Yukti Lab encountered an error. Retrying...');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSimulation = async () => {
    if (!aiResponse || !user) return;
    setIsGenerating(true);
    try {
      const simData = {
        ...aiResponse,
        pitch: localDraft,
        authorUid: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        progress: 0,
        status: 'Running',
        image: `https://picsum.photos/seed/${aiResponse.image || 'impact'}/800/400`
      };

      let docId = `temp-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'simulations'), simData);
        docId = docRef.id;
      } catch (e) {
        addLocalSimulation({ ...simData, id: docId, updatedAt: new Date().toISOString() });
      }

      await startNewSimulation({ id: docId, name: aiResponse.title, region: aiResponse.category, pitch: localDraft });
      setIsModalOpen(false);
      setAiResponse(null);
      setChatHistory([]);
      setLocalDraft('');
      updateState({ draftIdea: '' });
      setActiveTab('workspace');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
      <section className="relative">
        <div className="flex items-center justify-between gap-10">
          <div>
            <span className="text-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
               {t('strategic_hub')}
            </span>
            <h2 className="text-6xl font-headline font-black text-on-surface leading-[0.9] tracking-tighter">
              {t('welcome')}, <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent italic">{user?.displayName?.split(' ')[0] || 'Architect'}.</span>
            </h2>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-2xl flex items-center gap-3"
          >
             <Plus size={20} strokeWidth={3} /> {t('create_new')}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin text-primary size-12" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {allSims.length === 0 ? (
            <div className="col-span-full py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 text-center">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                  <Network size={32} className="text-slate-300" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-xs">{t('no_simulations')}</p>
            </div>
          ) : (
            allSims.map(sim => (
              <article key={sim.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 relative group hover:-translate-y-2 transition-all duration-500">
                <div className="h-56 w-full overflow-hidden relative">
                   <img src={sim.image || `https://picsum.photos/seed/${sim.title}/800/400`} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/20">{sim.category}</div>
                </div>
                <div className="p-10 space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 line-clamp-1">{sim.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">{sim.description}</p>
                  <div className="flex gap-3 border-t border-slate-100 pt-6 mt-4">
                      <button 
                        onClick={async () => {
                          await startNewSimulation({ id: sim.id, name: sim.title, region: sim.category, pitch: sim.pitch });
                          setActiveTab('workspace');
                        }}
                        className="flex-1 flex justify-center items-center py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all gap-2"
                      >
                        {t('resume_mission')} <ArrowRight size={16} />
                      </button>
                    <button 
                      onClick={() => onSprint(sim.pitch)}
                      className="flex-1 flex justify-center items-center py-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl font-bold text-sm hover:bg-amber-100 transition-all gap-2"
                    >
                      <Zap size={16} fill="currentColor" /> Sprint
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Modal - REDESIGNED YUKTI LAB WIZARD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 z-20 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-slate-50 rounded-full"><X size={20} /></button>
              
              {/* Header Info */}
              <div className="px-12 pt-12 pb-8 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Sparkles size={32} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tight">The Yukti Lab</h3>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">AI Strategy Architect v2.0</p>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                {!aiResponse && chatHistory.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                    <div className="space-y-4">
                       <h4 className="text-xl font-bold text-slate-900">Define your mission</h4>
                       <p className="text-slate-500 font-medium">Briefly describe the social impact venture you want to simulate.</p>
                       <textarea 
                          value={localDraft} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalDraft(val);
                            updateState({ draftIdea: val });
                          }}
                          className="w-full h-48 p-8 bg-slate-50 border-4 border-slate-100 rounded-[2rem] outline-none focus:border-primary/20 transition-all font-medium text-lg leading-relaxed placeholder:text-slate-300 shadow-inner"
                          placeholder="Example: A network of solar-powered health clinics in remote Himalayan regions..."
                       />
                    </div>
                    <button 
                       disabled={!localDraft.trim() || isGenerating}
                       onClick={() => handleWizardStep()} 
                       className="w-full py-6 bg-primary text-white rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" /> : (
                        <>Start Discovery Phase <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>
                      )}
                    </button>
                  </motion.div>
                )}

                {chatHistory.length > 0 && !aiResponse && (
                  <div className="space-y-8">
                    {chatHistory.map((m, i) => (
                      <motion.div 
                        key={m.id} 
                        initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn(
                          "max-w-[85%] px-8 py-5 rounded-[2rem] font-bold text-lg leading-relaxed", 
                          m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        )}>
                           {m.text}
                        </div>
                      </motion.div>
                    ))}
                    
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                         <div className="bg-slate-50 px-8 py-5 rounded-[2rem] rounded-tl-none border border-slate-100 flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary ml-2">Analyzing strategy...</span>
                         </div>
                      </motion.div>
                    )}

                    {!isGenerating && chatHistory[chatHistory.length-1]?.role === 'ai' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-4 pt-4">
                        {chatHistory[chatHistory.length-1].options?.map((o, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleWizardStep(o)} 
                            className="p-6 bg-white border-4 border-slate-100 rounded-3xl hover:border-primary text-left font-black transition-all group flex items-center justify-between"
                          >
                             <span className="text-slate-800">{o}</span>
                             <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {aiResponse && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/10">
                       <CheckCircle size={48} />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-4xl font-black text-slate-900 italic leading-none">{aiResponse.title}</h4>
                       <p className="text-slate-500 font-medium text-lg leading-relaxed">{aiResponse.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        onClick={() => {
                          saveSimulation().then(() => setActiveTab('sprint'));
                        }} 
                        className="flex-1 py-6 bg-amber-400 text-slate-950 rounded-3xl font-black text-lg shadow-xl shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Try Cartoon Sprint
                      </button>
                      <button 
                        onClick={saveSimulation} 
                        className="flex-1 py-6 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        Start Execution <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Lab Footer Decoration */}
              <div className="px-12 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                 </div>
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Quantum Strategy Engine Active</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
