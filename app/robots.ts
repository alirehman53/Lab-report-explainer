import type { MetadataRoute } from 'next'

/**
 * Dynamic robots.txt so the sitemap URL tracks the configured domain instead
 * of a hardcoded placeholder. Set NEXT_PUBLIC_SITE_URL in the environment.
 *
 * `/results` is disallowed because it renders per-user analysis from session
 * storage — there is nothing stable for a crawler to index there.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lab-report-explainer-sigma.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/results', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
