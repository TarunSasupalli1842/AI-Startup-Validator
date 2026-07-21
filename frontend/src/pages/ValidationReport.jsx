import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Lightbulb, 
  Search, ShieldAlert, BookOpen, Target, DollarSign, Briefcase,
  TrendingUp, Users, Table, Award, Zap, Layers, Sparkles
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

export default function ValidationReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!report) {
    return (
      <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-6 border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white">
            No Validation Report Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            It looks like you haven't validated a startup idea yet. Please return to the homepage and submit your concept.
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
    { id: 'all', label: 'Full Overview' },
    { id: 'summary', label: 'Startup Summary' },
    { id: 'research', label: 'Market Research' },
    { id: 'opportunity', label: 'Market Opportunity' },
    { id: 'segmentation', label: 'Customer Segmentation' },
    { id: 'competitors', label: 'Competitor Analysis' },
    { id: 'comparison', label: 'Competitor Comparison' },
    { id: 'swot', label: 'SWOT' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Validate another startup idea
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/20">
              {extracted_idea?.industry || "Startup"}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800">
              {extracted_idea?.revenue_model || "SaaS"}
            </span>
          </div>
        </div>

        {/* Dashboard Title Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 border-slate-200/80 dark:border-slate-900/85 shadow-lg">
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge 
              score={validation_scores.overall_score} 
              label="Overall Score" 
              size={160} 
              strokeWidth={12}
              showLabel={false}
            />
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  AI Validation Dashboard
                </span>
              </div>
              <h1 className="font-display font-bold text-3xl tracking-tight text-slate-950 dark:text-white">
                {extracted_idea.startup_name}
              </h1>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {summary.high_level_description}
            </p>

            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100/50 dark:bg-brand-950/20 dark:border-brand-900/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Feasibility Verdict
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold leading-relaxed">
                {summary.feasibility_verdict}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/60 dark:border-slate-800 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* METRICS SCORE GAUGE PANEL */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-500" />
              Validation Scores & Metrics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Problem Clarity</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.problem_clarity}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.problem_clarity}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Solution Strength</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.solution_strength}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.solution_strength}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Market Potential</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.market_potential}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.market_potential}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Defensibility Edge</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.competition_risk}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.competition_risk}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Feasibility</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.feasibility}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.feasibility}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Innovation Score</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.innovation}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.innovation}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. STARTUP SUMMARY */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5.5 h-5.5 text-brand-500" />
                Startup Summary & Extraction
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                Extraction Agent
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-rose-500" /> Core Problem
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.core_problem}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Proposed Solution
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.core_solution}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Audience
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.target_audience}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Revenue Model
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.revenue_model}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100/50 dark:bg-brand-950/20 dark:border-brand-900/30">
              <span className="font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider text-[10px]">
                Core Value Proposition
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-bold italic mt-1 leading-relaxed">
                "{extracted_idea.value_proposition}"
              </p>
            </div>
          </div>
        )}

        {/* 2. MARKET RESEARCH */}
        {(activeTab === 'all' || activeTab === 'research') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5.5 h-5.5 text-brand-500" />
                Market Research
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                Market Research Agent
              </span>
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {market_research.demand_analysis}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Industry Trends
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_research.industry_trends.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Market Opportunities
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_research.opportunities.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Customer Pain Points
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_research.customer_pain_points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {market_research.sources && market_research.sources.length > 0 && (
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cited Web Sources:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {market_research.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30 transition-colors truncate max-w-[220px]"
                    >
                      {src.replace('https://', '').split('/')[0]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MARKET OPPORTUNITY */}
        {(activeTab === 'all' || activeTab === 'opportunity') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5.5 h-5.5 text-emerald-500" />
                Market Opportunity
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                Market Opportunity Agent
              </span>
            </div>

            {/* TAM / SAM / SOM Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                  Total Addressable Market (TAM)
                </span>
                <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-200">
                  {market_opportunity.tam}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total global opportunity for {extracted_idea.industry}.
                </p>
              </div>

              <div className="bg-gradient-to-br from-brand-50/80 to-indigo-50/40 dark:from-brand-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-brand-100 dark:border-brand-900/30 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  Serviceable Addressable Market (SAM)
                </span>
                <div className="text-2xl font-bold text-brand-950 dark:text-brand-200">
                  {market_opportunity.sam}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reachable market size with current technology & scope.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900/40 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Serviceable Obtainable Market (SOM)
                </span>
                <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-200">
                  {market_opportunity.som}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target 3-Year captured market share.
                </p>
              </div>
            </div>

            {/* CAGR & Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Growth CAGR</span>
                <div className="text-lg font-bold text-slate-800 dark:text-white">{market_opportunity.market_growth_rate}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated CAC</span>
                <div className="text-lg font-bold text-slate-800 dark:text-white">{market_opportunity.estimated_cac}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated LTV</span>
                <div className="text-lg font-bold text-slate-800 dark:text-white">{market_opportunity.estimated_ltv}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pricing Power</span>
                <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{market_opportunity.pricing_power}</div>
              </div>
            </div>

            {/* Drivers vs Barriers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Macro Growth Drivers
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_opportunity.market_drivers.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Market Entry Barriers
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_opportunity.entry_barriers.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Unit Economics Breakdown
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                {market_opportunity.unit_economics_summary}
              </p>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER SEGMENTATION */}
        {(activeTab === 'all' || activeTab === 'segmentation') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5.5 h-5.5 text-indigo-500" />
                Customer Segmentation
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                Customer Segmentation Agent
              </span>
            </div>

            {/* Primary Segment Highlight */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-brand-50/50 dark:from-indigo-950/40 dark:to-brand-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Primary Ideal Customer Profile (ICP)
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {customer_segmentation.primary_segment.persona_name}
                  </h4>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white self-start sm:self-auto">
                  Willingness To Pay: {customer_segmentation.primary_segment.willingness_to_pay}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {customer_segmentation.primary_segment.target_profile}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Segment Pain Points</span>
                  <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                    {customer_segmentation.primary_segment.key_pain_points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Acquisition Channels</span>
                  <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                    {customer_segmentation.primary_segment.acquisition_channels.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Buying Triggers</span>
                  <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                    {customer_segmentation.primary_segment.buying_triggers.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Secondary Personas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Secondary Target Segments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer_segmentation.secondary_segments.map((persona, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{persona.persona_name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                        {persona.willingness_to_pay}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {persona.target_profile}
                    </p>
                    <div className="text-xs space-y-1 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Primary Channels</span>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        {persona.acquisition_channels.join(" • ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/40 dark:bg-indigo-950/20 dark:border-indigo-900/30">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Go-To-Market Customer Strategy
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {customer_segmentation.segmentation_strategy}
              </p>
            </div>
          </div>
        )}

        {/* 5. COMPETITOR ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'competitors') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Search className="w-5.5 h-5.5 text-brand-500" />
                Competitor Analysis
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                Competitor Analysis Agent
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {competitor_analysis.competitors.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comp.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">Competitor Profile</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {comp.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Strengths</span>
                      <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                        {comp.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Weaknesses</span>
                      <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                        {comp.weaknesses.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2 text-xs space-y-1">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">Comparison:</span> {comp.comparison}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Our Advantage:</span> {comp.competitive_advantage}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/40 dark:bg-purple-950/20 dark:border-purple-900/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Uniquely Defensible Moat
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                {competitor_analysis.unique_moat}
              </p>
            </div>
          </div>
        )}

        {/* 6. COMPETITOR COMPARISON (MATRIX) */}
        {(activeTab === 'all' || activeTab === 'comparison') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Table className="w-5.5 h-5.5 text-amber-500" />
                Competitor Comparison Matrix
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                Comparison Matrix Agent
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400 text-[10px]">Dimension</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 text-[10px]">
                      ⭐ {extracted_idea.startup_name} (Us)
                    </th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-[10px]">
                      {comparison.competitor_names[0] || "Competitor A"}
                    </th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 text-[10px]">
                      {comparison.competitor_names[1] || "Competitor B"}
                    </th>
                    <th className="p-3 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-[10px]">Our Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/40">
                  {comparison.comparison_matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.dimension}</td>
                      <td className="p-3 text-brand-700 dark:text-brand-300 font-semibold bg-brand-50/30 dark:bg-brand-950/10">{row.our_startup}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{row.primary_competitor}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{row.secondary_competitor}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">{row.our_advantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/40 dark:bg-amber-950/20 dark:border-amber-900/30">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Strategic Positioning Roadmap
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                {comparison.positioning_summary}
              </p>
            </div>
          </div>
        )}

        {/* 7. SWOT */}
        {(activeTab === 'all' || activeTab === 'swot') && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white pl-1 flex items-center gap-2">
              <Layers className="w-5.5 h-5.5 text-brand-500" />
              SWOT Analysis Grid
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Strengths */}
              <div className="swot-card bg-emerald-50/20 border-emerald-500/20 dark:bg-emerald-950/5 dark:border-emerald-950/40 p-5 rounded-2xl border">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-display font-bold mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-xs">S</span>
                  Strengths
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  {swot_analysis.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="swot-card bg-rose-50/20 border-rose-500/20 dark:bg-rose-950/5 dark:border-rose-950/40 p-5 rounded-2xl border">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-display font-bold mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-xs">W</span>
                  Weaknesses
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  {swot_analysis.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="swot-card bg-blue-50/20 border-blue-500/20 dark:bg-blue-950/5 dark:border-blue-950/40 p-5 rounded-2xl border">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-display font-bold mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-xs">O</span>
                  Opportunities
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  {swot_analysis.opportunities.map((opp, idx) => (
                    <li key={idx}>{opp}</li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="swot-card bg-amber-50/20 border-amber-500/20 dark:bg-amber-950/5 dark:border-amber-950/40 p-5 rounded-2xl border">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-display font-bold mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-xs">T</span>
                  Threats
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                  {swot_analysis.threats.map((thr, idx) => (
                    <li key={idx}>{thr}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 8. RECOMMENDATIONS */}
        {(activeTab === 'all' || activeTab === 'recommendations') && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5.5 h-5.5 text-brand-500 animate-pulse-slow" />
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
        )}

      </div>
    </div>
  );
}
