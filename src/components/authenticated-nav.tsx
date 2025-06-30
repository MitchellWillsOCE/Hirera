'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthenticatedNav() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <span className="text-sm text-gray-700">Welcome back, {session.user?.name || session.user?.username}!</span>
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