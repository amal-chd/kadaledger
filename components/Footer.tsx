import Link from 'next/link';
import { Twitter, Linkedin, Github, Facebook, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0B0F19] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>

            <div className="container-width relative z-10">

                {/* Subscribe Banner */}
                <div className="bg-blue-600 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-20 shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-3xl font-bold mb-4">Subscribe to get updated</h3>
                        <p className="text-blue-100">
                            Get the latest updates, news, and special offers directly in your inbox.
                        </p>
                    </div>
                    <div className="relative z-10 w-full max-w-md">
                        <div className="flex bg-blue-700/50 p-2 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-transparent border-none outline-none text-white placeholder-blue-200/50 px-4 w-full"
                            />
                            <button className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 px-4">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl font-bold text-white tracking-tight">Kada Ledger</span>
                        </div>
                        <p className="text-blue-200/70 text-sm leading-relaxed mb-6 font-medium">
                            Automate your life with our smart solutions. Control everything from one place.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Github, href: '#' },
                                { icon: Facebook, href: '#' }
                            ].map((Social, i) => (
                                <Link
                                    key={i}
                                    href={Social.href}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-110 hover:border-blue-500"
                                >
                                    <Social.icon size={16} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Categories</h4>
                        <ul className="space-y-3 text-sm text-blue-200/60 hover:text-blue-100 transition-colors">
                            {['Product Management', 'Design / Creative', 'Education & Training', 'UI/UX Designers', 'Development', 'Customer Support'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="hover:text-white transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">About</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {['About Us', 'Partnerships', 'Finance Experts', 'Project Management', 'Product Manager', 'The Team'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="hover:text-blue-400 transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Follow Us</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {['Facebook', 'Twitter', 'Instagram', 'Linkedin'].map(item => (
                                <li key={item}>
                                    <Link href="#" className="hover:text-blue-400 transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>Copyright @ 2026. All rights reserved Kada Ledger.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
