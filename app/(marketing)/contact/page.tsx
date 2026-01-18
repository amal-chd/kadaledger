import { Mail, MapPin, Phone, MessageSquare, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/marketing/contact-form';
import Aurora from '@/components/marketing/Aurora';

export const metadata = {
    title: "Contact Us - 24/7 Expert Support for Kada Ledger",
    description: "Get in touch with the Kada Ledger support and sales team. We're here to help you digitize your business finances. Available via phone, email, and visit at our Kannur office.",
    keywords: ["Kada Ledger customer care", "khata app support", "digital ledger contact", "ledger management support india", "Kada Ledger office address"],
    openGraph: {
        title: "Contact Kada Ledger - We're Here to Help",
        description: "Reach out to us for support, sales, or partnership inquiries.",
        images: ['/brand-logo-final.png'],
    }
};

const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
        "@type": "Organization",
        "name": "Kada Ledger",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+91 9496 491 654",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Malayalam", "Hindi"]
            }
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "KTP Tower, Thalap",
            "addressLocality": "Kannur",
            "addressRegion": "Kerala",
            "postalCode": "670002",
            "addressCountry": "IN"
        }
    }
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050810] selection:bg-blue-500/30 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
            />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-24">
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#2563EB", "#7cff67", "#4F46E5"]}
                        blend={0.5}
                        amplitude={1.2}
                        speed={0.8}
                    />
                </div>

                <div className="container-width relative z-10 px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <MessageSquare size={14} className="fill-blue-400" /> Support Hub
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1]">
                        How Can We Help <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Your Business?</span>
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                        Our experts are ready to assist you with onboarding, technical queries,
                        or finding the perfect plan for your retail empire.
                    </p>
                </div>
            </section>

            <div className="container-width relative z-10 px-6 pb-32">
                <div className="grid md:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">

                    {/* Contact Info Bento */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:opacity-10 transition-opacity">
                                <Mail size={120} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Email Services</h3>
                            <div className="space-y-2">
                                <p className="text-blue-100 font-medium">support@thekada.in</p>
                                <p className="text-blue-100 font-medium">sales@thekada.in</p>
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:opacity-10 transition-opacity">
                                <Phone size={120} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">India Support</h3>
                            <p className="text-blue-100 font-medium text-xl">+91 9496 491 654</p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                <Clock size={12} /> Live Now
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:opacity-10 transition-opacity">
                                <MapPin size={120} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Headquarters</h3>
                            <p className="text-blue-200/60 leading-relaxed">
                                KTP Tower, Thalap, Kannur, <br />
                                Kerala, India - 670002
                            </p>
                            <Link href="#" className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-bold">
                                View on Maps <Globe size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Contact Form Bento */}
                    <div className="md:col-span-8 glass-card p-10 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50 z-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-4">Direct Enquiry</h2>
                            <p className="text-blue-200/50 mb-12">Submit your details and our relationship manager will reach out within 2 business hours.</p>
                            <ContactForm />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
