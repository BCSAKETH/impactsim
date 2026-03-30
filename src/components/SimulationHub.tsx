import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  Loader2,
  CheckCircle,
  Plus,
  Sparkles,
  MessageSquare,
  X,
  Info,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, cleanJsonParse } from '../lib/utils';
import { db, auth } from '../firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { toast } from 'sonner';
import { useSimulation } from '../context/SimulationContext';

export function SimulationHub({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [userSims, setUserSims] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  
  const [chatHistory, setChatHistory] = useState<{
    id: string;
    role: 'ai' | 'user';
    text: string;
    inputType?: 'text' | 'options';
    options?: string[];
  }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const { user } = useAuth();
  const { state, localSims, startNewSimulation, addLocalSimulation, updateState } = useSimulation();

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

  // Combine Cloud and Local simulations, removing duplicates by ID
  const allSims = [
    ...userSims,
    ...localSims.filter(ls => !userSims.some(cs => cs.id === ls.id))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  const handleWizardStep = async (userAnswer?: string) => {
    if (!idea.trim() && chatHistory.length === 0) return;
    setIsGenerating(true);

    let updatedHistory = [...chatHistory];
    if (chatHistory.length === 0) {
      updatedHistory = [{ id: Math.random().toString(), role: 'user', text: `My Pitch: ${idea}` }];
      setChatHistory(updatedHistory);
    } else if (userAnswer) {
      updatedHistory.push({ id: Math.random().toString(), role: 'user', text: userAnswer });
      setChatHistory(updatedHistory);
      setCurrentAnswer('');
    }

    const userMessageCount = updatedHistory.filter(m => m.role === 'user').length;
    const forceGenerate = userMessageCount >= 4; // Max 4 interactions

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY';
      if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
        throw new Error('Groq API Key is missing.');
      }

      const conversationContext = updatedHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

      const basePrompt = `
        You are a social entrepreneurship expert. The output MUST be valid JSON.
        Language constraint: ${state.gameLanguage || 'English'}.

        Conversation so far:
        ${conversationContext}

        ${forceGenerate 
          ? 'You have enough information. Generate the final simulation scenario object.' 
          : 'Analyze the conversation. Ask EXACTLY ONE clarifying question to gather missing details like target audience, specific mechanism, or location. You MUST provide 3-4 diverse "options" for the user to choose from. Only use inputType "text" if the question truly requires an open-ended name or unique description.'
        }

        If you are asking a question, return strictly this JSON structure:
        { 
          "type": "question", 
          "text": "The question string", 
          "inputType": "options", // preferred
          "options": ["Option A", "Option B", "Option C"] 
        }

        If you are ready to generate the scenario, return strictly this JSON structure:
        { 
          "type": "scenario", 
          "scenario": {
            "title": "A catchy name",
            "description": "A detailed 2-3 sentence summary",
            "category": "Health / Education / Environment / Poverty Alleviation",
            "difficulty": 2,
            "impactPotential": 8,
            "complexity": "Moderate",
            "timeEstimate": "30 Mins",
            "image": "keyword for image e.g. solar",
            "location": "geographic location infered",
            "stage": "Idea Stage / Validation / MVP"
          } 
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
            { role: 'system', content: 'You are a social entrepreneurship expert simulator. MUST OUTPUT STRICT JSON ONLY.' },
            { role: 'user', content: basePrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate simulation from API');
      }

      const data = await response.json();
      const textResponse = data.choices[0]?.message?.content || '{}';
      const result = cleanJsonParse(textResponse);

      if (result.type === 'question') {
        setChatHistory(prev => [
          ...prev, 
          { 
            id: Math.random().toString(), 
            role: 'ai', 
            text: result.text, 
            inputType: result.inputType || 'text',
            options: result.options
          }
        ]);
      } else {
        setAiResponse(result.scenario);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('AI Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const goBackOneStep = () => {
    const newHistory = [...chatHistory];
    newHistory.pop(); // Remove AI question
    if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'user') {
      newHistory.pop(); // Remove user answer
    }
    setChatHistory(newHistory);
    setCurrentAnswer('');
  };

  const saveSimulation = async () => {
    if (!aiResponse || !user) {
      toast.error('Missing simulation data or user session.');
      return;
    }
    setIsGenerating(true);
    try {
      const simData = {
        title: aiResponse.title || 'Untitled Mission',
        description: aiResponse.description || 'No description available',
        category: aiResponse.category || 'General',
        difficulty: aiResponse.difficulty || 1,
        impactPotential: aiResponse.impactPotential || 5,
        timeEstimate: aiResponse.timeEstimate || '20 Mins',
        status: 'Running',
        progress: 0,
        authorUid: user.uid,
        updatedAt: serverTimestamp(),
        image: `https://picsum.photos/seed/${aiResponse.image || 'impact'}/800/400`,
        pitch: idea,
        location: aiResponse.location || '',
        stage: aiResponse.stage || 'Idea Stage'
      };

      // 1. Attempt to save to the cloud "Portfolio"
      let docId = `temp-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'simulations'), simData);
        docId = docRef.id;
      } catch (cloudErr) {
        console.warn('Cloud Portfolio Save Failed (Permissions?):', cloudErr);
        toast.warning('Cloud Sync Unavailable. Starting Local Session.');
        
        // Replace Firestore serverTimestamp with a real date for local storage
        const localSimData = { 
          ...simData, 
          id: docId, 
          updatedAt: new Date().toISOString() 
        };
        addLocalSimulation(localSimData);
      }

      // 2. Set as the "Active" simulation in the Workspace (Even if cloud fails)
      await startNewSimulation({
        id: docId,
        name: simData.title,
        region: simData.category,
        pitch: simData.pitch,
        location: simData.location,
        stage: simData.stage
      });

      toast.success('Simulation Started!');
      setIsModalOpen(false);
      setIdea('');
      setAiResponse(null);
      setChatHistory([]);
      
      // Navigate to workspace
      setActiveTab('workspace');
    } catch (error: any) {
      console.error('Critical Workspace Error:', error);
      toast.error(`Critical Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Hero Header */}
      <section className="relative">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 md:col-span-7">
            <label className="font-body font-bold text-secondary text-sm tracking-widest uppercase mb-4 block">Simulation Hub</label>
            <h2 className="font-headline font-extrabold text-5xl text-on-surface leading-tight tracking-tight">
              Your <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent italic">Impact Portfolio.</span>
            </h2>
            <p className="mt-6 text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Create and manage your custom social entrepreneurship scenarios. Powered by AI to turn your vision into a playable blueprint.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 flex justify-end">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={24} />
              New Simulation
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400 font-medium">Loading your simulations...</p>
        </div>
      ) : allSims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
            <Zap size={40} />
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">No Simulations Found</h3>
          <p className="text-slate-500 max-w-sm mb-8">Start your journey by creating a new AI-powered scenario for your social impact mission.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all outline-none"
          >
            <Plus size={24} />
            Create Your First Scenario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allSims.map((sim) => (
            <article key={sim.id} className="group relative bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-xl">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={sim.image} 
                  alt={sim.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                    {sim.category}
                  </div>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this simulation?')) {
                        try {
                          await deleteDoc(doc(db, 'simulations', sim.id));
                          toast.success('Simulation deleted');
                        } catch (err) {
                          toast.error('Failed to delete');
                        }
                      }
                    }}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-secondary uppercase tracking-tighter">Difficulty: </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((d) => (
                      <span key={d} className={cn("w-2 h-2 rounded-full", d <= sim.difficulty ? "bg-primary" : "bg-slate-200")} />
                    ))}
                  </div>
                </div>
                <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">{sim.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-3">{sim.description}</p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-xs font-bold text-slate-500">{sim.impactPotential}/10 Impact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{sim.timeEstimate}</span>
                  </div>
                </div>
                <button 
                onClick={async () => {
                  try {
                    // Initialize the workspace with this simulation's data
                    await startNewSimulation({
                      id: sim.id,
                      name: sim.title,
                      region: sim.category,
                      pitch: sim.pitch,
                      location: sim.location,
                      stage: sim.stage
                    });
                    
                    // Determine phase based on progress
                    const phase = sim.progress > 50 ? 'execution' : sim.progress > 10 ? 'strategy' : 'discovery';
                    await updateState({ currentPhase: phase });
                    
                    setActiveTab('workspace');
                  } catch (e) {
                    toast.error('Failed to resume simulation');
                  }
                }}
                className="w-full flex justify-between items-center py-4 border-t border-slate-100 text-primary font-bold hover:text-teal-700 transition-colors group-hover:border-primary/20"
              >
                Resume Simulation
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* AI Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-headline font-black text-on-surface mb-2">Create Scenario</h3>
                    <p className="text-on-surface-variant">Describe your social impact idea below.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {!aiResponse && chatHistory.length === 0 && (
                  <div className="space-y-6">
                    <div className="relative">
                      <textarea 
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g., A mobile clinic network for rural farmers in Kenya..."
                        className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary focus:ring-0 transition-all outline-none resize-none font-body text-lg"
                      />
                      <div className="absolute bottom-4 right-4 text-slate-300">
                        <MessageSquare size={24} />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWizardStep()}
                      disabled={isGenerating || !idea.trim()}
                      className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Analyzing Idea...
                        </>
                      ) : (
                        <>
                          <Sparkles size={24} />
                          Start Wizard
                        </>
                      )}
                    </button>
                  </div>
                )}

                {chatHistory.length > 0 && !aiResponse && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                       <button 
                         onClick={goBackOneStep} 
                         disabled={isGenerating || chatHistory.length <= 1} 
                         className="text-sm font-bold text-slate-400 hover:text-primary disabled:opacity-30 transition-colors flex items-center gap-2"
                       >
                         <ArrowRight size={16} className="rotate-180" /> Change Answer
                       </button>
                       <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">
                         Step {Math.ceil(chatHistory.length / 2)} / 4
                       </span>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 max-h-[40vh] overflow-y-auto space-y-4">
                      {chatHistory.map((msg, idx) => (
                        <div key={msg.id || idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            "max-w-[85%] p-4 rounded-2xl font-body text-sm leading-relaxed",
                            msg.role === 'user' 
                              ? 'bg-primary text-white rounded-br-sm shadow-md' 
                              : 'bg-white border border-slate-200 text-on-surface rounded-bl-sm shadow-sm'
                          )}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-sm flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-75" />
                            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-150" />
                          </div>
                        </div>
                      )}
                    </div>

                    {!isGenerating && chatHistory[chatHistory.length - 1]?.role === 'ai' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        {chatHistory[chatHistory.length - 1].inputType === 'options' && chatHistory[chatHistory.length - 1].options ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {chatHistory[chatHistory.length - 1].options?.map((opt, i) => (
                               <button 
                                 key={i}
                                 onClick={() => handleWizardStep(opt)}
                                 className="p-4 text-left border-2 border-slate-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-medium text-slate-700"
                               >
                                 {opt}
                               </button>
                             ))}
                           </div>
                        ) : (
                          <div className="flex gap-3">
                            <input 
                              type="text"
                              value={currentAnswer}
                              onChange={(e) => setCurrentAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none transition-all"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentAnswer.trim()) {
                                  handleWizardStep(currentAnswer);
                                }
                              }}
                            />
                            <button 
                              disabled={!currentAnswer.trim()}
                              onClick={() => handleWizardStep(currentAnswer)}
                              className="px-6 bg-primary text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <ArrowRight size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {aiResponse && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                      <div className="h-40 relative">
                        <img 
                          src={`https://picsum.photos/seed/${aiResponse.image}/800/400`} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                            {aiResponse.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-2xl font-headline font-bold text-on-surface">{aiResponse.title}</h4>
                        </div>
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-on-surface-variant text-sm leading-relaxed">{aiResponse.description}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impact</p>
                            <p className="font-headline font-bold text-primary">{aiResponse.impactPotential}/10</p>
                          </div>
                          <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Difficulty</p>
                            <p className="font-headline font-bold text-secondary">{aiResponse.difficulty}/3</p>
                          </div>
                          <div className="bg-white p-3 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Time</p>
                            <p className="font-headline font-bold text-slate-700">{aiResponse.timeEstimate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => { setAiResponse(null); setChatHistory([]); }}
                        className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                      >
                        Start Over
                      </button>
                      <button 
                        onClick={saveSimulation}
                        disabled={isGenerating}
                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <CheckCircle size={24} />}
                        Confirm & Start Execution
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
