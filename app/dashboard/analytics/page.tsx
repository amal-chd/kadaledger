'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight,
    ArrowDownLeft, AlertCircle, ChevronRight, PieChart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDeviceTimeHeaders } from '@/lib/client-time';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/analytics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...getDeviceTimeHeaders()
                }
            });

            if (res.ok) {
                const data = await res.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Analyzing financial data...</p>
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Outstanding',
            value: `₹${metrics?.totalOutstanding?.toLocaleString() || '0'}`,
            icon: Wallet,
            change: 'Net Receivable',
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
            border: 'border-red-100 dark:border-red-500/20'
        },
        {
            title: "Today's Collection",
            value: `₹${metrics?.todaysCollection?.toLocaleString() || '0'}`,
            icon: TrendingDown,
            change: 'Cash In',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-100 dark:border-emerald-500/20'
        },
        {
            title: "Today's Credit",
            value: `₹${metrics?.todaysCredit?.toLocaleString() || '0'}`,
            icon: TrendingUp,
            change: 'Cash Out',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-100 dark:border-amber-500/20'
        },
        {
            title: 'Active Customers',
            value: metrics?.totalCustomers?.toString() || '0',
            icon: Users,
            change: 'Total Base',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-100 dark:border-blue-500/20'
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <PieChart className="text-blue-600" />
                        Business Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Financial performance and customer insights
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Data
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 rounded-2xl bg-white dark:bg-white/5 border ${card.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <card.icon size={60} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</h2>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                                {card.change}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Cash Flow Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow Trends</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Credit vs Collections (Last 30 Days)</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                Collections
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Credit
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/5" />
                                <XAxis
                                    dataKey="name"
                                    className="text-xs text-slate-400 font-medium"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    minTickGap={30}
                                />
                                <YAxis
                                    className="text-xs text-slate-400 font-medium"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                    formatter={(value: any) => [`₹${(value as number).toLocaleString()}`, undefined]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="payment"
                                    name="Collections"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPayment)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="credit"
                                    name="Credit Given"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCredit)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Side Panel: Top Defaulters & Recent */}
                <div className="space-y-6">
                    {/* Top Defaulters */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-red-500" />
                            Highest Outstanding
                        </h3>
                        <div className="space-y-4">
                            {metrics?.topDefaulters?.length > 0 ? (
                                metrics.topDefaulters.map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs">
                                                {c.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.phoneNumber}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-600 dark:text-red-400">₹{c.balance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">No outstanding accounts</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Transactions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Actvity</h3>
                        <div className="space-y-4">
                            {metrics?.recentTransactions?.length > 0 ? (
                                metrics.recentTransactions.map((tx: any) => (
                                    <div key={tx.id} className="flex items-start justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEBIT' || tx.type === 'PAYMENT'
                                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                {tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">{tx.customer?.name}</div>
                                                <div className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold ${tx.type === 'DEBIT' || tx.type === 'PAYMENT'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
