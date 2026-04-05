import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  LogIn, 
  Zap, 
  Rocket, 
  Target, 
  ShieldCheck, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Globe,
  Users,
  Check,
  Brain, 
  FileText, 
  Landmark, 
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function LoginView() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX - window.innerWidth / 2) / 25,
      y: (e.clientY - window.innerHeight / 2) / 25,
    });
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const navItems = ['Platform', 'Methodology', 'Simulations', 'About'];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-teal-500/20 relative"
    >
      {/* Parallax Background */}
      <motion.div 
        animate={{ 
          x: mousePosition.x, 
          y: mousePosition.y,
          scale: 1.1
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
      >
        <img 
          src="/teal_mesh_bg.png" 
          alt="Premium Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/80 to-transparent" />
      </motion.div>
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white shadow-[0_8px_32px_rgba(13,148,136,0.3)]">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="text-2xl font-headline font-black tracking-tighter text-teal-900">Yukti</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 transition-colors">{item}</a>
            ))}
          </div>

          <button 
            onClick={signIn}
            className="bg-teal-950 px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-white hover:bg-teal-900 transition-all shadow-xl shadow-teal-900/10 flex items-center gap-2"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-3 glass-card px-5 py-2 rounded-full shadow-sm"
            >
               <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">The Ultimate Execution Engine v5.0</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-7xl xl:text-8xl font-headline font-black text-teal-950 leading-[0.9] tracking-tighter drop-shadow-xl"
            >
              Simulate <br />
              <span className="bg-gradient-to-r from-teal-700 to-emerald-800 bg-clip-text text-transparent italic drop-shadow-sm">Impact Mastery.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium"
            >
              A world-class strategic laboratory for social architects. Bridge the gap between vision and reality with high-fidelity behavioral simulations.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-5 pt-4"
            >
              <button 
                onClick={signIn}
                className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(0,80,80,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Access Platform <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="w-full sm:w-auto glass-card text-slate-600 px-12 py-5 rounded-2xl font-black text-lg hover:bg-white transition-all">
                The Methodology
              </button>
            </motion.div>
          </div>

          {/* Carousel Walkthrough */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative"
          >
             <div className="bg-white/50 p-5 rounded-[3.5rem] border border-white/50 shadow-2xl backdrop-blur-xl">
                <WalkthroughCarousel />
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </motion.div>
        </div>
      </section>

          {/* Simulations Section */}
          <section id="simulations" className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
                <div className="max-w-2xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 mb-6">Simulation Engine</h3>
                  <h2 className="text-6xl font-headline font-black text-slate-900 tracking-tighter leading-[0.9]">
                    Standardized <br />
                    <span className="italic bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Dossiers.</span>
                  </h2>
                </div>
                <p className="text-slate-500 font-medium max-w-sm">Every simulation follows professional strategic frameworks used by world-class accelerators.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'The Social Engine', role: 'Venture Founder', img: 'social_engine_preview.png', tag: 'Discovery' },
                  { title: 'The Policy Lab', role: 'Strategy Lead', img: 'policy_lab_preview.png', tag: 'Policy Fit' },
                  { title: 'The Execution Hub', role: 'Operations Chief', img: 'execution_hub_preview.png', tag: 'Growth' }
                ].map((sim, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 group shadow-sm hover:shadow-2xl transition-all"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img src={sim.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={sim.title} />
                      <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-teal-700">{sim.tag}</div>
                    </div>
                    <div className="p-10">
                      <h4 className="text-2xl font-headline font-black text-slate-900 mb-2">{sim.title}</h4>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">{sim.role}</p>
                      <button className="w-full py-4 border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:border-teal-500 group-hover:text-teal-600 transition-all">Preview Dossier</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* About / Methodology Section */}
          <section id="about" className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 mb-6">Our Methodology</h3>
                    <h2 className="text-7xl font-headline font-black text-slate-900 tracking-tighter leading-[0.9] mb-10">
                      Decisions <br />
                      <span className="italic bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Defined.</span>
                    </h2>
                    <div className="space-y-10">
                       {[
                         { title: 'Data-Driven Simulation', desc: 'Every scenario is derived from real-world startup failure & success patterns.' },
                         { title: 'Stakeholder Roleplay', desc: 'AI-agents trained on specific risk/reward profiles challenge your assumptions.' },
                         { title: 'Accelerator Diagnostic', desc: 'Real-time alignment checking against YC & Techstars benchmark requirements.' }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600 font-black text-lg group-hover:bg-teal-600 group-hover:text-white transition-all">{i+1}</div>
                            <div>
                               <h4 className="text-xl font-headline font-black text-slate-900 mb-1">{item.title}</h4>
                               <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-teal-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                       <Zap size={48} className="text-teal-400 mb-8" fill="currentColor" />
                       <h3 className="text-4xl font-headline font-black mb-6 leading-tight">Master the <br /> Art of Impact.</h3>
                       <p className="text-teal-100 text-lg leading-relaxed font-medium mb-10 opacity-80 italic">"The Social Entrepreneurship Simulator doesn't just teach you how to build a business; it teaches you how to maintain trust in a world of high-friction stakeholders."</p>
                       <div className="flex items-center gap-4">
                          <div className="w-1 h-12 bg-teal-500 rounded-full" />
                          <div>
                            <p className="font-headline font-black text-white">CodeNyx Alpha</p>
                            <p className="text-[10px] font-black uppercase text-teal-400 tracking-widest">Platform v5.0</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
               <div className="flex items-center gap-3 opacity-40">
                  <Zap size={24} className="text-slate-900" fill="currentColor" />
                  <span className="text-xl font-headline font-black tracking-tighter text-slate-900">Yukti</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2724 Yukti Labs. Built for Elite Strategic Execution.</p>
            </div>
          </footer>
    </div>
  );
}

function WalkthroughCarousel() {
  const images = [
    {
      url: "https://i.pravatar.cc/800?u=yuktilab1", // Placeholder
      title: "The Discovery phase",
      desc: "Architecting your social impact mission."
    },
    {
      url: "https://i.pravatar.cc/800?u=yuktiworkspace", // Placeholder
      title: "Live Strategy Hub",
      desc: "Managing vitals in real-time."
    }
  ];

  const [active, setActive] = React.useState(0);

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] bg-slate-100 group">
       <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
             <img 
               src={active === 0 ? "file:///C:/Users/B.C SAKETH/.gemini/antigravity/brain/63d20fa8-4504-4813-a118-7e5a713d0be5/social_dashboard_preview_1774939689539.png" : active === 1 ? "file:///C:/Users/B.C SAKETH/.gemini/antigravity/brain/63d20fa8-4504-4813-a118-7e5a713d0be5/strategy_lab_preview_1774939710739.png" : "file:///C:/Users/B.C SAKETH/.gemini/antigravity/brain/63d20fa8-4504-4813-a118-7e5a713d0be5/execution_hub_preview_1774939736838.png"} 
               className="w-full h-full object-cover" 
               alt="UI Preview" 
             />
             <div className="absolute bottom-10 left-10 right-10 z-20">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2">
                   <h4 className="text-3xl font-headline font-black text-white italic leading-none">{images[active].title}</h4>
                   <p className="text-slate-200 font-bold">{images[active].desc}</p>
                </motion.div>
             </div>
          </motion.div>
       </AnimatePresence>

       <div className="absolute bottom-10 right-10 z-30 flex gap-2">
          {images.map((_, i) => (
             <button 
               key={i} 
               onClick={() => setActive(i)} 
               className={cn(
                 "w-12 h-1.5 rounded-full transition-all duration-500", 
                 active === i ? "bg-white" : "bg-white/30"
               )} 
             />
          ))}
       </div>

       <div className="absolute top-1/2 left-4 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setActive((active - 1 + images.length) % images.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
             <ChevronLeft size={20} />
          </button>
       </div>
       <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setActive((active + 1) % images.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
             <ChevronRight size={20} />
          </button>
       </div>
    </div>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

function ChevronRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
