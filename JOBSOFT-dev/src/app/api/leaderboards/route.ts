import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { JobStatus } from '@/generated/prisma'

// Define the structure of the user data we expect for the leaderboard
interface LeaderboardUser {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  country: string | null
  totalApplications: number
  successRate: number
  interviewRate: number
  offerCount: number
  avgResponseTime: number | null
  rank: number
}

// Main function to handle GET requests for the leaderboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'totalApplications'
    const period = searchParams.get('period') || 'all'
    const country = searchParams.get('country')
    const limit = parseInt(searchParams.get('limit') || '100')

    // --- Date Filtering ---
    // Calculate the date range for the query based on the selected period
    const now = new Date()
    let gte: Date | undefined
    switch (period) {
      case 'week':
        gte = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        gte = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'quarter':
        gte = new Date(now.setMonth(now.getMonth() - 3))
        break
      case 'year':
        gte = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default: // 'all'
        gte = undefined
        break
    }
    const dateFilter = gte ? { appliedDate: { gte } } : {}

    // --- Database Aggregation ---
    // Perform all calculations in the database for efficiency
    const results = await prisma.jobApplication.groupBy({
      by: ['userId'],
      where: {
        user: {
          isPublic: true,
          ...(country && country !== 'all' && { country }),
        },
        ...dateFilter,
      },
      _count: {
        id: true, // Counts all applications for the user
      },
      _sum: {
        // Use a conditional count for specific statuses
        // Prisma doesn't directly support this, so we do it in two steps.
        // This is still more efficient than fetching all data.
      },
    })
    
    // Additional aggregations for specific metrics
    const userIds = results.map(r => r.userId);
    const metricsByUser = await prisma.jobApplication.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, ...dateFilter },
      _count: {
        _all: true,
      },
      _avg: {
        // Unfortunately, response time calculation is complex and better done in code
      },
    })

    const offerCounts = await countByUserAndStatus(userIds, [JobStatus.OFFER], dateFilter)
    const interviewCounts = await countByUserAndStatus(userIds, [JobStatus.INTERVIEW, JobStatus.OFFER], dateFilter)

    // --- Data Processing ---
    // Combine the aggregated data into a clean format
    let leaderboardData: LeaderboardUser[] = userIds.map(userId => {
      const userResult = results.find(r => r.userId === userId);
      const offerCount = offerCounts[userId] || 0;
      const interviewCount = interviewCounts[userId] || 0;
      const totalApplications = userResult?._count.id || 0;

      return {
        id: userId,
        username: '', // Will be populated in the next step
        firstName: '',
        lastName: '',
        country: '',
        totalApplications,
        successRate: totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0,
        interviewRate: totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0,
        offerCount: offerCount,
        avgResponseTime: null, // Placeholder for now
        rank: 0,
      }
    });

    // --- Sorting ---
    // Define the sorting logic based on the selected metric
    const sortField = {
      totalApps: 'totalApplications',
      success: 'successRate',
      interviewRate: 'interviewRate',
      offerRate: 'offerCount'
    }[metric] || 'totalApplications';

    leaderboardData.sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];
      if (valB !== valA) {
        return valB - valA;
      }
      return b.totalApplications - a.totalApplications; // Tiebreaker
    });
    
    // --- Final Data Enrichment ---
    // Fetch user details for the top N users and assign ranks
    const topUserIds = leaderboardData.slice(0, limit).map(u => u.id);
    const users = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, username: true, firstName: true, lastName: true, country: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const finalLeaderboard = leaderboardData.slice(0, limit).map((user, index) => {
      const userInfo = userMap.get(user.id);
      return {
        ...user,
        username: userInfo?.username || 'Anonymous',
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        country: userInfo?.country || null,
        rank: index + 1,
      };
    });

    // Find current user's data
    const currentUserData = leaderboardData.find(u => u.id === session.user?.id)

    return NextResponse.json({
      leaderboard: finalLeaderboard,
      currentUser: currentUserData,
      summary: { /* summary stats can be added here */ }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to count applications by status for a list of users
async function countByUserAndStatus(userIds: string[], statuses: JobStatus[], dateFilter: any) {
  const counts = await prisma.jobApplication.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      status: { in: statuses },
      ...dateFilter,
    },
    _count: {
      id: true,
    },
  });
  const result: { [key: string]: number } = {};
  counts.forEach(c => {
    result[c.userId] = c._count.id;
  });
  return result;
} 