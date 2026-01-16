'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

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

  return (
    <>
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl transition-all duration-300 rounded-full border border-white/10 ${isScrolled
          ? 'bg-[#0B0F19]/80 backdrop-blur-xl shadow-lg shadow-blue-500/10 py-3'
          : 'bg-white/5 backdrop-blur-md py-4'
          }`}
      >
        <div className="px-6 md:px-8 flex items-center justify-between h-full">

          {/* Left: Desktop Nav Steps */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Testimonials', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-sm font-medium text-blue-100/80 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full opacity-100 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2 group absolute left-1/2 transform -translate-x-1/2">
            <div className="relative w-8 h-8">
              <img src="/logo.png" alt="Kada Ledger" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Kada Ledger
            </span>
          </Link>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register?plan=trial" className="bg-white/10 border border-white/10 text-white hover:bg-white/20 py-2.5 px-6 rounded-full text-sm font-bold backdrop-blur-md transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-blue-600/95 backdrop-blur-xl md:hidden pt-32 px-6 animate-fade-in-up">
          <div className="flex flex-col gap-6 text-lg text-center">
            {['Home', 'About', 'Testimonials', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="font-medium text-white/90 hover:text-white border-b border-blue-500 pb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-4 mt-4">
              <Link href="/login" className="w-full text-center py-3 font-semibold text-white border border-blue-400 rounded-xl hover:bg-blue-500">
                Login
              </Link>
              <Link href="/register?plan=trial" className="w-full text-center py-3 font-semibold bg-white text-blue-600 rounded-xl shadow-lg">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
