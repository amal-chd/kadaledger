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
    CreditCard
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
    // FAQ State
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [isScrolled, setIsScrolled] = useState(false);
    // Pricing State
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handlePayment = async (plan: 'starter' | 'professional' | 'business', amount: number) => {
        const res = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
        });
        const order = await res.json();

        const options = {
            key: "rzp_live_RS5k4uDUocwqK6",
            amount: order.amount,
            currency: "INR",
            name: "Kada Ledger",
            description: `Subscription for ${plan} plan`,
            order_id: order.id,
            handler: async function (response: any) {
                const verifyRes = await fetch('/api/payments/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status === 'success') {
                    alert('Payment Successful! Plan activated.');
                } else {
                    alert('Payment verification failed.');
                }
            },
            theme: {
                color: "#2563EB"
            }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
    };


    return (
        <main className="min-h-screen selection:bg-blue-500/30 overflow-hidden">

            {/* HERO SECTION */}
            <section className="relative pt-36 pb-12 md:pt-48 md:pb-32 overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen animate-float"></div>
                </div>

                <div className="container-width relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-10 md:mb-20">


                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 md:mb-8 leading-[1.1] tracking-tight">
                            We're all about <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-glow">
                                helping your business grow!
                            </span>
                        </h1>

                        <p className="text-blue-100/90 text-base md:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto font-medium">
                            Explore the exceptional tools offered by Kada Ledger designed to streamline your
                            business operations and monitor your financial progress with ease.
                        </p>

                        <div className="flex flex-row items-center justify-center gap-3 md:gap-4">
                            <Link href="/register" className="bg-blue-600 text-white px-5 py-3 md:px-8 md:py-4 rounded-2xl font-bold text-sm md:text-lg hover:bg-blue-700 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] flex items-center gap-2 group whitespace-nowrap">
                                Get Started
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="flex items-center gap-2 md:gap-3 px-4 py-3 md:px-8 md:py-4 rounded-2xl text-white font-medium hover:bg-white/5 transition-all text-sm md:text-lg whitespace-nowrap">
                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                    <Play size={14} fill="white" className="md:w-4 md:h-4" />
                                </span>
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* DASHBOARD GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto perspective-1000">

                        {/* Card 1: User Signups */}
                        <div className="glass-card p-8 flex flex-col justify-between h-[200px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div>
                                <h3 className="text-sm font-medium text-blue-200/80 mb-2">Total Customers</h3>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-white">10,800</span>
                                    <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-lg mb-1">▲ 32%</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-blue-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Card 2: Members List */}
                        <div className="glass-card p-0 overflow-hidden md:row-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-white">Recent Transactions</h3>
                                <span className="text-xs text-slate-400">All ▼</span>
                            </div>
                            <div className="p-4 space-y-4">
                                {[
                                    { n: 'Rahul Sharma', r: 'Payment Received', a: '+₹5,000', img: 'bg-blue-500' },
                                    { n: 'Priya Singh', r: 'Invoice Sent', a: '₹2,200', img: 'bg-purple-500' },
                                    { n: 'Amit Kumar', r: 'Payment Pending', a: '₹12,000', img: 'bg-indigo-500' },
                                    { n: 'Sneha Gupta', r: 'New Customer', a: '-', img: 'bg-green-500' },
                                ].map((u, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className={`w-10 h-10 rounded-full ${u.img} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                                            {u.n.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{u.n}</h4>
                                            <p className="text-xs text-blue-200/70">{u.r}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${u.a.includes('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{u.a}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card 3: Balance */}
                        <div className="glass-card p-8 md:row-span-2 flex flex-col animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-sm font-medium text-blue-200/80 mb-2">Total Balance</h3>
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-5xl font-bold text-white">₹78,500</span>
                                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded-lg mb-2">▲ 16%</span>
                            </div>

                            <div className="flex-1 flex items-end justify-between gap-2 h-[200px]">
                                {[40, 65, 30, 85, 50, 90, 60].map((h, i) => (
                                    <div key={i} className="w-full bg-white/5 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                                        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-blue-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        {i === 5 && <div className="absolute top-0 w-full h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-slate-500 font-medium uppercase">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>

                        {/* Card 4: Data Analysis */}
                        <div className="glass-card p-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <TrendingUp className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Recovery Rate</h3>
                                    <p className="text-xs text-blue-200/70">Analysis</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-white bg-white/10 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
                                View Report
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* PARTNERS */}
            <section className="py-6 md:py-10 border-t border-white/5 border-b bg-[#0B0F19]">
                <div className="container-width">
                    <div className="relative w-full overflow-hidden">
                        <div className="flex w-max animate-marquee gap-12 md:gap-24 opacity-50 hover:opacity-100 transition-opacity duration-500">
                            {[...Array(2)].map((_, widthIndex) => (
                                <div key={widthIndex} className="flex gap-12 md:gap-24 items-center shrink-0">
                                    {['Alpha Retail', 'BetaMart', 'Gamma Corp', 'Delta Traders', 'Epsilon Supplies', 'Zeta Goods', 'Omega Mart'].map((logo, i) => (
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
            <section className="py-16 md:py-32 relative">
                {/* Glow */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container-width">
                    <div className="flex flex-col md:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Smart Financial Tools <br />
                                <span className="text-blue-500">For Smart Businesses</span>
                            </h2>
                            <p className="text-blue-100/80 leading-loose mb-10 text-lg font-light">
                                Stop relying on paper ledgers and confusing spreadsheets. Kada Ledger brings all your business financial needs into one secure, easy-to-use mobile application.
                                Manage staff, track customer credits, and generate invoices in seconds.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                {[
                                    'Digital Khata Book',
                                    'Automated Reminders',
                                    'GST Invoicing',
                                    'Daily Reports'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                        </div>
                                        <span className="font-medium text-blue-50">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                See Full Features
                            </button>
                        </div>

                        {/* Feature Visual */}
                        <div className="flex-1 relative h-[500px] w-full">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[3rem] blur-3xl"></div>
                            <div className="glass-panel w-full h-full relative border border-white/10 p-8 flex flex-col justify-center items-center gap-8">
                                <div className="w-64 h-64 rounded-full border-[20px] border-white/5 relative flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0B0F19]">
                                    <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 256 256">
                                        <circle cx="128" cy="128" r="100" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-white/5" />
                                        <circle cx="128" cy="128" r="100" stroke="currentColor" strokeWidth="20" fill="transparent" strokeDasharray="500 628" strokeDashoffset="0" strokeLinecap="round" className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                    </svg>
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-white mb-2">750</div>
                                        <div className="text-sm text-green-400 font-bold uppercase tracking-widest">Excellent</div>
                                    </div>
                                </div>
                                <p className="text-center text-blue-200/80 max-w-xs text-sm">
                                    Your business credit score updates in real-time as you manage transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CAPABILITIES */}
            <section className="py-12 md:py-24 bg-white/5 border-t border-white/5">
                <div className="container-width">
                    <div className="text-center mb-10 md:mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Power your Growth Engine</h2>
                        <p className="text-blue-200/80 text-lg max-w-2xl mx-auto">
                            Every feature is designed to save you time and increase your cash flow.
                        </p>
                    </div>

                    {/* Mobile: Creative Horizontal Scroll with Peeking Cards */}
                    <div className="md:hidden flex items-center gap-2 mb-4 text-blue-300/60 text-sm font-medium animate-pulse px-2">
                        <span>Swipe to explore</span>
                        <ArrowRight size={14} />
                    </div>
                    <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 scrollbar-hide items-stretch">
                        {[
                            { icon: Users, title: 'Customer Management', desc: 'Keep track of every customer interaction and credit history.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { icon: TrendingUp, title: 'Smart Analytics', desc: 'Visual reports that show you exactly where your money is going.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { icon: FileText, title: 'Instant Invoicing', desc: 'Create and share professional bills on WhatsApp instantly.', color: 'text-green-400', bg: 'bg-green-500/10' }
                        ].map((item, i) => (
                            <div key={i} className="min-w-[50vw] md:min-w-0 snap-center shrink-0 glass-card p-5 md:p-8 group hover:-translate-y-2 transition-transform duration-300 border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                                {/* Decorative Gradient Blob properly positioned behind content */}
                                <div className={`absolute -right-10 -top-10 w-32 h-32 ${item.bg.replace('/10', '/5')} rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>

                                <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                                    <item.icon size={20} className="md:w-7 md:h-7" />
                                </div>
                                <h3 className="relative z-10 text-lg md:text-xl font-bold text-white mb-2 md:mb-4">{item.title}</h3>
                                <p className="relative z-10 text-blue-100/70 text-sm leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="py-12 md:py-24 relative overflow-hidden" id="pricing">
                <div className="container-width">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Find the Right Plan</h2>
                        <p className="text-blue-200/80 text-lg mb-8">
                            Start with our 14-day free trial. No credit card required.
                        </p>

                        {/* Toggle */}
                        <div className="inline-flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md relative">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Billed Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Billed Yearly
                            </button>
                        </div>
                    </div>

                    {/* Mobile: Horizontal Scroll with Snap | Desktop: Grid */}
                    <div className="md:hidden flex items-center gap-2 mb-4 text-blue-300/60 text-sm font-medium animate-pulse px-2">
                        <span>Swipe to see plans</span>
                        <ArrowRight size={14} />
                    </div>
                    <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 scrollbar-hide items-stretch">
                        {/* Plan 1: Starter (Free Trial) */}
                        <div className="min-w-[50vw] md:min-w-0 snap-center shrink-0 glass-card p-5 md:p-8 border hover:border-blue-500/30 transition-all flex flex-col h-full">
                            <div className="mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Starter</h3>
                                <p className="text-blue-200/70 text-xs md:text-sm">Perfect for trying out Kada Ledger.</p>
                            </div>
                            <div className="mb-4 md:mb-6">
                                <span className="text-3xl md:text-4xl font-bold text-white">Free</span>
                                <span className="text-blue-200/60 text-xs md:text-sm font-medium"> / 14 Days</span>
                            </div>
                            <Link href="/register?plan=trial" className="w-full py-2.5 md:py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm md:text-base hover:bg-white/10 transition-colors mb-6 md:mb-8 block text-center">
                                Start Free Trial
                            </Link>
                            <ul className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-1">
                                <li className="flex items-center gap-3 text-blue-100/80 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> 1 User
                                </li>
                                <li className="flex items-center gap-3 text-blue-100/80 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> Basic Reports
                                </li>
                                <li className="flex items-center gap-3 text-blue-100/80 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> 100 Customers
                                </li>
                            </ul>
                        </div>

                        {/* Plan 2: Professional (Highlighted) */}
                        <div className="min-w-[50vw] md:min-w-0 snap-center shrink-0 glass-card p-5 md:p-8 border-2 border-blue-500 relative transform scale-100 md:scale-105 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-[#0B0F19]/80 flex flex-col h-full pt-12 md:pt-8">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 md:px-4 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg whitespace-nowrap z-20">
                                Most Popular
                            </div>
                            <div className="mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Professional</h3>
                                <p className="text-blue-200/70 text-xs md:text-sm">For growing businesses.</p>
                            </div>
                            <div className="mb-4 md:mb-6">
                                <span className="text-3xl md:text-5xl font-bold text-white">₹{billingCycle === 'monthly' ? '199' : '1990'}</span>
                                <span className="text-blue-200/60 text-xs md:text-sm font-medium"> / {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <button
                                onClick={() => handlePayment('professional', billingCycle === 'monthly' ? 199 : 1990)}
                                className="w-full py-2.5 md:py-3 rounded-xl bg-blue-600 text-white font-bold text-sm md:text-base hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 mb-6 md:mb-8"
                            >
                                Get Started
                            </button>
                            <ul className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-1">
                                <li className="flex items-center gap-3 text-white text-xs md:text-sm">
                                    <div className="bg-blue-500 rounded-full p-0.5"><CheckCircle2 size={10} className="md:w-3 md:h-3 text-white" strokeWidth={4} /></div>
                                    <span className="font-bold">Everything in Starter</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> Up to 3 Users
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> WhatsApp Reminders
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-blue-500" /> 5GB Storage
                                </li>
                            </ul>
                        </div>

                        {/* Plan 3: Ultimate */}
                        <div className="min-w-[50vw] md:min-w-0 snap-center shrink-0 glass-card p-5 md:p-8 border hover:border-purple-500/30 transition-all flex flex-col h-full">
                            <div className="mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Business</h3>
                                <p className="text-blue-200/70 text-xs md:text-sm">For scaling operations.</p>
                            </div>
                            <div className="mb-4 md:mb-6">
                                <span className="text-3xl md:text-4xl font-bold text-white">₹{billingCycle === 'monthly' ? '499' : '4990'}</span>
                                <span className="text-blue-200/60 text-xs md:text-sm font-medium"> / {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                            <button
                                onClick={() => handlePayment('business', billingCycle === 'monthly' ? 499 : 4990)}
                                className="w-full py-2.5 md:py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm md:text-base hover:bg-white/10 transition-colors mb-6 md:mb-8"
                            >
                                Contact Sales / Upgrade
                            </button>
                            <ul className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-purple-500" /> Unlimited Users
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-purple-500" /> Advanced Analytics
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-purple-500" /> Custom Invoicing
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                                    <CheckCircle2 size={14} className="md:w-4 md:h-4 text-purple-500" /> Priority Support
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 md:py-24 relative overflow-hidden">
                <div className="container-width max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 md:mb-16 text-center">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        {[
                            { q: 'Is my data secure with Kada Ledger?', a: 'Absolutely. We use bank-grade 256-bit encryption to store your data. Your financial information is never shared with third parties without your explicit consent.' },
                            { q: 'Can I use the app offline?', a: 'Yes! You can record transactions offline. The app automatically syncs your data to the cloud once you are back online.' },
                            { q: 'Is it GST compliant?', a: 'Yes, all invoices generated are fully GST compliant. You can easily export GSTR-1 and GSTR-3B reports for your tax filings.' },
                            { q: 'How much does it cost?', a: 'The basic version is free forever. Our Premium plan with advanced analytics starts at just ₹99/month.' }
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
                <div className="container-width">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden border border-white/10 text-center">
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to grow your business?</h2>
                            <p className="text-blue-100 text-lg mb-12">
                                Join 2000+ businesses who trust Kada Ledger for their daily financial operations.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {/* App Store Button */}
                                <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-colors border border-white/10 group">
                                    <svg className="w-8 h-8 fill-current group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.07-.53-3.15.53-1.39.43-2.12-.45-3.08-1.57-4.14-5.22-3.41-11.45 1.57-11.75 1.25-.09 2.22.75 3 1 .84.18 1.94-.9 3.25-.9 1.35.03 2.53.58 3.32 1.63-2.91 1.6-2.41 5.48.56 6.69-.62 1.66-1.5 3.32-2.39 4.07zm-4.38-16.14c.6-1.72 2.66-3.14 2.53.4-1.84.1-3.66 1.4-2.53-.4z" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] leading-none text-slate-400 mb-0.5">Download on the</div>
                                        <div className="text-lg leading-none font-medium text-white">App Store</div>
                                    </div>
                                </button>

                                {/* Play Store Button */}
                                <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-colors border border-white/10 group">
                                    <svg className="w-8 h-8 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                                        <path d="M3.609 1.814L13.792 12 3.61 22.186a1.417 1.417 0 01-1.332-1.92L3.609 1.814z" fill="#2196F3" />
                                        <path d="M13.792 12L20.8 15.66l-1.932-3.66L13.792 12z" fill="#FFC107" />
                                        <path d="M3.609 22.186L13.792 12 20.8 15.66 6.075 23.334a2.227 2.227 0 01-2.466-1.148z" fill="#F44336" />
                                        <path d="M13.792 12L3.609 1.814A2.228 2.228 0 016.075.666L20.8 8.34" fill="#4CAF50" />
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-[10px] leading-none text-slate-400 mb-0.5">GET IT ON</div>
                                        <div className="text-lg leading-none font-medium text-white">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Glows */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </section>

        </main>
    );
}
