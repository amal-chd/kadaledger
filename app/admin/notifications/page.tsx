'use client';
import { useMemo, useState, useEffect } from 'react';
import { Send, Bell, Users, CheckCircle, AlertCircle, Loader2, RefreshCcw, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignResult {
    success: boolean;
    sentCount?: number;
    failureCount?: number;
    totalDevices?: number;
    targetVendors?: number;
    error?: string;
    note?: string;
}

export default function PushCampaignsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CampaignResult | null>(null);
    const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'broadcast' | 'history' | 'test'>('broadcast');
    const [statsLoading, setStatsLoading] = useState(true);
    const [audienceStats, setAudienceStats] = useState({ totalVendors: 0, activePaid: 0, activeFree: 0 });

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'ALL', // ALL, PAID, FREE
    });
    const [testData, setTestData] = useState({
        title: '',
        body: '',
        testVendorId: '',
        testToken: '',
    });

    useEffect(() => {
        fetchAudienceStats();
        fetchCampaignHistory();
    }, []);

    const fetchCampaignHistory = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setCampaignHistory([]);
                return;
            }
            const res = await fetch('/api/admin/campaigns?limit=30', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                setCampaignHistory([]);
                return;
            }
            const data = await res.json();
            setCampaignHistory(Array.isArray(data) ? data : []);
        } catch {
            setCampaignHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchAudienceStats = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setAudienceStats({ totalVendors: 0, activePaid: 0, activeFree: 0 });
                return;
            }

            const res = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                setAudienceStats({ totalVendors: 0, activePaid: 0, activeFree: 0 });
                return;
            }

            const data = await res.json();
            const recentVendors = Array.isArray(data?.recentVendors) ? data.recentVendors : [];
            const paid = recentVendors.filter((v: any) => {
                const p = String(v?.subscription?.planType || '').toUpperCase();
                return p !== '' && p !== 'TRIAL' && p !== 'FREE';
            }).length;
            const free = recentVendors.length - paid;

            setAudienceStats({
                totalVendors: data?.overview?.totalVendors ?? recentVendors.length,
                activePaid: paid,
                activeFree: free,
            });
        } catch {
            setAudienceStats({ totalVendors: 0, activePaid: 0, activeFree: 0 });
        } finally {
            setStatsLoading(false);
        }
    };

    const targetLabel = useMemo(() => {
        if (formData.target === 'PAID') return 'Paid Vendors';
        if (formData.target === 'FREE') return 'Free/Trial Vendors';
        return 'All Vendors';
    }, [formData.target]);

    const estimatedAudience = useMemo(() => {
        if (formData.target === 'PAID') return audienceStats.activePaid;
        if (formData.target === 'FREE') return audienceStats.activeFree;
        return audienceStats.totalVendors;
    }, [formData.target, audienceStats]);

    const canSubmit = formData.title.trim().length > 2 && formData.body.trim().length > 4 && !loading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                setResult({
                    success: true,
                    sentCount: data.sentCount,
                    failureCount: data.failureCount,
                    totalDevices: data.totalDevices,
                    targetVendors: data.targetVendors,
                });
                setFormData({ title: '', body: '', target: 'ALL' });
                fetchCampaignHistory();
            } else {
                setResult({ success: false, error: data.error || `Failed (${res.status})` });
            }
        } catch {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testData.testVendorId.trim() && !testData.testToken.trim()) {
            setResult({ success: false, error: 'Provide a test vendor ID or a test device token.' });
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: testData.title,
                    body: testData.body,
                    target: 'ALL',
                    mode: 'TEST',
                    testVendorId: testData.testVendorId || undefined,
                    testToken: testData.testToken || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, ...data });
                fetchCampaignHistory();
            } else {
                setResult({ success: false, error: data.error || `Failed (${res.status})` });
            }
        } catch {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const retryCampaign = async (campaignId: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`/api/admin/campaigns/${campaignId}/retry`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();
            if (!res.ok) {
                setResult({ success: false, error: data.error || 'Retry failed' });
                return;
            }
            setResult({ success: true, ...data });
            fetchCampaignHistory();
        } catch {
            setResult({ success: false, error: 'Retry failed' });
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Push Campaigns</h1>
                    <p className="text-slate-400">Send announcements, updates, and reminders to your vendor app users.</p>
                </div>
                <button
                    onClick={fetchAudienceStats}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <RefreshCcw size={15} />
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-2">
                {[
                    { key: 'broadcast', label: 'Broadcast' },
                    { key: 'test', label: 'Test Push' },
                    { key: 'history', label: 'History' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${activeTab === tab.key
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-[#0B0F19] border-white/10 text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'broadcast' && (
                        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Campaign Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        maxLength={50}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="e.g., Diwali offer unlocked"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Message Body</label>
                                    <textarea
                                        required
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        rows={4}
                                        maxLength={150}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Keep it short and actionable..."
                                    />
                                    <div className="text-right text-xs text-slate-500 mt-1">{formData.body.length}/150</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['ALL', 'PAID', 'FREE'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, target: type })}
                                                className={`
                                                py-3 px-4 rounded-xl border text-sm font-medium transition-all
                                                ${formData.target === type
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                    }
                                            `}
                                            >
                                                {type === 'ALL' ? 'All' : type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Campaign
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'test' && (
                        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6">
                            <form onSubmit={handleSendTest} className="space-y-4">
                                <input
                                    type="text"
                                    value={testData.title}
                                    onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                                    placeholder="Test title"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    required
                                />
                                <textarea
                                    value={testData.body}
                                    onChange={(e) => setTestData({ ...testData, body: e.target.value })}
                                    placeholder="Test message body"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                    rows={3}
                                    required
                                />
                                <input
                                    type="text"
                                    value={testData.testVendorId}
                                    onChange={(e) => setTestData({ ...testData, testVendorId: e.target.value })}
                                    placeholder="Test Vendor ID (optional if token provided)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                                <input
                                    type="text"
                                    value={testData.testToken}
                                    onChange={(e) => setTestData({ ...testData, testToken: e.target.value })}
                                    placeholder="FCM Device Token (optional)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Send Test Push
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4">
                            {historyLoading ? (
                                <div className="text-slate-400 text-sm p-4">Loading campaign history...</div>
                            ) : campaignHistory.length === 0 ? (
                                <div className="text-slate-500 text-sm p-4">No campaigns sent yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {campaignHistory.map((campaign) => (
                                        <div key={campaign.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-white font-semibold">{campaign.title}</div>
                                                    <div className="text-slate-400 text-xs mt-1">
                                                        {format(new Date(campaign.createdAt), 'MMM d, yyyy h:mm a')} | {campaign.target} | {campaign.mode || 'BROADCAST'}
                                                    </div>
                                                    <div className="text-slate-300 text-sm mt-2">{campaign.message}</div>
                                                    <div className="text-xs text-slate-400 mt-2">
                                                        Sent: {campaign.sentCount || 0} | Failed: {campaign.failureCount || 0} | Devices: {campaign.totalDevices || 0}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => retryCampaign(campaign.id)}
                                                    className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 inline-flex items-center gap-1"
                                                >
                                                    <RotateCcw size={12} />
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {result && (
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            result.success
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <div>
                                <h4 className="font-bold text-sm">
                                    {result.success ? 'Operation Successful' : 'Submission Failed'}
                                </h4>
                                <p className="text-xs opacity-90 mt-1">
                                    {result.success
                                        ? `Sent: ${result.sentCount ?? 0}, Failed: ${result.failureCount ?? 0}, Devices: ${result.totalDevices ?? 0}, Vendors: ${result.targetVendors ?? 0}${result.note ? ` | ${result.note}` : ''}`
                                        : result.error}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Preview</h3>
                    <div className="bg-black/40 border border-white/10 rounded-[2rem] p-4 max-w-[280px] mx-auto relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-xl z-10" />
                        <div className="flex justify-between px-2 py-1 mb-4 text-[10px] text-white">
                            <span>9:41</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-white/20 rounded-full" />
                                <div className="w-3 h-3 bg-white/20 rounded-full" />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 -z-10" />
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-2 shadow-lg border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                                    <Bell size={10} className="text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white/90">KADA LEDGER</span>
                                <span className="text-[10px] text-white/50 ml-auto">Now</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1 leading-tight">
                                {(activeTab === 'test' ? testData.title : formData.title) || 'Campaign Title'}
                            </h4>
                            <p className="text-xs text-white/80 leading-relaxed">
                                {(activeTab === 'test' ? testData.body : formData.body) || 'Your message body will appear here. Keep it concise for better engagement.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                            <Users size={14} />
                            <span>Audience Estimate</span>
                        </div>
                        {statsLoading ? (
                            <p className="text-slate-400 text-xs">Loading audience...</p>
                        ) : (
                            <p className="text-slate-300 text-xs leading-6">
                                Target: <span className="text-white font-medium">{targetLabel}</span>
                                <br />
                                Estimated vendors: <span className="text-white font-medium">{estimatedAudience}</span>
                                <br />
                                Total vendors: <span className="text-white font-medium">{audienceStats.totalVendors}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
