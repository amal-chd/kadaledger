'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Menu,
    X,
    Settings,
    Shield,
    Layers,
    Bell
} from 'lucide-react';
import Image from 'next/image';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [checking, setChecking] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        if (pathname === '/admin/login') {
            setChecking(false);
            return;
        }

        // Simple auth check
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        // Decode token to check role (basic client-side check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'ADMIN') {
                router.push('/admin/login');
                return;
            }
        } catch (e) {
            localStorage.removeItem('admin_token');
            router.push('/admin/login');
            return;
        }

        setChecking(false);
    }, [pathname, router]);

    useEffect(() => {
        if (pathname === '/admin/login') return;

        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                if (!token) return;
                const res = await fetch('/api/admin/settings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                setMaintenanceMode(Boolean(data.maintenanceMode));
            } catch {
                // ignore settings fetch failures in layout
            }
        };
        fetchSettings();
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    const navItems = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/plans', label: 'Plans', icon: Layers },
        { href: '/admin/vendors', label: 'Vendors', icon: Users },
        { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
        { href: '/admin/notifications', label: 'Campaigns', icon: Bell },
    ];

    if (checking) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0B0F19] border-r border-white/10 
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-20 flex items-center px-6 border-b border-white/5">
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                                <Shield className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">Admin</h1>
                                <p className="text-xs text-slate-400">Kada Ledger</p>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        {maintenanceMode && (
                            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300">
                                Maintenance Mode
                            </span>
                        )}
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-white">Super Admin</p>
                            <p className="text-xs text-slate-400">admin@kadaledger.com</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <Users size={20} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
