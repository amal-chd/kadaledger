import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "./components/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kada Ledger",
    startupImage: [
      {
        url: "/brand-logo-final.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand-logo-final.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/brand-logo-final.png",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="mask-icon" href="/brand-logo-final.png" color="#2563eb" />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                maxWidth: '360px',
              },
            }}
          />
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
