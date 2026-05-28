export const metadata = {
  title: 'Terms of Service | Lab Lens',
  description: 'Terms and conditions for using Lab Lens services.',
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Lab Lens ("Service"), you accept and agree to be bound by these 
          Terms of Service. If you do not agree, please do not use our Service.
        </p>

        <h2>Description of Service</h2>
        <p>
          Lab Lens provides automated analysis and interpretation of medical lab reports using AI 
          and machine learning. Our service is for informational and educational purposes only.
        </p>

        <h2>Medical Disclaimer</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-semibold">IMPORTANT:</p>
          <ul className="mt-2">
            <li>Lab Lens is NOT a substitute for professional medical advice</li>
            <li>Always consult with a qualified healthcare provider</li>
            <li>Do not rely solely on our interpretations for medical decisions</li>
            <li>In case of emergency, contact emergency services immediately</li>
          </ul>
        </div>

        <h2>User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate information</li>
          <li>Use the Service only for lawful purposes</li>
          <li>Not upload reports containing others' protected health information without authorization</li>
          <li>Not attempt to reverse engineer or compromise our systems</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>
          All content, features, and functionality of Lab Lens are owned by us and protected by 
          copyright, trademark, and other intellectual property laws.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING MEDICAL COMPLICATIONS 
          OR HEALTH OUTCOMES RESULTING FROM USE OF OUR SERVICE.
        </p>

        <h2>Accuracy of Information</h2>
        <p>
          While we strive for accuracy, we make no warranties about the completeness, reliability, 
          or accuracy of interpretations. Lab report analysis involves complex medical judgment that 
          our automated system may not fully capture.
        </p>

        <h2>Privacy and Data</h2>
        <p>
          Your use of the Service is also governed by our Privacy Policy. We do not permanently 
          store uploaded lab reports.
        </p>

        <h2>Advertising</h2>
        <p>
          Our Service displays advertisements through Google AdSense. We are not responsible for 
          the content of third-party ads.
        </p>

        <h2>Modifications to Service</h2>
        <p>
          We reserve the right to modify or discontinue the Service at any time without notice.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice, for 
          any reason, including breach of these Terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by applicable laws without regard to conflict of law provisions.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the Service after 
          changes constitutes acceptance of the new Terms.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these Terms, contact us at:{' '}
          <a href="mailto:legal@lablens.example">legal@lablens.example</a>
        </p>
      </div>
    </main>
  )
}
