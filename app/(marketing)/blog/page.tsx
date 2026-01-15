export default function BlogPage() {
    return (
        <div className="py-20">
            <div className="container-width">
                <h1 className="text-4xl font-bold text-slate-900 mb-12 text-center">Latest Updates</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="group cursor-pointer">
                            <div className="h-48 bg-slate-200 rounded-2xl mb-4 overflow-hidden">
                                {/* Image Placeholder */}
                                <div className="w-full h-full bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
                            </div>
                            <div className="text-sm text-blue-600 font-semibold mb-2">Update</div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">How to Manage Credits Effectively</h2>
                            <p className="text-slate-600 text-sm line-clamp-2">
                                Learn the best practices for tracking customer credits and ensuring timely payments without damaging relationships.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
