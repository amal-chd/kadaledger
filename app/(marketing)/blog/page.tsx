import { Newspaper, ArrowRight, Calendar, User, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';
import { getAllPosts } from '@/lib/blog-api';

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
    const blogPosts = getAllPosts();

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
                    {blogPosts.map((post, i) => (
                        <Link href={`/blog/${post.slug}`} key={i} className="group glass-card rounded-[2rem] border border-white/10 overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 transition-all flex flex-col cursor-pointer bg-[#0a0f1e]">
                            <div className="aspect-[16/9] relative overflow-hidden">
                                <img
                                    src={post.image}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    alt={post.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white border border-white/20">
                                            {post.author[0]}
                                        </div>
                                        <span className="text-white text-xs font-semibold drop-shadow-md">{post.author}</span>
                                    </div>
                                    <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                                        {post.readTime}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col relative z-20">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-blue-400 text-xs font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Read Article <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
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
