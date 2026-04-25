import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Credentials Provider (for development/testing)
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Development only - always return a test user
        if (process.env.NODE_ENV === 'development') {
          return {
            id: 'dev-user',
            email: 'dev@codcompass.com',
            name: 'Dev User',
            role: 'ADMIN'
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth sign in
      if (account?.provider === 'google') {
        // Optionally: Create or update user in database
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string || 'USER';
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = (user as any).role || 'USER';
        token.picture = (user as any).image || (user as any).picture;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      // 暂时不强制认证，所有页面开放
      return true;
    },
  },
} satisfies NextAuthConfig;
