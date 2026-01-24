export default function FeaturesPage() {
    return (
        <div className="pb-20">
            {/* Hero */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 -z-10" />
                <div className="container-width text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-geist-sans tracking-tight">
                        Powerful Features to <br />
                        <span className="gradient-text">Simplify Your Finances</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                        Everything you need to manage your business credits, payments, and customer relationships in one platform.
                    </p>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="container-width -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Real-Time Analytics", icon: "📊", desc: "Track cash flow, daily sales, and pending collections instantly." },
                        { title: "Customer Management", icon: "👥", desc: "Maintain detailed customer profiles and transaction history." },
                        { title: "Automated Reminders", icon: "🔔", desc: "Send payment reminders via WhatsApp or SMS automatically." },
                        { title: "Multi-Store Support", icon: "🏪", desc: "Manage multiple branches from a single admin dashboard." },
                        { title: "Secure Cloud Sync", icon: "☁️", desc: "Your data is encrypted and synced across all your devices." },
                        { title: "Offline Mode", icon: "⚡", desc: "Keep working even without internet. Data syncs when you're back online." },
                    ].map((feature, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
