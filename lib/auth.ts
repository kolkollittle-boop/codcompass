import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// 验证必要的环境变量
// 支持两种命名方式：AUTH_GOOGLE_ID/SECRET (v5) 和 GOOGLE_CLIENT_ID/SECRET (legacy)
const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error('[Auth] Missing Google OAuth credentials. Set AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
  console.error('[Auth] Current AUTH_GOOGLE_ID:', googleClientId ? '***configured***' : 'MISSING');
  console.error('[Auth] Current AUTH_GOOGLE_SECRET:', googleClientSecret ? '***configured***' : 'MISSING');
}

if (!authSecret) {
  console.error('[Auth] Missing AUTH_SECRET or NEXTAUTH_SECRET environment variable');
  console.error('[Auth] Generate one with: openssl rand -base64 32');
}

console.log('[Auth] Configuration status:', {
  googleClientId: googleClientId ? 'configured' : 'missing',
  googleClientSecret: googleClientSecret ? 'configured' : 'missing',
  authSecret: authSecret ? 'configured' : 'missing',
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
});

export const { auth, handlers } = NextAuth({
  // Required for self-hosted production deployment
  trustHost: true,
  debug: true, // Enable debug logging for troubleshooting
  providers: [
    Google({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: authSecret,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth sign in
      if (account?.provider === 'google') {
        // Grant admin role and enterprise plan to specific email
        if (user?.email === 'kolkollittle@gmail.com') {
          (user as any).role = 'ADMIN';
          (user as any).plan = 'ENTERPRISE';
          console.log('[Auth] Granting ADMIN/ENTERPRISE to:', user.email);
        } else {
          (user as any).role = 'USER';
          (user as any).plan = 'FREE';
        }
        console.log('[Auth] Google sign in:', user.email, 'Role:', (user as any).role, 'Plan:', (user as any).plan);
        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role as string || 'USER';
        (session.user as any).plan = token.plan as string || 'FREE';
        session.user.image = token.picture as string;
        console.log('[Auth] Session created for:', session.user.email, 'Role:', (session.user as any).role, 'Plan:', (session.user as any).plan);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = (user as any).role || 'USER';
        token.plan = (user as any).plan || 'FREE';
        token.picture = (user as any).image || (user as any).picture;
        console.log('[Auth] JWT created for:', user.email, 'Role:', token.role, 'Plan:', token.plan);
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      // 暂时不强制认证，所有页面开放
      return true;
    },
  },
});
