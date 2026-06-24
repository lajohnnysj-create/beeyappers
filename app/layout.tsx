import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bleviq.com"),
  title: "24/7 AI Chatbot: Train in just minutes | Bleviq",
  description: "An AI chat widget trained on your website.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "24/7 AI Chatbot: Train in just minutes | Bleviq",
    description: "An AI chat widget trained on your website.",
    siteName: "Bleviq",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Bleviq" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "24/7 AI Chatbot: Train in just minutes | Bleviq",
    description: "An AI chat widget trained on your website.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sitewide entity graph: tells Google who Bleviq is (Organization) and that
  // this domain is its site (WebSite), linked by @id. Rendered on every page.
  // No SearchAction is included because there is no on-site search endpoint,
  // and no sameAs because there are no public social profiles to point to yet.
  const siteLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.bleviq.com/#organization",
        name: "Bleviq",
        url: "https://www.bleviq.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.bleviq.com/logo.png",
        },
        description:
          "Bleviq is an AI chat widget that learns your website and answers visitor questions 24/7.",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.bleviq.com/#website",
        name: "Bleviq",
        url: "https://www.bleviq.com",
        publisher: { "@id": "https://www.bleviq.com/#organization" },
      },
    ],
  };

  return (
    <html lang="en">
      <body className={`${inter.className} ${jakarta.variable} app-shell`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
        />
        {children}
      </body>
    </html>
  );
}
