import React from 'react';
import { 
  Megaphone,
  Users,
  Radio,
  Clock,
  AlertTriangle,
  Leaf,
  Wallet,
  Heart,
  BarChart3,
  MapPin,
  Send,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { FEEDBACK } from '../constants';
import { cn } from '../lib/utils';

export function ActiveWorkspace() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1 rounded-full bg-teal-100 text-primary text-xs font-bold mb-4 font-body">SCENARIO ID: RURAL-MH-042</span>
          <h2 className="font-headline font-extrabold text-5xl text-on-surface leading-tight tracking-tight">Mental Health Outreach</h2>
          <p className="text-secondary font-body mt-2 text-lg">Central Appalachian Region • Community Phase II</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Impact Score</p>
            <p className="text-3xl font-headline font-bold text-primary">84<span className="text-sm font-normal text-slate-400">/100</span></p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Time Elapsed</p>
            <p className="text-3xl font-headline font-bold text-secondary">14<span className="text-sm font-normal text-slate-400">d</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Main Challenge */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative">
              <h3 className="font-headline font-bold text-2xl mb-6 flex items-center gap-3">
                <Megaphone className="text-primary" />
                Current Challenge: Low Community Engagement
              </h3>
              <div className="text-on-surface-variant leading-relaxed mb-8 font-body space-y-4">
                <p>Despite the successful deployment of the mobile clinic, attendance in the northern sector remains critically low. Initial surveys suggest a deep-rooted skepticism of "outside" medical interventions. The local harvest season has also begun, meaning most community members are working 12-hour days in the fields.</p>
                <p className="font-bold text-on-surface italic border-l-4 border-primary pl-4">"The program looks good on paper, but if the town elders don't vouch for you, nobody is walking through those doors." — Local Field Agent</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                {[
                  { title: 'Partner with local leaders', desc: 'Directly engage the Ministerial Association and High School coaches.', icon: Users },
                  { title: 'Run social media campaign', desc: 'Target hyper-local Facebook groups with testimonial videos.', icon: Radio },
                  { title: 'Shift to evening hours', desc: 'Re-allocate budget for overtime to accommodate harvest workers.', icon: Clock },
                  { title: 'Maintain status quo', desc: 'Focus on existing participants and wait for seasonal shift.', icon: AlertTriangle },
                ].map((action) => (
                  <button key={action.title} className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-primary hover:text-white transition-all text-left shadow-sm">
                    <action.icon className="mt-1 text-primary group-hover:text-white" size={20} />
                    <div>
                      <p className="font-bold">{action.title}</p>
                      <p className="text-xs opacity-70 mt-1">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Feedback & Notes */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
              <h4 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <MessageSquare className="text-secondary" size={20} />
                Stakeholder Feedback
              </h4>
              <div className="space-y-6">
                {FEEDBACK.map((f) => (
                  <div key={f.id} className="flex gap-4">
                    <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{f.name} • {f.role}</p>
                      <p className="text-sm mt-1 text-on-surface-variant leading-snug">{f.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h4 className="font-headline font-bold text-lg mb-4">Architect's Note</h4>
                <p className="text-sm opacity-90 leading-relaxed">Consider that 'Trust' is a slower-moving metric than 'Reach'. Choosing a high-visibility digital campaign might boost awareness but could negatively impact long-term community trust if perceived as impersonal.</p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Pro Tip</p>
                  <p className="text-sm mt-1">Hover over your metrics to see historical volatility.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Status */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-headline font-bold text-xl mb-8">Real-time Status</h4>
            <div className="space-y-10">
              {[
                { label: 'Social Impact', value: 62, icon: Leaf, color: 'bg-primary', sub: '+4.2% since previous decision' },
                { label: 'Remaining Budget', value: 38, icon: Wallet, color: 'bg-secondary', sub: 'Burn rate: Medium', display: '$12,450' },
                { label: 'Community Trust', value: 41, icon: Heart, color: 'bg-red-500', sub: '⚠️ CRITICAL THRESHOLD', alert: true },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-2">
                      <m.icon className={cn(m.alert ? "text-red-500" : "text-primary")} size={18} />
                      <span className="font-bold text-sm">{m.label}</span>
                    </div>
                    <span className="text-lg font-headline font-bold">{m.display || `${m.value}%`}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", m.color)} style={{ width: `${m.value}%` }}></div>
                  </div>
                  <p className={cn("text-[10px] mt-2", m.alert ? "text-red-500 font-bold uppercase" : "text-slate-400 italic")}>
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-5 bg-teal-50 rounded-2xl border border-teal-100">
              <p className="text-xs font-bold text-primary flex items-center gap-2">
                <BarChart3 size={14} />
                PREDICTIVE FORECAST
              </p>
              <p className="text-sm mt-2 text-teal-900 leading-snug">Current trajectory indicates a potential project stall in 12 days if Trust levels remain under 50%.</p>
            </div>
          </section>

          {/* Map Preview */}
          <section className="bg-slate-100 rounded-3xl overflow-hidden aspect-square relative group border border-slate-200 shadow-sm">
            <img 
              src="https://picsum.photos/seed/map/600/600" 
              alt="Map" 
              className="w-full h-full object-cover grayscale brightness-110 opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="text-primary mb-4" size={48} />
              <h5 className="font-headline font-bold text-lg">Region: Zone B-4</h5>
              <p className="text-sm text-slate-500 px-6">Northern sector currently showing zero engagement markers.</p>
            </div>
            <div className="absolute bottom-4 right-4 glass-panel px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold border border-white/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE SATELLITE FEED
            </div>
          </section>
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group">
          <Send size={24} fill="currentColor" />
          <span className="absolute right-20 bg-on-surface text-white px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            SUBMIT SIMULATION LOG
          </span>
        </button>
      </div>
    </motion.div>
  );
}
