import { BookOpen, Video, HelpCircle, LifeBuoy, FileText, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Resources & Support - Help Center for Kada Ledger",
    description: "Access detailed guides, video tutorials, and technical resources for Kada Ledger. Everything you need to master your digital khata book.",
    keywords: ["khata app tutorials", "digital ledger guides", "Kada Ledger help center", "how to use khata book", "business tools documentation"],
    openGraph: {
        title: "Kada Ledger Resources - Master Your Business Finance",
        description: "Learn how to get the most out of your digital khata book.",
        images: ['/brand-logo-final.png'],
    }
};

const resourcesJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Kada Ledger Resource Center",
    "description": "Guides and tutorials for digital ledger management."
};

export default function ResourcesPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(resourcesJsonLd) }}
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

                <div className="container-mobile relative z-10 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <BookOpen size={14} className="fill-blue-400" /> Resource Hub
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        Master Your Digital <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ledger Empire</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Comprehensive guides, expert tutorials, and documentation designed to
                        help you thrive in the digital economy.
                    </p>
                </div>
            </section>

            <section className="container-mobile relative z-10 px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            title: "Getting Started Guide",
                            icon: BookOpen,
                            color: "blue",
                            desc: "Learn the fundamentals of setting up your store, adding your first customer, and recording transactions.",
                            link: "#"
                        },
                        {
                            title: "Video Tutorials",
                            icon: Video,
                            color: "emerald",
                            desc: "Visual step-by-step walkthroughs of advanced features like multi-store sync and credit analytics.",
                            link: "#"
                        },
                        {
                            title: "FAQ Center",
                            icon: HelpCircle,
                            color: "purple",
                            desc: "Instant answers to common questions about billing, security, data backup, and WhatsApp reminders.",
                            link: "#"
                        },
                        {
                            title: "Technical Support",
                            icon: LifeBuoy,
                            color: "pink",
                            desc: "Need hands-on assistance? Our dedicated support team is available 24/7 to resolve your issues.",
                            link: "/contact"
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-10 rounded-[3rem] border border-white/5 hover:bg-white/5 transition-all group">
                            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-400 mb-8 group-hover:scale-110 transition-transform`}>
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-blue-200/60 leading-relaxed mb-8">
                                {item.desc}
                            </p>
                            <Link href={item.link} className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                                Explore <ArrowRight size={14} />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Additional Docs Section */}
                <div className="mt-20 glass-card p-10 md:p-14 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-blue-400">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white mb-1">Developer API Docs</h4>
                            <p className="text-blue-200/50 text-sm">Integrate Kada Ledger with your existing POS or ERP systems.</p>
                        </div>
                    </div>
                    <Link href="#" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3">
                        Read API Specs <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
