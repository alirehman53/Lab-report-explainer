# Deployment Checklist

Use this checklist to ensure everything is configured correctly before going live.

## Pre-Deployment

- [ ] Updated `public/ads.txt` with your AdSense publisher ID
- [ ] Updated `public/robots.txt` with your actual domain
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_GA_ID` in Vercel (optional, but recommended)
- [ ] Reviewed all blog posts in `data/blogs.json` for accuracy
- [ ] Tested build locally: `pnpm build`
- [ ] Checked for TypeScript/ESLint errors

## Deployment

- [ ] Deployed to Vercel production: `vercel --prod`
- [ ] Verified deployment completed successfully
- [ ] Checked deployment URL loads correctly
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (automatic with Vercel)

## Post-Deployment Verification

- [ ] Homepage loads: `https://yourdomain.com/`
- [ ] Blog index loads: `https://yourdomain.com/blog`
- [ ] Sample blog post loads: `https://yourdomain.com/blog/understanding-blood-test-results`
- [ ] Privacy page loads: `https://yourdomain.com/privacy`
- [ ] Terms page loads: `https://yourdomain.com/terms`
- [ ] Ads page loads: `https://yourdomain.com/ads`
- [ ] Sitemap accessible: `https://yourdomain.com/sitemap.xml`
- [ ] Robots.txt accessible: `https://yourdomain.com/robots.txt`
- [ ] Ads.txt accessible: `https://yourdomain.com/ads.txt`
- [ ] Consent banner appears on first visit
- [ ] Consent preferences save correctly (test accept/reject)
- [ ] Analytics loads after consent (check Network tab)
- [ ] No console errors in browser DevTools

## Google Services Setup

- [ ] Added site to Google Search Console
- [ ] Verified domain ownership in Search Console
- [ ] Submitted sitemap to Search Console
- [ ] Waiting for Google to index pages (1-7 days)
- [ ] Set up Google Analytics 4 property (optional)
- [ ] Confirmed GA4 tracking works (Real-time reports)

## AdSense Application (After 1-2 Weeks)

- [ ] Site has consistent traffic (50+ daily visitors recommended)
- [ ] All pages are indexed by Google
- [ ] No policy violations (checked content)
- [ ] Applied for Google AdSense
- [ ] Added AdSense verification code (if requested)
- [ ] Waiting for AdSense review (1-3 weeks)

## After AdSense Approval

- [ ] Received AdSense publisher ID
- [ ] Updated `public/ads.txt` with real publisher ID
- [ ] Set `NEXT_PUBLIC_ADSENSE_CLIENT` in Vercel
- [ ] Redeployed site
- [ ] Verified ads.txt has correct publisher ID
- [ ] Tested ads appear after consent
- [ ] Checked AdSense dashboard shows ad impressions
- [ ] Monitored for policy violations

## Ongoing Maintenance

- [ ] Monitor Google Analytics weekly
- [ ] Check AdSense earnings and performance
- [ ] Add new blog posts regularly (2-3 per week ideal)
- [ ] Update old content for accuracy
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Review and respond to user feedback
- [ ] Check for security updates in dependencies
- [ ] Backup data/blogs.json periodically

## Performance Optimization

- [ ] Lighthouse score > 90 for Performance
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s
- [ ] Images optimized (using next/image)
- [ ] Unnecessary JavaScript removed
- [ ] Caching headers configured

## Legal & Compliance

- [ ] Privacy policy is accurate and complete
- [ ] Terms of service reviewed
- [ ] GDPR consent mechanism working
- [ ] Cookie policy disclosed
- [ ] Contact information is correct
- [ ] Disclaimer about medical advice is clear

## Growth Tracking

- [ ] Daily visitor count: _______
- [ ] Pages indexed by Google: _______
- [ ] Average session duration: _______
- [ ] AdSense approval date: _______
- [ ] Monthly ad revenue: _______
- [ ] Blog posts published: _______

---

**Last Updated:** _________  
**Deployed By:** _________  
**Production URL:** _________
