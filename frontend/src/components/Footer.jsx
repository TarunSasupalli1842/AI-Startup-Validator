import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/60 dark:bg-slate-950 dark:border-slate-900/60 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-900/50 pb-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              ValiStart
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <a href="#about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About</a>
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#validator" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Validator</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">GitHub</a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} ValiStart. Developed for Infosys Springboard Milestone 1 Project.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> and modular AI Agents (Gemini + Tavily).
          </div>
        </div>
      </div>
    </footer>
  );
}
