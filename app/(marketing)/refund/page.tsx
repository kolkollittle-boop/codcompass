import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Codcompass',
  description: 'How Codcompass subscription refunds work and how to request one.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">Refund policy</h1>
          <p className="text-zinc-500 mb-8">Last updated: May 2, 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-indigo-400 prose-li:text-zinc-300">
            <p>
              We want your paid experience on Codcompass to be clear and predictable. This page explains{' '}
              <strong>when you can get a refund</strong>, <strong>how to request one</strong>, and the{' '}
              <strong>reasonable limits</strong> we apply to prevent abuse. Those limits apply only to clearly
              unusual cases and do not affect legitimate refund requests under normal use.
            </p>

            <h2>1. Seven-day refund (first payment on a plan)</h2>
            <p>
              For the <strong>first successful charge</strong> on a <strong>paid subscription</strong>, we offer a{' '}
              <strong>full refund within 7 calendar days</strong> from the date payment completes. If the product or
              service does not meet your reasonable expectations, contact us within that window to request a refund.
            </p>
            <p>
              <strong>Note:</strong> “First payment” here means the <strong>first successful charge</strong> on a given
              subscription tier (Builder / Pro). If you have already completed a full “purchase → refunded” cycle on
              the <strong>same tier</strong>, a later purchase of that same tier usually does not qualify again under
              this “first payment” rule. That helps avoid repeated “try and refund” patterns that strain the service and
              other customers. If you upgrade from Builder to Pro, the <strong>first Pro charge</strong> may still be
              refunded under this section if requested within 7 days.
            </p>

            <h2>2. Fair use and repeat refunds</h2>
            <p>
              Under normal use, we will process refunds according to this policy. To keep the product sustainable, we
              may limit refunds where there is <strong>clear abuse</strong> of the refund process—for example, many
              immediate “buy then refund” cycles on the same account and tier, or coordinated multi-account access
              abuse.
            </p>
            <p>
              For most users who meet the timing and tier rules in section 1, you do <strong>not</strong> need to worry
              about a misleading “one refund only” reading. We are addressing abnormal patterns, not someone who tries
              the product in good faith and then decides to leave.
            </p>

            <h2>3. How to request a refund</h2>
            <p>
              Email{' '}
              <a href="mailto:support@codcompass.com">support@codcompass.com</a>. Please use a subject line such as{' '}
              <strong>Refund request</strong>. To speed things up, include where possible:
            </p>
            <ul>
              <li>The email you use to sign in</li>
              <li>Approximate purchase date</li>
              <li>Order or transaction ID from your Paddle receipt</li>
              <li>Reason for the refund (optional, but it helps us improve)</li>
            </ul>
            <p>
              After we receive your message, we typically review and reply within <strong>3–5 business days</strong>. If
              approved, the amount is returned through the original payment path (actual timing depends on your bank or
              payment provider; often roughly 5–10 business days).
            </p>

            <h2>4. Refund method</h2>
            <p>
              Refunds are issued through the <strong>original payment method</strong> whenever the payment network
              allows. If the channel cannot reverse the charge that way, we will work with you by email on a workable
              alternative.
            </p>

            <h2>5. Canceling vs. refunding</h2>
            <p>
              <strong>Cancel subscription:</strong> Stops future billing. You usually keep access for the period you
              already paid for until it ends (subject to in-product behavior).
            </p>
            <p>
              <strong>Refund:</strong> If approved, money is returned for the covered charge; paid entitlements tied to
              that refund are ended as soon as we reasonably can. Canceling and refunding are not the same. If you want
              to keep using the service for the rest of a period you paid for, choose <strong>cancel renewal only</strong>{' '}
              rather than a refund.
            </p>

            <h2>6. Cases where a refund may not apply (examples)</h2>
            <p>
              The following <strong>often do not</strong> meet refund conditions, or need individual review. We do not
              reject reasonable requests without talking to you first:
            </p>
            <ul>
              <li>The 7-day window in section 1 has passed;</li>
              <li>Same tier was refunded before, repurchased, and another refund is requested soon after (we look at
                timing and usage together);</li>
              <li>Account violates our Terms of Service, or there is clear fraud or chargeback risk;</li>
              <li>You already received a full refund for the same transaction and ask again.</li>
            </ul>
            <p>
              If you believe your situation is special, still write to us. We will try to offer a fair path within what
              we can do.
            </p>

            <h2>7. Payment processor fees</h2>
            <p>
              If the payment provider (e.g. Paddle) charges a <strong>non-refundable</strong> fee on refunds, that
              amount may be withheld from the refund total, per their rules. We will explain when that applies.
            </p>

            <h2>8. Changes to this policy</h2>
            <p>
              We may update this page from time to time. When we do, we will change the “Last updated” date above. If a
              change materially affects <strong>existing paying customers</strong>, we will try to notify you in a
              reasonable way (for example in-app or by email). Continued use after updates means you acknowledge the
              revised terms.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions about this policy:{' '}
              <a href="mailto:support@codcompass.com">support@codcompass.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
