'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Cloudflare Turnstile Key (开发环境使用测试 Key，生产环境请替换为你自己的)
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  
  // 使用标准 Supabase 客户端，确保兼容所有环境
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. 加载 Turnstile 脚本
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.turnstile && !document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        if (turnstileRef.current && window.turnstile) {
          window.turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => setTurnstileToken(token),
            'error-callback': () => setError('人机验证失败，请刷新重试'),
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const getTurnstileToken = () => {
    if (typeof window !== 'undefined' && window.turnstile) {
      return window.turnstile.getResponse() || turnstileToken;
    }
    return turnstileToken;
  };

  // 2. Google 登录
  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // 3. 邮箱密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const captchaToken = getTurnstileToken();
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  };

  // 4. 发送注册验证码 (OTP)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    // shouldCreateUser: true 表示如果邮箱不存在，自动创建新用户
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setMessage('验证码已发送！请查收邮件');
    setStep('otp');
    setLoading(false);
  };

  // 5. 验证 OTP 完成注册/登录
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.verifyOtp({
      email, token: otp, type: 'email'
    });
    if (error) { setError('验证码错误或已过期'); setLoading(false); return; }
    setMessage('验证成功！正在跳转...');
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 font-medium py-2.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 text-zinc-500 text-sm">
          <div className="flex-1 h-px bg-zinc-800" /> 
          <span>OR</span> 
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Form */}
        <form onSubmit={
          step === 'otp' ? handleVerifyOtp : 
          (mode === 'login' ? handlePasswordLogin : handleSendOtp)
        } className="space-y-4">
          
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          {mode === 'login' && step === 'form' && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 outline-none" 
                placeholder="••••••••" 
                required 
              />
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-fadeIn">
              <label className="block text-sm text-zinc-400 mb-1">Verification Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))} 
                maxLength={6} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-center tracking-widest font-mono text-xl text-white focus:border-cyan-500 outline-none" 
                placeholder="000000" 
                required 
              />
              <button type="button" onClick={() => setStep('form')} className="mt-2 text-xs text-cyan-400 hover:underline">
                ← Back to form
              </button>
            </div>
          )}

          {/* Turnstile Widget */}
          <div ref={turnstileRef} className="flex justify-center min-h-[65px]" />

          {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800">{error}</p>}
          {message && <p className="text-emerald-400 text-sm bg-emerald-900/20 p-2 rounded border border-emerald-800">{message}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : step === 'otp' ? 'Verify & Enter' : mode === 'login' ? 'Log In' : 'Send Verification Code'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm text-zinc-500">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('signup')} className="text-cyan-400 hover:underline font-medium">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-cyan-400 hover:underline font-medium">Log in</button></>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-zinc-600">
          By continuing, you agree to our <Link href="/terms" className="hover:text-zinc-400">Terms</Link> & <Link href="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
