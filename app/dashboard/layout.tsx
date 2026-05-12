'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import GlobalSearch from '@/components/dashboard/global-search';
import { CustomerViewProvider } from '@/contexts/customer-view-context';
import { DataRefreshProvider } from '@/contexts/data-refresh-context';
import CustomerQuickViewModal from '@/components/dashboard/customer-quick-view-modal';
import { ModeToggle } from '@/components/dashboard/mode-toggle';

const API_URL = '/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            setProfile(data);

            if (!data.businessName) {
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

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
            </div>
        );
    }

    return (
        <DataRefreshProvider>
            <CustomerViewProvider>
                <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex relative overflow-hidden transition-colors duration-300">
                    <CustomerQuickViewModal />

                    {/* Ambient Background Effects - Dark Mode Only */}
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none hidden dark:block"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none hidden dark:block"></div>

                    {/* Mobile Sidebar Backdrop */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    <aside className={`w-64 bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl fixed h-full z-40 transition-all duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                        } md:block`}>
                        <div className="h-24 flex items-center justify-between px-8 border-b border-slate-100 dark:border-white/5">
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <Image src="/brand-logo-final.png" alt="Kada Ledger" width={40} height={40} className="rounded-xl shadow-lg shadow-blue-500/20" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Kada Ledger</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        <nav className="p-4 space-y-2">
                            {[
                                { href: '/dashboard', icon: '🏠', label: 'Overview' },
                                { href: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
                                { href: '/dashboard/customers', icon: '👥', label: 'Customers' },
                                { href: '/dashboard/transactions', icon: '💳', label: 'Transactions' },
                                { href: '/dashboard/reports', icon: '📄', label: 'Reports' },
                                { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3.5 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white rounded-xl transition-all duration-200 font-medium group"
                                >
                                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="absolute bottom-8 left-0 w-full px-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-600/20 dark:to-emerald-600/20 border border-green-100 dark:border-green-500/20 p-5 rounded-2xl relative text-center">
                                <p className="text-xs font-bold text-green-800 dark:text-green-200 mb-1">FREE TO USE</p>
                                <p className="text-xs text-green-600 dark:text-green-200/70 mb-2">All features unlocked!</p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 md:ml-64 p-0 relative z-10">
                        <div className="app-mobile-container py-4 md:py-8">
                            {/* Top Header */}
                            <header className="flex md:justify-center justify-between items-center mb-6 md:mb-10 relative">
                                {/* Mobile Menu Button */}
                                <div className="md:hidden">
                                    <button
                                        onClick={() => setIsMobileSidebarOpen(true)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                                    >
                                        <Menu size={24} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>

                                {/* Search - Centered */}
                                <div className="w-full max-w-2xl px-4">
                                    <GlobalSearch />
                                </div>

                                <div className="w-10 md:hidden"></div>
                            </header>

                            {children}
                        </div>
                    </main>
                </div>
            </CustomerViewProvider>
        </DataRefreshProvider>
    );
}
