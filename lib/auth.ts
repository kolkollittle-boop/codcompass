import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

// 调试日志：输出环境变量状态
console.log('[Auth] Environment check:', {
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  authUrl: process.env.AUTH_URL,
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
});

// 验证必要的环境变量
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('[Auth] ERROR: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('[Auth] ERROR: Missing NEXTAUTH_SECRET');
}

export const { auth, handlers } = NextAuth({
  // Required for production deployment on Vercel
  trustHost: true,
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth sign in
      if (account?.provider === 'google') {
        // Grant admin role and enterprise plan to specific email
        if (user?.email === 'kolkollittle@gmail.com') {
          (user as any).role = 'ADMIN';
          (user as any).planType = 'ENTERPRISE';
          console.log('[Auth] Granting ADMIN/ENTERPRISE to:', user.email);
        } else {
          (user as any).role = 'USER';
          (user as any).planType = 'FREE';
        }
        console.log('[Auth] Google sign in:', user.email, 'Role:', (user as any).role, 'Plan:', (user as any).planType);
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
    async session({ session, token, user }) {
      if (session.user) {
        // token.sub may be undefined when using database sessions (PrismaAdapter)
        if (token?.sub) {
          session.user.id = token.sub as string;
        }
        if (user) {
          session.user.id = user.id;
          (session.user as any).role = (user as any).role || 'USER';
          (session.user as any).plan = (user as any).planType || 'FREE';
        } else if (token) {
          (session.user as any).role = (token as any).role || 'USER';
          (session.user as any).plan = (token as any).plan || 'FREE';
        }
        if (token?.picture) {
          session.user.image = token.picture as string;
        }
        console.log('[Auth] Session created for:', session.user.email, 'Role:', (session.user as any).role, 'Plan:', (session.user as any).plan);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = (user as any).role || 'USER';
        token.plan = (user as any).planType || 'FREE';
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
