'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Phone, Plus, Minus, Calendar, Download,
    MessageCircle, Share2, Copy, Check, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getDeviceTimeHeaders, getLocalDateInputValue } from '@/lib/client-time';

interface Transaction {
    id: string;
    type: 'CREDIT' | 'PAYMENT';
    amount: number;
    description?: string;
    date: string;
}

interface Customer {
    id: string;
    name: string;
    phoneNumber: string;
    balance: number;
    transactions: Transaction[];
}

export default function CustomerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'CREDIT' | 'PAYMENT' }>({ isOpen: false, type: 'CREDIT' });
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const customerId = params.id as string;

    const fetchCustomer = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json() as Customer;
                setCustomer({ ...data, id: customerId });
            } else {
                router.push('/dashboard/customers');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [customerId, router]);

    const fetchVendorId = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/vendor/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json() as { id?: string };
                setVendorId(data.id ?? null);
            }
        } catch {
            // silently fail — share link just won't show
        }
    }, []);

    useEffect(() => {
        void fetchCustomer();
        void fetchVendorId();
    }, [fetchCustomer, fetchVendorId]);

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
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
                    type: modal.type,
                    description: description || (modal.type === 'CREDIT' ? 'Credit Added' : 'Payment Received')
                })
            });

            if (res.ok) {
                toast.success('Transaction added!');
                setModal({ ...modal, isOpen: false });
                setAmount('');
                setDescription('');
                void fetchCustomer();
            } else {
                toast.error('Failed to add transaction');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const shareLink = vendorId && customerId
        ? `${window.location.origin}/c/${btoa(`${vendorId}:${customerId}`)}`
        : null;

    const copyShareLink = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            toast.success('Share link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy link');
        }
    };

    const downloadCustomerPDF = async () => {
        if (!customer) return;
        const toastId = toast.loading('Generating report...');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/transactions/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...getDeviceTimeHeaders()
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    startDate: '2000-01-01',
                    endDate: getLocalDateInputValue()
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({})) as { error?: string };
                throw new Error(errData.error || 'Failed to fetch report data');
            }

            const reportData = await res.json() as { transactions: Transaction[] };
            const allTransactions = reportData.transactions || [];

            const jsPDF = (await import('jspdf')).default;
            await import('jspdf-autotable');

            const doc: any = new jsPDF();

            doc.setFontSize(20);
            doc.text('Customer Transaction Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Customer: ${customer.name}`, 14, 30);
            doc.text(`Phone: ${customer.phoneNumber}`, 14, 36);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);
            doc.setFontSize(12);
            doc.text(`Current Balance: ₹${Math.abs(customer.balance).toLocaleString()}`, 14, 50);
            doc.text(`Status: ${customer.balance < 0 ? 'You will Give' : customer.balance > 0 ? 'You will Get' : 'Settled'}`, 14, 56);

            const headers = [['Date', 'Description', 'Type', 'Amount']];
            const rows = allTransactions.map((tx) => [
                new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                tx.description || (tx.type === 'PAYMENT' ? 'Payment Received' : 'Credit Given'),
                tx.type,
                `₹${tx.amount.toLocaleString()}`
            ]);

            if (typeof doc.autoTable !== 'function') throw new Error('PDF plugin not loaded. Please try again.');

            doc.autoTable({
                startY: 65,
                head: headers,
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235] },
                alternateRowStyles: { fillColor: [240, 250, 255] },
                styles: { fontSize: 9 }
            });

            doc.save(`${customer.name}_Report_${getLocalDateInputValue()}.pdf`);
            toast.success('Report downloaded!', { id: toastId });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Failed: ${msg}`, { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!customer) return null;

    const absBalance = Math.abs(customer.balance);
    const isOwed = customer.balance > 0; // vendor is owed money (customer has debit)
    const isGive = customer.balance < 0; // vendor owes customer

    return (
        <div className="max-w-2xl mx-auto pb-24 md:pb-10">
            {/* Mobile sticky header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 px-4 py-3 flex items-center gap-3 -mx-4 md:hidden">
                <Link href="/dashboard/customers" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-slate-900 dark:text-white truncate">{customer.name}</h1>
                    <p className="text-xs text-slate-500 truncate">{customer.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                    {shareLink && (
                        <button
                            onClick={copyShareLink}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
                            title="Copy share link"
                        >
                            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                        </button>
                    )}
                    <a href={`https://wa.me/${customer.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors">
                        <MessageCircle size={18} />
                    </a>
                    <a href={`tel:${customer.phoneNumber}`}
                        className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                        <Phone size={18} />
                    </a>
                </div>
            </div>

            {/* Desktop header */}
            <div className="hidden md:flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/customers" className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="text-slate-500 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
                            <Phone size={13} /> {customer.phoneNumber}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {shareLink && (
                        <button
                            onClick={copyShareLink}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
                            {copied ? 'Copied!' : 'Share Link'}
                        </button>
                    )}
                    <a href={`tel:${customer.phoneNumber}`}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 transition-colors">
                        <Phone size={18} />
                    </a>
                    <a href={`https://wa.me/${customer.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400 transition-colors">
                        <MessageCircle size={18} />
                    </a>
                </div>
            </div>

            {/* Balance Card */}
            <div className="mx-4 md:mx-0 mt-4 md:mt-0 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-blue-100/80 text-sm font-medium mb-1">Current Balance</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">₹{absBalance.toLocaleString()}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOwed ? 'bg-emerald-500/20 text-emerald-100' : isGive ? 'bg-red-500/20 text-red-100' : 'bg-white/10 text-white/70'}`}>
                        {isOwed ? 'You will Get' : isGive ? 'You will Give' : 'All Settled'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mx-4 md:mx-0 mt-4">
                <button
                    onClick={() => setModal({ isOpen: true, type: 'CREDIT' })}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                >
                    <Minus size={20} />
                    <span>Gave Credit</span>
                </button>
                <button
                    onClick={() => setModal({ isOpen: true, type: 'PAYMENT' })}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <Plus size={20} />
                    <span>Got Payment</span>
                </button>
            </div>

            {/* Transaction History */}
            <div className="mx-4 md:mx-0 mt-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Transaction History</h3>
                    <button
                        onClick={downloadCustomerPDF}
                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Download size={14} /> PDF
                    </button>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {customer.transactions?.length > 0 ? (
                        customer.transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'PAYMENT'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    }`}>
                                        {tx.type === 'PAYMENT' ? <Plus size={16} /> : <Minus size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                                            {tx.description || (tx.type === 'PAYMENT' ? 'Payment Received' : 'Credit Given')}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Calendar size={10} />
                                            {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${tx.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'PAYMENT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            No transactions yet. Start by adding one!
                        </div>
                    )}
                </div>
            </div>

            {/* Share link section (mobile) */}
            {shareLink && (
                <div className="mx-4 md:mx-0 mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">Customer Share Link</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-300/50 truncate">{shareLink}</p>
                    </div>
                    <button
                        onClick={copyShareLink}
                        className="p-2 rounded-xl bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700/30 transition-colors flex-shrink-0"
                    >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                </div>
            )}

            {/* Transaction Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0f172a] w-full md:max-w-sm md:mx-4 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl border-t md:border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className={`text-lg font-bold ${modal.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {modal.type === 'PAYMENT' ? 'Record Payment' : 'Give Credit'}
                            </h2>
                            <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={(e) => void handleTransaction(e)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-white/10 focus:border-blue-500 focus:outline-none py-2 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Note (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                    placeholder="e.g. Rice, Sugar..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModal({ ...modal, isOpen: false })}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all text-sm flex items-center justify-center gap-2 ${modal.type === 'PAYMENT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-60`}
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
