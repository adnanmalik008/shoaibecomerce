import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { StickyEnrollBar } from "@/components/StickyEnrollBar";
import { Ticker } from "@/components/Ticker";
import { UrgencyPopup } from "@/components/UrgencyPopup";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getContent } from "@/lib/content";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { waHref } from "@/lib/wa";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Instagram eCommerce Course in Pakistan`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Instagram eCommerce course",
    "online earning Pakistan",
    "Instagram selling course",
    "eCommerce training Pakistan",
    "Shoaib Zareen",
    "earn money online Pakistan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} | Instagram eCommerce Course in Pakistan`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Shoaib Ecommerce: launch your Instagram eCommerce business in 30 days",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Instagram eCommerce Course in Pakistan`,
    description: site.description,
    images: ["/og.jpg"],
  },
  // Ads landing page — kept out of the index entirely so it never competes with
  // the main site in search. Inherited by every route unless a page overrides it.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className="min-h-full flex flex-col pb-20 md:pb-0">
        <Ticker messages={content.ticker} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyEnrollBar pricing={content.pricing} />
        <WhatsAppFab href={waHref(content.whatsapp.number)} />
        <UrgencyPopup pricing={content.pricing} />
      </body>
    </html>
  );
}
