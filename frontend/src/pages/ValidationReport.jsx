import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Lightbulb, 
  Search, ShieldAlert, BookOpen, Target, DollarSign, Briefcase, HelpCircle
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

export default function ValidationReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  // Scroll to top when report is loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!report) {
    return (
      <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-6 border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white">
            No Report Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            It looks like you haven't validated a startup idea yet. Please return to the homepage and submit your concept.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all"
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
    competitor_analysis,
    swot_analysis,
    validation_scores,
    ai_recommendations
  } = report;

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Validate another idea
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/20">
              {extracted_idea.industry}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/20 dark:border-slate-800">
              {extracted_idea.revenue_model}
            </span>
          </div>
        </div>

        {/* Dashboard Title Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 border-slate-200/80 dark:border-slate-900/85">
          {/* Circular Score Gauge */}
          <div className="shrink-0">
            <ScoreGauge 
              score={validation_scores.overall_score} 
              label="Overall Validation Score" 
              size={160} 
              strokeWidth={12}
              showLabel={false}
            />
          </div>

          {/* Verdict Summary */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                Validation Conclusion
              </span>
              <h1 className="font-display font-bold text-3xl tracking-tight text-slate-950 dark:text-white">
                {extracted_idea.startup_name} Report
              </h1>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {summary.high_level_description}
            </p>

            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100/50 dark:bg-brand-950/20 dark:border-brand-900/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Feasibility Verdict
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                {summary.feasibility_verdict}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Metric Scores (Left) and Extracted Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Individual Scores breakdowns */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
              Validation Metrics breakdown
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Competition Risk</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{validation_scores.competition_risk}%</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${validation_scores.competition_risk}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Technical Feasibility</span>
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

          {/* Structured extraction side block */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-500" />
              Structured Extraction
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Core Problem
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.core_problem}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Proposed Solution
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.core_solution}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Target Audience
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {extracted_idea.target_audience}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">
                  Core Value Proposition
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-bold italic leading-relaxed">
                  "{extracted_idea.value_proposition}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SWOT Analysis Section */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white pl-1">
            SWOT Diagnosis Grid
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Strengths */}
            <div className="swot-card bg-emerald-50/20 border-emerald-500/20 dark:bg-emerald-950/5 dark:border-emerald-950/40">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-display font-bold mb-4">
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
            <div className="swot-card bg-rose-50/20 border-rose-500/20 dark:bg-rose-950/5 dark:border-rose-950/40">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-display font-bold mb-4">
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
            <div className="swot-card bg-blue-50/20 border-blue-500/20 dark:bg-blue-950/5 dark:border-blue-950/40">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-display font-bold mb-4">
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
            <div className="swot-card bg-amber-50/20 border-amber-500/20 dark:bg-amber-950/5 dark:border-amber-950/40">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-display font-bold mb-4">
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

        {/* 2-Column: Market Research (Left) and Competitor Analysis (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Market Research */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5.5 h-5.5 text-brand-500" />
              Market Research Analysis
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {market_research.demand_analysis}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Industry Trends</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_research.industry_trends.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Pain Points</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 leading-relaxed">
                  {market_research.customer_pain_points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Citations / Sources */}
            {market_research.sources && market_research.sources.length > 0 && (
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sources / Citations:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {market_research.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30 dark:hover:bg-brand-950/50 transition-colors truncate max-w-[200px]"
                    >
                      {src.replace('https://', '').split('/')[0]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competitor analysis */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <Search className="w-5.5 h-5.5 text-brand-500" />
              Competitor Landscape
            </h3>

            <div className="space-y-6">
              {competitor_analysis.competitors.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comp.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Competitor</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {comp.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Strengths</span>
                      <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                        {comp.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Weaknesses</span>
                      <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                        {comp.weaknesses.slice(0, 2).map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2 text-xs space-y-1">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">Comparison:</span> {comp.comparison}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Our Edge:</span> {comp.competitive_advantage}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 dark:bg-indigo-950/15 dark:border-indigo-900/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Startup Strategic Moat
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {competitor_analysis.unique_moat}
              </p>
            </div>
          </div>
        </div>

        {/* AI Actionable Recommendations */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5.5 h-5.5 text-brand-500 animate-pulse-slow" />
            AI Recommended Action Plan
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
    </div>
  );
}
