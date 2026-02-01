'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Phone, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCustomerView } from '@/contexts/customer-view-context';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { openCustomer } = useCustomerView();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                fetchResults();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (customer: any) => {
        openCustomer(customer.id);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search customers by name or phone..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value) setIsOpen(true);
                    }}
                    onFocus={() => query && setIsOpen(true)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (query.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Loading...</div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Customers</div>
                            {results.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleSelect(customer)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-primary flex items-center justify-center font-bold text-xs">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                                                {customer.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {customer.phoneNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">No customers found.</p>
                            <Link href="/dashboard/customers" className="text-primary hover:text-primary text-sm font-medium mt-2 block">
                                Add new customer
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
