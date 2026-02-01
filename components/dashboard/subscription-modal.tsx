'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import Script from 'next/script';
import toast from 'react-hot-toast';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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

    const getPlanPrice = (planName: string, cycle: 'monthly' | 'yearly') => {
        if (planName === 'starter') return 0;
        // For professional, we check the specific plan based on cycle
        const targetPlanName = cycle === 'monthly' ? 'professional' : 'professional_yearly';
        const plan = plans.find(p => p.name === targetPlanName);
        return plan ? plan.price : (cycle === 'monthly' ? 199 : 1999);
    };

    const handlePayment = async (planName: 'starter' | 'professional') => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("You are not logged in. Please login to continue.");
            window.location.href = '/login';
            return;
        }

        const price = getPlanPrice(planName, billingCycle);

        if (planName === 'starter') {
            toast.success("Free plan activated!");
            onClose();
            return;
        }

        const actualPlanName = billingCycle === 'monthly' ? 'professional' : 'professional_yearly';

        setLoadingPlan(planName);
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: price }),
            });

            if (!res.ok) throw new Error('Failed to create order');

            const order = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,
                currency: "INR",
                name: "Kada Ledger",
                description: `Subscription for ${actualPlanName} plan`,
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
                                planType: actualPlanName
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
                            // Force redirect to dashboard to refresh state and escape onboarding if trapped
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
                        <p className="text-blue-200/60 mb-8">Choose the plan that fits your business needs.</p>

                        {/* Toggle */}
                        <div className="inline-flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Yearly (Save ~16%)
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Plan 1: Starter */}
                        <div className="glass-card p-6 border border-white/10 rounded-2xl flex flex-col hover:bg-white/5 transition-colors">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">Free</span>
                                    <span className="text-slate-400 text-sm">/ 14 days</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> 1 User</li>
                                <li className="flex gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> Basic Reports</li>
                                <li className="flex gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-blue-500 shrink-0" /> 100 Customers</li>
                            </ul>
                            <button disabled className="w-full py-3 rounded-xl border border-white/10 text-slate-400 font-bold text-sm">
                                Current Plan
                            </button>
                        </div>

                        {/* Plan 2: Premium */}
                        <div className="glass-card p-6 border-2 border-blue-500 rounded-2xl flex flex-col bg-blue-900/10 relative transform md:scale-105 shadow-xl shadow-blue-900/20">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Recommended
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-1">Premium</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        ₹{getPlanPrice('professional', billingCycle)}
                                    </span>
                                    <span className="text-slate-400 text-sm">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-white"><CheckCircle2 size={16} className="text-blue-400 shrink-0" /> Up to 3 Users</li>
                                <li className="flex gap-3 text-sm text-white"><CheckCircle2 size={16} className="text-blue-400 shrink-0" /> WhatsApp Reminders</li>
                                <li className="flex gap-3 text-sm text-white"><CheckCircle2 size={16} className="text-blue-400 shrink-0" /> Advanced Analytics</li>
                                {billingCycle === 'yearly' && (
                                    <li className="flex gap-3 text-sm text-emerald-400 font-bold"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> 2 Months Free</li>
                                )}
                            </ul>
                            <button
                                onClick={() => handlePayment('professional')}
                                disabled={loadingPlan === 'professional'}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                            >
                                {loadingPlan === 'professional' && <Loader2 size={16} className="animate-spin" />}
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
