'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Signing in...');

    try {
      const response = await authApi.login({ phoneNumber: phone, password });
      const { access_token, role } = response as { access_token: string; role: string };

      if (role === 'ADMIN') {
        localStorage.setItem('admin_token', access_token);
        localStorage.removeItem('token');
      } else {
        localStorage.setItem('token', access_token);
        localStorage.removeItem('admin_token');
      }

      toast.success('Welcome back!', { id: loadingToast });
      setTimeout(() => {
        router.push(role === 'ADMIN' ? '/admin' : '/dashboard');
      }, 400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Brand Bar */}
          <div className="bg-blue-600 px-8 py-6 flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Image src="/brand-logo-final.png" alt="Kada Ledger" width={28} height={28} className="rounded-md" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Kada Ledger</h1>
              <p className="text-blue-100 text-xs">Digital Khata Book</p>
            </div>
          </div>

          {/* Form Area */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">Sign in to your account to continue</p>

            <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mt-5 px-4">
          {['🔒 Bank-grade Security', '⚡ Instant Setup', '🇮🇳 Made for India'].map((item) => (
            <span key={item} className="text-blue-100 text-[11px] font-medium opacity-80 whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
