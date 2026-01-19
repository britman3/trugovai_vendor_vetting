'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-navy mb-1"
        >
          {label}
          {props.required && <span className="text-rejected ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full px-4 py-2 border rounded-[var(--radius)] text-slate700 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal',
          'placeholder:text-slate700/50',
          'disabled:bg-ice disabled:cursor-not-allowed',
          'resize-y min-h-[100px]',
          error ? 'border-rejected' : 'border-slate700/30',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-rejected">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate700/70">{helperText}</p>
      )}
    </div>
  );
}

export default TextArea;
