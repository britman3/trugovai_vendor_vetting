'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'approved' | 'conditional' | 'pending';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  className
}: StatsCardProps) {
  const variants = {
    default: 'border-l-teal',
    approved: 'border-l-approved',
    conditional: 'border-l-conditional',
    pending: 'border-l-slate700'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-[var(--radius)] shadow-[var(--shadow)] p-6',
        'border-l-4',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate700 mb-1">{title}</p>
          <p className="text-3xl font-bold text-navy">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-1',
              trend.isPositive ? 'text-approved' : 'text-rejected'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-2xl text-slate700/50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
