'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: any;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess, customer }: AddCustomerModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(customer?.name || '');
            setPhone(customer?.phoneNumber || '');
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
            const method = customer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, phoneNumber: phone })
            });

            if (res.ok) {
                toast.success(customer ? 'Customer updated successfully!' : 'Customer added successfully!');
                setName('');
                setPhone('');
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save customer');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl w-full max-w-md p-6 relative shadow-2xl border border-slate-200 dark:border-white/10">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone size={18} />
                            </span>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
                    </button>
                </form>

            </div>
        </div>
    );
}
