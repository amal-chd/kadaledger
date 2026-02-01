'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/auth-client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { Home, Eye, EyeOff, CheckCircle, Star, Zap, Shield, ArrowRight, Sparkles, User, Smartphone, Lock, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

function RegisterContent() {
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!businessName || !phone || !password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Creating your account...');

        try {
            const { access_token } = await authApi.register({ businessName, phoneNumber: phone, password });
            localStorage.setItem('token', access_token);
            toast.success('Registration successful!', { id: loadingToast });
            setTimeout(() => {
                router.push('/onboarding');
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Registration failed', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 font-sans text-slate-900">
            <Toaster position="top-right" />
            <div className="bg-white rounded-[2rem] shadow-2xl flex w-full max-w-5xl overflow-hidden min-h-[600px] flex-row-reverse">

                {/* Right Side - Blue Panel (Now on Right for Register to alternate) */}
                <div className="hidden lg:flex w-1/2 bg-blue-600 relative p-12 flex-col justify-between text-white">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>

                    {/* Logo */}
                    <div className="flex items-center gap-3 relative z-10 justify-end">
                        <span className="text-xl font-bold tracking-tight">Kada Ledger</span>
                        <div className="bg-white p-2 rounded-xl shadow-lg">
                            <Image src="/brand-logo-final.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10">
                        {/* Plan Card Mock */}
                        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl mb-8 mx-auto max-w-xs transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Pro Plan</h3>
                                    <p className="text-sm text-slate-500">Best for small businesses</p>
                                </div>
                                <div className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">ACTIVE</div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Unlimited Customers</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>WhatsApp Reminders</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Daily Backup</span>
                                </div>
                            </div>
                            <button className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium text-sm">Manage Subscription</button>
                        </div>

                        <h2 className="text-3xl font-bold mb-4 leading-tight text-right">
                            Join 10,000+ businesses growing with us.
                        </h2>
                        <p className="text-blue-100 text-lg opacity-90 text-right">
                            Start your 14-day free trial today. No credit card required.
                        </p>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-end gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                </div>

                {/* Left Side - Register Form */}
                <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="flex items-center gap-3 mb-8 lg:hidden">
                            <Image src="/brand-logo-final.png" alt="Logo" width={40} height={40} className="w-10 h-10 rounded-xl shadow-md" />
                            <span className="text-xl font-bold text-slate-800">Kada Ledger</span>
                        </div>

                        <div className="mb-2">
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
                                New Account
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h1>
                        <p className="text-slate-500 mb-8">
                            Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
                        </p>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Business Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Business Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Sharma Store"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. 9876543210"
                                />
                            </div>

                            {/* Password Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Min 6 chars"
                                    />
                                    <p className="text-[10px] text-slate-400">Must be at least 8 characters.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Confirm *</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Repeat"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>


                        </form>
                    </div>
                </div>
            </div>
            {/* Simple footer for larger screens */}
            <div className="fixed bottom-6 right-6 text-blue-100 text-xs font-medium hidden lg:block opacity-60">
                Kada Ledger Inc.
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-blue-600 flex items-center justify-center p-4"><div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>}>
            <RegisterContent />
        </Suspense>
    );
}
