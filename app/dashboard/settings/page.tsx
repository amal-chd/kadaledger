export default function SettingsPage() {
    return (
        <div className="max-w-2xl bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" defaultValue="My Awesome Store" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" defaultValue="Amit Kumar" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" defaultValue="+91 98765 43210" disabled />
                </div>

                <hr className="border-slate-100 my-6" />

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-slate-900">Dark Mode</h3>
                        <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-slate-900">Email Notifications</h3>
                        <p className="text-xs text-slate-500">Receive weekly summaries.</p>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>

                <div className="pt-6">
                    <button className="btn-primary w-full">Save Changes</button>
                </div>
            </div>
        </div>
    );
}
