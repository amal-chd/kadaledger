'use client';

import { useEffect, useState } from 'react';
import { LucideUsers, LucideDollarSign, LucideActivity, LucideTrendingUp } from 'lucide-react';

const API_URL = '/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setStats(null);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                setStats(null);
                return;
            }
            const data = await res.json();
            setStats({
                totalVendors: data?.overview?.totalVendors ?? 0,
                totalRevenue: data?.overview?.todaysVolume ?? 0,
                activeTrials: data?.overview?.activeTrials ?? 0,
                activePaid: data?.overview?.activePaid ?? 0,
            });
        } catch (e) {
            console.error(e);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading stats...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Vendors"
                    value={stats?.totalVendors || 0}
                    icon={LucideUsers}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue || 0}`}
                    icon={LucideDollarSign}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Active Trials"
                    value={stats?.activeTrials || 0}
                    icon={LucideActivity}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    title="Paid Subscribers"
                    value={stats?.activePaid || 0}
                    icon={LucideTrendingUp}
                    color="text-orange-400"
                    bg="bg-orange-500/10"
                />
            </div>

            {/* Recent Activity or Charts could go here */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Platform Growth</h2>
                <div className="h-64 flex items-center justify-center text-slate-500">
                    Chart Placeholder (Recharts integration later)
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`${bg} p-3 rounded-xl`}>
                    <Icon className={color} size={24} />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+12%</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
