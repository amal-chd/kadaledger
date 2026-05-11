'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Phone, User, MessageCircle, Edit, Trash2,
  ArrowUpDown, ChevronDown, Users
} from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  balance: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const { openCustomer } = useCustomerView();

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json() as Customer[];
        setCustomers(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const deleteCustomer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this customer? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Customer deleted');
        setCustomers(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error('Failed to delete customer');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const sortedCustomers = [...customers]
    .filter(c =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.phoneNumber?.includes(query)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'debt_high') return a.balance - b.balance;
      if (sortBy === 'advance_high') return b.balance - a.balance;
      return 0;
    });

  const dueCount = customers.filter(c => c.balance < 0).length;
  const advanceCount = customers.filter(c => c.balance > 0).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in">
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={fetchCustomers}
        customer={editingCustomer}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {customers.length} total · {dueCount} due · {advanceCount} advance
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all text-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-7 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="debt_high">Highest Due</option>
            <option value="advance_high">Highest Advance</option>
          </select>
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div>
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedCustomers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {query ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
            {query ? 'Try a different search term' : 'Add your first customer to start tracking'}
          </p>
          {!query && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus size={16} />
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence>
          {/* Mobile List View */}
          <div className="md:hidden space-y-3">
            {sortedCustomers.map((customer, i) => (
              <motion.div
                key={customer.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
                onClick={() => openCustomer(customer.id)}
                className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    customer.balance < 0
                      ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                      : customer.balance > 0
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{customer.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{customer.phoneNumber}</p>
                  </div>

                  {/* Balance */}
                  <div className="text-right flex-shrink-0">
                    <div className={`font-bold text-base ${
                      customer.balance < 0 ? 'text-red-600 dark:text-red-400' :
                      customer.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                      'text-slate-400'
                    }`}>
                      ₹{Math.abs(customer.balance).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      customer.balance < 0 ? 'text-red-500' :
                      customer.balance > 0 ? 'text-emerald-500' :
                      'text-slate-400'
                    }`}>
                      {customer.balance < 0 ? 'Due' : customer.balance > 0 ? 'Advance' : 'Clear'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${customer.phoneNumber}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-xs font-medium"
                  >
                    <Phone size={14} />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${customer.phoneNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-white/5 hover:bg-green-50 dark:hover:bg-green-500/10 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-colors text-xs font-medium"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); setIsAddModalOpen(true); }}
                    className="flex items-center justify-center w-9 bg-slate-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => void deleteCustomer(customer.id, e)}
                    className="flex items-center justify-center w-9 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCustomers.map((customer, i) => (
              <motion.div
                key={`desktop-${customer.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                onClick={() => openCustomer(customer.id)}
                className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      customer.balance < 0
                        ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : customer.balance > 0
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 text-sm">
                        {customer.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{customer.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-base font-bold ${
                      customer.balance < 0 ? 'text-red-600 dark:text-red-400' :
                      customer.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                      'text-slate-400'
                    }`}>
                      ₹{Math.abs(customer.balance).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      customer.balance < 0 ? 'text-red-500' : customer.balance > 0 ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      {customer.balance < 0 ? 'Due' : customer.balance > 0 ? 'Advance' : 'Clear'}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/5 mb-4" />

                <div className="flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <a href={`tel:${customer.phoneNumber}`} className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/15 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Call">
                      <Phone size={15} />
                    </a>
                    <a href={`https://wa.me/${customer.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="WhatsApp">
                      <MessageCircle size={15} />
                    </a>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { setEditingCustomer(customer); setIsAddModalOpen(true); e.stopPropagation(); }} className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => void deleteCustomer(customer.id, e)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
