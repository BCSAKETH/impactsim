import React from 'react';
import { 
  Download,
  TrendingUp,
  Wallet,
  ArrowDown,
  Info,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Budgeting() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Hero Header */}
      <section className="relative mt-6">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">Financial Rigor • Social Impact</span>
            <h2 className="font-headline font-extrabold text-5xl text-on-surface leading-tight tracking-tight">
              Resource & <br />
              <span className="text-primary underline decoration-teal-100 decoration-8 underline-offset-8">Budgeting</span> Module
            </h2>
            <p className="mt-6 text-slate-500 text-lg max-w-xl leading-relaxed">
              Orchestrate your enterprise's financial destiny. Balance institutional stability with human-centric impact through our high-fidelity simulation engine.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 bg-teal-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-teal-100 text-xs font-bold uppercase tracking-tighter">Total Operating Capital</p>
                  <h3 className="text-4xl font-headline font-black mt-1">$1,284,000</h3>
                </div>
                <Wallet className="opacity-50" size={40} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={14} /> +12.4%
                </span>
                <span className="text-teal-100">vs last quarter</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Revenue Streams */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="font-headline font-bold text-xl text-on-surface">Revenue Streams</h4>
              <p className="text-slate-400 text-sm">Diversified funding sources and forecasts</p>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-2 hover:opacity-70">
              Export Report <Download size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Grants', val: '$450,000', color: 'bg-primary', p: 65 },
              { label: 'Sales', val: '$612,000', color: 'bg-secondary', p: 82 },
              { label: 'Donations', val: '$222,000', color: 'bg-teal-400', p: 40 },
            ].map((item) => (
              <div key={item.label} className="p-5 rounded-2xl bg-slate-50 border-l-4 border-primary">
                <p className="text-xs font-bold text-slate-400 uppercase">{item.label}</p>
                <p className="text-2xl font-headline font-extrabold text-on-surface mt-1">{item.val}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4">
                  <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.p}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 font-bold">Source</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Confidence</th>
                  <th className="pb-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Global Impact Grant', status: 'Secured', conf: 4, amount: '$250,000', sColor: 'bg-teal-100 text-teal-700' },
                  { name: 'Enterprise SaaS Sales', status: 'Ongoing', conf: 3, amount: '$45,000', sColor: 'bg-blue-100 text-blue-700' },
                  { name: 'Private Philanthropy', status: 'Pending', conf: 2, amount: '$120,000', sColor: 'bg-amber-100 text-amber-700' },
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="py-5 font-bold text-sm text-on-surface">{row.name}</td>
                    <td className="py-5">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", row.sColor)}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((c) => (
                          <div key={c} className={cn("w-2 h-2 rounded-full", c <= row.conf ? "bg-primary" : "bg-slate-200")} />
                        ))}
                      </div>
                    </td>
                    <td className="py-5 text-right font-headline font-bold text-sm">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resource Allocation */}
        <div className="bg-slate-100 rounded-3xl p-8 flex flex-col shadow-sm border border-slate-200">
          <h4 className="font-headline font-bold text-xl text-on-surface mb-2">Resource Allocation</h4>
          <p className="text-slate-400 text-sm mb-8">Simulation scenario: Market Expansion 2025</p>
          <div className="space-y-10 flex-1">
            {[
              { label: 'Staffing & Talent', val: 45 },
              { label: 'Operational Tech', val: 25 },
              { label: 'Marketing & Growth', val: 30 },
            ].map((slider) => (
              <div key={slider.label}>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-bold text-sm text-on-surface">{slider.label}</label>
                  <span className="text-primary font-headline font-black">{slider.val}%</span>
                </div>
                <div className="relative h-2 bg-slate-200 rounded-full">
                  <div className="absolute h-full bg-primary rounded-full" style={{ width: `${slider.val}%` }}></div>
                  <div className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full top-1/2 -translate-y-1/2 shadow-sm" style={{ left: `${slider.val}%`, marginLeft: '-8px' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-start gap-3">
              <Info className="text-secondary shrink-0" size={16} />
              <p className="text-xs text-slate-600 leading-relaxed">
                Adjusting <span className="font-bold text-primary">Marketing</span> to &gt;35% may trigger a sustainability alert in the 12-month simulation forecast.
              </p>
            </div>
          </div>
          <button className="w-full mt-8 bg-primary text-white py-4 rounded-full font-headline font-bold hover:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
            Update Simulation
          </button>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-secondary p-8 rounded-3xl text-white shadow-lg">
            <p className="text-[10px] uppercase font-bold opacity-70 mb-2 tracking-widest">Monthly Burn Rate</p>
            <h5 className="text-3xl font-headline font-black">$82,400</h5>
            <p className="text-xs mt-4 flex items-center gap-1">
              <ArrowDown size={14} /> 4% lower than avg
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Impact ROI</p>
            <h5 className="text-3xl font-headline font-extrabold text-on-surface">1.8x</h5>
            <p className="text-xs mt-4 text-primary font-bold">Excellent Efficiency</p>
          </div>
        </div>
        <div className="lg:col-span-3 bg-slate-50 rounded-3xl p-8 border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-headline font-bold text-xl text-on-surface">Expense Categories</h4>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white rounded-xl text-xs font-bold shadow-sm border border-slate-100">Monthly</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-400">Quarterly</button>
            </div>
          </div>
          <div className="flex items-end gap-4 h-64 mb-8 px-4">
            {[
              { label: 'Staff', h: 60, p: 70, color: 'bg-primary' },
              { label: 'Ops', h: 45, p: 85, color: 'bg-secondary' },
              { label: 'Growth', h: 80, p: 40, color: 'bg-primary' },
              { label: 'Legal', h: 30, p: 60, color: 'bg-secondary' },
              { label: 'R&D', h: 50, p: 90, color: 'bg-primary' },
              { label: 'Other', h: 20, p: 40, color: 'bg-secondary' },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-200 rounded-t-xl relative flex flex-col justify-end overflow-hidden" style={{ height: `${bar.h}%` }}>
                  <div className={cn("w-full rounded-t-xl transition-all", bar.color)} style={{ height: `${bar.p}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-teal-100 text-primary rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform border border-teal-200">
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </motion.div>
  );
}
