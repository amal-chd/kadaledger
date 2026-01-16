'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.login(phone);
            setStep('OTP');
        } catch (err) {
            alert('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { access_token } = await authApi.verify(phone, otp);
            localStorage.setItem('token', access_token);
            router.push('/dashboard');
        } catch (err) {
            alert('Invalid OTP');
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
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200/80">Login to access your dashboard.</p>
                </div>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:bg-white/10"
                                placeholder="9876543210"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Code...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6 animate-fade-in-up">
                        <div>
                            <label className="block text-sm font-medium text-blue-200/60 mb-2 pl-1">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-blue-200/30 focus:ring-2 focus:ring-blue-500/50 outline-none text-center tracking-[1em] text-xl transition-all focus:bg-white/10"
                                placeholder="XXXXXX"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" onClick={() => setStep('PHONE')} className="w-full text-sm text-blue-300/60 hover:text-white transition-colors">
                            Change Phone Number
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-blue-200/60">
                    Don't have an account? <Link href="/register?plan=trial" className="text-blue-400 hover:text-white hover:underline transition-colors font-medium">Start Free Trial</Link>
                </div>
            </div>
        </div>
    );
}
