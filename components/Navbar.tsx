'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

import Image from 'next/image';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 md:top-6 left-0 md:left-1/2 md:-translate-x-1/2 z-50 w-full md:w-[94%] md:max-w-5xl transition-all duration-700 rounded-b-3xl md:rounded-full border md:border ${isScrolled
          ? 'bg-[#0B0F19]/70 backdrop-blur-2xl border-white/10 md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2'
          : 'bg-white/[0.03] backdrop-blur-xl border-white/5 py-3 md:py-4'
          }`}
      >
        <div className="px-5 md:px-8 flex items-center justify-between h-full">

          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-white/10 shadow-2xl group-hover:scale-110 transition-all duration-500">
              <Image src="/brand-logo-final.png" alt="Kada Ledger" fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Kada<span className="text-primary">Ledger</span>
            </span>
          </Link>

          {/* Center: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-[13px] font-bold text-slate-200/50 hover:text-white transition-all relative group"
              >
                {item.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-blue-500 rounded-full transition-all scale-x-0 group-hover:scale-x-100 opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></span>
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3 md:gap-6 shrink-0">
            <Link href="/login" className="text-[13px] font-bold text-slate-200/80 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register?plan=trial" className="relative group overflow-hidden bg-blue-600 px-6 py-2.5 rounded-full font-bold text-[13px] text-white hover:bg-blue-700 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95">
              <div className="flex items-center gap-2 relative z-10">
                Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden flex flex-col pt-24 px-4 sm:px-6 animate-in fade-in slide-in-from-top-10 duration-500 overflow-y-auto pb-10">
          <div className="flex flex-col gap-6 text-center glass-card bg-[#0B0F19]/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-white/20 shadow-3xl">
            <div className="flex flex-col gap-4">
              {navLinks.map((item, idx) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xl sm:text-2xl font-bold text-white/90 hover:text-primary transition-colors py-2"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="h-px bg-white/5 w-full my-4"></div>
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="w-full text-center py-4 font-bold text-slate-200 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-md active:scale-95 transition-all hover:bg-white/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register?plan=trial"
                className="w-full text-center py-4 font-bold bg-accent text-white rounded-2xl shadow-2xl shadow-accent/30 active:scale-95 transition-all text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>

            {/* Subtle Brand Info in Menu */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-300/30 uppercase tracking-[0.3em] font-black">
                Thekada Digital Ventures
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
