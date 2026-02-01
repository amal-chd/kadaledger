'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Plus, Minus, Calendar, Download, MessageSquare, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'CREDIT' | 'PAYMENT' }>({ isOpen: false, type: 'CREDIT' });
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchCustomer();
        }
    }, [params.id]);

    const fetchCustomer = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
            } else {
                router.push('/dashboard/customers');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
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
                toast.success('Transaction added successfully!');
                setModal({ ...modal, isOpen: false });
                setAmount('');
                setDescription('');
                fetchCustomer(); // Refresh data
            } else {
                toast.error('Failed to add transaction');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const downloadCustomerPDF = async () => {
        const toastId = toast.loading('Generating report...');
        try {
            // Fetch full transaction history
            const token = localStorage.getItem('token');
            const res = await fetch('/api/transactions/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customer.id,
                    startDate: '2000-01-01', // Start from beginning
                    endDate: new Date().toISOString().split('T')[0] // Until today
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch full report data');
            }

            const reportData = await res.json();
            const allTransactions = reportData.transactions || [];

            // Dynamic import for jspdf
            const jsPDF = (await import('jspdf')).default;
            await import('jspdf-autotable');

            const doc: any = new jsPDF();

            doc.setFontSize(20);
            doc.text('Customer Transaction Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Customer: ${customer.name}`, 14, 30);
            doc.text(`Phone: ${customer.phoneNumber}`, 14, 36);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);

            // Balance summary
            doc.setFontSize(12);
            doc.text(`Current Balance: ₹${Math.abs(customer.balance).toLocaleString()}`, 14, 50);
            doc.text(`Status: ${customer.balance < 0 ? 'You will Give' : customer.balance > 0 ? 'You will Get' : 'Settled'}`, 14, 56);

            // Prepare table data
            const headers = [['Date', 'Description', 'Type', 'Amount']];
            const data = allTransactions.map((tx: any) => [
                new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                tx.description || (tx.type === 'PAYMENT' ? 'Payment Received' : 'Credit Given'),
                tx.type,
                `₹${tx.amount.toLocaleString()}`
            ]);

            // Ensure autoTable is available
            if (typeof doc.autoTable !== 'function') {
                throw new Error('PDF plugin not loaded. Please try again.');
            }

            doc.autoTable({
                startY: 65,
                head: headers,
                body: data,
                theme: 'grid' as any,
                headStyles: { fillColor: [37, 99, 235] as [number, number, number] },
                alternateRowStyles: { fillColor: [240, 250, 255] as [number, number, number] },
                styles: { fontSize: 9 }
            });

            doc.save(`${customer.name}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Report downloaded successfully', { id: toastId });
        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            toast.error(`Failed: ${error.message || 'Unknown error'}`, { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <Toaster position="bottom-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/customers" className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="text-slate-500 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                            <Phone size={14} /> {customer.phoneNumber}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={`tel:${customer.phoneNumber}`}
                        className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 p-3 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                        title="Call"
                    >
                        <Phone size={20} />
                    </a>
                    <a
                        href={`sms:${customer.phoneNumber}?body=${encodeURIComponent(`Hello ${customer.name}, your current balance is ₹${Math.abs(customer.balance)} ${customer.balance < 0 ? 'pending' : 'advance'}. Please check details.`)}`}
                        className="bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 p-3 rounded-xl text-blue-600 dark:text-blue-400 transition-colors"
                        title="SMS Reminder"
                    >
                        <MessageSquare size={20} />
                    </a>
                    <a
                        href={`https://wa.me/${customer.phoneNumber}?text=${encodeURIComponent(`Hello ${customer.name}, your current balance with us is ₹${Math.abs(customer.balance)} ${customer.balance < 0 ? 'pending' : 'advance'}. Please pay the pending amount at your earliest convenience.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 p-3 rounded-xl text-green-600 dark:text-green-400 transition-colors"
                        title="WhatsApp Reminder"
                    >
                        <MessageCircle size={20} />
                    </a>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <p className="text-blue-100/80 font-medium mb-2">Current Balance</p>
                        <h2 className="text-5xl font-bold mb-2">₹{Math.abs(customer.balance).toLocaleString()}</h2>
                        <p className={`text-sm font-bold px-3 py-1 rounded-full w-fit ${customer.balance < 0 ? 'bg-red-500/20 text-red-100' : 'bg-emerald-500/20 text-emerald-100'}`}>
                            {customer.balance < 0 ? 'You will Give' : customer.balance > 0 ? 'You will Get' : 'Settled'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setModal({ isOpen: true, type: 'CREDIT' })}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex flex-col items-center gap-2 min-w-[140px]"
                        >
                            <Minus size={24} />
                            <span>Gave Credit</span>
                        </button>
                        <button
                            onClick={() => setModal({ isOpen: true, type: 'PAYMENT' })}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex flex-col items-center gap-2 min-w-[140px]"
                        >
                            <Plus size={24} />
                            <span>Got Payment</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Transaction History</h3>
                    <button
                        onClick={downloadCustomerPDF}
                        className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download size={16} /> PDF Report
                    </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {customer.transactions?.length > 0 ? (
                        customer.transactions.map((tx: any) => (
                            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'PAYMENT' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                        {tx.type === 'PAYMENT' ? <Plus size={20} /> : <Minus size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{tx.description || (tx.type === 'PAYMENT' ? 'Payment Received' : 'Credit Given')}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-lg font-bold ${tx.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'PAYMENT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No transactions yet. Start by adding one!
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-slate-200 dark:border-white/10">
                        <h2 className={`text-2xl font-bold mb-6 ${modal.type === 'PAYMENT' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {modal.type === 'PAYMENT' ? 'Record Payment' : 'Give Credit'}
                        </h2>

                        <form onSubmit={handleTransaction} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full text-3xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-white/10 focus:border-blue-500 focus:outline-none py-2 text-slate-900 dark:text-white placeholder:text-slate-300"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="e.g. Rice, Sugar, etc."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModal({ ...modal, isOpen: false })}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${modal.type === 'PAYMENT' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'}`}
                                >
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
