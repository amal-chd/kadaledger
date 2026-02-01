'use client';
import { Send } from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We will get back to you soon.', {
            style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
            }
        });
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Toaster position="bottom-right" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-200/80 ml-1">First Name</label>
                    <input required type="text" placeholder="John" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-200/80 ml-1">Last Name</label>
                    <input required type="text" placeholder="Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200/80 ml-1">Email Address</label>
                <input required type="email" placeholder="john@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200/80 ml-1">Message</label>
                <textarea required rows={5} placeholder="How can we help you?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20 resize-none"></textarea>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
            </button>
        </form>
    );
}
