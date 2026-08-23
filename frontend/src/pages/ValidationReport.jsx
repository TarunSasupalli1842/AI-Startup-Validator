import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Lightbulb, 
  Search, ShieldAlert, BookOpen, Target, DollarSign, Briefcase,
  TrendingUp, Users, Table, Award, Zap, Layers, Sparkles,
  Printer, Copy, Check, Share2, Shield, ArrowUpRight,
  LayoutDashboard, ChevronRight, ChevronLeft, Star, CheckSquare, Square, BarChart3, Globe,
  MessageSquare, Bot, Rocket, X, Clock, HelpCircle, CheckCircle2, IndianRupee
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import StartupAdvisor from '../components/StartupAdvisor';

// Utility helper to format monetary amounts in Indian Rupees (INR / ₹)
const formatInr = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val !== 'string') return String(val);
  if (val.includes('₹')) return val;

  let formatted = val
    .replace(/\$([0-9,.]+)\s*Billion/gi, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''));
      return `₹${Math.round(num * 8300).toLocaleString('en-IN')} Cr`;
    })
    .replace(/\$([0-9,.]+)\s*B\b/gi, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''));
      return `₹${Math.round(num * 8300).toLocaleString('en-IN')} Cr`;
    })
    .replace(/\$([0-9,.]+)\s*Million/gi, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''));
      return `₹${Math.round(num * 8.3).toLocaleString('en-IN')} Cr`;
    })
    .replace(/\$([0-9,.]+)\s*M\b/gi, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''));
      return `₹${Math.round(num * 8.3).toLocaleString('en-IN')} Cr`;
    })
    .replace(/\$([0-9,.]+)/g, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''));
      return `₹${Math.round(num * 83).toLocaleString('en-IN')}`;
    })
    .replace(/\$/g, '₹');

  return formatted;
};

