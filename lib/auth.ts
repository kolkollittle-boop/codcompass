import { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [
    // Google OAuth - 需要在 .env 中配置 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET
    // 暂时用 credentials placeholder
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // 暂时不强制认证，所有页面开放
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
