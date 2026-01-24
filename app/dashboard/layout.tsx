import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:block">
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">K</div>
                        <span className="text-xl font-bold text-slate-900">Kada</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
                        <span>🏠</span> Overview
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
                        <span>📊</span> Analytics
                    </Link>
                    <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
                        <span>💳</span> Transactions
                    </Link>
                    <Link href="/dashboard/reports" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
                        <span>📄</span> Reports
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
                        <span>⚙️</span> Settings
                    </Link>
                </nav>

                <div className="absolute bottom-8 left-0 w-full px-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 mb-1">Upgrade Plan</p>
                        <p className="text-xs text-blue-600 mb-3">Get unlimited reports and customers.</p>
                        <button className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg">Upgrade</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {/* Top Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">🔔</div>
                        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                            {/* Avatar */}
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}
