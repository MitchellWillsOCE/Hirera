'use client';

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Briefcase } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not authenticated, redirect to sign-in
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Briefcase className="h-16 w-16 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">💼 JobTracker Pro</h1>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
