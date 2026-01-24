import { ArrowRight, CheckCircle2, Shield, Users, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen animate-float"></div>
            </div>

            <div className="container-width relative z-10 px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Empowering Small Businesses with <span className="text-blue-400 text-glow">Financial Clarity</span>
                    </h1>
                    <p className="text-blue-200/80 text-lg leading-relaxed">
                        At Kada Ledger, we believe every business deserves enterprise-grade financial tools. Our mission is to simplify ledger management for vendors across India.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {[
                        {
                            icon: Shield,
                            title: "Secure & Reliable",
                            desc: "Your financial data is encrypted and stored with the highest security standards."
                        },
                        {
                            icon: Users,
                            title: "Customer Centric",
                            desc: "Built with direct feedback from 1000+ local vendors to ensure usability."
                        },
                        {
                            icon: Trophy,
                            title: "Innovation First",
                            desc: "Constantly evolving with AI-driven insights and automated reporting features."
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card p-8 rounded-3xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-blue-200/60 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Team / Story Section */}
                <div className="max-w-5xl mx-auto glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/10 mb-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 z-0"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                            <div className="space-y-4 text-blue-200/70">
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
                            <div className="mt-8">
                                <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                                    Join Our Journey <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        {/* Placeholder for Team Image or Illustration */}
                        <div className="h-[300px] w-full rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700"></div>
                            <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
