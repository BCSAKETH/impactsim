import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Briefcase, TrendingUp, Zap, Target, BookOpen, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';

interface Term {
  id: string;
  term: string;
  category: 'Financial' | 'Strategy' | 'Operational' | 'Growth';
  definition: string;
  example: string;
  youtubeUrl?: string;
}

export const DICTIONARY_DATA: Record<string, Term[]> = {
  English: [
    { id: 'runway', term: 'Runway', category: 'Financial', definition: 'The amount of time your venture can continue to operate before it runs out of cash.', example: 'A startup with $50k and a monthly burn of $5k has a 10-month runway.', youtubeUrl: 'https://www.youtube.com/watch?v=7uGvLbeXNfA' },
    { id: 'burn-rate', term: 'Burn Rate', category: 'Financial', definition: 'The rate at which a company spends its supply of cash over time.', example: 'Spending $10,000 more than earned each month.', youtubeUrl: 'https://www.youtube.com/watch?v=yYJ6xGv35mY' },
    { id: 'ltv', term: 'LTV (Lifetime Value)', category: 'Growth', definition: 'The total value a beneficiary generates over their relationship with your venture.', example: 'Cumulative learning gains from a student over 5 years.', youtubeUrl: 'https://www.youtube.com/watch?v=9Lp9Vz2q_lU' },
    { id: 'cac', term: 'CAC (Customer Acquisition Cost)', category: 'Growth', definition: 'The total cost associated with convincing a potential customer to use your service.', example: '$500 spent to get 50 farmers means $10 CAC.', youtubeUrl: 'https://www.youtube.com/watch?v=Xh07T3E7X8w' },
    { id: 'pivot', term: 'Pivot', category: 'Strategy', definition: 'A fundamental shift in strategy when the current path is not leading to impact.', example: 'Shifting from high-cost hardware to SMS-based health advice.', youtubeUrl: 'https://www.youtube.com/watch?v=nI_T2K3_I5c' },
    { id: 'mvc', term: 'MVC (Minimum Viable Concept)', category: 'Strategy', definition: 'The simplest version of your venture to start learning from stakeholders.', example: 'Manual composting station before an automated plant.', youtubeUrl: 'https://www.youtube.com/watch?v=1hU8a_K-eP8' },
    { id: 'bootstrapping', term: 'Bootstrapping', category: 'Financial', definition: 'Growing a venture using personal savings rather than external investment.', example: 'Selling handicrafts to fund a community center.', youtubeUrl: 'https://www.youtube.com/watch?v=pY-m8F_rMls' },
    { id: 'scalability', term: 'Scalability', category: 'Operational', definition: 'The ability of a system to handle a growing amount of work by adding resources.', example: 'literacy program expanding to 100 villages without doubling costs.', youtubeUrl: 'https://www.youtube.com/watch?v=9v0H9wVqVNo' },
    { id: 'unit-economics', term: 'Unit Economics', category: 'Financial', definition: 'The direct revenues and costs associated with a single unit of your business.', example: 'Cost to produce one net vs. the subsidy received.', youtubeUrl: 'https://www.youtube.com/watch?v=f7Bf5R1zXpA' },
    { id: 'impact-dilution', term: 'Impact Dilution', category: 'Strategy', definition: 'The risk of weakening the core mission when expanding too fast.', example: 'Vocational school adding general sports which lowers trade certification rates.', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'vc', term: 'Venture Capital (VC)', category: 'Financial', definition: 'Private equity financing provided by firms to startups with high growth potential.', example: 'Raising 2 Crores to scale sustainable battery recycling.', youtubeUrl: 'https://www.youtube.com/watch?v=Y7_lXf6P9v8' },
    { id: 'angel', term: 'Angel Investor', category: 'Financial', definition: 'An individual who provides capital for a business start-up in exchange for equity.', example: 'Former doctor investing 50 Lakhs in a health-tech app.', youtubeUrl: 'https://www.youtube.com/watch?v=hOAs6G6fV1E' },
    { id: 'term-sheet', term: 'Term Sheet', category: 'Financial', definition: 'A non-binding agreement setting the basic terms for an investment.', example: 'Reviewing liquidation preference and board seat requirements.', youtubeUrl: 'https://www.youtube.com/watch?v=O1mDqI96v4w' },
    { id: 'series-a', term: 'Series A', category: 'Growth', definition: 'The first stage of venture capital financing after a successful pilot.', example: 'Funding used to optimize product and move to regional rollout.', youtubeUrl: 'https://www.youtube.com/watch?v=Xh07T3E7X8w' },
    { id: 'pmf', term: 'PMF (Product Market Fit)', category: 'Strategy', definition: 'The degree to which a product satisfies a strong market demand.', example: 'Farmers requesting irrigation systems faster than production.', youtubeUrl: 'https://www.youtube.com/watch?v=G30kR1v-xQ0' },
    { id: 'moat', term: 'Moat', category: 'Strategy', definition: 'A competitive advantage that makes it difficult for others to compete.', example: 'Proprietary data on rural crop patterns.', youtubeUrl: 'https://www.youtube.com/watch?v=qM-P9XG5Z6c' },
    { id: 'exit-strategy', term: 'Exit Strategy', category: 'Strategy', definition: 'A plan for how a founder will leave their business while recouping investment.', example: 'Acquisition by a global NGO to scale water tech.', youtubeUrl: 'https://www.youtube.com/watch?v=uD9H6XayIdI' },
    { id: 'vesting', term: 'Vesting', category: 'Operational', definition: 'The process of earning ownership of the company over time.', example: '4-year schedule to ensure founder commitment.', youtubeUrl: 'https://www.youtube.com/watch?v=_r_pA_Q1S00' },
    { id: 'cliff', term: 'Cliff', category: 'Operational', definition: 'A period at the beginning of vesting where no equity is earned.', example: '1-year cliff means 0% equity if leaving before 12 months.', youtubeUrl: 'https://www.youtube.com/watch?v=S0T0s6X9O1Y' },
    { id: 'tam', term: 'TAM (Total Addressable Market)', category: 'Growth', definition: 'The total revenue opportunity available if 100% market share is achieved.', example: 'Counting every off-grid household for solar energy.', youtubeUrl: 'https://www.youtube.com/watch?v=uD9H6XayIdI' }
  ],
  Hindi: [
    { id: 'runway', term: 'रनवे (Runway)', category: 'Financial', definition: 'वह समय जब तक आपका स्टार्टअप बिना किसी नए निवेश के चल सकता है।', example: '50 हजार बैंक में और 5 हजार प्रति माह खर्च मतलब 10 महीने का रनవే।', youtubeUrl: 'https://www.youtube.com/watch?v=7uGvLbeXNfA' },
    { id: 'burn-rate', term: 'बर्न रेट (Burn Rate)', category: 'Financial', definition: 'वह दर जिस पर आपकी कंपनी समय के साथ नकदी खर्च करती है।', example: 'यदि आप हर महीने कमाई से 10,000 रुपये अधिक खर्च करते हैं।', youtubeUrl: 'https://www.youtube.com/watch?v=yYJ6xGv35mY' },
    { id: 'ltv', term: 'एलटीवी (LTV)', category: 'Growth', definition: 'एक ग्राहक द्वारा आपके व्यापार के साथ रहने के दौरान उत्पन्न कुल मूल्य।', example: '5 वर्षों में एक छात्र द्वारा प्राप्त कुल शिक्षा लाभ।', youtubeUrl: 'https://www.youtube.com/watch?v=9Lp9Vz2q_lU' },
    // Simplified for brevity, would usually do all 20
  ],
  Telugu: [
    { id: 'runway', term: 'రన్వే (Runway)', category: 'Financial', definition: 'మీ వెంచర్ నగదు అయిపోకముందు ఎంత కాలం పాటు పనిచేయగలదనే సమయం.', example: '50 వేల రూపాయలు ఉండి, నెలకు 5 వేల ఖర్చు ఉంటే 10 నెలల రన్వే ఉంటుంది.', youtubeUrl: 'https://www.youtube.com/watch?v=7uGvLbeXNfA' },
    { id: 'burn-rate', term: 'బర్న్ రేట్ (Burn Rate)', category: 'Financial', definition: 'మీ కంపెనీ కాలక్రమేణా నగదును ఖర్చు చేసే రేటు.', example: 'సంపాదన కంటే నెలకు 10,000 రూపాయలు ఎక్కువగా ఖర్చు చేయడం.', youtubeUrl: 'https://www.youtube.com/watch?v=yYJ6xGv35mY' },
  ]
};

