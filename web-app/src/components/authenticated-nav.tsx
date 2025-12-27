'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthenticatedNav() {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    return (
      <>
        <span className="text-sm text-gray-700">Welcome back, {user.firstName || user.email}!</span>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
            Go to Dashboard
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/auth/signin">
        <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
          Get Started
        </Button>
      </Link>
    </>
  )
} 