import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Codcompass',
  description: 'Read the privacy policy for Codcompass knowledge base platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: April 25, 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed">
            <p>
              Codcompass ("we," "our," or "platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>1.1 Information You Provide Directly</h3>
            <ul>
              <li>Account information: name, email address</li>
              <li>Subscription information: payment method, billing address</li>
              <li>Contact information: messages submitted through contact forms</li>
            </ul>

            <h3>1.2 Information Collected Automatically</h3>
            <ul>
              <li>Usage data: page visits, article reading time, click behavior</li>
              <li>Device information: browser type, operating system, IP address</li>
              <li>Cookies: used for authentication, preferences, and analytics</li>
            </ul>

            <h2>2. How We Use Information</h2>
            <ul>
              <li>Provide and maintain Codcompass services</li>
              <li>Process your subscriptions and payments</li>
              <li>Send service notifications and updates</li>
              <li>Improve user experience and content quality</li>
              <li>Prevent fraud and abuse</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We only share it in the following circumstances:</p>
            <ul>
              <li><strong>Service providers:</strong> Sharing necessary information with payment processors (Lemon Squeezy), cloud providers (Vercel, Supabase)</li>
              <li><strong>Legal requirements:</strong> Complying with legal obligations or protecting our rights</li>
              <li><strong>Business transfers:</strong> Transferring during company mergers, acquisitions</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              We use industry-standard security measures to protect your data, including encrypted transmission, access controls, and regular security audits. Data is stored in data centers in the United States and European Union.
            </p>

            <h2>5. Your Rights</h2>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Obtain your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use necessary cookies for authentication and preferences. Analytics cookies (Google Analytics) help us improve our services. You can manage cookies through your browser settings.
            </p>

            <h2>7. GDPR Compliance (EU Users)</h2>
            <p>
              As an EU user, you have rights granted by GDPR. Our data processing is based on: contract performance, legitimate interests, your consent, or legal obligations.
            </p>

            <h2>8. CCPA Compliance (California Users)</h2>
            <p>
              As a California resident, you have the right to know the categories of personal information we collect, sources, purposes of use, and the right to refuse sale (we do not sell personal information).
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Codcompass is not directed to children under 13. If we discover we have inadvertently collected personal information from children, we will delete it immediately.
            </p>

            <h2>10. Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified via email or website notice.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@codcompass.com">privacy@codcompass.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
