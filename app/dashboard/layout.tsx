'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import GlobalSearch from '@/components/dashboard/global-search';
import SubscriptionModal from '@/components/dashboard/subscription-modal';
import { CustomerViewProvider } from '@/contexts/customer-view-context';
import { DataRefreshProvider } from '@/contexts/data-refresh-context';
import CustomerQuickViewModal from '@/components/dashboard/customer-quick-view-modal';

const API_URL = '/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        checkProfile();
    }, []);

    const checkProfile = async () => {
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
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
            </div>
        );
    }

    const isPro = profile?.subscription?.planType === 'PROFESSIONAL' || profile?.subscription?.planType === 'BUSINESS';

    return (
        <DataRefreshProvider>
            <CustomerViewProvider>
                <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex relative overflow-hidden transition-colors duration-300">
                    <SubscriptionModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
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

                    {/* Sidebar */}
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
                            {!isPro ? (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-600/20 dark:to-indigo-600/20 border border-blue-100 dark:border-blue-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl group-hover:bg-blue-500/20 transition-colors hidden dark:block"></div>
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-1 relative z-10">PRO Plan</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-200/70 mb-4 relative z-10">Get unlimited reports and AI insights.</p>
                                    <button onClick={() => setIsUpgradeModalOpen(true)} className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all relative z-10">
                                        Upgrade Now
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-600/20 dark:to-emerald-600/20 border border-green-100 dark:border-green-500/20 p-5 rounded-2xl relative text-center">
                                    <p className="text-xs font-bold text-green-800 dark:text-green-200 mb-1">PRO Active</p>
                                    <p className="text-xs text-green-600 dark:text-green-200/70">Thanks for being a premium member!</p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 md:ml-64 p-4 md:p-8 relative z-10">
                        {/* Top Header */}
                        <header className="flex justify-between items-center mb-6 md:mb-10">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                            >
                                <Menu size={24} className="text-slate-600 dark:text-slate-400" />
                            </button>

                            <div className="hidden md:block w-full max-w-md">
                                <GlobalSearch />
                            </div>

                            <div className="flex items-center gap-6">
                                <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    🔔
                                </button>
                                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg p-0.5">
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                        {profile?.businessName?.substring(0, 2).toUpperCase() || 'US'}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {children}
                    </main>
                </div>
            </CustomerViewProvider>
        </DataRefreshProvider>
    );
}
