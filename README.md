# Lab Report Explainer

An AI-powered web application that analyzes medical lab reports by extracting text from images/PDFs using OCR and providing intelligent interpretations of lab values.

## Features

- 📄 **PDF & Image Support**: Upload lab reports as PDFs or images (JPG, PNG)
- 🔍 **OCR Technology**: Extracts text from images using Tesseract OCR
- 🧠 **AI Analysis**: Interprets lab values and provides health insights
- 🎯 **Gender-Aware**: Adjusts reference ranges based on patient gender
- ⚡ **Fast & Reliable**: Optimized for production use with crash-safe fallbacks

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **OCR**: Tesseract OCR (CLI + tesseract.js fallback)
- **PDF Processing**: pdf.js
- **Runtime**: Node.js 22+
- **Package Manager**: pnpm

## Local Development

### Prerequisites

1. **Node.js 22+** and **pnpm**
2. **Tesseract OCR** (for best performance)

#### Installing Tesseract

**Windows**:
```bash
winget install -e --id UB-Mannheim.TesseractOCR
```

**macOS**:
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/lab-report-explainer.git
cd lab-report-explainer
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Test the OCR functionality:
```bash
node scripts/test-ocr.js path/to/lab-report.jpg
```

## Project Structure

```
├── app/
│   ├── api/analyze/      # Main API endpoint for file upload & analysis
│   ├── results/          # Results display page
│   └── page.tsx          # Upload interface
├── lib/
│   ├── ocr.ts           # OCR implementation (CLI + WASM fallback)
│   ├── pdf.ts           # PDF processing utilities
│   ├── analyzer.ts      # Lab report analysis logic
│   └── prompts.ts       # AI prompt templates
├── data/
│   ├── markers.ts       # Lab marker definitions & reference ranges
│   └── interpretations.ts # Health insights templates
└── types/
    └── lab.ts           # TypeScript type definitions
```

## Deployment

### Vercel (Easiest) ⚡

**Best for**: Quick deployment, side projects

```bash
# 1. Get free OCR API key: https://ocr.space/ocrapi

# 2. Deploy to Vercel
vercel

# 3. Add environment variable in Vercel dashboard:
#    OCR_SPACE_API_KEY = your_key
```

**Full guide**: [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md)

### Railway with Docker (Best for Production) 🚀

**Best for**: Production apps, no external API costs

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy (Tesseract auto-installed)
railway login
railway init
railway up
```

**Full guide**: [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)

### Platform Comparison

| Platform | OCR Method | Setup | Cost | Best For |
|----------|-----------|-------|------|----------|
| **Vercel** | External API | 5 min | Free tier | Side projects |
| **Railway** (Docker) | System Tesseract | 10 min | $5/mo | Production |
| **Render** (Docker) | System Tesseract | 10 min | $7/mo | Production |
| **Self-hosted** | System Tesseract | Custom | $0+ | Full control |

**📚 All deployment options**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## How OCR Works

The app uses a **three-tier fallback strategy** for maximum reliability:

1. **System Tesseract CLI** (default, fastest)
   - Used in local dev and Docker deployments
   - Most reliable and performant

2. **Tesseract.js WASM in subprocess**
   - Fallback for environments without system Tesseract
   - Isolated from main process to prevent crashes

3. **Graceful degradation**
   - Returns partial results if OCR fails
   - App never crashes due to OCR issues

## Testing

### Test OCR locally
```bash
node scripts/test-ocr.js examples/lab-report.jpg
```

### Test via curl
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@test-image.jpg" \
  -F "gender=male"
```

## Environment Variables

Optional configuration:

```bash
# .env.local

# Use external OCR service (optional)
OCR_SERVICE_URL=https://your-ocr-service.railway.app

# Google Cloud Vision API (optional)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# AWS Textract (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

## Troubleshooting

### OCR not working locally
1. Verify Tesseract is installed: `tesseract --version`
2. Check PATH includes Tesseract directory
3. Restart terminal/IDE after installation

### Server crashes on upload
- Fixed! The app uses subprocess isolation to prevent crashes
- Check logs for "ocr subprocess stderr:" messages
- Ensure you're running the latest code

### Low OCR accuracy
- Use high-resolution images (300 DPI recommended)
- Ensure good contrast and lighting
- Try different image formats (PNG usually works best)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review the troubleshooting section above
sudo apt update && sudo apt install -y poppler-utils
```

- Windows:

Download Poppler for Windows and add the `bin` folder to your PATH. See https://poppler.freedesktop.org/ or a packaged build like "Poppler for Windows".

