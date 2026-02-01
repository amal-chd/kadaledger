'use client';
import { Quote, Star, MessageSquare } from 'lucide-react';
import Aurora from '@/components/marketing/Aurora';
import Link from 'next/link';

export default function TestimonialsContent() {
    const testimonials = [
        {
            name: "Rajesh Kumar",
            role: "Kirana Store Owner",
            content: "Earlier I used manual books for credit management, which was very messy. Kada Ledger has simplified everything. Now I get my payments on time.",
            location: "Kochi, Kerala"
        },
        {
            name: "Sneha Reddy",
            role: "Boutique Owner",
            content: "The invoicing feature is a lifesaver. I can send professional GST bills to my customers on WhatsApp in just 2 clicks. Highly recommended!",
            location: "Bangalore, Karnataka"
        },
        {
            name: "Amit Verma",
            role: "Wholesale Trader",
            content: "I manage 3 different shops using Kada Ledger. The reports are detailed and help me understand which shop is performing better. Great app!",
            location: "Mumbai, Maharashtra"
        },
        {
            name: "Deepa S.",
            role: "Home Baker",
            content: "As a small business owner, I needed something simple. This app is very easy to use and looks beautiful. The customer support is also very helpful.",
            location: "Chennai, Tamil Nadu"
        },
        {
            name: "Vikram Singh",
            role: "Electronics Dealer",
            content: "The credit recovery rate has improved significantly since I started using the automated reminder feature. My cash flow is much better now.",
            location: "Delhi, NCR"
        },
        {
            name: "Anjali Gupta",
            role: "Pharmacy Owner",
            content: "Security was my main concern, but Kada Ledger feels very safe. The daily backup feature gives me peace of mind.",
            location: "Pune, Maharashtra"
        }
    ];

    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            {/* Hero Section */}
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
                        <MessageSquare size={14} className="fill-blue-400" /> Success Stories
                    </div>
                    <h1 className="text-3xl md:text-7xl font-bold text-white mb-6 md:mb-8 leading-[1.2] md:leading-[1.1]">
                        Trusted by Bharat's <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Leading Merchants</span>
                    </h1>
                    <p className="text-blue-100/70 text-sm md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                        Join over 10,000+ businesses across India who have transformed
                        their financial management with Kada Ledger.
                    </p>
                </div>
            </section>

            <section className="container-width relative z-10 px-4 pb-20 md:pb-32">
                {/* Testimonials Bento Grid */}
                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((item, idx) => (
                        <div key={idx} className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 -rotate-12 group-hover:opacity-10 transition-opacity">
                                <Quote size={60} className="md:w-[80px] md:h-[80px]" />
                            </div>
                            <div className="flex gap-1 text-blue-400 mb-4 md:mb-6">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-blue-400 md:w-[14px] md:h-[14px]" />)}
                            </div>
                            <p className="text-blue-100/80 text-sm md:text-base leading-relaxed mb-6 md:mb-10 italic relative z-10">
                                "{item.content}"
                            </p>
                            <div className="flex items-center gap-3 md:gap-4 relative z-10">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg border border-white/10">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base md:text-lg">{item.name}</h4>
                                    <p className="text-xs md:text-sm text-blue-200/60 font-medium">{item.role}</p>
                                    <div className="mt-1 flex items-center gap-1.5 opacity-40">
                                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                                        <span className="text-[9px] md:text-[10px] text-blue-300 uppercase tracking-widest font-bold">{item.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-16 md:mt-32 glass-card p-8 md:p-20 rounded-[2.5rem] md:rounded-[3.5rem] border border-blue-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8">Ready to be our next success story?</h2>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
                            <Link href="/register" className="bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30">
                                Start Free Trial
                            </Link>
                            <Link href="/pricing" className="bg-white/5 border border-white/10 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-white/10 transition-all backdrop-blur-md">
                                View our Plans
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
