import { FileText, Scale, Gavel, CheckCircle, Star, Clock } from 'lucide-react';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Terms of Service - Kada Ledger Business Agreement",
    description: "Understand the terms and conditions for using Kada Ledger. We believe in transparent, fair business rules that protect both merchants and our platform.",
    keywords: ["khata app terms", "business agreement india", "digital ledger legal", "Kada Ledger conditions", "SaaS terms of service"],
    openGraph: {
        title: "Kada Ledger Terms of Service - Transparent & Fair",
        description: "Review our commitment to a fair business relationship.",
        images: ['/brand-logo-final.png'],
    }
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-24">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-width relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Scale size={14} className="fill-blue-400" /> Legal Framework
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Clear Terms for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Better Business</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Our terms are designed to provide a secure and reliable environment
                        for your digital accounting and customer management.
                    </p>
                </div>
            </section>

            <section className="container-width relative z-10 pb-32">
                <div className="glass-card p-10 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-blue max-w-none">
                        <div className="flex items-center gap-4 mb-8 text-blue-400">
                            <Clock size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Last Updated: January 15, 2026</span>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-6">Agreement to Terms</h2>
                        <p className="text-blue-200/70 text-lg leading-relaxed mb-8">
                            By accessing or using Kada Ledger, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using our services.
                        </p>

                        <h3 className="text-2xl font-bold text-white mb-4">Service Description</h3>
                        <p className="text-blue-200/70 mb-8">
                            Kada Ledger provides a digital cloud-based platform for merchants to manage customer credit, transactions, and payments. Our service includes web access, mobile applications, and automated communication tools.
                        </p>

                        <h3 className="text-2xl font-bold text-white mb-4">User Responsibilities</h3>
                        <ul className="space-y-4 text-blue-200/70 mb-8 list-none">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-blue-400 shrink-0 mt-1" />
                                <span>You must provide accurate and complete business information.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-blue-400 shrink-0 mt-1" />
                                <span>You are responsible for maintaining the confidentiality of your account.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-blue-400 shrink-0 mt-1" />
                                <span>You must not use the service for any illegal or unauthorized purpose.</span>
                            </li>
                        </ul>

                        <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 mb-8">
                            <h4 className="flex items-center gap-3 text-amber-400 font-bold mb-4">
                                <Gavel size={20} /> Fair Use Policy
                            </h4>
                            <p className="text-blue-200/80 text-sm">
                                We reserve the right to limit or terminate service for accounts that exhibit abnormal usage patterns or attempt to reverse-engineer our proprietary systems.
                            </p>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4">Subscription & Payments</h3>
                        <p className="text-blue-200/70 leading-relaxed">
                            Some features of Kada Ledger require a paid subscription. All fees are non-refundable except where required by Indian consumer law. We reserve the right to modify our pricing with prior notice.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
