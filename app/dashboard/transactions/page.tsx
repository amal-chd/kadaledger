'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, ArrowUpRight, ArrowDownLeft,
  Calendar, CreditCard, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  date: string;
  type: 'CREDIT' | 'DEBIT' | 'PAYMENT';
  amount: number;
  description?: string;
  customer?: {
    name: string;
    phoneNumber: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    void fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json() as Transaction[];
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'CREDIT') matchesFilter = tx.type === 'CREDIT';
    if (filterType === 'PAYMENT') matchesFilter = tx.type === 'DEBIT' || tx.type === 'PAYMENT';

    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Time', 'Customer', 'Phone', 'Type', 'Amount (₹)', 'Notes'];
    const rows = filteredTransactions.map(tx => {
      const date = new Date(tx.date);
      return [
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        tx.customer?.name || 'Unknown',
        tx.customer?.phoneNumber || '',
        tx.type === 'DEBIT' ? 'PAYMENT' : tx.type,
        tx.amount.toString(),
        (tx.description || '').replace(/,/g, ';'),
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTransactions.length} transactions`);
  };

  const totalCredit = filteredTransactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const totalPayment = filteredTransactions.filter(t => t.type !== 'CREDIT').reduce((s, t) => s + t.amount, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard size={22} className="text-blue-600" />
            Transactions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {transactions.length} total records
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all shadow-sm font-medium text-sm"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Summary Pills */}
      {!loading && transactions.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <ArrowUpRight size={16} className="text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Credit Given</p>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">₹{totalCredit.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <ArrowDownLeft size={16} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Collected</p>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">₹{totalPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="relative flex-shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">All</option>
            <option value="CREDIT">Credit</option>
            <option value="PAYMENT">Payments</option>
          </select>
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Mobile Card View / Desktop Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div>
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Calendar size={48} className="mb-4 opacity-40" />
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (hidden on md+) */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {filteredTransactions.map((tx, i) => {
                const { date, time } = formatDate(tx.date);
                const isCredit = tx.type === 'CREDIT';
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCredit
                            ? 'bg-amber-100 dark:bg-amber-500/15'
                            : 'bg-emerald-100 dark:bg-emerald-500/15'
                        }`}>
                          {isCredit
                            ? <ArrowUpRight size={18} className="text-amber-600 dark:text-amber-400" />
                            : <ArrowDownLeft size={18} className="text-emerald-600 dark:text-emerald-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {tx.customer?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{date} · {time}</p>
                          {tx.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{tx.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-base ${isCredit ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCredit ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {tx.type === 'DEBIT' ? 'PAYMENT' : tx.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notes</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredTransactions.map((tx, i) => {
                    const { date, time } = formatDate(tx.date);
                    const isCredit = tx.type === 'CREDIT';
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-5 py-4 text-sm">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{date}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{time}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{tx.customer?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{tx.customer?.phoneNumber}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            isCredit
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          }`}>
                            {isCredit ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            {tx.type === 'DEBIT' ? 'PAYMENT' : tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                          <span className="line-clamp-1" title={tx.description}>{tx.description || '—'}</span>
                        </td>
                        <td className={`px-5 py-4 text-right font-bold text-base ${
                          isCredit ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-400">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
