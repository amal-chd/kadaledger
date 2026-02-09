import Link from 'next/link';
import { Twitter, Linkedin, Github, Facebook, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#050810] pt-12 md:pt-20 pb-8 md:pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>

            <div className="container-mobile relative z-10">

                {/* Subscribe Banner */}
                <div className="bg-blue-600 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-16 md:mb-24 shadow-2xl shadow-blue-600/20 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-lg text-center md:text-left">
                        <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Stay ahead of the curve</h3>
                        <p className="text-slate-200 text-sm md:text-lg">
                            Join 5,000+ merchants receiving insights.
                        </p>
                    </div>
                    <div className="relative z-10 w-full max-w-md">
                        <div className="flex bg-white/10 p-1.5 md:p-2 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/10">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-transparent border-none outline-none text-white placeholder-blue-100/50 px-4 md:px-6 w-full text-sm md:text-lg"
                            />
                            <button className="bg-white text-blue-900 px-5 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-base hover:bg-blue-50 transition-colors shadow-lg active:scale-95">
                                Join
                            </button>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-20 px-4">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2.5 mb-6 md:mb-8">
                            <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-white/10">
                                <Image src="/brand-logo-final.png" alt="Kada Ledger" fill sizes="36px" className="object-cover" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Kada Ledger</span>
                        </div>
                        <p className="text-slate-300/60 text-sm leading-relaxed mb-6 md:mb-8 font-medium italic">
                            "Transforming Bharat's traditional businesses into digital powerhouses."
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Github, href: '#' },
                                { icon: Facebook, href: '#' }
                            ].map((Social, i) => (
                                <Link
                                    key={i}
                                    href={Social.href}
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300/40 hover:bg-accent hover:text-white transition-all hover:-translate-y-1 hover:border-primary"
                                >
                                    <Social.icon size={16} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6 md:mb-8 uppercase text-[10px] md:text-xs tracking-[0.2em] opacity-40">Company</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-300/60 transition-colors">
                            {[
                                { label: 'Our Mission', href: '/about' },
                                { label: 'Get in Touch', href: '/contact' },
                                { label: 'Privacy Policy', href: '/legal/privacy' },
                                { label: 'Terms of Service', href: '/legal/terms' }
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6 md:mb-8 uppercase text-[10px] md:text-xs tracking-[0.2em] opacity-40">Product</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-300/60 font-medium">
                            {[
                                { label: 'Core Features', href: '/features' },
                                { label: 'Pricing Plans', href: '/pricing' },
                                { label: 'User Stories', href: '/testimonials' },
                                { label: 'Merchant Blog', href: '/blog' }
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-white mb-6 md:mb-8 uppercase text-[10px] md:text-xs tracking-[0.2em] opacity-40">Support</h4>
                        <ul className="space-y-4 md:space-y-6 text-xs md:text-sm">
                            <li className="glass-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                                <p className="text-[9px] md:text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Email us</p>
                                <a href="mailto:support@thekada.in" className="text-white hover:text-primary transition-colors font-medium">support@thekada.in</a>
                            </li>
                            <li className="glass-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                                <p className="text-[9px] md:text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Call Support</p>
                                <a href="tel:+919496491654" className="text-white hover:text-primary transition-colors font-medium">+91 9496 491 654</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs text-slate-300/30 font-medium">
                    <p>© 2026 Thekada Digital Ventures Pvt Ltd. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span>Made with ❤️ in Bharat</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
