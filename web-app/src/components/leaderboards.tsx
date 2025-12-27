'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Users, 
  Target, 
  TrendingUp, 
  BarChart3,
  Filter,
  Star
} from 'lucide-react'
import { getCountryFlag } from '@/lib/countries'

interface LeaderboardUser {
  id: string
  username: string
  firstName: string
  lastName: string
  country: string
  totalApplications: number
  successRate: number
  interviewRate: number
  offerCount: number
  avgResponseTime: number
  lastActive: Date
  rank: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  currentUser: LeaderboardUser | null
  summary: {
    totalUsers: number
    avgApplications: number
    avgSuccessRate: number
    period: string
    metric: string
    country?: string
  }
}

export function Leaderboards() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('applications')
  const [period, setPeriod] = useState('month')
  const [country, setCountry] = useState('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [metric, period, country])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        metric,
        period,
        ...(country && country !== 'all' && { country })
      })
      
      const response = await fetch(`/api/leaderboards?${params}`, { credentials: 'include' })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <Star className="h-5 w-5 text-gray-400" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'from-amber-400 to-amber-600 text-white'
    return 'from-blue-400 to-blue-600 text-white'
  }

  const getMetricValue = (user: LeaderboardUser) => {
    switch (metric) {
      case 'applications': return user.totalApplications
      case 'success': return `${user.successRate}%`
      case 'interviews': return `${user.interviewRate}%`
      case 'offers': return user.offerCount
      case 'speed': return `${user.avgResponseTime}d`
      default: return user.totalApplications
    }
  }

  const getMetricLabel = () => {
    switch (metric) {
      case 'applications': return 'Applications'
      case 'success': return 'Success Rate'
      case 'interviews': return 'Interview Rate'
      case 'offers': return 'Offers'
      case 'speed': return 'Response Speed'
      default: return 'Applications'
    }
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">Community Leaderboards</h2>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Metric</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applications">ðŸ“ Total Applications</SelectItem>
                  <SelectItem value="success">ðŸŽ¯ Success Rate</SelectItem>
                  <SelectItem value="interviews">ðŸŽ¤ Interview Rate</SelectItem>
                  <SelectItem value="offers">ðŸŽ‰ Offers Received</SelectItem>
                  <SelectItem value="speed">âš¡ Response Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Country Filter</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ðŸŒ All Countries</SelectItem>
                  <SelectItem value="US">ðŸ‡ºðŸ‡¸ United States</SelectItem>
                  <SelectItem value="CA">ðŸ‡¨ðŸ‡¦ Canada</SelectItem>
                  <SelectItem value="GB">ðŸ‡¬ðŸ‡§ United Kingdom</SelectItem>
                  <SelectItem value="DE">ðŸ‡©ðŸ‡ª Germany</SelectItem>
                  <SelectItem value="FR">ðŸ‡«ðŸ‡· France</SelectItem>
                  <SelectItem value="AU">ðŸ‡¦ðŸ‡º Australia</SelectItem>
                  <SelectItem value="IN">ðŸ‡®ðŸ‡³ India</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchLeaderboard} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.summary.totalUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-3 rounded-lg mr-.4">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Applications</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.summary.avgApplications}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-50 p-3 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data.summary.avgSuccessRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-orange-50 p-3 rounded-lg mr-4">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tracking</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {data.summary.period}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Current User Position */}
          {data.currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Your Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(data.currentUser.rank)} flex items-center justify-center font-bold text-lg`}>
                        #{data.currentUser.rank}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCountryFlag(data.currentUser.country)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {data.currentUser.firstName} {data.currentUser.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">@{data.currentUser.username}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {getMetricValue(data.currentUser)}
                      </p>
                      <p className="text-sm text-gray-600">{getMetricLabel()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Top Performers - {getMetricLabel()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.leaderboard.slice(0, 3).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className={`relative p-6 rounded-lg bg-gradient-to-br ${getRankColor(user.rank)} ${
                        user.rank === 1 ? 'transform -translate-y-2' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          {getRankIcon(user.rank)}
                        </div>
                        <div className="mb-3">
                          <span className="text-3xl">{getCountryFlag(user.country)}</span>
                        </div>
                        <h3 className="font-bold text-lg">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm opacity-80">@{user.username}</p>
                        <div className="mt-4">
                          <p className="text-2xl font-bold">{getMetricValue(user)}</p>
                          <p className="text-sm opacity-80">{getMetricLabel()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Full Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.leaderboard.slice(3).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: (index) * 0.05 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                          #{user.rank}
                        </div>
                        <span className="text-xl">{getCountryFlag(user.country)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{getMetricValue(user)}</p>
                          <p>{getMetricLabel()}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{user.totalApplications}</p>
                          <p>Apps</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{user.successRate}%</p>
                          <p>Success</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs">{formatLastActive(user.lastActive)}</p>
                          <p>Last Active</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
} 



