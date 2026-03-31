import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Coins, 
  Users, 
  ShieldCheck, 
  Code,
  Zap,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';

interface LexiconTerm {
  id: string;
  term: string;
  category: 'Financial' | 'Operational' | 'Strategic' | 'Legal' | 'Technical';
  definition: string;
  scenario: string;
  icon: any;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const BASE_LEXICON: LexiconTerm[] = [
  {
    id: 'ebitda',
    term: 'EBITDA',
    category: 'Financial',
    difficulty: 'Advanced',
    icon: Coins,
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a measure of a company\'s overall financial performance.',
    scenario: 'If your village water project earns $10,000 but spends $4,000 on operations, your EBITDA is $6,000—ignoring the cost of the pipes (Depreciation) or bank loans (Interest).'
  },
  {
    id: 'cac',
    term: 'CAC',
    category: 'Financial',
    difficulty: 'Intermediate',
    icon: Users,
    definition: 'Customer Acquisition Cost. The total cost of winning a customer to purchase a product or service.',
    scenario: 'If you spend $500 on posters to get 50 farmers to sign up for your irrigation tool, your CAC is $10 per farmer.'
  },
  {
    id: 'burn-rate',
    term: 'Burn Rate',
    category: 'Financial',
    difficulty: 'Beginner',
    icon: Zap,
    definition: 'The rate at which a new company uses up its venture capital to finance overhead before generating positive cash flow.',
    scenario: 'You have $50,000 in the bank. Your monthly expenses are $5,000 and you earn $0. Your burn rate is $5,000/month, giving you 10 months of runway.'
  },
  {
    id: 'pivot',
    term: 'Pivot',
    category: 'Strategic',
    difficulty: 'Beginner',
    icon: TrendingUp,
    definition: 'A fundamental change in business strategy when a company\'s current products or services aren\'t meeting the market\'s needs.',
    scenario: 'Your app for selling artisanal crafts isn\'t working, but users love the chat feature. You pivot to become a communication platform for artisans.'
  },
  {
    id: 'equity',
    term: 'Equity',
    category: 'Legal',
    difficulty: 'Intermediate',
    icon: ShieldCheck,
    definition: 'Ownership interest in a corporation in the form of common stock or preferred stock.',
    scenario: 'You give your lead developer 10% equity. If the company is ever sold for $1 Million, they would receive $100,000.'
  },
  {
    id: 'mvp',
    term: 'MVP',
    category: 'Operational',
    difficulty: 'Beginner',
    icon: Code,
    definition: 'Minimum Viable Product. A version of a product with just enough features to be usable by early customers who can then provide feedback.',
    scenario: 'Instead of building a whole water plant, you start with one solar-powered pump to prove the technology works in the village.'
  },
  {
    id: 'unit-economics',
    term: 'Unit Economics',
    category: 'Financial',
    difficulty: 'Advanced',
    icon: Coins,
    definition: 'Direct revenues and costs of a particular business model expressed on a per-unit basis.',
    scenario: 'For every single water bottle you sell for $1, it costs $0.40 to produce and $0.10 to deliver. Your profit per unit is $0.50.'
  },
  {
    id: 'runway',
    term: 'Runway',
    category: 'Financial',
    difficulty: 'Beginner',
    icon: TrendingUp,
    definition: 'The amount of time your business can keep operating before it runs out of money.',
    scenario: 'If you have $20,000 left and your monthly expenses are $2,000, your runway is 10 months.'
  }
];

export function FounderLexicon() {
  const { state } = useSimulation();
  const [selectedTerm, setSelectedTerm] = useState<LexiconTerm | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const searchQuery = state.searchQuery || '';

  const filteredLexicon = useMemo(() => {
    if (!searchQuery.trim()) return BASE_LEXICON;
    return BASE_LEXICON.filter(t => 
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAiLookup = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiExplanation(null);
    setSelectedTerm(null);

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a startup dictionary. Explain terms concisely with an "Example Scenario". Return JSON: { term, definition, scenario, category, difficulty }' },
            { role: 'user', content: `Explain the startup term: "${searchQuery}"` }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const data = await resp.json();
      const result = JSON.parse(data.choices[0]?.message?.content || '{}');
      setAiExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tight flex items-center gap-4 italic group">
            Founder <span className="text-primary group-hover:text-fuchsia-400 transition-colors">Lexicon.</span>
          </h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-[0.3em] text-xs">Master the Language of Innovation</p>
        </div>
        
        {searchQuery && filteredLexicon.length === 0 && (
          <button 
            onClick={handleAiLookup}
            disabled={aiLoading}
            className="group flex items-center gap-3 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-fuchsia-500/20"
          >
            {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Ask AI to explain "{searchQuery}"
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Term List */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="grid gap-2 overflow-y-auto max-h-[70vh] pr-2 no-scrollbar">
            {filteredLexicon.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTerm(t); setAiExplanation(null); }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all border-2",
                  (selectedTerm?.id === t.id && !aiExplanation)
                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" 
                    : "bg-slate-900/50 border-slate-900 hover:border-slate-800 hover:bg-slate-900"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl",
                  selectedTerm?.id === t.id ? "bg-primary text-slate-950" : "bg-slate-900 text-primary"
                )}>
                  <t.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{t.term}</h4>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{t.category}</p>
                </div>
                <ChevronRight size={16} className="text-slate-700" />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed View */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {(selectedTerm || aiExplanation) ? (
              <motion.div
                key={selectedTerm?.id || 'ai'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 h-full relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  {(selectedTerm?.icon || Sparkles) && React.createElement(selectedTerm?.icon || Sparkles, { size: 200 })}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    (selectedTerm?.difficulty === 'Beginner' || aiExplanation?.difficulty === 'Beginner') ? "bg-emerald-500/10 text-emerald-500" :
                    (selectedTerm?.difficulty === 'Intermediate' || aiExplanation?.difficulty === 'Intermediate') ? "bg-amber-500/10 text-amber-500" :
                    "bg-fuchsia-500/10 text-fuchsia-500"
                  )}>
                    {selectedTerm?.difficulty || aiExplanation?.difficulty || 'Knowledge'}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {selectedTerm?.category || aiExplanation?.category || 'Strategic'}
                  </span>
                </div>

                <h3 className="text-6xl font-black text-white mb-8 italic tracking-tighter">
                  {selectedTerm?.term || aiExplanation?.term}
                </h3>

                <div className="space-y-12">
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                       <BookOpen size={14} /> The Definition
                    </h4>
                    <p className="text-2xl text-slate-300 leading-relaxed font-medium">
                      {selectedTerm?.definition || aiExplanation?.definition}
                    </p>
                  </section>

                  <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 mb-4 flex items-center gap-2">
                       <Zap size={14} /> Example Scenario
                    </h4>
                    <p className="text-xl text-white leading-relaxed italic opacity-90">
                      "{selectedTerm?.scenario || aiExplanation?.scenario}"
                    </p>
                  </section>
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-slate-950/50 rounded-[3rem] border border-dashed border-slate-800 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
                   <Info size={40} className="text-slate-700" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Select a Term</h3>
                <p className="text-slate-500 max-w-sm">Founder Lexicon is your real-time guide to startup fundamentals. Select a term to see definitions and practical scenarios.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
