'use client'

import { useEffect, useRef } from 'react'

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
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-9229177333655230'
  const pushed = useRef(false)

  // Ads are shown to everyone (this is a free, ad-supported site). The
  // adsbygoogle.js loader is included once site-wide in app/layout.tsx; here we
  // just register the ad unit once it mounts.
  useEffect(() => {
    if (pushed.current) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
      pushed.current = true
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  )
}
