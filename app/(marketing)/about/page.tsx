export default function AboutPage() {
    return (
        <div className="py-20">
            <div className="container-width">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-6">Empowering Local Businesses</h1>
                    <p className="text-lg text-slate-600">
                        Kada Ledger is on a mission to simplify financial management for millions of small business owners across India. We believe in the power of technology to transform traditional commerce.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="bg-slate-100 rounded-3xl h-80 w-full animate-pulse">
                        {/* Placeholder for Team Image */}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Story</h2>
                        <p className="text-slate-600 mb-4">
                            Founded in 2024, Kada Ledger started with a simple observation: shopkeepers were spending hours manually reconciling their ledgers. We built a simple app to solve this, and today we serve thousands of businesses.
                        </p>
                        <p className="text-slate-600">
                            Our team is a group of passionate engineers, designers, and problem solvers dedicated to building the best financial tools for the underserved market.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
