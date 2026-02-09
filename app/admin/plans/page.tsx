'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Loader2, DollarSign, CheckCircle2, XCircle } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    isActive: boolean;
    description: string;
}

const PLAN_ORDER = ['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'];

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('admin_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchPlans = async () => {
        try {
            console.log('Fetching plans...');
            const res = await fetch('/api/admin/plans', {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                } as HeadersInit
            });
            console.log('Response status:', res.status);

            if (res.status === 401) {
                toast.error('Unauthorized. Please login again.');
                return;
            }

            const data = await res.json();
            console.log('Fetched data:', data);

            if (Array.isArray(data)) {
                const normalized = data
                    .filter((p: any) => PLAN_ORDER.includes(String(p.id || p.name || '').toUpperCase()))
                    .sort((a: any, b: any) => PLAN_ORDER.indexOf(String(a.id || a.name).toUpperCase()) - PLAN_ORDER.indexOf(String(b.id || b.name).toUpperCase()));
                setPlans(normalized);
            } else {
                console.error("API did not return an array", data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Plan>) => {
        setSaving(id);
        try {
            const res = await fetch('/api/admin/plans', {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                } as HeadersInit,
                body: JSON.stringify({ id, ...updates })
            });

            if (res.ok) {
                const updated = await res.json();
                setPlans(plans.map(p => p.id === id ? { ...p, ...updates } : p));
                toast.success('Plan updated successfully');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update plan');
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
                                <p className="text-sm text-slate-500">{plan.interval || 'custom'}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Price (INR)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        value={plan.price}
                                        onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value);
                                            setPlans(plans.map(p => p.id === plan.id ? { ...p, price: newPrice } : p));
                                        }}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={() => handleUpdate(plan.id, { isActive: !plan.isActive })}
                                    className={`text-sm font-medium flex items-center gap-1 ${plan.isActive ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'}`}
                                >
                                    {plan.isActive ? <><XCircle size={16} /> Deactivate</> : <><CheckCircle2 size={16} /> Activate</>}
                                </button>

                                <button
                                    onClick={() => handleUpdate(plan.id, { price: plan.price })}
                                    disabled={saving === plan.id}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving === plan.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
