import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Circle, Bot, Globe, BarChart3, Users, Shield, Award, Cpu, Activity, Zap } from 'lucide-react';

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "01. Extraction Agent",
      desc: "Deconstructing startup statement, structuring core pillars, and defining value proposition.",
      loadingMsg: "⚙️ Isolating core problem-solution vectors...",
      icon: Cpu,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/30 shadow-violet-500/10"
    },
    {
      title: "02. Market Research Agent",
      desc: "Scanning live web search API for macro industry trends, demand metrics, and pain points.",
      loadingMsg: "🌐 Querying live web search intelligence index...",
      icon: Globe,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-cyan-500/10"
    },
    {
      title: "03. Market Opportunity Agent",
      desc: "Calculating TAM, SAM, SOM estimations, CAGR growth trajectory, and unit economics.",
      loadingMsg: "📊 Computing addressable market size & CAC/LTV...",
      icon: BarChart3,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10"
    },
    {
      title: "04. Customer Persona Agent",
      desc: "Mapping Ideal Customer Profiles (ICPs), willingness to pay, and acquisition channels.",
      loadingMsg: "🎯 Profiling user personas & conversion triggers...",
      icon: Users,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/10"
    },
    {
      title: "05. Competitor Analysis Agent",
      desc: "Cataloging direct and indirect market alternatives and mapping strategic moats.",
      loadingMsg: "⚔️ Cataloging competitive moats & market alternatives...",
      icon: Shield,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-rose-500/10"
    },
    {
      title: "06. Comparison Matrix Agent",
      desc: "Generating head-to-head feature matrix and positioning roadmap against alternatives.",
      loadingMsg: "📋 Building dimensional comparison matrix...",
      icon: Award,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30 shadow-indigo-500/10"
    },
    {
      title: "07. Validation Synthesis Agent",
      desc: "Synthesizing multi-agent data, scoring metrics, SWOT grid, and strategic recommendations.",
      loadingMsg: "🧠 Synthesizing final scores & SWOT recommendations...",
      icon: Sparkles,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/30 shadow-teal-500/10"
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 2200);
    const timer2 = setTimeout(() => setCurrentStep(2), 4800);
    const timer3 = setTimeout(() => setCurrentStep(3), 7400);
    const timer4 = setTimeout(() => setCurrentStep(4), 10000);
    const timer5 = setTimeout(() => setCurrentStep(5), 12600);
    const timer6 = setTimeout(() => setCurrentStep(6), 15200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, []);

  const progressPercent = Math.min(Math.round(((currentStep + 1) / 7) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl px-4 text-white overflow-y-auto py-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-cyan-500/20 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-xl w-full text-center space-y-6 relative z-10">
        {/* Animated Main Spinner Hub */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800/80 border-t-brand-400 border-r-indigo-400 animate-spin" />
          <div className="absolute w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accentViolet-500 flex items-center justify-center shadow-xl shadow-brand-500/30 animate-pulse-slow">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-brand-500/40 text-[10px] font-black text-brand-300 flex items-center gap-1 shadow-md">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>ACTIVE SWARM</span>
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-brand-500/40 text-xs font-extrabold text-brand-300 shadow-md">
            <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
            <span className="tracking-wide">ORCHESTRATING PIPELINE ({progressPercent}%)</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-white drop-shadow-sm">
            Evaluating Venture Viability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            7 specialized AI agents analyzing real-time web data, market sizing, competitive landscapes, and financial feasibility.
          </p>

          {/* Master Progress Bar */}
          <div className="w-full bg-slate-900/90 border border-slate-800/80 h-3 rounded-full overflow-hidden mt-4 p-0.5 max-w-lg mx-auto shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 via-accentViolet-500 to-accentCyan-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-brand-500/40"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 text-left space-y-3 shadow-2xl max-h-[420px] overflow-y-auto custom-scrollbar backdrop-blur-xl">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-800/90 border-brand-500/60 shadow-lg shadow-brand-500/10 scale-[1.01]" 
                    : isCompleted 
                    ? "bg-slate-900/40 border-slate-800/70 opacity-75" 
                    : "bg-slate-950/20 border-slate-900/50 opacity-35"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-extrabold ${isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                        {step.title}
                      </h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${step.color}`}>
                        Agent #{idx + 1}
                      </span>
                    </div>

                    {isActive && (
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium mt-1">
                        {step.desc}
                      </p>
                    )}

                    {isActive && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] text-brand-300 bg-brand-950/90 px-3 py-1 rounded-xl border border-brand-800/60 font-mono mt-1.5 shadow-sm">
                        <StepIcon className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                        <span>{step.loadingMsg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
