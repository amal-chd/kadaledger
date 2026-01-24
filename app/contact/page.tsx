import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] left-[5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-float"></div>
            </div>

            <div className="container-width relative z-10 px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Get in <span className="text-blue-400 text-glow">Touch</span>
                    </h1>
                    <p className="text-blue-200/80 text-lg">
                        Have a question about our pricing, features, or need support? We're here to help you every step of the way.
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto">

                    {/* Contact Info Card */}
                    <div className="md:col-span-4 glass-card p-8 rounded-[2rem] border border-white/10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-8">Contact Info</h3>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-blue-200/60 text-sm mb-1">Email Us</p>
                                        <p className="text-white font-medium">support@kadalegder.com</p>
                                        <p className="text-white font-medium">sales@kadalegder.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-blue-200/60 text-sm mb-1">Call Us</p>
                                        <p className="text-white font-medium">+91 98765 43210</p>
                                        <p className="text-blue-300/50 text-xs">Mon-Fri, 9am - 6pm</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-blue-200/60 text-sm mb-1">Visit Us</p>
                                        <p className="text-white font-medium">
                                            Kada Ledger HQ, <br />
                                            Tech Park, Kochi, Kerala, <br />
                                            India - 682030
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                            <p className="text-blue-200 text-sm">
                                "Customer support is our top priority. We usually respond within 2 hours."
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-8 glass-card p-8 md:p-12 rounded-[2rem] border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-8">Send us a Message</h3>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-200/80 ml-1">First Name</label>
                                    <input type="text" placeholder="John" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-200/80 ml-1">Last Name</label>
                                    <input type="text" placeholder="Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80 ml-1">Email Address</label>
                                <input type="email" placeholder="john@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80 ml-1">Message</label>
                                <textarea rows={5} placeholder="How can we help you?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all placeholder:text-blue-200/20 resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                Send Message <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </main>
    );
}
