import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Send, MessageSquare, Users, TrendingUp, 
  ChevronRight, Play, CheckCircle2, AlertCircle, X,
  Brain, FileText, BarChart3, Landmark, Heart, Zap, Sparkles,
  Search, Bell, Settings, Languages
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { cn, cleanJsonParse } from '../lib/utils';
import { toast } from 'sonner';
import { Camera, CameraOff } from 'lucide-react';

const BOARDROOM_BG = "/boardroom-bg.png";

function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = s;
        setStream(s);
      } catch (err) {
        console.error("Camera failed:", err);
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center rounded-[2rem] overflow-hidden">
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
      ) : (
        <div className="text-white/20 flex flex-col items-center gap-2">
          <CameraOff size={16} />
          <span className="text-[6px] font-black uppercase tracking-widest text-center">Founder View<br/>Inactive</span>
        </div>
      )}
    </div>
  );
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  trait: string;
  color: string;
  accent: string;
  position: { x: string; y: string; scale: number; rotate: number };
}

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'st-1',
    name: 'Namita Thapar',
    role: 'Executive Director, Emcure',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Namita',
    description: 'Expert in pharma and healthcare.',
    trait: 'Pharma Queen',
    color: '#ec4899', // pink-500
    accent: 'shadow-pink-500/40',
    position: { x: '10%', y: '10%', scale: 1, rotate: -15 }
  },
  {
    id: 'st-2',
    name: 'Peyush Bansal',
    role: 'Founder, Lenskart',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peyush',
    description: 'Visionary tech leader.',
    trait: 'Visionary',
    color: '#06b6d4', // cyan-500
    accent: 'shadow-cyan-500/40',
    position: { x: '35%', y: '0%', scale: 1.1, rotate: -5 }
  },
  {
    id: 'st-3',
    name: 'Aman Gupta',
    role: 'Co-founder, boAt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman',
    description: 'Branding powerhouse.',
    trait: 'Brand King',
    color: '#f59e0b', // amber-500
    accent: 'shadow-amber-500/40',
    position: { x: '60%', y: '0%', scale: 1.1, rotate: 5 }
  },
  {
    id: 'st-4',
    name: 'Vineeta Singh',
    role: 'CEO, SUGAR Cosmetics',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vineeta',
    description: 'Ironwoman of business.',
    trait: 'Metrics Queen',
    color: '#10b981', // emerald-500
    accent: 'shadow-emerald-500/40',
    position: { x: '85%', y: '10%', scale: 1, rotate: 15 }
  }
];

