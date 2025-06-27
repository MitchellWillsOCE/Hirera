import { BaseService, ServiceResponse } from './base.service'
import { prisma } from '@/lib/prisma'
import { JobStatus, Priority } from '@/generated/prisma'

export interface AnalyticsData {
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
  companyInsights: Array<{
    company: string
    applications: number
    successRate: number
    avgResponseTime: number
  }>
  timeToResponse: {
    average: number
    median: number
    fastest: number
    slowest: number
  }
  performanceMetrics: {
    conversionRates: {
      appliedToScreening: number
      screeningToInterview: number
      interviewToOffer: number
      offerToEmployed: number
    }
    trendsLast30Days: {
      applications: number
      responses: number
      offers: number
      trend: 'up' | 'down' | 'stable'
    }
  }
}

export interface DateRange {
  from: Date
  to: Date
}

export class AnalyticsService extends BaseService {
  constructor() {
    super(prisma.jobApplication)
  }

  /**
   * Get comprehensive analytics for user
   */
  async getUserAnalytics(userId: string, dateRange?: DateRange): Promise<ServiceResponse<AnalyticsData>> {
    try {
      const cacheKey = `analytics:${userId}:${dateRange ? `${dateRange.from.getTime()}-${dateRange.to.getTime()}` : 'all'}`
      let analytics = await this.getCached<AnalyticsData>(cacheKey)

      if (!analytics) {
        // Build date filter
        const dateFilter = dateRange ? {
          appliedDate: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        } : {}

        // Parallel data fetching for performance
        const [
          applications,
          statusCounts,
          priorityCounts,
          monthlyData,
          companyData
        ] = await Promise.all([
          this.getAllApplications(userId, dateFilter),
          this.getStatusCounts(userId, dateFilter),
          this.getPriorityCounts(userId, dateFilter),
          this.getMonthlyTrends(userId),
          this.getCompanyInsights(userId, dateFilter)
        ])

        analytics = {
          overview: this.calculateOverview(applications),
          statusDistribution: this.processStatusDistribution(statusCounts),
          priorityDistribution: this.processPriorityDistribution(priorityCounts),
          monthlyTrends: monthlyData,
          companyInsights: companyData,
          timeToResponse: this.calculateTimeToResponse(applications),
          performanceMetrics: this.calculatePerformanceMetrics(applications)
        }

        // Cache for 10 minutes
        this.setCache(cacheKey, analytics, 600)
      }

      return this.success(analytics)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get real-time dashboard metrics
   */
  async getDashboardMetrics(userId: string): Promise<ServiceResponse<{
    quickStats: {
      totalJobs: number
      activeJobs: number
      thisWeekApplications: number
      pendingResponses: number
    }
    recentActivity: Array<{
      id: string
      action: string
      company: string
      jobTitle: string
      timestamp: Date
    }>
    upcomingTasks: Array<{
      id: string
      type: 'follow_up' | 'interview' | 'deadline'
      company: string
      jobTitle: string
      dueDate: Date
    }>
  }>> {
    try {
      const cacheKey = `dashboard:${userId}`
      let metrics = await this.getCached(cacheKey)

      if (!metrics) {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const [quickStats, recentActivity, applications] = await Promise.all([
          this.getQuickStats(userId, oneWeekAgo),
          this.getRecentActivity(userId),
          prisma.jobApplication.findMany({
            where: { userId, status: { in: [JobStatus.APPLIED, JobStatus.SCREENING, JobStatus.INTERVIEW] } },
            select: { id: true, company: true, jobTitle: true, appliedDate: true, lastUpdated: true }
          })
        ])

        const upcomingTasks = this.generateUpcomingTasks(applications)

        metrics = {
          quickStats,
          recentActivity,
          upcomingTasks
        }

        // Cache for 2 minutes (more frequent updates for dashboard)
        this.setCache(cacheKey, metrics, 120)
      }

      return this.success(metrics)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get success rate comparison with similar users
   */
  async getBenchmarkData(userId: string): Promise<ServiceResponse<{
    userSuccessRate: number
    industryAverage: number
    topPerformers: number
    userRanking: number
    totalUsers: number
    suggestions: string[]
  }>> {
    try {
      const cacheKey = `benchmark:${userId}`
      let benchmark = await this.getCached(cacheKey)

      if (!benchmark) {
        const [userStats, allUsersStats] = await Promise.all([
          this.getUserSuccessRate(userId),
          this.getAllUsersStats()
        ])

        const industryAverage = allUsersStats.reduce((sum, user) => sum + user.successRate, 0) / allUsersStats.length
        const topPerformers = allUsersStats.filter(user => user.successRate >= 80).length
        const userRanking = allUsersStats.filter(user => user.successRate > userStats.successRate).length + 1
        
        const suggestions = this.generateSuggestions(userStats, industryAverage)

        benchmark = {
          userSuccessRate: userStats.successRate,
          industryAverage: Math.round(industryAverage * 100) / 100,
          topPerformers,
          userRanking,
          totalUsers: allUsersStats.length,
          suggestions
        }

        // Cache for 1 hour (benchmark data doesn't change often)
        this.setCache(cacheKey, benchmark, 3600)
      }

      return this.success(benchmark)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // Private helper methods

  private async getAllApplications(userId: string, dateFilter: any) {
    return await prisma.jobApplication.findMany({
      where: { userId, ...dateFilter },
      select: {
        id: true,
        status: true,
        priority: true,
        appliedDate: true,
        lastUpdated: true,
        company: true,
        jobTitle: true
      }
    })
  }

  private async getStatusCounts(userId: string, dateFilter: any) {
    return await prisma.jobApplication.groupBy({
      by: ['status'],
      where: { userId, ...dateFilter },
      _count: { status: true }
    })
  }

  private async getPriorityCounts(userId: string, dateFilter: any) {
    return await prisma.jobApplication.groupBy({
      by: ['priority'],
      where: { userId, ...dateFilter },
      _count: { priority: true }
    })
  }

  private async getMonthlyTrends(userId: string) {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId,
        appliedDate: { gte: sixMonthsAgo }
      },
      select: { appliedDate: true, status: true }
    })

    const monthlyData: Record<string, { applications: number; responses: number; offers: number }> = {}

    applications.forEach(app => {
      const monthKey = app.appliedDate.toISOString().substring(0, 7) // YYYY-MM
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

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))
  }

  private async getCompanyInsights(userId: string, dateFilter: any) {
    const companies = await prisma.jobApplication.groupBy({
      by: ['company'],
      where: { userId, ...dateFilter },
      _count: { company: true }
    })

    const insights = await Promise.all(
      companies.map(async (company) => {
        const apps = await prisma.jobApplication.findMany({
          where: { userId, company: company.company, ...dateFilter },
          select: { status: true, appliedDate: true, lastUpdated: true }
        })

        const successful = apps.filter(app => 
          app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED
        ).length

        const responseTimes = apps
          .filter(app => app.status !== JobStatus.APPLIED)
          .map(app => {
            const diffTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          })

        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : 0

        return {
          company: company.company,
          applications: company._count.company,
          successRate: Math.round((successful / company._count.company) * 10000) / 100,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10
        }
      })
    )

    return insights.sort((a, b) => b.applications - a.applications).slice(0, 10)
  }

  private calculateOverview(applications: any[]) {
    const total = applications.length
    const successful = applications.filter(app => 
      app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED
    ).length
    const responded = applications.filter(app => app.status !== JobStatus.APPLIED).length
    
    const responseTimes = applications
      .filter(app => app.status !== JobStatus.APPLIED)
      .map(app => {
        const diffTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      })

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = applications.filter(app => app.appliedDate >= thirtyDaysAgo).length

    return {
      totalApplications: total,
      successRate: total > 0 ? Math.round((successful / total) * 10000) / 100 : 0,
      responseRate: total > 0 ? Math.round((responded / total) * 10000) / 100 : 0,
      averageResponseTime: Math.round(avgResponseTime * 10) / 10,
      recentApplications: recent
    }
  }

  private processStatusDistribution(statusCounts: any[]) {
    const distribution: any = {}
    Object.values(JobStatus).forEach(status => distribution[status] = 0)
    statusCounts.forEach(item => distribution[item.status] = item._count.status)
    return distribution
  }

  private processPriorityDistribution(priorityCounts: any[]) {
    const distribution: any = {}
    Object.values(Priority).forEach(priority => distribution[priority] = 0)
    priorityCounts.forEach(item => distribution[item.priority] = item._count.priority)
    return distribution
  }

  private calculateTimeToResponse(applications: any[]) {
    const responseTimes = applications
      .filter(app => app.status !== JobStatus.APPLIED)
      .map(app => {
        const diffTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      })
      .sort((a, b) => a - b)

    if (responseTimes.length === 0) {
      return { average: 0, median: 0, fastest: 0, slowest: 0 }
    }

    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const median = responseTimes[Math.floor(responseTimes.length / 2)]
    const fastest = responseTimes[0]
    const slowest = responseTimes[responseTimes.length - 1]

    return {
      average: Math.round(average * 10) / 10,
      median,
      fastest,
      slowest
    }
  }

  private calculatePerformanceMetrics(applications: any[]) {
    const statusCounts = {
      [JobStatus.APPLIED]: 0,
      [JobStatus.SCREENING]: 0,
      [JobStatus.INTERVIEW]: 0,
      [JobStatus.OFFER]: 0,
      [JobStatus.EMPLOYED]: 0,
      [JobStatus.REJECTED]: 0,
      [JobStatus.WITHDRAWN]: 0
    }

    applications.forEach(app => statusCounts[app.status]++)

    const total = applications.length
    const appliedToScreening = total > 0 ? (statusCounts[JobStatus.SCREENING] / total) * 100 : 0
    const screeningToInterview = statusCounts[JobStatus.SCREENING] > 0 
      ? (statusCounts[JobStatus.INTERVIEW] / statusCounts[JobStatus.SCREENING]) * 100 : 0
    const interviewToOffer = statusCounts[JobStatus.INTERVIEW] > 0 
      ? (statusCounts[JobStatus.OFFER] / statusCounts[JobStatus.INTERVIEW]) * 100 : 0
    const offerToEmployed = statusCounts[JobStatus.OFFER] > 0 
      ? (statusCounts[JobStatus.EMPLOYED] / statusCounts[JobStatus.OFFER]) * 100 : 0

    // Calculate last 30 days trends
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = applications.filter(app => app.appliedDate >= thirtyDaysAgo)

    const trendsLast30Days = {
      applications: recent.length,
      responses: recent.filter(app => app.status !== JobStatus.APPLIED).length,
      offers: recent.filter(app => app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED).length,
      trend: 'stable' as 'up' | 'down' | 'stable'
    }

    return {
      conversionRates: {
        appliedToScreening: Math.round(appliedToScreening * 100) / 100,
        screeningToInterview: Math.round(screeningToInterview * 100) / 100,
        interviewToOffer: Math.round(interviewToOffer * 100) / 100,
        offerToEmployed: Math.round(offerToEmployed * 100) / 100
      },
      trendsLast30Days
    }
  }

  private async getQuickStats(userId: string, oneWeekAgo: Date) {
    const [total, active, thisWeek, pending] = await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.jobApplication.count({ 
        where: { 
          userId, 
          status: { in: [JobStatus.APPLIED, JobStatus.SCREENING, JobStatus.INTERVIEW] } 
        } 
      }),
      prisma.jobApplication.count({ 
        where: { userId, appliedDate: { gte: oneWeekAgo } } 
      }),
      prisma.jobApplication.count({ 
        where: { userId, status: JobStatus.APPLIED } 
      })
    ])

    return {
      totalJobs: total,
      activeJobs: active,
      thisWeekApplications: thisWeek,
      pendingResponses: pending
    }
  }

  private async getRecentActivity(userId: string) {
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      include: { jobApplication: true },
      orderBy: { timestamp: 'desc' },
      take: 5
    })

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      company: activity.jobApplication.company,
      jobTitle: activity.jobApplication.jobTitle,
      timestamp: activity.timestamp
    }))
  }

  private generateUpcomingTasks(applications: any[]) {
    const tasks: any[] = []
    const now = new Date()

    applications.forEach(app => {
      const daysSinceApplied = Math.floor((now.getTime() - app.appliedDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceUpdate = Math.floor((now.getTime() - app.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

      // Generate follow-up tasks
      if (app.status === JobStatus.APPLIED && daysSinceApplied >= 7) {
        const dueDate = new Date(app.appliedDate)
        dueDate.setDate(dueDate.getDate() + 14)
        tasks.push({
          id: `followup-${app.id}`,
          type: 'follow_up',
          company: app.company,
          jobTitle: app.jobTitle,
          dueDate
        })
      }

      if (app.status === JobStatus.SCREENING && daysSinceUpdate >= 5) {
        const dueDate = new Date(app.lastUpdated)
        dueDate.setDate(dueDate.getDate() + 7)
        tasks.push({
          id: `followup-${app.id}`,
          type: 'follow_up',
          company: app.company,
          jobTitle: app.jobTitle,
          dueDate
        })
      }
    })

    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 5)
  }

  private async getUserSuccessRate(userId: string) {
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true }
    })

    const total = applications.length
    const successful = applications.filter(app => 
      app.status === JobStatus.OFFER || app.status === JobStatus.EMPLOYED
    ).length

    return {
      successRate: total > 0 ? Math.round((successful / total) * 10000) / 100 : 0,
      totalApplications: total
    }
  }

  private async getAllUsersStats() {
    const allUsers = await prisma.user.findMany({
      where: { isPublic: true },
      select: { id: true }
    })

    const stats = await Promise.all(
      allUsers.map(async user => {
        const userStats = await this.getUserSuccessRate(user.id)
        return userStats
      })
    )

    return stats.filter(stat => stat.totalApplications >= 5) // Only users with at least 5 applications
  }

  private generateSuggestions(userStats: any, industryAverage: number): string[] {
    const suggestions: string[] = []

    if (userStats.successRate < industryAverage) {
      suggestions.push("Your success rate is below industry average. Consider improving your application strategy.")
    }

    if (userStats.totalApplications < 10) {
      suggestions.push("Apply to more positions to increase your chances of success.")
    }

    suggestions.push("Follow up on applications after 1-2 weeks to show continued interest.")
    suggestions.push("Tailor your resume and cover letter for each position.")

    return suggestions
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService() 