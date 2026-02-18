'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Save,
    Loader2,
    IndianRupee,
    CheckCircle2,
    XCircle,
    Crown,
    Zap,
    Sparkles,
    Gift,
    Plus,
    Trash2,
    Edit3,
    X,
    Check,
    Layers,
    ToggleLeft,
    ToggleRight,
    TrendingUp,
} from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    isActive: boolean;
    description: string;
    features?: string[];
}

const PLAN_ORDER = ['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'];

const PLAN_META: Record<string, {
    icon: typeof Crown;
    gradient: string;
    glow: string;
    badge: string;
    badgeBg: string;
    borderAccent: string;
    label: string;
    subtitle: string;
    intervalLabel: string;
}> = {
    FREE: {
        icon: Gift,
        gradient: 'from-slate-500/20 to-slate-600/10',
        glow: 'shadow-slate-500/5',
        badge: 'text-slate-300',
        badgeBg: 'bg-slate-500/15 border-slate-500/25',
        borderAccent: 'hover:border-slate-500/40',
        label: 'Starter',
        subtitle: 'Get started for free',
        intervalLabel: 'forever',
    },
    MONTHLY: {
        icon: Zap,
        gradient: 'from-blue-500/20 to-cyan-500/10',
        glow: 'shadow-blue-500/10',
        badge: 'text-blue-300',
        badgeBg: 'bg-blue-500/15 border-blue-500/25',
        borderAccent: 'hover:border-blue-500/40',
        label: 'Pro Monthly',
        subtitle: 'Great for growing shops',
        intervalLabel: '/month',
    },
    YEARLY: {
        icon: Crown,
        gradient: 'from-purple-500/20 to-pink-500/10',
        glow: 'shadow-purple-500/10',
        badge: 'text-purple-300',
        badgeBg: 'bg-purple-500/15 border-purple-500/25',
        borderAccent: 'hover:border-purple-500/40',
        label: 'Pro Yearly',
        subtitle: 'Best value — save 16%',
        intervalLabel: '/year',
    },
    LIFETIME: {
        icon: Sparkles,
        gradient: 'from-amber-500/20 to-orange-500/10',
        glow: 'shadow-amber-500/10',
        badge: 'text-amber-300',
        badgeBg: 'bg-amber-500/15 border-amber-500/25',
        borderAccent: 'hover:border-amber-500/40',
        label: 'Lifetime',
        subtitle: 'Pay once, use forever',
        intervalLabel: 'one-time',
    },
};

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<string | null>(null);
    const [newFeature, setNewFeature] = useState('');
    const [editingDescription, setEditingDescription] = useState<string | null>(null);
    const [descriptionDraft, setDescriptionDraft] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('admin_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans', {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                } as HeadersInit
            });

            if (res.status === 401) {
                toast.error('Unauthorized. Please login again.');
                return;
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                const normalized = data
                    .filter((p: any) => PLAN_ORDER.includes(String(p.id || p.name || '').toUpperCase()))
                    .sort((a: any, b: any) => PLAN_ORDER.indexOf(String(a.id || a.name).toUpperCase()) - PLAN_ORDER.indexOf(String(b.id || b.name).toUpperCase()));
                setPlans(normalized);
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
                setPlans(plans.map(p => p.id === id ? { ...p, ...updates } : p));
                toast.success('Plan updated');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update plan');
        } finally {
            setSaving(null);
        }
    };

    const addFeature = (planId: string) => {
        if (!newFeature.trim()) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;
        const updatedFeatures = [...(plan.features || []), newFeature.trim()];
        handleUpdate(planId, { features: updatedFeatures });
        setNewFeature('');
    };

    const removeFeature = (planId: string, index: number) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;
        const updatedFeatures = (plan.features || []).filter((_, i) => i !== index);
        handleUpdate(planId, { features: updatedFeatures });
    };

    const saveDescription = (planId: string) => {
        handleUpdate(planId, { description: descriptionDraft });
        setEditingDescription(null);
    };

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-slate-400 text-sm">Loading plans...</p>
            </div>
        );
    }

    const activePlans = plans.filter(p => p.isActive).length;
    const totalRevenuePotential = plans
        .filter(p => p.isActive && p.price > 0)
        .reduce((acc, p) => acc + p.price, 0);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                            <Layers className="text-blue-400" size={20} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Subscription Plans</h1>
                    </div>
                    <p className="text-slate-400 text-sm ml-[52px]">
                        Manage pricing, features, and availability for each plan tier.
                    </p>
                </div>
                <div className="flex items-center gap-3 ml-[52px] sm:ml-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-xs font-semibold">{activePlans} Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <TrendingUp size={14} className="text-blue-400" />
                        <span className="text-blue-400 text-xs font-semibold">₹{totalRevenuePotential.toLocaleString()} tiers</span>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {plans.map((plan) => {
                    const meta = PLAN_META[plan.id] || PLAN_META.FREE;
                    const Icon = meta.icon;
                    const isEditing = editingPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative group rounded-2xl overflow-hidden
                                bg-gradient-to-br ${meta.gradient}
                                border border-white/[0.06] ${meta.borderAccent}
                                transition-all duration-300
                                ${meta.glow} hover:shadow-lg
                            `}
                        >
                            {/* Card inner */}
                            <div className="bg-[#0B1120]/80 backdrop-blur-sm rounded-2xl p-6">
                                {/* Top row: icon + name + status toggle */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl ${meta.badgeBg} border flex items-center justify-center`}>
                                            <Icon className={meta.badge} size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{meta.label}</h3>
                                            <p className="text-xs text-slate-400">{meta.subtitle}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(plan.id, { isActive: !plan.isActive })}
                                        className="flex items-center gap-1.5 transition-colors mt-1"
                                        title={plan.isActive ? 'Deactivate plan' : 'Activate plan'}
                                    >
                                        {plan.isActive ? (
                                            <ToggleRight size={28} className="text-emerald-400 hover:text-emerald-300" />
                                        ) : (
                                            <ToggleLeft size={28} className="text-slate-500 hover:text-slate-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Price section */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-slate-400 text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => {
                                                const newPrice = parseFloat(e.target.value) || 0;
                                                setPlans(plans.map(p => p.id === plan.id ? { ...p, price: newPrice } : p));
                                            }}
                                            className="text-4xl font-bold text-white bg-transparent border-none outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="text-slate-500 text-sm font-medium">{meta.intervalLabel}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-5">
                                    {editingDescription === plan.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={descriptionDraft}
                                                onChange={(e) => setDescriptionDraft(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveDescription(plan.id)}
                                                className="flex-1 text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-blue-500/50"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => saveDescription(plan.id)}
                                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingDescription(null)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingDescription(plan.id);
                                                setDescriptionDraft(plan.description || '');
                                            }}
                                            className="group/desc flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                                        >
                                            <span>{plan.description || 'Add a description...'}</span>
                                            <Edit3 size={12} className="opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                                        </button>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/[0.06] mb-5" />

                                {/* Features */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features</h4>
                                        <button
                                            onClick={() => setEditingPlan(isEditing ? null : plan.id)}
                                            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${isEditing
                                                    ? 'text-blue-400 bg-blue-500/10'
                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                                }`}
                                        >
                                            {isEditing ? 'Done' : 'Edit'}
                                        </button>
                                    </div>

                                    <ul className="space-y-2">
                                        {(plan.features || []).map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2.5 group/item">
                                                <CheckCircle2 size={15} className={`${meta.badge} flex-shrink-0`} />
                                                <span className="text-sm text-slate-300 flex-1">{feature}</span>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => removeFeature(plan.id, i)}
                                                        className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                        {(!plan.features || plan.features.length === 0) && !isEditing && (
                                            <li className="text-sm text-slate-500 italic">No features listed</li>
                                        )}
                                    </ul>

                                    {/* Add feature */}
                                    {isEditing && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <input
                                                type="text"
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addFeature(plan.id)}
                                                placeholder="Add a feature..."
                                                className="flex-1 text-sm bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                                            />
                                            <button
                                                onClick={() => addFeature(plan.id)}
                                                className="p-2 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/[0.06] my-5" />

                                {/* Save button */}
                                <button
                                    onClick={() => handleUpdate(plan.id, { price: plan.price })}
                                    disabled={saving === plan.id}
                                    className={`
                                        w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                                        transition-all duration-200 disabled:opacity-50
                                        bg-white/[0.04] border border-white/[0.08]
                                        hover:bg-white/[0.08] hover:border-white/[0.12]
                                        text-white
                                    `}
                                >
                                    {saving === plan.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
