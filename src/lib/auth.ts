import NextAuth, { User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
          // Return a user object that satisfies the `User` type from next-auth
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            // Custom properties to be added to token
            username: user.username,
            country: user.country,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // The jwt callback is called first. It passes user data to the token.
    async jwt({ token, user }) {
      if (user) {
        // On sign-in, user object is available. Persist it to the token.
        token.sub = user.id;
        token.username = (user as any).username;
        token.country = (user as any).country;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    // The session callback is called next. It uses token data to populate the session.
    async session({ session, token }) {
      if (token && session.user) {
        // No need for a database call here. All data is in the token.
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
        session.user.country = token.country as string | null;
        session.user.name = `${token.firstName || ''} ${token.lastName || ''}`.trim() || token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only-please-change-in-production',
}); 