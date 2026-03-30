import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Globe, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const impactData = [
  { name: 'Jan', impact: 4000, trust: 2400, sustainability: 2400 },
  { name: 'Feb', impact: 3000, trust: 1398, sustainability: 2210 },
  { name: 'Mar', impact: 2000, trust: 9800, sustainability: 2290 },
  { name: 'Apr', impact: 2780, trust: 3908, sustainability: 2000 },
  { name: 'May', impact: 1890, trust: 4800, sustainability: 2181 },
  { name: 'Jun', impact: 2390, trust: 3800, sustainability: 2500 },
  { name: 'Jul', impact: 3490, trust: 4300, sustainability: 2100 },
];

const geographicData = [
  { name: 'Sub-Saharan Africa', value: 45 },
  { name: 'Southeast Asia', value: 30 },
  { name: 'Latin America', value: 15 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#005050', '#3a5f94', '#006a6a', '#bec9c8'];

export function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">Impact Intelligence</span>
          <h2 className="font-headline font-extrabold text-5xl text-on-surface tracking-tight">Analytics Dashboard</h2>
          <p className="text-on-surface-variant mt-4 max-w-xl font-body">
            Real-time data synthesis across all active and historical simulations. Predictive modeling for long-term social equilibrium.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Calendar size={18} /> Last 30 Days
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Beneficiaries', val: '124.5k', change: '+12%', icon: Users, color: 'text-primary' },
          { label: 'Social ROI', val: '2.4x', change: '+0.4', icon: TrendingUp, color: 'text-secondary' },
          { label: 'Impact Equilibrium', val: '88%', change: 'Stable', icon: Heart, color: 'text-red-500' },
          { label: 'Global Reach', val: '14 Regions', change: '+2', icon: Globe, color: 'text-teal-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl bg-slate-50", m.color)}>
                <m.icon size={24} />
              </div>
              <span className="text-xs font-bold text-primary">{m.change}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
            <p className="text-3xl font-headline font-black text-on-surface mt-1">{m.val}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-12 gap-8">
        {/* Impact Trends */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-headline font-bold text-xl">Impact Equilibrium Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Trust</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impactData}>
                <defs>
                  <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005050" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#005050" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a5f94" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3a5f94" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="impact" stroke="#005050" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                <Area type="monotone" dataKey="trust" stroke="#3a5f94" strokeWidth={3} fillOpacity={1} fill="url(#colorTrust)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-headline font-bold text-xl mb-10">Geographic Influence</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {geographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {geographicData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-on-surface">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <Globe size={400} strokeWidth={0.5} className="translate-x-1/4 -translate-y-1/4" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8">
              <TrendingUp size={14} className="text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Predictive Modeling</span>
            </div>
            <h3 className="text-4xl font-headline font-extrabold mb-6 leading-tight">
              Scaling to <span className="text-teal-400 italic">250k Beneficiaries</span> by Q4 2026.
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Our AI-driven simulation engine predicts a 92% probability of achieving self-sustaining impact equilibrium in the Southeast Asia sector if current resource allocation remains optimized.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-teal-100 transition-all">
                Run Scenario Forecast
              </button>
              <button className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-full font-bold backdrop-blur-sm transition-all">
                View Risk Assessment
              </button>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <h4 className="font-headline font-bold text-xl mb-8">Quarterly Growth Projection</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData}>
                  <Bar dataKey="impact" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Confidence Interval</p>
              <p className="text-teal-400 font-bold">94.2%</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
