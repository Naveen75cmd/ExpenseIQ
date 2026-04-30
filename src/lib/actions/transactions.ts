'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionFilters,
  TransactionStats,
  MonthlyData,
  CategoryData,
} from '@/lib/types';
import { CATEGORY_COLORS, CHART_COLORS } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await createClient();
  const {
    type = 'all',
    category,
    search,
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 15,
  } = filters;

  let query = supabase.from('transactions').select('*', { count: 'exact' });

  if (type !== 'all') {
    query = query.eq('type', type);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.or(
      `description.ilike.%${search}%,category.ilike.%${search}%,custom_category.ilike.%${search}%`
    );
  }
  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('date', dateTo);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    transactions: (data as Transaction[]) || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getRecentTransactions(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as Transaction[]) || [];
}

export async function createTransaction(transaction: TransactionInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('transactions').insert({
    ...transaction,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/reports');
}

export async function updateTransaction(
  id: string,
  updates: TransactionUpdate
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/reports');
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/reports');
}

export async function getTransactionStats(
  dateFrom?: string,
  dateTo?: string
): Promise<TransactionStats> {
  const supabase = await createClient();

  let query = supabase.from('transactions').select('type, amount');

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const totalIncome = (data || [])
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = (data || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return { totalIncome, totalExpense, balance, savingsRate };
}

export async function getMonthlyTrend(months = 6): Promise<MonthlyData[]> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .gte('date', startDate.toISOString().split('T')[0]);

  if (error) throw new Error(error.message);

  const monthlyMap = new Map<string, { income: number; expense: number }>();

  // Initialize all months — use day 1 to avoid overflow (e.g. Feb 30 → Mar 2)
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setDate(1); // Set day to 1 FIRST to prevent month overflow
    d.setMonth(d.getMonth() - months + 1 + i);
    const key = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    monthlyMap.set(key, { income: 0, expense: 0 });
  }

  (data || []).forEach((t) => {
    const d = new Date(t.date + 'T00:00:00'); // Parse as local time, not UTC
    const key = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    const existing = monthlyMap.get(key);
    if (existing) {
      if (t.type === 'income') existing.income += Number(t.amount);
      else existing.expense += Number(t.amount);
    } else {
      // Transaction from a month not in the map — still include it
      monthlyMap.set(key, {
        income: t.type === 'income' ? Number(t.amount) : 0,
        expense: t.type === 'expense' ? Number(t.amount) : 0,
      });
    }
  });

  return Array.from(monthlyMap.entries()).map(([month, vals]) => ({
    month,
    ...vals,
  }));
}

export async function getCategoryBreakdown(
  dateFrom?: string,
  dateTo?: string
): Promise<CategoryData[]> {
  const supabase = await createClient();

  let query = supabase
    .from('transactions')
    .select('category, custom_category, amount')
    .eq('type', 'expense');

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const categoryMap = new Map<string, number>();

  (data || []).forEach((t) => {
    const cat =
      t.category === 'Other' && t.custom_category
        ? t.custom_category
        : t.category;
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount));
  });

  let colorIndex = 0;
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color:
        CATEGORY_COLORS[category] || CHART_COLORS[colorIndex++ % CHART_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}
