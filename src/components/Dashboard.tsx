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
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { SIMULATIONS } from '../constants';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, where } from 'firebase/firestore';

export function Dashboard() {
  const [syncing, setSyncing] = useState(false);
  const [cloudSims, setCloudSims] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'simulations'), where('authorUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims: any[] = [];
      snapshot.forEach((doc) => {
        sims.push(doc.data());
      });
      setCloudSims(sims);
    });

    return unsubscribe;
  }, [user]);

  const syncToCloud = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      for (const sim of SIMULATIONS) {
        await setDoc(doc(db, 'simulations', sim.id), {
          id: sim.id,
          title: sim.title,
          status: sim.status || 'Running',
          progress: sim.progress || 0,
          authorUid: user.uid,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16"
    >
      {/* Welcome Section */}
      <div className="grid grid-cols-12 gap-10 items-end">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase block mb-4">Monday, October 24</span>
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
            Welcome back, <span className="text-primary">Architect.</span><br />
            Your impact is scaling.
          </h1>
        </div>
        <div className="col-span-12 lg:col-span-5 pb-2 flex flex-col items-end gap-4">
          <p className="text-lg text-on-surface-variant max-w-md font-body text-right">
            Today's projections show a <span className="text-primary font-bold">+12% surge</span> in stakeholder trust.
          </p>
          <button 
            onClick={syncToCloud}
            disabled={syncing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              cloudSims.length > 0 
                ? "bg-teal-50 text-teal-700 border border-teal-100" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {syncing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : cloudSims.length > 0 ? (
              <Check size={16} />
            ) : (
              <Cloud size={16} />
            )}
            {syncing ? "Syncing..." : cloudSims.length > 0 ? "Cloud Synced" : "Sync to Cloud"}
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Hero Card */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden rounded-3xl signature-gradient p-10 flex flex-col justify-between min-h-[400px] shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 transform translate-x-1/4">
            <img 
              src="https://picsum.photos/seed/blueprint/800/800" 
              alt="Background" 
              className="w-full h-full object-cover mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
              Last Active: 2h ago
            </span>
            <h2 className="text-4xl font-headline font-bold text-white mb-4">Urban Literacy Initiative</h2>
            <p className="text-teal-100 max-w-md font-body text-lg leading-relaxed">
              Phase 3: Scaling Educational Infrastructure in Sub-Saharan Metropolitan Zones. You have 4 pending decisions.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <button className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-95 transition-all duration-150 flex items-center gap-3 shadow-lg">
              Resume Simulation <Play size={20} fill="currentColor" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg backdrop-blur-sm transition-all">
              View Analytics
            </button>
          </div>
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
              <div className="text-4xl font-headline font-black text-on-surface">84.2</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary font-bold text-sm">+4.2%</span>
                <span className="text-slate-400 text-xs">from last week</span>
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
              <div className="text-4xl font-headline font-black text-on-surface">91%</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary font-bold text-sm">Stable</span>
                <span className="text-slate-400 text-xs">Across all cohorts</span>
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
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Burn Rate</p>
                <p className="text-2xl font-headline font-bold">$12.4k <span className="text-sm font-normal text-slate-400">/mo</span></p>
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
                <span className="text-sm font-bold text-on-surface-variant">Runway Remaining</span>
                <span className="text-sm font-bold text-primary">18 Months</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Workspace */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-bold text-xl text-on-surface">Active Workspace</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All Simulations</button>
          </div>
          <div className="space-y-4">
            {SIMULATIONS.slice(1, 4).map((sim) => (
              <div key={sim.id} className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={sim.image} alt={sim.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{sim.title}</h4>
                      <p className="text-xs text-slate-400 font-medium">{sim.category}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      sim.status === 'Review Required' ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"
                    )}>
                      {sim.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${sim.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant">{sim.progress}%</span>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-white text-slate-300 hover:text-primary transition-all shadow-sm">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
