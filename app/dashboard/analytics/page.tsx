'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
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
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const cards = [
        { title: 'Total Customers', value: metrics?.totalCustomers?.toString() || '0', change: '+2.5%', color: 'blue' },
        { title: 'Outstanding', value: `₹${metrics?.totalOutstanding?.toFixed(2) || '0.00'}`, change: '+12%', color: 'amber' },
        { title: "Today's Collection", value: `₹${metrics?.todaysCollection?.toFixed(2) || '0.00'}`, change: '+8%', color: 'green' },
    ];

    // Dummy data for charts if API doesn't provide it yet
    const data = metrics?.chartData || [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Business Analytics</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <h3 className="text-slate-500 dark:text-slate-400 mb-2">{card.title}</h3>
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h2>
                            <span className={`text-${card.color}-500 text-sm font-bold bg-${card.color}-500/10 px-2 py-1 rounded-lg`}>
                                {card.change}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Overview</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                width={500}
                                height={400}
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/10" />
                                <XAxis dataKey="name" className="text-slate-500 text-xs" />
                                <YAxis className="text-slate-500 text-xs" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {metrics?.recentTransactions?.length === 0 ? (
                            <p className="text-slate-500 text-center">No transactions yet.</p>
                        ) : (
                            metrics?.recentTransactions?.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className='flex items-center gap-3'>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.customer?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {tx.type === 'DEBIT' || tx.type === 'PAYMENT' ? '+' : '-'}₹{tx.amount}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
