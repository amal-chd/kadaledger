'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Phone, Plus, Minus, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import { useDataRefresh } from '@/contexts/data-refresh-context';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerQuickViewModal() {
    const { selectedCustomerId, closeCustomer } = useCustomerView();
    const { triggerRefresh } = useDataRefresh();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'CREDIT' | 'PAYMENT' | null>(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (selectedCustomerId) {
            fetchCustomer(selectedCustomerId);
            setActionType(null); // Reset action on open
            setError(null);
        } else {
            setCustomer(null);
        }
    }, [selectedCustomerId]);

    const fetchCustomer = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to fetch customer');
                setCustomer(null);
            }
        } catch (error) {
            console.error(error);
            setError('Network error');
            toast.error('Failed to load customer');
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionType || !customer) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    amount: parseFloat(amount),
                    type: actionType,
                    description: description || (actionType === 'CREDIT' ? 'Credit Added' : 'Payment Received')
                })
            });

            if (res.ok) {
                toast.success(`${actionType === 'CREDIT' ? 'Credit' : 'Payment'} added successfully!`);
                setAmount('');
                setDescription('');
                setActionType(null);
                fetchCustomer(customer.id); // Refresh customer data

                // Trigger global refresh for all components
                triggerRefresh('transaction');
                triggerRefresh('customer');
                triggerRefresh('dashboard');
            } else {
                toast.error('Failed to add transaction');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (!selectedCustomerId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-white/5">
                    {loading ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 flex items-center gap-2">
                            <span>Error: {error}</span>
                        </div>
                    ) : customer ? (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-primary flex items-center justify-center font-bold text-xl">
                                {customer.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{customer.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                    <Phone size={12} /> {customer.phoneNumber}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-red-500">Error loading customer</div>
                    )}

                    <button
                        onClick={closeCustomer}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : customer ? (
                        <div className="space-y-8">
                            {/* Balance & Actions */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className={`p-6 rounded-2xl ${customer.balance < 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20'} border`}>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Balance</p>
                                    <h3 className={`text-3xl font-bold ${customer.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        ₹{Math.abs(customer.balance).toLocaleString()}
                                    </h3>
                                    <p className="text-xs font-bold mt-1 opacity-70 dark:text-gray-300">
                                        {customer.balance < 0 ? 'You will Give' : customer.balance > 0 ? 'You will Get' : 'Settled'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setActionType(actionType === 'CREDIT' ? null : 'CREDIT')}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold transition-all ${actionType === 'CREDIT' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-[#0f172a] hover:bg-red-50 dark:hover:bg-red-900/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Minus size={18} /> Gave Credit
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActionType(actionType === 'PAYMENT' ? null : 'PAYMENT')}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold transition-all ${actionType === 'PAYMENT' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-[#0f172a] hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Plus size={18} /> Got Payment
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Transaction Form */}
                            {actionType && (
                                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                                        {actionType === 'CREDIT' ? 'Record Credit' : 'Record Payment'}
                                    </h4>
                                    <form onSubmit={handleTransaction} className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                required
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Amount"
                                                className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <input
                                                type="text"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Description (Optional)"
                                                className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            />
                                        </div>
                                        <button
                                            disabled={submitting}
                                            className={`px-6 rounded-xl font-bold text-white shadow-lg ${actionType === 'CREDIT' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : 'Save'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Recent Transactions */}
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider text-opacity-70">Recent Transactions</h4>
                                <div className="space-y-2">
                                    {(customer.transactions?.slice(0, 5) || []).map((tx: any) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'PAYMENT' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                                    {tx.type === 'PAYMENT' ? <Plus size={16} /> : <Minus size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{tx.description || (tx.type === 'PAYMENT' ? 'Payment Received' : 'Credit Given')}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Calendar size={10} /> {new Date(tx.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${tx.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {tx.type === 'PAYMENT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    {(!customer.transactions || customer.transactions.length === 0) && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">No recent transactions.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end">
                    <Link
                        href={`/dashboard/customers/${customer?.id}`}
                        onClick={closeCustomer}
                        className="flex items-center gap-2 text-blue-600 dark:text-primary font-bold hover:underline"
                    >
                        View Full History <ExternalLink size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
