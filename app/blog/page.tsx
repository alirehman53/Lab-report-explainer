import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import AdSense from '@/components/AdSense'
import { Metadata } from 'next'
import '../blog.css'

export const metadata: Metadata = {
  title: 'Health & Lab Testing Blog | Lab Lens - Expert Medical Insights',
  description: 'Comprehensive guides on blood tests, lab reports, health markers, and medical diagnostics. Expert insights to help you understand your lab results and optimize your health.',
  keywords: ['lab tests', 'blood tests', 'health markers', 'medical blog', 'lab results explained', 'diagnostic tests', 'health insights', 'medical reports', 'CBC test', 'thyroid tests', 'cholesterol levels'],
  openGraph: {
    title: 'Health & Lab Testing Blog | Lab Lens',
    description: 'Expert insights on understanding your lab results and maintaining optimal health.',
    type: 'website',
    url: '/blog',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Lab Lens Blog - Health Insights',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health & Lab Testing Blog | Lab Lens',
    description: 'Expert insights on understanding your lab results',
  },
  alternates: {
    canonical: '/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

interface BlogPost {
  slug: string
  title: string
  summary: string
  date: string
  author: string
  content?: string
  readTime?: string
  category?: string
}

export default function BlogPage() {
  let posts: BlogPost[] = []
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'blogs.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    posts = JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    // Fallback to empty array if file read fails
    posts = []
  }

  // Calculate read time for each post
  posts.forEach(post => {
    if (post.content) {
      const wordsPerMinute = 200
      const wordCount = post.content.split(' ').length
      post.readTime = `${Math.ceil(wordCount / wordsPerMinute)} min read`
    } else {
      post.readTime = '5 min read'
    }
  })

  // Sort by date descending
  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const featuredPosts = sortedPosts.slice(0, 3)
  const regularPosts = sortedPosts.slice(3)

  // Handle no posts case
  if (posts.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white">
          <div className="container mx-auto px-4 py-24 max-w-6xl text-center">
            <h1 className="text-4xl font-bold mb-4">Blog Coming Soon</h1>
            <p className="text-emerald-100/80">We're preparing expert health content. Check back soon!</p>
            <Link href="/" className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white border-b border-emerald-800/30">
        <div className="container mx-auto px-4 py-24 max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-emerald-200 via-white to-green-200 bg-clip-text text-transparent animate-fade-in">
            Health & Lab Testing Blog
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100/80 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Expert guides to help you understand your lab results and take control of your health.
            Evidence-based insights from medical professionals.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Premium Ad Placement */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-center text-xs text-gray-500 mb-3 uppercase tracking-wider">Advertisement</p>
          <AdSense format="horizontal" />
        </div>

        {/* Featured Posts Grid */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Featured Articles
                </span>
              </h2>
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                🔥 Most Popular
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <article 
                  key={post.slug} 
                  className="group bg-gradient-to-br from-white/95 to-emerald-50/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-200/30 transform hover:-translate-y-1"
                >
                  {/* Colored Top Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${
                    index === 0 ? 'from-emerald-600 via-teal-600 to-green-600' :
                    index === 1 ? 'from-green-600 via-lime-600 to-emerald-600' :
                    'from-teal-600 via-cyan-600 to-emerald-600'
                  }`} />
                  
                  <div className="p-6">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent mb-3 group-hover:from-green-700 group-hover:to-emerald-700 transition-all line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-semibold group/link"
                    >
                      Read article
                      <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Latest Articles
            </span>
          </h2>

          <div className="space-y-6">
            {regularPosts.map((post) => (
              <article 
                key={post.slug} 
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {post.summary}
                    </p>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Read full article
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-center text-xs text-gray-500 mb-3 uppercase tracking-wider">Advertisement</p>
          <AdSense format="rectangle" />
        </div>
      </div>


    </main>
  )
}
