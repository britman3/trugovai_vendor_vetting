'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'default' | 'compliance' | 'security' | 'operational' | 'trust';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  variant = 'default',
  showLabel = true,
  className
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const variants = {
    default: 'bg-teal',
    compliance: 'bg-compliance',
    security: 'bg-security',
    operational: 'bg-operational',
    trust: 'bg-trust'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-sm text-slate700">{value}/{max}</span>
            <span className="text-sm text-slate700">{Math.round(percentage)}%</span>
          </>
        )}
      </div>
      <div className="w-full h-2 bg-slate700/10 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Score Display Component
interface ScoreDisplayProps {
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  variant?: 'default' | 'compliance' | 'security' | 'operational' | 'trust';
  className?: string;
}

export function ScoreDisplay({
  label,
  icon,
  score,
  maxScore,
  variant = 'default',
  className
}: ScoreDisplayProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const isComplete = score === maxScore;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-navy">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate700">
              {score}/{maxScore}
            </span>
            {isComplete && <span className="text-approved">✓</span>}
            {!isComplete && percentage > 0 && <span className="text-conditional">⚠</span>}
          </div>
        </div>
        <ProgressBar
          value={score}
          max={maxScore}
          variant={variant}
          showLabel={false}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
