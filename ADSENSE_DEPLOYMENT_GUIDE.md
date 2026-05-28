# Google AdSense Deployment Guide for Vercel

This guide will help you deploy your Lab Lens app to Vercel with Google AdSense monetization.

## ✅ What's Already Implemented

I've set up a complete, production-grade ad monetization system:

### 📝 Blog Content (12 Posts)
- **12 high-quality blog posts** about lab results, blood tests, and health topics
- Blog index page at `/blog`
- Individual post pages at `/blog/[slug]`
- SEO-optimized with metadata and structured data (JSON-LD)

### 🔒 Privacy & Compliance
- **Privacy Policy** at `/privacy` - Required for AdSense approval
- **Terms of Service** at `/terms` - Legal protection
- **Ads Information** page at `/ads` - Transparency about monetization
- **GDPR-compliant consent banner** - Users control cookies/ads/analytics
- LocalStorage-based consent management

### 📊 Analytics & Ads
- **Google Analytics integration** - Only loads with user consent
- **Google AdSense components** - Only show ads with user consent
- Ad slots on blog index and post pages
- Environment variable configuration (no hardcoded IDs)

### 🔍 SEO & Discovery
- **Dynamic sitemap** at `/sitemap.xml` - All pages + blog posts
- **robots.txt** - Search engine instructions
- **ads.txt** - AdSense verification file
- Open Graph metadata for social sharing
- Structured data (Schema.org) for rich snippets

## 🚀 Deployment Steps

### Step 1: Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Optional but recommended:
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics 4 ID (optional)
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX  # AdSense Publisher ID
```

**Where to find these:**
- **SITE_URL**: Your production domain (e.g., `lablens.com`)
- **GA_ID**: Google Analytics 4 → Admin → Data Streams → Measurement ID
- **ADSENSE_CLIENT**: Will be provided after AdSense approval

### Step 2: Update ads.txt

Before deploying, edit `public/ads.txt` and replace the placeholder:

```txt
# Current (placeholder):
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0

# Change to (your actual publisher ID):
google.com, pub-YOUR_PUBLISHER_ID, DIRECT, f08c47fec0942fa0
```

**Note:** You'll get your publisher ID after AdSense approval, but you can deploy first.

### Step 3: Update robots.txt

Edit `public/robots.txt` and replace `yourdomain.com` with your actual domain:

```txt
Sitemap: https://your-actual-domain.com/sitemap.xml
```

### Step 4: Deploy to Vercel

```bash
# Install dependencies
pnpm install

# Build locally to check for errors (optional)
pnpm build

# Deploy to Vercel (automatic via Git push or manual)
vercel --prod
```

### Step 5: Verify Deployment

After deployment, verify these URLs work:

- ✅ `https://your-domain.com/` - Main app
- ✅ `https://your-domain.com/blog` - Blog index
- ✅ `https://your-domain.com/blog/understanding-blood-test-results` - Sample post
- ✅ `https://your-domain.com/privacy` - Privacy policy
- ✅ `https://your-domain.com/terms` - Terms of service
- ✅ `https://your-domain.com/ads` - Ads information
- ✅ `https://your-domain.com/sitemap.xml` - Sitemap
- ✅ `https://your-domain.com/ads.txt` - AdSense verification
- ✅ `https://your-domain.com/robots.txt` - Robots file

### Step 6: Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter your domain (e.g., `https://your-domain.com`)
4. Verify ownership (DNS or HTML file method)
5. Submit your sitemap: `https://your-domain.com/sitemap.xml`

### Step 7: Apply for Google AdSense

**Important:** Wait 1-2 weeks after deployment and ensure you have consistent traffic before applying.

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Click "Get Started"
3. Enter your website URL
4. Fill out application form
5. Add AdSense verification code to your site if requested
6. Wait for review (typically 1-3 weeks)

**AdSense Requirements:**
- ✅ Original, valuable content (12 blog posts included)
- ✅ Privacy policy page
- ✅ Good user experience
- ✅ Sufficient traffic (varies by country)
- ✅ No prohibited content
- ✅ Domain ownership verified

### Step 8: After AdSense Approval

Once approved:

1. Get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
2. Update `public/ads.txt` with your real publisher ID
3. Add `NEXT_PUBLIC_ADSENSE_CLIENT` to Vercel environment variables
4. Redeploy the site
5. Ads will start appearing automatically (with user consent)

