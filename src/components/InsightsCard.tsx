import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

interface InsightsCardProps {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
}

export default function InsightsCard({ currentMonthTransactions, previousMonthTransactions }: InsightsCardProps) {
  // Simple insight generation
  let insightText = "Add more transactions to get personalized insights!";
  let InsightIcon = Lightbulb;
  let iconColor = "text-warning";
  let iconBg = "bg-warning-light";

  if (currentMonthTransactions.length > 0 && previousMonthTransactions.length > 0) {
    const currentTotalExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const previousTotalExpense = previousMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    if (previousTotalExpense > 0) {
      const percentageChange = ((currentTotalExpense - previousTotalExpense) / previousTotalExpense) * 100;
      
      if (percentageChange > 20) {
        insightText = `Your expenses are up by ${Math.round(percentageChange)}% compared to last month. Consider reviewing your budgets.`;
        InsightIcon = AlertTriangle;
        iconColor = "text-danger";
        iconBg = "bg-danger-light";
      } else if (percentageChange < -10) {
        insightText = `Great job! Your expenses are down by ${Math.abs(Math.round(percentageChange))}% compared to last month.`;
        InsightIcon = TrendingDown;
        iconColor = "text-primary";
        iconBg = "bg-primary-light";
      } else {
        insightText = "Your spending is on track and similar to last month.";
        InsightIcon = TrendingUp;
        iconColor = "text-primary";
        iconBg = "bg-primary-light";
      }
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm flex items-start gap-4">
      <div className={cn("p-3 rounded-xl shrink-0", iconBg, iconColor)}>
        <InsightIcon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-1">Smart Insight</h3>
        <p className="text-sm text-text-muted leading-relaxed">
          {insightText}
        </p>
      </div>
    </div>
  );
}
