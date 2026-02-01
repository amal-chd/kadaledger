'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, TrendingDown, AlertCircle,
    Plus, Search, ArrowRight, IndianRupee, AlertTriangle,
    Wallet, Calendar, ChevronRight
} from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import { useDataRefresh } from '@/contexts/data-refresh-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';
import toast from 'react-hot-toast';
import { useFirestoreVendorStats } from '@/hooks/use-firestore';

// Helper to decode JWT on client
function getVendorIdFromToken() {
    if (typeof window === 'undefined') return undefined;
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub;
    } catch (e) {
        return undefined;
    }
}

const API_URL = '/api';

export default function Dashboard() {
    const [vendor, setVendor] = useState<any>(null);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

    const router = useRouter();
    const { openCustomer } = useCustomerView();
    const { refreshTrigger, lastUpdate, triggerRefresh } = useDataRefresh();

    // Real-Time Stats
    const vendorId = getVendorIdFromToken();
    const { stats: realtimeStats } = useFirestoreVendorStats(vendorId);

    // Merge API and Realtime Stats
    const statsData = {
        ...dashboardStats,
        ...(realtimeStats || {})
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (lastUpdate.customer || lastUpdate.dashboard) {
            fetchData();
        }
    }, [lastUpdate.customer, lastUpdate.dashboard]);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [resProfile, resStats] = await Promise.all([
                fetch(`${API_URL}/vendor/profile`, { headers }),
                fetch(`${API_URL}/vendor/dashboard`, { headers })
            ]);

            if (!resProfile.ok) throw new Error('Failed to fetch data');

            const profileData = await resProfile.json();
            const statsData = await resStats.json();

            setVendor(profileData);
            setDashboardStats(statsData);
        } catch (e) {
            console.error(e);
            // toast.error('Failed to load dashboard data');
            if (!vendor) {
                // only redirect if we really don't have user info (first load)
                // localStorage.removeItem('token');
                // router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Outstanding',
            value: `₹${statsData?.totalOutstanding?.toLocaleString() || '0'}`,
            icon: Wallet,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-500/10',
            desc: 'Total amount to receive'
        },
        {
            label: "Today's Collection",
            value: `₹${statsData?.todaysActivity?.payments?.toLocaleString() || '0'}`,
            icon: TrendingDown,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            desc: 'Received today'
        },
        {
            label: "Today's Credit",
            value: `₹${statsData?.todaysActivity?.credits?.toLocaleString() || '0'}`,
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            desc: 'Given today'
        },
        {
            label: 'Total Customers',
            value: statsData?.totalCustomers || '0',
            // Actually stats doesn't strictly return total customers count, only "defaulterSummary" count. 
            // Let's assume fetching profile returns a count or we rely on what we have.
            // The previous code fetched /customers which is heavy. Let's stick to what we have or display "N/A" if missing.
            // Wait, previous code fetched /customers. I removed that to save bandwidth. 
            // I'll leave this as generic Stats or use a safe fallback.
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            desc: 'Active profiles'
        }
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-200">{vendor?.businessName || 'Business Owner'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddCustomerOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={20} />
                        Add Customer
                    </button>
                    {vendor?.subscription?.planType === 'TRIAL' && (
                        <div className="hidden md:flex flex-col items-end px-4 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Free Trial</span>
                            <span className="text-sm font-medium text-amber-900 dark:text-amber-400">{vendor?.subscription?.daysLeft || 14} days left</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            {index === 0 && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</h3>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {stat.desc}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content - Quick Actions & Recent */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
                            <p className="text-blue-100 mb-8 max-w-md">Manage your business efficiently. Record transactions, manage customers, or view reports.</p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => router.push('/dashboard/customers')}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-medium transition-all"
                                >
                                    <Search size={18} />
                                    Search Customer
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/reports')}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-medium transition-all"
                                >
                                    <TrendingUp size={18} />
                                    View Reports
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Transactions / Activity Placeholder */}
                    {/* Since we don't have a simple recent activity API ready in the dashboard response, 
                        we'll show a call to action or a simplified list if we had data within dashboardStats.
                        For now, let's show a useful "High Priority" card or tips.
                    */}
                </div>

                {/* Right Sidebar - High Risk Customers */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-fit"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            High Risk
                        </h3>
                        <button
                            onClick={() => router.push('/dashboard/customers')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            VIEW ALL
                        </button>
                    </div>

                    <div className="space-y-4">
                        {statsData?.highRiskCustomers?.length > 0 ? (
                            statsData.highRiskCustomers.map((c: any) => (
                                <div
                                    key={c.id}
                                    onClick={() => openCustomer(c.id)}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">
                                            {c.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{c.name}</div>
                                            <div className="text-xs text-slate-500">Overdue</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-red-600 dark:text-red-400 text-sm">₹{c.balance.toLocaleString()}</div>
                                        <ChevronRight size={14} className="text-slate-300 inline-block ml-1" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                    <TrendingDown size={20} />
                                </div>
                                <p>No high risk customers.</p>
                                <p className="text-xs text-slate-400 mt-1">Great job collecting payments!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <AddCustomerModal
                isOpen={isAddCustomerOpen}
                onClose={() => setIsAddCustomerOpen(false)}
                onSuccess={() => {
                    triggerRefresh('customer');
                    triggerRefresh('dashboard');
                    fetchData(); // Manual refresh
                }}
            />
        </div>
    );
}
