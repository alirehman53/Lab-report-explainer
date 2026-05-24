# Deploy to Vercel

This guide shows how to deploy the lab report explainer to Vercel with working OCR functionality.

## ⚠️ Important: OCR on Vercel

Vercel is a serverless platform that **does not support system binaries** like Tesseract. You have three options:

### Option 1: External OCR API (Recommended) ✅

Use a cloud OCR service - most reliable and easiest to set up.

**OCR.space (Free Tier: 25,000 requests/month)**

1. Get a free API key: https://ocr.space/ocrapi
2. Add to Vercel environment variables (see below)

**Google Cloud Vision (More accurate, requires billing)**

1. Setup: https://cloud.google.com/vision/docs/setup
2. Get API key and add to Vercel

### Option 2: Tesseract.js WASM Fallback ⚠️

Works without external APIs but less reliable:
- May fail on some images
- Slower cold starts
- Subject to Vercel's function timeout (10s free, 60s Pro)

### Option 3: Hybrid Deployment 🔧

- Deploy Next.js to Vercel
- Run OCR on separate Docker service (Railway)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup

---

## Quick Deploy Steps

### 1. Get OCR API Key (Recommended)

**OCR.space (easiest):**
1. Go to https://ocr.space/ocrapi
2. Enter your email
3. Get your free API key instantly

### 2. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

2. Go to [vercel.com](https://vercel.com/new)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js

6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `OCR_SPACE_API_KEY` = `your_api_key_here`
   - Click "Deploy"

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add OCR_SPACE_API_KEY

# Deploy
vercel --prod
```

### 3. Test Your Deployment

```bash
# Replace YOUR_APP_URL with your Vercel URL
curl -X POST https://your-app.vercel.app/api/analyze \
  -F "file=@test-image.jpg" \
  -F "gender=male"
```

---

## Environment Variables Reference

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables

### Required (choose one):

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `OCR_SPACE_API_KEY` | Your API key | https://ocr.space/ocrapi |
| `GOOGLE_CLOUD_VISION_API_KEY` | Your API key | https://cloud.google.com/vision/docs/setup |

### Optional:

| Variable | Value | Description |
|----------|-------|-------------|
| `VERCEL` | `1` | Auto-set by Vercel |
| `NODE_ENV` | `production` | Auto-set by Vercel |

---

## Troubleshooting

### OCR returns empty results

**If using OCR.space:**
1. Check API key is correct in Vercel dashboard
2. Verify you haven't exceeded free tier (25,000/month)
3. Try a different image format (PNG works best)

**Check logs:**
```bash
vercel logs your-deployment-url
```

Look for:
- `[OCR] Using external API` - Good, using OCR.space
- `[OCR] External API failed` - Check API key
- `[OCR] Attempting tesseract.js` - Falling back to WASM

### Function timeout errors

**Free tier**: 10-second timeout
- Use external API (faster than WASM)
- Optimize image size before upload

**Pro tier**: 60-second timeout
- Should work with WASM fallback
- Still recommend external API

### Build fails

1. **Check Node version**: Vercel uses Node 20 by default
   ```bash
   # Add to package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Check dependencies**: Make sure all packages install
   ```bash
   npm install
   npm run build
   ```

### WASM loading errors

If you see `RuntimeError: abort`:
- This means tesseract.js WASM failed to load
- **Solution**: Use external OCR API instead
- Or switch to Docker deployment (Railway/Render)

---

## Performance Optimization

### Image Size Limits

Vercel has payload limits:
- **Free**: 4.5MB per request
- **Pro**: 4.5MB per request
- **Enterprise**: Configurable

Compress images before upload for faster OCR.

### Cold Start Times

With external API:
- First request: ~2-5 seconds
- Subsequent: ~1-2 seconds

With tesseract.js WASM:
- First request: ~5-10 seconds (WASM init)
- Subsequent: ~2-3 seconds

### Function Region

Vercel deploys to the region closest to your users. For OCR.space API:
- API is global, should work from any region
- Add `vercel.json` to specify region if needed

---

## Comparison: Vercel vs Docker

| Feature | Vercel | Railway (Docker) |
|---------|--------|------------------|
| Setup Time | 5 minutes | 10 minutes |
| OCR Method | External API | System Tesseract |
| OCR Reliability | ⭐⭐⭐⭐⭐ (with API) | ⭐⭐⭐⭐⭐ |
| Cold Starts | Yes (~2s) | No (always warm) |
| Free Tier | ✅ Yes | $5/month |
| Best For | Side projects | Production |

---

## Cost Estimate

### Free Tier (Side Projects)
- Vercel: Free
- OCR.space: 25,000 requests/month
- **Total**: $0/month
- **Best for**: Personal projects, demos

### Paid Tier (Production)
- Vercel Pro: $20/month
- OCR.space Pro: $60/month (100,000 requests)
- **Total**: $80/month

OR

- Railway Docker: $5-10/month (unlimited OCR)
- **Total**: $5-10/month
- **Best for**: Cost-sensitive production apps

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add OCR API key
3. ✅ Test with sample lab report
4. 📊 Monitor usage in OCR.space dashboard
5. 🎉 Share your app!

## Need Help?

- OCR not working? Check [Troubleshooting](#troubleshooting)
- Want better reliability? See [DEPLOYMENT.md](./DEPLOYMENT.md) for Docker options
- Issues? Open a GitHub issue
