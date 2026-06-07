import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@/styles/globals.scss';
import ConsentBanner from '@/components/Consent';
import Analytics from '@/components/Analytics';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lab-report-explainer-sigma.vercel.app'
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lab Report Explainer — AI Blood Test & Medical Report Analyzer | Lab Lens",
    template: '%s | Lab Report Explainer'
  },
  description: "Free lab report explainer. Upload your blood test, lab results, imaging, or pathology report and get an instant, plain-English explanation of every value — what's normal, what's flagged, and what to ask your doctor.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  keywords: [
    'lab report explainer',
    'lab report analyzer',
    'blood test explainer',
    'lab results interpreter',
    'blood test analyzer',
    'medical report explainer',
    'AI health analysis',
    'lab test interpretation',
    'CBC analyzer',
    'thyroid test results',
    'cholesterol levels explained',
    'free lab report analysis',
    'medical report AI',
    'health markers explained',
    'diagnostic test results',
    'pathology report interpreter',
    'imaging report analysis',
    'Lab Lens AI'
  ],
  authors: [{ name: 'Lab Lens Team' }],
  creator: 'Lab Lens',
  publisher: 'Lab Lens',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Lab Report Explainer — AI Blood Test & Medical Report Analyzer",
    description: "Free lab report explainer. Upload your lab results for an instant, plain-English explanation of your blood tests, imaging reports, and health markers.",
    url: '/',
    siteName: 'Lab Lens',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lab Lens - AI Medical Report Analyzer',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lab Report Explainer — AI Medical Report Analyzer",
    description: "Free lab report explainer. Upload lab results for instant, plain-English interpretation of your health markers.",
    images: ['/og-image.jpg'],
    creator: '@lablens',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Only emit a verification meta tag when a real token is configured via env.
  // Emitting a placeholder string produces an invalid tag that can confuse
  // Search Console verification.
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': SITE_URL,
    name: 'Lab Lens',
    url: SITE_URL,
    description: 'AI-powered medical report analyzer for instant lab results interpretation',
    publisher: {
      '@type': 'Organization',
      name: 'Lab Lens',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 600,
        height: 60
      }
    },
    potentialAction: {
      '@type': 'AnalyzeAction',
      target: SITE_URL,
      object: {
        '@type': 'MedicalTest',
        name: 'Lab Report'
      }
    },
    medicalSpecialty: 'Laboratory Medicine',
    about: {
      '@type': 'Thing',
      name: 'Medical Laboratory Test Results'
    }
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Google AdSense — account verification meta + site-level loader */}
        <meta name="google-adsense-account" content="ca-pub-9229177333655230" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9229177333655230"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
