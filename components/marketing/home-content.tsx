'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight,
    Play,
    ChevronDown,
    Plus,
    Star,
    CheckCircle2,
    Users,
    TrendingUp,
    FileText,
    Shield,
    Smartphone,
    CreditCard,
    Zap,
    Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Aurora from './Aurora';

export default function HomeContent() {
    // FAQ State
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [isScrolled, setIsScrolled] = useState(false);
    // Pricing State
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Dynamic Pricing
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans');
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data);
                }
            } catch (error) {
                console.error("Failed to fetch plans");
            }
        };
        fetchPlans();
    }, []);

    const getPlanPrice = (planName: string) => {
        const plan = plans.find(p => p.name === planName);
        return plan ? plan.price : (planName === 'starter' ? 0 : (planName === 'professional' ? 199 : 999));
    };


    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="min-h-screen selection:bg-blue-500/30 overflow-hidden">
            {/* View Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
                    <div className="bg-[#0B0F19] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl shadow-accent/20 animate-scale-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-xl text-white">Monthly Financial Report</h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                <ArrowRight className="rotate-45" size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                    <p className="text-sm text-slate-300/70 mb-1">Total Sales</p>
                                    <p className="text-2xl font-bold text-primary">₹1,24,500</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-sm text-emerald-200/70 mb-1">Net Profit</p>
                                    <p className="text-2xl font-bold text-emerald-400">₹45,200</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider opacity-70">Top Transactions</h4>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Rahul S.', amount: '+₹12,000', type: 'Payment' },
                                        { name: 'Inventory Restock', amount: '-₹45,000', type: 'Expense' },
                                        { name: 'Priya M.', amount: '+₹8,500', type: 'Payment' },
                                    ].map((tx, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {tx.amount.startsWith('+') ? '↓' : '↑'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{tx.name}</p>
                                                    <p className="text-xs text-slate-300/60">{tx.type}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{tx.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setIsReportModalOpen(false)} className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            <section className="relative pt-20 pb-8 md:pt-48 md:pb-32 overflow-hidden bg-[#050810]">
                {/* Aurora Background */}
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.0}
                        speed={1}
                    />
                </div>

                {/* Ambient Background Overlays */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen animate-float"></div>
                </div>

                <div className="container-mobile relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-8 md:mb-20">
                        <h1 className="text-[34px] md:text-7xl font-bold text-white mb-4 md:mb-8 leading-[1.2] md:leading-[1.1] tracking-tight">
                            India's Best <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-glow">
                                Online Khata App
                            </span>
                        </h1>

                        <p className="text-slate-200/70 text-sm md:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto font-medium">
                            The most premium and secure online ledger book designed
                            for Indian businesses to track customer credits and collect payments faster.
                        </p>

                        <div className="flex flex-row items-center justify-center gap-3 md:gap-4">
                            <Link href="/register" className="bg-accent text-white px-5 py-3 md:px-8 md:py-4 rounded-2xl font-bold text-sm md:text-lg hover:bg-accent/90 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] flex items-center gap-2 group whitespace-nowrap">
                                Get Started Free <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button onClick={scrollToFeatures} className="bg-white/5 border border-white/10 text-white px-5 py-3 md:px-8 md:py-4 rounded-2xl font-bold text-sm md:text-lg hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2 group whitespace-nowrap">
                                Explore <Play size={16} className="fill-white" />
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-12 flex flex-col items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0F19] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />)}
                                </div>
                                <p className="text-slate-300/60 text-sm">Trusted by <span className="text-white font-bold">10,000+</span> vendors across India</p>
                            </div>
                        </div>
                    </div>

                    {/* App Mockup */}
                    <div className="relative max-w-5xl mx-auto animate-fade-in-up">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#0B0F19] rounded-[2rem] border border-white/10 p-2 md:p-4 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Dashboard Preview Cards - Integrated within the "mockup" effect */}
                            <div className="hidden md:flex flex-col gap-4">
                                <div className="glass-card p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent">
                                    <p className="text-[10px] text-slate-300/50 uppercase font-bold tracking-widest mb-1">Daily Collections</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-xl font-bold text-white">₹14,240</p>
                                        <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+12%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full w-[70%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-2xl border border-white/5 flex-1 flex flex-col">
                                    <p className="text-[10px] text-slate-300/50 uppercase font-bold tracking-widest mb-4">Customer Growth</p>
                                    <div className="flex-1 flex items-end gap-2">
                                        {[60, 40, 80, 50, 90, 60, 75].map((h, i) => (
                                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/20 to-indigo-600/20 rounded-t-md hover:from-blue-500 hover:to-indigo-500 transition-all duration-500 cursor-pointer" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Center App Preview */}
                            <div className="md:col-span-2 relative aspect-[14/10] bg-[#0F172A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/app">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>

                                {/* Status Bar */}
                                <div className="h-6 bg-white/5 border-b border-white/5 px-4 flex justify-between items-center">
                                    <div className="text-[8px] text-white/40 font-bold">10:45 AM</div>
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                        <div className="w-3 h-1.5 rounded-sm bg-blue-500/60"></div>
                                    </div>
                                </div>

                                {/* Mock UI Elements */}
                                <div className="p-4 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg">K</div>
                                            <span className="text-[10px] font-bold text-white/60">Kada Ledger</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-20 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">Add Customer </div>
                                            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                                                <Plus size={12} className="text-white/40" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { n: 'Rahul Sharma', r: 'Payment Received', a: '+₹5,000', img: 'bg-blue-500', t: '5m ago' },
                                            { n: 'Priya Singh', r: 'Invoice Sent', a: '₹2,200', img: 'bg-purple-500', t: '12m ago' },
                                            { n: 'Amit Kumar', r: 'Payment Pending', a: '₹12,000', img: 'bg-indigo-500', t: '1h ago' },
                                            { n: 'Modern Bakers', r: 'Balance Updated', a: '₹4,500', img: 'bg-emerald-500', t: '2h ago' },
                                        ].map((u, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group/item">
                                                <div className={`w-9 h-9 rounded-full ${u.img} flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover/item:scale-110 transition-transform`}>
                                                    {u.n.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-xs font-bold text-white group-hover/item:text-blue-300 transition-colors">{u.n}</h4>
                                                        <span className="text-[8px] text-white/30">{u.t}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-300/50">{u.r}</p>
                                                </div>
                                                <span className={`text-xs font-bold ${u.a.includes('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{u.a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Bar Mockup */}
                                <div className="absolute bottom-0 w-full h-12 bg-[#0B0F19]/90 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3: Balance */}
                            <div className="glass-card p-8 md:row-span-2 flex flex-col animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <h3 className="text-sm font-medium text-slate-300/80 mb-2">Total Balance</h3>
                                <div className="flex items-end gap-3 mb-8">
                                    <span className="text-5xl font-bold text-white">₹78,500</span>
                                    <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded-lg mb-2">▲ 16%</span>
                                </div>

                                <div className="flex-1 flex items-end justify-between gap-1.5 h-[160px] md:h-[200px]">
                                    {[40, 65, 30, 85, 50, 90, 60].map((h, i) => (
                                        <div key={i} className="flex-1 bg-white/10 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-indigo-600/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            {i === 5 && <div className="absolute inset-0 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6 text-[10px] text-slate-300/30 font-bold uppercase tracking-tighter">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>

                            {/* Card 4: Data Analysis */}
                            <div className="md:col-span-3 glass-card p-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <TrendingUp className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Advanced Recovery & Growth Analysis</h3>
                                        <p className="text-sm text-slate-300/40">Real-time financial insights for your business</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="font-bold text-white bg-accent px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                                >
                                    View Full Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PARTNERS */}
            <section className="py-6 md:py-10 border-t border-white/5 border-b bg-[#0B0F19]">
                <div className="container-mobile">
                    <div className="relative w-full overflow-hidden">
                        <div className="flex w-max animate-marquee gap-12 md:gap-24 opacity-50 hover:opacity-100 transition-opacity duration-500">
                            {[...Array(2)].map((_, widthIndex) => (
                                <div key={widthIndex} className="flex gap-12 md:gap-24 items-center shrink-0">
                                    {['Sharma General Store', 'Kerala Mart', 'Gupta Traders', 'Lakshmi Textiles', 'Deccan Spices', 'Yummy Resturant', 'Sai Electronics'].map((logo, i) => (
                                        <div key={i} className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 font-serif tracking-widest whitespace-nowrap">
                                            {logo}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES / ABOUT */}
            {/* CORE FEATURES SECTION */}
            <section className="py-16 md:py-40 relative" id="features">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="container-mobile relative z-10">
                    <div className="text-center mb-10 md:mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            <Zap size={14} /> Powering Modern India
                        </div>
                        <h2 className="text-3xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Everything you need to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Scale Digitally</span>
                        </h2>
                        <p className="text-slate-200/70 text-lg md:text-xl leading-relaxed font-light">
                            Stop relying on paper ledgers and confusing spreadsheets. Kada Ledger brings all your business financial needs into one secure, easy-to-use mobile application.
                            Manage staff, track customer credits, and generate invoices in seconds.
                        </p>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
                        {/* 1. Team Management (Large Left) */}
                        <div className="md:col-span-7 group relative overflow-hidden glass-card rounded-[2.5rem] border border-white/5 p-8 md:p-12 flex flex-col justify-between hover:border-primary/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity">
                                <Users size={300} strokeWidth={1} className="text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-primary mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Team Management</h3>
                                <p className="text-slate-200/60 text-lg max-w-md leading-relaxed">
                                    Add staff and assign specific roles to manage your shop effectively. Control access and track staff performance in real-time.
                                </p>
                            </div>
                            {/* Mock Staff List Visual */}
                            <div className="mt-12 flex flex-wrap gap-4">
                                {[
                                    { name: 'Arjun', role: 'Manager' },
                                    { name: 'Sita', role: 'Sales' },
                                    { name: 'Kushal', role: 'Staff' }
                                ].map((staff, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500"></div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{staff.name}</p>
                                            <p className="text-[10px] text-primary">{staff.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Data Security (Right Top) */}
                        <div className="md:col-span-5 group relative overflow-hidden glass-card rounded-[2.5rem] border border-white/5 p-8 md:p-10 flex flex-col hover:border-emerald-500/30 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Data Security</h3>
                            <p className="text-slate-200/60 leading-relaxed mb-8">
                                Automatic backups and industrial-grade encryption keep your business data safe and always recoverable.
                            </p>
                            <div className="mt-auto flex justify-center py-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold animate-pulse">
                                    <CheckCircle2 size={20} /> Encrypted & Secure
                                </div>
                            </div>
                        </div>

                        {/* 3. GST Billing (Left Bottom) */}
                        <div className="md:col-span-5 group relative overflow-hidden glass-card rounded-[2.5rem] border border-white/5 p-8 md:p-10 flex flex-col hover:border-purple-500/30 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">GST Billing</h3>
                            <p className="text-slate-200/60 leading-relaxed mb-6">
                                Generate professional, GST-compliant invoices in a single tap. Manage tax filings with ease.
                            </p>
                            {/* Mock Invoice Visual */}
                            <div className="mt-auto bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-2 bg-white/10 rounded-full"></div>
                                    <div className="w-8 h-2 bg-purple-500/30 rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-1 bg-white/5 rounded-full"></div>
                                    <div className="w-2/3 h-1 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Mobile First (Right Bottom - Large) */}
                        <div className="md:col-span-7 group relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-[2.5rem] border border-primary/10 p-8 md:p-12 flex flex-col md:flex-row gap-12 hover:border-primary/30 transition-all duration-500">
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-primary mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Smartphone size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Mobile First</h3>
                                <p className="text-slate-200/60 text-lg leading-relaxed">
                                    A slick, fast application optimized for any Android or iOS device. Manage your business from anywhere in the world.
                                </p>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                {/* Simple Mock Phone */}
                                <div className="w-32 h-64 bg-[#0B0F19] border-[6px] border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden group-hover:rotate-6 transition-transform duration-700">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/10 rounded-b-xl"></div>
                                    <div className="p-4 pt-10 space-y-3">
                                        <div className="w-12 h-12 rounded-lg bg-accent/20 mx-auto"></div>
                                        <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                        <div className="w-1/2 h-2 bg-white/5 rounded-full mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST SECTION */}
            {/* NUMBERS SECTION */}
            <section className="py-10 md:py-24 relative overflow-hidden">
                <div className="container-mobile">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                        {[
                            { label: "Active Merchants", value: "100K+" },
                            { label: "Daily Transactions", value: "₹50Cr+" },
                            { label: "Trust Score", value: "4.9/5" },
                            { label: "India Locations", value: "500+" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="text-2xl md:text-5xl font-extrabold text-white mb-1 md:mb-2 text-glow group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
                                <div className="text-[10px] md:text-sm text-blue-300/50 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING PREVIEW SECTION */}
            <section className="py-16 md:py-32 relative overflow-hidden" id="pricing">
                <div className="container-mobile relative z-10">
                    <div className="glass-card rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 p-8 md:p-20 overflow-hidden relative">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                                    <CreditCard size={14} /> Transparent Pricing
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-[1.1]">
                                    Plans designed to <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Scale with You</span>
                                </h2>
                                <p className="text-slate-200/60 text-lg md:text-xl leading-relaxed mb-10">
                                    Whether you're a small roadside shop or a multi-city retail chain, we have a plan that fits your business needs. No hidden fees, just pure value.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/pricing" className="bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-accent/90 transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 group">
                                        View All Plans <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href="/register?plan=trial" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center">
                                        Start 14-Day Free Trial
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: 'Starter',
                                        desc: 'Perfect for local merchants exploring digital ledger solutions.',
                                        icon: <Smartphone className="text-primary" />
                                    },
                                    {
                                        title: 'Premium',
                                        desc: 'Advanced tools for growing businesses with staff management.',
                                        icon: <Crown className="text-indigo-400" />
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                            {item.icon}
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-sm text-slate-200/40 leading-relaxed font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 md:py-24 relative overflow-hidden">
                <div className="container-mobile max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 md:mb-16 text-center">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'What is Kada Ledger?',
                                a: 'Kada Ledger is India\'s most premium digital khata and credit management app. It replaces traditional paper ledgers with a secure, cloud-based system that helps you track customer dues, manage staff, and automate payment reminders.'
                            },
                            {
                                q: 'Is my data safe if I lose my phone?',
                                a: 'Yes, 100%. Your data is securely synced to our cloud servers in real-time. Even if you lose your phone, you can simply log in to your account on a new device using your registered phone number, and all your data will be restored instantly.'
                            },
                            {
                                q: 'How do WhatsApp reminders work?',
                                a: 'Kada Ledger allows you to send automated or manual payment reminders directly to your customers via WhatsApp. This professional approach helps you collect payments 3x faster without the need for awkward personal follow-ups.'
                            },
                            {
                                q: 'Can I accept online payments?',
                                a: 'Absolutely. You can send payment links along with invoices or reminders. Customers can pay you using UPI (Google Pay, PhonePe, Paytm), Credit Cards, or Net Banking, and the amount is settled directly to your bank account.'
                            },
                            {
                                q: 'Is it suitable for my business?',
                                a: 'Kada Ledger is built for any business that offers credit (udhar). It is perfect for Kirana stores, Wholesalers, Distributors, Mobile Shops, Pharmacies, Garment Stores, and even Freelancers.'
                            },
                            {
                                q: 'Is it GST compliant?',
                                a: 'Yes, our invoicing system is fully GST compliant. You can generate professional invoices with your branding and easily export GSTR-1 and GSTR-3B reports for seamless tax filing.'
                            },
                            {
                                q: 'How much does it cost?',
                                a: `We offer a feature-rich "Starter" plan that is free forever for small businesses. for advanced features like Staff Management, Custom Branding, and Priority Support, our Premium plans start at just ₹${getPlanPrice('professional')}/month.`
                            }
                        ].map((faq, i) => (
                            <div key={i} className="glass-panel border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-lg text-slate-200">{faq.q}</span>
                                    <ChevronDown className={`text-slate-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <div
                                    className={`px-6 text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOWNLOAD CTA */}
            <section className="py-12 md:py-20 relative overflow-hidden">
                <div className="container-mobile">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden border border-white/10 text-center">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to grow your business?</h2>
                            <p className="text-slate-200/70 text-lg mb-12">
                                Join 10,000+ merchants who are already using Kada Ledger to manage their credits
                                and payments more effectively. Download the app today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                {/* Google Play Button */}
                                <Link
                                    href="#"
                                    className="group relative px-8 py-4 bg-black hover:bg-gray-900 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-blue-500/20 border border-white/10 flex items-center gap-4 min-w-[200px]"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#32BBFF" />
                                        <path d="M14.5 12.707l3.607 3.606-10.49 5.873a1.004 1.004 0 01-.618.001l10.5-5.874-3-3.006z" fill="#32BBFF" />
                                        <path d="M18.106 16.313l3.888-2.178a1 1 0 000-1.77l-3.888-2.178-3.606 3.606 3.606 3.606v-.086z" fill="#32BBFF" />
                                        <path d="M14.5 11.293L7.617 4.314 18.106 10.187l-3.606 3.606z" fill="#32BBFF" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] text-white/70 font-medium">GET IT ON</div>
                                        <div className="text-lg font-bold text-white">Google Play</div>
                                    </div>
                                </Link>

                                {/* App Store Button */}
                                <Link
                                    href="#"
                                    className="group relative px-8 py-4 bg-black hover:bg-gray-900 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-indigo-500/20 border border-white/10 flex items-center gap-4 min-w-[200px]"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] text-white/70 font-medium">Download on the</div>
                                        <div className="text-lg font-bold text-white">App Store</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Abstract Background Decor */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-20"></div>
                    </div>
                </div>
            </section>
        </main>
    );
}
