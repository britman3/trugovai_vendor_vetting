'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  inline?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  className,
  inline = false
}: RadioGroupProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-navy mb-2">
          {label}
        </label>
      )}
      <div className={cn(
        'flex gap-4',
        inline ? 'flex-row flex-wrap' : 'flex-col'
      )}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              'text-slate700 hover:text-navy transition-colors'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                'w-4 h-4 border-2 rounded-full appearance-none cursor-pointer',
                'border-slate700/30 checked:border-teal',
                'checked:bg-teal checked:border-4 checked:border-white',
                'focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2',
                'relative',
                'before:content-[""] before:absolute before:inset-0 before:rounded-full',
                'checked:before:bg-teal'
              )}
              style={{
                backgroundImage: value === option.value
                  ? 'none'
                  : 'none'
              }}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-rejected">{error}</p>
      )}
    </div>
  );
}

export default RadioGroup;
