'use client';
import { useState } from 'react';
import { Send, Bell, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function PushCampaignsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'ALL', // ALL, PAID, FREE
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ success: true, ...data });
                setFormData({ title: '', body: '', target: 'ALL' });
            } else {
                setResult({ success: false, error: data.error || 'Failed to send' });
            }
        } catch (error) {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Push Campaigns</h1>
                <p className="text-slate-400">Send announcements, updates, or alerts to vendors.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2 space-y-6">
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
                                    placeholder="e.g., Diwali Offer"
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
                                    placeholder="Keep it short and catchy..."
                                />
                                <div className="text-right text-xs text-slate-500 mt-1">
                                    {formData.body.length}/150
                                </div>
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
                                            {type === 'ALL' ? 'All Vendors' : `${type} Only`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Campaign
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Result Alert */}
                    {result && (
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${result.success
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <div>
                                <h4 className="font-bold text-sm">
                                    {result.success ? 'Campaign Sent Successfully' : 'Submission Failed'}
                                </h4>
                                <p className="text-xs opacity-90 mt-1">
                                    {result.success
                                        ? `Sent to ${result.sentCount} devices (${result.failureCount} failed).`
                                        : result.error
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Preview</h3>
                    <div className="bg-black/40 border border-white/10 rounded-[2rem] p-4 max-w-[280px] mx-auto relative overflow-hidden">
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-xl z-10" />

                        {/* Status Bar */}
                        <div className="flex justify-between px-2 py-1 mb-4 text-[10px] text-white">
                            <span>9:41</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 bg-white/20 rounded-full" />
                                <div className="w-3 h-3 bg-white/20 rounded-full" />
                            </div>
                        </div>

                        {/* Wallpaper */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 -z-10" />

                        {/* Notification Card */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-2 shadow-lg border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                                    <Bell size={10} className="text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white/90">KADA LEDGER</span>
                                <span className="text-[10px] text-white/50 ml-auto">Now</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1 leading-tight">
                                {formData.title || 'Campaign Title'}
                            </h4>
                            <p className="text-xs text-white/80 leading-relaxed">
                                {formData.body || 'Your message body will appear here. Keep it concise for better engagement.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                            <Users size={14} />
                            <span>Audience Estimate</span>
                        </div>
                        <p className="text-slate-400 text-xs">
                            Calculating audience size is dynamic.
                            <br />Target: <span className="text-white font-medium">{formData.target} Vendors</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
