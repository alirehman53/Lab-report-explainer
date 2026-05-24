#!/bin/bash
# Setup script for Vercel deployment

echo "🚀 Lab Report Explainer - Vercel Setup"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "📋 Setup Steps:"
echo ""
echo "1. Get a free OCR API key:"
echo "   → Visit: https://ocr.space/ocrapi"
echo "   → Enter your email to get instant API key"
echo ""
echo "2. Login to Vercel:"
vercel login

echo ""
echo "3. Add environment variable:"
echo "   Running: vercel env add OCR_SPACE_API_KEY"
echo ""
vercel env add OCR_SPACE_API_KEY production

echo ""
echo "4. Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test your deployment with a sample lab report"
echo "   2. Check logs: vercel logs"
echo "   3. Monitor OCR usage at: https://ocr.space/ocrapi"
echo ""
