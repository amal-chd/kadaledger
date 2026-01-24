'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400">🔍</span>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Date</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Customer</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Type</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Description</th>
                                <th className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">Loading transactions...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">No transactions found.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx, i) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                                            {new Date(tx.date).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs text-slate-400">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-4 text-slate-900 dark:text-white font-medium">
                                            {tx.customer?.name || 'Unknown'}
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{tx.customer?.phoneNumber}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${tx.type === 'CREDIT'
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                    : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">
                                            {tx.description || '-'}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${tx.type === 'CREDIT' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
