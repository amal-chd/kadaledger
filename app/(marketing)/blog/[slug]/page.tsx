
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag } from 'lucide-react';
import Aurora from '@/components/marketing/Aurora';
import TableOfContents from '@/components/marketing/TableOfContents';
import { getPostBySlug, getPostSlugs } from '@/lib/blog-api';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | Kada Ledger Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        }
    };
}

export async function generateStaticParams() {
    const slugs = getPostSlugs();
    return slugs.map((slug) => ({
        slug: slug.replace('.json', ''),
    }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.image,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "datePublished": post.date, // Needs ISO format ideally, but string is okay for basic
        "description": post.excerpt
    };

    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-x-hidden">

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Progress Bar (Optional - could add scroll listener later) */}

            <article className="relative">
                {/* Hero Header */}
                <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#050810] z-10"></div>
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-30 blur-sm scale-105" />
                    </div>

                    <div className="container-width relative z-20 max-w-5xl mx-auto text-center">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-8 font-medium bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/10">
                            <ArrowLeft size={16} /> Back to Blog
                        </Link>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-blue-200/60 text-xs uppercase tracking-widest font-bold mb-6">
                            <span className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 text-blue-300">
                                <Calendar size={12} /> {post.date}
                            </span>
                            <span className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 text-purple-300">
                                <Clock size={12} /> {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                {post.author[0]}
                            </div>
                            <div className="text-left">
                                <p className="text-white text-sm font-bold">{post.author}</p>
                                <p className="text-blue-200/50 text-xs">Financial Expert</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                {/* Content Body with Sidebar Layout */}
                <div className="container-width max-w-7xl mx-auto px-6 pb-24 relative z-20">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Sidebar (Desktop Only) */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <TableOfContents />
                        </aside>

                        {/* Main Article Content */}
                        <div className="flex-1 min-w-0">
                            <div className="p-8 md:p-14 lg:p-20 rounded-[2rem] border border-white/10 shadow-2xl bg-[#0B1120] relative overflow-hidden">
                                {/* Top decoration */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

                                <div
                                    className="prose prose-invert prose-lg md:prose-xl max-w-none 
                                    text-gray-300
                                    prose-headings:font-bold prose-headings:text-white prose-headings:scroll-mt-32
                                    prose-p:text-gray-300 prose-p:leading-8 prose-p:mb-10 prose-p:text-[1.2rem] prose-p:font-normal
                                    prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                                    prose-li:text-gray-300 prose-li:marker:text-blue-500 prose-li:my-3 prose-li:leading-relaxed
                                    prose-strong:text-white prose-strong:font-bold
                                    [&>h2]:text-3xl lg:[&>h2]:text-4xl [&>h2]:mt-24 [&>h2]:mb-12 [&>h2]:pb-6 [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-4
                                    [&>h3]:text-2xl [&>h3]:mt-16 [&>h3]:mb-8 [&>h3]:text-white [&>h3]:font-semibold
                                    [&>ul]:my-12 [&>ul]:space-y-4 [&>ul]:bg-[#111827] [&>ul]:p-10 [&>ul]:rounded-3xl [&>ul]:border [&>ul]:border-white/5
                                    [&>div.highlight-box]:bg-blue-900/10 [&>div.highlight-box]:p-10 [&>div.highlight-box]:rounded-3xl [&>div.highlight-box]:border-l-4 [&>div.highlight-box]:border-blue-500 [&>div.highlight-box]:my-16
                                    [&>p.lead-paragraph]:text-2xl [&>p.lead-paragraph]:leading-loose [&>p.lead-paragraph]:text-blue-200 [&>p.lead-paragraph]:font-light [&>p.lead-paragraph]:mb-16
                                    "
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>

                            {/* Author & Tags */}
                            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex flex-wrap items-center gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-4 py-2 rounded-xl bg-[#0f1629] text-gray-300 text-sm font-medium border border-white/5 hover:border-blue-500/50 hover:text-white transition-colors cursor-default shadow-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="flex items-center gap-3 text-white bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 whitespace-nowrap">
                                    <Share2 size={20} /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* CTA Section */}
            <section className="container-width px-6 pb-24">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/50">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Digitize Your Khata?</h2>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">Join 10,000+ smart merchants who have switched to Kada Ledger today.</p>
                        <Link href="/register" className="inline-block bg-white text-blue-700 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                            Get Started for Free
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
