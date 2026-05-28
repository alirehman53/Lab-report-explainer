export const metadata = {
  title: 'About Our Ads | Lab Lens',
  description: 'Learn about advertising on Lab Lens and how it helps keep our service free.',
}

export default function AdsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Our Advertising</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2>Why We Show Ads</h2>
        <p>
          Lab Lens is a free service that helps people understand their medical lab results. To keep 
          this service free and accessible to everyone, we display advertisements through Google AdSense.
        </p>

        <h2>How Ads Support Our Mission</h2>
        <p>
          Revenue from advertising helps us:
        </p>
        <ul>
          <li>Maintain and improve our AI analysis algorithms</li>
          <li>Cover hosting and infrastructure costs</li>
          <li>Keep the service free for all users</li>
          <li>Develop new features and educational content</li>
          <li>Create comprehensive blog articles about health and lab testing</li>
        </ul>

        <h2>Our Advertising Partner</h2>
        <p>
          We use <strong>Google AdSense</strong> as our advertising platform. Google AdSense may show:
        </p>
        <ul>
          <li>Display ads (banner, text, rich media)</li>
          <li>Contextual ads related to health and wellness</li>
          <li>Personalized ads based on your browsing history (with your consent)</li>
        </ul>

        <h2>Ad Privacy and Control</h2>
        <p>
          We respect your privacy and give you control over ads:
        </p>
        <ul>
          <li>You can opt out of personalized ads through our consent banner</li>
          <li>
            Visit{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google's Ads Settings
            </a>{' '}
            to control ad personalization
          </li>
          <li>
            Learn more in our <a href="/privacy">Privacy Policy</a>
          </li>
        </ul>

        <h2>Editorial Independence</h2>
        <p>
          Our content and lab report interpretations are editorially independent from our advertising. 
          Ads do not influence our analysis algorithms or educational content.
        </p>

        <h2>Ad Standards</h2>
        <p>
          We adhere to Google's advertising policies, which prohibit:
        </p>
        <ul>
          <li>Misleading health claims</li>
          <li>Promotion of dangerous products or practices</li>
          <li>Malware or deceptive practices</li>
        </ul>

        <h2>Alternative Support</h2>
        <p>
          If you'd like to support Lab Lens without viewing ads, please consider:
        </p>
        <ul>
          <li>Sharing our service with others who might benefit</li>
          <li>Providing feedback to help us improve</li>
          <li>Following our blog for health education content</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Questions about our advertising practices? Contact us at:{' '}
          <a href="mailto:ads@lablens.example">ads@lablens.example</a>
        </p>
      </div>
    </main>
  )
}
