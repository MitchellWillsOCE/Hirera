import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    username: string
    firstName?: string | null
    lastName?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      firstName?: string | null
      lastName?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    firstName?: string | null
    lastName?: string | null
  }
} 