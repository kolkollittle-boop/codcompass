import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Codcompass',
  description: 'Read the refund policy for Codcompass knowledge base platform.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">Refund Policy</h1>
          <p className="text-zinc-500 mb-8">Last updated: April 26, 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-indigo-400">
            <p>
              At Codcompass, we want you to be completely satisfied with your subscription. This Refund Policy outlines your rights and our obligations regarding refunds.
            </p>

            <h2>1. 30-Day Money-Back Guarantee</h2>
            <p>
              We offer a <strong>30-day money-back guarantee</strong> on all paid subscriptions. If you are not satisfied with our service for any reason, you may request a full refund within 30 days of your initial purchase or subscription renewal.
            </p>

            <h2>2. How to Request a Refund</h2>
            <p>
              To request a refund, please contact us at <a href="mailto:support@codcompass.com">support@codcompass.com</a> with the following information:
            </p>
            <ul>
              <li>Your account email address</li>
              <li>Date of purchase</li>
              <li>Reason for refund request (optional)</li>
            </ul>
            <p>
              We will process your refund request within 5 business days of receiving it.
            </p>

            <h2>3. Refund Method</h2>
            <p>
              Refunds will be issued using the same payment method used for the original purchase. If you paid by credit card, the refund will be credited back to your card. Processing time depends on your bank or card issuer (typically 5-10 business days).
            </p>

            <h2>4. Subscription Cancellation</h2>
            <p>
              You can cancel your subscription at any time from your account settings. After cancellation:
            </p>
            <ul>
              <li>You will continue to have access to premium content until the end of your current billing period</li>
              <li>You will not be charged for the next billing cycle</li>
              <li>Your account will automatically switch to the Free plan</li>
            </ul>

            <h2>5. Exceptions</h2>
            <p>Refunds may not be issued in the following circumstances:</p>
            <ul>
              <li>Requests made more than 30 days after purchase or renewal</li>
              <li>Accounts found to be in violation of our Terms of Service</li>
              <li>Multiple refund requests from the same individual or household</li>
              <li>Abuse of the refund policy (e.g., repeatedly subscribing and requesting refunds)</li>
            </ul>

            <h2>6. Partial Refunds</h2>
            <p>
              In some cases, we may offer partial refunds at our discretion. This may apply if:
            </p>
            <ul>
              <li>You have used the service for an extended period beyond 30 days</li>
              <li>There was a technical issue that affected only part of your subscription period</li>
            </ul>

            <h2>7. Payment Processor Fees</h2>
            <p>
              Refund amounts may exclude payment processing fees charged by our payment processor (Paddle). These fees are non-refundable and are determined by the payment processor's own policies.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Refund Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Refund Policy, please contact us at <a href="mailto:support@codcompass.com">support@codcompass.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
