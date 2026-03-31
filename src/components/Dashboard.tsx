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
  Sparkles,
  LayoutGrid,
  Clock
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { startNewSimulation, state, localSims } = useSimulation();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'simulations'), where('authorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims: any[] = [];
      snapshot.forEach((doc) => {
        sims.push({ id: doc.id, ...doc.data() });
      });
      
      setCloudSims(sims);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredSims = [
    ...cloudSims,
    ...localSims.filter(ls => !cloudSims.some(cs => cs.id === ls.id))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
  .filter(s => {
    if (!state.searchQuery) return true;
    const q = state.searchQuery.toLowerCase();
    return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AR';

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Portfolio...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <label className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 block">Simulation Overview</label>
          <h2 className="text-6xl font-black text-white leading-tight tracking-tight italic">
            Founder <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">Dashboard.</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-[2rem] border border-slate-800 shadow-2xl">
          <Clock className="text-primary" size={20} />
          <span className="text-white font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </section>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Sims', value: filteredSims.length, icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Impact Score', value: state.impactScore.toLocaleString(), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Public Trust', value: `${state.trust}%`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Operating Capital', value: `$${state.budget.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl group hover:border-primary/30 transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Hero Active Card */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 flex flex-col justify-between min-h-[450px] shadow-2xl border border-slate-800 group">
          {filteredSims.length > 0 ? (
            <>
              <div className="absolute inset-0 opacity-40 transition-transform duration-[2s] group-hover:scale-110">
                <img 
                  src={filteredSims[0].image || "https://picsum.photos/seed/yukti/800/600"} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 text-primary text-[10px] font-black backdrop-blur-md mb-8 uppercase tracking-[0.2em] border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Active Strategic Deployment
                </span>
                <h2 className="text-6xl font-black text-white mb-6 leading-tight tracking-tighter italic line-clamp-1">{filteredSims[0].title}</h2>
                <p className="text-slate-300 max-w-xl text-xl leading-relaxed line-clamp-2 mb-10 opacity-90 font-medium">
                  {filteredSims[0].description}
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <button 
                  onClick={async () => {
                    const sim = filteredSims[0];
                    await startNewSimulation({
                      id: sim.id,
                      name: sim.title,
                      region: sim.category,
                      pitch: sim.pitch,
                      location: sim.location,
                      stage: sim.stage
                    });
                    setActiveTab('workspace');
                  }} 
                  className="bg-primary hover:bg-primary-container text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 active:scale-95"
                >
                  Resume Mission <ArrowRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
               <div className="w-24 h-24 bg-slate-950 rounded-[2rem] border border-slate-800 flex items-center justify-center text-slate-700 mb-8">
                  <Plus size={48} />
               </div>
               <h3 className="text-4xl font-black text-white mb-4 italic">No simulations found.</h3>
               <p className="text-slate-500 max-w-sm text-lg mb-10">You haven't started any simulations yet, or your search didn't match any results.</p>
               <button 
                 onClick={() => setActiveTab('hub')}
                 className="bg-primary hover:bg-primary-container text-slate-950 px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary/20"
               >
                 Go to Simulation Hub
               </button>
            </div>
          )}
        </div>

        {/* Side Progress Stack */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Financial Health</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white tracking-tighter">${state.budget.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Available Runway</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp size={28} />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-slate-500">Stability Index</span>
                    <span className="text-white">{Math.round((state.budget / 10000) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (state.budget / 10000) * 100)}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-slate-950 rounded-[2.5rem] border-2 border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer" onClick={() => setActiveTab('lexicon')}>
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-primary mb-4 transition-colors">
                <Sparkles size={24} />
              </div>
              <p className="text-white font-bold">Founder Lexicon</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Learn Startup Terms</p>
           </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-4">
          <h3 className="text-2xl font-black text-white italic tracking-tight">Recent <span className="text-primary">Deployments.</span></h3>
          <button onClick={() => setActiveTab('hub')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">View All Hub</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {filteredSims.slice(1, 4).map((sim) => (
             <article key={sim.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 shadow-xl hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={sim.image} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-white truncate leading-tight">{sim.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{sim.category}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Progress: <span className="text-white">{sim.progress || 0}%</span></div>
                   <button 
                     onClick={async () => {
                        await startNewSimulation({ id: sim.id, name: sim.title, region: sim.category, pitch: sim.pitch });
                        setActiveTab('workspace');
                     }}
                     className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all"
                   >
                     <ChevronRight size={16} />
                   </button>
                </div>
             </article>
           ))}
        </div>
      </section>
    </motion.div>
  );
}
