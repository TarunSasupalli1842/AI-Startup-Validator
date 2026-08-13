import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Lightbulb, 
  Search, ShieldAlert, BookOpen, Target, DollarSign, Briefcase,
  TrendingUp, Users, Table, Award, Zap, Layers, Sparkles,
  Printer, Copy, Check, Share2, Shield, ArrowUpRight,
  LayoutDashboard, ChevronRight, ChevronLeft, Star, CheckSquare, Square, BarChart3, Globe
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

export default function ValidationReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [completedActions, setCompletedActions] = useState({});

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

  const toggleActionItem = (idx) => {
    setCompletedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!report) {
    return (
      <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto animate-pulse" />
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            No Validation Report Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Please submit your startup concept from the homepage to generate an AI evaluation report.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center px-5 py-3 text-sm font-extrabold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl hover:from-brand-700 hover:to-indigo-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95 cursor-pointer"
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
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  const completedCount = Object.values(completedActions).filter(Boolean).length;
  const actionProgress = ai_recommendations?.length ? Math.round((completedCount / ai_recommendations.length) * 100) : 0;

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-all self-start bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Validate Another Idea
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-brand-500" />}
              <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-indigo-500" />
              <span>Export PDF / Print</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
            >
              <Share2 className="w-4 h-4 text-cyan-500" />
              <span>Share Report</span>
            </button>

            <span className="text-xs font-extrabold px-3.5 py-2.5 rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
              {extracted_idea?.industry || "Startup"}
            </span>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border-slate-200/80 dark:border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge 
              score={validation_scores.overall_score} 
              label="Overall Viability" 
              size={160} 
              strokeWidth={14}
              showLabel={true}
            />
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Validation Intelligence Report
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-slate-900 dark:text-white">
                {extracted_idea.startup_name}
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
              {summary.high_level_description}
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-teal-500/10 border border-brand-500/30 flex items-start gap-3 shadow-sm">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Feasibility Verdict
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 leading-snug">
                  {summary.feasibility_verdict}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Highlighted Validation Result Options Bar */}
        <div className="sticky top-3 z-40 my-6 print:hidden">
          <div className="glass-card rounded-3xl p-3 border-slate-200/90 dark:border-slate-800/90 shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 transition-all">
            
            {/* Header Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/80 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Validation Analysis Options
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  5 Key Modules
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Active Option:</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400 px-3 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center gap-1.5 shadow-sm">
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
                        ? 'bg-gradient-to-br from-brand-600 via-teal-600 to-indigo-600 dark:from-brand-500 dark:via-teal-600 dark:to-indigo-600 text-white shadow-xl shadow-brand-500/30 ring-2 ring-brand-400/60 scale-[1.02]'
                        : 'bg-white/90 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    {/* Top Glow Accent Bar on Active */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 animate-pulse" />
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
                        
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
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
                          <span className={`font-display font-black text-xs tracking-tight ${
                            isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {tab.label}
                          </span>
                        </div>
                        <p className={`text-[10px] line-clamp-1 leading-snug font-medium ${
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
                        <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
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
        <div className="glass-card rounded-3xl p-5 border-l-4 border-brand-500 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm">
              {React.createElement(tabs[currentTabIndex].icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Option {currentTabIndex + 1} of 5
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {tabs[currentTabIndex].description}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
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
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
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
                { label: 'Problem Clarity', score: validation_scores.problem_clarity, color: 'from-violet-500 to-indigo-500' },
                { label: 'Solution Strength', score: validation_scores.solution_strength, color: 'from-brand-500 to-teal-500' },
                { label: 'Market Potential', score: validation_scores.market_potential, color: 'from-cyan-500 to-blue-500' },
                { label: 'Defensibility', score: validation_scores.competition_risk, color: 'from-amber-500 to-orange-500' },
                { label: 'Feasibility', score: validation_scores.feasibility, color: 'from-emerald-500 to-teal-500' },
                { label: 'Innovation', score: validation_scores.innovation, color: 'from-pink-500 to-rose-500' },
              ].map((m, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-2 shadow-sm hover:shadow-md transition-all">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                    {m.label}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {m.score}%
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                    <div className={`bg-gradient-to-r ${m.color} h-full rounded-full`} style={{ width: `${m.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Core Idea Grid */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-500" />
                Startup Concept Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-500" /> Core Problem
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.core_problem}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Core Solution
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.core_solution}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Audience
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.target_audience}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Revenue Model
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea.revenue_model}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 dark:bg-brand-950/30 dark:border-brand-900/50">
                <span className="font-black text-brand-700 dark:text-brand-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Value Proposition Statement
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold italic mt-1 leading-relaxed">
                  "{extracted_idea.value_proposition}"
                </p>
              </div>
            </div>

            {/* Interactive Market Sizing Pyramid Visualizer */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Market Sizing Pyramid (TAM → SAM → SOM)
              </h3>

              <div className="space-y-4 max-w-4xl mx-auto">
                {/* TAM */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-transparent border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Total Addressable Market (TAM)
                    </span>
                    <span className="text-lg font-black text-indigo-950 dark:text-indigo-200">{market_opportunity.tam}</span>
                  </div>
                  <div className="w-full bg-indigo-200/50 dark:bg-indigo-950/60 h-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-full" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Global macro sector size for {extracted_idea.industry}.</p>
                </div>

                {/* SAM */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-teal-500/10 to-transparent border border-brand-500/30 space-y-2 max-w-[90%] mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Serviceable Segment (SAM)
                    </span>
                    <span className="text-lg font-black text-brand-950 dark:text-brand-200">{market_opportunity.sam}</span>
                  </div>
                  <div className="w-full bg-brand-200/50 dark:bg-brand-950/60 h-3 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full w-[75%]" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Addressable target audience footprint.</p>
                </div>

                {/* SOM */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-2 max-w-[80%] mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 3-Year Target (SOM)
                    </span>
                    <span className="text-lg font-black text-emerald-950 dark:text-emerald-200">{market_opportunity.som}</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/60 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[45%]" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Realistic obtainable 3-year market share.</p>
                </div>
              </div>
            </div>

            {/* Competitor Matrix Summary */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Table className="w-5 h-5 text-indigo-500" />
                  Competitor Matrix Summary
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Dimension</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 text-[10px] bg-brand-500/10">
                        ⭐ {extracted_idea.startup_name} (Us)
                      </th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                        {comparison.competitor_names[0] || "Competitor A"}
                      </th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {comparison.comparison_matrix.slice(0, 4).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="p-3.5 font-black text-slate-900 dark:text-white whitespace-nowrap">{row.dimension}</td>
                        <td className="p-3.5 text-brand-700 dark:text-brand-300 font-extrabold bg-brand-500/10">{row.our_startup}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{row.primary_competitor}</td>
                        <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold">{row.our_advantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: IDEA & METRICS */}
        {(activeTab === 'concept') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-500" />
                Validation Scores Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Problem Clarity', score: validation_scores.problem_clarity, desc: 'Clarity and depth of target pain point.' },
                  { label: 'Solution Strength', score: validation_scores.solution_strength, desc: 'Feasibility and value of the proposed fix.' },
                  { label: 'Market Potential', score: validation_scores.market_potential, desc: 'Growth rate and addressable market size.' },
                  { label: 'Defensibility Edge', score: validation_scores.competition_risk, desc: 'Moat against competitive copycats.' },
                  { label: 'Feasibility', score: validation_scores.feasibility, desc: 'Technical & operational ease of build.' },
                  { label: 'Innovation Score', score: validation_scores.innovation, desc: 'Uniqueness and differentiation level.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-500" />
                Structured Concept Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Startup Name</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{extracted_idea.startup_name}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Industry / Sector</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{extracted_idea.industry}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Audience</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{extracted_idea.target_audience}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Revenue Model</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{extracted_idea.revenue_model}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKET & SIZING */}
        {(activeTab === 'market') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Market Sizing & Opportunity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                    Total Addressable Market (TAM)
                  </span>
                  <div className="text-3xl font-black text-indigo-950 dark:text-indigo-200">
                    {market_opportunity.tam}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Global macro industry market size.</p>
                </div>

                <div className="bg-gradient-to-br from-brand-50/80 to-indigo-50/40 dark:from-brand-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-brand-600 dark:text-brand-400">
                    Serviceable Addressable Market (SAM)
                  </span>
                  <div className="text-3xl font-black text-brand-950 dark:text-brand-200">
                    {market_opportunity.sam}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target customer segment footprint.</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                    Serviceable Obtainable Market (SOM)
                  </span>
                  <div className="text-3xl font-black text-emerald-950 dark:text-emerald-200">
                    {market_opportunity.som}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">3-year captured market target.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70">
                <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Demand & Pain Point Analysis</span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium leading-relaxed">
                  {market_research.demand_analysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Growth Drivers & Tailwinds
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                    {market_opportunity.market_drivers.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Market Entry Barriers
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
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
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-rose-500" />
                Live Competitor Intelligence
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitor_analysis.competitors.map((comp, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{comp.name}</h4>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">Market Alternative</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {comp.description}
                    </p>
                    <div className="pt-2 text-xs space-y-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Our Advantage:</span> {comp.competitive_advantage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-accentViolet-500/10 border border-purple-500/30">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-500" /> Uniquely Defensible Moat
                </h4>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5 leading-relaxed font-extrabold">
                  {competitor_analysis.unique_moat}
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-500" />
                Head-To-Head Dimensional Matrix
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Dimension</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 text-[10px] bg-brand-500/10">
                        ⭐ {extracted_idea.startup_name} (Us)
                      </th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                        {comparison.competitor_names[0] || "Competitor A"}
                      </th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {comparison.comparison_matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="p-3.5 font-black text-slate-900 dark:text-white whitespace-nowrap">{row.dimension}</td>
                        <td className="p-3.5 text-brand-700 dark:text-brand-300 font-extrabold bg-brand-500/10">{row.our_startup}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{row.primary_competitor}</td>
                        <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold">{row.our_advantage}</td>
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
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 pl-1">
                <Layers className="w-5 h-5 text-brand-500" />
                SWOT Strategic Grid
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/40 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-6 rounded-3xl border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-xs font-black">S</span>
                      Strengths
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">Internal</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/40 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 rounded-3xl border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-xs font-black">W</span>
                      Weaknesses
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">Internal</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.weaknesses.map((weak, idx) => (
                      <li key={idx}>{weak}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50/40 border-blue-500/30 dark:bg-blue-950/20 dark:border-blue-900/40 p-6 rounded-3xl border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-xs font-black">O</span>
                      Opportunities
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">External</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-amber-50/40 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40 p-6 rounded-3xl border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-xs font-black">T</span>
                      Threats
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">External</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {swot_analysis.threats.map((thr, idx) => (
                      <li key={idx}>{thr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interactive Recommendations Roadmap Checklist */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-500" />
                    Interactive AI Execution Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Click an action item to mark it complete as you execute your validation plan.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 px-3.5 py-1.5 rounded-2xl">
                  <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                    {completedCount} / {ai_recommendations.length} Done ({actionProgress}%)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {ai_recommendations.map((rec, idx) => {
                  const isDone = !!completedActions[idx];
                  const cleanText = rec.startsWith(`${idx + 1}.`) ? rec.substring(2).trim() : rec;

                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleActionItem(idx)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isDone 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-slate-400 line-through dark:bg-emerald-950/20" 
                          : "bg-white/80 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:border-brand-400 hover:shadow-md"
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0 text-brand-500">
                        {isDone ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-slate-400" />}
                      </button>
                      <div className="space-y-1 flex-1">
                        <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${isDone ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                          {cleanText}
                        </p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Task #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Option Navigation Footer */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-200/80 dark:border-slate-800 print:hidden mt-8 shadow-lg">
          <button
            onClick={handlePrevTab}
            disabled={currentTabIndex === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              currentTabIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 border border-transparent'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:scale-[1.02]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous: {currentTabIndex > 0 ? tabs[currentTabIndex - 1].shortLabel : 'Start'}</span>
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
                    window.scrollTo({ top: 220, behavior: 'smooth' });
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
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              currentTabIndex === tabs.length - 1
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 border border-transparent'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:scale-[1.02]'
            }`}
          >
            <span>Next: {currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1].shortLabel : 'End'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
