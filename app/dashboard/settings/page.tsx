'use client';
import { useState, useEffect } from 'react';

import toast from 'react-hot-toast';
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
                method: 'PATCH', // Assuming PATCH for partial update
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

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Account Settings */}
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Account Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                            <input
                                type="text"
                                value={profile.businessName}
                                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={profile.phoneNumber}
                                disabled
                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Phone number cannot be changed.</p>
                        </div>
                    </div>
                </div>

                {/* Data Backup */}
                <DriveBackup />

                {/* Preferences */}
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Preferences</h2>

                    <div className="space-y-6">

                        <div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                            <select
                                value={profile.language}
                                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Malayalam</option>
                                <option>Tamil</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </form>
        </div>
    );
}
