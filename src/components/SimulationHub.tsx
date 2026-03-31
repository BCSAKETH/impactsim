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

export function SimulationHub({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [userSims, setUserSims] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  
  const { state, updateState, startNewSimulation, localSims, addLocalSimulation } = useSimulation();
  const { user } = useAuth();

  const [chatHistory, setChatHistory] = useState<{
    id: string;
    role: 'ai' | 'user';
    text: string;
    inputType?: 'text' | 'options';
    options?: string[];
  }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

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
    });

    return unsubscribe;
  }, [user]);

  const allSims = [
    ...userSims,
    ...localSims.filter(ls => !userSims.some(cs => cs.id === ls.id))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
  .filter(sim => {
    if (!state.searchQuery) return true;
    const query = state.searchQuery.toLowerCase();
    return sim.title?.toLowerCase().includes(query) || 
           sim.description?.toLowerCase().includes(query) ||
           sim.category?.toLowerCase().includes(query);
  });

  const handleWizardStep = async (userAnswer?: string) => {
    const draftIdea = state.draftIdea || '';
    if (!draftIdea.trim() && chatHistory.length === 0) return;
    setIsGenerating(true);

    let updatedHistory = [...chatHistory];
    if (chatHistory.length === 0) {
      updatedHistory = [{ id: Math.random().toString(), role: 'user', text: `My Pitch: ${draftIdea}` }];
      setChatHistory(updatedHistory);
    } else if (userAnswer) {
      updatedHistory.push({ id: Math.random().toString(), role: 'user', text: userAnswer });
      setChatHistory(updatedHistory);
      setCurrentAnswer('');
    }

    const userMessageCount = updatedHistory.filter(m => m.role === 'user').length;
    const forceGenerate = userMessageCount >= 4;

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      const conversationContext = updatedHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

      const basePrompt = `
        You are a social entrepreneurship expert. The output MUST be valid JSON.
        Language constraint: ${state.gameLanguage || 'English'}.
        Conversation: ${conversationContext}
        ${forceGenerate ? 'Generate the final simulation scenario object.' : 'Ask ONE clarifying question with 3-4 options.'}
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
            { role: 'system', content: `SOCIAL SIMULATOR. JSON ONLY. Language: ${state.gameLanguage || 'English'}` },
            { role: 'user', content: basePrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const result = cleanJsonParse(data.choices[0]?.message?.content || '{}');

      if (result.type === 'question') {
        setChatHistory(prev => [...prev, { ...result, id: Math.random().toString() }]);
      } else {
        setAiResponse(result.scenario);
      }
    } catch (error) {
      toast.error('AI Generation failed.');
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
        pitch: state.draftIdea,
        authorUid: user.uid,
        updatedAt: serverTimestamp(),
        progress: 0,
        status: 'Running',
        image: `https://picsum.photos/seed/${aiResponse.image}/800/400`
      };

      let docId = `temp-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'simulations'), simData);
        docId = docRef.id;
      } catch (e) {
        addLocalSimulation({ ...simData, id: docId, updatedAt: new Date().toISOString() });
      }

      await startNewSimulation({ id: docId, name: aiResponse.title, region: aiResponse.category, pitch: state.draftIdea });
      setIsModalOpen(false);
      setAiResponse(null);
      setChatHistory([]);
      updateState({ draftIdea: '' });
      setActiveTab('workspace');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <section className="relative">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 md:col-span-7">
          <div className="col-span-12 md:col-span-7">
            <label className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 block">Simulation Hub</label>
            <h2 className="text-6xl font-black text-white leading-tight tracking-tight italic">
              Your <span className="bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent">Impact Portfolio.</span>
            </h2>
          </div>
          </div>
          <div className="col-span-12 md:col-span-5 flex justify-end">
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-container text-slate-950 px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all active:scale-95">
              <Plus size={24} /> Create Simulation
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allSims.map(sim => (
            <article key={sim.id} className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative group hover:border-primary/50 transition-all">
              <div className="h-56 w-full overflow-hidden relative">
                <img src={sim.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary border border-white/10">
                  {sim.category}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">{sim.title}</h3>
                <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed">{sim.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={async () => {
                      updateState({ draftIdea: sim.pitch });
                      setActiveTab('sprint');
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Sprint
                  </button>
                  <button 
                    onClick={async () => {
                      await startNewSimulation({ id: sim.id, name: sim.title, region: sim.category, pitch: sim.pitch });
                      setActiveTab('workspace');
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    Resume <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal - Simplified to focused on draftIdea syncing */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] p-12 relative overflow-hidden">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X /></button>
              
              {!aiResponse && chatHistory.length === 0 && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-black mb-2">Create Scenario</h3>
                  <textarea 
                    value={state.draftIdea || ''} 
                    onChange={(e) => updateState({ draftIdea: e.target.value })}
                    className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none"
                    placeholder="Describe your social impact idea..."
                  />
                  <button onClick={() => handleWizardStep()} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl">
                    {isGenerating ? <Loader2 className="animate-spin" /> : "Start Wizard"}
                  </button>
                </div>
              )}

              {chatHistory.length > 0 && !aiResponse && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl max-h-[40vh] overflow-y-auto">
                    {chatHistory.map((m, i) => (
                      <div key={i} className={cn("mb-4", m.role === 'user' ? 'text-right' : 'text-left')}>
                        <span className={cn("inline-block p-3 rounded-xl", m.role === 'user' ? 'bg-primary text-white' : 'bg-white border')}>{m.text}</span>
                      </div>
                    ))}
                  </div>
                  {chatHistory[chatHistory.length-1].role === 'ai' && (
                    <div className="grid grid-cols-2 gap-3">
                      {chatHistory[chatHistory.length-1].options?.map((o, i) => (
                        <button key={i} onClick={() => handleWizardStep(o)} className="p-4 border rounded-xl hover:bg-primary/5">{o}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {aiResponse && (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                     <h4 className="text-2xl font-bold">{aiResponse.title}</h4>
                     <p className="text-sm mt-2">{aiResponse.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('sprint')} className="py-5 bg-amber-400 text-black rounded-2xl font-black">Try Cartoon Sprint!</button>
                    <button onClick={saveSimulation} className="py-5 bg-primary text-white rounded-2xl font-black">Confirm & Start Execution</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
