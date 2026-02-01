'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ArrowRight, Lock, Mail, Phone, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Logging in...');

        try {
            const response = await authApi.login({ phoneNumber: phone, password });
            const { access_token, role } = response;
            localStorage.setItem('token', access_token);
            toast.success('Successfully logged in!', { id: loadingToast });
            setTimeout(() => {
                if (role === 'ADMIN') router.push('/admin');
                else router.push('/dashboard');
            }, 500);
        } catch (err: any) {
            toast.error(err.message || 'Login failed', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[2rem] shadow-2xl flex w-full max-w-5xl overflow-hidden min-h-[600px]">

                {/* Left Side - Blue Panel */}
                <div className="hidden lg:flex w-1/2 bg-blue-600 relative p-12 flex-col justify-between text-white">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    {/* Logo */}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="bg-white p-2 rounded-xl shadow-lg">
                            <Image src="/brand-logo-final.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Kada Ledger</span>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10">
                        {/* Mock UI Card */}
                        <div className="bg-[#0f172a] rounded-xl p-4 shadow-2xl border border-white/10 mb-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-300/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80"></div>
                                </div>
                                <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                                            <div className="space-y-1">
                                                <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                                                <div className="h-1.5 w-16 bg-white/10 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-12 bg-white/20 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4 leading-tight">
                            Did you know most "digital" ledgers aren't actually secure?
                        </h2>
                        <p className="text-blue-100 text-lg opacity-90">
                            Ours truly delivers bank-grade security and real-time backups.
                        </p>
                    </div>

                    {/* Navigation/Dots */}
                    <div className="flex items-center gap-4 relative z-10">
                        <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="flex items-center gap-3 mb-8 lg:hidden">
                            <Image src="/brand-logo-final.png" alt="Logo" width={40} height={40} className="w-10 h-10 rounded-xl shadow-md" />
                            <span className="text-xl font-bold text-slate-800">Kada Ledger</span>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                        <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Phone Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>

                            {/* Password Any Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Or</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                    Create free account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple footer for larger screens */}
            <div className="fixed bottom-6 text-blue-100 text-xs font-medium hidden lg:block opacity-60">
                © 2026 Kada Ledger. Secure & Encrypted.
            </div>
        </div>
    );
}
