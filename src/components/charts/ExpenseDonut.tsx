'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CategoryData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ExpenseDonutProps {
  data: CategoryData[];
}

interface TooltipPayload {
  category: string;
  amount: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TooltipPayload }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface rounded-xl p-3 shadow-lg border border-border">
        <p className="text-sm font-semibold text-text-primary">
          {data.category}
        </p>
        <p className="text-sm text-text-muted">{formatCurrency(data.amount)}</p>
      </div>
    );
  }
  return null;
}

export default function ExpenseDonut({ data }: ExpenseDonutProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No expense data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="amount"
          nameKey="category"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-text-muted">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
