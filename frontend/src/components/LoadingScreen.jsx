import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "1. Extraction Agent",
      desc: "Deconstructing startup statement, structuring core pillars, and defining value proposition.",
      loadingMsg: "⚙️ Parsing syntax and isolating key problem-solution vectors..."
    },
    {
      title: "2. Market Research Agent",
      desc: "Scanning web search API for macro industry trends, demand analysis, and pain points.",
      loadingMsg: "🌐 Aggregating search queries and market intelligence..."
    },
    {
      title: "3. Market Opportunity Agent",
      desc: "Calculating TAM, SAM, SOM estimations, CAGR growth trajectory, and unit economics.",
      loadingMsg: "📊 Computing addressable market size and projected margins..."
    },
    {
      title: "4. Customer Segmentation Agent",
      desc: "Mapping Ideal Customer Profiles (ICPs), willingness to pay, and acquisition channels.",
      loadingMsg: "🎯 Profiling user personas and conversion triggers..."
    },
    {
      title: "5. Competitor Analysis Agent",
      desc: "Cataloging direct and indirect market alternatives and mapping strategic moats.",
      loadingMsg: "⚔️ Benchmarking competitive vulnerabilities and defensive edges..."
    },
    {
      title: "6. Comparison Matrix Agent",
      desc: "Generating head-to-head feature matrix and positioning roadmap against alternatives.",
      loadingMsg: "📋 Building dimensional comparison table..."
    },
    {
      title: "7. Validation Synthesis Agent",
      desc: "Synthesizing multi-agent data, scoring metrics, SWOT grid, and action plan.",
      loadingMsg: "🧠 Compiling recommendations and calculating validation metrics..."
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-md px-4 text-white overflow-y-auto py-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Main Spinner */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center animate-pulse-slow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl tracking-tight">
            Orchestrating 7 AI Agents
          </h2>
          <p className="text-xs text-slate-400">
            Please wait while our 7 specialized agents analyze and validate your startup concept.
          </p>
        </div>

        {/* Steps List */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3.5 shadow-2xl max-h-[420px] overflow-y-auto custom-scrollbar">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex gap-3 items-start transition-all duration-300 ${
                  isActive ? "opacity-100 scale-[1.01]" : isCompleted ? "opacity-60" : "opacity-30"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  ) : isActive ? (
                    <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className={`text-xs font-semibold ${isActive ? "text-brand-400 font-bold" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                    {step.title}
                  </h4>
                  {isActive && (
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  )}
                  {isActive && (
                    <span className="inline-block text-[9px] text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-800/40 mt-1 font-mono">
                      {step.loadingMsg}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
