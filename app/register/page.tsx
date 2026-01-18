'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../api/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

import Image from 'next/image';

function RegisterContent() {
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!businessName || !phone || !password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const { access_token } = await authApi.register({ businessName, phoneNumber: phone, password });
            localStorage.setItem('token', access_token);
            toast.success('Registration successful!');
            router.push('/onboarding'); // Redirect to onboarding for the visual treat
        } catch (err: any) {
            toast.error(err.message || 'Registration failed. Please try again.');
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
                    <h1 className="text-4xl font-bold text-white mb-2">Start Free Trial</h1>
                    <p className="text-blue-200/80">
                        {plan === 'trial' ? 'Get 14 days of premium features.' : 'Join Kada Ledger today.'}
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Business Name</label>
                        <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                            placeholder="e.g. My Awesome Store"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                            placeholder="e.g. 9496491654"
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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-blue-200/60">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
