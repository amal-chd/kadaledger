import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-12">
            <div className="container-width">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                                K
                            </div>
                            <span className="text-xl font-bold text-slate-900">Kada Ledger</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Simplifying financial management for local businesses. Track credits, payments, and grow your business with ease.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li><Link href="/features" className="hover:text-blue-600">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
                            <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
                            <li><Link href="/download" className="hover:text-blue-600">Mobile App</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                            <li><Link href="/careers" className="hover:text-blue-600">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li><Link href="/legal/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/resources" className="hover:text-blue-600">Help Center</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2026 Kada Ledger. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/legal/privacy" className="hover:text-slate-900">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-slate-900">Terms</Link>
                        <Link href="/sitemap" className="hover:text-slate-900">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
