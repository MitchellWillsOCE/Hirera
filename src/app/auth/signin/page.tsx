'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, Briefcase, TestTube } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // Refresh session and redirect
        await getSession()
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setError('')
    setLoading(true)

    try {
      // First create/get test user
      const testResponse = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!testResponse.ok) {
        throw new Error('Failed to setup test user')
      }

      const testData = await testResponse.json()

      // Now sign in with test credentials
      const result = await signIn('credentials', {
        email: testData.credentials.email,
        password: testData.credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Test login failed')
      } else {
        // Refresh session and redirect
        await getSession()
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('Test login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">💼 JobTracker Pro</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Sign in to your account</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm">
              Enter your credentials to access your job tracking dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Development Test Login */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleTestLogin} 
                variant="outline" 
                className="w-full h-12 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating test user...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-5 w-5" />
                    Quick Test Login (Development)
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Automatically creates and logs in with a test user
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secure authentication powered by NextAuth.js
          </p>
        </div>
      </div>
    </div>
  )
} 