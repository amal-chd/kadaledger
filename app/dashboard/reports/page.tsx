export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📄</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Monthly Statement</h2>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">Download a detailed summary of all credits and payments for the selected month.</p>
                <button className="btn-primary">Download PDF</button>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mt-8">Past Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['December 2025', 'November 2025', 'October 2025'].map((month) => (
                    <div key={month} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-900">{month}</p>
                            <p className="text-xs text-slate-500">Generated on 1st of month</p>
                        </div>
                        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">⬇️</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
