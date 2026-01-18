import { Newspaper, ArrowRight, Calendar, User, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Blog & Updates - Financial Insights for Bharat's Merchants",
    description: "Expert tips on ledger management, digital accounting, and business growth strategies for Indian small businesses from the Kada Ledger team.",
    keywords: ["khata management tips", "digital ledger blog", "small business accounting india", "Kada Ledger news", "fintech insights bharat"],
    openGraph: {
        title: "Kada Ledger Blog - Empowering Your Business",
        description: "Stay updated with the latest trends in digital khata and credit management.",
        images: ['/brand-logo-final.png'],
    }
};

const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Kada Ledger Blog",
    "description": "Insights and updates for Indian merchants on digital ledger management.",
    "publisher": {
        "@type": "Organization",
        "name": "Kada Ledger"
    }
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
            />

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
                        <Newspaper size={14} className="fill-blue-400" /> Insights & News
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Knowledge to Scale <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Your Retail Empire</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Expert perspectives on digital finance, customer management,
                        and the evolving landscape of Indian commerce.
                    </p>
                </div>
            </section>

            <section className="container-width relative z-10 px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "How to Collect Payments 3x Faster with WhatsApp",
                            excerpt: "Discover the psychology behind automated reminders and how digital khata reduces follow-up stress.",
                            date: "Jan 15, 2024",
                            author: "Rahul S.",
                            readTime: "5 min read",
                            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974&auto=format&fit=crop"
                        },
                        {
                            title: "The Future of Digital Ledger in Tier 2 Indian Cities",
                            excerpt: "Why thousands of merchants in smaller towns are ditching paper books for digital ledger apps.",
                            date: "Jan 12, 2024",
                            author: "Priya M.",
                            readTime: "8 min read",
                            image: "https://images.unsplash.com/photo-1542382257-80dee2700bd2?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            title: "Managing Multiple Branches: A Super Admin's Guide",
                            excerpt: "Learn how to use multi-store sync to keep track of sales across all your locations effortlessly.",
                            date: "Jan 10, 2024",
                            author: "Arun K.",
                            readTime: "6 min read",
                            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        }
                    ].map((post, i) => (
                        <div key={i} className="group glass-card rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-blue-500/20 transition-all flex flex-col">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={post.image}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                                    alt={post.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050810] to-transparent"></div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                                        {post.author[0]}
                                    </div>
                                    <span className="text-white text-xs font-bold">{post.author}</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-blue-200/40 text-[10px] uppercase tracking-widest font-bold mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-blue-200/60 text-sm leading-relaxed mb-8 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-blue-400 font-bold text-sm">
                                    Read Article <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter Subscription */}
                <div className="mt-32 glass-card p-10 md:p-16 rounded-[3rem] border border-blue-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 z-0"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-8">
                            <Star size={32} />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stay ahead of the curve</h2>
                        <p className="text-blue-200/50 text-lg mb-10">Get the latest financial management tips and platform updates delivered to your inbox.</p>
                        <form className="flex flex-col md:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Enter your business email"
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                            />
                            <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 whitespace-nowrap">
                                Subscribe Now
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
