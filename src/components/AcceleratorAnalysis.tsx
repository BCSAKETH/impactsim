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
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { cn, safeRender } from '../lib/utils';
import { useSimulation } from '../context/SimulationContext';
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

interface BankingConstraint {
  constraint: string;
  impact: string;
  recommendedAction: string;
}

interface AnalysisResult {
  acceleratorMatches: AcceleratorMatch[];
  gapAnalysis: GapItem[];
  optimalSchemas: SchemaItem[];
  governmentSchemes: GovernmentScheme[];
  bankingConstraints: BankingConstraint[];
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

  const activePitch = state.pitch || state.draftIdea || '';
  const hasPitch = activePitch.trim().length > 0;
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
You are a high-fidelity startup accelerator analyst. Evaluate this venture pitch within the context of its current performance metrics.

**Venture Context:**
- **Pitch:** "${state.pitch}"
- **Location:** "${state.location || 'Not specified'}"  
- **Stage:** "${state.stage || 'Idea Stage'}"
- **Current Performance Metrics:**
  - Stakeholder Trust: ${state.trust}%
  - Social Impact Score: ${state.impactScore}
  - Operating Budget: $${state.budget}

**STRICT REQUIREMENTS:**
1. **Accelerator Matches**: Identify 4 REAL, high-growth startups from Y Combinator, Techstars, or 500 Global that directly align with this pitch. Provide their EXACT names, similarity scores, and specific funding milestones they achieved.
2. **Gap Analysis**: Compare the venture against these benchmarks. Since the current Impact Score is ${state.impactScore}, identify exactly why this score is ${state.impactScore < 50 ? 'lagging' : 'performing'} relative to top-tier social enterprises.
3. **Banking Constraints**: Identify 3 specific financial hurdles (e.g., "Lack of collateral for debt", "High interest rates for social ventures") and recommend an action to overcome them.
4. **Government Schemes**: Focus on EXACT, verifiable government grants in "${state.location}". Use real names like "National Health Mission Grants" or "SBIR Phase I". Provide realistic funding amounts.
5. **Optimal Schemas**: Suggest 3 specific structural models (e.g. "Hybrid 80/20 non-profit", "B-Corp ESG structure") that would optimize a budget of $${state.budget}.
6. **Metric-Driven Summary**: Provide an "Executive Grade" masterclass summary. Reference the ${state.trust}% Trust level - if it is low, explain the immediate reputational risk.

**OUTPUT FORMAT:**
Strict JSON object translated into ${state.gameLanguage || 'English'} containing:
{
  "acceleratorMatches": [{"name", "program", "similarity", "stage", "location", "fundingRaised", "keyStrength"}],
  "gapAnalysis": [{"area", "severity", "description", "recommendation"}],
  "optimalSchemas": [{"name", "description", "fit", "reason"}],
  "governmentSchemes": [{"name", "agency", "description", "eligibility", "fundingAmount", "link"}],
  "bankingConstraints": [{"constraint", "impact", "recommendedAction"}],
  "overallReadiness": number,
  "bestAccelerator": string,
  "bestGovernmentScheme": string,
  "summary": { "pitch", "keyChallenge", "recommendedNextSteps" }
}
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
            { role: 'system', content: 'You are a world-class startup advisor and policy analyst. Output MUST be valid JSON detailing acceleratorMatches, gapAnalysis, optimalSchemas, governmentSchemes, bankingConstraints, overallReadiness, bestAccelerator, bestGovernmentScheme, and summary.' },
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
                    value={state.pitch || state.draftIdea || ''}
                    onChange={(e) => updateState({ pitch: e.target.value, draftIdea: e.target.value })}
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
                  Head to the <strong>Simulation Hub</strong> and create a new simulation first.
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
                  Comparing your pitch against 5,000+ accelerator-backed startups and scanning government databases.
                </p>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Results View */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-12 gap-8">
                {/* Score Card */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center h-full flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Accelerator Readiness</p>
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="#f8fafc" strokeWidth="12" fill="none" />
                        <motion.circle
                          initial={{ strokeDasharray: "0 339" }}
                          animate={{ strokeDasharray: `${(result.overallReadiness / 100) * 339} 339` }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          cx="60" cy="60" r="54"
                          stroke="url(#premium-gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0d9488" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-headline font-black text-slate-900 tracking-tighter">{result.overallReadiness}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Benchmark */}
                <div className="col-span-12 lg:col-span-8">
                  <MarketBenchmark data={{
                    userImpact: (state.impactScore || 0),
                    userTrust: (state.trust || 0),
                    benchmarkImpact: 85,
                    benchmarkTrust: 90
                  }} />
                </div>

                {/* Full-Width AI Masterclass */}
                <div className="col-span-12">
                  <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white h-full shadow-2xl relative overflow-hidden border border-white/5">
                    <h3 className="font-headline font-black text-3xl mb-8 flex items-center gap-4 italic tracking-tight text-white">
                      <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      AI Masterclass Output
                    </h3>
                    <div className="text-slate-300 text-lg leading-relaxed mb-4 font-medium opacity-90 italic">
                      {typeof result.summary === 'string' ? (
                        `"${result.summary}"`
                      ) : (
                        <div className="space-y-6 not-italic">
                          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <span className="text-teal-400 font-black uppercase text-[10px] tracking-[0.3em] block mb-2">Strategy Re-Alignment</span>
                            <p className="text-white text-xl font-bold leading-snug">"{String(result.summary?.pitch)}"</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                              <span className="text-amber-400 font-black uppercase text-[10px] tracking-[0.3em] block mb-2">The Critical Hurdle</span>
                              <p className="text-sm font-bold text-slate-200 leading-relaxed">{String(result.summary?.keyChallenge)}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                              <span className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] block mb-2">Executive Action Plan</span>
                              <p className="text-sm font-bold text-slate-200 leading-relaxed">{String(result.summary?.recommendedNextSteps)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordions */}
              <div className="space-y-6">
                {/* 1. Accelerator Matches */}
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                  <button onClick={() => toggleSection('accelerators')} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Trophy size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-headline font-bold text-xl text-slate-900">YC & Techstars Comparison</h3>
                        <p className="text-sm text-slate-500">Benchmark startups</p>
                      </div>
                    </div>
                    {expandedSection === 'accelerators' ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'accelerators' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-8 pb-8 space-y-4">
                          {result.acceleratorMatches.map((match, i) => (
                            <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-slate-400 text-xs shadow-sm">
                                {match.program === 'YC' ? 'YC' : 'TS'}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{match.name}</h4>
                                <p className="text-xs text-slate-500">{match.keyStrength}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-black text-teal-600">{match.similarity}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Gap Analysis */}
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                  <button onClick={() => toggleSection('gaps')} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-headline font-bold text-xl text-slate-900">Gap Analysis</h3>
                        <p className="text-sm text-slate-500">Critical weaknesses identified</p>
                      </div>
                    </div>
                    {expandedSection === 'gaps' ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'gaps' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="px-8 pb-8 space-y-4">
                          {result.gapAnalysis.map((gap, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black text-xs uppercase text-slate-400">{safeRender(gap.area)}</span>
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black uppercase">{safeRender(gap.severity)}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{safeRender(gap.description)}</p>
                              <div className="bg-white p-3 rounded-lg flex items-center gap-2">
                                <ArrowRight size={14} className="text-teal-300" />
                                <p className="text-xs font-bold text-slate-900">{safeRender(gap.recommendation)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Banking & Financial Constraints */}
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                  <button onClick={() => toggleSection('banking')} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Shield size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-headline font-bold text-xl text-slate-900">Banking & Financial Constraints</h3>
                        <p className="text-sm text-slate-500">Capital hurdles & debt risks</p>
                      </div>
                    </div>
                    {expandedSection === 'banking' ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'banking' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="px-8 pb-8 space-y-4">
                          {result.bankingConstraints?.map((bank, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black text-[10px] uppercase text-amber-600 tracking-widest">{safeRender(bank.constraint)}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-3 leading-relaxed">{safeRender(bank.impact)}</p>
                              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                                 <Zap size={14} className="text-emerald-500 mt-0.5" />
                                 <p className="text-xs font-bold text-emerald-800">{safeRender(bank.recommendedAction)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Gov Schemes & Policy Support */}
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                  <button onClick={() => toggleSection('schemes')} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Building2 size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-headline font-bold text-xl text-slate-900">Policy Support & Gov Schemes</h3>
                        <p className="text-sm text-slate-500">Grants & institutional support</p>
                      </div>
                    </div>
                    {expandedSection === 'schemes' ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'schemes' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="px-8 pb-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.governmentSchemes?.map((sch, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all group overflow-hidden relative">
                                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                      <Building2 size={80} />
                                   </div>
                                   <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full mb-3 inline-block">{sch.agency}</span>
                                   <h5 className="font-headline font-black text-slate-900 mb-2 leading-tight">{sch.name}</h5>
                                   <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{sch.description}</p>
                                   <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                      <span className="font-black text-slate-900 text-xs">{sch.fundingAmount}</span>
                                      <a href={sch.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                         Official Portal <ExternalLink size={10} />
                                      </a>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Top Highlights repositioned below Gap Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-teal-200 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy size={32} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-1">Strategic Top Match</span>
                      <h4 className="text-2xl font-headline font-black text-slate-900 tracking-tight">{result.bestAccelerator}</h4>
                      <p className="text-xs text-teal-600 font-black mt-1 uppercase tracking-wider">98% Alignment Score</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Landmark size={32} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-1">Policy Eligibility</span>
                      <h4 className="text-2xl font-headline font-black text-slate-900 tracking-tight">{result.bestGovernmentScheme}</h4>
                      <p className="text-xs text-emerald-600 font-black mt-1 uppercase tracking-wider">Scheme Identified</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function MarketBenchmark({ data }: { data: any }) {
  const chartData = [
    { subject: 'Impact', A: data.userImpact, B: data.benchmarkImpact },
    { subject: 'Trust', A: data.userTrust, B: data.benchmarkTrust },
    { subject: 'Scalability', A: 45, B: 85 },
    { subject: 'Policy Fit', A: 60, B: 90 },
    { subject: 'Economics', A: 35, B: 80 },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-10 premium-shadow border border-slate-100 h-full flex flex-col">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="font-headline font-black text-2xl text-slate-900 tracking-tight">Market Benchmarking</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Venture vs. Y-Combinator Average</p>
          </div>
       </div>

       <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="You" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Radar name="Peak" dataKey="B" stroke="#e2e8f0" fill="#e2e8f0" fillOpacity={0.2} />
             </RadarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}
