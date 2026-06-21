import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Smart Expense Tracker',
  description: 'Privacy policy for Smart Expense Tracker iOS app by Aporia.',
};

export default function SmartExpensePrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-bgPrimary text-palette-textPrimary">
      <Header />
      <main className="flex-grow">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <h2 className="text-xl text-palette-primary mb-8">Smart Expense Tracker</h2>
          <p className="text-palette-textMuted mb-8">Effective Date: July 2026</p>

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-palette-textSecondary prose-p:leading-relaxed prose-a:text-palette-primary">
            <p>
              Smart Expense Tracker (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our iOS application (the &quot;App&quot;).
            </p>

            <h2>1. Information We Collect</h2>

            <h3>1.1 Data You Provide</h3>
            <p>When you add transactions, set budgets, or manage categories within the App, this data is stored <strong>locally on your device</strong> by default. We do not collect this data unless you explicitly enable cloud synchronization.</p>

            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="border-b border-palette-border">
                  <th className="py-2 pr-4 text-white">Data Type</th>
                  <th className="py-2 pr-4 text-white">Storage</th>
                  <th className="py-2 pr-4 text-white">Collected?</th>
                  <th className="py-2 text-white">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-palette-textSecondary">
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Transaction records (amount, merchant, category, date)</td>
                  <td className="py-2 pr-4">Local CoreData / SQLite</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Expense tracking</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Budget settings & progress</td>
                  <td className="py-2 pr-4">Local UserDefaults</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Budget management</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Custom categories & currency</td>
                  <td className="py-2 pr-4">Local UserDefaults</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Personalization</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Notification preferences</td>
                  <td className="py-2 pr-4">Local UserDefaults</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Budget alerts</td>
                </tr>
              </tbody>
            </table>

            <h3>1.2 Photo Recognition Data</h3>
            <p>When you use the <strong>photo-based expense recognition</strong> feature:</p>
            <ul>
              <li>The photo is captured by your device camera or selected from your photo library</li>
              <li>The image is sent to <strong>Alibaba Cloud Qwen (Tongyi Qianwen) API</strong> for text recognition and expense extraction</li>
              <li>The image is <strong>not stored</strong> on our servers or by Alibaba Cloud after processing</li>
              <li>Recognition results (extracted amount, merchant, date) are stored <strong>locally on your device</strong></li>
              <li>We do not retain or use your photos for any purpose other than generating the expense entry</li>
            </ul>

            <h3>1.3 Cloud Sync Data (Optional)</h3>
            <p>If you enable <strong>cloud synchronization</strong> (requires a Pro subscription), the following data is uploaded to our Supabase backend:</p>
            <ul>
              <li>Transaction records (amount, merchant, category, date, notes)</li>
              <li>Budget settings and progress</li>
              <li>Custom categories</li>
              <li>User preferences (currency, display name)</li>
            </ul>
            <p>This data is encrypted in transit (TLS 1.3) and protected by Row-Level Security (RLS) in our database. <strong>Only you can access your data.</strong></p>

            <h3>1.4 Account Information</h3>
            <p>If you choose to create an account for cloud sync:</p>
            <ul>
              <li><strong>Email address</strong> — stored in Supabase Auth</li>
              <li><strong>Authentication tokens</strong> — stored securely in iOS Keychain</li>
              <li><strong>Subscription receipts</strong> — processed by RevenueCat</li>
            </ul>

            <h3>1.5 Automatically Collected Data</h3>
            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="border-b border-palette-border">
                  <th className="py-2 pr-4 text-white">Data Type</th>
                  <th className="py-2 pr-4 text-white">Source</th>
                  <th className="py-2 pr-4 text-white">Purpose</th>
                  <th className="py-2 text-white">Shared?</th>
                </tr>
              </thead>
              <tbody className="text-palette-textSecondary">
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Crash logs & diagnostics</td>
                  <td className="py-2 pr-4">Apple Crash Reporting</td>
                  <td className="py-2 pr-4">Bug fixing</td>
                  <td className="py-2">No</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Subscription status</td>
                  <td className="py-2 pr-4">RevenueCat</td>
                  <td className="py-2 pr-4">Unlock Pro features</td>
                  <td className="py-2">RevenueCat only</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Advertising ID (IDFA)</td>
                  <td className="py-2 pr-4">Apple Ad Services (optional)</td>
                  <td className="py-2 pr-4">Ad personalization</td>
                  <td className="py-2">Google AdMob only</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Device model & iOS version</td>
                  <td className="py-2 pr-4">System APIs</td>
                  <td className="py-2 pr-4">App optimization</td>
                  <td className="py-2">No</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-palette-surface/50 border border-palette-border rounded-lg p-4 my-6">
              <p className="m-0">
                <strong>Note:</strong> We use Google AdMob to display advertisements in the free version. AdMob may collect your device&apos;s Advertising Identifier (IDFA) if you grant permission via Apple&apos;s App Tracking Transparency (ATT) prompt. You may decline this permission without affecting core app functionality. We limit ad impressions to 5 interstitial ads per day maximum to avoid disrupting your experience.
              </p>
            </div>

            <h3>1.6 Data We Do NOT Collect</h3>
            <p>We <strong>do not</strong> collect:</p>
            <ul>
              <li>Your real name or physical address</li>
              <li>Precise location data (GPS coordinates)</li>
              <li>Contacts from your device</li>
              <li>Bank account numbers or credit card details</li>
              <li>Browsing history or activity outside the App</li>
              <li>Health data from Apple HealthKit</li>
              <li>Voice recordings from speech-to-text (processed locally via Apple Speech Recognition)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="border-b border-palette-border">
                  <th className="py-2 pr-4 text-white">Purpose</th>
                  <th className="py-2 pr-4 text-white">Data Used</th>
                  <th className="py-2 text-white">Legal Basis</th>
                </tr>
              </thead>
              <tbody className="text-palette-textSecondary">
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Provide core expense tracking</td>
                  <td className="py-2 pr-4">Local transaction data</td>
                  <td className="py-2">Contract (app functionality)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Photo-based expense recognition</td>
                  <td className="py-2 pr-4">Photo sent to Qwen API</td>
                  <td className="py-2">Consent (user action)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Cross-device cloud sync</td>
                  <td className="py-2 pr-4">Encrypted transaction data</td>
                  <td className="py-2">Consent (opt-in)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Subscription management</td>
                  <td className="py-2 pr-4">RevenueCat receipts</td>
                  <td className="py-2">Contract</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Ad delivery</td>
                  <td className="py-2 pr-4">IDFA (if permitted)</td>
                  <td className="py-2">Consent (ATT prompt)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Budget alerts & notifications</td>
                  <td className="py-2 pr-4">Local notification schedule</td>
                  <td className="py-2">Consent (system prompt)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Analytics & crash reports</td>
                  <td className="py-2 pr-4">Anonymous diagnostics</td>
                  <td className="py-2">Legitimate interest</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Data Sharing & Third Parties</h2>
            <p>We do not sell your personal data. We only share data with the following service providers, and only to the extent necessary:</p>
            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="border-b border-palette-border">
                  <th className="py-2 pr-4 text-white">Service Provider</th>
                  <th className="py-2 pr-4 text-white">Data Shared</th>
                  <th className="py-2 text-white">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-palette-textSecondary">
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4"><strong>Alibaba Cloud (Qwen)</strong></td>
                  <td className="py-2 pr-4">Receipt photos (temporary)</td>
                  <td className="py-2">AI-powered expense recognition</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4"><strong>RevenueCat</strong></td>
                  <td className="py-2 pr-4">Subscription receipts</td>
                  <td className="py-2">In-app purchase validation</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4"><strong>Google AdMob</strong></td>
                  <td className="py-2 pr-4">IDFA (if permitted)</td>
                  <td className="py-2">Ad serving in free version</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4"><strong>Supabase</strong></td>
                  <td className="py-2 pr-4">Transaction data (encrypted)</td>
                  <td className="py-2">Cloud sync (Pro users only)</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4"><strong>Apple</strong></td>
                  <td className="py-2 pr-4">Purchase receipts</td>
                  <td className="py-2">App Store billing</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Data Security</h2>
            <ul>
              <li><strong>Local data:</strong> Protected by iOS sandboxing and file system encryption</li>
              <li><strong>Keychain data:</strong> Protected by iOS Keychain Services (hardware-backed encryption on supported devices)</li>
              <li><strong>Cloud data:</strong> Encrypted in transit (TLS 1.3) and at rest (AES-256) via Supabase</li>
              <li><strong>Database access:</strong> Row-Level Security (RLS) ensures users can only access their own records</li>
              <li><strong>API keys:</strong> Obfuscated in the app binary and stored in iOS Keychain — never transmitted to third parties</li>
              <li><strong>Photo data:</strong> Not stored after processing by Qwen API; only the extracted text result is saved locally</li>
            </ul>

            <h2>5. Data Retention & Deletion</h2>
            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="border-b border-palette-border">
                  <th className="py-2 pr-4 text-white">Data Type</th>
                  <th className="py-2 pr-4 text-white">Retention Period</th>
                  <th className="py-2 text-white">How to Delete</th>
                </tr>
              </thead>
              <tbody className="text-palette-textSecondary">
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Local transaction data</td>
                  <td className="py-2 pr-4">Until you delete the app</td>
                  <td className="py-2">Delete app or use &quot;Clear All Data&quot; in Settings</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Cloud sync data</td>
                  <td className="py-2 pr-4">Until account deletion</td>
                  <td className="py-2">Contact support or delete account in Settings</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Subscription receipts</td>
                  <td className="py-2 pr-4">As required by Apple/RevenueCat</td>
                  <td className="py-2">Handled by RevenueCat per their policy</td>
                </tr>
                <tr className="border-b border-palette-border/50">
                  <td className="py-2 pr-4">Crash logs</td>
                  <td className="py-2 pr-4">90 days</td>
                  <td className="py-2">Automatically purged</td>
                </tr>
              </tbody>
            </table>

            <h2>6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Update inaccurate data</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format (CSV/JSON) via the in-app Data Export feature</li>
              <li><strong>Withdraw Consent:</strong> Disable cloud sync or ad tracking at any time</li>
              <li><strong>Object:</strong> Opt out of data processing for analytics</li>
            </ul>
            <p>To exercise these rights, contact us at: <strong>aporia-support@example.com</strong></p>

            <h2>7. Children&apos;s Privacy</h2>
            <p>The App is <strong>not intended for children under 13</strong>. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal data, please contact us to delete the information.</p>

            <h2>8. International Data Transfers</h2>
            <p>If you use cloud sync or photo recognition, your data may be processed by servers located in:</p>
            <ul>
              <li><strong>Supabase (cloud sync):</strong> United States</li>
              <li><strong>Qwen AI (photo recognition):</strong> China (Alibaba Cloud)</li>
            </ul>
            <p>We ensure adequate protection through:</p>
            <ul>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Row-Level Security policies</li>
              <li>Data minimization (photos are not retained after processing)</li>
            </ul>

            <h2>9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via:</p>
            <ul>
              <li>In-app notification on the next launch</li>
              <li>App Store release notes</li>
            </ul>

            <h2>10. Contact Us</h2>
            <p>For questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
            <p><strong>Email:</strong> aporia-support@example.com</p>
            <p><strong>Response Time:</strong> Within 48 hours</p>

            <p className="text-sm text-palette-textMuted mt-8">
              This Privacy Policy is provided as a legal disclosure. For the most current version, please refer to the in-app Settings &gt; Privacy Policy link or our website.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
