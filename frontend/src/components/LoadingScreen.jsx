import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Circle, Bot, Globe, BarChart3, Users, Shield, Award, Cpu } from 'lucide-react';

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "01. Extraction Agent",
      desc: "Deconstructing startup statement, structuring core pillars, and defining value proposition.",
      loadingMsg: "⚙️ Isolating core problem-solution vectors...",
      icon: Cpu,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/30"
    },
    {
      title: "02. Market Research Agent",
      desc: "Scanning web search API for macro industry trends, demand analysis, and pain points.",
      loadingMsg: "🌐 Querying live web search intelligence...",
      icon: Globe,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
    },
    {
      title: "03. Market Opportunity Agent",
      desc: "Calculating TAM, SAM, SOM estimations, CAGR growth trajectory, and unit economics.",
      loadingMsg: "📊 Computing addressable market size & CAC/LTV...",
      icon: BarChart3,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      title: "04. Customer Persona Agent",
      desc: "Mapping Ideal Customer Profiles (ICPs), willingness to pay, and acquisition channels.",
      loadingMsg: "🎯 Profiling user personas & conversion triggers...",
      icon: Users,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    {
      title: "05. Competitor Analysis Agent",
      desc: "Cataloging direct and indirect market alternatives and mapping strategic moats.",
      loadingMsg: "⚔️ Cataloging competitive moats & alternatives...",
      icon: Shield,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30"
    },
    {
      title: "06. Comparison Matrix Agent",
      desc: "Generating head-to-head feature matrix and positioning roadmap against alternatives.",
      loadingMsg: "📋 Building dimensional comparison matrix...",
      icon: Award,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
    },
    {
      title: "07. Validation Synthesis Agent",
      desc: "Synthesizing multi-agent data, scoring metrics, SWOT grid, and action plan.",
      loadingMsg: "🧠 Synthesizing final scores & SWOT recommendations...",
      icon: Sparkles,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/30"
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl px-4 text-white overflow-y-auto py-8">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Animated Main Spinner Hub */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin" />
          <div className="absolute w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accentViolet-600 flex items-center justify-center shadow-xl shadow-brand-500/30 animate-pulse-slow">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-[11px] font-bold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
            <span>SWARM PIPELINE EXECUTING ({progressPercent}%)</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">
            Orchestrating 7 Autonomous AI Agents
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Real-time multi-agent execution pipeline. Web search queries, TAM sizing, and competitor matrix generation in progress.
          </p>

          {/* Master Progress Bar */}
          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mt-3 max-w-md mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 via-accentViolet-500 to-accentCyan-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 text-left space-y-3 shadow-2xl max-h-[440px] overflow-y-auto custom-scrollbar">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-800/90 border-brand-500/50 shadow-lg scale-[1.01]" 
                    : isCompleted 
                    ? "bg-slate-900/40 border-slate-800/60 opacity-70" 
                    : "bg-slate-950/20 border-slate-900/40 opacity-30"
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
                      <h4 className={`text-xs font-bold ${isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                        {step.title}
                      </h4>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${step.color}`}>
                        Agent #{idx + 1}
                      </span>
                    </div>

                    {isActive && (
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    )}

                    {isActive && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] text-brand-300 bg-brand-950/90 px-2.5 py-1 rounded-lg border border-brand-800/50 font-mono mt-1">
                        <StepIcon className="w-3 h-3 text-brand-400 animate-pulse" />
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
