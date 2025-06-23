import { prisma } from '@/lib/prisma'
import { JobStatus } from '../generated/prisma'

export interface AnalyticsData {
  totalApplications: number
  activeApplications: number
  offersReceived: number
  successRate: number
  averageResponseTime: number
  applicationsByStatus: Record<JobStatus, number>
  applicationsByMonth: { month: string; count: number }[]
  topCompanies: { company: string; count: number }[]
  tagAnalytics: { tag: string; count: number }[]
  recentActivity: Array<{
    id: string
    action: string
    description: string
    timestamp: Date
  }>
}

export class AnalyticsService {
  static async getUserAnalytics(userId: string): Promise<AnalyticsData> {
    const [
      totalApplications,
      applicationsByStatus,
      applicationsByMonth,
      topCompanies,
      tagAnalytics,
      recentActivity
    ] = await Promise.all([
      this.getTotalApplications(userId),
      this.getApplicationsByStatus(userId),
      this.getApplicationsByMonth(userId),
      this.getTopCompanies(userId),
      this.getTagAnalytics(userId),
      this.getRecentActivity(userId)
    ])

    const activeApplications = 
      (applicationsByStatus.APPLIED || 0) +
      (applicationsByStatus.SCREENING || 0) +
      (applicationsByStatus.INTERVIEW || 0)

    const offersReceived = applicationsByStatus.OFFER || 0
    const successRate = totalApplications > 0 ? (offersReceived / totalApplications) * 100 : 0
    const averageResponseTime = await this.getAverageResponseTime(userId)

    return {
      totalApplications,
      activeApplications,
      offersReceived,
      successRate,
      averageResponseTime,
      applicationsByStatus,
      applicationsByMonth,
      topCompanies,
      tagAnalytics,
      recentActivity
    }
  }

  private static async getTotalApplications(userId: string): Promise<number> {
    return await prisma.jobApplication.count({
      where: { userId }
    })
  }

  private static async getApplicationsByStatus(userId: string): Promise<Record<JobStatus, number>> {
    const statusCounts = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    })

    const result: Record<JobStatus, number> = {
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0
    }

    statusCounts.forEach(({ status, _count }) => {
      result[status] = _count.status
    })

    return result
  }

  private static async getApplicationsByMonth(userId: string): Promise<{ month: string; count: number }[]> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId,
        appliedDate: {
          gte: sixMonthsAgo
        }
      },
      select: {
        appliedDate: true
      }
    })

    const monthCounts: Record<string, number> = {}
    
    applications.forEach(app => {
      const monthKey = app.appliedDate.toISOString().slice(0, 7) // YYYY-MM format
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private static async getTopCompanies(userId: string): Promise<{ company: string; count: number }[]> {
    const companies = await prisma.jobApplication.groupBy({
      by: ['company'],
      where: { userId },
      _count: {
        company: true
      },
      orderBy: {
        _count: {
          company: 'desc'
        }
      },
      take: 10
    })

    return companies.map(({ company, _count }) => ({
      company,
      count: _count.company
    }))
  }

  private static async getTagAnalytics(userId: string): Promise<{ tag: string; count: number }[]> {
    const tags = await prisma.jobApplicationTag.findMany({
      where: {
        jobApplication: {
          userId
        }
      },
      include: {
        tag: true
      }
    })

    const tagCounts: Record<string, number> = {}
    
    tags.forEach(({ tag }) => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private static async getRecentActivity(userId: string) {
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      select: {
        id: true,
        action: true,
        description: true,
        timestamp: true
      }
    })

    // Transform to ensure description is never null
    return activities.map(activity => ({
      ...activity,
      description: activity.description || 'No description'
    }))
  }

  private static async getAverageResponseTime(userId: string): Promise<number> {
    const applications = await prisma.jobApplication.findMany({
      where: {
        userId,
        status: {
          in: ['OFFER', 'REJECTED']
        }
      },
      select: {
        appliedDate: true,
        lastUpdated: true
      }
    })

    if (applications.length === 0) return 0

    const totalResponseTime = applications.reduce((sum, app) => {
      const responseTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
      return sum + responseTime
    }, 0)

    // Return average response time in days
    return Math.round(totalResponseTime / applications.length / (1000 * 60 * 60 * 24))
  }
} 