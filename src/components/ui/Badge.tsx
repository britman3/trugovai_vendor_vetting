'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { VendorVerdict, AssessmentStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'approved' | 'conditional' | 'rejected' | 'pending' | 'compliance' | 'security' | 'operational' | 'trust';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate700/10 text-slate700 border-slate700/20',
    approved: 'bg-approved/10 text-approved border-approved/20',
    conditional: 'bg-conditional/10 text-conditional border-conditional/20',
    rejected: 'bg-rejected/10 text-rejected border-rejected/20',
    pending: 'bg-slate700/10 text-slate700 border-slate700/20',
    compliance: 'bg-compliance/10 text-compliance border-compliance/20',
    security: 'bg-security/10 text-security border-security/20',
    operational: 'bg-operational/10 text-operational border-operational/20',
    trust: 'bg-trust/10 text-trust border-trust/20'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Verdict Badge Component
interface VerdictBadgeProps {
  verdict: VendorVerdict;
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (verdict) {
      case VendorVerdict.Approved:
        return 'approved';
      case VendorVerdict.Conditional:
        return 'conditional';
      case VendorVerdict.Rejected:
        return 'rejected';
      case VendorVerdict.Pending:
      default:
        return 'pending';
    }
  };

  const getIcon = () => {
    switch (verdict) {
      case VendorVerdict.Approved:
        return '✅';
      case VendorVerdict.Conditional:
        return '⚠️';
      case VendorVerdict.Rejected:
        return '❌';
      case VendorVerdict.Pending:
      default:
        return '⏳';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      <span className="mr-1">{getIcon()}</span>
      {verdict}
    </Badge>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: AssessmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case AssessmentStatus.Complete:
        return 'approved';
      case AssessmentStatus.InReview:
      case AssessmentStatus.AwaitingApproval:
        return 'conditional';
      case AssessmentStatus.Expired:
        return 'rejected';
      case AssessmentStatus.Draft:
      case AssessmentStatus.AwaitingVendor:
      default:
        return 'pending';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {status}
    </Badge>
  );
}

export default Badge;
