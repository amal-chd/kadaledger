'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVendors();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [search, page]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/vendors?page=${page}&limit=10&search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setVendors(data.data);
                setTotalPages(data.meta.pages);
            } else {
                console.error('Fetch failed with status:', res.status);
                // toast.error('Failed to load vendors'); // Optional: show toast if needed, but console is good for now
            }
        } catch (error) {
            console.error('Failed to fetch vendors', error);
            // toast.error('Network error loading vendors');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Vendor Management</h1>
                    <p className="text-slate-400">Manage all registered businesses and their subscriptions.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                    <Download size={18} />
                    Export Data
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#0B0F19] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search vendors by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#020617] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#020617] border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Vendors Table */}
            <div className="bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Vendor Details</th>
                                <th className="px-6 py-4">Subscription</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4">Total Pending</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                                        Loading vendors...
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                                        No vendors found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="text-sm hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => window.location.href = `/admin/vendors/${v.id}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-white mb-1">{v.businessName || 'Unnamed Business'}</div>
                                                <div className="text-slate-500 text-xs font-mono">{v.phoneNumber}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border
                                                ${v.subscription?.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }
                                            `}>
                                                {v.subscription?.planType || 'TRIAL'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-slate-300 text-xs">{v.customerCount} Customers</div>
                                                <div className="text-slate-500 text-xs">{v.transactionCount} Trans.</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-red-400 font-bold font-mono">
                                            ₹{v.totalPending.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {format(new Date(v.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && vendors.length > 0 && (
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
