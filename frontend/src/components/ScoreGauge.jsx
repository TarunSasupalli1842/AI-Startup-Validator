import React from 'react';

/**
 * Custom SVG Circular Gauge for rendering score indicators.
 */
export default function ScoreGauge({ score, label, size = 160, strokeWidth = 12, showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Animate the circle filling up
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Unique ID for SVG gradient
  const gradientId = `gauge-gradient-${Math.floor(Math.random() * 100000)}`;

  // Determine threshold styling colors
  let gradientStops = { start: "#10b981", end: "#0d9488" }; // Emerald -> Teal
  let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
  let ratingText = "High Viability";

  if (score < 60) {
    gradientStops = { start: "#f43f5e", end: "#e11d48" }; // Rose -> Red
    badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30";
    ratingText = "High Risk Thesis";
  } else if (score < 75) {
    gradientStops = { start: "#f59e0b", end: "#ea580c" }; // Amber -> Orange
    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30";
    ratingText = "Moderate Viability";
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circle Structure */}
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStops.start} />
              <stop offset="100%" stopColor={gradientStops.end} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Trailing Track Circle */}
          <circle
            className="text-slate-200/60 dark:text-slate-800/80"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
          <span className="font-display font-extrabold text-4xl tracking-tight text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500">
            / 100 Score
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-3 text-center space-y-1">
          {label && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {label}
            </h4>
          )}
          <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full border ${badgeColor}`}>
            {ratingText}
          </span>
        </div>
      )}
    </div>
  );
}
