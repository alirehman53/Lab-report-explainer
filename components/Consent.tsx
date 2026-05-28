'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface ConsentState {
  analytics: boolean
  ads: boolean
  essential: boolean
  timestamp: string
}

const STORAGE_KEY = 'user_consent'

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function setConsent(consent: ConsentState) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent('consentUpdate', { detail: consent }))
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = getConsent()
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent: ConsentState = {
      analytics: true,
      ads: true,
      essential: true,
      timestamp: new Date().toISOString(),
    }
    setConsent(consent)
    setVisible(false)
  }

  const handleRejectAll = () => {
    const consent: ConsentState = {
      analytics: false,
      ads: false,
      essential: true,
      timestamp: new Date().toISOString(),
    }
    setConsent(consent)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden animate-slideUp border border-emerald-800/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-6 py-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl animate-bounce">🍪</span>
            Your Privacy Matters
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-emerald-100/80 text-base mb-4 leading-relaxed">
            We use cookies and similar technologies to improve your experience, analyze site traffic, 
            and show personalized ads. You can choose which types of cookies to allow.
          </p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-white transition-colors mb-3"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetails ? 'Hide cookie details' : 'Learn about cookies'}
          </button>

          {showDetails && (
            <div className="bg-emerald-900/30 backdrop-blur-sm rounded-2xl p-5 mb-5 space-y-3 border border-emerald-700/30">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">Essential Cookies</p>
                  <p className="text-xs text-emerald-200/70 mt-1">Required for the website to function properly. Always enabled.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span className="text-lg">📊</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">Analytics Cookies</p>
                  <p className="text-xs text-emerald-200/70 mt-1">Help us understand visitor behavior and improve the site.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span className="text-lg">🎯</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">Advertising Cookies</p>
                  <p className="text-xs text-emerald-200/70 mt-1">Enable personalized ads to support our free service.</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-emerald-200/60">
            By continuing, you agree to our use of cookies. Read our{' '}
            <Link href="/privacy" className="text-emerald-300 hover:text-white underline font-medium transition-colors">
              Privacy Policy
            </Link>
            {' '}for details.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-emerald-900/20 backdrop-blur-sm px-6 py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-emerald-700/30">
          <button
            onClick={handleRejectAll}
            className="px-6 py-2.5 border-2 border-emerald-400/30 rounded-xl font-semibold text-emerald-200 hover:bg-emerald-800/30 hover:border-emerald-400/50 hover:text-white transition-all duration-200"
          >
            Reject All
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 shadow-lg shadow-teal-500/30 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Accept All Cookies
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
