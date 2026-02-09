import { ArrowRight, CheckCircle2, Shield, Users, Trophy, Target, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "About Kada Ledger - Empowering Bharat's Merchants with Digital Khata",
    description: "Discover how Kada Ledger is revolutionizing credit and ledger management for Indian small businesses. Learn about our mission, vision, and the team driving financial inclusion.",
    keywords: ["About Kada Ledger", "Digital Khata Team", "Fintech India", "Small Business Tools Bharat", "Ledger Management Vision", "online credit book team", "khata book founders"],
    openGraph: {
        title: "About Kada Ledger - Our Mission and Story",
        description: "Building the future of digital credit management for Indian merchants.",
        images: ['/brand-logo-final.png'],
    }
};

const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
        "@type": "Organization",
        "name": "Kada Ledger",
        "description": "Kada Ledger is a premium digital credit book and khata application designed for Indian small and medium businesses.",
        "url": "https://thekada.in",
        "logo": "https://thekada.in/brand-logo-final.png",
        "foundingDate": "2024"
    }
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
            />
            {/* Hero Section with Aurora */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-mobile relative z-10 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Star size={14} className="fill-blue-400" /> Our Mission
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Empowering Bharat's Merchants with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Financial Clarity</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
                        At Kada Ledger, we believe every business deserves enterprise-grade financial tools.
                        We're building the infrastructure that simplifies credit management for millions of vendors across India.
                    </p>
                </div>
            </section>

            <div className="container-mobile relative z-10 px-6 pb-32">
                {/* Bento Grid Values */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-32">
                    <div className="md:col-span-8 glass-card p-10 md:p-14 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity">
                            <Target size={300} strokeWidth={1} className="text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
                            <p className="text-blue-200/70 text-lg leading-relaxed max-w-xl">
                                To be the operating system for small businesses in India, bridging the gap between traditional bookkeeping and modern digital finance. We aim to bring order to the informal economy through technology.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-4 glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8">
                            <Globe size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Pan-India Reach</h3>
                            <p className="text-blue-200/60 leading-relaxed">
                                Supporting merchants from Kerala to Kashmir with localized features and vernacular support.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-4 glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Trust First</h3>
                            <p className="text-blue-200/60 leading-relaxed">
                                Bank-grade security for every transaction. Your data is your most valuable asset, and we protect it accordingly.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-8 glass-card p-10 md:p-14 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8">
                                    <Users size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-6">User-Led Growth</h2>
                                <p className="text-blue-200/70 text-lg leading-relaxed">
                                    Every feature we've built comes from direct conversations with real business owners. We don't just build software; we solve daily business struggles.
                                </p>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-50"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full"></div>
                            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 overflow-hidden group">
                                <img
                                    src="/about/mission-story.jpg"
                                    alt="Our Team"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-[#050810]/40 mix-blend-multiply"></div>
                            </div>
                        </div>
                        <div>
                            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                                The Journey
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">The Best Digital Khata App <br /><span className="text-blue-500">Built for Bharat</span></h2>
                            <div className="space-y-6 text-blue-200/70 text-lg font-light leading-relaxed">
                                <p>
                                    Started in 2024, Kada Ledger was born out of a simple observation: modern accounting software was too complex for the fast-paced life of a local shop owner.
                                </p>
                                <p>
                                    We set out to build something different. A tool that feels like a natural extension of your business—fast, intuitive, and visually stunning.
                                </p>
                                <p>
                                    Today, we handle thousands of transactions daily, helping business owners reclaim their time and focus on what they do best: growing their business.
                                </p>
                            </div>
                            <div className="mt-12 flex items-center gap-6">
                                <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                                    Join the Community
                                </Link>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-white">10K+</span>
                                    <span className="text-xs text-blue-200/50 uppercase tracking-widest font-bold">Active Vendors</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
