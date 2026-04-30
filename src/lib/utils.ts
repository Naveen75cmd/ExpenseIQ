import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981',
  Transport: '#3b82f6',
  Shopping: '#f59e0b',
  Health: '#ef4444',
  Education: '#8b5cf6',
  Fees: '#6366f1',
  Entertainment: '#ec4899',
  Bills: '#14b8a6',
  Salary: '#10b981',
  Freelance: '#3b82f6',
  Investment: '#f59e0b',
  Gift: '#ec4899',
  Other: '#6b7280',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍕',
  Transport: '🚗',
  Shopping: '🛍️',
  Health: '💊',
  Education: '📚',
  Fees: '📄',
  Entertainment: '🎬',
  Bills: '💡',
  Salary: '💰',
  Freelance: '💻',
  Investment: '📈',
  Gift: '🎁',
  Other: '📌',
};

export const CHART_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#6b7280',
];
