export default function ContactPage() {
    return (
        <div className="py-20 bg-slate-50 min-h-screen">
            <div className="container-width max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 text-center mb-12">Get in Touch</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors" placeholder="How can we help?"></textarea>
                            </div>
                            <button className="w-full btn-primary">Send Message</button>
                        </form>
                    </div>

                    <div className="flex flex-col justify-center space-y-8 p-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">📍 Support Office</h3>
                            <p className="text-slate-600">
                                123 Innovation Drive,<br />
                                Tech Park, Bangalore, KA 560103
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">📧 Email Us</h3>
                            <p className="text-slate-600">support@kadaledger.com</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">📞 Call Us</h3>
                            <p className="text-slate-600">+91 98765 43210</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
