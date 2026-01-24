'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Phone, ChevronRight, User } from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { openCustomer } = useCustomerView();

    useEffect(() => {
        fetchCustomers();
    }, []);

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
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchCustomers}
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
