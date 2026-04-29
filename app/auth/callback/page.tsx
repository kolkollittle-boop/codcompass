'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        return;
      }

      // 登录成功，跳转到仪表盘
      router.push('/dashboard');
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">登录失败</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-4">正在登录...</h2>
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
