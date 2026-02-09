'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Loader2, Calendar, Download, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { getDeviceTimeHeaders } from '@/lib/client-time';

// Extend jsPDF type to include autoTable
// interface jsPDFWithAutoTable extends jsPDF {
//     lastAutoTable: { finalY: number };
//     autoTable: (options: any) => void;
// }

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [dateStart, setDateStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [dateEnd, setDateEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState<any>(null);

    // Initial fetch
    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        if (!dateStart || !dateEnd) {
            toast.error('Please select both start and end dates');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/transactions/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...getDeviceTimeHeaders()
                },
                body: JSON.stringify({ startDate: dateStart, endDate: dateEnd })
            });

            if (!res.ok) {
                throw new Error('Failed to fetch report data');
            }

            const reportData = await res.json();

            // Process data for charts
            // Group transactions by date
            const chartDataMap = new Map();
            reportData.transactions.forEach((tx: any) => {
                const date = new Date(tx.date).toLocaleDateString('en-IN');
                if (!chartDataMap.has(date)) {
                    chartDataMap.set(date, { date, credit: 0, payment: 0 });
                }
                const entry = chartDataMap.get(date);
                if (tx.type === 'CREDIT') entry.credit += tx.amount;
                else entry.payment += tx.amount;
            });

            const chartData = Array.from(chartDataMap.values()).reverse(); // Reverse to show chronological order if backend sends desc

            setData({ ...reportData, chartData });
            toast.success('Report updated');

        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (!data) return;
        const toastId = toast.loading('Generating PDF...');

        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            const doc: any = new jsPDF();
            const { transactions, summary } = data;

            doc.setFontSize(20);
            doc.text('Kada Ledger - Financial Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Period: ${dateStart} to ${dateEnd}`, 14, 36);

            // Add summary
            doc.setFontSize(12);
            doc.text(`Total Transactions: ${summary.count}`, 14, 44);
            doc.text(`Total Credit: ₹${summary.totalCredit.toLocaleString()}`, 14, 50);
            doc.text(`Total Payment: ₹${summary.totalPayment.toLocaleString()}`, 14, 56);
            doc.text(`Net Balance: ₹${summary.netBalance.toLocaleString()}`, 14, 62);

            // Prepare table data
            const headers = [['Date', 'Customer', 'Type', 'Description', 'Amount']];
            const tableRows = transactions.map((tx: any) => [
                new Date(tx.date).toLocaleDateString('en-IN'),
                tx.customer?.name || 'N/A',
                tx.type,
                tx.description || '-',
                `₹${tx.amount.toLocaleString()}`
            ]);

            const tableOptions = {
                startY: 70,
                head: headers,
                body: tableRows,
                theme: 'grid' as any,
                headStyles: { fillColor: [37, 99, 235] as [number, number, number] },
                alternateRowStyles: { fillColor: [240, 250, 255] as [number, number, number] },
                styles: { fontSize: 9 }
            };

            // Try prototype method first, then functional method
            if (typeof doc.autoTable === 'function') {
                doc.autoTable(tableOptions);
            } else if (typeof autoTable === 'function') {
                autoTable(doc, tableOptions);
            } else {
                console.error('autoTable type:', typeof autoTable, autoTable);
                throw new Error('PDF plugin payload failed to load');
            }

            doc.save(`Kada_Report_${dateStart}_${dateEnd}.pdf`);
            toast.success('PDF downloaded', { id: toastId });
        } catch (error: any) {
            console.error('PDF Error:', error);
            toast.error(`Failed to generate PDF: ${error.message || error}`, { id: toastId });
        }
    };

    const setDateRange = (range: 'today' | 'week' | 'month' | 'lastMonth') => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (range) {
            case 'today':
                // start and end are already today
                break;
            case 'week':
                start = subDays(today, 7);
                break;
            case 'month':
                start = startOfMonth(today);
                break;
            case 'lastMonth':
                start = startOfMonth(subMonths(today, 1));
                end = endOfMonth(subMonths(today, 1));
                break;
        }

        setDateStart(format(start, 'yyyy-MM-dd'));
        setDateEnd(format(end, 'yyyy-MM-dd'));
        // We will need to trigger fetch manually or add effect if we want auto-fetch
        // But for better UX, let user click "Generate" or just wait
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-0 pb-20 md:pb-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your business performance and cash flow</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={generatePDF} disabled={!data || loading} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        <Download size={18} />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Controls */}
            <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 min-w-max overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        <button onClick={() => setDateRange('today')} className="px-3 py-2 text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap">Today</button>
                        <button onClick={() => setDateRange('week')} className="px-3 py-2 text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap">This Week</button>
                        <button onClick={() => setDateRange('month')} className="px-3 py-2 text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap">This Month</button>
                        <button onClick={() => setDateRange('lastMonth')} className="px-3 py-2 text-sm bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap">Last Month</button>
                    </div>

                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Generate
                    </button>
                </div>
            </div>

            {/* Results */}
            {data ? (
                <div className="space-y-6 md:space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                                    <TrendingDown size={24} />
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Credit Given</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">₹{data.summary.totalCredit.toLocaleString()}</div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Payment Received</span>
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">₹{data.summary.totalPayment.toLocaleString()}</div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <IndianRupee size={24} />
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Net Balance Change</span>
                            </div>
                            <div className={`text-2xl md:text-3xl font-bold ${data.summary.netBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {data.summary.netBalance > 0 ? '+' : ''}₹{data.summary.netBalance.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Positive means more credit given than received.</p>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm h-[300px] md:h-[400px]">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Transaction Trends</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis dataKey="date" fontSize={10} tickMargin={5} minTickGap={30} />
                                <YAxis fontSize={10} tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="credit" name="Credit Given" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="payment" name="Payment Received" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Transactions Table */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Transactions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-4 py-3 md:px-6 md:py-4 font-medium whitespace-nowrap">Date</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 font-medium whitespace-nowrap">Customer</th>
                                        <th className="hidden md:table-cell px-4 py-3 md:px-6 md:py-4 font-medium whitespace-nowrap">Type</th>
                                        <th className="hidden lg:table-cell px-4 py-3 md:px-6 md:py-4 font-medium whitespace-nowrap">Description</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 font-medium text-right whitespace-nowrap">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {data.transactions.length > 0 ? (
                                        data.transactions.map((tx: any) => (
                                            <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {new Date(tx.date).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-slate-400 md:hidden">
                                                            {new Date(tx.date).getFullYear()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 md:px-6 md:py-4 font-medium text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span>{tx.customer?.name || 'Unknown'}</span>
                                                        {/* Show type as subtitle on mobile */}
                                                        <span className={`text-xs md:hidden ${tx.type === 'CREDIT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {tx.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-4 py-3 md:px-6 md:py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${tx.type === 'CREDIT'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="hidden lg:table-cell px-4 py-3 md:px-6 md:py-4 text-slate-500 dark:text-slate-400 text-sm max-w-[150px] md:max-w-xs truncate">
                                                    {tx.description || '-'}
                                                </td>
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                                    ₹{tx.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No transactions found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Report Generated</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center">
                        Select a date range above and click "Generate Report" to view your financial insights.
                    </p>
                </div>
            )}
        </div>
    );
}