export function AIMeetingRoom({ onClose }: { onClose: () => void }) {
  const { state, updateState, t } = useSimulation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [meetingStage, setMeetingStage] = useState<'selection' | 'active' | 'analysis'>('selection');
  const [sentiment, setSentiment] = useState<number>(50);
  const [currentSharkIndex, setCurrentSharkIndex] = useState(-1);
  const [pitchProgress, setPitchProgress] = useState(0);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Stop speech synthesis on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, interimTranscript]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startMeeting = () => {
    setMeetingStage('active');
    setPitchProgress(0);
    setCurrentSharkIndex(-1);
    const initialMsg: Message = {
      role: 'ai',
      content: `Welcome to the ImpactSim Boardroom. We've read your proposal. You are standing before the founders of India's biggest brands. The floor is yours, Founder. Start your pitch.`,
    };
    setMessages([initialMsg]);
    speakText(initialMsg.content);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Voice recognition not supported. Use Chrome desktop.');
        return;
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = state.gameLanguage === 'Hindi' ? 'hi-IN' : state.gameLanguage === 'Telugu' ? 'te-IN' : 'en-IN';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final) {
          handleSendMessage(final);
          setInterimTranscript('');
          setPitchProgress(prev => Math.min(100, prev + 15));
        } else {
          setInterimTranscript(interim);
        }
      };
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const activeShark = currentSharkIndex === -1 ? STAKEHOLDERS[0] : STAKEHOLDERS[currentSharkIndex];
      const prompt = `You are roleplaying as the sharks of Shark Tank India. 
      Venture context: ${state.pitch}
      Current Shark: ${activeShark.name} (${activeShark.trait})
      Phase: ${currentSharkIndex === -1 ? 'Initial Pitch feedback' : 'Questioning Round'}
      User Message: ${text}
      Latest Mentor Insight: ${state.mentorFeedback ? `"${state.mentorFeedback.critique}"` : 'None'}
      Instructions: React in character. If the mentor has critiqued the user's recent move, you can use that to be more critical or supportive. Output ONLY JSON: { "content": "string", "sentimentScore": number, "metrics": { "investability": number, "clarity": number } }`;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(import.meta as any).env.VITE_MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'open-mistral-7b',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const rawRes = data.choices[0].message.content;
      const result = cleanJsonParse(rawRes);
      const aiMsg: Message = { role: 'ai', content: result.content };
      setMessages(prev => [...prev, aiMsg]);
      setSentiment(result.sentimentScore || 50);
      speakText(result.content);

      if (currentSharkIndex === -1 && pitchProgress > 50) {
        setCurrentSharkIndex(0);
        toast.info(`${STAKEHOLDERS[0].name} is opening the questioning...`);
      } else if (currentSharkIndex >= 0 && currentSharkIndex < 3) {
        setCurrentSharkIndex(prev => prev + 1);
        toast.info(`${STAKEHOLDERS[currentSharkIndex + 1].name} takes the floor...`);
      } else if (currentSharkIndex === 3) {
        toast.success("Final deliberation in progress...");
      }
    } catch (e) {
      console.error(e);
      toast.error('AI connection failed. Ensure VITE_MISTRAL_API_KEY is correct.');
    } finally {
      setIsThinking(false);
    }
  };

  const generateReport = async () => {
    setIsThinking(true);
    try {
      const mentorContext = state.mentorFeedback ? `The Yukti AI Mentor previously noted: ${state.mentorFeedback.critique}` : "";
      const prompt = `Generate a Venture Impact Report for: ${state.pitch}. ${mentorContext}. Decisions by Namita, Peyush, Aman, Vineeta based on this transcript: ${JSON.stringify(messages).slice(-2000)}. Provide a deal offer or rejection. JSON format: { "Decision": "string", "Offer": "string", "Strengths": [], "Weaknesses": [] }`;
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(import.meta as any).env.VITE_MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'open-mistral-7b',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });
      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      
      const parsed = cleanJsonParse(rawContent);
      setAnalysisReport(parsed);
      setMeetingStage('analysis');
    } catch (e) {
      toast.error('Report generation failed.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative min-h-[750px]">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))] pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-50 px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <Users size={16} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-headline font-black text-white tracking-widest uppercase italic leading-none">The Boardroom</h2>
              <p className="text-[7px] font-bold text-teal-400 tracking-[0.3em] uppercase mt-1">
                {meetingStage === 'active' ? 'Live Gallery Negotiation' : 'Strategic Assessment'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {meetingStage === 'active' && (
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={generateReport}
                className="px-5 py-2 bg-teal-500 text-slate-950 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-colors"
              >
                Final Deliberation
              </motion.button>
            )}
            <button 
              className="p-1.5 text-white/40 hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5" 
              onClick={onClose}
              title="Exit Boardroom"
            >
              <X size={16}/>
            </button>
          </div>
        </div>

      <div className="flex-1 overflow-hidden relative flex flex-col p-6">
        <AnimatePresence mode="wait">
          {meetingStage === 'selection' && (
            <motion.div 
               key="selection" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
               className="h-full flex flex-col items-center justify-center text-center px-10"
            >
               <div className="w-24 h-24 rounded-3xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 mb-8 animate-pulse shadow-[0_0_50px_rgba(20,184,166,0.1)]">
                 <Brain size={48} className="text-teal-500" />
               </div>
               <h3 className="text-4xl font-headline font-black text-white mb-4 tracking-tighter leading-none">{t('boardroom')}</h3>
               <p className="text-white/40 max-w-sm mb-10 text-sm font-medium leading-relaxed uppercase tracking-widest">
                 High-Stakes AI Simulation
               </p>
               <button 
                 onClick={startMeeting}
                 className="group px-12 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_-10px_rgba(13,148,136,0.4)] flex items-center gap-4"
               >
                 <span>Start Pitch</span>
                 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          )}

          {meetingStage === 'active' && (
            <motion.div 
              key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col gap-6"
            >
               {/* Immersive Semi-Circle Layout */}
               <div className="relative flex-1 min-h-[300px] mt-10 perspective-1000">
                 {STAKEHOLDERS.map((s, idx) => (
                   <motion.div 
                     key={s.id} 
                     className="absolute"
                     initial={false}
                     animate={{
                       left: s.position.x,
                       top: s.position.y,
                       scale: currentSharkIndex === idx ? s.position.scale * 1.1 : s.position.scale,
                       rotateY: s.position.rotate,
                       zIndex: currentSharkIndex === idx ? 50 : 10
                     }}
                     style={{ transformStyle: 'preserve-3d' }}
                   >
                     <div className="flex flex-col items-center">
                        <div className={cn(
                          "relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-[2.5rem] border-4 transition-all duration-700",
                          currentSharkIndex === idx 
                            ? `border-[${s.color}] shadow-[0_0_50px_rgba(0,0,0,0.5)]` 
                            : "border-white/5 grayscale opacity-40 scale-90"
                        )}
                        style={{ 
                          borderColor: currentSharkIndex === idx ? s.color : 'rgba(255,255,255,0.05)',
                          boxShadow: currentSharkIndex === idx ? `0 0 40px ${s.color}66` : 'none'
                        }}>
                          <img src={s.avatar} className="w-full h-full object-cover bg-slate-900" alt={s.name} />
                          
                          <AnimatePresence>
                            {currentSharkIndex === idx && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                              >
                                 <div className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl animate-[spin_10s_linear_infinite]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className={cn(
                          "mt-4 text-center transition-all duration-500",
                          currentSharkIndex === idx ? "opacity-100 translate-y-0" : "opacity-30 -translate-y-2"
                        )}>
                          <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: s.color }}>{s.name}</p>
                          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{s.trait}</p>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </div>

               {/* Center Podium & Interaction Area */}
               <div className="flex-1 min-h-0 flex gap-6">
                 {/* Podium / Webcam View */}
                 <div className="w-[30%] flex flex-col gap-4">
                    <div className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-3 shadow-2xl relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none" />
                       <WebcamFeed />
                       <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                          <div className="flex justify-between items-center px-4 py-2 bg-black/60 rounded-full border border-white/10 backdrop-blur-md">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                               <span className="text-[7px] font-black text-white uppercase tracking-widest">Podium Feed</span>
                             </div>
                             <span className="text-[7px] font-black text-teal-400 uppercase tracking-widest">{sentiment}% Sentiment</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                               animate={{ width: isListening ? '100%' : '5%' }}
                               className="h-full bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,1)]"
                            />
                          </div>
                       </div>
                    </div>
                    <div className="bg-teal-950/40 p-4 rounded-2xl border border-teal-500/20 text-center">
                       <span className="text-[8px] font-black text-teal-400 uppercase tracking-[0.3em]">Negotiation Status</span>
                       <div className="flex gap-2 justify-center mt-2">
                          {[1,2,3,4].map(v => (
                            <div key={v} className={cn("w-full h-1 rounded-full bg-teal-400/20 overflow-hidden")}>
                               <motion.div 
                                 animate={{ x: v <= (pitchProgress/25) ? '0%' : '-100%' }}
                                 className="w-full h-full bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,1)]" 
                               />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Interaction Panel */}
                 <div className="flex-1 flex flex-col gap-4">
                    {/* Transcript Card */}
                    <div className="flex-1 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6 overflow-y-auto scrollbar-hide relative group">
                       <div className="absolute top-4 right-6 flex items-center gap-2 opacity-50">
                         <MessageSquare size={12} className="text-teal-400" />
                         <span className="text-[7px] font-black text-white uppercase tracking-widest">Live Deliberation</span>
                       </div>
                       
                       <div ref={scrollRef} className="space-y-4 pt-4">
                         {messages.map((m, i) => (
                           <div key={i} className={cn(
                             "text-xs font-bold leading-relaxed p-4 rounded-2xl border transition-all",
                             m.role === 'ai' 
                              ? "bg-teal-500/5 border-teal-500/10 text-teal-300 italic" 
                              : "bg-white/5 border-white/5 text-white/80"
                           )}>
                             <span className="uppercase text-[7px] font-black tracking-widest mr-2 opacity-40">
                               {m.role === 'ai' ? 'Shark Response' : 'Your Pitch'}:
                             </span>
                             {m.content}
                           </div>
                         ))}
                         {interimTranscript && (
                           <div className="text-xs font-bold text-teal-400/60 italic animate-pulse p-4">
                              <span className="uppercase text-[7px] font-black tracking-widest mr-2 opacity-30">Capturing Pitch:</span>
                              "{interimTranscript}..."
                           </div>
                         )}
                         {isThinking && (
                           <div className="flex items-center gap-2 px-4">
                              <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" />
                              <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                              <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest ml-2">Deliberating...</span>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Input Controls */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 flex gap-4 items-center">
                       <input 
                         value={inputText}
                         onChange={(e) => setInputText(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         placeholder={isListening ? "Listening to your spoken pitch..." : "Speak or type your response..."}
                         className="flex-1 h-16 bg-white/5 rounded-2xl px-6 text-white font-bold text-base outline-none focus:bg-white/10 transition-all placeholder:text-white/20"
                       />
                       <div className="flex gap-2">
                          <button 
                            onClick={toggleListening}
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                              isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                            )}
                          >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                          <button 
                            onClick={() => handleSendMessage()}
                            className="w-16 h-16 bg-teal-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-teal-500/30 hover:translate-y-[-2px] transition-all"
                          >
                            <Send size={20} />
                          </button>
                       </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {meetingStage === 'analysis' && analysisReport && (
            <motion.div 
              key="analysis" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center p-6 text-center"
            >
               <div className="max-w-3xl w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05] rotate-12 -z-10"><Landmark size={200}/></div>
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex gap-2 px-5 py-2 bg-teal-500/10 text-teal-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-teal-500/20 mb-8">
                     <Sparkles size={12} /> Strategic Deliberation Complete
                  </motion.div>
                  <h3 className="text-5xl font-headline font-black text-white leading-none mb-4 tracking-tighter">{analysisReport.Decision}</h3>
                  
                  {/* Robust Offer Rendering */}
                  <div className="mb-10">
                    {typeof analysisReport.Offer === 'object' && analysisReport.Offer !== null ? (
                      <div className="bg-teal-500/5 border border-teal-500/20 rounded-3xl p-8 text-left space-y-4 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                          <Landmark size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg">
                             <FileText size={20} />
                           </div>
                           <div>
                             <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest leading-none">Structured Term Sheet</h4>
                             <p className="text-[9px] text-white/40 uppercase font-bold mt-1">Strategic Investment Draft</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {Object.entries(analysisReport.Offer).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                               <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter">{key.replace(/_/g, ' ')}</p>
                               <p className="text-sm font-bold text-white tracking-tight leading-none">
                                 {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                               </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-teal-400 tracking-tight italic">"{analysisReport.Offer}"</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-12 text-left">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <h5 className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Strengths</h5>
                       <ul className="space-y-2">
                         {analysisReport.Strengths?.slice(0,3).map((s:any, i:number) => <li key={i} className="text-[10px] font-medium text-white/70">{s}</li>)}
                       </ul>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <h5 className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle size={12}/> Risks</h5>
                       <ul className="space-y-2">
                         {analysisReport.Weaknesses?.slice(0,3).map((w:any, i:number) => <li key={i} className="text-[10px] font-medium text-white/70">{w}</li>)}
                       </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                      Export Deal Analysis
                    </button>
                    <button 
                      onClick={() => setMeetingStage('selection')}
                      className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                    >
                      Retry Simulation
                    </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