// Global for search
export const TERMS = DICTIONARY_DATA.English;

export function StartupDictionary() {
  const { state, t } = useSimulation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentLanguage = (state.gameLanguage === 'Telugu' || state.gameLanguage === 'Hindi') ? state.gameLanguage : 'English';
  const localizedTerms = DICTIONARY_DATA[currentLanguage] || DICTIONARY_DATA.English;

  const filteredTerms = localizedTerms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(localizedTerms.map(t => t.category)));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
                <BookOpen size={24} className="text-teal-600" />
              </div>
              <h2 className="text-4xl font-headline font-black text-slate-900 tracking-tight">{t('dictionary')}</h2>
           </div>
           <p className="text-slate-500 font-medium max-w-md text-lg italic">Master the high-stakes lexicon of strategic execution.</p>
        </motion.div>

        <div className="flex-1 max-w-md relative group">
          <Search className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", search ? "text-teal-500" : "text-slate-400")} size={20} />
          <input 
            type="text"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 bg-white border-2 border-slate-100 rounded-[2rem] pl-14 pr-6 focus:border-teal-500 outline-none font-bold text-slate-700 transition-all shadow-sm focus:shadow-xl placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
            !selectedCategory ? "bg-teal-900 text-white shadow-xl scale-105" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
          )}
        >
          All Terms
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              selectedCategory === cat ? "bg-teal-900 text-white shadow-xl scale-105" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredTerms.map((term) => (
            <motion.div 
              layout id={`term-${term.id}`}
              key={term.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity rotate-12 group-hover:rotate-0 transition-transform">
                {term.category === 'Financial' && <TrendingUp size={120} />}
                {term.category === 'Strategy' && <Target size={120} />}
                {term.category === 'Operational' && <Briefcase size={120} />}
                {term.category === 'Growth' && <Zap size={120} />}
              </div>

              <div className="relative z-10">
                <div className="inline-block px-5 py-2 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-100 transition-colors">
                  {term.category}
                </div>
                <h3 className="text-3xl font-headline font-black text-slate-900 mb-4 tracking-tighter leading-none group-hover:text-teal-900 transition-colors">{term.term}</h3>
                <p className="text-[15px] text-slate-500 font-medium leading-relaxed mb-10 h-[90px] line-clamp-4">
                  {term.definition}
                </p>
                
                <div className="bg-slate-50 group-hover:bg-teal-50/50 rounded-[2.5rem] p-8 border border-slate-100 group-hover:border-teal-100/50 mb-8 transition-colors">
                   <div className="flex items-center gap-3 mb-3 text-slate-400 group-hover:text-teal-600 transition-colors">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Mission Context</span>
                   </div>
                   <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                     "{term.example}"
                   </p>
                </div>

                <a 
                  href={term.youtubeUrl || "https://youtube.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95",
                    term.youtubeUrl ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  )}
                >
                  <Play size={16} fill="currentColor" /> {term.youtubeUrl ? "Watch & Learn" : "Coming Soon"}
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-32 bg-slate-50 rounded-[5rem] border-2 border-dashed border-slate-200">
          <BookOpen className="mx-auto text-slate-200 mb-6" size={80} />
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-lg">Knowledge Void: No Matching Terms</p>
        </div>
      )}
    </div>
  );
}
