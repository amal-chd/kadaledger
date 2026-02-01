'use client';

import { X, TrendingUp, Users, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Seed Data Report</h3>
                                <p className="text-sm text-slate-300/60">Annual Performance Overview</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Recovery', val: '₹4.2L', chg: '+12%', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                                { label: 'Active Customers', val: '840', chg: '+25%', icon: Users, color: 'text-primary', bg: 'bg-primary/20' },
                                { label: 'Growth Rate', val: '18%', chg: '+5%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/20' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 md:hover:scale-105 transition-transform">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                            <stat.icon size={16} />
                                        </div>
                                        <span className={`text-xs font-bold ${stat.color.replace('400', '300')} px-2 py-1 rounded-full bg-white/5`}>
                                            {stat.chg}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-1">{stat.val}</h4>
                                    <p className="text-xs text-slate-300/50">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <BarChart3 size={16} className="text-primary" />
                                    Recovery Trends
                                </h4>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-3 py-1 rounded-full bg-accent text-white">2024</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer">2023</span>
                                </div>
                            </div>

                            <div className="h-48 flex items-end justify-between gap-2 md:gap-4 px-2">
                                {[35, 45, 30, 60, 75, 50, 65, 80, 55, 70, 85, 90].map((h, i) => (
                                    <div key={i} className="w-full bg-white/5 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                                        <div className="absolute bottom-0 w-full h-full bg-blue-500/50 hover:bg-blue-400 transition-colors"></div>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ₹{(h * 1.5).toFixed(0)}k
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-slate-500 uppercase font-medium tracking-wider">
                                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-bold transition-colors">
                            Close Report
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
