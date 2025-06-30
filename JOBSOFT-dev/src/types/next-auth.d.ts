import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      country: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    country: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    firstName?: string | null
    lastName?: string | null
  }
} 