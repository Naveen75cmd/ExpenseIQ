export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  custom_category: string | null;
  description: string | null;
  date: string;
  created_at: string;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
export type TransactionUpdate = Partial<TransactionInsert>;

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Education',
  'Fees',
  'Entertainment',
  'Bills',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
}
