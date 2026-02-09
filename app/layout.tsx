import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "./components/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://thekada.in'),
  title: {
    default: "Kada Ledger - Online Credit Book, Ledger & Khata App in India",
    template: "%s | Kada Ledger"
  },
  description: "The best online credit book and digital khata app for Indian businesses. Manage your ledger, track udhar, and collect payments faster with automated WhatsApp reminders.",
  keywords: ["online credit book", "digital khata book", "ledger book app", "business accounting india", "udhar khata", "cash book app", "Kada Ledger"],
  authors: [{ name: "Kada Ledger Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thekada.in",
    siteName: "Kada Ledger",
    title: "Kada Ledger - Premium Digital Ledger & Khata App",
    description: "Digitize your business with India's most premium khata book. Track customer credit and collect payments with ease.",
    images: [
      {
        url: "/brand-logo-final.png",
        width: 1200,
        height: 630,
        alt: "Kada Ledger - Online Credit Book",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kada Ledger | Digital Khata App",
    description: "Manage your business credits and debits effortlessly with Kada Ledger.",
    images: ["/brand-logo-final.png"],
  },
  icons: {
    icon: "/brand-logo-final.png",
    shortcut: "/brand-logo-final.png",
    apple: "/brand-logo-final.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://thekada.in/#organization",
      "name": "Kada Ledger",
      "url": "https://thekada.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thekada.in/brand-logo-final.png"
      },
      "sameAs": [
        "https://twitter.com/kadaledger",
        "https://linkedin.com/company/kadaledger"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://thekada.in/#website",
      "url": "https://thekada.in",
      "name": "Kada Ledger",
      "publisher": {
        "@id": "https://thekada.in/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Kada Ledger",
      "operatingSystem": "Android, iOS, Web",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
