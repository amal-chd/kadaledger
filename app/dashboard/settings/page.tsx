'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Store, Globe, Save, Settings as SettingsIcon, Shield } from 'lucide-react';
import DriveBackup from '@/components/dashboard/drive-backup';

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState({
        businessName: '',
        phoneNumber: '',
        language: 'English'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/vendor/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setProfile({
                    businessName: data.businessName || '',
                    phoneNumber: data.phoneNumber || '',
                    language: data.language || 'English'
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/vendor/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                toast.success('Settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                {/* Account Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Store size={20} className="text-blue-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Business Profile</h2>
                    </div>
                    <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
                        {/* Decorative bg */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="grid md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={profile.businessName}
                                        onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Enter your business name"
                                    />
                                    <Store size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                <div className="relative opacity-75">
                                    <input
                                        type="text"
                                        value={profile.phoneNumber}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                    <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <div className="absolute right-3 top-3.5 text-xs font-bold text-slate-400 bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded">VERIFIED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe size={20} className="text-purple-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Preferences</h2>
                    </div>
                    <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="max-w-md space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">App Language</label>
                            <div className="relative">
                                <select
                                    value={profile.language}
                                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Malayalam</option>
                                    <option>Tamil</option>
                                </select>
                                <Globe size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <div className="absolute right-3.5 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data & Backup Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield size={20} className="text-green-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Data & Security</h2>
                    </div>
                    <DriveBackup />
                </section>

                {/* Fixed Save Button */}
                <div className="fixed bottom-6 right-6 z-30">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 disabled:scale-95 active:scale-95"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
}
