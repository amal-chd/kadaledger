'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, Download, ArrowUpRight, ArrowDownLeft,
    Calendar, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT/PAYMENT

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
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

    const exportData = () => {
        toast.success('Exporting data...');
        // Placeholder implementation
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-blue-600" />
                        Transactions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage and track all financial activities
                    </p>
                </div>
                <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm font-medium text-sm"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by customer, amount, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                </div>
                <div className="relative min-w-[180px]">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer"
                    >
                        <option value="ALL">All Types</option>
                        <option value="CREDIT">Credit Given</option>
                        <option value="PAYMENT">Payments Received</option>
                    </select>
                    <Filter className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                    <div className="absolute right-3.5 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none"></div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="p-3 md:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date & Time</th>
                                <th className="p-3 md:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                                <th className="p-3 md:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                                <th className="p-3 md:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notes</th>
                                <th className="p-3 md:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                        <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                                        <td className="p-5"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                                        <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                                        <td className="p-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Calendar size={48} className="mb-4 opacity-50" />
                                            <p className="text-lg font-medium">No transactions found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx, i) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-3 md:p-5 text-slate-600 dark:text-slate-300 text-sm">
                                            <div className="font-medium">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-3 md:p-5">
                                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {tx.customer?.name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{tx.customer?.phoneNumber}</div>
                                        </td>
                                        <td className="p-3 md:p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${tx.type === 'CREDIT'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                }`}>
                                                {tx.type === 'CREDIT' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                                {tx.type === 'DEBIT' ? 'PAYMENT' : tx.type}
                                            </span>
                                        </td>
                                        <td className="p-3 md:p-5 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">
                                            <span title={tx.description}>{tx.description || '-'}</span>
                                        </td>
                                        <td className={`p-3 md:p-5 text-right font-bold text-base ${tx.type === 'CREDIT' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock for now) */}
                {filteredTransactions.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-center">
                        <p className="text-xs text-slate-400">Showing all recent transactions</p>
                    </div>
                )}
            </div>
        </div>
    );
}
