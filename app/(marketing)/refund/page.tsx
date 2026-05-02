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
          <p className="text-zinc-500 mb-8">Last updated: May 2, 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-indigo-400">
            <p>
              At Codcompass, we want you to be completely satisfied with your subscription. This Refund Policy outlines your rights and our obligations regarding refunds.
            </p>

            <h2>1. 7-Day Money-Back Guarantee</h2>
            <p>
              We offer a <strong>7-day money-back guarantee</strong> on all paid subscriptions. If you are not satisfied with our service for any reason, you may request a full refund within 7 days of your initial purchase.
            </p>
            <p className="text-amber-400 font-medium">
              Important: This guarantee applies only to your <strong>first purchase</strong> of each subscription tier. If you have previously purchased and refunded the same subscription tier, you are not eligible for another refund.
            </p>

            <h2>2. One Refund Per User Account</h2>
            <p>
              <strong>Each user account is eligible for only one refund</strong> per subscription tier (Builder or Pro). This policy is in place to prevent abuse and ensure fair access to our refund guarantee.
            </p>
            <ul>
              <li>If you upgrade from Builder to Pro, you are eligible for a refund on the Pro subscription (if within 7 days)</li>
              <li>If you refund your Builder subscription, you cannot purchase and refund Builder again</li>
              <li>We track refund history by account email and payment method</li>
            </ul>

            <h2>3. How to Request a Refund</h2>
            <p>
              To request a refund, please contact us at <a href="mailto:support@codcompass.com">support@codcompass.com</a> with the following information:
            </p>
            <ul>
              <li>Your account email address</li>
              <li>Date of purchase</li>
              <li>Order ID (from your Paddle receipt)</li>
              <li>Reason for refund request (optional, but helps us improve)</li>
            </ul>
            <p>
              We will process your refund request within <strong>3-5 business days</strong> of receiving it.
            </p>

            <h2>4. Refund Method</h2>
            <p>
              Refunds will be issued using the same payment method used for the original purchase. If you paid by credit card, the refund will be credited back to your card. Processing time depends on your bank or card issuer (typically 5-10 business days).
            </p>

            <h2>5. Subscription Cancellation vs Refund</h2>
            <p>
              <strong>Cancellation</strong> stops future billing but does not refund your current period. You retain access until the end of your billing cycle.
            </p>
            <p>
              <strong>Refund</strong> returns your payment and immediately revokes access to premium content.
            </p>

            <h2>6. Anti-Abuse Policy</h2>
            <p>
              We take refund abuse seriously. The following activities may result in <strong>account suspension or termination</strong>:
            </p>
            <ul>
              <li><strong>Repeated purchase-refund cycles:</strong> Purchasing and refunding subscriptions multiple times to gain free access</li>
              <li><strong>Multiple accounts:</strong> Creating new accounts to claim additional refunds</li>
              <li><strong>Fraudulent payment disputes:</strong> Filing chargebacks after receiving a refund</li>
              <li><strong>Misrepresentation:</strong> Providing false information to obtain a refund</li>
            </ul>
            <p>
              We reserve the right to <strong>deny any refund request</strong> that we determine to be abusive or fraudulent.
            </p>

            <h2>7. Exceptions</h2>
            <p>Refunds may not be issued in the following circumstances:</p>
            <ul>
              <li>Requests made more than 7 days after purchase</li>
              <li>Second or subsequent refund requests for the same subscription tier</li>
              <li>Accounts found to be in violation of our Terms of Service</li>
              <li>Accounts with a history of refund abuse</li>
            </ul>

            <h2>8. Payment Processor Fees</h2>
            <p>
              Refund amounts may exclude payment processing fees charged by our payment processor (Paddle). These fees are non-refundable and are determined by the payment processor's own policies.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Refund Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>

            <h2>10. Contact Us</h2>
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
