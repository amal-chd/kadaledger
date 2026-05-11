'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Store, Globe, Save, Settings as SettingsIcon, Shield, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import DriveBackup from '@/components/dashboard/drive-backup';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/dashboard/mode-toggle';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({
    businessName: '',
    phoneNumber: '',
    language: 'English'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    void fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/vendor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json() as { businessName?: string; phoneNumber?: string; language?: string };
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
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        localStorage.removeItem('token');
        toast.success('Account deleted successfully');
        router.push('/');
      } else {
        const data = await res.json() as { error?: string };
        toast.error(data.error || 'Failed to delete account');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-5">
        {/* Business Profile */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Business Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Name</label>
              <div className="relative">
                <Store size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="Enter your business name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.phoneNumber}
                  disabled
                  className="w-full pl-9 pr-20 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
                />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">VERIFIED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-purple-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">App Language</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full pl-9 pr-8 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer text-sm"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Malayalam</option>
                  <option>Tamil</option>
                </select>
                <div className="absolute right-3 top-3.5 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">App Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
              </div>
              <ModeToggle />
            </div>
          </div>
        </section>

        {/* Data & Backup */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Data & Security</h2>
          </div>
          <DriveBackup />
        </section>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60 text-sm"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Account Actions */}
      <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <User size={18} className="text-slate-500" />
          Account
        </h2>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-700 dark:text-slate-300 transition-colors text-sm font-medium"
        >
          <LogOut size={16} className="text-slate-500" />
          Sign out of account
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete my account
        </button>
      </section>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Delete Account</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action is permanent and irreversible</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              All your data including customers, transactions, and reports will be permanently deleted. This cannot be undone.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type <span className="text-red-600 font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none text-sm tracking-widest"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteAccount()}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
