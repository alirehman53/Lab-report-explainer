export const metadata = {
  title: 'Privacy Policy | Lab Lens',
  description: 'Our privacy policy explains how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>Introduction</h2>
        <p>
          Lab Lens ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
          explains how we collect, use, disclose, and safeguard your information when you use our website 
          and services.
        </p>

        <h2>Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>
          When you use our lab report analysis tool, we may collect:
        </p>
        <ul>
          <li>Lab report files you upload (PDFs, images)</li>
          <li>Analysis results and interpretations</li>
          <li>Usage data and analytics</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>
          We automatically collect certain information when you visit our site:
        </p>
        <ul>
          <li>IP address and browser type</li>
          <li>Pages visited and time spent</li>
          <li>Referring website</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide and improve our lab report analysis services</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Analyze usage patterns and optimize user experience</li>
          <li>Display relevant advertisements (with your consent)</li>
          <li>Detect and prevent fraud or abuse</li>
        </ul>

        <h2>Cookies and Tracking</h2>
        <p>
          We use cookies and similar technologies for:
        </p>
        <ul>
          <li><strong>Essential cookies:</strong> Required for the website to function</li>
          <li><strong>Analytics cookies:</strong> Google Analytics to understand site usage</li>
          <li><strong>Advertising cookies:</strong> Google AdSense for personalized ads</li>
        </ul>
        <p>
          You can control cookie preferences through our consent banner or your browser settings.
        </p>

        <h2>Third-Party Services</h2>
        <h3>Google Analytics</h3>
        <p>
          We use Google Analytics to analyze website traffic. Google Analytics collects information 
          anonymously and reports website trends without identifying individual visitors.
        </p>

        <h3>Google AdSense</h3>
        <p>
          We display ads through Google AdSense. Google may use cookies to show ads based on your 
          visits to our site and other websites. You can opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google's Ads Settings
          </a>.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your information. However, no method 
          of transmission over the internet is 100% secure. Lab reports you upload are processed 
          temporarily and not permanently stored on our servers.
        </p>

        <h2>Data Retention</h2>
        <p>
          Uploaded lab reports are processed in real-time and not retained. Analytics data is retained 
          according to Google Analytics' retention policies (typically 26 months).
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent for cookies and tracking</li>
        </ul>

        <h2>Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect information 
          from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Changes will be posted on this page with an 
          updated revision date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:{' '}
          <a href="mailto:privacy@lablens.example">privacy@lablens.example</a>
        </p>
      </div>
    </main>
  )
}
