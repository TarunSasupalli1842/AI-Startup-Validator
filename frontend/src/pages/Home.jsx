import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Cpu, Search, TrendingUp, AlertCircle, 
  HelpCircle, Lightbulb, Compass, Award, ArrowRight
} from 'lucide-react';
import { validateStartupIdea } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    problem: "",
    solution: "",
    target_audience: "",
    industry: "",
    revenue_model: "",
    additional_notes: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Simple validation
    if (!formData.name.trim() || !formData.problem.trim() || 
        !formData.solution.trim() || !formData.target_audience.trim() || 
        !formData.industry.trim()) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const result = await validateStartupIdea(formData);
      // Pass the report data to the ValidationReport page via React Router state
      navigate('/report', { state: { report: result } });
    } catch (err) {
      console.error(err);
      setError("Failed to validate startup idea. Make sure the backend server is running on http://localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-gradient-light dark:mesh-gradient-dark min-h-screen transition-colors duration-300">
      {loading && <LoadingScreen />}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/20 text-xs font-semibold mb-6 animate-pulse-slow">
            <Sparkles className="w-4.5 h-4.5" />
            <span>AI Multi-Agent Startup Validator</span>
          </div>
          
          <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
            Validate Your Startup Idea with{" "}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              Multi-Agent AI
            </span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get an instant, live market-validated analysis of your business concept. Our cooperative AI agent swarm queries the web, maps competitors, constructs SWOT tables, and computes feasibility scores.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#validator"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-600 rounded-2xl hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
            >
              Start Validating Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-900/80 transition-all duration-200"
            >
              Learn How It Works
            </a>
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section id="about" className="py-16 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl tracking-tight text-slate-900 dark:text-white">
              Behind the Scenes: Multi-Agent Architecture
            </h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              ValiStart utilizes four distinct, specialized LLM agents cooperating in sequence to validate a single business thesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Agent 1 */}
            <div className="glass-card p-6 rounded-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-200">
                Extraction Agent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Refines raw user input text to isolate clean boundaries: Problem, Solution, Audience, and Value Proposition.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="glass-card p-6 rounded-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-200">
                Market Research Agent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Queries Tavily search parameters to compile real-time macro trends, market growth data, and customer friction points.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="glass-card p-6 rounded-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-200">
                Competitor Agent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Scans search engines to catalog active competitors, strengths/weaknesses, and frames the startup's unique defensive moat.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="glass-card p-6 rounded-2xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                04
              </div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-200">
                Validation Agent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Synthesizes agent files, assigns validation scores, builds SWOT tables, and drafts tactical market suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl tracking-tight text-slate-900 dark:text-white">
              Complete Validation Diagnostics
            </h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Receive a comprehensive startup health report generated inside our structured pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Problem-Solution Fit</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Evaluates how directly the proposed solution matches customer difficulties and highlights potential value leaks.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Live Competitor Search</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Avoid outdated training data. Tavily API retrieves active companies currently competing in the target space.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Market Potential & Sizing</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Identifies macro-economic growth drivers, customer pain points, and emerging opportunities in the domain.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">SWOT Analysis Grid</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Maps out internal Strengths & Weaknesses alongside external Opportunities & Threats for logical synthesis.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Validated Rating Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Calculates specialized ratings for problem clarity, solution viability, market demand, and innovation score.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">AI Recommendations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Formulates actionable tactical steps, beta testing recommendations, and revenue model experiments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form Section */}
      <section id="validator" className="py-16 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 dark:border-slate-900/85">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-8 text-white">
              <h2 className="font-display font-bold text-2xl">Validate Your Startup Idea</h2>
              <p className="text-xs text-brand-100 mt-2">
                Provide as much detail as possible to receive a highly detailed evaluation report.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="flex gap-3 items-center p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Startup Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. AgriScan"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm"
                    required
                  />
                </div>

                {/* Industry / Domain */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Industry / Domain *
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g. AgTech / AI Diagnostics"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Audience *
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  placeholder="e.g. Small-scale organic farmers"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm"
                  required
                />
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  Problem Statement *
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="What core issue does your customer face?" />
                </label>
                <textarea
                  name="problem"
                  rows="3"
                  value={formData.problem}
                  onChange={handleInputChange}
                  placeholder="Describe the specific problem. e.g. Small-scale farmers lose up to 30% of crop yield due to delayed crop disease diagnosis and lack of access to agronomists."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm"
                  required
                />
              </div>

              {/* Proposed Solution */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  Proposed Solution *
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" title="How does your product solve this problem?" />
                </label>
                <textarea
                  name="solution"
                  rows="3"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="Describe your solution. e.g. A smartphone app that uses computer vision to instantly identify crop diseases from photos and offers treatment recommendations."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-4 text-base font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl hover:from-brand-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.99] transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse-slow" />
                  Validate Startup Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
