'use client';
import { useEffect, useState, use } from 'react';

const API_URL = '/api';

export default function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() or await in async component (Next.js 15+)
    const resolvedParams = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/public/customer/${resolvedParams.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Not Found');
                return res.json();
            })
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [resolvedParams.id]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Details...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Invalid Link or Customer Not Found</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="text-sm text-slate-400">Payment Due To</div>
                <h1 className="text-2xl font-bold gradient-text">{data.vendor.businessName}</h1>
                <p className="text-xs text-slate-500">{data.vendor.phoneNumber}</p>
            </div>

            <div className="bg-surface rounded-2xl p-8 text-center border border-white/10 mb-8 shadow-2xl">
                <div className="text-slate-400 mb-2">You Owe</div>
                <div className={`text-5xl font-bold ${Number(data.balance) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ₹{data.balance}
                </div>
                <div className="mt-6 flex gap-2 justify-center">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-green-600/20">
                        Pay Now
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold">
                        Dispute
                    </button>
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {data.transactions.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <div>
                            <div className={`text-sm font-bold ${t.type === 'CREDIT' ? 'text-red-400' : 'text-green-400'}`}>
                                {t.type}
                            </div>
                            <div className="text-xs text-slate-500">
                                {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="font-mono">
                            ₹{t.amount}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
