import React, { useState } from 'react';
import { 
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SIMULATIONS } from '../constants';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function SimulationHub() {
  const [startingId, setStartingId] = useState<string | null>(null);
  const categories = ['All Scenarios', 'Health', 'Education', 'Environment', 'Poverty Alleviation'];
  const user = auth.currentUser;

  const startSimulation = async (sim: any) => {
    if (!user) return;
    setStartingId(sim.id);
    try {
      await setDoc(doc(db, 'simulations', sim.id), {
        id: sim.id,
        title: sim.title,
        status: 'Running',
        progress: 0,
        authorUid: user.uid,
        updatedAt: serverTimestamp()
      });
      // In a real app, we would navigate to the simulation workspace
      alert(`Simulation "${sim.title}" started and synced to cloud!`);
    } catch (error) {
      console.error('Start simulation error:', error);
    } finally {
      setStartingId(null);
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
            <label className="font-body font-bold text-secondary text-sm tracking-widest uppercase mb-4 block">Simulation Library</label>
            <h2 className="font-headline font-extrabold text-5xl text-on-surface leading-tight tracking-tight">
              Design Your Next <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent italic">Social Masterpiece.</span>
            </h2>
            <p className="mt-6 text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Navigate complex financial models and social impact metrics. Each scenario is a blueprint for real-world change.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 flex justify-end">
            <div className="bg-teal-100 p-6 rounded-3xl flex items-center gap-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
                <Zap size={32} fill="currentColor" />
              </div>
              <div>
                <p className="text-primary font-bold text-2xl">14</p>
                <p className="text-primary/70 text-sm font-medium">Scenarios Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-3">
        {categories.map((cat, i) => (
          <button 
            key={cat}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold text-sm transition-all",
              i === 0 
                ? "bg-primary text-white shadow-lg" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SIMULATIONS.map((sim) => (
          <article key={sim.id} className="group relative bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-xl">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={sim.image} 
                alt={sim.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                {sim.category}
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
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{sim.description}</p>
              <button 
                onClick={() => startSimulation(sim)}
                disabled={startingId === sim.id}
                className="w-full py-4 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                {startingId === sim.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Start Simulation
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </article>
        ))}

        {/* Featured Card */}
        <article className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-5 bg-teal-900 text-white rounded-3xl overflow-hidden mt-8 shadow-2xl">
          <div className="lg:col-span-3 p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-6 w-fit">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest">Premium Scenario</span>
            </div>
            <h3 className="font-headline font-extrabold text-4xl mb-6">Clean Water Micro-Utility</h3>
            <p className="text-teal-100 text-lg mb-10 max-w-2xl leading-relaxed">
              Simulate the lifecycle of a solar-powered desalination hub. Manage supply chain disruptions, variable tariff pricing, and long-term community health outcomes in a high-stakes environment.
            </p>
            <div className="flex flex-wrap gap-8 mb-10">
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Impact Potential</p>
                <p className="text-2xl font-bold font-headline">9.8/10</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Complexity</p>
                <p className="text-2xl font-bold font-headline">Advanced</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Time Estimate</p>
                <p className="text-2xl font-bold font-headline">45 Mins</p>
              </div>
            </div>
            <button className="w-fit px-12 py-5 bg-white text-primary rounded-full font-black text-lg hover:bg-teal-100 transition-colors shadow-lg active:scale-95 duration-150">
              Launch Advanced Lab
            </button>
          </div>
          <div className="lg:col-span-2 relative min-h-[300px]">
            <img 
              src="https://picsum.photos/seed/water-tech/800/800" 
              alt="Clean Water Project" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-teal-900/20 to-transparent"></div>
          </div>
        </article>
      </div>
    </motion.div>
  );
}
