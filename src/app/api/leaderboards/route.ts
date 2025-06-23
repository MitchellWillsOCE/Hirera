import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'applications'
    const period = searchParams.get('period') || 'all'
    const country = searchParams.get('country')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Calculate date filter based on period
    let dateFilter = {}
    if (period !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      
      switch (period) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      dateFilter = {
        appliedDate: {
          gte: cutoffDate
        }
      }
    }

    // Get users with their job application statistics
    const users = await prisma.user.findMany({
      where: {
        isPublic: true,
        ...(country && { country })
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        country: true,
        updatedAt: true,
        jobApplications: {
          where: dateFilter,
          select: {
            id: true,
            status: true,
            appliedDate: true,
            lastUpdated: true
          }
        },
        _count: {
          select: {
            jobApplications: {
              where: dateFilter
            }
          }
        }
      }
    })

    // Calculate statistics for each user
    const leaderboardData: LeaderboardUser[] = users.map(user => {
      const applications = user.jobApplications
      const totalApplications = applications.length
      
      if (totalApplications === 0) {
        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          country: user.country || 'US',
          totalApplications: 0,
          successRate: 0,
          interviewRate: 0,
          offerCount: 0,
          avgResponseTime: 0,
          lastActive: user.updatedAt,
          rank: 0
        }
      }

      const interviews = applications.filter(app => 
        ['INTERVIEW', 'OFFER'].includes(app.status)
      ).length
      
      const offers = applications.filter(app => app.status === 'OFFER').length
      const responses = applications.filter(app => app.status !== 'APPLIED').length
      
      // Calculate average response time
      const responseTimes = applications
        .filter(app => app.status !== 'APPLIED')
        .map(app => {
          const applied = new Date(app.appliedDate).getTime()
          const responded = new Date(app.lastUpdated).getTime()
          return Math.ceil((responded - applied) / (1000 * 60 * 60 * 24)) // days
        })
      
      const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : 0

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || 'US',
        totalApplications,
        successRate: Math.round((offers / totalApplications) * 100),
        interviewRate: Math.round((interviews / totalApplications) * 100),
        offerCount: offers,
        avgResponseTime,
        lastActive: user.updatedAt,
        rank: 0
      }
    }).filter(user => user.totalApplications > 0) // Only include users with applications

    // Sort based on metric
    leaderboardData.sort((a, b) => {
      switch (metric) {
        case 'applications':
          return b.totalApplications - a.totalApplications
        case 'success':
          if (b.successRate === a.successRate) {
            return b.totalApplications - a.totalApplications // Tiebreaker
          }
          return b.successRate - a.successRate
        case 'interviews':
          if (b.interviewRate === a.interviewRate) {
            return b.totalApplications - a.totalApplications
          }
          return b.interviewRate - a.interviewRate
        case 'offers':
          if (b.offerCount === a.offerCount) {
            return b.totalApplications - a.totalApplications
          }
          return b.offerCount - a.offerCount
        case 'speed':
          // Lower response time is better, but filter out 0s
          const aTime = a.avgResponseTime || 999
          const bTime = b.avgResponseTime || 999
          if (aTime === bTime) {
            return b.totalApplications - a.totalApplications
          }
          return aTime - bTime
        default:
          return b.totalApplications - a.totalApplications
      }
    })

    // Assign ranks
    leaderboardData.forEach((user, index) => {
      user.rank = index + 1
    })

    // Limit results
    const limitedResults = leaderboardData.slice(0, limit)

    // Find current user's rank if not in top results
    const currentUserRank = leaderboardData.findIndex(user => user.id === session.user.id)
    const currentUser = currentUserRank !== -1 ? leaderboardData[currentUserRank] : null

    // Get summary statistics
    const totalUsers = leaderboardData.length
    const avgApplications = Math.round(
      leaderboardData.reduce((sum, user) => sum + user.totalApplications, 0) / totalUsers
    )
    const avgSuccessRate = Math.round(
      leaderboardData.reduce((sum, user) => sum + user.successRate, 0) / totalUsers
    )

    return NextResponse.json({
      leaderboard: limitedResults,
      currentUser,
      summary: {
        totalUsers,
        avgApplications,
        avgSuccessRate,
        period,
        metric,
        country
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 