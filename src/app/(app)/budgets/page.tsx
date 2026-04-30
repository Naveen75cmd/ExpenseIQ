import { Suspense } from 'react';
import BudgetsClient from './BudgetsClient';
import { getBudgets } from '@/lib/actions/budgets';
import { getTransactions } from '@/lib/actions/transactions';

export default async function BudgetsPage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Fetch budgets for current month
  const budgets = await getBudgets(currentMonth);

  // Fetch transactions for the current month to calculate progress
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const { transactions } = await getTransactions({ limit: 1000 });
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= firstDayThisMonth;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Monthly Budgets</h1>
        <p className="text-sm text-text-muted mt-1">
          Set spending limits for different categories to stay on track.
        </p>
      </div>

      <Suspense fallback={<div className="skeleton h-64 w-full" />}>
        <BudgetsClient 
          initialBudgets={budgets} 
          transactions={currentMonthTx} 
          currentMonth={currentMonth} 
        />
      </Suspense>
    </div>
  );
}
