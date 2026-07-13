import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    // Check initial dark mode status from localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 dark:bg-slate-950/80 dark:border-slate-900/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <a href="/" className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              ValiStart
            </a>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/30">
              M1
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              About
            </a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
            <a href="#validator" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Validator
            </a>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Dark Mode Switch */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-900 transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a
              href="#validator"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-900 transition-all duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-900 transition-all duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-900 bg-white/95 backdrop-blur-md dark:bg-slate-955/95 px-4 pt-2 pb-4 space-y-2">
          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-900"
          >
            About
          </a>
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-900"
          >
            Features
          </a>
          <a
            href="#validator"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-900"
          >
            Validator
          </a>
          <a
            href="#validator"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-4 py-2.5 text-base font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
          >
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
}
