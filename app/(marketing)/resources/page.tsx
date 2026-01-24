export default function ResourcesPage() {
    return (
        <div className="py-20 bg-slate-50 min-h-screen">
            <div className="container-width max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 text-center mb-12">Help & Resources</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Getting Started Guide</h3>
                        <p className="text-slate-600 text-sm mb-4">Learn the basics of setting up your store and adding customers.</p>
                        <a href="#" className="text-blue-600 font-medium text-sm hover:underline">Read Article →</a>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Video Tutorials</h3>
                        <p className="text-slate-600 text-sm mb-4">Watch step-by-step videos on how to use advanced features.</p>
                        <a href="#" className="text-blue-600 font-medium text-sm hover:underline">Watch Videos →</a>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">FAQs</h3>
                        <p className="text-slate-600 text-sm mb-4">Common questions about billing, account management, and more.</p>
                        <a href="#" className="text-blue-600 font-medium text-sm hover:underline">View FAQs →</a>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Support</h3>
                        <p className="text-slate-600 text-sm mb-4">Need personalized help? Reach out to our support team.</p>
                        <a href="/contact" className="text-blue-600 font-medium text-sm hover:underline">Contact Us →</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
