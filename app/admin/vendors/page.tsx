'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Download, CheckSquare, Square } from 'lucide-react';
import { safeFormatDate } from '@/lib/safe-date';
import toast from 'react-hot-toast';

const PLAN_OPTIONS = ['ALL', 'FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'] as const;
const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'SUSPENDED'] as const;
const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Joined Date' },
    { value: 'pending', label: 'Pending Amount' },
    { value: 'customers', label: 'Customers' },
    { value: 'transactions', label: 'Transactions' },
] as const;

export default function VendorsPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [bulkPlan, setBulkPlan] = useState('MONTHLY');
    const [bulkStatus, setBulkStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [summary, setSummary] = useState({ totalPending: 0, active: 0, suspended: 0 });

    const exportCurrentPage = () => {
        if (!vendors.length) return;
        const header = ['Business Name', 'Phone Number', 'Plan', 'Customers', 'Transactions', 'Total Pending'];
        const rows = vendors.map((v) => [
            `"${String(v.businessName || '').replaceAll('"', '""')}"`,
            `"${String(v.phoneNumber || '')}"`,
            `"${String(v.subscription?.planType || 'TRIAL')}"`,
            Number(v.customerCount || 0),
            Number(v.transactionCount || 0),
            Number(v.totalPending || 0),
        ]);
        const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendors-page-${page}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchVendors();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [search, page, planFilter, statusFilter, sortBy, sortOrder]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setVendors([]);
                setTotalPages(1);
                return;
            }
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
                search,
                plan: planFilter,
                status: statusFilter,
                sortBy,
                sortOrder,
            });
            const res = await fetch(`/api/admin/vendors?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setVendors(data.data);
                setTotalPages(data.meta.pages);
                setSelectedVendors([]);
                const list = data.data || [];
                setSummary({
                    totalPending: list.reduce((sum: number, v: any) => sum + Number(v.totalPending || 0), 0),
                    active: list.filter((v: any) => v.subscription?.status === 'ACTIVE').length,
                    suspended: list.filter((v: any) => v.subscription?.status === 'SUSPENDED').length,
                });
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

    const toggleVendorSelection = (vendorId: string) => {
        setSelectedVendors((prev) => prev.includes(vendorId)
            ? prev.filter((id) => id !== vendorId)
            : [...prev, vendorId]);
    };

    const toggleSelectAllCurrentPage = () => {
        const pageIds = vendors.map((v) => v.id);
        const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedVendors.includes(id));
        setSelectedVendors(allSelected ? [] : pageIds);
    };

    const runBulkAction = async (action: 'SET_PLAN' | 'SET_STATUS', value: string) => {
        if (!selectedVendors.length) {
            toast.error('Select at least one vendor');
            return;
        }
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/admin/vendors/bulk', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vendorIds: selectedVendors,
                    action,
                    value
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Bulk update failed');
                return;
            }
            toast.success(`Updated ${data.updated} vendors`);
            fetchVendors();
        } catch (error) {
            toast.error('Bulk update failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Vendor Management</h1>
                    <p className="text-slate-400">Manage all registered businesses and their subscriptions.</p>
                </div>
                <button onClick={exportCurrentPage} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase">Page Pending</div>
                    <div className="text-xl font-bold text-red-400 mt-1">₹{summary.totalPending.toLocaleString()}</div>
                </div>
                <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase">Active Vendors</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{summary.active}</div>
                </div>
                <div className="bg-[#0B0F19] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 uppercase">Suspended Vendors</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">{summary.suspended}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0B0F19] border border-white/5 p-4 rounded-xl flex flex-col gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                        value={planFilter}
                        onChange={(e) => { setPage(1); setPlanFilter(e.target.value); }}
                        className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-white"
                    >
                        {PLAN_OPTIONS.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                        className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-white"
                    >
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-white"
                    >
                        {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <button
                        onClick={() => setSortOrder((p) => p === 'asc' ? 'desc' : 'asc')}
                        className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2.5 text-white"
                    >
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <select
                            value={bulkPlan}
                            onChange={(e) => setBulkPlan(e.target.value)}
                            className="flex-1 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                            {PLAN_OPTIONS.filter((p) => p !== 'ALL').map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                        </select>
                        <button
                            onClick={() => runBulkAction('SET_PLAN', bulkPlan)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
                        >
                            Bulk Plan
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')}
                            className="flex-1 bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                        <button
                            onClick={() => runBulkAction('SET_STATUS', bulkStatus)}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm"
                        >
                            Bulk Status
                        </button>
                    </div>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">
                                    <button
                                        onClick={toggleSelectAllCurrentPage}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        {vendors.length > 0 && vendors.every((v) => selectedVendors.includes(v.id))
                                            ? <CheckSquare size={16} />
                                            : <Square size={16} />}
                                    </button>
                                </th>
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
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                                        Loading vendors...
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                                        No vendors found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((v) => (
                                    <tr
                                        key={v.id}
                                        className="text-sm hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => router.push(`/admin/vendors/${v.id}`)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); }}>
                                            <button
                                                onClick={() => toggleVendorSelection(v.id)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                {selectedVendors.includes(v.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </button>
                                        </td>
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
                                                {v.subscription?.planType || 'FREE'}
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
                                            {safeFormatDate(v.createdAt, 'MMM d, yyyy')}
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
