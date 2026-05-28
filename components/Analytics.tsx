'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent } from './Consent'

export default function Analytics() {
  const [canTrack, setCanTrack] = useState(false)
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  useEffect(() => {
    // Check initial consent
    const consent = getConsent()
    if (consent?.analytics) {
      setCanTrack(true)
    }

    // Listen for consent changes
    const handleConsentUpdate = (event: CustomEvent) => {
      setCanTrack(event.detail.analytics)
    }

    window.addEventListener('consentUpdate', handleConsentUpdate as EventListener)
    return () => window.removeEventListener('consentUpdate', handleConsentUpdate as EventListener)
  }, [])

  if (!canTrack || !gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
