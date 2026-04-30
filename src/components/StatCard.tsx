import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'income' | 'expense';
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const variants = {
    default: {
      card: 'bg-gradient-to-br from-primary to-primary-dark',
      icon: 'bg-white/20 text-white',
      label: 'text-white/70',
      value: 'text-white',
      trend: 'text-white/60',
    },
    income: {
      card: 'bg-surface border border-border',
      icon: 'bg-primary-light text-primary',
      label: 'text-text-muted',
      value: 'text-text-primary',
      trend: 'text-primary',
    },
    expense: {
      card: 'bg-surface border border-border',
      icon: 'bg-danger-light text-danger',
      label: 'text-text-muted',
      value: 'text-text-primary',
      trend: 'text-danger',
    },
  };

  const v = variants[variant];

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        v.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className={cn('text-sm font-medium', v.label)}>{label}</p>
          <p className={cn('text-2xl font-bold tracking-tight', v.value)}>
            {value}
          </p>
          {trend && (
            <p className={cn('text-xs font-medium', v.trend)}>{trend}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', v.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
