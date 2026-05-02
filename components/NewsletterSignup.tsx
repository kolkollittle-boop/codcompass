'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'default' | 'dark';
}

export default function NewsletterSignup({ variant = 'default' }: NewsletterSignupProps) {
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
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(json.message || 'Thanks for subscribing! Check your inbox for confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(json.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const isDark = variant === 'dark';

  return (
    <div className={`rounded-2xl p-8 sm:p-12 ${
      isDark
        ? 'bg-gradient-to-br from-palette-bgCard to-palette-bgSecondary border border-white/[0.08]'
        : 'bg-gradient-to-br from-palette-bgCard to-palette-bgSecondary border border-palette-border'
    }`}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-palette-textPrimary'}`}>
          Stay Ahead of the Curve
        </h2>
        <p className={`text-lg mb-8 ${isDark ? 'text-palette-textMuted' : 'text-palette-textMuted'}`}>
          Get weekly technical insights, tutorials, and best practices delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-palette-primary focus:border-transparent ${
              isDark
                ? 'bg-palette-bgSecondary border-palette-border text-white placeholder-palette-textMuted'
                : 'bg-palette-bgSecondary border-palette-border text-palette-textPrimary placeholder-palette-textMuted'
            }`}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-palette-primary text-white font-medium rounded-lg hover:bg-palette-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <p className={`mt-4 text-xs text-palette-textMuted`}>
          No spam, ever. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
