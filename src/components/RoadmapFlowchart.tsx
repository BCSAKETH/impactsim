import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowDown, Sparkles, TrendingUp, Heart, Wallet, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface RoadmapItem {
  id: string;
  challenge: {
    title: string;
  };
  chosenOption: {
    text: string;
    effect_trust: number;
    effect_impact: number;
    effect_budget: number;
  };
}

interface RoadmapFlowchartProps {
  decisions: RoadmapItem[];
}

export function RoadmapFlowchart({ decisions }: RoadmapFlowchartProps) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="bg-white rounded-[3rem] p-12 premium-shadow border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500" />
      
      <div className="text-center mb-16">
        <h3 className="font-headline font-black text-3xl text-slate-900 tracking-tight">Strategic Venture Roadmap</h3>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Dossier Execution Flowchart</p>
      </div>

      <div className="relative max-w-2xl mx-auto space-y-12">
        {/* The Connection Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-1 bg-slate-100 dashed-path z-0" />

        {decisions.map((decision, index) => (
          <motion.div
            key={decision.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={cn(
              "relative z-10 flex flex-col md:flex-row items-center gap-8",
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            )}
          >
            {/* The Node Content */}
            <div className={cn(
              "flex-1 bg-white p-6 rounded-[2rem] premium-shadow border border-slate-100 hover:border-primary/20 hover:scale-[1.02] transition-all w-full",
              index % 2 === 0 ? "text-right" : "text-left"
            )}>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-inherit">
                {index % 2 === 0 && <span className="flex-1" />}
                Decision Node {index + 1}
                {index % 2 !== 0 && <span className="flex-1" />}
              </h4>
              <p className="font-headline font-bold text-slate-900 text-lg mb-3 leading-tight">{decision.challenge.title}</p>
              <div className={cn(
                "p-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-600 inline-block",
                index % 2 === 0 ? "float-right" : ""
              )}>
                "{decision.chosenOption.text}"
              </div>
              <div className="clear-both" />
              
              <div className={cn(
                "mt-4 flex items-center gap-4 text-[10px] font-black uppercase text-slate-400",
                index % 2 === 0 ? "justify-end" : "justify-start"
              )}>
                <span className="flex items-center gap-1"><Heart size={10} className="text-blue-400" /> +{decision.chosenOption.effect_trust}%</span>
                <span className="flex items-center gap-1"><Sparkles size={10} className="text-violet-400" /> +{decision.chosenOption.effect_impact}%</span>
                <span className="flex items-center gap-1"><Wallet size={10} className="text-emerald-400" /> -${(Math.abs(decision.chosenOption.effect_budget) ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* The Central Node Circle */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl border-4 border-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/20 transition-all z-20 relative">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-emerald-500 rounded-[1.5rem] animate-ping opacity-10" />
            </div>

            {/* Placeholder to balance the flex layout */}
            <div className="flex-1 hidden md:block" />
          </motion.div>
        ))}

        {/* Final Outpost */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center pt-8"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-2xl">
            <Trophy size={40} />
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">Milestone</span>
          </div>
          <h4 className="mt-4 font-headline font-black text-xl text-slate-900">Success Verified.</h4>
        </motion.div>
      </div>
      
      <style>{`
        .dashed-path {
          background-image: linear-gradient(to bottom, #cbd5e1 50%, transparent 50%);
          background-size: 1px 16px;
          background-repeat: repeat-y;
        }
      `}</style>
    </div>
  );
}
