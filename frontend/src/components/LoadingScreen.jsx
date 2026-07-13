import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Idea Extraction Agent",
      desc: "Deconstructing startup statement, aligning problem-solution coordinates, and structuring inputs.",
      loadingMsg: "⚙️ Parsing syntax and isolating key pillars..."
    },
    {
      title: "Market Research Agent",
      desc: "Querying Tavily Search API for industry trends, macro-demand, and target segment pain points.",
      loadingMsg: "🌐 Scanning web sources and calculating search index..."
    },
    {
      title: "Competitor Analysis Agent",
      desc: "Identifying direct/indirect competitors and mapping unique defensibility moats.",
      loadingMsg: "⚔️ Cataloging market alternatives and sizing unique advantages..."
    },
    {
      title: "Validation Agent",
      desc: "Synthesizing agent analyses, running SWOT diagnostics, and scoring feasibility ratings.",
      loadingMsg: "🧠 Compiling recommendations and calculating validation metrics..."
    }
  ];

  useEffect(() => {
    // Progress through the agent steps periodically to show progress
    const timer1 = setTimeout(() => setCurrentStep(1), 3500);
    const timer2 = setTimeout(() => setCurrentStep(2), 7500);
    const timer3 = setTimeout(() => setCurrentStep(3), 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md px-4 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Main Spinner */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin" />
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl tracking-tight">
            Orchestrating AI Agents
          </h2>
          <p className="text-sm text-slate-400">
            Please wait while our four specialized agents validate your startup concept.
          </p>
        </div>

        {/* Steps List */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 text-left space-y-4 shadow-xl">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex gap-3 items-start transition-all duration-300 ${
                  isActive ? "opacity-100 scale-[1.02]" : isCompleted ? "opacity-60" : "opacity-35"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${isActive ? "text-brand-400" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                    {step.title}
                  </h4>
                  {isActive && (
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  )}
                  {isActive && (
                    <span className="inline-block text-[10px] text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-800/40 mt-1 font-mono">
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
