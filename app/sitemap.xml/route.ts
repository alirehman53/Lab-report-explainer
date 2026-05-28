import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs' // Ensure fs is available

interface BlogPost {
  slug: string
  date: string
  title: string
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
  // Read blog posts
  const filePath = path.join(process.cwd(), 'data', 'blogs.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const posts: BlogPost[] = JSON.parse(fileContent)

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/blog', changefreq: 'daily', priority: '0.9' },
    { url: '/about', changefreq: 'monthly', priority: '0.7' },
    { url: '/privacy', changefreq: 'monthly', priority: '0.5' },
    { url: '/terms', changefreq: 'monthly', priority: '0.5' },
    { url: '/ads', changefreq: 'monthly', priority: '0.5' },
    { url: '/results', changefreq: 'weekly', priority: '0.8' },
  ]

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${posts
  .map(
    (post) => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
