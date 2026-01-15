import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-visible">
                {/* Gradient Background */}
                <div className="absolute top-0 left-0 w-full h-[80vh] gradient-hero rounded-b-[3rem] md:rounded-b-[5rem] -z-10" />

                <div className="container-width text-center text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-8 animate-fade-in-up">
                        <span className="text-xs font-bold bg-blue-500 px-2 py-0.5 rounded text-white">NEW</span>
                        <span className="text-sm font-medium">Kada Ledger 2.0 is live!</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Powerful Features to <br className="hidden md:block" />
                        Simplify Your <span className="text-blue-100">Financial</span>
                    </h1>

                    <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Unlock the Full Potential of Your Finances with Our Feature-Rich Platform.
                        Track credits, manage customers, and grow your business today.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto bg-white/10 p-2 rounded-full backdrop-blur-lg border border-white/20">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full bg-transparent px-6 py-3 text-white placeholder-blue-200 focus:outline-none"
                        />
                        <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg">
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Floating UI Mockup */}
                <div className="container-width mt-16 md:mt-24 relative">
                    <div className="relative mx-auto max-w-5xl">
                        {/* Main Dashboard Preview (Glassmorphic) */}
                        <div className="glass-card rounded-3xl p-4 md:p-6 premium-shadow transform rotate-x-12 perspective-1000">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-[16/9] flex items-center justify-center bg-slate-50">
                                <p className="text-slate-400 font-medium">Dashboard Preview</p>
                                {/* In a real scenario, use <Image /> here for the dashboard screenshot */}
                            </div>
                        </div>

                        {/* Floating Mobile Preview 1 */}
                        <div className="absolute -right-4 md:-right-12 top-1/4 w-48 md:w-64 glass-card p-3 rounded-3xl premium-shadow animate-float-slow">
                            <div className="bg-white rounded-2xl h-80 w-full flex flex-col p-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
                                <div className="w-3/4 h-4 bg-slate-100 rounded mb-2"></div>
                                <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                            </div>
                        </div>

                        {/* Floating Mobile Preview 2 */}
                        <div className="absolute -left-4 md:-left-12 bottom-1/4 w-48 md:w-64 glass-card p-3 rounded-3xl premium-shadow animate-float-delayed">
                            <div className="bg-white rounded-2xl h-64 w-full p-4">
                                <div className="flex justify-between mb-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                                    <div className="w-8 h-2 bg-slate-100 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-8 bg-slate-50 rounded"></div>
                                    <div className="w-full h-8 bg-slate-50 rounded"></div>
                                    <div className="w-full h-8 bg-slate-50 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Logos */}
            <section className="py-12 border-b border-slate-100">
                <div className="container-width flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                    {['Logoipsum', 'Logoipsum', 'Logoipsum', 'Logoipsum', 'Logoipsum'].map((logo, i) => (
                        <div key={i} className="text-xl font-bold font-geist-sans text-slate-800 flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-800 rounded-full"></div> {logo}
                        </div>
                    ))}
                </div>
            </section>

            {/* Key Features Section */}
            <section className="py-24 bg-white">
                <div className="container-width">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                            Key Features of Our Financial <br />
                            <span className="text-blue-600">SaaS Platform</span>
                        </h2>
                        <p className="text-lg text-slate-600">
                            Everything you need to manage your business efficiently.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-24">
                        <div>
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-6">1</div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Real-Time Analytics</h3>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Unlock immediate access to crucial financial data. Track cash flow, monitor expenses, and forecast trends instantly.
                            </p>
                            <button className="btn-primary">Learn More</button>
                        </div>
                        <div className="glass-card p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            {/* Placeholder for Analytics Chart UI */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm h-80 flex flex-col justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">My Balance</p>
                                    <h4 className="text-3xl font-bold text-slate-900">$2,259 <span className="text-sm font-normal text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+20%</span></h4>
                                </div>
                                <div className="flex items-end gap-2 h-32">
                                    {[40, 60, 45, 90, 70, 85].map((h, i) => (
                                        <div key={i} className="flex-1 bg-blue-500 rounded-t-md opacity-80" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1 glass-card p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <div className="bg-white rounded-2xl p-6 shadow-sm h-80 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="inline-flex gap-4 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                                        <div className="w-10 h-10 bg-green-100 rounded-full"></div>
                                        <div className="w-10 h-10 bg-purple-100 rounded-full"></div>
                                    </div>
                                    <p className="text-slate-900 font-bold">Seamless Integration</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-6">2</div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Seamless Integration</h3>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Connect effortlessly with your existing tools. Our platform ensures smooth transitions and minimal disruption.
                            </p>
                            <button className="btn-secondary">Explore Integrations</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
