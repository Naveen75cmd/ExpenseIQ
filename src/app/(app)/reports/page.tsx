'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '@/components/SkeletonLoader';
import ExpenseDonut from '@/components/charts/ExpenseDonut';
import IncomeExpenseBar from '@/components/charts/IncomeExpenseBar';
import BalanceTrend from '@/components/charts/BalanceTrend';
import { getTransactionStats, getMonthlyTrend, getCategoryBreakdown } from '@/lib/actions/transactions';
import type { TransactionStats, MonthlyData, CategoryData } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';

const DATE_PRESETS = [
  { label: 'This Month', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
  { label: 'Last 3 Months', getValue: () => { const n = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 3); return { from: s.toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
  { label: 'This Year', getValue: () => { const n = new Date(); return { from: new Date(n.getFullYear(), 0, 1).toISOString().split('T')[0], to: n.toISOString().split('T')[0] }; } },
  { label: 'All Time', getValue: () => ({ from: undefined, to: undefined }) },
];

export default function ReportsPage() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [balanceTrend, setBalanceTrend] = useState<{ month: string; balance: number }[]>([]);
  const [activePreset, setActivePreset] = useState(3);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m, c] = await Promise.all([
        getTransactionStats(dateFrom, dateTo),
        getMonthlyTrend(6),
        getCategoryBreakdown(dateFrom, dateTo),
      ]);
      setStats(s);
      setMonthly(m);
      setCategories(c);
      // Calculate balance trend from monthly data
      let runningBalance = 0;
      setBalanceTrend(m.map(d => { runningBalance += d.income - d.expense; return { month: d.month, balance: runningBalance }; }));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(); 
  }, [fetchData]);

  const handlePreset = (i: number) => {
    setActivePreset(i);
    const { from, to } = DATE_PRESETS[i].getValue();
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text-primary">Reports</h1><p className="text-sm text-text-muted mt-1">Analyze your financial patterns</p></div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((p, i) => (
          <button key={p.label} onClick={() => handlePreset(i)}
            className={cn('px-4 py-2 rounded-xl text-xs font-medium border transition-all', activePreset === i ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary')}>{p.label}</button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Income" value={formatCurrency(stats.totalIncome)} icon={TrendingUp} variant="income" />
          <StatCard label="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={TrendingDown} variant="expense" />
          <StatCard label="Net Savings" value={formatCurrency(stats.balance)} icon={PiggyBank} variant={stats.balance >= 0 ? 'income' : 'expense'} />
          <StatCard label="Savings Rate" value={`${stats.savingsRate.toFixed(1)}%`} icon={Percent} variant="income" />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ChartSkeleton /><ChartSkeleton /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl border border-border p-5"><h3 className="font-bold text-text-primary mb-4">Monthly Income vs Expenses</h3><IncomeExpenseBar data={monthly} /></div>
            <div className="bg-surface rounded-2xl border border-border p-5"><h3 className="font-bold text-text-primary mb-4">Expense by Category</h3><ExpenseDonut data={categories} /></div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-5"><h3 className="font-bold text-text-primary mb-4">Balance Trend</h3><BalanceTrend data={balanceTrend} /></div>
        </>
      )}
    </div>
  );
}
