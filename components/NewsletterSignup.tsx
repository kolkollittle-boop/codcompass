'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    // TODO: Integrate with your email service (ConvertKit, Mailchimp, etc.)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox for confirmation.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 sm:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Stay Ahead of the Curve
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Get weekly technical insights, tutorials, and best practices delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}

        <p className="mt-4 text-xs text-gray-500">
          No spam, ever. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
