'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

import Image from 'next/image';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        if (!password) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            const { access_token } = await authApi.login({ phoneNumber: phone, password });
            localStorage.setItem('token', access_token);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] relative z-10 border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image src="/brand-logo-final.png" alt="Kada Ledger" width={80} height={80} className="w-20 h-auto rounded-2xl shadow-xl shadow-blue-500/20" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200/80">Login to access your dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-blue-200/60">
                        Don't have an account?{' '}
                        <Link href="/register?plan=trial" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
