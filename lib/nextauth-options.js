import GoogleProvider from 'next-auth/providers/google';
import { getUserById, createUser, updateUserLogin } from './vercel-kv';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Google sub is the stable user id
        const googleId = account?.providerAccountId || profile?.sub || profile?.id;
        if (!googleId) return false;
        let u = await getUserById(googleId);
        if (!u) {
          u = await createUser({
            google_id: googleId,
            name: user.name || profile?.name || 'User',
            email: user.email || profile?.email || '',
            avatar: user.image || profile?.picture || '',
          });
        }
        await updateUserLogin(googleId);
        return true;
      } catch (e) {
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = account.providerAccountId || profile.sub || profile.id || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose google id in session.user.id for convenience
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful auth, send users to home with welcome flag
      try {
        const u = new URL(url, baseUrl);
        const isCallback = u.pathname.startsWith('/api/auth');
        if (!isCallback) return url;
      } catch {}
      const b = new URL(baseUrl);
      b.searchParams.set('welcome', '1');
      return b.toString();
    },
  },
  pages: {
    // You can customize sign-in page later if needed
  },
  secret: process.env.NEXTAUTH_SECRET,
};
