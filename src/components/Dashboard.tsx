import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Play, 
  ArrowRight,
  Heart,
  Users,
  ChevronRight,
  Cloud,
  Check,
  Loader2,
  Plus,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { toast } from 'sonner';

export function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [cloudSims, setCloudSims] = useState<any[]>([]);
  const { user } = useAuth();
  const { startNewSimulation, state, localSims } = useSimulation();

  const allSims = [
    ...cloudSims,
    ...localSims.filter(ls => !cloudSims.some(cs => cs.id === ls.id))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'simulations'), where('authorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims: any[] = [];
      snapshot.forEach((doc) => {
        sims.push({ id: doc.id, ...doc.data() });
      });
      setCloudSims(sims);
    });

    return unsubscribe;
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16"
    >
      {/* Welcome Section */}
      <div className="grid grid-cols-12 gap-10 items-end">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase block mb-4">Strategic Overview</span>
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
            Welcome back to <span className="text-primary">Yukti.</span><br />
            Master the art of execution.
          </h1>
        </div>
        <div className="col-span-12 lg:col-span-5 pb-2">
          <p className="text-lg text-on-surface-variant max-w-md font-body text-right">
            Strategic decisions are ready. Your next move determines the project's sustainability.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Hero Card */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 flex flex-col justify-between min-h-[400px] shadow-xl group border-4 border-slate-800/50">
          {allSims.length > 0 ? (
            <>
              <div className="absolute inset-0 opacity-40 transition-transform duration-[2s] group-hover:scale-110">
                <img 
                  src={allSims[0].image} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-300 text-[10px] font-black backdrop-blur-md mb-6 uppercase tracking-[0.2em] border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  Last Active Performance
                </span>
                <h2 className="text-5xl font-headline font-black text-white mb-4 line-clamp-1 leading-tight tracking-tighter">{allSims[0].title}</h2>
                <p className="text-slate-300 max-w-lg font-body text-lg leading-relaxed line-clamp-2 mb-8 opacity-90">
                  {allSims[0].description}
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <button onClick={() => setActiveTab('workspace')} className="bg-primary text-white border-b-4 border-primary-container px-10 py-5 rounded-2xl font-black text-lg hover:translate-y-[2px] hover:border-b-0 transition-all flex items-center gap-3 shadow-xl">
                  Resume Mission <Play size={20} fill="currentColor" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 mb-2">
                 <Plus size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-headline font-black text-white mb-2 leading-tight tracking-tighter">Your Portfolio is Empty</h2>
                <p className="text-slate-400 max-w-md font-body text-lg">Every great mission starts with a single insight. Begin yours today.</p>
              </div>
              <button 
                onClick={() => setActiveTab('hub')}
                className="bg-primary text-white border-b-4 border-primary-container px-10 py-5 rounded-2xl font-black text-lg hover:translate-y-[2px] hover:border-b-0 transition-all flex items-center gap-3 shadow-xl"
              >
                <Sparkles size={20} /> Create Simulation
              </button>
            </div>
          )}
        </div>

        {/* Metrics Stack */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl flex flex-col justify-between flex-1 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <span className="font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Social Impact Score</span>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart size={20} />
              </div>
            </div>
            <div>
              <div className="text-4xl font-headline font-black text-on-surface">{state.impactScore}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("font-bold text-sm", state.impactScore >= 50 ? "text-primary" : "text-amber-500")}>
                  {state.impactScore >= 50 ? '+ Trending Up' : 'Needs Focus'}
                </span>
                <span className="text-slate-400 text-xs">active session</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl flex flex-col justify-between flex-1 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <span className="font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Stakeholder Trust</span>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Users size={20} />
              </div>
            </div>
            <div>
              <div className="text-4xl font-headline font-black text-on-surface">{state.trust}%</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("font-bold text-sm", state.trust >= 50 ? "text-primary" : "text-amber-500")}>
                  {state.trust >= 50 ? 'Stable' : 'Critical Warning'}
                </span>
                <span className="text-slate-400 text-xs">community trust</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-10">
        {/* Financial Sustainability */}
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-headline font-bold text-xl text-on-surface mb-8">Financial Sustainability</h3>
          <div className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Current Operating Capital</p>
                <p className="text-2xl font-headline font-bold">${state.budget.toLocaleString()} <span className="text-sm font-normal text-slate-400">Total</span></p>
              </div>
              <div className="h-16 w-32 flex items-end gap-1">
                {[40, 60, 55, 80, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500",
                      i === 4 ? "bg-secondary" : "bg-secondary/30"
                    )} 
                    style={{ height: `${h}%` }} 
                  />
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-on-surface-variant">Runway Estimate</span>
                <span className="text-sm font-bold text-primary">{Math.max(1, Math.round((state.budget || 1000) / 1000))} Months</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", state.budget > 5000 ? "bg-primary" : "bg-amber-500")}
                  style={{ width: `${Math.min(100, Math.max(10, (state.budget / 15000) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Workspace */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-bold text-xl text-on-surface">Active Workspace</h3>
            <button 
              onClick={() => setActiveTab('hub')}
              className="text-primary text-sm font-bold hover:underline"
            >
              View All Simulations
            </button>
          </div>
          <div className="space-y-4">
            {allSims.length > 0 ? (
              allSims.slice(0, 3).map((sim, idx) => (
                <div key={sim.id || idx} className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={sim.image || "https://picsum.photos/seed/impact/200/200"} alt={sim.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{sim.title}</h4>
                        <p className="text-xs text-slate-400 font-medium">{sim.category}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        sim.id.startsWith('temp-') ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                      )}>
                        {sim.id.startsWith('temp-') ? 'Local Session' : sim.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${sim.progress || 0}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{sim.progress || 0}%</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      await startNewSimulation({
                        id: sim.id,
                        name: sim.title,
                        region: sim.category,
                        pitch: sim.pitch,
                        location: sim.location,
                        stage: sim.stage
                      });
                      setActiveTab('workspace');
                      toast.success(`Resumed: ${sim.title}`);
                    }}
                    className="p-2 rounded-full hover:bg-white text-slate-300 hover:text-primary transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-medium">No active simulations found.</p>
                <p className="text-xs text-slate-300 mt-1">Visit the Simulation Hub to start your first one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
