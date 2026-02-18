import { Shield, Lock, Eye, FileText, Star, Clock } from 'lucide-react';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Privacy Policy - Data Security & Privacy at Kada Ledger",
    description: "Learn how Kada Ledger protects your business data. We use enterprise-grade encryption and strict privacy protocols to keep your financial records secure.",
    keywords: ["khata app privacy", "data security india", "digital ledger encryption", "Kada Ledger safety", "merchant data protection"],
    openGraph: {
        title: "Kada Ledger Privacy Policy - Your Data is Safe",
        description: "Our commitment to protecting your business financials.",
        images: ['/brand-logo-final.png'],
    }
};

export default function PrivacyPage() {
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

                <div className="container-width relative z-10 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Shield size={14} className="fill-blue-400" /> Security Center
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Your Privacy, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Our Priority</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        We believe that your financial data is your property.
                        Our systems are built to ensure total confidentiality and security.
                    </p>
                </div>
            </section>

            <section className="container-width relative z-10 px-6 pb-32">
                <div className="glass-card p-10 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-blue max-w-none">
                        <div className="flex items-center gap-4 mb-8 text-blue-400">
                            <Clock size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Last Updated: January 15, 2026</span>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-6">Introduction</h2>
                        <p className="text-blue-200/70 text-lg leading-relaxed mb-8">
                            At Kada Ledger, we are committed to protecting the privacy of our users. This Privacy Policy outlines how we collect, use, and safeguard your personal and business information when you use our platform.
                        </p>

                        <h3 className="text-2xl font-bold text-white mb-4">Information We Collect</h3>
                        <ul className="space-y-4 text-blue-200/70 mb-8 list-disc pl-6">
                            <li>Business details (Name, Address, Registration)</li>
                            <li>Contact information (Phone number, Email)</li>
                            <li>Transaction records and customer ledger data</li>
                            <li>Device information and usage logs for security monitoring</li>
                        </ul>

                        <h3 className="text-2xl font-bold text-white mb-4">How We Use Your Data</h3>
                        <p className="text-blue-200/70 mb-8 leading-relaxed">
                            Your data is strictly used to provide and improve the Kada Ledger service. This includes processing transactions, providing analytics, sending automated reminders (if enabled), and ensuring the security of your account. We never sell your data to third parties.
                        </p>

                        <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-8">
                            <h4 className="flex items-center gap-3 text-blue-400 font-bold mb-4">
                                <Lock size={20} /> Enterprise-Grade Encryption
                            </h4>
                            <p className="text-blue-200/80 text-sm italic">
                                All data transmitted between your device and our servers is encrypted using 256-bit SSL/TLS protocols. Your sensitive financial records are hashed and stored in secure, compartmentalized databases.
                            </p>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4">Your Rights</h3>
                        <p className="text-blue-200/70 leading-relaxed">
                            You have the right to access, rectify, or delete your data at any time. You can also request a portable copy of your ledger records for your own compliance needs.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
