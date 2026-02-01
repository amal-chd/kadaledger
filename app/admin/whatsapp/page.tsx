'use client';

import { useState } from 'react';
import { LucidePlus, LucideMessageSquare, LucideHistory } from 'lucide-react';
import { WHATSAPP_TEMPLATES } from '@/lib/whatsapp-templates';

export default function WhatsAppManagement() {
    const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">WhatsApp Integration</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'templates' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'logs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Message Logs
                </button>
            </div>

            {activeTab === 'templates' ? <TemplatesView /> : <LogsView />}
        </div>
    );
}

function TemplatesView() {
    // Real Data from Config
    const templates = WHATSAPP_TEMPLATES;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Message Templates</h2>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                    <LucidePlus size={16} />
                    New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-700 rounded-xl group-hover:bg-slate-600 transition-colors">
                                <LucideMessageSquare className="text-slate-300" size={24} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${t.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {t.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">Language: {t.language === 'en' ? 'English' : 'Malayalam'}</p>

                        <div className="mt-auto bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <p className="text-slate-400 text-xs whitespace-pre-wrap font-mono">{t.content}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {t.variables.map(v => (
                                <span key={v} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                    {`{{${v}}}`}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LogsView() {
    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-8 text-center text-slate-500">
                <LucideHistory className="mx-auto mb-4 opacity-50" size={48} />
                <p>No message logs available yet.</p>
            </div>
        </div>
    );
}
