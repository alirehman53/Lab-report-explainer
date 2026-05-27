/**
 * Test PDF extraction by uploading to the API
 * Usage: node test-pdf-local.js path/to/your.pdf
 * 
 * Make sure dev server is running: pnpm dev
 */

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const http = require('http')

async function testPdfViaApi(pdfPath) {
  console.log('Testing PDF upload:', pdfPath)
  
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ File not found:', pdfPath)
    process.exit(1)
  }
  
  const buffer = fs.readFileSync(pdfPath)
  console.log('📄 File size:', buffer.length, 'bytes')
  
  if (buffer.length === 0) {
    console.error('❌ File is empty!')
    process.exit(1)
  }
  
  // Create form data
  const form = new FormData()
  form.append('file', buffer, {
    filename: path.basename(pdfPath),
    contentType: 'application/pdf'
  })
  form.append('gender', 'unknown')
  
  console.log('\n📤 Uploading to http://localhost:3000/api/analyze ...')
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analyze',
    method: 'POST',
    headers: form.getHeaders()
  }
  
  const req = http.request(options, (res) => {
    let data = ''
    
    res.on('data', chunk => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('\n📥 Response status:', res.statusCode)
      console.log('Response headers:', JSON.stringify(res.headers, null, 2))
      
      try {
        const json = JSON.parse(data)
        console.log('\n✅ Response JSON:')
        console.log(JSON.stringify(json, null, 2))
        
        if (json.error) {
          console.log('\n❌ Error:', json.error)
        } else if (json.results) {
          console.log('\n✅ Success! Found', json.results.length, 'results')
        }
      } catch (e) {
        console.log('\n❌ Could not parse response as JSON:')
        console.log(data)
      }
    })
  })
  
  req.on('error', (e) => {
    console.error('\n❌ Request failed:', e.message)
    console.error('\n💡 Make sure dev server is running: pnpm dev')
  })
  
  form.pipe(req)
}

const pdfPath = process.argv[2]
if (!pdfPath) {
  console.log('Usage: node test-pdf-local.js <path-to-pdf>')
  console.log('Example: node test-pdf-local.js examples/CBC-report.pdf')
  console.log('\nMake sure dev server is running first: pnpm dev')
  process.exit(1)
}

testPdfViaApi(path.resolve(pdfPath))
