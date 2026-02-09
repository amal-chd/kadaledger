'use client';
import { useEffect, useState } from 'react';
import { Shield, Bell, Lock, Activity, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('System maintenance in progress. Please try again later.');
    const [campaignsEnabled, setCampaignsEnabled] = useState(true);

    // Admin Profile State
    const [adminName, setAdminName] = useState('Super Admin');
    const [adminEmail, setAdminEmail] = useState('admin@kadaledger.com');

    useEffect(() => {
        fetchSettings();
    }, []);

    const getAuthHeader = (): HeadersInit => {
        const token = localStorage.getItem('admin_token');
        return token ? ({ Authorization: `Bearer ${token}` } as HeadersInit) : ({} as HeadersInit);
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings', {
                headers: getAuthHeader(),
            });
            if (!res.ok) return;
            const data = await res.json();
            setMaintenanceMode(Boolean(data.maintenanceMode));
            if (data.maintenanceMessage) setMaintenanceMessage(String(data.maintenanceMessage));
            if (data.adminName) setAdminName(String(data.adminName));
            if (data.supportEmail) setAdminEmail(String(data.supportEmail));
            setCampaignsEnabled(data.campaignsEnabled !== false);
        } catch (error) {
            console.error('Failed to load admin settings', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (payload: Record<string, unknown>, successMsg: string) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                toast.error('Failed to update settings');
                return;
            }
            toast.success(successMsg);
        } catch {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = () => {
        saveSettings({ adminName, supportEmail: adminEmail, maintenanceMessage }, 'Admin settings updated');
    };

    const toggleMaintenanceObject = () => {
        const nextValue = !maintenanceMode;
        setMaintenanceMode(nextValue);
        saveSettings({ maintenanceMode: nextValue }, nextValue ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
        if (nextValue) {
            toast('Maintenance Mode Enabled', { icon: '🚧' });
        } else {
            toast.success('Maintenance Mode Disabled');
        }
    };

    const toggleCampaigns = () => {
        const nextValue = !campaignsEnabled;
        setCampaignsEnabled(nextValue);
        saveSettings({ campaignsEnabled: nextValue }, nextValue ? 'Campaigns enabled' : 'Campaigns disabled');
    };

    if (loading) {
        return <div className="text-white text-center py-20">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage system configurations and admin preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* System Status Section */}
                <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-purple-500" />
                        System Status
                    </h2>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <div className="font-medium text-white">Maintenance Mode</div>
                            <div className="text-sm text-slate-400">Suspend vendor access for scheduled maintenance</div>
                        </div>
                        <button
                            onClick={toggleMaintenanceObject}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] focus:ring-purple-500 ${maintenanceMode ? 'bg-purple-600' : 'bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-slate-300">Maintenance Message</label>
                        <textarea
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            rows={2}
                            className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <div className="font-medium text-white">Campaign Broadcasting</div>
                            <div className="text-sm text-slate-400">Allow or block admin push campaigns globally</div>
                        </div>
                        <button
                            onClick={toggleCampaigns}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${campaignsEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${campaignsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Admin Profile Section */}
                <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-blue-500" />
                        Admin Profile
                    </h2>

                    <div className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Display Name</label>
                                <input
                                    type="text"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section Placeholder */}
                <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6 opacity-60">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-emerald-500" />
                        Security (Coming Soon)
                    </h2>
                    <p className="text-slate-400 text-sm">Two-factor authentication and API key management will be available in the next update.</p>
                </div>
            </div>
        </div>
    );
}
