'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, FileText, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createTransaction } from '@/lib/actions/transactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TransactionInsert } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AddTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!category) e.category = 'Select a category';
    if (category === 'Other' && !customCategory.trim()) e.customCategory = 'Enter the category name';
    if (!date) e.date = 'Select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const t: TransactionInsert = { type, amount: Number(amount), category, custom_category: category === 'Other' ? customCategory.trim() : null, description: description.trim() || null, date };
      await createTransaction(t);
      toast.success('Transaction added!');
      router.push('/');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 rounded-xl hover:bg-primary-light text-text-muted hover:text-primary transition-all"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-bold text-text-primary">Add Transaction</h1><p className="text-sm text-text-muted mt-0.5">Log your income or expense</p></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border p-1.5 flex">
          {(['expense', 'income'] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setType(t); setCategory(''); setCustomCategory(''); }}
              className={cn('flex-1 py-3 rounded-xl text-sm font-semibold transition-all capitalize', type === t ? (t === 'income' ? 'bg-primary text-white shadow-md' : 'bg-danger text-white shadow-md') : 'text-text-muted hover:text-text-primary')}>{t}</button>
          ))}
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-3"><DollarSign className="w-4 h-4" />Amount</label>
          <div className="relative"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-text-muted">₹</span>
            <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: '' })); }} placeholder="0" step="0.01" className="w-full pl-8 text-4xl font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-border" /></div>
          {errors.amount && <p className="text-danger text-xs mt-2">{errors.amount}</p>}
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-3"><Tag className="w-4 h-4" />{type === 'expense' ? 'What type of expense?' : 'Income source'}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => { setCategory(cat); setErrors(p => ({ ...p, category: '' })); }}
                className={cn('px-3 py-2.5 rounded-xl text-xs font-medium transition-all border', category === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-text-muted border-border hover:border-primary hover:text-primary')}>{cat}</button>
            ))}
          </div>
          {errors.category && <p className="text-danger text-xs mt-2">{errors.category}</p>}
          {category === 'Other' && (<div className="mt-4"><input type="text" value={customCategory} onChange={(e) => { setCustomCategory(e.target.value); setErrors(p => ({ ...p, customCategory: '' })); }} placeholder="Enter type" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />{errors.customCategory && <p className="text-danger text-xs mt-1.5">{errors.customCategory}</p>}</div>)}
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <div><label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-3"><Calendar className="w-4 h-4" />Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" /></div>
          <div><label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-3"><FileText className="w-4 h-4" />Description (optional)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a note..." rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" /></div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60 shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}
