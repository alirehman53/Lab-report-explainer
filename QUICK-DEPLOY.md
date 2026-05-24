# Quick Deploy to Railway (5 minutes)

Railway is the easiest platform to deploy this app with full OCR support.

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app) - free tier available)

## Steps

### 1. Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lab-report-explainer.git
git push -u origin main
```

### 2. Deploy to Railway

**Option A: One-Click Deploy** (Easiest)
1. Go to [railway.app](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the Dockerfile and deploy

**Option B: CLI Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

### 3. Get Your URL
After deployment completes (~5 minutes):
- Railway will provide a URL like: `https://lab-report-explainer-production.up.railway.app`
- You can also add a custom domain in Railway settings

### 4. Test It
```bash
# Test with a sample image
curl -X POST https://your-app.railway.app/api/analyze \
  -F "file=@test-image.jpg" \
  -F "gender=male"
```

## Cost
- **Free Tier**: $5 of free usage per month (enough for testing and small projects)
- **Paid**: ~$5-10/month for production use

## Troubleshooting

### Build fails
- Check Railway logs in the dashboard
- Ensure `Dockerfile` and `package.json` are committed to Git

### OCR not working
- Check logs: Railway Dashboard → Your Service → Logs
- Tesseract should be installed automatically (check for "tesseract" in build logs)

### Out of memory
- Upgrade to Railway's Hobby plan for more resources
- Or add a memory limit in Railway settings: 2GB recommended

## Alternative: Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Render will detect the Dockerfile automatically
5. Click "Create Web Service"

Cost: $7/month (no free tier for Docker)

## Next Steps

- Set up environment variables in Railway (if using external APIs)
- Configure custom domain
- Set up monitoring and alerts
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced options
