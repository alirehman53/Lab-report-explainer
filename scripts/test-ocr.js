#!/usr/bin/env node
/**
 * Test OCR functionality locally
 * Usage: node scripts/test-ocr.js path/to/image.png
 */

const fs = require('fs');
const path = require('path');

async function testOcr(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    console.error('Usage: node scripts/test-ocr.js <image-path>');
    process.exit(1);
  }

  console.log('Testing OCR with:', imagePath);
  
  const buffer = fs.readFileSync(imagePath);
  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('file', buffer, {
    filename: path.basename(imagePath),
    contentType: 'image/png',
  });
  form.append('gender', 'male');

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', text);
      process.exit(1);
    }

    const result = await response.json();
    console.log('\n✅ OCR Result:');
    console.log('Extracted text length:', result.extractedText?.length || 0);
    console.log('Text preview:', result.extractedText?.substring(0, 200) || '(empty)');
    console.log('\n📊 Analysis:', JSON.stringify(result.analysis, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

const imagePath = process.argv[2];
testOcr(imagePath);
