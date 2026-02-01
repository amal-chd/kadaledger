'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../api/auth';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { Home, Eye, EyeOff, CheckCircle, Star, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

function RegisterContent() {
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Enhanced validation with specific error messages
        if (!businessName) {
            toast.error('🏪 Business name is required');
            return;
        }

        if (businessName.length < 3) {
            toast.error('🏪 Business name must be at least 3 characters');
            return;
        }

        if (!phone) {
            toast.error('📱 Phone number is required');
            return;
        }

        if (phone.length < 10) {
            toast.error('📱 Please enter a valid 10-digit phone number');
            return;
        }

        if (!password) {
            toast.error('🔒 Password is required');
            return;
        }

        if (password.length < 6) {
            toast.error('🔒 Password must be at least 6 characters');
            return;
        }

        if (!confirmPassword) {
            toast.error('🔒 Please confirm your password');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('🔒 Passwords do not match');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('✨ Creating your account...');

        try {
            const { access_token } = await authApi.register({ businessName, phoneNumber: phone, password });
            localStorage.setItem('token', access_token);

            toast.success('🎉 Registration successful! Welcome to Kada Ledger!', {
                id: loadingToast,
                duration: 5000
            });

            // Small delay for better UX
            setTimeout(() => {
                router.push('/onboarding');
            }, 1000);
        } catch (err: any) {
            // Enhanced error handling with specific messages
            let errorMessage = '❌ Registration failed. Please try again.';

            if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
                errorMessage = '👤 This phone number is already registered. Please login instead.';
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                errorMessage = '🌐 Network error. Please check your connection';
            } else if (err.message?.includes('invalid')) {
                errorMessage = '⚠️ Invalid information provided. Please check your details';
            } else if (err.message) {
                errorMessage = `❌ ${err.message}`;
            }

            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

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

    const isPremium = plan?.includes('professional');
    const planBenefits = isPremium ? [
        'Premium features included',
        'Advanced Analytics',
        'WhatsApp Reminders',
        'Priority Phone Support',
        'Multi-user access'
    ] : (plan === 'trial' ? [
        '14 days free trial',
        'Unlimited customers',
        'WhatsApp reminders',
        'Advanced analytics',
        'Priority support'
    ] : [
        'Free forever plan',
        'Up to 50 customers',
        'Basic features',
        'Email support'
    ]);

    return (
        <div className="h-screen bg-[#020617] flex relative overflow-hidden">
            {/* Toast Notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Back to Home Button */}
            <Link
                href="/"
                className="fixed top-4 left-4 md:top-8 md:left-8 z-50 glass-card px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group flex items-center gap-2 text-white"
            >
                <Home size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
            </Link>

            {/* Left Side - Plan Benefits (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-12 relative z-10">
                <div className="flex flex-col justify-center max-w-xl ml-20 xl:ml-32">
                    {/* Logo & Brand */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/brand-logo-final.png"
                                alt="Kada Ledger"
                                width={48}
                                height={48}
                                className="rounded-2xl shadow-xl shadow-blue-500/20"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Kada Ledger</h2>
                                <p className="text-blue-200/60 text-xs">India's #1 Digital Khata</p>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                            Start Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Digital Journey</span>
                        </h1>
                        <p className="text-blue-200/70 text-sm leading-relaxed">
                            Join 10,000+ merchants who have transformed their business with Kada Ledger's powerful digital khata platform.
                        </p>
                    </div>

                    {/* Plan Highlight */}
                    {(plan === 'trial' || isPremium) && (
                        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-blue-400" size={24} />
                                <h3 className="text-xl font-bold text-white">{isPremium ? 'Premium Plan' : 'Premium Trial Plan'}</h3>
                            </div>
                            <p className="text-blue-200/70 text-sm mb-4">
                                {isPremium ? 'Excellent choice! You are signing up for the Premium plan.' : 'Experience all premium features absolutely free for 14 days. No credit card required!'}
                            </p>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                <CheckCircle size={16} />
                                Worth ₹{getPlanPrice(plan && plan.includes('yearly') ? 'professional_yearly' : 'professional')}/{plan && plan.includes('yearly') ? 'year' : 'month'}
                            </div>
                        </div>
                    )}

                    {/* Benefits List */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg mb-4">What you'll get:</h3>
                        {planBenefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={14} />
                                </div>
                                <span className="text-blue-200/80">{benefit}</span>
                            </div>
                        ))}
                    </div>


                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/brand-logo-final.png"
                                alt="Kada Ledger"
                                width={80}
                                height={80}
                                className="rounded-2xl shadow-xl shadow-blue-500/20"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {plan === 'trial' ? 'Start Free Trial' : 'Create Account'}
                        </h1>
                        <p className="text-blue-200/70">
                            {plan === 'trial' ? '14 days of premium features, free!' : 'Join Kada Ledger today'}
                        </p>
                    </div>

                    {/* Registration Card */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                        <div className="hidden lg:block mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-blue-200/70">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Business Name */}
                            <div>
                                <label className="block text-sm font-medium text-blue-200/80 mb-2 pl-1">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                    placeholder="e.g. Sharma General Store"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-blue-200/80 mb-2 pl-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                    placeholder="e.g. 9496491654"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-blue-200/80 mb-2 pl-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200/80 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="text-blue-200/40 text-xs mt-1 pl-1">At least 6 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-blue-200/80 mb-2 pl-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200/80 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        {plan === 'trial' ? 'Start Free Trial' : 'Create Account'}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Terms */}
                        <p className="text-blue-200/40 text-xs text-center mt-6">
                            By signing up, you agree to our{' '}
                            <Link href="/legal/terms" className="text-blue-400 hover:text-blue-300">Terms</Link>
                            {' '}and{' '}
                            <Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
                        </p>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-blue-200/40 text-sm">or</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-blue-200/60">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-1"
                                >
                                    Sign In
                                    <ArrowRight size={14} />
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-6 text-center">
                        <p className="text-blue-200/40 text-xs flex items-center justify-center gap-2">
                            <Shield size={14} />
                            Secured with 256-bit encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-white flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-blue-200/60">Loading...</p>
                </div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
