'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, CheckCircle, Building2, User } from 'lucide-react';

const slides = [
  {
    id: 1,
    emoji: '📒',
    title: 'Welcome to Kada Ledger',
    description: 'Your smart digital khata for tracking customer credits and payments.',
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 2,
    emoji: '💰',
    title: 'Track Every Rupee',
    description: 'Record credits and payments instantly. Know exactly who owes you — always.',
    color: 'from-emerald-600 to-emerald-700',
  },
  {
    id: 3,
    emoji: '📲',
    title: 'Smart WhatsApp Reminders',
    description: 'Send payment reminders via WhatsApp in one tap. Collect faster, stress less.',
    color: 'from-violet-600 to-violet-700',
  },
  {
    id: 4,
    emoji: '📊',
    title: 'Business Analytics',
    description: 'See your cash flow, top customers, and business health at a glance.',
    color: 'from-orange-600 to-orange-700',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setShowForm(true);
    } else {
      setCurrentSlide(c => c + 1);
    }
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
    } else if (currentSlide > 0) {
      setCurrentSlide(c => c - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: ownerName.trim() || undefined,
          businessName: businessName.trim(),
          address: address.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      toast.success('Setup complete! Welcome aboard 🎉');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide % slides.length].color} opacity-10 transition-all duration-700 pointer-events-none`} />

      <div className="w-full max-w-sm relative z-10">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key={`slide-${currentSlide}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Image src="/brand-logo-final.png" alt="Kada Ledger" width={56} height={56} className="rounded-2xl shadow-xl" />
              </div>

              {/* Emoji Illustration */}
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mx-auto mb-8 shadow-2xl text-5xl`}>
                {slides[currentSlide].emoji}
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 px-4">
                {slides[currentSlide].title}
              </h2>
              <p className="text-slate-400 text-base leading-relaxed px-6">
                {slides[currentSlide].description}
              </p>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 mt-10 mb-8">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? 'w-6 h-2.5 bg-white'
                        : 'w-2.5 h-2.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {currentSlide > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-12 h-12 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95 bg-gradient-to-r ${slides[currentSlide].color} shadow-xl`}
                >
                  {isLastSlide ? 'Get Started' : 'Next'}
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Skip */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full mt-4 text-slate-500 text-sm hover:text-slate-400 transition-colors py-2"
              >
                Skip intro
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Building2 size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Setup Your Business</h2>
                <p className="text-slate-400 text-sm mt-1">This helps personalise your experience</p>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Business Name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="e.g. Sharma General Store"
                      required
                      autoFocus
                      autoCapitalize="words"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Owner Name <span className="text-slate-500 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="e.g. Ramesh Sharma"
                      autoCapitalize="words"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Address <span className="text-slate-500 font-normal">(Optional)</span></label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                    placeholder="Shop / street address..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center w-12 h-12 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-60 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Complete Setup
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
