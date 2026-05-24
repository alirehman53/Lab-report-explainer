# Deployment Guide

This application requires OCR (Optical Character Recognition) functionality to extract text from lab report images and PDFs. Different deployment platforms require different approaches.

## OCR Implementation Strategy

The app uses a **three-tier fallback strategy**:

1. **System Tesseract CLI** (fastest, most reliable)
2. **Tesseract.js WASM in subprocess** (for serverless environments)
3. **Graceful degradation** (returns analysis based on available data)

---

## Option 1: Docker Deployment (Recommended)

**Best for**: Railway, Render, Fly.io, AWS ECS, Google Cloud Run, self-hosted VPS

### Advantages
✅ System Tesseract installed automatically  
✅ Most reliable OCR performance  
✅ No server crashes from WASM issues  
✅ Supports large files

### Setup

1. **Build the Docker image**:
```bash
docker build -t lab-report-explainer .
```

2. **Run locally** (for testing):
```bash
docker run -p 3000:3000 lab-report-explainer
```

3. **Deploy to your platform**:

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render
- Connect your GitHub repo
- Select "Docker" as environment
- Render will auto-detect the Dockerfile

#### Fly.io
```bash
# Install Fly CLI
fly launch
fly deploy
```

#### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/lab-report-explainer
gcloud run deploy --image gcr.io/PROJECT-ID/lab-report-explainer --platform managed
```

---

## Option 2: Vercel Deployment

**Best for**: Quick deployments, serverless architecture

### ⚠️ Limitations
- Tesseract CLI not available on Vercel
- Falls back to tesseract.js WASM (may have reliability issues)
- Function timeout limits (10s on free tier, 60s on Pro)
- For production, consider using Option 3 (hybrid approach)

### Setup

1. **Update next.config.ts** to enable standalone mode:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Only needed for Docker, remove for Vercel
  // ... rest of config
}
```

2. **Deploy to Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com)

---

## Option 3: Hybrid Approach (Best for Production)

**Best for**: High reliability, production applications

Deploy your Next.js app to Vercel/Netlify but run OCR on a separate service:

### Architecture
```
User → Next.js (Vercel) → OCR Service (Railway/Render) → Next.js
```

### Steps

1. **Create a separate OCR microservice** (Node.js Express):

```javascript
// ocr-service/index.js
const express = require('express');
const tesseract = require('node-tesseract-ocr');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    const text = await tesseract.recognize(req.file.buffer, {
      lang: 'eng',
    });
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 8080);
```

2. **Deploy OCR service** to Railway/Render with Docker

3. **Update your Next.js app** to call the OCR service:

```typescript
// lib/ocr.ts
export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const ocrServiceUrl = process.env.OCR_SERVICE_URL;
  
  if (ocrServiceUrl) {
    // Use external OCR service
    const formData = new FormData();
    formData.append('image', new Blob([buffer]));
    
    const response = await fetch(`${ocrServiceUrl}/ocr`, {
      method: 'POST',
      body: formData,
    });
    
    const { text } = await response.json();
    return text;
  }
  
  // Fallback to existing implementation
  // ... existing code
}
```

4. **Set environment variable** in Vercel:
```
OCR_SERVICE_URL=https://your-ocr-service.railway.app
```

---

## Option 4: External OCR API

**Best for**: No infrastructure management, guaranteed uptime

Use a managed OCR service:

### Google Cloud Vision API

```typescript
// lib/ocr.ts
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const [result] = await client.textDetection(Buffer.from(buffer));
  return result.textAnnotations?.[0]?.description || '';
}
```

**Cost**: $1.50 per 1000 images (first 1000/month free)

### AWS Textract

```typescript
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const client = new TextractClient({ region: 'us-east-1' });

export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const command = new DetectDocumentTextCommand({
    Document: { Bytes: new Uint8Array(buffer) },
  });
  
  const response = await client.send(command);
  return response.Blocks
    ?.filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join('\n') || '';
}
```

**Cost**: $1.50 per 1000 pages

### OCR.space API (Free Tier Available)

```typescript
export async function ocrBuffer(buffer: ArrayBuffer): Promise<string> {
  const formData = new FormData();
  formData.append('file', new Blob([buffer]));
  formData.append('apikey', process.env.OCR_SPACE_API_KEY!);
  
  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.ParsedResults?.[0]?.ParsedText || '';
}
```

**Cost**: Free for 25,000 requests/month

---

## Comparison Matrix

| Platform | Tesseract Available | Setup Complexity | Reliability | Cost |
|----------|---------------------|------------------|-------------|------|
| Docker (Railway/Render) | ✅ Yes | Medium | ⭐⭐⭐⭐⭐ | $5-10/month |
| Vercel (Serverless) | ❌ No (WASM fallback) | Low | ⭐⭐⭐ | Free/$20/month |
| Hybrid (Vercel + OCR Service) | ✅ Yes | High | ⭐⭐⭐⭐⭐ | $5-10/month |
| External API | ✅ Yes | Low | ⭐⭐⭐⭐⭐ | Pay per use |

---

## Recommendation

**For Development**: Use local Tesseract installation (already done)

**For Production**:
- **Small projects**: Docker on Railway ($5/month) 
- **High traffic**: Hybrid approach (Vercel + Railway OCR service)
- **Enterprise**: Google Cloud Vision API for guaranteed reliability

---

## Testing Your Deployment

After deployment, test the OCR functionality:

```bash
# Replace YOUR_DOMAIN with your deployed URL
curl -X POST YOUR_DOMAIN/api/analyze \
  -F "file=@test-lab-report.jpg" \
  -F "gender=male"
```

Check the response for extracted text and analysis results.
