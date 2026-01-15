import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-slate-100">
      <div className="container-width flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Kada Ledger</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</Link>
          <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Blog</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-semibold text-slate-700 hover:text-blue-600">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary py-2.5 px-5 text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
