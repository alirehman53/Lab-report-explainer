'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent } from './Consent'

interface AdSenseProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
}

export default function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseProps) {
  const [canShowAds, setCanShowAds] = useState(false)
  const [adLoaded, setAdLoaded] = useState(false)
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-0000000000000000'

  useEffect(() => {
    // Check initial consent
    const consent = getConsent()
    if (consent?.ads) {
      setCanShowAds(true)
    }

    // Listen for consent changes
    const handleConsentUpdate = (event: CustomEvent) => {
      setCanShowAds(event.detail.ads)
    }

    window.addEventListener('consentUpdate', handleConsentUpdate as EventListener)
    return () => window.removeEventListener('consentUpdate', handleConsentUpdate as EventListener)
  }, [])

  useEffect(() => {
    if (canShowAds && !adLoaded) {
      try {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
        setAdLoaded(true)
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }
  }, [canShowAds, adLoaded])

  if (!canShowAds) {
    return null
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className={`adsbygoogle ${className}`}
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </>
  )
}
