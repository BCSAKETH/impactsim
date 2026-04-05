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
  Brain
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
  const { startNewSimulation, state, localSims, updateState, t } = useSimulation();

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
      className="space-y-20 pb-20"
    >
      {/* Welcome Section */}
      <div className="grid grid-cols-12 gap-10 items-end">
        <div className="col-span-12 lg:col-span-8">
          <motion.span 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black text-secondary tracking-[0.4em] uppercase block mb-4"
          >
            {t('strategic_hub')}
          </motion.span>
          <h1 className="text-6xl font-headline font-black text-on-surface tracking-tighter leading-[0.9]">
            {t('welcome')}, <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent italic">{user?.displayName?.split(' ')[0] || 'Architect'}.</span><br />
            <span className="opacity-40">{t('next_move')}</span>
          </h1>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-end">
          <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm border border-white/50">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('system_ready')}</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Main Hero Card */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden rounded-[3rem] bg-slate-950 p-12 flex flex-col justify-between min-h-[480px] shadow-2xl group">
          {allSims.length > 0 ? (
            <>
              <div className="absolute inset-0 opacity-50 transition-transform duration-[4s] group-hover:scale-110 ease-out">
                <img 
                  src={allSims[0].image} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                >
                  <Sparkles size={14} className="text-teal-400" />
                  {t('primary_mission')}
                </motion.div>
                <h2 className="text-6xl font-headline font-black text-white mb-6 line-clamp-2 leading-[0.95] tracking-tighter group-hover:tracking-tight transition-all duration-500">{allSims[0].title}</h2>
                <p className="text-slate-300 max-w-xl font-body text-xl leading-relaxed line-clamp-2 mb-12 opacity-80 italic">
                  "{allSims[0].description}"
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('workspace')} 
                  className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-white/5"
                >
                  Resume Laboratory <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                        <img src={`https://i.pravatar.cc/100?u=stakeholder${i}`} alt="Stakeholder" className="w-full h-full object-cover" />
                     </div>
                   ))}
                   <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-teal-600 flex items-center justify-center text-[10px] font-black text-white">
                      +12
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/20 mb-2 border border-white/10 animate-pulse">
                 <Plus size={48} />
              </div>
              <div>
                <h2 className="text-5xl font-headline font-black text-white mb-4 leading-tight tracking-tighter">Your Hub is Empty.</h2>
                <p className="text-slate-400 max-w-md font-body text-xl opacity-60 italic">"The best way to predict the future is to simulate it."</p>
              </div>
              <button 
                onClick={() => setActiveTab('hub')}
                className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-xl"
              >
                Launch Discovery <Sparkles size={22} />
              </button>
            </div>
          )}
        </div>

        {/* Metrics Vertical Stack */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-10 rounded-[2.5rem] flex flex-col justify-between flex-1 premium-shadow border border-slate-100/50 group"
          >
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Social Impact Score</span>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <Heart size={24} />
              </div>
            </div>
            <div>
              <div className="text-5xl font-headline font-black text-on-surface tracking-tighter">{state.impactScore}</div>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${state.impactScore}%` }} className="h-full bg-teal-500" />
                </div>
                <span className="text-xs font-black text-teal-600 uppercase">Mastery Level</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-10 rounded-[2.5rem] flex flex-col justify-between flex-1 premium-shadow border border-slate-100/50 group"
          >
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Stakeholder Trust</span>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                <Users size={24} />
              </div>
            </div>
            <div>
              <div className="text-5xl font-headline font-black text-on-surface tracking-tighter">{state.trust}%</div>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${state.trust}%` }} className="h-full bg-secondary" />
                </div>
                <span className="text-xs font-black text-secondary uppercase">Approval Rating</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setActiveTab('boardroom')}
            className="bg-teal-950 p-10 rounded-[2.5rem] flex flex-col justify-between flex-1 shadow-2xl border border-white/10 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em]">Master Feature</span>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-400 group-hover:text-teal-950 transition-all border border-white/10">
                <Brain size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-headline font-black text-white tracking-tighter mb-2">Executive Boardroom</div>
              <p className="text-[10px] font-black text-teal-300/60 uppercase tracking-widest flex items-center gap-2">
                 Launch AI Simulation <ArrowRight size={12} />
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-12 gap-10">
        {/* Financial Sustainability */}
        <div className="col-span-12 lg:col-span-5 bg-white p-12 rounded-[3rem] premium-shadow border border-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-headline font-black text-2xl text-on-surface tracking-tight">Sustainability</h3>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><TrendingUp size={20} /></div>
          </div>
          <div className="space-y-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Operating Capital</p>
                <p className="text-4xl font-headline font-black text-on-surface tracking-tighter">${(state.budget ?? 0).toLocaleString()}</p>
              </div>
              <div className="h-20 w-40 flex items-end gap-1.5">
                {[30, 50, 45, 70, 85, 100].map((h, i) => (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className={cn(
                      "w-full rounded-t-lg transition-colors",
                      i === 5 ? "bg-primary" : "bg-primary/20 hover:bg-primary/40"
                    )} 
                  />
                ))}
              </div>
            </div>
            <div className="pt-10 border-t border-slate-100">
               <div className="flex justify-between mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>Economic Runway</span>
                  <span className="text-teal-600">{Math.max(1, Math.round((state.budget || 1000) / 1500))} Cycles remaining</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (state.budget / 20000) * 100)}%` }} />
               </div>
            </div>
          </div>
        </div>

        {/* Portfolio Feed */}
        <div className="col-span-12 lg:col-span-7 bg-white p-12 rounded-[3rem] premium-shadow border border-slate-100/50">
          <div className="flex justify-between items-center mb-10">
             <h3 className="font-headline font-black text-2xl text-on-surface tracking-tight">Venture Portfolio</h3>
             <button onClick={() => setActiveTab('hub')} className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 hover:text-teal-800 transition-colors">Launch New Lab +</button>
          </div>
          <div className="space-y-6">
             {allSims.length > 0 ? (
               allSims.slice(0, 3).map((sim, idx) => (
                 <motion.button
                   whileHover={{ x: 10 }}
                   key={sim.id || idx}
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
                   className="w-full flex items-center gap-6 p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 text-left group"
                 >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                       <img src={sim.image} alt={sim.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-headline font-black text-on-surface group-hover:text-primary transition-colors tracking-tight">{sim.title}</h4>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{sim.category}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-teal-500/40 group-hover:bg-teal-500 transition-colors" style={{ width: `${sim.progress || 0}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{sim.progress || 0}% Progress</span>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                 </motion.button>
               ))
             ) : (
               <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <p className="text-slate-400 font-bold text-sm tracking-tight">No ventures registered. Start your first in the Strategy Lab.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

