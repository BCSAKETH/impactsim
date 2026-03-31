import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  Zap, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function LoginView() {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const navItems = ['Platform', 'Methodology', 'Simulations', 'Case Studies'];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-teal-500/30 font-body relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="relative z-50 px-10 h-24 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white font-headline italic">Yukti</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {navItems.map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-400 transition-colors">{item}</a>
          ))}
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all backdrop-blur-md"
        >
          Portal Entry
        </button>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl shadow-primary/10"
            >
               <Sparkles size={14} /> Intelligence for Social Innovation
            </motion.div>
            
            <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-10 italic font-headline">
               Master the Art <br /> 
               <span className="bg-gradient-to-r from-teal-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">of Execution.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 px-4">
               Yukti is an AI-driven simulation platform designed for social entrepreneurs. 
               Test your ideas, navigate policy landscapes, and bridge the gap from concept to impact.
            </p>

            <button 
              onClick={handleGoogleSignIn}
              className="group relative bg-teal-500 hover:bg-teal-400 text-slate-950 px-12 py-6 rounded-[2.5rem] font-black text-2xl transition-all shadow-2xl shadow-teal-500/30 flex items-center gap-4 mx-auto active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-8 h-8 bg-white rounded-full p-1" alt="" />
              Begin Your Mission
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-6 py-20 pb-40">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { 
                  title: 'Strategic Policy Lab', 
                  desc: 'Evaluate your mission against real-world governance frameworks and grant schemas.',
                  icon: ShieldCheck,
                  color: 'text-teal-400'
                },
                { 
                  title: 'Behavioral Sprinting', 
                  desc: 'Engage in high-stakes visual simulations to test your decision-making under pressure.',
                  icon: Zap,
                  color: 'text-amber-400'
                },
                { 
                  title: 'Founder Lexicon', 
                  desc: 'Master the terminology of startup success with an interactive, AI-powered knowledge base.',
                  icon: BookOpen,
                  color: 'text-fuchsia-400'
                }
              ].map((f, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl hover:border-teal-500/30 transition-all group">
                   <div className={cn("w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform shadow-xl", f.color)}>
                      <f.icon size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight font-headline">{f.title}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Decorative GridLines */}
        <div className="absolute inset-0 z-[-1] opacity-[0.03]" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(45, 212, 191, 1) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <footer className="py-20 px-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-30 border-t border-white/5">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Developed by DeepMind Elite Agents x CodeNyx Hackathon</p>
           <div className="flex gap-10 mt-10 md:mt-0 text-[10px] font-black uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">API Access</a>
           </div>
        </footer>
      </main>
    </div>
  );
}
