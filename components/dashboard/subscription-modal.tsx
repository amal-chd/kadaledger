'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, X, Loader2, Zap, Crown, Sparkles } from 'lucide-react';
import Script from 'next/script';
import toast from 'react-hot-toast';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLAN_META: Record<string, {
    icon: typeof Zap;
    color: string;
    buttonClass: string;
    badge?: string;
    badgeClass?: string;
    intervalLabel: string;
}> = {
    MONTHLY: {
        icon: Zap,
        color: 'text-blue-400',
        buttonClass: 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25',
        badge: 'Popular',
        badgeClass: 'bg-blue-600',
        intervalLabel: '/ month',
    },
    YEARLY: {
        icon: Crown,
        color: 'text-purple-400',
        buttonClass: 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/25',
        badge: 'Save ~16%',
        badgeClass: 'bg-purple-600',
        intervalLabel: '/ year',
    },
    LIFETIME: {
        icon: Sparkles,
        color: 'text-amber-400',
        buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/25',
        badge: 'Best Value',
        badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
        intervalLabel: 'one-time',
    },
};

const PAID_ORDER = ['MONTHLY', 'YEARLY', 'LIFETIME'];

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

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

    // Filter to paid plans only, sorted by PAID_ORDER
    const paidPlans = plans
        .filter((p: any) => {
            const key = String(p.id || p.name || '').toUpperCase();
            return PAID_ORDER.includes(key);
        })
        .sort((a: any, b: any) =>
            PAID_ORDER.indexOf(String(a.id || a.name).toUpperCase()) -
            PAID_ORDER.indexOf(String(b.id || b.name).toUpperCase())
        );

    const handlePayment = async (planName: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("You are not logged in. Please login to continue.");
            window.location.href = '/login';
            return;
        }

        setLoadingPlan(planName);
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planName }),
            });

            if (!res.ok) throw new Error('Failed to create order');

            const order = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,
                currency: "INR",
                name: "Kada Ledger",
                description: `Subscription for ${planName} plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planType: planName
                            }),
                        });

                        if (!verifyRes.ok) {
                            const errorData = await verifyRes.json();
                            throw new Error(errorData.error || 'Verification failed');
                        }

                        const verifyData = await verifyRes.json();
                        if (verifyData.status === 'success') {
                            toast.success('Payment Successful! Plan activated.');
                            onClose();
                            window.location.href = '/dashboard';
                        } else {
                            toast.error(verifyData.message || 'Payment verification failed.');
                        }
                    } catch (err: any) {
                        toast.error(err.message || 'Verification error');
                        console.error("Verification failed", err);
                    }
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />

            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Upgrade Your Plan</h2>
                        <p className="text-slate-300/60">Choose the plan that fits your business needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        {paidPlans.map((plan) => {
                            const key = String(plan.id || plan.name).toUpperCase();
                            const meta = PLAN_META[key] || PLAN_META.MONTHLY;
                            const Icon = meta.icon;
                            const features: string[] = plan.features || [];
                            const planName = plan.name || plan.id;
                            const isLoading = loadingPlan === planName;

                            return (
                                <div
                                    key={plan.id}
                                    className={`glass-card p-6 rounded-2xl flex flex-col transition-all duration-300 relative border ${key === 'MONTHLY'
                                            ? 'border-blue-600/40 bg-blue-900/10 shadow-xl shadow-blue-900/20 md:scale-105'
                                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                        }`}
                                >
                                    {/* Badge */}
                                    {meta.badge && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${meta.badgeClass} text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full`}>
                                            {meta.badge}
                                        </div>
                                    )}

                                    <div className="mb-4 pt-2">
                                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${meta.color} mb-3`}>
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">
                                                ₹{Number(plan.price).toLocaleString()}
                                            </span>
                                            <span className="text-slate-400 text-sm">{meta.intervalLabel}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6 flex-1">
                                        {features.map((feature: string, i: number) => (
                                            <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                                                <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handlePayment(planName)}
                                        disabled={isLoading}
                                        className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${meta.buttonClass}`}
                                    >
                                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                                        {key === 'LIFETIME' ? 'Get Lifetime Access' : `Get ${plan.name}`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
