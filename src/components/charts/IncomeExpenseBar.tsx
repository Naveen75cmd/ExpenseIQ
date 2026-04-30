'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlyData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface IncomeExpenseBarProps {
  data: MonthlyData[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface rounded-xl p-3 shadow-lg border border-border">
        <p className="text-sm font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-muted">{item.name}:</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function IncomeExpenseBar({ data }: IncomeExpenseBarProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-text-muted capitalize">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="income"
          fill="#10b981"
          radius={[6, 6, 0, 0]}
          name="Income"
        />
        <Bar
          dataKey="expense"
          fill="#ef4444"
          radius={[6, 6, 0, 0]}
          name="Expense"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
