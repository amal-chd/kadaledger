import { TrendingUp, Users, Bell, Store, Cloud, Zap, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Powerful Features - India's Most Advanced Digital Khata & Ledger",
    description: "Discover the advanced features of Kada Ledger: AI-driven analytics, automated WhatsApp payment reminders, multi-store management, and biometric security.",
    keywords: ["khata app features", "digital ledger analytics", "automated payment reminders", "whatsapp khata book", "business management tools india"],
    openGraph: {
        title: "Kada Ledger Features - Built for Modern Commerce",
        description: "Scale your business with the most powerful digital khata tools.",
        images: ['/brand-logo-final.png'],
    }
};

const featuresJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kada Ledger",
    "applicationCategory": "BusinessApplication",
    "featureList": [
        "Real-Time Analytics",
        "Automated WhatsApp Reminders",
        "Multi-Store Management",
        "Secure Cloud Backup",
        "Offline Capabilities"
    ],
    "screenshot": "https://thekada.in/brand-logo-final.png"
};

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(featuresJsonLd) }}
            />

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-48 md:pb-32">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-mobile relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Star size={14} className="fill-blue-400" /> Platform Features
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Tools Built to Grow Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Business Empire</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Experience a suite of features designed to eliminate manual errors,
                        speed up collections, and give you total control over your financials.
                    </p>
                </div>
            </section>

            {/* Feature Bento Grid */}
            <section className="container-mobile relative z-10 pb-20 md:pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "AI-Driven Analytics",
                            icon: TrendingUp,
                            color: "blue",
                            desc: "Deep insights into your cash flow, seasonal trends, and customer payment behavior."
                        },
                        {
                            title: "Smart Reminders",
                            icon: Bell,
                            color: "emerald",
                            desc: "Automated WhatsApp & SMS reminders that help you collect payments 3x faster."
                        },
                        {
                            title: "Multi-Store Sync",
                            icon: Store,
                            color: "purple",
                            desc: "Centralized control for all your branches. Track sales and stock across every location."
                        },
                        {
                            title: "Cloud-Native Security",
                            icon: Cloud,
                            color: "indigo",
                            desc: "Military-grade encryption for all your data. Automatic backups mean you never lose a record."
                        },
                        {
                            title: "Hyper-Fast Performance",
                            icon: Zap,
                            color: "amber",
                            desc: "Lightning quick interface that works even on low-end devices and slow networks."
                        },
                        {
                            title: "Merchant Community",
                            icon: Users,
                            color: "pink",
                            desc: "Join a network of thousands of vendors and share insights to grow together."
                        },
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-10 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all group">
                            <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center text-${feature.color}-400 mb-8 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-blue-200/60 leading-relaxed mb-6">
                                {feature.desc}
                            </p>
                            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                Learn more <ArrowRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-32 glass-card p-12 md:p-20 rounded-[3.5rem] border border-blue-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to modernize your khata?</h2>
                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <Link href="/register" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30">
                                Get Started Specifically
                            </Link>
                            <Link href="/contact" className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
                                Talk to an Expert
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
