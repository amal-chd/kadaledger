export default function PricingPage() {
    return (
        <div className="py-20 bg-slate-50">
            <div className="container-width text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                    Simple, Transparent <span className="gradient-text">Pricing</span>
                </h1>
                <p className="text-slate-600 max-w-xl mx-auto">
                    Choose the plan that best fits your business needs. No hidden fees.
                </p>
            </div>

            <div className="container-width grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Basic */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                    <p className="text-slate-500 mb-6 text-sm">Perfect for small shops.</p>
                    <div className="text-4xl font-bold text-slate-900 mb-6">Free<span className="text-lg font-normal text-slate-500">/mo</span></div>
                    <ul className="space-y-4 mb-8 text-left">
                        <li className="flex items-center text-slate-600 text-sm">✅ Up to 50 Customers</li>
                        <li className="flex items-center text-slate-600 text-sm">✅ Basic Reporting</li>
                        <li className="flex items-center text-slate-600 text-sm">✅ Mobile App Access</li>
                    </ul>
                    <button className="w-full btn-secondary">Get Started</button>
                </div>

                {/* Pro */}
                <div className="bg-white p-8 rounded-3xl border-2 border-blue-600 relative shadow-xl transform scale-105">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
                    <p className="text-slate-500 mb-6 text-sm">For growing businesses.</p>
                    <div className="text-4xl font-bold text-slate-900 mb-6">₹499<span className="text-lg font-normal text-slate-500">/mo</span></div>
                    <ul className="space-y-4 mb-8 text-left">
                        <li className="flex items-center text-slate-700 font-medium text-sm">✅ Unlimited Customers</li>
                        <li className="flex items-center text-slate-700 font-medium text-sm">✅ Advanced Analytics</li>
                        <li className="flex items-center text-slate-700 font-medium text-sm">✅ WhatsApp Reminders</li>
                        <li className="flex items-center text-slate-700 font-medium text-sm">✅ Multi-User Access</li>
                    </ul>
                    <button className="w-full btn-primary">Start Free Trial</button>
                </div>

                {/* Enterprise */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
                    <p className="text-slate-500 mb-6 text-sm">For franchise chains.</p>
                    <div className="text-4xl font-bold text-slate-900 mb-6">Custom</div>
                    <ul className="space-y-4 mb-8 text-left">
                        <li className="flex items-center text-slate-600 text-sm">✅ Dedicated Support</li>
                        <li className="flex items-center text-slate-600 text-sm">✅ Custom Integrations</li>
                        <li className="flex items-center text-slate-600 text-sm">✅ White Labeling</li>
                    </ul>
                    <button className="w-full btn-secondary">Contact Sales</button>
                </div>
            </div>
        </div>
    );
}
