import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginView() {
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
      >
        <div className="w-24 h-24 signature-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-900/20">
          <Zap size={48} fill="currentColor" className="text-white" />
        </div>
        <h1 className="text-4xl font-headline font-black text-teal-900 mb-4 tracking-tighter">ImpactSim</h1>
        <p className="text-slate-500 mb-12 font-body text-lg leading-relaxed">
          The high-fidelity social entrepreneurship simulation platform.
        </p>
        <button
          onClick={signIn}
          className="w-full py-5 px-8 bg-teal-900 text-white rounded-2xl font-bold text-lg hover:bg-teal-800 transition-all flex items-center justify-center gap-4 shadow-xl shadow-teal-900/10 group"
        >
          <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          Sign in with Google
        </button>
        <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
          Visionary Architect Simulation Engine
        </p>
      </motion.div>
    </div>
  );
}
