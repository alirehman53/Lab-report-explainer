const { PDFParse } = require('pdf-parse');
const fs = require('fs');

const pdfPath = process.argv[2] || 'examples/CBC-report.pdf';
const buffer = fs.readFileSync(pdfPath);

PDFParse(buffer).then(data => {
  console.log('PDF:', pdfPath);
  console.log('Pages:', data.numpages);
  console.log('Text length:', data.text?.length || 0);
  console.log('\nFirst 500 characters:');
  console.log(data.text?.substring(0, 500) || '(no text)');
}).catch(err => {
  console.error('Error:', err.message);
});
