'use client';

import { CheckCircle2, Star, Zap, Shield, Crown, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';
import { useState, useEffect } from 'react';

const PLAN_META: Record<string, {
    icon: typeof Crown;
    color: string;
    iconBg: string;
    checkColor: string;
    buttonClass: string;
    badge?: string;
    badgeClass?: string;
    cardClass: string;
    label: string;
    intervalLabel: string;
    ctaText: string;
}> = {
    FREE: {
        icon: Star,
        color: 'text-emerald-400',
        iconBg: 'bg-white/5',
        checkColor: 'text-emerald-500',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30',
        cardClass: 'border-white/5 hover:border-emerald-500/20',
        label: 'Starter',
        intervalLabel: 'Free forever',
        ctaText: 'Start Free',
    },
    MONTHLY: {
        icon: Zap,
        color: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
        checkColor: 'text-blue-400',
        buttonClass: 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30',
        badge: 'Popular',
        badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        cardClass: 'border-blue-600/30 bg-blue-600/5 shadow-2xl shadow-blue-900/20 transform md:scale-[1.02]',
        label: 'Monthly',
        intervalLabel: '/ month',
        ctaText: 'Get Started',
    },
    YEARLY: {
        icon: Crown,
        color: 'text-purple-400',
        iconBg: 'bg-purple-500/20',
        checkColor: 'text-purple-400',
        buttonClass: 'bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/30',
        badge: 'Save ~16%',
        badgeClass: 'bg-gradient-to-r from-purple-600 to-pink-600',
        cardClass: 'border-purple-600/20 hover:border-purple-500/40',
        label: 'Yearly',
        intervalLabel: '/ year',
        ctaText: 'Get Yearly',
    },
    LIFETIME: {
        icon: Sparkles,
        color: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        checkColor: 'text-amber-400',
        buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-xl shadow-amber-600/30',
        badge: 'Best Value',
        badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
        cardClass: 'border-amber-600/30 bg-gradient-to-br from-amber-600/10 to-orange-600/5 hover:border-amber-500/40',
        label: 'Lifetime',
        intervalLabel: 'one-time',
        ctaText: 'Get Lifetime Access',
    },
};

const PLAN_ORDER = ['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'];

export default function PricingPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans');
                if (res.ok) {
                    const data = await res.json();
                    // Sort by canonical order
                    const sorted = (data as any[])
                        .filter((p: any) => PLAN_ORDER.includes(String(p.id || p.name || '').toUpperCase()))
                        .sort((a: any, b: any) =>
                            PLAN_ORDER.indexOf(String(a.id || a.name).toUpperCase()) -
                            PLAN_ORDER.indexOf(String(b.id || b.name).toUpperCase())
                        );
                    setPlans(sorted);
                }
            } catch (error) {
                console.error("Failed to fetch plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
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

                <div className="container-width relative z-10 px-4 text-center">
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
                </div>
            </section>

            <section className="relative z-10 px-4 pb-20 md:pb-32">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-400" size={32} />
                    </div>
                ) : (
                    <div className="container-width max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                        {plans.map((plan) => {
                            const key = String(plan.id || plan.name).toUpperCase();
                            const meta = PLAN_META[key] || PLAN_META.FREE;
                            const Icon = meta.icon;
                            const features: string[] = plan.features || [];
                            const isFree = key === 'FREE';

                            return (
                                <div
                                    key={plan.id}
                                    className={`glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col transition-all duration-500 relative ${meta.cardClass}`}
                                >
                                    {/* Badge */}
                                    {meta.badge && (
                                        <div className={`absolute top-0 right-6 md:right-8 -translate-y-1/2 ${meta.badgeClass} text-white text-[9px] md:text-[10px] uppercase tracking-widest font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg`}>
                                            {meta.badge}
                                        </div>
                                    )}

                                    {/* Icon + Name */}
                                    <div className="mb-6">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${meta.iconBg} flex items-center justify-center ${meta.color} mb-4`}>
                                            <Icon size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{meta.label}</h3>
                                        <p className="text-blue-200/50 text-xs md:text-sm">
                                            {plan.description || ''}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        {isFree ? (
                                            <>
                                                <span className="text-4xl md:text-5xl font-bold text-white">Free</span>
                                                <span className="text-blue-200/50 ml-2 text-sm">forever</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-4xl md:text-5xl font-bold text-white">
                                                    ₹{Number(plan.price).toLocaleString()}
                                                </span>
                                                <span className="text-blue-200/50 ml-2 text-sm">{meta.intervalLabel}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8 text-left flex-1">
                                        {features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/80 text-xs md:text-sm font-medium">
                                                <CheckCircle2 size={14} className={`${meta.checkColor} shrink-0 md:w-4 md:h-4`} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link
                                        href={`/register?plan=${key}`}
                                        className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl text-white font-bold text-sm md:text-base text-center transition-all ${meta.buttonClass}`}
                                    >
                                        {meta.ctaText}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
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
