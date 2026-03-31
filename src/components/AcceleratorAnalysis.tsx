import React, { useState } from 'react';
import {
  Rocket,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Loader2,
  Sparkles,
  Building2,
  Target,
  Shield,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Landmark,
  Trophy,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { toast } from 'sonner';

interface AcceleratorMatch {
  name: string;
  program: string;
  similarity: number;
  stage: string;
  location: string;
  fundingRaised: string;
  keyStrength: string;
}

interface GapItem {
  area: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface SchemaItem {
  name: string;
  description: string;
  fit: number;
  reason: string;
}

interface GovernmentScheme {
  name: string;
  agency: string;
  description: string;
  eligibility: string;
  fundingAmount: string;
  link: string;
}

interface AnalysisResult {
  acceleratorMatches: AcceleratorMatch[];
  gapAnalysis: GapItem[];
  optimalSchemas: SchemaItem[];
  governmentSchemes: GovernmentScheme[];
  overallReadiness: number;
  bestAccelerator: string;
  bestGovernmentScheme: string;
  summary: string | {
    pitch: string;
    keyChallenge: string;
    recommendedNextSteps: string;
  };
}

export function AcceleratorAnalysis() {
  const { state, updateState } = useSimulation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('accelerators');
  const [selectedStage, setSelectedStage] = useState<string>('');

  const hasPitch = state.pitch && state.pitch.trim().length > 0;
  const hasStage = state.stage && state.stage.trim().length > 0;

  React.useEffect(() => {
    if (hasPitch && hasStage && !result && !isAnalyzing) {
      runAnalysis();
    }
  }, [hasPitch, hasStage]);

  const runAnalysis = async () => {
    if (!hasPitch) {
      toast.error('No pitch found. Create a simulation first from the Simulation Hub.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY';
      if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
        throw new Error('Groq API Key is missing. Please check your environment variables.');
      }

      const prompt = `
You are a world-class startup advisor and policy analyst. Analyze the following social entrepreneurship pitch and provide a comprehensive accelerator and policy analysis. Please output the ENTIRE JSON response strictly translated into ${state.gameLanguage || 'English'}.

**Pitch:** "${state.pitch}"
**Location:** "${state.location || 'Not specified'}"  
**Stage:** "${state.stage || 'Idea Stage'}"
**Category:** "${state.region || 'General'}"

Provide a VERY DETAILED analysis with the following:

1. **Accelerator Matches**: Find 4-5 REAL, well-known startups from Y Combinator and Techstars (include the actual startup names) that operate in a similar field. Provide their similarity score, stage, location, and key strength.

2. **Gap Analysis**: identify 4-5 CRITICAL gaps compared to these top-tier companies. Be specific about technical, market, or operational weaknesses.

3. **Optimal Schemas**: Propose 3-4 specialized business or impact models (e.g., 'B-Corp', 'Direct-to-Consumer Social Model', 'Hybrid-Non-Profit') specifically for this location and stage.

4. **Government Schemes**: Focus EXCLUSIVELY on government grants, subsidies, and schemes that exist in the specified location (${state.location}). If location is India, find 4-6 schemes like Startup India, MUDRA, or ATAL. If the location is global or unspecified, search for major international development grants.

5. **Overall Readiness Score**: (0-100).
6. **Best Accelerator**: Single best fit.
7. **Best Government Scheme**: Single best fit.
8. **Summary**: A premium 3-4 sentence "Executive Masterclass" summary.
      `;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a world-class startup advisor and policy analyst. Output MUST be valid JSON detailing acceleratorMatches, gapAnalysis, optimalSchemas, governmentSchemes, overallReadiness, bestAccelerator, bestGovernmentScheme, and summary.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to generate analysis from Groq API');
      }

      const data = await response.json();
      const textResponse = data.choices[0]?.message?.content || '{}';
      const cleanText = textResponse.replace(/^```json/mi, '').replace(/```$/m, '').trim();
      const parsed: AnalysisResult = JSON.parse(cleanText || '{}');
      setResult(parsed);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'minor': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <XCircle size={16} />;
      case 'moderate': return <AlertTriangle size={16} />;
      case 'minor': return <Lightbulb size={16} />;
      default: return <Lightbulb size={16} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {!hasStage && hasPitch ? (
        <section className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 max-w-2xl mx-auto text-center mt-20">
          <Target className="w-16 h-16 text-fuchsia-500 mx-auto mb-6" />
          <h2 className="font-headline font-bold text-3xl mb-4 text-on-surface">What stage is your project at?</h2>
          <p className="text-slate-500 mb-8">Before we run the accelerator diagnostics, tell us exactly where you are in your journey.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {['Idea Stage', 'Developing Prototype', 'Developed/Pre-Revenue', 'Complete/Generating Revenue'].map((stageLabel) => (
              <button
                key={stageLabel}
                onClick={() => setSelectedStage(stageLabel)}
                className={cn(
                  "p-4 rounded-xl border text-sm font-bold transition-all",
                  selectedStage === stageLabel ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700" : "border-slate-200 bg-white text-slate-600 hover:border-fuchsia-300"
                )}
              >
                {stageLabel}
              </button>
            ))}
          </div>
          <button 
            disabled={!selectedStage}
            onClick={() => updateState({ stage: selectedStage })}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Run Accelerator Diagnostics
          </button>
        </section>
      ) : (
        <>
          {/* Hero Header */}
          <section className="relative">
        <div className="grid grid-cols-12 gap-10 items-end">
          <div className="col-span-12 md:col-span-7">
            <label className="font-body font-bold text-secondary text-sm tracking-widest uppercase mb-4 block">
              Accelerator & Policy Lab
            </label>
            <h2 className="font-headline font-extrabold text-5xl text-on-surface leading-tight tracking-tight">
              Startup{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent italic">
                Intelligence.
              </span>
            </h2>
            <p className="mt-6 text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Compare your venture against YCombinator & Techstars alumni. Discover funding gaps, optimal strategies, and government schemes tailored to your location.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 flex justify-end">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !hasPitch}
              className={cn(
                'px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100',
                hasPitch
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Rocket size={24} />
                  Run Diagnostics
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Pitch Context Card */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-3">
          <Sparkles className="text-violet-500" size={22} />
          Venture Blueprint Details
        </h3>
        {hasPitch ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Pitch</p>
              <textarea 
                className="w-full bg-transparent text-on-surface leading-relaxed font-bold resize-none h-24 focus:outline-none"
                value={state.pitch}
                onChange={(e) => updateState({ pitch: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 rounded-2xl border-2 border-violet-100">
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-3">Target Location</p>
                <div className="relative">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" size={16} />
                  <input 
                    className="w-full bg-transparent font-headline font-black text-violet-900 pl-6 border-b border-violet-200 focus:border-violet-500 outline-none pb-1"
                    value={state.location || ''}
                    onChange={(e) => updateState({ location: e.target.value })}
                    placeholder="Enter City/Country"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl border-2 border-teal-100">
                <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-3">Venture Stage</p>
                <div className="relative">
                  <Layers className="absolute left-0 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none" size={16} />
                  <select 
                    className="w-full bg-transparent font-headline font-black text-teal-900 pl-6 border-b border-teal-200 focus:border-teal-500 outline-none pb-1 appearance-none cursor-pointer"
                    value={state.stage || ''}
                    onChange={(e) => updateState({ stage: e.target.value })}
                  >
                    <option value="Idea Stage">Idea Stage</option>
                    <option value="Developing Prototype">Developing Prototype</option>
                    <option value="Developed/Pre-Revenue">Developed/Pre-Revenue</option>
                    <option value="Complete/Generating Revenue">Complete/Generating Revenue</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-slate-300" size={36} />
            </div>
            <h4 className="font-headline font-bold text-xl text-on-surface mb-2">No Pitch Loaded</h4>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Head to the <strong>Simulation Hub</strong> and create a new simulation first. Your pitch, location, and stage will be automatically captured for analysis.
            </p>
          </div>
        )}
      </section>

      {/* Analysis Loading State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-12 text-white text-center shadow-2xl"
          >
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 opacity-80" />
            <h3 className="font-headline font-bold text-2xl mb-2">Running Deep Analysis...</h3>
            <p className="text-violet-200 max-w-lg mx-auto">
              Comparing your pitch against 5,000+ accelerator-backed startups and scanning government databases for matching policies.
            </p>
            <div className="flex justify-center gap-8 mt-8">
              {['YC Database', 'Techstars Network', 'Govt Schemes', 'Gap Analysis'].map((item, i) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                  {item}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Readiness Score + Summary */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center h-full flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Accelerator Readiness</p>
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                    <circle
                      cx="60" cy="60" r="52"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(result.overallReadiness / 100) * 327} 327`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-headline font-black text-on-surface">{result.overallReadiness}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-violet-50 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-bold text-violet-400 uppercase">Best Accelerator</p>
                    <p className="font-bold text-violet-900 text-sm">{result.bestAccelerator}</p>
                  </div>
                  <div className="bg-emerald-50 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Best Scheme</p>
                    <p className="font-bold text-emerald-900 text-sm">{result.bestGovernmentScheme}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white h-full shadow-2xl relative overflow-hidden border-t-4 border-violet-500">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={120} />
                </div>
                <h3 className="font-headline font-black text-3xl mb-6 flex items-center gap-3 italic tracking-tight">
                  <div className="p-2 bg-violet-500 rounded-lg">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  Executive Intelligence Summary
                </h3>
                <div className="text-slate-300 text-lg leading-relaxed mb-10 font-medium italic">
                  {typeof result.summary === 'string' ? (
                    `"${result.summary}"`
                  ) : (
                    <div className="space-y-4 not-italic">
                      <div>
                        <span className="text-violet-400 font-black uppercase text-[10px] tracking-widest block mb-1">The Pitch</span>
                        <p className="text-white text-xl">"{String(result.summary?.pitch)}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <span className="text-fuchsia-400 font-black uppercase text-[10px] tracking-widest block mb-1">Key Challenge</span>
                          <p className="text-sm font-bold text-slate-200">{String(result.summary?.keyChallenge)}</p>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-black uppercase text-[10px] tracking-widest block mb-1">Next Steps</span>
                          <p className="text-sm font-bold text-slate-200">{String(result.summary?.recommendedNextSteps)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                    <p className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Simulated Matches</p>
                    <p className="text-2xl font-black">{result.acceleratorMatches.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">YC/Techstars Network</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                    <p className="text-fuchsia-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Gaps Identified</p>
                    <p className="text-2xl font-black">{result.gapAnalysis.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Strategic Hurdles</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Relevant Schemes</p>
                    <p className="text-2xl font-black">{result.governmentSchemes.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Localized Policies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion Sections */}

          {/* 1. Accelerator Matches */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <button
              onClick={() => toggleSection('accelerators')}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white">
                  <Trophy size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-xl text-on-surface">YC & Techstars Comparison</h3>
                  <p className="text-sm text-on-surface-variant">Similar startups from top accelerators</p>
                </div>
              </div>
              {expandedSection === 'accelerators' ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'accelerators' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 space-y-4">
                    {result.acceleratorMatches.map((match, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-6 p-5 rounded-2xl bg-slate-50 hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 transition-all border border-transparent hover:border-violet-200"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-headline font-black text-violet-600 text-lg">
                            {(match.program === 'YC' || match.program?.includes('Y Combinator')) ? 'YC' : 'TS'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-headline font-bold text-on-surface truncate">{match.name}</h4>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 flex-shrink-0">
                              {match.program}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant truncate">{String(match.keyStrength)}</p>
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {String(match.location)}</span>
                            <span>{String(match.stage)}</span>
                            <span className="font-bold text-emerald-600">{String(match.fundingRaised)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-headline font-black text-violet-600">{match.similarity}%</div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Match</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Gap Analysis */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <button
              onClick={() => toggleSection('gaps')}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white">
                  <AlertTriangle size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-xl text-on-surface">Gap Analysis</h3>
                  <p className="text-sm text-on-surface-variant">What you're missing vs. top startups</p>
                </div>
              </div>
              {expandedSection === 'gaps' ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'gaps' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 space-y-4">
                    {result.gapAnalysis.map((gap, i) => (
                      <div key={i} className={cn('p-5 rounded-2xl border', getSeverityColor(gap.severity))}>
                        <div className="flex items-center gap-3 mb-3">
                          {getSeverityIcon(gap.severity)}
                          <span className="font-headline font-bold">{gap.area}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/80">
                            {gap.severity}
                          </span>
                        </div>
                        <p className="text-sm mb-3 opacity-80">{typeof gap.description === 'string' ? gap.description : JSON.stringify(gap.description)}</p>
                        <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                          <ArrowRight size={14} className="mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium">{typeof gap.recommendation === 'string' ? gap.recommendation : JSON.stringify(gap.recommendation)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Optimal Schemas */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <button
              onClick={() => toggleSection('schemas')}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white">
                  <Lightbulb size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-xl text-on-surface">Optimal Schemas</h3>
                  <p className="text-sm text-on-surface-variant">Best strategies for your stage & location</p>
                </div>
              </div>
              {expandedSection === 'schemas' ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'schemas' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.optimalSchemas.map((schema, i) => (
                      <div
                        key={i}
                        className="relative p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 hover:shadow-lg transition-all group"
                      >
                        {i === 0 && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                            Best Fit
                          </div>
                        )}
                        <h4 className="font-headline font-bold text-teal-900 mb-2">{String(schema.name)}</h4>
                        <p className="text-sm text-teal-700 opacity-80 mb-4">{String(schema.description)}</p>
                        <div className="flex items-center justify-between">
                          <div className="h-2 flex-1 bg-teal-100 rounded-full overflow-hidden mr-4">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: `${schema.fit}%` }}
                            />
                          </div>
                          <span className="font-headline font-bold text-teal-700 text-sm">{schema.fit}%</span>
                        </div>
                        <p className="text-xs text-teal-600 mt-3 italic">{typeof schema.reason === 'string' ? schema.reason : JSON.stringify(schema.reason)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Government Schemes */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <button
              onClick={() => toggleSection('government')}
              className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <Landmark size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-xl text-on-surface">Government Schemes & Grants</h3>
                  <p className="text-sm text-on-surface-variant">Location-relevant funding opportunities</p>
                </div>
              </div>
              {expandedSection === 'government' ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'government' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 space-y-4">
                    {result.governmentSchemes.map((scheme, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-headline font-bold text-blue-900 flex items-center gap-2">
                              <Shield size={18} className="text-blue-500" />
                              {scheme.name}
                            </h4>
                            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                              <Building2 size={12} />
                              {scheme.agency}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full flex-shrink-0">
                            {scheme.fundingAmount}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800/80 mb-3">{typeof scheme.description === 'string' ? scheme.description : JSON.stringify(scheme.description)}</p>
                        <div className="bg-white/60 p-3 rounded-xl mb-3">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Eligibility</p>
                          <p className="text-xs text-blue-700">{typeof scheme.eligibility === 'string' ? scheme.eligibility : JSON.stringify(scheme.eligibility)}</p>
                        </div>
                        {scheme.link && scheme.link !== 'N/A' && (
                          <a
                            href={scheme.link.startsWith('http') ? scheme.link : `https://${scheme.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Learn More & Apply
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
        </>
      )}
    </motion.div>
  );
}
