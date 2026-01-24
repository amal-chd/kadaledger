'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:4000';

export default function AdminPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');

        try {
            const res = await fetch(`${API_URL}/admin/vendors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                alert('Unauthorized. You are not an admin.');
                return router.push('/dashboard');
            }
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setVendors(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const manageSub = async (id: string, action: 'extend' | 'expire') => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/admin/vendors/${id}/${action}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen p-8 bg-slate-900 text-white font-mono">
            <h1 className="text-3xl font-bold mb-8 text-red-500">SUPER ADMIN PANEL</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                            <th className="p-4">Business</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Pending</th>
                            <th className="p-4">Plan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Ends</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map(v => (
                            <tr key={v.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-4 font-bold">{v.businessName || 'N/A'}</td>
                                <td className="p-4">{v.phoneNumber}</td>
                                <td className="p-4 text-red-400">₹{v.totalPending} ({v.customerCount})</td>
                                <td className="p-4 uppercase text-xs tracking-wider">{v.subscription?.planType}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${v.subscription?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {v.subscription?.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">{new Date(v.subscription?.endDate).toLocaleDateString()}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => manageSub(v.id, 'extend')} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs">Extend 30d</button>
                                    <button onClick={() => manageSub(v.id, 'expire')} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs">Expire</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
