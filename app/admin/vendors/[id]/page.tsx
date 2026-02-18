'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CreditCard,
    Users,
    DollarSign,
    Calendar,
    Settings,
    UserX,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Save
} from 'lucide-react';
import { safeFormatDate } from '@/lib/safe-date';
import toast from 'react-hot-toast';

const PLAN_OPTIONS = ['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'];

export default function VendorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ businessName: '', phoneNumber: '' });
    const router = useRouter();

    const getAdminToken = () => localStorage.getItem('admin_token');

    useEffect(() => {
        if (vendor) {
            setEditForm({
                businessName: vendor.businessName || '',
                phoneNumber: vendor.phoneNumber || ''
            });
        }
    }, [vendor]);

    useEffect(() => {
        fetchVendorDetails();
    }, [id]);

    const fetchVendorDetails = async () => {
        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Unauthorized');
                return;
            }
            const res = await fetch(`/api/admin/vendors/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setVendor(data);
            } else {
                toast.error('Failed to load vendor details');
            }
        } catch (error) {
            console.error('Error fetching vendor', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (newPlan: string) => {
        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Unauthorized');
                return;
            }
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planType: newPlan })
            });

            if (res.ok) {
                toast.success('Subscription updated successfully');
                setIsEditingPlan(false);
                fetchVendorDetails();
            } else {
                toast.error('Failed to update subscription');
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Unauthorized');
                return;
            }
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Vendor ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully`);
                fetchVendorDetails();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Unauthorized');
                return;
            }
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                toast.success('Profile updated successfully');
                setIsEditingProfile(false);
                fetchVendorDetails();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleDeleteVendor = async () => {
        if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone and will remove all their customer data.')) {
            return;
        }

        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Unauthorized');
                return;
            }
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Vendor deleted successfully');
                router.push('/admin/vendors');
            } else {
                toast.error('Failed to delete vendor');
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) {
        return <div className="text-white text-center py-20">Loading vendor details...</div>;
    }

    if (!vendor) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {isEditingProfile ? (
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={editForm.businessName}
                                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                                className="bg-[#020617] border border-blue-500 rounded-lg px-3 py-1 text-white font-bold text-xl focus:outline-none"
                                placeholder="Business Name"
                            />
                            <input
                                type="text"
                                value={editForm.phoneNumber}
                                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                className="bg-[#020617] border border-blue-500 rounded-lg px-3 py-1 text-slate-300 text-sm font-mono focus:outline-none"
                                placeholder="Phone Number"
                            />
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{vendor.businessName || 'Unnamed Business'}</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span>{vendor.phoneNumber}</span>
                                <span>•</span>
                                <span>Joined {safeFormatDate(vendor.createdAt, 'MMMM d, yyyy')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isEditingProfile ? (
                        <>
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <Settings size={16} />
                            Edit Profile
                        </button>
                    )}

                    <button
                        onClick={handleDeleteVendor}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <UserX size={16} />
                        Delete Vendor
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4 text-emerald-500">
                        <Users size={24} />
                        <span className="font-bold">Total Customers</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{vendor.stats.customerCount}</div>
                </div>
                <div className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <CreditCard size={24} />
                        <span className="font-bold">Transactions</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{vendor.stats.transactionCount}</div>
                </div>
                <div className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4 text-rose-500">
                        <DollarSign size={24} />
                        <span className="font-bold">Total Pending</span>
                    </div>
                    <div className="text-3xl font-bold text-white">₹{vendor.stats.totalPending.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content: Recent Activity & Customers */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-bold text-white">Recent Transactions</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {vendor.transactions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No transactions recorded yet</div>
                            ) : (
                                vendor.transactions.map((t: any) => (
                                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${t.type === 'CREDIT' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {t.type === 'CREDIT' ? <ArrowLeft size={16} /> : <CheckCircle2 size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {t.type === 'CREDIT' ? 'Given on credit' : 'Payment received'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {safeFormatDate(t.date, 'MMM d, h:mm a')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-mono font-bold ${t.type === 'CREDIT' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            ₹{t.amount}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Subscription & Actions */}
                <div className="space-y-6">
                    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Settings size={18} className="text-blue-500" />
                                Subscription
                            </h3>
                            <button
                                onClick={() => setIsEditingPlan(!isEditingPlan)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                            >
                                {isEditingPlan ? 'Cancel' : 'Change Plan'}
                            </button>
                        </div>

                        {!isEditingPlan ? (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Current Plan</div>
                                <div className="text-xl font-bold text-white mb-2">{vendor.subscription?.planType || 'FREE'}</div>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${vendor.subscription?.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${vendor.subscription?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                                        }`}></div>
                                    {vendor.subscription?.status || 'UNKNOWN'}
                                </div>
                                {vendor.subscription?.endDate && (
                                    <div className="mt-4 text-xs text-slate-500">
                                        Base plan expires on {safeFormatDate(vendor.subscription.endDate, 'MMM d, yyyy')}
                                    </div>
                                )}
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus('ACTIVE')}
                                        className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('SUSPENDED')}
                                        className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                                    >
                                        Suspend
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {PLAN_OPTIONS.map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => handleUpdatePlan(plan)}
                                        className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${vendor.subscription?.planType === plan
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {plan}
                                    </button>
                                ))
                                }
                            </div>
                        )}
                    </div>

                    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4">Contact Info</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-4">
                                <div className="min-w-[60px] text-slate-500">Phone</div>
                                <div className="text-white font-mono">{vendor.phoneNumber}</div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="min-w-[60px] text-slate-500">Lang</div>
                                <div className="text-white">{vendor.language || 'English'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
