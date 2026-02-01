'use client';

import { CheckCircle2, Star, Zap, Shield, Crown } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';
import { useState, useEffect } from 'react';

const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Kada Ledger Subscription",
    "description": "Digital credit book and ledger management for businesses.",
    "brand": {
        "@type": "Brand",
        "name": "Kada Ledger"
    },
    "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "6499",
        "priceCurrency": "INR",
        "offerCount": "3"
    }
};

export default function PricingPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

    const getPlanPrice = () => {
        const planName = billingCycle === 'monthly' ? 'professional' : 'professional_yearly';
        const plan = plans.find(p => p.name === planName);
        return plan ? plan.price : (billingCycle === 'monthly' ? 199 : 1999);
    };

    const getPlanInterval = () => billingCycle === 'monthly' ? '/ month' : '/ year';

    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
            />

            {/* Hero Section with Aurora */}
            <section className="relative pt-24 pb-12 md:pt-48 md:pb-24">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-mobile relative z-10 px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
                        <Zap size={14} className="fill-blue-400" /> Flexible Plans
                    </div>
                    <h1 className="text-3xl md:text-7xl font-bold text-white mb-6 md:mb-8 leading-[1.2] md:leading-[1.1]">
                        Simple, Transparent<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pricing for Bharat</span>
                    </h1>
                    <p className="text-blue-100/70 text-sm md:text-xl leading-relaxed max-w-2xl mx-auto font-medium mb-10">
                        Choose the plan that best fits your business needs.
                        No hidden fees, no complexity.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-blue-200/50'}`}>Monthly</span>
                        <div
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-blue-600/20 border border-blue-500/30 rounded-full relative cursor-pointer transition-colors hover:bg-blue-600/30"
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-blue-500 rounded-full transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-full' : ''}`}></div>
                        </div>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-blue-200/50'}`}>
                            Yearly <span className="text-emerald-400 text-xs">(Save ~16%)</span>
                        </span>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-4 pb-20 md:pb-32">
                <div className="container-mobile max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6">
                    {/* Basic */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 flex flex-col hover:border-blue-500/20 transition-all duration-500">
                        <div className="mb-6 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 mb-4 md:mb-4">
                                <Star size={20} className="md:w-6 md:h-6 fill-emerald-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Free Trial</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">Try all features risk-free for 14 days.</p>
                        </div>
                        <div className="mb-6 md:mb-6">
                            <span className="text-4xl md:text-5xl font-bold text-white">Free</span>
                            <span className="text-blue-200/50 ml-2 text-sm">for 14 days</span>
                        </div>
                        <ul className="space-y-3 md:space-y-3 mb-8 md:mb-8 text-left flex-1">
                            {[
                                "Unlimited Customers",
                                "Full Analytics Dashboard",
                                "WhatsApp Reminders",
                                "GST Invoicing",
                                "Multi-User Access",
                                "Priority Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/70 text-xs md:text-sm font-medium">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register?plan=trial" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-emerald-600 text-white font-bold text-sm md:text-base text-center hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Premium (Professional) */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-blue-600/30 bg-blue-600/5 relative shadow-2xl shadow-blue-900/20 transform md:scale-105 flex flex-col">
                        <div className="absolute top-0 right-6 md:right-8 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] md:text-[10px] uppercase tracking-widest font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg">
                            Most Popular
                        </div>
                        <div className="mb-6 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 md:mb-4">
                                <Crown size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{billingCycle === 'monthly' ? 'Premium Monthly' : 'Premium Yearly'}</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">Everything you need to grow your business.</p>
                        </div>
                        <div className="mb-6 md:mb-6">
                            <span className="text-4xl md:text-5xl font-bold text-white">₹{getPlanPrice()}</span>
                            <span className="text-blue-200/50 ml-2 text-sm">{getPlanInterval()}</span>
                        </div>
                        <ul className="space-y-3 md:space-y-3 mb-8 md:mb-8 text-left flex-1">
                            {[
                                "Unlimited Customers",
                                "Advanced Analytics",
                                "WhatsApp Reminders",
                                "Multi-User Access",
                                "GST Invoicing",
                                "Priority Support",
                                ...(billingCycle === 'yearly' ? ["2 Months Free"] : [])
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/90 text-xs md:text-sm font-semibold">
                                    <CheckCircle2 size={14} className="text-blue-400 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href={`/register?plan=${billingCycle === 'monthly' ? 'professional' : 'professional_yearly'}`} className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 text-white font-bold text-sm md:text-base text-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
                            Get Started
                        </Link>
                    </div>

                    {/* Lifetime */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-amber-600/30 bg-gradient-to-br from-amber-600/10 to-orange-600/5 relative flex flex-col hover:border-amber-500/40 transition-all duration-500">
                        <div className="absolute top-0 right-6 md:right-8 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] md:text-[10px] uppercase tracking-widest font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg">
                            Best Value
                        </div>
                        <div className="mb-6 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4 md:mb-4">
                                <Shield size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Lifetime</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">Pay once, own forever. No recurring fees.</p>
                        </div>
                        <div className="mb-6 md:mb-6">
                            <span className="text-4xl md:text-5xl font-bold text-white">₹6,499</span>
                            <span className="text-blue-200/50 ml-2 text-sm">one-time</span>
                        </div>
                        <ul className="space-y-3 md:space-y-3 mb-8 md:mb-8 text-left flex-1">
                            {[
                                "Everything in Premium",
                                "Lifetime Updates",
                                "No Recurring Costs",
                                "Premium Support Forever",
                                "Future Features Included",
                                "One-Time Payment"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/90 text-xs md:text-sm font-semibold">
                                    <CheckCircle2 size={14} className="text-amber-400 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register?plan=lifetime" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm md:text-base text-center hover:from-amber-500 hover:to-orange-500 transition-all shadow-xl shadow-amber-600/30">
                            Get Lifetime Access
                        </Link>
                    </div>
                </div>

                {/* FAQ Link */}
                <div className="mt-20 text-center">
                    <p className="text-blue-200/40 text-sm">
                        All plans include 256-bit encryption & localized cloud backup. <br />
                        Need a custom quote? <Link href="/contact" className="text-blue-400 hover:underline">Chat with us</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
