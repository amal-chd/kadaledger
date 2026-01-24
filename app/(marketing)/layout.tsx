import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#000000] p-4 font-sans flex flex-col justify-center overflow-hidden relative">
            {/* Background Gradients for the whole screen */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
            </div>

            {/* Floating Window Container */}
            <div className="relative z-10 w-full max-w-[1800px] mx-auto bg-[#0B0F19]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
                <Navbar />
                <main className="flex-grow overflow-y-auto scrollbar-hide">
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
