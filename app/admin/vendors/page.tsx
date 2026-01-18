'use client';

import { useEffect, useState } from 'react';
import { LucideSearch, LucideMoreVertical, LucideCalendarClock, LucideBan } from 'lucide-react';

const API_URL = '/api';

export default function VendorManagement() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`${API_URL}/admin/vendors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVendors(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const manageSub = async (id: string, action: 'extend' | 'expire') => {
        const token = localStorage.getItem('admin_token');
        if (!confirm(`Are you sure you want to ${action} this subscription?`)) return;

        try {
            const res = await fetch(`${API_URL}/admin/vendors/${id}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchVendors(); // Refresh
                alert('Success');
            } else {
                alert('Failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        v.phoneNumber.includes(search)
    );

    if (loading) return <div className="p-8 text-white">Loading vendors...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Vendor Management</h1>

                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                            <th className="p-4 font-medium">Business</th>
                            <th className="p-4 font-medium">Contact</th>
                            <th className="p-4 font-medium">Stats</th>
                            <th className="p-4 font-medium">Plan</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredVendors.map(v => (
                            <tr key={v.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white">{v.businessName || 'N/A'}</div>
                                    <div className="text-xs text-slate-500">ID: {v.id.substring(0, 8)}...</div>
                                </td>
                                <td className="p-4 text-slate-300">
                                    {v.phoneNumber}
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-slate-300">{v.customerCount} Cust.</div>
                                    <div className="text-xs text-emerald-400">₹{v.totalPending} Pending</div>
                                </td>
                                <td className="p-4">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase">
                                        {v.subscription?.planType}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${v.subscription?.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {v.subscription?.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => manageSub(v.id, 'extend')}
                                            title="Extend Subscription 30 Days"
                                            className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-all"
                                        >
                                            <LucideCalendarClock size={18} />
                                        </button>
                                        <button
                                            onClick={() => manageSub(v.id, 'expire')}
                                            title="Expire Subscription"
                                            className="p-2 hover:bg-slate-600 rounded-lg text-red-400 transition-all"
                                        >
                                            <LucideBan size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVendors.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No vendors found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
