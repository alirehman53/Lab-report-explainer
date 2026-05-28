import { Metadata } from 'next'

export const homeMetadata: Metadata = {
  title: "Lab Lens — Free AI Lab Report Analyzer | Instant Medical Results Interpretation",
  description: "Upload your lab results, blood tests, or medical reports for instant AI-powered analysis. Get clear explanations of your health markers, reference ranges, and personalized insights. 100% free, private, and secure.",
  keywords: [
    'lab report analyzer',
    'blood test interpreter',
    'medical results explained',
    'free lab analysis',
    'AI health assistant',
    'CBC blood test results',
    'thyroid test interpretation',
    'cholesterol levels analyzer',
    'liver function test explained',
    'kidney function analysis',
    'vitamin D test results',
    'diabetes markers explained',
    'medical PDF analyzer',
    'health report AI',
    'instant lab results'
  ],
  openGraph: {
    title: "Lab Lens — Free AI Lab Report Analyzer",
    description: "Upload lab results for instant AI interpretation. Understand your blood tests and health markers in plain English.",
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Lab Lens - Upload Your Lab Report for Instant Analysis',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lab Lens — Free AI Lab Report Analyzer",
    description: "Upload lab results for instant interpretation. Understand your health in plain English.",
    images: ['/og-home.jpg'],
  },
  alternates: {
    canonical: '/',
  },
}