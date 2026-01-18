import { CheckCircle2, Star, Zap, Shield, Crown } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Pricing Plans - Best Value Khata App for Businesses",
    description: "Explore affordable pricing plans for Kada Ledger. Choose from Starter, Pro, or Enterprise plans to manage your business ledger and credits with automated reminders.",
    keywords: ["khata book price", "digital ledger cost", "Kada Ledger plans", "business accounting pricing india", "ledger book subscription"],
    openGraph: {
        title: "Kada Ledger Pricing - Simple & Transparent",
        description: "Choose the perfect plan to digitize your business finance.",
        images: ['/brand-logo-final.png'],
    }
};

const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Kada Ledger Subscription",
    "description": "Digital credit book and ledger management for businesses.",
    "brand": {
        "@type": "Brand",
        "name": "Kada Ledger"
    },
    "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "0",
        "highPrice": "9990",
        "priceCurrency": "INR",
        "offerCount": "3"
    }
};

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
            />

            {/* Hero Section with Aurora */}
            <section className="relative pt-24 pb-12 md:pt-48 md:pb-24">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-width relative z-10 px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
                        <Zap size={14} className="fill-blue-400" /> Flexible Plans
                    </div>
                    <h1 className="text-3xl md:text-7xl font-bold text-white mb-6 md:mb-8 leading-[1.2] md:leading-[1.1]">
                        Simple, Transparent<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pricing for Bharat</span>
                    </h1>
                    <p className="text-blue-100/70 text-sm md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                        Choose the plan that best fits your business needs.
                        No hidden fees, no complexity. Scale as you grow.
                    </p>
                </div>
            </section>

            <section className="relative z-10 px-4 pb-20 md:pb-32">
                <div className="container-width grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Basic */}
                    <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 flex flex-col hover:border-blue-500/20 transition-all duration-500">
                        <div className="mb-6 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 mb-4 md:mb-6">
                                <Shield size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Starter</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">Perfect for small shops & individual vendors.</p>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <span className="text-4xl md:text-5xl font-bold text-white">Free</span>
                            <span className="text-blue-200/50 ml-2 text-sm">forever</span>
                        </div>
                        <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 text-left flex-1">
                            {[
                                "Up to 50 Customers",
                                "Basic Reporting",
                                "Mobile App Access",
                                "Basic Transactions",
                                "Email Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/70 text-xs md:text-sm font-medium">
                                    <CheckCircle2 size={14} className="text-blue-500 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm md:text-base text-center hover:bg-white/10 transition-all">
                            Get Started
                        </Link>
                    </div>

                    {/* Pro */}
                    <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-blue-600/30 bg-blue-600/5 relative shadow-2xl shadow-blue-900/20 transform md:scale-105 flex flex-col">
                        <div className="absolute top-0 right-6 md:right-10 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] md:text-[10px] uppercase tracking-widest font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg">
                            Most Popular
                        </div>
                        <div className="mb-6 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 md:mb-6">
                                <Crown size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Professional</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">Designed for growing retail businesses.</p>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <span className="text-4xl md:text-5xl font-bold text-white">₹499</span>
                            <span className="text-blue-200/50 ml-2 text-sm">/ month</span>
                        </div>
                        <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 text-left flex-1">
                            {[
                                "Unlimited Customers",
                                "Advanced Analytics",
                                "WhatsApp Reminders",
                                "Multi-User Access",
                                "GST Invoicing",
                                "Priority Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/90 text-xs md:text-sm font-semibold">
                                    <CheckCircle2 size={14} className="text-blue-400 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 text-white font-bold text-sm md:text-base text-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Enterprise */}
                    <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 flex flex-col hover:border-purple-500/20 transition-all duration-500">
                        <div className="mb-6 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 mb-4 md:mb-6">
                                <Shield size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Business</h3>
                            <p className="text-blue-200/50 text-xs md:text-sm">For multi-store chains & franchises.</p>
                        </div>
                        <div className="mb-6 md:mb-8">
                            <span className="text-4xl md:text-5xl font-bold text-white">Custom</span>
                        </div>
                        <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 text-left flex-1">
                            {[
                                "Custom Dashboard",
                                "Franchise Management",
                                "White Labeling",
                                "API Integrations",
                                "Dedicated Account Manager",
                                "24/7 Phone Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 md:gap-3 text-blue-100/70 text-xs md:text-sm font-medium">
                                    <CheckCircle2 size={14} className="text-purple-500 shrink-0 md:w-4 md:h-4" /> {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact" className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm md:text-base text-center hover:bg-white/10 transition-all">
                            Contact Sales
                        </Link>
                    </div>
                </div>

                {/* FAQ Link */}
                <div className="mt-20 text-center">
                    <p className="text-blue-200/40 text-sm">
                        All plans include 256-bit encryption & localized cloud backup. <br />
                        Need a custom quote? <Link href="/contact" className="text-blue-400 hover:underline">Chat with us</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
