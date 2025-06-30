import { BaseService, ServiceResponse } from './base.service'
import { prisma } from '@/lib/prisma'
import { JobStatus, Priority } from '@/generated/prisma'

export interface OptimizedAnalyticsData {
  overview: {
    totalApplications: number
    successRate: number
    responseRate: number
    averageResponseTime: number
    recentApplications: number
  }
  statusDistribution: Record<JobStatus, number>
  priorityDistribution: Record<Priority, number>
  monthlyTrends: Array<{
    month: string
    applications: number
    responses: number
    offers: number
  }>
  performanceMetrics: {
    conversionRates: {
      appliedToScreening: number
      screeningToInterview: number
      interviewToOffer: number
    }
  }
}

export class OptimizedAnalyticsService extends BaseService {
  constructor() {
    super(prisma.jobApplication)
  }

  /**
   * Get optimized analytics with aggressive caching
   */
  async getOptimizedAnalytics(userId: string): Promise<ServiceResponse<OptimizedAnalyticsData>> {
    try {
      const cacheKey = `opt-analytics:${userId}`
      let analytics = await this.getCached<OptimizedAnalyticsData>(cacheKey)

      if (!analytics) {
        // Single optimized query to get all needed data
        const applications = await prisma.jobApplication.findMany({
          where: { userId },
          select: {
            id: true,
            status: true,
            priority: true,
            appliedDate: true,
            lastUpdated: true,
            company: true
          }
        })

        analytics = this.processAnalyticsData(applications)
        
        // Cache for 15 minutes
        this.setCache(cacheKey, analytics, 900)
      }

      return this.success(analytics)
    } catch (error) {
      return this.handleError(error)
    }
  }

  private processAnalyticsData(applications: any[]): OptimizedAnalyticsData {
    const total = applications.length
    const statusCounts: Record<JobStatus, number> = {} as any
    const priorityCounts: Record<Priority, number> = {} as any
    const monthlyData: Record<string, { applications: number; responses: number; offers: number }> = {}

    // Initialize counters
    Object.values(JobStatus).forEach(status => statusCounts[status] = 0)
    Object.values(Priority).forEach(priority => priorityCounts[priority] = 0)

    let successful = 0
    let responded = 0
    let totalResponseTime = 0
    let responseCount = 0
    let recentCount = 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Single pass through data for all calculations
    applications.forEach(app => {
      // Count by status and priority
      statusCounts[app.status]++
      priorityCounts[app.priority]++

      // Success rate calculation
      if (app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED) {
        successful++
      }

      // Response rate calculation
      if (app.status !== JobStatus.APPLIED) {
        responded++
        
        // Response time calculation
        const diffTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        totalResponseTime += days
        responseCount++
      }

      // Recent applications
      if (app.appliedDate >= thirtyDaysAgo) {
        recentCount++
      }

      // Monthly trends
      const monthKey = app.appliedDate.toISOString().substring(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { applications: 0, responses: 0, offers: 0 }
      }
      monthlyData[monthKey].applications++
      if (app.status !== JobStatus.APPLIED) {
        monthlyData[monthKey].responses++
      }
      if (app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED) {
        monthlyData[monthKey].offers++
      }
    })

    // Calculate rates
    const successRate = total > 0 ? Math.round((successful / total) * 10000) / 100 : 0
    const responseRate = total > 0 ? Math.round((responded / total) * 10000) / 100 : 0
    const averageResponseTime = responseCount > 0 ? Math.round((totalResponseTime / responseCount) * 10) / 10 : 0

    // Calculate conversion rates
    const appliedToScreening = total > 0 ? (statusCounts[JobStatus.SCREENING] / total) * 100 : 0
    const screeningToInterview = statusCounts[JobStatus.SCREENING] > 0 
      ? (statusCounts[JobStatus.INTERVIEW] / statusCounts[JobStatus.SCREENING]) * 100 : 0
    const interviewToOffer = statusCounts[JobStatus.INTERVIEW] > 0 
      ? (statusCounts[JobStatus.OFFER] / statusCounts[JobStatus.INTERVIEW]) * 100 : 0

    // Process monthly trends
    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({ month, ...data }))

    return {
      overview: {
        totalApplications: total,
        successRate,
        responseRate,
        averageResponseTime,
        recentApplications: recentCount
      },
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      monthlyTrends,
      performanceMetrics: {
        conversionRates: {
          appliedToScreening: Math.round(appliedToScreening * 100) / 100,
          screeningToInterview: Math.round(screeningToInterview * 100) / 100,
          interviewToOffer: Math.round(interviewToOffer * 100) / 100
        }
      }
    }
  }
}

// Export singleton instance
export const optimizedAnalyticsService = new OptimizedAnalyticsService() 