'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, Users, CreditCard, BarChart2, FileText, Settings, LogOut, Crown } from 'lucide-react';

import GlobalSearch from '@/components/dashboard/global-search';
import SubscriptionModal from '@/components/dashboard/subscription-modal';
import { CustomerViewProvider } from '@/contexts/customer-view-context';
import { DataRefreshProvider } from '@/contexts/data-refresh-context';
import CustomerQuickViewModal from '@/components/dashboard/customer-quick-view-modal';
import SubscriptionLockScreen from '@/components/dashboard/subscription-lock-screen';
import MobileBottomNav from '@/components/dashboard/mobile-bottom-nav';
import { ModeToggle } from '@/components/dashboard/mode-toggle';

const API_URL = '/api';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/transactions', icon: CreditCard, label: 'Transactions' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const checkProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/vendor/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      const data = await res.json();
      setProfile(data as Record<string, unknown>);

      const businessName = (data as Record<string, unknown>).businessName;
      if (!businessName) {
        router.push('/onboarding');
      } else {
        setChecking(false);
      }
    } catch (e) {
      console.error('Profile check failed', e);
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    void checkProfile();
  }, [checkProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-500"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const subscription = profile?.subscription as Record<string, unknown> | undefined;
  const planType = subscription?.planType as string | undefined;
  const daysLeft = subscription?.daysLeft as number | undefined;

  const isPro = planType === 'MONTHLY' || planType === 'YEARLY' || planType === 'PROFESSIONAL' || planType === 'BUSINESS';
  const isExpired = typeof daysLeft === 'number' && daysLeft <= 0 && planType !== 'TRIAL';

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.exact) return currentPath === item.href;
    return currentPath.startsWith(item.href);
  };

  return (
    <DataRefreshProvider>
      <CustomerViewProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex relative overflow-x-hidden transition-colors duration-300">
          <SubscriptionModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
          <CustomerQuickViewModal />

          {/* Ambient Background - Dark Mode */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none hidden dark:block" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none hidden dark:block" aria-hidden="true" />

          {/* Mobile Sidebar Backdrop */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`w-64 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-white/5 fixed h-full z-40 flex flex-col transition-transform duration-300 ease-out ${
              isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
            }`}
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsMobileSidebarOpen(false)}>
                <Image
                  src="/brand-logo-final.png"
                  alt="Kada Ledger"
                  width={32}
                  height={32}
                  className="rounded-lg shadow-md shadow-blue-500/20"
                />
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Kada Ledger</span>
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={18} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm group ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                    {item.label}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom: Plan Status & Logout */}
            <div className="p-3 border-t border-slate-100 dark:border-white/5 space-y-2 flex-shrink-0">
              {isPro ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                  <Crown size={16} className="text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate">PRO Active</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">{daysLeft} days remaining</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20"
                >
                  <Crown size={16} className="flex-shrink-0" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
              >
                <LogOut size={16} className="flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
            {/* Top Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 flex items-center gap-3 px-4 py-3 h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </button>

              {/* Logo on mobile */}
              <Link href="/dashboard" className="md:hidden flex items-center gap-2 flex-shrink-0">
                <Image src="/brand-logo-final.png" alt="Kada Ledger" width={28} height={28} className="rounded-md" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Kada Ledger</span>
              </Link>

              {/* Search - grows to fill space */}
              <div className="flex-1">
                <GlobalSearch />
              </div>

              {/* Mode Toggle */}
              <div className="flex-shrink-0">
                <ModeToggle />
              </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 p-4 md:p-6 pb-24 md:pb-8">
              {/* Subscription Warning Banner */}
              {typeof daysLeft === 'number' && daysLeft <= 7 && daysLeft > 0 && (
                <div className="mb-6 p-3 md:p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-orange-500 flex-shrink-0">⚠️</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-orange-800 dark:text-orange-200 truncate">Plan expires in {daysLeft} days</p>
                      <p className="text-xs text-orange-600 dark:text-orange-300 hidden sm:block">Renew now to avoid interruption.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="flex-shrink-0 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Renew
                  </button>
                </div>
              )}

              {/* Lock Screen or Content */}
              {isExpired ? (
                <SubscriptionLockScreen onRenew={() => setIsUpgradeModalOpen(true)} />
              ) : (
                children
              )}
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </CustomerViewProvider>
    </DataRefreshProvider>
  );
}
