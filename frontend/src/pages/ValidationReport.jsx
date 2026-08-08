import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Lightbulb, 
  Search, ShieldAlert, BookOpen, Target, DollarSign, Briefcase,
  TrendingUp, Users, Table, Award, Zap, Layers, Sparkles,
  Printer, Copy, Check, Share2, Shield, ArrowUpRight,
  LayoutDashboard, ChevronRight, ChevronLeft, Star
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

export default function ValidationReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopySummary = () => {
    if (!report) return;
    const textToCopy = `Startup Idea: ${report.extracted_idea?.startup_name || 'Venture'}
Industry: ${report.extracted_idea?.industry}
Overall Score: ${report.validation_scores?.overall_score}%
Verdict: ${report.summary?.feasibility_verdict}
Description: ${report.summary?.high_level_description}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.extracted_idea?.startup_name || 'Startup Validation Report',
        text: `Validation score: ${report?.validation_scores?.overall_score}% for ${report?.extracted_idea?.startup_name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopySummary();
    }
  };

  if (!report) {
    return (
      <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-6 border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white">
            No Validation Report Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please submit your startup concept from the homepage to generate a report.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    summary,
    extracted_idea,
    market_research,
    market_opportunity,
    customer_segmentation,
    competitor_analysis,
    comparison,
    swot_analysis,
    validation_scores,
    ai_recommendations
  } = report;

  const tabs = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      emoji: '🌟',
      badge: `${validation_scores?.overall_score || 0}% Score`,
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      description: 'Executive summary & key metrics' 
    },
    { 
      id: 'concept', 
      label: 'Idea & Metrics', 
      shortLabel: 'Idea',
      icon: Lightbulb,
      emoji: '🚀',
      badge: '6 Metrics',
      badgeColor: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30',
      description: 'Core problem, solution & breakdown' 
    },
    { 
      id: 'market', 
      label: 'Market & Sizing', 
      shortLabel: 'Market',
      icon: TrendingUp,
      emoji: '📈',
      badge: market_opportunity?.tam ? `TAM: ${market_opportunity.tam}` : 'Market Sizing',
      badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      description: 'TAM/SAM/SOM & growth drivers' 
    },
    { 
      id: 'competitors', 
      label: 'Competitor Moat', 
      shortLabel: 'Competitors',
      icon: Shield,
      emoji: '⚔️',
      badge: `${competitor_analysis?.competitors?.length || 0} Competitors`,
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      description: 'Competitive matrix & defensibility' 
    },
    { 
      id: 'strategy', 
      label: 'SWOT & Action Plan', 
      shortLabel: 'SWOT',
      icon: Target,
      emoji: '🎯',
      badge: `${ai_recommendations?.length || 0} AI Actions`,
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      description: 'SWOT grid & strategic recommendations' 
    },
  ];

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);

  const handleNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  // Helper for score badge styling
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40';
    if (score >= 70) return 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900/40';
    return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40';
  };

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors self-start bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Validate Another Idea
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-brand-500" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export PDF / Print</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>Share</span>
            </button>

            <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
              {extracted_idea?.industry || "Startup"}
            </span>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border-slate-200/80 dark:border-slate-800/80 shadow-lg">
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge 
              score={validation_scores.overall_score} 
              label="Overall Viability" 
              size={150} 
              strokeWidth={12}
              showLabel={true}
            />
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Validation Results
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-slate-950 dark:text-white">
                {extracted_idea.startup_name}
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {summary.high_level_description}
            </p>

            <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 dark:bg-brand-950/30 dark:border-brand-900/40 flex items-start gap-3">
              <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Feasibility Verdict
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-0.5 leading-snug">
                  {summary.feasibility_verdict}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Highlighted Validation Result Options Bar */}
        <div className="sticky top-3 z-40 my-6 print:hidden">
          <div className="glass-card rounded-3xl p-3 border-slate-200/90 dark:border-slate-800/90 shadow-xl shadow-slate-950/5 dark:shadow-brand-950/20 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 transition-all">
            
            {/* Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 mb-2 border-b border-slate-200/60 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Validation Analysis Options
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                  5 Key Sections
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Option:</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400 px-3 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center gap-1.5">
                  <span>{tabs[currentTabIndex]?.emoji}</span>
                  <span>{tabs[currentTabIndex]?.label}</span>
                </span>
              </div>
            </div>

            {/* Options Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-300 text-left cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-600 via-teal-600 to-indigo-600 dark:from-brand-500 dark:via-teal-600 dark:to-indigo-600 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400/60 scale-[1.02]'
                        : 'bg-white/80 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    {/* Top Glow Accent Bar on Active */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300" />
                    )}

                    <div>
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`text-base p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive 
                            ? 'bg-white/20 text-white shadow-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </span>
                        
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : tab.badgeColor
                        }`}>
                          {tab.badge}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{tab.emoji}</span>
                          <span className={`font-display font-extrabold text-xs tracking-tight ${
                            isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {tab.label}
                          </span>
                        </div>
                        <p className={`text-[10px] line-clamp-1 leading-snug ${
                          isActive ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {tab.description}
                        </p>
                      </div>
                    </div>

                    {/* Step indicator footer */}
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/10 dark:border-slate-800/60">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-brand-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        Option 0{idx + 1}
                      </span>
                      {isActive ? (
                        <span className="text-[9px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-0 group-hover:opacity-100 text-brand-600 dark:text-brand-400 transition-opacity font-bold">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Section Header Banner */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-brand-500 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {React.createElement(tabs[currentTabIndex].icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Option {currentTabIndex + 1} of 5
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {tabs[currentTabIndex].description}
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>{tabs[currentTabIndex].emoji}</span>
                <span>{tabs[currentTabIndex].label}</span>
              </h2>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === t.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {(activeTab === 'overview') && (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Problem Clarity', score: validation_scores.problem_clarity },
                { label: 'Solution Strength', score: validation_scores.solution_strength },
                { label: 'Market Potential', score: validation_scores.market_potential },
                { label: 'Defensibility', score: validation_scores.competition_risk },
                { label: 'Feasibility', score: validation_scores.feasibility },
                { label: 'Innovation', score: validation_scores.innovation },
              ].map((m, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/60 text-center space-y-1.5 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                    {m.label}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {m.score}%
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${m.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Core Idea Grid */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-brand-500" />
                Startup Concept Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-rose-500" /> Core Problem
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.core_problem}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Core Solution
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.core_solution}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Audience
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.target_audience}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Revenue Model
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.revenue_model}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100/60 dark:bg-brand-950/20 dark:border-brand-900/30">
                <span className="font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider text-[10px]">
                  Value Proposition
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold italic mt-0.5 leading-relaxed">
                  "{extracted_idea.value_proposition}"
                </p>
              </div>
            </div>

            {/* TAM/SAM/SOM + Moat Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/30 dark:to-slate-900/40 p-4.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                  Total Market (TAM)
                </span>
                <div className="text-xl font-bold text-indigo-950 dark:text-indigo-200">
                  {market_opportunity.tam}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Global market potential for {extracted_idea.industry}.
                </p>
              </div>

              <div className="bg-gradient-to-br from-brand-50/80 to-indigo-50/40 dark:from-brand-950/30 dark:to-slate-900/40 p-4.5 rounded-2xl border border-brand-100 dark:border-brand-900/30 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  Serviceable Segment (SAM)
                </span>
                <div className="text-xl font-bold text-brand-950 dark:text-brand-200">
                  {market_opportunity.sam}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Addressable segment for target features.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900/40 p-4.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  3-Year Target (SOM)
                </span>
                <div className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                  {market_opportunity.som}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Realistic 3-year captured market share.
                </p>
              </div>
            </div>

            {/* Competitor Matrix Snapshot */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Table className="w-4.5 h-4.5 text-indigo-500" />
                  Competitor Matrix Summary
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 font-bold uppercase tracking-wider text-slate-500 text-[10px]">Dimension</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 text-[10px] bg-brand-500/10">
                        ⭐ {extracted_idea.startup_name} (Us)
                      </th>
                      <th className="p-3 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                        {comparison.competitor_names[0] || "Competitor A"}
                      </th>
                      <th className="p-3 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                    {comparison.comparison_matrix.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                        <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{row.dimension}</td>
                        <td className="p-3 text-brand-700 dark:text-brand-300 font-bold bg-brand-500/10">{row.our_startup}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{row.primary_competitor}</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{row.our_advantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Action Recommendations */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-brand-500" />
                Key AI Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ai_recommendations.slice(0, 4).map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/50 dark:bg-slate-900/40 dark:border-slate-800/40"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {rec.startsWith(`${idx + 1}.`) ? rec.substring(2).trim() : rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: IDEA & METRICS */}
        {(activeTab === 'concept') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-500" />
                Validation Scores Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Problem Clarity', score: validation_scores.problem_clarity, desc: 'Clarity and depth of the target pain point.' },
                  { label: 'Solution Strength', score: validation_scores.solution_strength, desc: 'Feasibility and value of the proposed fix.' },
                  { label: 'Market Potential', score: validation_scores.market_potential, desc: 'Growth rate and addressable market size.' },
                  { label: 'Defensibility Edge', score: validation_scores.competition_risk, desc: 'Moat against competitive copycats.' },
                  { label: 'Feasibility', score: validation_scores.feasibility, desc: 'Technical & operational ease of build.' },
                  { label: 'Innovation Score', score: validation_scores.innovation, desc: 'Uniqueness and differentiation level.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-500" />
                Structured Concept Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Startup Name</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{extracted_idea.startup_name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Industry / Sector</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{extracted_idea.industry}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Audience</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{extracted_idea.target_audience}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue Model</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{extracted_idea.revenue_model}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKET & SIZING */}
        {(activeTab === 'market') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Market Sizing & Opportunity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                    Total Addressable Market (TAM)
                  </span>
                  <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-200">
                    {market_opportunity.tam}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-50/80 to-indigo-50/40 dark:from-brand-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-brand-100 dark:border-brand-900/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                    Serviceable Addressable Market (SAM)
                  </span>
                  <div className="text-2xl font-bold text-brand-950 dark:text-brand-200">
                    {market_opportunity.sam}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    Serviceable Obtainable Market (SOM)
                  </span>
                  <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-200">
                    {market_opportunity.som}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Demand Analysis</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                  {market_research.demand_analysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Growth Drivers
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                    {market_opportunity.market_drivers.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Market Entry Barriers
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                    {market_opportunity.entry_barriers.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPETITORS & MOAT */}
        {(activeTab === 'competitors') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-rose-500" />
                Competitor Intelligence
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitor_analysis.competitors.map((comp, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{comp.name}</h4>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Alternative</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {comp.description}
                    </p>
                    <div className="pt-2 text-xs space-y-1.5 border-t border-slate-200/50 dark:border-slate-800">
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Our Advantage:</span> {comp.competitive_advantage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-accentViolet-500/10 border border-purple-500/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-500" /> Uniquely Defensible Moat
                </h4>
                <p className="text-xs text-slate-900 dark:text-white mt-1.5 leading-relaxed font-bold">
                  {competitor_analysis.unique_moat}
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-500" />
                Head-To-Head Comparison Matrix
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 font-bold uppercase tracking-wider text-slate-500 text-[10px]">Dimension</th>
                      <th className="p-3.5 font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 text-[10px] bg-brand-500/10">
                        ⭐ {extracted_idea.startup_name} (Us)
                      </th>
                      <th className="p-3.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                        {comparison.competitor_names[0] || "Competitor A"}
                      </th>
                      <th className="p-3.5 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {comparison.comparison_matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">{row.dimension}</td>
                        <td className="p-3.5 text-brand-700 dark:text-brand-300 font-bold bg-brand-500/10">{row.our_startup}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">{row.primary_competitor}</td>
                        <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{row.our_advantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SWOT & ACTION PLAN */}
        {(activeTab === 'strategy') && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 pl-1">
                <Layers className="w-5 h-5 text-brand-500" />
                SWOT Analysis Grid
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/30 border-emerald-500/20 dark:bg-emerald-950/10 dark:border-emerald-950/40 p-5 rounded-2xl border space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-xs font-bold">S</span>
                    Strengths
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/30 border-rose-500/20 dark:bg-rose-950/10 dark:border-rose-950/40 p-5 rounded-2xl border space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-xs font-bold">W</span>
                    Weaknesses
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.weaknesses.map((weak, idx) => (
                      <li key={idx}>{weak}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50/30 border-blue-500/20 dark:bg-blue-950/10 dark:border-blue-950/40 p-5 rounded-2xl border space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-xs font-bold">O</span>
                    Opportunities
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-amber-50/30 border-amber-500/20 dark:bg-amber-950/10 dark:border-amber-950/40 p-5 rounded-2xl border space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-xs font-bold">T</span>
                    Threats
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.threats.map((thr, idx) => (
                      <li key={idx}>{thr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-brand-500" />
                AI Recommendations & Action Plan
              </h3>
              <div className="space-y-3">
                {ai_recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 dark:bg-slate-900/40 dark:border-slate-800/40"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {rec.startsWith(`${idx + 1}.`) ? rec.substring(2).trim() : rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Option Navigation Footer */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-200/80 dark:border-slate-800 print:hidden mt-8">
          <button
            onClick={handlePrevTab}
            disabled={currentTabIndex === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              currentTabIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 border border-transparent'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:scale-[1.02]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous: {currentTabIndex > 0 ? tabs[currentTabIndex - 1].label : 'Start'}</span>
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Option {currentTabIndex + 1} of {tabs.length}
            </span>
            <div className="flex items-center gap-2">
              {tabs.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    window.scrollTo({ top: 250, behavior: 'smooth' });
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'w-8 bg-brand-500 shadow-sm shadow-brand-500/50'
                      : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-brand-400'
                  }`}
                  title={`Option 0${idx + 1}: ${t.label}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNextTab}
            disabled={currentTabIndex === tabs.length - 1}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              currentTabIndex === tabs.length - 1
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 border border-transparent'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:scale-[1.02]'
            }`}
          >
            <span>Next: {currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1].label : 'End'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
