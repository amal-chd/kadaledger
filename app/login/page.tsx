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
            router.push('/dashboard'); // Go to Vendor Dashboard
        } catch (err) {
            alert('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card p-8 rounded-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="9876543210"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold transition disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-xl"
                                placeholder="XXXXXX"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" onClick={() => setStep('PHONE')} className="w-full text-sm text-slate-500">Change Number</button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account? <Link href="/register" className="text-indigo-400 hover:underline">Start Trial</Link>
                </div>
            </div>
        </div>
    );
}
