import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Cpu, Search, TrendingUp, AlertCircle, 
  HelpCircle, Lightbulb, Compass, Award, ArrowRight, Zap, Check, Play, Globe, Layers, BarChart3,
  Users, CheckCircle2, Shield, Flame, Target, DollarSign, ChevronDown, MessageSquare
} from 'lucide-react';
import { validateStartupIdea } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSample, setSelectedSample] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    problem: "",
    solution: "",
    target_audience: "",
    industry: "",
    revenue_model: "",
    additional_notes: ""
  });

  const sampleIdeas = [
    {
      label: "🌱 AgriScan AI",
      tag: "AgTech",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      desc: "Computer vision crop disease diagnostics for small farmers",
      data: {
        name: "AgriScan AI",
        industry: "AgTech / AI Crop Health",
        target_audience: "Small-scale & organic farmers",
        problem: "Small-scale farmers lose up to 30% of crop yield due to delayed crop disease diagnosis and lack of affordable agronomist consultation.",
        solution: "A smartphone app using computer vision to instantly identify crop diseases from leaf photos and provide localized organic treatment plans.",
        revenue_model: "Freemium & B2B Ag-retail subscription",
        additional_notes: "Targeting small agricultural operators needing fast disease diagnosis."
      }
    },
    {
      label: "⚡ ChargePulse",
      tag: "CleanTech",
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      desc: "Smart grid energy balancing platform for commercial EV hubs",
      data: {
        name: "ChargePulse",
        industry: "CleanTech / EV Infrastructure",
        target_audience: "Commercial real estate & EV station hubs",
        problem: "EV charging station operators face high grid peak demand charges and station downtime due to unoptimized energy distribution.",
        solution: "Smart AI energy management platform for EV hubs that balances dynamic grid loads and optimizes battery storage charging during off-peak hours.",
        revenue_model: "SaaS Subscription + Energy Arbitrage Share",
        additional_notes: "Uses OCPP open charging protocols."
      }
    },
    {
      label: "🩺 MedScript AI",
      tag: "HealthTech",
      badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
      desc: "Ambient voice AI clinical documentation for independent doctors",
      data: {
        name: "MedScript AI",
        industry: "Healthcare / Clinical AI",
        target_audience: "Independent clinics & outpatient physicians",
        problem: "Doctors spend 2+ hours daily on manual EHR clinical documentation, leading to physician burnout and administrative overhead.",
        solution: "Ambient voice AI assistant that transcribes patient visits in real-time, auto-populates SOAP notes, and generates HIPAA-compliant summaries.",
        revenue_model: "Monthly SaaS subscription per physician seat",
        additional_notes: "Designed for seamless integration with clinical workflows."
      }
    }
  ];

  const handleSelectSample = (sample, idx) => {
    setFormData(sample.data);
    setSelectedSample(idx);
    setError("");
    const validatorElement = document.getElementById('validator');
    if (validatorElement) {
      validatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation check
    if (!formData.name.trim() || !formData.problem.trim() || 
        !formData.solution.trim() || !formData.target_audience.trim() || 
        !formData.industry.trim()) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const result = await validateStartupIdea(formData);
      // Pass report data to report view page
      navigate('/report', { state: { report: result } });
    } catch (err) {
      console.error(err);
      const backendDetail = err.response?.data?.detail;
      if (backendDetail) {
        setError(backendDetail);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError("Validation request timed out. The multi-agent pipeline is processing deep web intelligence. Please try submitting again.");
      } else {
        setError("Failed to validate startup idea. Make sure the backend server is running on http://localhost:8000.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen transition-colors duration-300">
      {loading && <LoadingScreen />}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-16 lg:pt-24 lg:pb-20">
        {/* Ambient background glow spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-accentCyan-500/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-accentViolet-500/10 border border-brand-500/30 text-xs font-bold text-brand-700 dark:text-brand-300 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse-slow" />
            <span className="tracking-wide uppercase">AI-Powered Startup Validator</span>
          </div>
          
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-5xl mx-auto drop-shadow-sm">
            Validate and Improve Your{" "}
            <span className="bg-gradient-to-r from-brand-500 via-indigo-500 via-accentViolet-500 to-accentCyan-400 bg-clip-text text-transparent">
              Business Idea with AI
            </span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Get real-time market viability, TAM/SAM sizing, live competitor analysis, and actionable SWOT recommendations powered by Gemini 1.5 Flash and live search.
          </p>

          {/* Key Metric Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-extrabold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Layers className="w-4 h-4 text-brand-500" />
              <span>4 Swarm Agents</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>Live Search Indexing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>TAM & Economics</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Scoring</span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#validator"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 rounded-2xl hover:shadow-xl hover:shadow-brand-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Start Validating Concept
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white/80 border border-slate-200/80 rounded-2xl hover:bg-slate-50 dark:bg-slate-900/80 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
            >
              Explore 4 AI Agents
            </a>
          </div>

          {/* QUICK TEST SAMPLE IDEAS BAR */}
          <div className="mt-12 max-w-4xl mx-auto p-5 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              <Play className="w-4 h-4 text-brand-500 fill-brand-500 animate-pulse" />
              <span>Click a Sample Idea to Instantly Auto-Fill:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleIdeas.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample, idx)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    selectedSample === idx
                      ? 'bg-brand-500/15 border-brand-500 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/30 scale-[1.02]'
                      : 'bg-white dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800 hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{sample.label}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${sample.badgeColor}`}>
                        {sample.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                      {sample.desc}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    <span>Auto-Fill Form</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* About Multi-Agent System Section */}
      <section id="about" className="py-16 border-t border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Cooperative Multi-Agent Swarm Intelligence
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white mt-2">
              Specialized AI Agents Working in Orchestration
            </h2>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Instead of relying on a single generic prompt, ValiStart orchestrates specialized AI agents that build rich contextual intelligence across market research, risk audit, MoSCoW MVP, GTM roadmap, and conversational advisory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              { num: "01", name: "Extraction & Market Research", desc: "Isolates value propositions and queries live web search for macro industry growth & customer demand.", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
              { num: "02", name: "Competitor & Moat Analysis", desc: "Catalogues market alternatives, calculates feature matrices, and evaluates defensible competitive moats.", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
              { num: "03", name: "SWOT Analysis Agent", desc: "Performs deep LLM reasoning across internal strengths, vulnerabilities, market tailwinds, and macro threats.", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { num: "04", name: "Multi-Pillar Risk Agent", desc: "Audits 6 risk domains (Market, Competitor, Financial, Tech, Ops, Customer) with probability & mitigations.", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { num: "05", name: "MoSCoW MVP Roadmap", desc: "Categorizes features strictly into Must-Have, Should-Have, Could-Have, and Won't-Have build roadmaps.", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { num: "06", name: "GTM & Conversational Advisor", desc: "Formulates positioning, acquisition funnels, launch steps, and provides an interactive chatbot advisor.", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
            ].map((agent, idx) => (
              <div key={idx} className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border ${agent.color}`}>
                    {agent.num}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Agent {agent.num}
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  {agent.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submission Form Section */}
      <section id="validator" className="py-16 border-t border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
            <div className="bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 p-6 sm:p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>STARTUP VALIDATION ENGINE</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
                Submit Your Startup Idea
              </h2>
              <p className="text-xs sm:text-sm text-brand-100 mt-2 max-w-xl leading-relaxed">
                Enter your startup concept below. Our 4 AI agents will inspect the market, evaluate problem-solution fit, analyze competitors, and generate your report.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="flex gap-3 items-center p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs sm:text-sm font-semibold shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Startup Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Startup Name *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Required</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. AgriScan AI"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm"
                    required
                  />
                </div>

                {/* Industry / Domain */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Industry / Sector *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Required</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g. AgTech / AI Crop Diagnostics"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target Audience *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  placeholder="e.g. Small-scale & organic farmers needing fast disease diagnosis"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm"
                  required
                />
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Problem Statement *
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Describe the pain point your target audience faces." />
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{formData.problem.length} chars</span>
                </label>
                <textarea
                  name="problem"
                  rows="3"
                  value={formData.problem}
                  onChange={handleInputChange}
                  placeholder="Describe the target problem in detail. e.g. Small-scale farmers lose up to 30% of crop yield due to delayed crop disease diagnosis and lack of affordable agronomists."
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm leading-relaxed"
                  required
                />
              </div>

              {/* Proposed Solution */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Proposed Solution *
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="How does your product solve the problem?" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{formData.solution.length} chars</span>
                </label>
                <textarea
                  name="solution"
                  rows="3"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="Describe your proposed solution. e.g. A smartphone app using computer vision to instantly identify crop diseases from leaf photos and provide localized organic treatment plans."
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm leading-relaxed"
                  required
                />
              </div>

              {/* Revenue Model (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Revenue Model (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-generated if empty</span>
                  </label>
                  <input
                    type="text"
                    name="revenue_model"
                    value={formData.revenue_model}
                    onChange={handleInputChange}
                    placeholder="e.g. Freemium + B2B SaaS subscription"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Additional Notes (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Context</span>
                  </label>
                  <input
                    type="text"
                    name="additional_notes"
                    value={formData.additional_notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Focus on offline mobile support"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 rounded-2xl hover:from-brand-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-brand-500/25 active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse-slow" />
                  Validate Startup Idea (Run 4 AI Swarm Agents)
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
