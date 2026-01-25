'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Phone, ChevronRight, User, MessageSquare, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const { openCustomer } = useCustomerView();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const deleteCustomer = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCustomers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phoneNumber?.includes(query)
    );

    return (
        <div className="space-y-8">
            <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                }}
                onSuccess={fetchCustomers}
                customer={editingCustomer}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customers</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your customers and their credits.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or phone number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Customer List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : filteredCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            onClick={() => openCustomer(customer.id)}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 hover:shadow-xl hover:border-blue-500/30 transition-all group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                        {customer.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-500 transition-colors">
                                            {customer.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                            <Phone size={12} /> {customer.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance</span>
                                <span className={`text-lg font-bold ${customer.balance > 0 ? 'text-emerald-500' : customer.balance < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                    ₹{Math.abs(customer.balance).toLocaleString()} {customer.balance < 0 ? 'Due' : customer.balance > 0 ? 'Adv' : ''}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                                {/* Communication Actions */}
                                <div className="flex gap-2">
                                    <a
                                        href={`tel:${customer.phoneNumber}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                    >
                                        <Phone size={16} /> Call
                                    </a>
                                    <a
                                        href={`sms:${customer.phoneNumber}?body=${encodeURIComponent(`Hello ${customer.name}, your current balance is ₹${Math.abs(customer.balance)} ${customer.balance < 0 ? 'pending' : 'advance'}. Please check details.`)}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                    >
                                        <MessageSquare size={16} /> SMS
                                    </a>
                                    <a
                                        href={`https://wa.me/${customer.phoneNumber}?text=${encodeURIComponent(`Hello ${customer.name}, your current balance with us is ₹${Math.abs(customer.balance)} ${customer.balance < 0 ? 'pending' : 'advance'}. Please pay the pending amount at your earliest convenience.`)}`}
                                        onClick={(e) => e.stopPropagation()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                    >
                                        <MessageCircle size={16} /> WA
                                    </a>
                                </div>

                                {/* Management Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCustomer(customer);
                                            setIsAddModalOpen(true);
                                        }}
                                        className="flex-1 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
                                                deleteCustomer(customer.id);
                                            }
                                        }}
                                        className="flex-1 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/5 border-dashed">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No customers found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Add your first customer to start tracking credits.</p>
                </div>
            )}
        </div>
    );
}
