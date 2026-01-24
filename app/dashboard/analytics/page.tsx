export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-slate-900">₹1,24,500</p>
                    <span className="text-green-500 text-sm font-medium">↑ 12% vs last month</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm mb-2">Outstanding Credits</h3>
                    <p className="text-3xl font-bold text-slate-900">₹45,200</p>
                    <span className="text-red-500 text-sm font-medium">↑ 5% vs last month</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm mb-2">Active Customers</h3>
                    <p className="text-3xl font-bold text-slate-900">342</p>
                    <span className="text-green-500 text-sm font-medium">↑ 8 new this week</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-96 flex items-center justify-center">
                <p className="text-slate-400">Detailed Revenue Chart Placeholder</p>
            </div>
        </div>
    );
}
