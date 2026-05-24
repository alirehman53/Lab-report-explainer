const fs = require('fs');
const path = require('path');
const { ocrBuffer } = require('./lib/ocr.ts');

async function test() {
  const imgPath = path.join(__dirname, 'examples', 'report-image.png');
  const buffer = fs.readFileSync(imgPath);
  
  console.log('Starting OCR on report-image.png...');
  console.log('Buffer size:', buffer.length);
  
  try {
    const text = await ocrBuffer(buffer.buffer);
    console.log('\n=== OCR RESULT ===');
    console.log('Length:', text.length);
    console.log('Text:', text.substring(0, 500));
  } catch (err) {
    console.error('OCR Error:', err);
  }
}

test();
