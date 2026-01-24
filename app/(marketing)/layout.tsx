import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#000000] font-sans flex flex-col overflow-hidden relative">
            {/* Background Gradients for the whole screen */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full md:w-[800px] md:top-[-20%] md:left-[-10%] h-[600px] md:h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-full md:w-[600px] md:bottom-[-20%] md:right-[-10%] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
            </div>

            {/* Container: Full-screen */}
            <div className="relative z-10 w-full mx-auto bg-[#0B0F19]/90 md:backdrop-blur-3xl overflow-hidden flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow overflow-y-auto scrollbar-hide">
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
