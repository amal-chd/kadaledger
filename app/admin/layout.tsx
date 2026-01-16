'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LucideLayoutDashboard, LucideUsers, LucideMessageCircle, LucideLogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // If on login page, don't check auth
        if (pathname === '/admin/login') {
            setAuthorized(true);
            return;
        }

        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) return null;

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Kada Admin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem href="/admin/dashboard" icon={LucideLayoutDashboard} label="Dashboard" active={pathname === '/admin/dashboard'} />
                    <NavItem href="/admin/vendors" icon={LucideUsers} label="Vendor Management" active={pathname.startsWith('/admin/vendors')} />
                    <NavItem href="/admin/whatsapp" icon={LucideMessageCircle} label="WhatsApp" active={pathname.startsWith('/admin/whatsapp')} />
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_token');
                            router.push('/admin/login');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                    >
                        <LucideLogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label, active }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
}
