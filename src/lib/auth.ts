import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            username: user.username,
            country: user.country || null,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only-please-change-in-production',
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            username: true,
            country: true,
            firstName: true,
            lastName: true,
            email: true
          }
        })

        if (user) {
          session.user.id = user.id
          session.user.username = user.username
          session.user.country = user.country
          session.user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
          session.user.email = user.email
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

export default authOptions 