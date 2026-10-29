import React from 'react';
import { RoadStatus, RiskLevel } from '../types';

export const AccessibilityBadge: React.FC<{ status: RoadStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          OPEN
        </span>
      );
    case 'RESTRICTED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-600"></span>
          RESTRICTED
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 ${className}`}>
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-600"></span>
          CLOSED
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300 ${className}`}>
          UNKNOWN
        </span>
      );
  }
};

export const RiskMeter: React.FC<{ score: number; level?: RiskLevel }> = ({ score, level }) => {
  const pct = Math.round(score * 100);
  let color = 'bg-emerald-500';
  let text = 'text-emerald-700';

  if (score >= 0.75) {
    color = 'bg-rose-600';
    text = 'text-rose-700 font-bold';
  } else if (score >= 0.50) {
    color = 'bg-amber-500';
    text = 'text-amber-700 font-semibold';
  } else if (score >= 0.25) {
    color = 'bg-yellow-400';
    text = 'text-yellow-700';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className={`text-xs ${text}`}>{pct}% ({level || (score >= 0.75 ? 'SEVERE' : score >= 0.5 ? 'HIGH' : score >= 0.25 ? 'MEDIUM' : 'LOW')})</span>
    </div>
  );
};

