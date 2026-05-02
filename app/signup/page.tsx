'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Use existing supabase-js library to avoid missing dependency errors
import { createClient } from '@supabase/supabase-js';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Initialize Supabase client
  // Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Registration successful! Please check your email or contact the administrator to activate your account.');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-palette-bgPrimary flex items-center justify-center p-4">
      <form onSubmit={handleSignUp} className="w-full max-w-md p-8 space-y-6 bg-palette-bgCard rounded-xl border border-palette-border shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-palette-textMuted mt-2">Join CodeCompass Developer Community</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-palette-textMuted mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-palette-bgSecondary border border-palette-border rounded-lg text-white focus:ring-2 focus:ring-palette-primary focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-palette-textMuted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-palette-bgSecondary border border-palette-border rounded-lg text-white focus:ring-2 focus:ring-palette-primary focus:border-transparent outline-none transition-all"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-palette-primary hover:bg-palette-primary-hover text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-palette-primary"
        >
          Sign Up
        </button>

        <div className="text-center text-sm text-palette-textMuted">
          Already have an account?{' '}
          <a href="/login" className="text-palette-accent hover:text-palette-accent font-medium">
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
