import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSense from '@/components/AdSense'
import '../../blog.css'

interface BlogPost {
  slug: string
  title: string
  summary: string
  date: string
  author: string
  content: string
}

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'data', 'blogs.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const posts: BlogPost[] = JSON.parse(fileContent)

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const filePath = path.join(process.cwd(), 'data', 'blogs.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const posts: BlogPost[] = JSON.parse(fileContent)
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const wordCount = post.content ? post.content.split(' ').length : 500
  const readTime = Math.ceil(wordCount / 200)

  return {
    title: `${post.title} | Lab Lens Blog - Expert Health Insights`,
    description: post.summary,
    keywords: ['lab tests', 'blood tests', 'health markers', post.title.toLowerCase(), 'medical insights'],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const filePath = path.join(process.cwd(), 'data', 'blogs.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const posts: BlogPost[] = JSON.parse(fileContent)
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  // Calculate reading time
  const wordCount = post.content ? post.content.split(' ').length : 500
  const readTime = Math.ceil(wordCount / 200)

  // Get related posts (next 2 posts)
  const currentIndex = posts.findIndex(p => p.slug === slug)
  const relatedPosts = posts.filter((_, index) => index !== currentIndex).slice(0, 2)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lab Lens',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lab-report-explainer-sigma.vercel.app'}/blog/${slug}`
    },
    wordCount: wordCount,
    timeRequired: `PT${readTime}M`,
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Article Header with Gradient Background */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="mb-4">
              <a href="/blog" className="inline-flex items-center text-emerald-100 hover:text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Blog
              </a>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {post.author}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readTime} min read
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-emerald-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Article Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {post.summary}
            </p>
          </div>

          {/* Top Ad */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-2 uppercase tracking-wider">Advertisement</p>
            <AdSense format="horizontal" />
          </div>

          {/* Article Content */}
          <article className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Author Bio Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mt-12 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {post.author.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">About the Author</h3>
                <p className="text-gray-700">
                  <strong>{post.author}</strong> is a medical professional with expertise in laboratory diagnostics 
                  and health education. Dedicated to making complex medical information accessible to everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Middle Ad */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-12 mb-12 border border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-2 uppercase tracking-wider">Advertisement</p>
            <AdSense format="rectangle" />
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <a
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {relatedPost.summary}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(relatedPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />


    </>
  )
}
