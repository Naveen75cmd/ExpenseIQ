import type { Transaction } from '@/lib/types';
import { formatCurrency, formatDateShort, CATEGORY_ICONS, cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  showActions = false,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const displayCategory =
    transaction.category === 'Other' && transaction.custom_category
      ? transaction.custom_category
      : transaction.category;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-primary-50/50 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center text-lg',
            isIncome ? 'bg-primary-light' : 'bg-danger-light'
          )}
        >
          {CATEGORY_ICONS[transaction.category] || '📌'}
        </div>
        <div>
          <p className="font-semibold text-sm text-text-primary">
            {displayCategory}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {transaction.description || 'No description'} •{' '}
            {formatDateShort(transaction.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p
          className={cn(
            'font-bold text-sm',
            isIncome ? 'text-primary' : 'text-danger'
          )}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
        {showActions && (
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1.5 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors text-xs"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-colors text-xs"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
