import { Suspense } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import TransactionItem from '@/components/TransactionItem';
import EmptyState from '@/components/EmptyState';
import {
  StatCardSkeleton,
  TransactionItemSkeleton,
  ChartSkeleton,
} from '@/components/SkeletonLoader';
import {
  getTransactionStats,
  getRecentTransactions,
  getMonthlyTrend,
  getCategoryBreakdown,
  getTransactions,
} from '@/lib/actions/transactions';
import { formatCurrency } from '@/lib/utils';
import ExpenseDonut from '@/components/charts/ExpenseDonut';
import IncomeExpenseBar from '@/components/charts/IncomeExpenseBar';
import InsightsCard from '@/components/InsightsCard';
import { getBudgets } from '@/lib/actions/budgets';

async function DashboardStats() {
  const now = new Date();
  const [stats, { transactions }, budgets] = await Promise.all([
    getTransactionStats(),
    getTransactions({ limit: 100 }),
    getBudgets(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
      .catch(() => []), // Catch error if budgets table not created yet
  ]);

  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const currentMonthTx = transactions.filter(t => new Date(t.date) >= firstDayThisMonth);
  const previousMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= firstDayLastMonth && d < firstDayThisMonth;
  });

  // Calculate spending by category for the current month
  const spendingByCategory: Record<string, number> = {};
  currentMonthTx.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category === 'Other' && t.custom_category ? t.custom_category : t.category;
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + t.amount;
    }
  });

  // Find over-budget categories
  const overBudgets = budgets.filter(b => (spendingByCategory[b.category] || 0) > b.amount);

  return (
    <div className="space-y-6">
      {overBudgets.length > 0 && (
        <div className="bg-danger-light border border-danger/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <div className="p-2 bg-danger/10 text-danger rounded-xl shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-danger text-sm">Budget Alert</h3>
            <p className="text-danger/80 text-xs mt-0.5">
              You have exceeded your monthly budget for: {' '}
              <span className="font-semibold">
                {overBudgets.map(b => b.category).join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          label="Income"
          value={formatCurrency(stats.totalIncome)}
          icon={TrendingUp}
          variant="income"
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(stats.totalExpense)}
          icon={TrendingDown}
          variant="expense"
        />
      </div>
      <InsightsCard currentMonthTransactions={currentMonthTx} previousMonthTransactions={previousMonthTx} />
    </div>
  );
}

async function RecentTransactions() {
  const transactions = await getRecentTransactions(8);

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border-light">
        <h2 className="font-bold text-text-primary">Recent Transactions</h2>
        <Link
          href="/transactions"
          className="text-xs text-primary font-medium hover:underline"
        >
          View All →
        </Link>
      </div>
      <div className="divide-y divide-border-light">
        {transactions.map((t) => (
          <TransactionItem key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  );
}

async function DashboardCharts() {
  const [monthlyData, categoryData] = await Promise.all([
    getMonthlyTrend(6),
    getCategoryBreakdown(),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h3 className="font-bold text-text-primary mb-4">
          Income vs Expenses
        </h3>
        <IncomeExpenseBar data={monthlyData} />
      </div>
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h3 className="font-bold text-text-primary mb-4">
          Expense Breakdown
        </h3>
        <ExpenseDonut data={categoryData} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/add"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </Link>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      {/* Charts */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <DashboardCharts />
      </Suspense>

      {/* Recent Transactions */}
      <Suspense
        fallback={
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="skeleton w-40 h-5 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionItemSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RecentTransactions />
      </Suspense>

      {/* Mobile FAB */}
      <Link
        href="/add"
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all z-40"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
