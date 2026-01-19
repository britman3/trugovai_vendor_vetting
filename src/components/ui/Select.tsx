'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder = 'Select an option',
  className,
  id,
  value,
  onChange,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-navy mb-1"
        >
          {label}
          {props.required && <span className="text-rejected ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full px-4 py-2 border rounded-[var(--radius)] text-slate700 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal',
          'disabled:bg-ice disabled:cursor-not-allowed',
          'appearance-none cursor-pointer',
          error ? 'border-rejected' : 'border-slate700/30',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234C5D6B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-rejected">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate700/70">{helperText}</p>
      )}
    </div>
  );
}

export default Select;
