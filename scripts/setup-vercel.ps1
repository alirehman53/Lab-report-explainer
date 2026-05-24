# Setup script for Vercel deployment (PowerShell)

Write-Host "🚀 Lab Report Explainer - Vercel Setup" -ForegroundColor Green
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "📋 Setup Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Get a free OCR API key:"
Write-Host "   → Visit: https://ocr.space/ocrapi" -ForegroundColor White
Write-Host "   → Enter your email to get instant API key" -ForegroundColor White
Write-Host ""
Write-Host "2. Login to Vercel:"
vercel login

Write-Host ""
Write-Host "3. Add environment variable:"
Write-Host "   Running: vercel env add OCR_SPACE_API_KEY" -ForegroundColor Yellow
Write-Host ""
vercel env add OCR_SPACE_API_KEY production

Write-Host ""
Write-Host "4. Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test your deployment with a sample lab report"
Write-Host "   2. Check logs: vercel logs"
Write-Host "   3. Monitor OCR usage at: https://ocr.space/ocrapi"
Write-Host ""
