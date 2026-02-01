'use client';

import { useState, useEffect } from 'react';
import {
    Search, Plus, Phone, ChevronRight, User, MessageSquare,
    MessageCircle, Edit, Trash2, ArrowUpDown, Filter
} from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [sortBy, setSortBy] = useState('name'); // name, balance_high, balance_low
    const { openCustomer } = useCustomerView();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const deleteCustomer = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this customer?')) return;

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

    const sortedCustomers = [...customers]
        .filter(c =>
            c.name?.toLowerCase().includes(query.toLowerCase()) ||
            c.phoneNumber?.includes(query)
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'balance_high') return b.balance - a.balance; // Higher balance (positive or negative magnitude? Usually logic is algebraic)
            // If "High Outstanding" means debt... let's stick to algebraic for now.
            // Actually, usually "High Balance" implies most money owed? Or just value. 
            // Let's assume balance > 0 is Advance, < 0 is Due.
            // So "Lowest Balance" (Most Negative) is Highest Debt.
            if (sortBy === 'debt_high') return a.balance - b.balance; // Most negative first
            if (sortBy === 'advance_high') return b.balance - a.balance; // Most positive first
            return 0;
        });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-fade-in">
            <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                }}
                onSuccess={fetchCustomers}
                customer={editingCustomer}
            />

            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="text-blue-600" />
                        Customers
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {customers.length} total customers
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            {/* Toolbar: Filter & Sort */}
            <div className="flex flex-col md:flex-row gap-4 p-1">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filter list by name or phone..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="debt_high">Highest Debt (Due)</option>
                        <option value="advance_high">Highest Advance</option>
                    </select>
                    <ArrowUpDown className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                    <div className="absolute right-3.5 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none"></div>
                </div>
            </div>

            {/* Customer Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : sortedCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {sortedCustomers.map((customer, i) => (
                            <motion.div
                                key={customer.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                onClick={() => openCustomer(customer.id)}
                                className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-xl hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Top Row: Info */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${customer.balance < 0
                                                ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                : customer.balance > 0
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {customer.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-500 transition-colors line-clamp-1">
                                                {customer.name}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                                                {customer.phoneNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${customer.balance < 0 ? 'text-red-600 dark:text-red-400' :
                                                customer.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                                                    'text-slate-400'
                                            }`}>
                                            ₹{Math.abs(customer.balance).toLocaleString()}
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${customer.balance < 0 ? 'text-red-500' : 'text-emerald-500'
                                            }`}>
                                            {customer.balance < 0 ? 'Due' : customer.balance > 0 ? 'Advance' : 'Settled'}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-slate-100 dark:bg-white/5 mb-4"></div>

                                {/* Bottom Row: Actions */}
                                <div className="flex items-center justify-between gap-1">
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <a href={`tel:${customer.phoneNumber}`} className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Call">
                                            <Phone size={18} />
                                        </a>
                                        <a href={`sms:${customer.phoneNumber}`} className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title="Message">
                                            <MessageSquare size={18} />
                                        </a>
                                        <a href={`https://wa.me/${customer.phoneNumber}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="WhatsApp">
                                            <MessageCircle size={18} />
                                        </a>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCustomer(customer);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => deleteCustomer(customer.id, e)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 self-center"></div>
                                        <button className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                            View <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No customers found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Add your first customer to start tracking.</p>
                </div>
            )}
        </div>
    );
}
