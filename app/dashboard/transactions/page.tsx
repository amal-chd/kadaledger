export default function TransactionsPage() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-900">Recent Transactions</h2>
                <button className="text-sm text-blue-600 font-medium">Export CSV</button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium text-right">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                    <span className="font-medium text-slate-900">John Doe</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-sm">Jan 15, 2026</td>
                            <td className="px-6 py-4 text-slate-600 text-sm">Credit</td>
                            <td className="px-6 py-4 text-right font-medium text-slate-900">₹500</td>
                            <td className="px-6 py-4">
                                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold">Pending</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
