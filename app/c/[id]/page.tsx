'use client';
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Phone } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'PAYMENT';
  amount: number;
  description?: string;
  date: string;
}

interface CustomerData {
  vendor: { businessName: string; phoneNumber: string };
  customer: { name: string };
  balance: number;
  transactions: Transaction[];
}

export default function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/public/customer/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not Found');
        return res.json() as Promise<CustomerData>;
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading your details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Invalid Link</h2>
          <p className="text-slate-400 text-sm">This payment link is invalid or has expired. Please contact the business for a new link.</p>
        </div>
      </div>
    );
  }

  const balance = Number(data.balance);
  const isOwed = balance < 0; // negative = customer owes vendor
  const absBalance = Math.abs(balance);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-600/20 flex items-center justify-center flex-shrink-0">
            <Image src="/brand-logo-final.png" alt="Kada Ledger" width={28} height={28} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Payment Request from</p>
            <h1 className="text-lg font-bold text-white leading-tight">{data.vendor.businessName}</h1>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`rounded-3xl p-6 text-center ${
          isOwed
            ? 'bg-gradient-to-br from-red-600/80 to-red-700/80'
            : 'bg-gradient-to-br from-emerald-600/80 to-emerald-700/80'
        } border border-white/10 shadow-2xl`}>
          <p className="text-white/70 text-sm font-medium mb-1">
            {data.customer.name}&apos;s Balance
          </p>
          <div className="text-5xl font-bold text-white mb-1 tracking-tight">
            ₹{absBalance.toLocaleString()}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${
            isOwed
              ? 'bg-red-900/40 text-red-200'
              : 'bg-emerald-900/40 text-emerald-200'
          }`}>
            {isOwed ? '⚠️ Payment Due' : '✅ Advance Balance'}
          </div>

          {isOwed && (
            <div className="mt-5">
              <a
                href={`https://wa.me/${data.vendor.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I want to pay ₹${absBalance} for my account at ${data.vendor.businessName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 py-3 rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <Phone size={18} />
                Contact to Pay
              </a>
            </div>
          )}

          {!isOwed && balance === 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-200">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">All settled!</span>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        {data.transactions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-slate-200">Recent Activity</h2>
            </div>
            <div className="divide-y divide-white/5">
              {data.transactions.map((tx) => {
                const isCredit = tx.type === 'CREDIT';
                const txDate = new Date(tx.date);
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCredit
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {isCredit
                          ? <ArrowUpRight size={15} />
                          : <ArrowDownLeft size={15} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {tx.description || (isCredit ? 'Credit Given' : 'Payment Received')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${isCredit ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center text-slate-600 text-xs pt-4">
          Powered by <span className="text-slate-400 font-semibold">Kada Ledger</span>
        </div>
      </div>
    </div>
  );
}
