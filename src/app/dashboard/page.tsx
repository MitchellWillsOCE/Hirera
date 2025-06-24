'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardAuthenticated } from '@/components/dashboard-authenticated'
import { Loader2, Briefcase } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      // User is not authenticated, redirect to sign-in
      router.push('/auth/signin')
      return
    }

    // User is authenticated, show dashboard
    setIsLoading(false)
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Briefcase className="h-16 w-16 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💼 JobTracker </h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // This shouldn't happen due to the redirect above, but just in case
  }

  return <DashboardAuthenticated user={session.user} />
} 