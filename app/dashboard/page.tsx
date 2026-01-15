'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:4000';

export default function Dashboard() {
    const [vendor, setVendor] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Profile
            const resProfile = await fetch(`${API_URL}/vendor/profile`, { headers });
            if (!resProfile.ok) throw new Error('Failed to fetch profile');
            const profileData = await resProfile.json();
            setVendor(profileData);

            // Fetch Customers
            const resCustomers = await fetch(`${API_URL}/customers`, { headers });
            const customersData = await resCustomers.json();
            setCustomers(customersData);
        } catch (e) {
            console.error(e);
            localStorage.removeItem('token');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const addCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newCustomerName, phoneNumber: newCustomerPhone })
        });
        setNewCustomerName('');
        setNewCustomerPhone('');
        fetchData();
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                    <p className="text-slate-400">Welcome, {vendor?.businessName || vendor?.phoneNumber}</p>
                </div>
                <div className="flex gap-4">
                    <div className={`px-4 py-2 rounded-lg border ${vendor?.subscription?.status === 'ACTIVE' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                        {vendor?.subscription?.planType} ({vendor?.subscription?.status})
                    </div>
                    <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="text-sm text-slate-400 hover:text-white">Logout</button>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
                <div className="p-6 rounded-2xl glass-card">
                    <div className="text-slate-400 text-sm mb-1">Total Pending</div>
                    <div className="text-3xl font-bold text-red-400">₹{vendor?.totalPending || 0}</div>
                </div>
                <div className="p-6 rounded-2xl glass-card">
                    <div className="text-slate-400 text-sm mb-1">Customers</div>
                    <div className="text-3xl font-bold">{customers.length}</div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Customers</h2>
                    {customers.map(c => (
                        <div key={c.id} className="p-4 rounded-xl bg-surface border border-white/5 flex justify-between items-center hover:border-indigo-500/30">
                            <div>
                                <div className="font-bold">{c.name}</div>
                                <div className="text-sm text-slate-500">{c.phoneNumber}</div>
                            </div>
                            <div className="text-right">
                                <div className={`font-mono font-bold ${Number(c.balance) > 0 ? 'text-red-400' : 'text-green-400'}`}>₹{c.balance}</div>
                                <div className="text-xs text-slate-600">Balance</div>
                            </div>
                        </div>
                    ))}
                    {customers.length === 0 && <div className="text-slate-500 text-center py-10">No customers yet.</div>}
                </div>

                <div>
                    <div className="p-6 rounded-2xl glass-card sticky top-10">
                        <h3 className="font-bold mb-4">Add Customer</h3>
                        <form onSubmit={addCustomer} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={newCustomerName}
                                onChange={e => setNewCustomerName(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-3"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={newCustomerPhone}
                                onChange={e => setNewCustomerPhone(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-3"
                                required
                            />
                            <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold">Add Customer</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
