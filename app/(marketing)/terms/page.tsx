import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Codcompass',
  description: 'Read the terms of service for Codcompass knowledge base platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-zinc-500 mb-8">Last updated: April 25, 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-indigo-400">
            <p>
              Welcome to Codcompass ("platform," "we," "our"). These Terms of Service ("Terms") govern your access to and use of the codcompass.com website and related services.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Codcompass, you agree to be bound by these Terms. If you do not agree to any terms, please do not use our services.
            </p>

            <h2>2. Service Description</h2>
            <p>
              Codcompass provides subscription access to technical tutorials, code examples, and expert insights. We offer free and paid subscription plans.
            </p>

            <h2>3. Account Registration</h2>
            <ul>
              <li>You must provide accurate, complete registration information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 13 years old to create an account</li>
              <li>One account per natural person only</li>
            </ul>

            <h2>4. Subscriptions and Payments</h2>
            <h3>4.1 Subscription Plans</h3>
            <p>We offer the following subscription plans (see /pricing page for details):</p>
            <ul>
              <li><strong>Free:</strong> Free, limited access</li>
              <li><strong>Builder:</strong> $9.99/month or $99/year</li>
              <li><strong>Pro:</strong> $29/month or $299/year</li>
              <li><strong>Enterprise:</strong> Custom pricing</li>
            </ul>

            <h3>4.2 Payment Processing</h3>
            <p>
              All payments are processed through Lemon Squeezy. You agree to comply with Lemon Squeezy's payment terms.
            </p>

            <h3>4.3 Refund Policy</h3>
            <p>
              We offer a 30-day money-back guarantee. If you're not satisfied within 30 days of subscription, you can request a full refund.
            </p>

            <h3>4.4 Subscription Cancellation</h3>
            <p>
              You can cancel your subscription at any time. After cancellation, you will continue to have access to premium content until the end of your current billing period.
            </p>

            <h2>5. Intellectual Property</h2>
            <h3>5.1 Our Content</h3>
            <p>
              All content on Codcompass (articles, code examples, images, trademarks) is protected by copyright, trademark, and other intellectual property laws. Without our express permission, you may not copy, distribute, or create derivative works.
            </p>

            <h3>5.2 User-Generated Content</h3>
            <p>
              If you provide content to us through feedback, comments, or contributions, you grant us a non-exclusive, worldwide, royalty-free license to use it.
            </p>

            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Distribute malware or harmful code</li>
              <li>Attempt to crack, reverse engineer, or bypass security measures</li>
              <li>Automatically scrape or crawl content (unless explicitly permitted)</li>
              <li>Share account or subscription credentials</li>
              <li>Use content for commercial redistribution</li>
            </ul>

            <h2>7. Disclaimer</h2>
            <p>
              <strong>Services are provided "as is" without any express or implied warranties.</strong> We do not guarantee that services will be uninterrupted, timely, secure, or error-free.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall Codcompass and its team be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data loss, or business interruption.
            </p>

            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Codcompass from any claims, damages, or expenses arising from your use of the services, violation of these Terms, or infringement of any third-party rights.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access at any time for any reason, including violation of these Terms. Upon termination, your right to use the services will immediately cease.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be notified via email or website notice. Continued use of the services constitutes acceptance of updated Terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by United States law, without regard to its conflict of law provisions. Any disputes will be resolved in United States courts.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              For any questions about these Terms, please contact us at <a href="mailto:legal@codcompass.com">legal@codcompass.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
