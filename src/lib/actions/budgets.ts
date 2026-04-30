'use server';

import { createClient } from '@/lib/supabase/server';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
  created_at: string;
}

export async function getBudgets(month: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw new Error('Failed to fetch budgets');
  }

  return data as Budget[];
}

export async function upsertBudget(category: string, amount: number, month: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Use upsert to handle both creation and updates.
  // The UNIQUE constraint on (user_id, category, month) enables this.
  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      user_id: user.id,
      category,
      amount,
      month,
    }, {
      onConflict: 'user_id, category, month'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving budget:', error);
    throw new Error('Failed to save budget');
  }

  return data as Budget;
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw new Error('Failed to delete budget');
  }
}
