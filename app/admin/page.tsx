'use client';
import { useState, useEffect } from 'react';
import {
    Users,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity,
    CreditCard,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-white text-center py-20">Loading stats...</div>;
    }

    if (!stats) {
        return <div className="text-white text-center py-20">Failed to load data</div>;
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back, Super Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Vendors"
                    value={stats.overview.totalVendors}
                    icon={Users}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.overview.totalCustomers}
                    icon={Activity}
                    trend="+5%"
                    trendUp={true}
                    color="purple"
                />
                <StatCard
                    title="Total Outstanding"
                    value={`₹${stats.overview.totalPending.toLocaleString()}`}
                    icon={DollarSign}
                    trend="-2.5%"
                    trendUp={false}
                    color="amber"
                />
                <StatCard
                    title="Today's Volume"
                    value={`₹${stats.overview.todaysVolume.toLocaleString()}`}
                    icon={CreditCard}
                    subtitle={`${stats.overview.todaysCount} transactions`}
                    color="emerald"
                />
            </div>

            {/* Recent Vendors Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Recent Vendors</h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>

                    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Business</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Joined</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.recentVendors.map((vendor: any) => (
                                        <tr key={vendor.id} className="text-sm hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-white">{vendor.businessName || 'N/A'}</div>
                                                    <div className="text-slate-500 text-xs">{vendor.phoneNumber}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${vendor.subscription?.status === 'ACTIVE'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-amber-500/10 text-amber-500'
                                                    }
                                                `}>
                                                    {vendor.subscription?.planType || 'TRIAL'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {format(new Date(vendor.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-white transition-colors">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.recentVendors.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                No vendors found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Health / Quick Actions (Optional) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">System Status</h2>
                    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-slate-300 text-sm">API Gateway</span>
                            </div>
                            <span className="text-emerald-500 text-xs font-bold">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-slate-300 text-sm">Database</span>
                            </div>
                            <span className="text-emerald-500 text-xs font-bold">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-slate-300 text-sm">Notifications</span>
                            </div>
                            <span className="text-emerald-500 text-xs font-bold">OPERATIONAL</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
                        <h3 className="font-bold text-lg mb-1">Growth Insight</h3>
                        <p className="text-blue-100 text-sm mb-4 opacity-90">
                            Vendor acquisition is up by 12% compared to last week.
                        </p>
                        <div className="h-1 w-full bg-blue-500/50 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, subtitle, color = 'blue' }: any) {
    const colors: any = {
        blue: 'bg-blue-500/10 text-blue-500',
        purple: 'bg-purple-500/10 text-purple-500',
        amber: 'bg-amber-500/10 text-amber-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
    };

    return (
        <div className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-red-500'} bg-white/5 px-2 py-1 rounded-lg`}>
                        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}
