import { Wallet } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = 'No transactions yet',
  description = 'Start tracking your finances by adding your first transaction.',
  actionLabel = 'Add Transaction',
  actionHref = '/add',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mb-6">
        <Wallet className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted text-center max-w-sm mb-6">
        {description}
      </p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
      >
        {actionLabel}
      </a>
    </div>
  );
}
