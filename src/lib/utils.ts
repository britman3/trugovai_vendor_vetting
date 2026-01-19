import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow, addMonths, isBefore, addDays } from 'date-fns';

// ========================
// UUID Generation
// ========================

export function generateUUID(): string {
  return uuidv4();
}

// ========================
// Token Generation
// ========================

export function generateVendorToken(): string {
  return uuidv4();
}

// ========================
// Date Formatting
// ========================

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy HH:mm');
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// ========================
// Expiry Calculations
// ========================

export function calculateExpiryDate(fromDate: Date = new Date(), months: number = 12): Date {
  return addMonths(fromDate, months);
}

export function isExpiringSoon(expiryDate: Date | string | null, daysThreshold: number = 30): boolean {
  if (!expiryDate) return false;
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const thresholdDate = addDays(new Date(), daysThreshold);
  return isBefore(d, thresholdDate);
}

export function isExpired(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return false;
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return isBefore(d, new Date());
}

export function getDaysUntilExpiry(expiryDate: Date | string | null): number | null {
  if (!expiryDate) return null;
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ========================
// Token Expiry
// ========================

export function getTokenExpiryDate(days: number = 7): Date {
  return addDays(new Date(), days);
}

export function isTokenExpired(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return true;
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return isBefore(d, new Date());
}

// ========================
// URL Validation
// ========================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  // Basic sanitization to prevent script injection
  const sanitized = url.trim();
  if (sanitized.toLowerCase().startsWith('javascript:')) {
    return '';
  }
  return sanitized;
}

// ========================
// String Helpers
// ========================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================
// Class Names Helper
// ========================

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ========================
// Percentage Calculation
// ========================

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ========================
// Score Display
// ========================

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}

// ========================
// Vendor Self-Service URL
// ========================

export function getVendorAssessmentUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/vendor-assessment/${token}`;
}
