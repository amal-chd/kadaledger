'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { safeFormatDate } from '@/lib/safe-date';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setTransactions([]);
                setTotalPages(1);
                return;
            }
            const res = await fetch(`/api/admin/transactions?page=${page}&limit=15`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setTransactions(data.data);
                setTotalPages(data.meta.pages);
            } else {
                console.error('Failed to fetch transactions status:', res.status);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter((t) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            String(t.vendor?.businessName || '').toLowerCase().includes(q) ||
            String(t.customer?.name || '').toLowerCase().includes(q) ||
            String(t.type || '').toLowerCase().includes(q)
        );
    });

    const exportTransactions = () => {
        if (!filteredTransactions.length) return;
        const header = ['Date', 'Vendor', 'Customer', 'Type', 'Amount'];
        const rows = filteredTransactions.map((t) => [
            `"${new Date(t.date).toLocaleString()}"`,
            `"${String(t.vendor?.businessName || '').replaceAll('"', '""')}"`,
            `"${String(t.customer?.name || '').replaceAll('"', '""')}"`,
            `"${String(t.type || '')}"`,
            Number(t.amount || 0),
        ]);
        const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-page-${page}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Transactions</h1>
                    <p className="text-slate-400">View all credit and payment records across the platform.</p>
                </div>
                <button
                    onClick={exportTransactions}
                    className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 transition-colors"
                >
                    Export CSV
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Search by vendor, customer, or type..."
                />
            </div>

            <div className="bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="text-sm hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-400">
                                            {safeFormatDate(t.date, 'MMM d, yyyy h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {t.vendor?.businessName || 'Unknown Vendor'}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            {t.customer?.name || 'Unknown Customer'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border
                                                ${t.type === 'CREDIT'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                }
                                            `}>
                                                {t.type === 'CREDIT' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                {t.type === 'CREDIT' ? 'Credit Given' : 'Payment Received'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'CREDIT' ? 'text-red-400' : 'text-emerald-400'
                                            }`}>
                                            ₹{t.amount?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && transactions.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
