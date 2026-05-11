'use client';

import { Crown, CreditCard, CheckCircle } from 'lucide-react';

interface SubscriptionLockScreenProps {
  onRenew: () => void;
}

export default function SubscriptionLockScreen({ onRenew }: SubscriptionLockScreenProps) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mb-6 shadow-lg">
        <Crown size={40} className="text-blue-600 dark:text-blue-400" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Upgrade to Pro
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-2 leading-relaxed text-sm">
        Your free trial has ended. Upgrade to continue using all premium features.
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
        Your data is safe and secure.
      </p>

      <div className="space-y-2.5 mb-8 text-left w-full max-w-xs">
        {[
          'Unlimited customers & transactions',
          'WhatsApp payment reminders',
          'Business analytics & reports',
          'Daily automatic backup',
          'Priority customer support',
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2.5">
            <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onRenew}
        className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95"
      >
        <CreditCard size={20} />
        View Upgrade Plans
      </button>

      <p className="text-xs text-slate-400 mt-4">Starting from just ₹99/month</p>
    </div>
  );
}
