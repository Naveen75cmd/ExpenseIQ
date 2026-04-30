'use client';

import { useState, useMemo } from 'react';
import { type Budget, upsertBudget, deleteBudget } from '@/lib/actions/budgets';
import { type Transaction, EXPENSE_CATEGORIES } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BudgetsClientProps {
  initialBudgets: Budget[];
  transactions: Transaction[];
  currentMonth: string;
}

export default function BudgetsClient({ initialBudgets, transactions, currentMonth }: BudgetsClientProps) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  
  // Calculate spending per category
  const spendingByCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category === 'Other' && t.custom_category ? t.custom_category : t.category;
        spending[cat] = (spending[cat] || 0) + t.amount;
      }
    });
    return spending;
  }, [transactions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      const newBudget = await upsertBudget(category, Number(amount), currentMonth);
      setBudgets(prev => {
        const filtered = prev.filter(b => b.category !== category);
        return [...filtered, newBudget].sort((a, b) => b.amount - a.amount);
      });
      toast.success('Budget saved successfully');
      setIsModalOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget deleted');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setCategory(EXPENSE_CATEGORIES[0]);
            setAmount('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No budgets set</h3>
          <p className="text-text-muted mb-6">Create your first budget to start tracking your spending limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const spent = spendingByCategory[budget.category] || 0;
            const progress = Math.min((spent / budget.amount) * 100, 100);
            const isOverBudget = spent > budget.amount;
            
            return (
              <div key={budget.id} className="bg-surface rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
                      {budget.category.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">{budget.category}</h3>
                      <p className="text-xs text-text-muted">
                        {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCategory(budget.category);
                        setAmount(budget.amount.toString());
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                      aria-label="Edit budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger-light"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 w-full bg-border-light rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-danger font-medium mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Over budget by {formatCurrency(spent - budget.amount)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-border">
              <h2 className="text-xl font-bold text-text-primary">Set Budget</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary"
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary"
                  placeholder="e.g. 5000"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-text-primary bg-border-light hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
