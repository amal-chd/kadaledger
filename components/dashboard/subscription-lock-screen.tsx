
'use client';

import { Lock, CreditCard } from 'lucide-react';

interface SubscriptionLockScreenProps {
    onRenew: () => void;
}

export default function SubscriptionLockScreen({ onRenew }: SubscriptionLockScreenProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 text-center">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center mb-8 animate-pulse">
                <Lock size={48} />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Subscription Expired</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                Your subscription plan has ended. To continue managing your ledger, calculating balances, and sending reminders, please renew your plan.
                <br /><br />
                Your data is safe, but access is paused.
            </p>

            <button
                onClick={onRenew}
                className="bg-accent hover:bg-accent/90 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-accent/30 hover:scale-105 transition-all flex items-center gap-3"
            >
                <CreditCard size={20} />
                Renew Subscription Now
            </button>
        </div>
    );
}
