import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/60 dark:bg-slate-950 dark:border-slate-900/60 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-900/50 pb-8 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accentViolet-600 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-500 via-indigo-500 via-accentViolet-500 to-accentCyan-500 bg-clip-text text-transparent">
              ValiStart
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <a href="#about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Multi-Agent System</a>
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#validator" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Validate Idea</a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} ValiStart. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> and Autonomous Multi-Agent Swarms.
          </div>
        </div>
      </div>
    </footer>
  );
}
