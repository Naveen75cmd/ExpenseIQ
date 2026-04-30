'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import TransactionItem from '@/components/TransactionItem';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TransactionItemSkeleton } from '@/components/SkeletonLoader';
import { getTransactions, deleteTransaction, updateTransaction } from '@/lib/actions/transactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import type { Transaction, TransactionFilters } from '@/lib/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({ type: 'all', page: 1, limit: 15, sortBy: 'date', sortOrder: 'desc' });
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ ...filters, search: search || undefined });
      setTransactions(res.transactions);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(); 
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteTransaction(deleteId); toast.success('Deleted!'); setDeleteId(null); fetchData(); } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (tx: Transaction) => { setEditTx(tx); setEditAmount(String(tx.amount)); setEditDesc(tx.description || ''); };

  const handleSaveEdit = async () => {
    if (!editTx) return;
    setSaving(true);
    try { await updateTransaction(editTx.id, { amount: Number(editAmount), description: editDesc || null }); toast.success('Updated!'); setEditTx(null); fetchData(); } catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const handleExportCSV = () => {
    if (!transactions.length) {
      toast.error('No transactions to export');
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Custom Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.custom_category || '',
        t.amount,
        `"${(t.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div><h1 className="text-2xl font-bold text-text-primary">Transactions</h1><p className="text-sm text-text-muted mt-1">{total} total transactions</p></div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-border-light transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }} placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <select value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value as 'all' | 'income' | 'expense', page: 1 }))} className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
            <select value={filters.category || ''} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value || undefined, page: 1 }))} className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="">All Categories</option>{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <span className="text-text-muted text-xs">to</span>
            <input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="w-full sm:w-auto sm:ml-auto flex gap-2 justify-between sm:justify-end mt-2 sm:mt-0">
            {(['date', 'amount'] as const).map(s => (
              <button key={s} onClick={() => setFilters(f => ({ ...f, sortBy: s, sortOrder: f.sortBy === s && f.sortOrder === 'desc' ? 'asc' : 'desc', page: 1 }))}
                className={cn('flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize', filters.sortBy === s ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary')}>{s} {filters.sortBy === s ? (filters.sortOrder === 'asc' ? '↑' : '↓') : ''}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border-light">{Array.from({ length: 8 }).map((_, i) => <TransactionItemSkeleton key={i} />)}</div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" description="Try adjusting your filters or add a new transaction." />
        ) : (
          <div className="divide-y divide-border-light">
            {transactions.map(t => <TransactionItem key={t.id} transaction={t} showActions onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))} disabled={(filters.page || 1) <= 1} className="p-2 rounded-xl border border-border hover:bg-primary-light disabled:opacity-40 transition-all"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-text-muted px-4">Page {filters.page || 1} of {totalPages}</span>
          <button onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))} disabled={(filters.page || 1) >= totalPages} className="p-2 rounded-xl border border-border hover:bg-primary-light disabled:opacity-40 transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmDialog isOpen={!!deleteId} title="Delete Transaction" message="Are you sure? This cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} danger />

      {/* Edit modal */}
      {editTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditTx(null)} />
          <div className="relative bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold text-text-primary">Edit Transaction</h3>
            <div><label className="text-sm text-text-muted mb-1 block">Amount</label><input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" /></div>
            <div><label className="text-sm text-text-muted mb-1 block">Description</label><input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Note..." className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" /></div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditTx(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-border-light transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2">{saving && <Loader2 className="w-3 h-3 animate-spin" />}Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
