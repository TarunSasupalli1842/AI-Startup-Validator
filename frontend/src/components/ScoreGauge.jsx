import React from 'react';

/**
 * Custom SVG Circular Gauge for rendering score indicators.
 */
export default function ScoreGauge({ score, label, size = 120, strokeWidth = 10, showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Animate the circle filling up
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine threshold styling colors
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-emerald-500 dark:text-emerald-400";
  let badgeColor = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  let ratingText = "High Viability";

  if (score < 60) {
    strokeColor = "stroke-rose-500";
    textColor = "text-rose-500 dark:text-rose-400";
    badgeColor = "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    ratingText = "High Risk";
  } else if (score < 75) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-500 dark:text-amber-400";
    badgeColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    ratingText = "Moderate Viability";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circle Structure */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Trailing Track Circle */}
          <circle
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Animated Value Arc */}
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Center Text Panel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl tracking-tight text-slate-800 dark:text-white">
            {score}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
            out of 100
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-4 text-center">
          {label && (
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {label}
            </h4>
          )}
          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {ratingText}
          </span>
        </div>
      )}
    </div>
  );
}