## 🎯 How It Works

### Consent Management
- First-time visitors see a consent banner
- Choice is stored in `localStorage`
- Users can accept/reject analytics and ads separately
- Ads and analytics only load after explicit consent

### Ad Placement
- Blog index: 1 horizontal ad at the top
- Blog posts: 1 horizontal ad before content, 1 rectangle ad after content
- Main app pages: Can add more ad slots as needed

### Analytics Tracking
- Google Analytics only loads if:
  - User has consented to analytics
  - `NEXT_PUBLIC_GA_ID` environment variable is set

## 🛠 Customization Options

### Add More Ad Slots

In any page, import and use the AdSense component:

```tsx
import AdSense from '@/components/AdSense'

export default function MyPage() {
  return (
    <div>
      <AdSense format="horizontal" />
      {/* Your content */}
      <AdSense format="rectangle" />
    </div>
  )
}
```

**Available formats:**
- `auto` - Responsive (default)
- `horizontal` - Wide banner
- `rectangle` - Square/rectangle ad
- `vertical` - Sidebar ad
- `fluid` - Fills container

### Add More Blog Posts

Edit `data/blogs.json` and add more entries:

```json
{
  "slug": "your-url-slug",
  "title": "Your Post Title",
  "summary": "Brief description",
  "date": "2026-05-28",
  "author": "Lab Lens Team",
  "content": "<p>HTML content here</p>"
}
```

The sitemap will automatically update.

## 📊 Monitoring & Optimization

### Google Analytics
- View real-time traffic
- Track page views and user behavior
- Monitor bounce rate and engagement

### AdSense Dashboard
- Monitor earnings and ad performance
- View click-through rates (CTR)
- Optimize ad placement based on performance data

### Performance Best Practices
- Keep blog posts under 2000 words for better engagement
- Use images to break up text (add to blog content HTML)
- Monitor Core Web Vitals in Google Search Console
- Aim for page load times under 3 seconds

## ⚠️ Common Issues & Solutions

### Issue: Ads not showing
**Solutions:**
- Check that user has consented to ads
- Verify `NEXT_PUBLIC_ADSENSE_CLIENT` is set correctly
- Wait 24-48 hours after adding AdSense code (Google needs time to crawl)
- Check browser console for AdSense errors

### Issue: AdSense application rejected
**Solutions:**
- Ensure privacy policy is comprehensive and accessible
- Add more original content (aim for 20-30 posts)
- Increase traffic (100+ daily visitors helps)
- Fix any policy violations
- Wait 1-2 months and reapply

### Issue: Sitemap not updating
**Solutions:**
- Clear Vercel build cache
- Check that `app/sitemap.xml/route.ts` has `runtime = 'nodejs'`
- Verify `data/blogs.json` is valid JSON

### Issue: Consent banner not appearing
**Solutions:**
- Clear browser localStorage and cookies
- Check browser console for JavaScript errors
- Verify `components/Consent.tsx` is imported in layout

## 📈 Growth Tips

1. **SEO Optimization**
   - Write keyword-rich blog titles
   - Use header tags (H2, H3) in content
   - Add meta descriptions
   - Get backlinks from health forums

2. **Content Strategy**
   - Publish 2-3 new blog posts per week
   - Focus on long-tail keywords (e.g., "how to interpret TSH levels")
   - Answer common health questions
   - Update old posts with new information

3. **User Engagement**
   - Add comments section to blog posts
   - Share on social media
   - Create email newsletter
   - Add "Related Posts" section

4. **Ad Revenue Optimization**
   - Experiment with ad placements
   - Monitor AdSense reports for best-performing positions
   - Consider adding sidebar ads on desktop
   - A/B test different ad formats

## 🎉 You're Ready!

Your Lab Lens app is now production-grade with:
- ✅ 12 SEO-optimized blog posts
- ✅ GDPR-compliant consent management
- ✅ Google Analytics integration
- ✅ Google AdSense ready
- ✅ Complete privacy & legal pages
- ✅ Automatic sitemap generation
- ✅ Search engine optimization

Deploy to Vercel, apply for AdSense, and start earning! 🚀

## 📞 Need Help?

If you encounter issues:
1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Vercel deployment guides](https://vercel.com/docs)
3. Read [AdSense Help Center](https://support.google.com/adsense)
4. Check browser console for errors

Good luck with your deployment! 🎊
