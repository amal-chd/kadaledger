'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth-client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Eye, EyeOff, CheckCircle, ArrowRight, Building2, Phone, Lock } from 'lucide-react';

function RegisterContent() {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordStrong = password.length >= 8;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !phone.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating your account...');

    try {
      const { access_token } = await authApi.register({ businessName, phoneNumber: phone, password }) as { access_token: string };
      localStorage.setItem('token', access_token);
      toast.success('Account created! Setting up your dashboard...', { id: loadingToast });
      setTimeout(() => {
        router.push('/onboarding');
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Brand Bar */}
          <div className="bg-blue-600 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Image src="/brand-logo-final.png" alt="Kada Ledger" width={28} height={28} className="rounded-md" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Kada Ledger</h1>
                <p className="text-blue-100 text-xs">Free to get started</p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              {['Unlimited Free Trial', 'No credit card'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-blue-100 text-[11px]">
                  <CheckCircle size={11} className="text-blue-200" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign in</Link>
            </p>

            <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="e.g. Sharma Store"
                    autoCapitalize="words"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="e.g. 9876543210"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1" aria-label="Toggle password">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {password && (
                  <p className={`text-xs flex items-center gap-1 ${passwordStrong ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <CheckCircle size={12} />
                    {passwordStrong ? 'Strong password' : 'Use at least 8 characters'}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 outline-none transition-all text-sm ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-emerald-400 focus:ring-emerald-500'
                          : 'border-red-400 focus:ring-red-500'
                        : 'border-slate-200 dark:border-white/10 focus:ring-blue-500'
                    }`}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1" aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
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
                    Create Free Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                By registering you agree to our{' '}
                <Link href="/legal/terms" className="text-blue-500 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/legal/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mt-5">
          {['🔒 Secure', '⚡ Free', '🇮🇳 India'].map((item) => (
            <span key={item} className="text-blue-100 text-[11px] font-medium opacity-80">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
