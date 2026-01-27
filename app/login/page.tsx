'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Home, Eye, EyeOff, Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation with specific error messages
        if (!phone) {
            toast.error('📱 Phone number is required');
            return;
        }

        if (!password) {
            toast.error('🔒 Password is required');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('🔐 Signing you in...');

        try {
            const response = await authApi.login({ phoneNumber: phone, password });
            const { access_token, role } = response;
            localStorage.setItem('token', access_token);

            toast.success('✅ Login successful! Redirecting...', { id: loadingToast });

            // Small delay for better UX
            setTimeout(() => {
                // Redirect based on role
                if (role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }, 500);
        } catch (err: any) {
            // Enhanced error handling with specific messages
            let errorMessage = '❌ Login failed. Please try again.';

            if (err.message?.includes('credentials') || err.message?.includes('Invalid')) {
                errorMessage = '🔐 Invalid phone number or password';
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                errorMessage = '🌐 Network error. Please check your connection';
            } else if (err.message?.includes('not found') || err.message?.includes('404')) {
                errorMessage = '👤 Account not found. Please register first';
            } else if (err.message) {
                errorMessage = `❌ ${err.message}`;
            }

            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#020617] flex relative overflow-hidden">
            {/* Toaster removed - using global toaster from layout */}

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

            {/* Left Side - Branding & Features (Hidden on Mobile) */}
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
                            Welcome Back to Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Digital Empire</span>
                        </h1>
                        <p className="text-blue-200/70 text-sm leading-relaxed">
                            Access your dashboard to manage customers, track payments, and grow your business with powerful analytics.
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="space-y-3">
                        {[
                            {
                                icon: Shield,
                                title: 'Bank-Grade Security',
                                desc: 'Your data is encrypted and protected 24/7'
                            },
                            {
                                icon: Zap,
                                title: 'Lightning Fast',
                                desc: 'Access your ledger instantly from anywhere'
                            },
                            {
                                icon: Users,
                                title: 'Trusted by 10,000+',
                                desc: 'Join thousands of merchants across India'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 group">
                                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <feature.icon size={18} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">{feature.title}</h3>
                                    <p className="text-blue-200/60 text-xs">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social Proof */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">10,000+ Active Users</p>
                                <p className="text-blue-200/60 text-xs">Trusted across India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
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
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-blue-200/70">Login to access your dashboard</p>
                    </div>

                    {/* Login Card */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
                        <div className="hidden lg:block mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                            <p className="text-blue-200/70">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-blue-200/80 mb-2 pl-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                    placeholder="Enter your phone number"
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all focus:bg-white/10"
                                        placeholder="Enter your password"
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
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-blue-200/40 text-sm">or</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-blue-200/60">
                                Don't have an account?{' '}
                                <Link
                                    href="/register?plan=trial"
                                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-1"
                                >
                                    Start Free Trial
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
