# Quick Start: Deploy to Vercel with AdSense

## 🚀 3-Minute Setup

### 1. Set Environment Variables in Vercel

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX           # Optional (Google Analytics)
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXX   # After AdSense approval
```

### 2. Update Configuration Files

**`public/ads.txt`:**
```txt
google.com, pub-YOUR_PUBLISHER_ID, DIRECT, f08c47fec0942fa0
```

**`public/robots.txt`:**
```txt
Sitemap: https://yourdomain.com/sitemap.xml
```

### 3. Deploy

```bash
pnpm install
pnpm build    # Test locally
vercel --prod # Deploy
```

### 4. Verify

Check these pages work:
- `/` - Main app
- `/blog` - Blog index  
- `/privacy` - Privacy policy
- `/sitemap.xml` - Sitemap
- `/ads.txt` - AdSense file

### 5. Google Search Console

1. Add your site
2. Verify ownership
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 6. Apply for AdSense

Wait 1-2 weeks for traffic, then apply at [google.com/adsense](https://www.google.com/adsense/)

---

## ✅ What's Included

- **12 blog posts** - Health & lab testing content
- **Privacy & legal pages** - Required for AdSense
- **GDPR consent system** - Compliant with EU laws
- **Analytics integration** - Google Analytics (optional)
- **AdSense ready** - Ads show after user consent
- **SEO optimized** - Sitemap, robots.txt, meta tags

---

## 📊 Ad Placement

Ads appear on:
- Blog index page (top)
- Blog post pages (before & after content)

All ads require user consent (GDPR compliant).

---

## 🎯 Next Steps After Deployment

1. Monitor traffic in Google Analytics
2. Apply for AdSense when you have 50-100+ daily visitors
3. Add more blog posts (edit `data/blogs.json`)
4. Share on social media
5. Monitor AdSense earnings

---

**Full documentation:** See `ADSENSE_DEPLOYMENT_GUIDE.md`

Good luck! 🎉
