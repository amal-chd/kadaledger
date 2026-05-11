'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, TrendingDown, Plus, Search,
  ArrowRight, IndianRupee, AlertTriangle, Wallet,
  ChevronRight, BarChart2, FileText
} from 'lucide-react';
import { useCustomerView } from '@/contexts/customer-view-context';
import { useDataRefresh } from '@/contexts/data-refresh-context';
import AddCustomerModal from '@/components/dashboard/add-customer-modal';
import toast from 'react-hot-toast';
import { useFirestoreVendorStats } from '@/hooks/use-firestore';
import Link from 'next/link';

function getVendorIdFromToken() {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('token');
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { userId?: string; sub?: string };
    return payload.userId || payload.sub;
  } catch {
    return undefined;
  }
}

interface DashboardStats {
  totalOutstanding?: number;
  todaysActivity?: { payments?: number; credits?: number };
  totalCustomers?: number;
  highRiskCustomers?: Array<{ id: string; name: string; balance: number }>;
}

interface VendorProfile {
  businessName?: string;
  subscription?: { planType?: string; daysLeft?: number };
}

export default function Dashboard() {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const router = useRouter();
  const { openCustomer } = useCustomerView();
  const { lastUpdate, triggerRefresh } = useDataRefresh();

  const vendorId = getVendorIdFromToken();
  const { stats: realtimeStats } = useFirestoreVendorStats(vendorId);

  const statsData: DashboardStats = {
    ...dashboardStats,
    ...(realtimeStats || {})
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resProfile, resStats] = await Promise.all([
        fetch('/api/vendor/profile', { headers }),
        fetch('/api/vendor/dashboard', { headers })
      ]);

      if (!resProfile.ok) throw new Error('Failed to fetch profile');

      const profileData = await resProfile.json() as VendorProfile;
      const statsResult = resStats.ok ? await resStats.json() as DashboardStats : {};

      setVendor(profileData);
      setDashboardStats(statsResult);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (lastUpdate.customer || lastUpdate.dashboard) {
      void fetchData();
    }
  }, [lastUpdate.customer, lastUpdate.dashboard, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Outstanding',
      value: `₹${(statsData?.totalOutstanding ?? 0).toLocaleString()}`,
      icon: Wallet,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
      desc: 'Net receivable',
      pulse: true,
    },
    {
      label: "Today's Collection",
      value: `₹${(statsData?.todaysActivity?.payments ?? 0).toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      desc: 'Cash received today',
      pulse: false,
    },
    {
      label: "Today's Credit",
      value: `₹${(statsData?.todaysActivity?.credits ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      desc: 'Credit given today',
      pulse: false,
    },
    {
      label: 'Total Customers',
      value: String(statsData?.totalCustomers ?? '—'),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      desc: 'Active profiles',
      pulse: false,
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'Add Customer', onClick: () => setIsAddCustomerOpen(true), color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25' },
    { icon: Search, label: 'Find Customer', href: '/dashboard/customers', color: 'bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-200 dark:border-white/15' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics', color: 'bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-200 dark:border-white/15' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports', color: 'bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-200 dark:border-white/15' },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hi, {vendor?.businessName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Here&apos;s your business overview
          </p>
        </div>
        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all text-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.3 }}
            className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} strokeWidth={2} />
              </div>
              {stat.pulse && (
                <span className="flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-0.5 truncate">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">{stat.value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {quickActions.map((action) => (
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${action.color}`}
            >
              <action.icon size={22} />
              <span>{action.label}</span>
            </Link>
          ) : (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${action.color}`}
            >
              <action.icon size={22} />
              <span>{action.label}</span>
            </button>
          )
        ))}
      </motion.div>

      {/* High Risk Customers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-red-500" />
            High Risk Customers
          </h3>
          <Link
            href="/dashboard/customers"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {statsData?.highRiskCustomers && statsData.highRiskCustomers.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {statsData.highRiskCustomers.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => openCustomer(c.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm flex-shrink-0">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                    <p className="text-xs text-red-500 dark:text-red-400">Overdue</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                    ₹{c.balance.toLocaleString()}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
              <IndianRupee size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All clear!</p>
            <p className="text-xs text-slate-400 mt-1">No overdue customers right now</p>
          </div>
        )}
      </motion.div>

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={() => {
          triggerRefresh('customer');
          triggerRefresh('dashboard');
          void fetchData();
        }}
      />
    </div>
  );
}
