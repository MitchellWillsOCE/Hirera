'use client';

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Briefcase, Target, BarChart3, Users, TrendingUp, Shield, Smartphone, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Show loading screen while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Briefcase className="h-16 w-16 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💼 JobTracker</h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">JobTracker </h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-700">Welcome back, {session.user?.name || session.user?.username}!</span>
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Parallax Background Layers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Layer 1 - Slowest moving background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
          
          {/* Layer 2 - Medium speed animated blobs */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl animate-pulse delay-0"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
            <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-gradient-to-br from-indigo-400/30 to-blue-400/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-2xl animate-pulse delay-1500"></div>
          </div>
          
          {/* Layer 3 - Fastest moving particles */}
          <div className="absolute inset-0">
            <div className="absolute top-32 left-1/3 w-8 h-8 bg-blue-400/40 rounded-full blur-sm animate-bounce delay-200"></div>
            <div className="absolute top-48 right-1/4 w-6 h-6 bg-purple-400/40 rounded-full blur-sm animate-bounce delay-700"></div>
            <div className="absolute bottom-32 left-1/2 w-10 h-10 bg-indigo-400/40 rounded-full blur-sm animate-bounce delay-1200"></div>
            <div className="absolute bottom-48 right-1/2 w-7 h-7 bg-pink-400/40 rounded-full blur-sm animate-bounce delay-300"></div>
            <div className="absolute top-64 left-1/5 w-5 h-5 bg-cyan-400/40 rounded-full blur-sm animate-bounce delay-900"></div>
            <div className="absolute bottom-64 right-1/5 w-9 h-9 bg-emerald-400/40 rounded-full blur-sm animate-bounce delay-600"></div>
          </div>
          
          {/* Layer 4 - Floating geometric shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-24 left-1/6 w-12 h-12 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-lg blur-lg rotate-12 animate-pulse delay-400"></div>
            <div className="absolute top-56 right-1/6 w-16 h-16 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-xl blur-lg -rotate-12 animate-pulse delay-800"></div>
            <div className="absolute bottom-40 left-2/3 w-14 h-14 bg-gradient-to-br from-indigo-300/20 to-cyan-300/20 rounded-lg blur-lg rotate-45 animate-pulse delay-1100"></div>
          </div>
          
          {/* Layer 5 - Soft overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="mb-6 bg-white/80 text-blue-800 shadow-lg backdrop-blur-sm border-0">
            🚀 Track Your Career Journey
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
            <span className="block">Land Your</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              Dream Job
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto backdrop-blur-sm bg-white/20 rounded-2xl p-6 shadow-lg">
            The most comprehensive job application tracking system. Manage applications, 
            analyze your progress, and accelerate your career with powerful insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                Start Tracking Free
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/20">
                Sign In
                <Briefcase className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your job search and maximize your success rate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Application Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize and track every application with detailed status updates, deadlines, and follow-up reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get deep insights into your job search with success rates, response times, and trend analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Community Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Compare your progress with others, join leaderboards, and learn from successful job seekers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Market Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stay ahead with real-time job market trends, salary insights, and industry analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your data is encrypted and secure. Control your privacy with granular sharing settings.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track applications on the go with our mobile-first design and progressive web app features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Trusted by Job Seekers Worldwide
          </h2>
          <p className="text-xl mb-12 text-blue-100">
            Join thousands of professionals who have accelerated their career journey
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">250,000+</div>
              <div className="text-blue-200">Applications Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who have found their dream jobs with JobTracker 
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Your Free Trial
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Briefcase className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">JobTracker </span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering careers, one application at a time.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 JobTracker . Made with ❤️ by Mitchell Wills
          </p>
        </div>
      </footer>
    </div>
  )
}
