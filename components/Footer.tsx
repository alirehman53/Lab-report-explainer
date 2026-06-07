'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-br from-emerald-950 via-teal-950 to-green-950 text-white mt-auto border-t border-emerald-800/30">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block group">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent group-hover:from-white group-hover:via-emerald-200 group-hover:to-teal-200 transition-all duration-300">
                Lab Lens
              </h3>
            </Link>
            <p className="text-emerald-100/80 mb-6 text-sm leading-relaxed">
              AI-powered medical report analyzer. Get instant explanations of your lab results. 
              100% free & secure.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.open('https://twitter.com/lablens', '_blank')}
                className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-emerald-200 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 transform"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button 
                onClick={() => window.open('https://facebook.com/lablens', '_blank')}
                className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-emerald-200 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 transform"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-400 mr-3 rounded-full"></span>
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/marker"
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🧪</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Lab Test Guides</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">📚</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Health Blog</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">ℹ️</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog/understanding-blood-test-results" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🩸</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Blood Test Guide</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog/thyroid-function-tests-explained" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🦋</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Thyroid Tests</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Tools */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-teal-400 to-green-400 mr-3 rounded-full"></span>
              Tools
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🔬</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Upload Lab Report</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/results" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">📊</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Sample Results</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">📖</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Learn More</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 mr-3 rounded-full"></span>
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🔒</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">📜</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/ads" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">💰</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Advertising</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/sitemap.xml" 
                  className="text-emerald-100/70 hover:text-white transition-all duration-200 text-sm flex items-center group"
                >
                  <span className="mr-2 group-hover:scale-125 transform transition-transform">🗺️</span>
                  <span className="group-hover:translate-x-1 transform transition-transform">Sitemap</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/30 mt-12 pt-8">
          <div className="text-center">
            <p className="text-emerald-100/60 text-sm mb-4">
              © {currentYear} Lab Lens. All rights reserved. | AI-Powered Medical Report Analysis
            </p>
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-400/20 rounded-2xl p-5 max-w-3xl mx-auto shadow-lg">
              <p className="text-amber-100/90 text-xs leading-relaxed flex items-start justify-center">
                <span className="mr-2 text-lg">⚠️</span>
                <span>
                  <span className="font-semibold">Medical Disclaimer:</span> Lab Lens provides educational information only. 
                  Results are not a substitute for professional medical advice. Always consult with qualified healthcare 
                  professionals for diagnosis or treatment decisions.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}