export default function ValidationReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [completedActions, setCompletedActions] = useState({});
  const [completedMvpItems, setCompletedMvpItems] = useState({});
  const [completedGtmSteps, setCompletedGtmSteps] = useState({});
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

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

  const toggleMvpItem = (key) => {
    setCompletedMvpItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleGtmStep = (idx) => {
    setCompletedGtmSteps(prev => ({
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
    summary = {},
    extracted_idea = {},
    market_research = {},
    market_opportunity = {},
    customer_segmentation = {},
    competitor_analysis = {},
    comparison = {},
    swot_analysis = { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    risk_analysis = { risks: [], key_mitigation_priorities: [] },
    mvp_recommendation = { must_have: [], should_have: [], could_have: [], wont_have: [] },
    gtm_strategy = { acquisition_channels: [], launch_strategy: [], pricing_tiers: [], key_kpis: [], how_to_get_started: [] },
    validation_scores = {},
    ai_recommendations = []
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
      id: 'market', 
      label: 'Market & Sizing', 
      shortLabel: 'Market',
      icon: TrendingUp,
      emoji: '📈',
      badge: market_opportunity?.tam ? `TAM: ${formatInr(market_opportunity.tam).split(' ')[0]}` : 'Market Sizing',
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
      id: 'swot_risk', 
      label: 'SWOT & Risk Matrix', 
      shortLabel: 'SWOT & Risk',
      icon: AlertTriangle,
      emoji: '⚠️',
      badge: `${risk_analysis?.overall_risk_level || 'Moderate'} Risk`,
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      description: 'SWOT grid & 6-pillar risk audit' 
    },
    { 
      id: 'mvp', 
      label: 'MoSCoW MVP Roadmap', 
      shortLabel: 'MVP Scope',
      icon: Layers,
      emoji: '📦',
      badge: `${mvp_recommendation?.target_timeline_weeks || '4-6 Weeks'}`,
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      description: 'Must, Should, Could, Won\'t Have' 
    },
    { 
      id: 'gtm', 
      label: 'Go-To-Market Strategy', 
      shortLabel: 'GTM Plan',
      icon: Rocket,
      emoji: '🚀',
      badge: 'Launch Roadmap',
      badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
      description: 'Channels, pricing & getting started' 
    },
    { 
      id: 'advisor', 
      label: 'Conversational Advisor', 
      shortLabel: 'AI Advisor',
      icon: Bot,
      emoji: '💬',
      badge: 'Interactive AI',
      badgeColor: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30',
      description: 'Ask follow-up questions live' 
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

  const getSeverityBadge = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    }
  };

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
              onClick={() => setIsAdvisorModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 transition-all shadow-md shadow-brand-500/20 cursor-pointer hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Advisor</span>
            </button>

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
              score={validation_scores?.overall_score || 0} 
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
                  Validation Intelligence Results
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-slate-900 dark:text-white">
                {extracted_idea?.startup_name}
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
              {summary?.high_level_description}
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-teal-500/10 border border-brand-500/30 flex items-start gap-3 shadow-sm">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Feasibility Verdict
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 leading-snug">
                  {summary?.feasibility_verdict}
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
                  Multi-Agent Validation Results
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  {tabs.length} Strategic Modules
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex flex-col justify-between p-3 rounded-2xl transition-all duration-300 text-left cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-brand-500/30 ring-2 ring-brand-400/60 scale-[1.02]'
                        : 'bg-white/90 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:scale-[1.01]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 animate-pulse" />
                    )}

                    <div>
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-sm p-1.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive 
                            ? 'bg-white/20 text-white shadow-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border transition-all truncate max-w-[70px] ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : tab.badgeColor
                        }`}>
                          {tab.badge}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className={`font-display font-black text-xs tracking-tight truncate ${
                            isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {tab.shortLabel}
                          </span>
                        </div>
                        <p className={`text-[9px] line-clamp-1 leading-snug font-medium ${
                          isActive ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {tab.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 dark:border-slate-800/60">
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-brand-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        0{idx + 1}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {(activeTab === 'overview') && (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Problem Clarity', score: validation_scores?.problem_clarity || 85, color: 'from-violet-500 to-indigo-500' },
                { label: 'Solution Strength', score: validation_scores?.solution_strength || 80, color: 'from-brand-500 to-teal-500' },
                { label: 'Market Potential', score: validation_scores?.market_potential || 82, color: 'from-cyan-500 to-blue-500' },
                { label: 'Defensibility', score: validation_scores?.competition_risk || 75, color: 'from-amber-500 to-orange-500' },
                { label: 'Feasibility', score: validation_scores?.feasibility || 80, color: 'from-emerald-500 to-teal-500' },
                { label: 'Innovation', score: validation_scores?.innovation || 85, color: 'from-pink-500 to-rose-500' },
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
                    {extracted_idea?.core_problem}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Core Solution
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea?.core_solution}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Audience
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea?.target_audience}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Revenue Model
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {extracted_idea?.revenue_model}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 dark:bg-brand-950/30 dark:border-brand-900/50">
                <span className="font-black text-brand-700 dark:text-brand-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Value Proposition Statement
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-extrabold italic mt-1 leading-relaxed">
                  "{extracted_idea?.value_proposition}"
                </p>
              </div>
            </div>

            {/* Quick MoSCoW & GTM Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    Must-Have MVP Features
                  </h3>
                  <button 
                    onClick={() => setActiveTab('mvp')}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All ({mvp_recommendation?.must_have?.length || 0}) <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {(mvp_recommendation?.must_have || []).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                          {item.feature_name}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Complexity: {item.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                  <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-teal-500" />
                    Immediate Launch Action Steps
                  </h3>
                  <button 
                    onClick={() => setActiveTab('gtm')}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Full GTM Plan <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {(gtm_strategy?.how_to_get_started || []).slice(0, 3).map((step, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono font-black text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">
                        {step.startsWith(`${idx + 1}.`) ? step.substring(2).trim() : step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations Roadmap Checklist */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-500" />
                    Interactive AI Execution Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mark action items as complete as you validate your startup.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 px-3.5 py-1.5 rounded-2xl">
                  <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                    {completedCount} / {ai_recommendations?.length || 0} Done ({actionProgress}%)
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

        {/* TAB 2: MARKET & SIZING */}
        {(activeTab === 'market') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Market Sizing & Opportunity (TAM → SAM → SOM)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                    Total Addressable Market (TAM)
                  </span>
                  <div className="text-3xl font-black text-indigo-950 dark:text-indigo-200">
                    {formatInr(market_opportunity?.tam, '₹2,50,000 Cr')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Global macro sector market size.</p>
                </div>

                <div className="bg-gradient-to-br from-brand-50/80 to-indigo-50/40 dark:from-brand-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-brand-600 dark:text-brand-400">
                    Serviceable Addressable Market (SAM)
                  </span>
                  <div className="text-3xl font-black text-brand-950 dark:text-brand-200">
                    {formatInr(market_opportunity?.sam, '₹35,000 Cr')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target customer segment footprint.</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                    Serviceable Obtainable Market (SOM)
                  </span>
                  <div className="text-3xl font-black text-emerald-950 dark:text-emerald-200">
                    {formatInr(market_opportunity?.som, '₹1,500 Cr')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Realistic 3-year obtainable market target.</p>
                </div>
              </div>

              {/* Sizing Pyramid Visualizer */}
              <div className="space-y-3 max-w-3xl mx-auto pt-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="flex items-center justify-between text-xs font-black text-indigo-700 dark:text-indigo-300">
                    <span>TAM: {formatInr(market_opportunity?.tam, '₹2,50,000 Cr')}</span>
                    <span>100% Macro Market</span>
                  </div>
                  <div className="w-full bg-indigo-200/50 dark:bg-indigo-950/60 h-2.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-indigo-500 h-full rounded-full w-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 max-w-[85%] mx-auto">
                  <div className="flex items-center justify-between text-xs font-black text-brand-700 dark:text-brand-300">
                    <span>SAM: {formatInr(market_opportunity?.sam, '₹35,000 Cr')}</span>
                    <span>Addressable Segment</span>
                  </div>
                  <div className="w-full bg-brand-200/50 dark:bg-brand-950/60 h-2.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-brand-500 h-full rounded-full w-[70%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 max-w-[70%] mx-auto">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-300">
                    <span>SOM: {formatInr(market_opportunity?.som, '₹1,500 Cr')}</span>
                    <span>3-Yr Target</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/60 h-2.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-500 h-full rounded-full w-[40%]" />
                  </div>
                </div>
              </div>

              {/* Unit Economics Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400">Estimated CAC</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{formatInr(market_opportunity?.estimated_cac, '₹3,500 - ₹6,500')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400">Estimated LTV</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{formatInr(market_opportunity?.estimated_ltv, '₹35,000 - ₹95,000')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400">CAGR Growth Rate</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{market_opportunity?.market_growth_rate || '14.5% CAGR'}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70">
                <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Demand & Pain Point Analysis</span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium leading-relaxed">
                  {market_research?.demand_analysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Growth Drivers & Tailwinds
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                    {(market_opportunity?.market_drivers || []).map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Market Entry Barriers
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 leading-relaxed font-medium">
                    {(market_opportunity?.entry_barriers || []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Customer Segmentation Section */}
            {customer_segmentation?.primary_segment && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Target Customer Personas & ICPs
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Segment */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/10 via-indigo-500/10 to-teal-500/10 border border-brand-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                        ⭐ Primary Segment
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brand-500/20 text-brand-700 dark:text-brand-300">
                        {formatInr(customer_segmentation.primary_segment.willingness_to_pay)}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {customer_segmentation.primary_segment.persona_name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {customer_segmentation.primary_segment.target_profile}
                    </p>
                    <div className="pt-2 border-t border-brand-500/20 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Key Channels:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {(customer_segmentation.primary_segment.acquisition_channels || []).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Segments */}
                  {(customer_segmentation?.secondary_segments || []).map((sec, sIdx) => (
                    <div key={sIdx} className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Secondary Segment #{sIdx + 1}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {formatInr(sec.willingness_to_pay)}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {sec.persona_name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {sec.target_profile}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPETITORS & MOAT */}
        {(activeTab === 'competitors') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-rose-500" />
                Live Competitor Landscape & Alternatives
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(competitor_analysis?.competitors || []).map((comp, idx) => (
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
                  {competitor_analysis?.unique_moat}
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            {comparison?.comparison_matrix && comparison.comparison_matrix.length > 0 && (
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
                          ⭐ {extracted_idea?.startup_name} (Us)
                        </th>
                        <th className="p-3.5 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                          {comparison?.competitor_names?.[0] || "Competitor A"}
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
            )}
          </div>
        )}

        {/* TAB 4: SWOT & RISK ANALYSIS (MILESTONE 3 AGENTS 1 & 2) */}
        {(activeTab === 'swot_risk') && (
          <div className="space-y-6">
            
            {/* SWOT Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2 pl-1">
                  <Layers className="w-5 h-5 text-brand-500" />
                  SWOT Strategic Intelligence (Agent Reasoning)
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  4 Strategic Quadrants
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/40 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-6 rounded-3xl border space-y-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-xs font-black">S</span>
                      Strengths
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">Internal</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {(swot_analysis?.strengths || []).map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/40 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 rounded-3xl border space-y-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-xs font-black">W</span>
                      Weaknesses
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">Internal</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {(swot_analysis?.weaknesses || []).map((weak, idx) => (
                      <li key={idx}>{weak}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50/40 border-blue-500/30 dark:bg-blue-950/20 dark:border-blue-900/40 p-6 rounded-3xl border space-y-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-xs font-black">O</span>
                      Opportunities
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">External</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {(swot_analysis?.opportunities || []).map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-amber-50/40 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40 p-6 rounded-3xl border space-y-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-xs font-black">T</span>
                      Threats
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">External</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4 font-medium">
                    {(swot_analysis?.threats || []).map((thr, idx) => (
                      <li key={idx}>{thr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 6-Pillar Risk Analysis Module */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    Multi-Pillar Risk Analysis Agent
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated across Market, Competitor, Financial, Technical, Operational, and Customer risks.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Overall Rating:</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${getSeverityBadge(risk_analysis?.overall_risk_level)}`}>
                    {risk_analysis?.overall_risk_level || 'Moderate'} Risk
                  </span>
                </div>
              </div>

              {/* Risk Summary Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                    Vulnerability Audit Summary
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-0.5">
                    {risk_analysis?.risk_summary}
                  </p>
                </div>
              </div>

              {/* Detailed Risk Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Risk Domain</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">Specific Risk Scenario</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Probability</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Impact</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Severity</th>
                      <th className="p-3.5 font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Mitigation Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {(risk_analysis?.risks || []).map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="p-3.5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {r.category}
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium min-w-[200px]">
                          {r.risk}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {r.probability}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {r.impact}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getSeverityBadge(r.severity)}`}>
                            {r.severity}
                          </span>
                        </td>
                        <td className="p-3.5 text-emerald-700 dark:text-emerald-300 font-semibold min-w-[220px]">
                          {r.mitigation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mitigation Priorities */}
              {risk_analysis?.key_mitigation_priorities && risk_analysis.key_mitigation_priorities.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Founder Mitigation Priorities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 font-medium">
                    {risk_analysis.key_mitigation_priorities.map((item, pIdx) => (
                      <li key={pIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: MOSCOW MVP ROADMAP (MILESTONE 3 AGENT 3) */}
        {(activeTab === 'mvp') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Header with Timeline & Strategy */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      MoSCoW Prioritization
                    </span>
                    <span className="text-xs text-slate-400">• Build Scope</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                    Minimum Viable Product (MVP) Blueprint
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-center">
                    <span className="text-[10px] uppercase font-black text-brand-600 dark:text-brand-400 block">Target Timeline</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{mvp_recommendation?.target_timeline_weeks || '4-6 Weeks'}</span>
                  </div>
                </div>
              </div>

              {/* MVP Philosophy & Dev Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400">MVP Core Philosophy</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                    {mvp_recommendation?.mvp_summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-black text-slate-400">Development Approach</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                    {mvp_recommendation?.development_approach}
                  </p>
                </div>
              </div>

              {/* 4 MoSCoW Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* MUST HAVE */}
                <div className="p-5 rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-500/40 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="font-display font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                        MUST HAVE (Essential Core)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      v1.0 Non-Negotiable
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(mvp_recommendation?.must_have || []).map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleMvpItem(`must_${idx}`)}
                        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
                          completedMvpItems[`must_${idx}`]
                            ? 'border-emerald-500/60 bg-emerald-50/30 opacity-75'
                            : 'border-emerald-200 dark:border-emerald-900/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600">
                              {completedMvpItems[`must_${idx}`] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {item.feature_name}
                            </span>
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.complexity} Complexity
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed pl-6">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 pl-6">
                          💡 Rationale: {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHOULD HAVE */}
                <div className="p-5 rounded-3xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-500/30 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-blue-500/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <h4 className="font-display font-extrabold text-sm text-blue-800 dark:text-blue-300">
                        SHOULD HAVE (Fast Follow v1.1)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      High Value
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(mvp_recommendation?.should_have || []).map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleMvpItem(`should_${idx}`)}
                        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
                          completedMvpItems[`should_${idx}`]
                            ? 'border-blue-500/60 bg-blue-50/30 opacity-75'
                            : 'border-blue-200 dark:border-blue-900/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">
                              {completedMvpItems[`should_${idx}`] ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {item.feature_name}
                            </span>
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.complexity} Complexity
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed pl-6">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold mt-1 pl-6">
                          💡 Rationale: {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COULD HAVE */}
                <div className="p-5 rounded-3xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/30 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <h4 className="font-display font-extrabold text-sm text-amber-800 dark:text-amber-300">
                        COULD HAVE (Nice-to-Have Delight)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      If Resources Allow
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(mvp_recommendation?.could_have || []).map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {item.feature_name}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.complexity} Complexity
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                          💡 Rationale: {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WON'T HAVE */}
                <div className="p-5 rounded-3xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-400" />
                      <h4 className="font-display font-extrabold text-sm text-slate-700 dark:text-slate-300">
                        WON'T HAVE (Deferred Scope)
                      </h4>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Out of Scope for MVP
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(mvp_recommendation?.wont_have || []).map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 opacity-80">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-xs text-slate-600 dark:text-slate-400 line-through">
                            {item.feature_name}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Deferred
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          💡 Defer Reason: {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 6: GO-TO-MARKET STRATEGY (MILESTONE 3 AGENT 4) */}
        {(activeTab === 'gtm') && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-teal-500" />
                    Go-To-Market Execution Blueprint
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Positioning, acquisition funnels, phased rollout roadmap, pricing, and key launch KPIs.
                  </p>
                </div>
              </div>

              {/* Positioning Statement Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-indigo-500/10 border border-teal-500/30 space-y-1.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Market Positioning Statement
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white italic leading-relaxed">
                  "{gtm_strategy?.positioning_statement}"
                </p>
              </div>

              {/* Customer Acquisition Channels */}
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-indigo-500" />
                  Primary Customer Acquisition Channels
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(gtm_strategy?.acquisition_channels || []).map((ch, cIdx) => (
                    <div key={cIdx} className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {ch.channel_name}
                        </h5>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {ch.expected_cac}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {ch.description}
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Conversion Tactic:</span>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                          {ch.conversion_strategy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phased Launch Strategy Roadmap */}
              <div className="space-y-4 pt-2">
                <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-brand-500" />
                  Chronological Launch Phases
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(gtm_strategy?.launch_strategy || []).map((phase, pIdx) => (
                    <div key={pIdx} className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                          {phase.timeline}
                        </span>
                        <span className="text-xs font-mono font-black text-slate-400">
                          Phase 0{pIdx + 1}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {phase.phase_name}
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 font-medium leading-relaxed">
                        {(phase.key_activities || []).map((act, aIdx) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase text-slate-400">Milestone Goal:</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                          {phase.goals}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Pricing Tiers */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-500" />
                      Recommended Pricing Structure
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {formatInr(gtm_strategy?.pricing_strategy)}
                  </p>
                  <div className="space-y-2">
                    {(gtm_strategy?.pricing_tiers || []).map((tier, tIdx) => (
                      <div key={tIdx} className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {formatInr(tier)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key KPIs */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-500" />
                      North Star & Success KPIs
                    </h4>
                  </div>
                  <div className="space-y-2.5">
                    {(gtm_strategy?.key_kpis || []).map((kpi, kIdx) => (
                      <div key={kIdx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{kpi}</span>
                        <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Answer: "How Do We Get Started?" */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-950/90 to-slate-950 text-white border border-brand-500/40 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500 text-white font-black text-sm">
                    🚀
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-300">
                      Immediate Execution Guide
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl text-white">
                      "How do we get started right now?"
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {(gtm_strategy?.how_to_get_started || []).map((step, sIdx) => {
                    const isDone = !!completedGtmSteps[sIdx];
                    const cleanStep = step.startsWith(`${sIdx + 1}.`) ? step.substring(2).trim() : step;
                    return (
                      <div
                        key={sIdx}
                        onClick={() => toggleGtmStep(sIdx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isDone 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-slate-300 line-through' 
                            : 'bg-slate-900/90 border-slate-800 hover:border-brand-400'
                        }`}
                      >
                        <span className="text-brand-400 mt-0.5 shrink-0 font-mono font-bold text-xs">
                          {isDone ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : `0${sIdx + 1}.`}
                        </span>
                        <p className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                          {cleanStep}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: CONVERSATIONAL STARTUP ADVISOR (MILESTONE 3 AGENT 5) */}
        {(activeTab === 'advisor') && (
          <div className="space-y-6">
            <StartupAdvisor report={report} isCompact={false} />
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

      {/* Floating Startup Advisor Chat Drawer Modal */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full relative">
            <button
              onClick={() => setIsAdvisorModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center border border-slate-700 hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <StartupAdvisor report={report} isCompact={true} />
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Quick Advisor Button */}
      {!isAdvisorModalOpen && activeTab !== 'advisor' && (
        <button
          onClick={() => setIsAdvisorModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-accentViolet-500 text-white shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-extrabold text-xs cursor-pointer border-2 border-white/20"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="hidden sm:inline">Ask Startup Advisor</span>
        </button>
      )}

    </div>
  );
}
