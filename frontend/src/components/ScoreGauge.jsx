import React from 'react';

/**
 * Custom SVG Circular Gauge for rendering score indicators with high-end glow gradients.
 */
export default function ScoreGauge({ score, label, size = 170, strokeWidth = 14, showLabel = true, subText = null }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Animate the circle filling up
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Unique ID for SVG gradient
  const gradientId = `gauge-gradient-${Math.floor(Math.random() * 100000)}`;

  // Determine threshold styling colors
  let gradientStops = { start: "#10b981", mid: "#06b6d4", end: "#0d9488" }; // Emerald -> Cyan -> Teal
  let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/10";
  let ratingText = "High Viability";
  let ringGlow = "rgba(16, 185, 129, 0.4)";

  if (score < 60) {
    gradientStops = { start: "#f43f5e", mid: "#e11d48", end: "#be123c" }; // Rose -> Red
    badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 shadow-rose-500/10";
    ratingText = "High Risk Thesis";
    ringGlow = "rgba(244, 63, 94, 0.4)";
  } else if (score < 75) {
    gradientStops = { start: "#f59e0b", mid: "#ea580c", end: "#d97706" }; // Amber -> Orange
    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30 shadow-amber-500/10";
    ratingText = "Moderate Viability";
    ringGlow = "rgba(245, 158, 11, 0.4)";
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Ambient background glow ring */}
        <div 
          className="absolute inset-0 rounded-full blur-xl transition-all duration-700 opacity-40 group-hover:opacity-75"
          style={{ background: ringGlow }}
        />

        {/* SVG Circle Structure */}
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStops.start} />
              <stop offset="50%" stopColor={gradientStops.mid} />
              <stop offset="100%" stopColor={gradientStops.end} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Trailing Track Circle */}
          <circle
            className="text-slate-200/70 dark:text-slate-800/90"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Animated Value Arc */}
          <circle
            className="transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            filter={`url(#glow-${gradientId})`}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Center Text Panel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5 z-20">
          <div className="flex items-baseline">
            <span className="font-display font-black text-4xl tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {score}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-0.5">
              %
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
            Validation
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-4 text-center space-y-1.5 z-10">
          {label && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {label}
            </h4>
          )}
          <div className="inline-block">
            <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1 rounded-full border shadow-sm ${badgeColor}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {ratingText}
            </span>
          </div>
          {subText && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {subText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
