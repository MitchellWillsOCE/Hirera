import { BaseService, ServiceResponse, PaginationOptions } from './base.service'
import { prisma } from '@/lib/prisma'
import { JobApplication, JobStatus, Priority } from '@/generated/prisma'

export interface CreateJobApplicationData {
  jobTitle: string
  company: string
  location: string
  jobPostUrl?: string
  salary?: number
  salaryCurrency?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
  status?: JobStatus
  priority?: Priority
  appliedDate?: Date
}

export interface UpdateJobApplicationData extends Partial<CreateJobApplicationData> {
  status?: JobStatus
  priority?: Priority
}

export interface JobApplicationFilters {
  status?: JobStatus[]
  priority?: Priority[]
  company?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface JobApplicationStats {
  total: number
  byStatus: Record<JobStatus, number>
  byPriority: Record<Priority, number>
  successRate: number
  avgResponseTime: number
  recentApplications: number
}

export class JobApplicationsService extends BaseService {
  constructor() {
    super(prisma.jobApplication)
  }

  /**
   * Create a new job application
   */
  async create(userId: string, data: CreateJobApplicationData): Promise<ServiceResponse<JobApplication>> {
    try {
      const jobApplication = await prisma.jobApplication.create({
        data: {
          ...data,
          userId,
          status: data.status || JobStatus.APPLIED,
          priority: data.priority || Priority.MEDIUM,
          appliedDate: data.appliedDate || new Date(),
          salaryCurrency: data.salaryCurrency || 'USD'
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })

      // Clear user's cache
      this.clearCache(`user:${userId}:jobs`)
      this.clearCache(`user:${userId}:stats`)

      // Log activity
      await this.logActivity(userId, jobApplication.id, 'CREATED', `Created application for ${data.jobTitle} at ${data.company}`)

      return this.success(jobApplication)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get user's job applications with filters and pagination
   */
  async getUserJobApplications(
    userId: string, 
    filters: JobApplicationFilters = {}, 
    pagination: PaginationOptions = {}
  ): Promise<ServiceResponse<{ items: JobApplication[]; pagination: any }>> {
    try {
      const cacheKey = `user:${userId}:jobs:${JSON.stringify({ filters, pagination })}`
      const cached = await this.getCached<{ items: JobApplication[]; pagination: any }>(cacheKey)
      if (cached) return this.success(cached)

      // Build where clause
      const where: any = { userId }

      if (filters.status?.length) {
        where.status = { in: filters.status }
      }

      if (filters.priority?.length) {
        where.priority = { in: filters.priority }
      }

      if (filters.company) {
        where.company = { contains: filters.company, mode: 'insensitive' }
      }

      if (filters.dateFrom || filters.dateTo) {
        where.appliedDate = {}
        if (filters.dateFrom) where.appliedDate.gte = filters.dateFrom
        if (filters.dateTo) where.appliedDate.lte = filters.dateTo
      }

      if (filters.search) {
        where.OR = [
          { jobTitle: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      // Build order by
      const orderBy: any = {}
      if (pagination.orderBy) {
        orderBy[pagination.orderBy] = pagination.orderDirection || 'desc'
      } else {
        orderBy.appliedDate = 'desc'
      }

      // Calculate pagination
      const page = Math.max(1, pagination.page || 1)
      const limit = Math.min(100, Math.max(1, pagination.limit || 10))
      const skip = (page - 1) * limit

      const [items, total] = await Promise.all([
        prisma.jobApplication.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }),
        prisma.jobApplication.count({ where })
      ])

      const paginationInfo = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }

      const resultData = { items, pagination: paginationInfo }
      
      // Cache result for 5 minutes
      this.setCache(cacheKey, resultData, 300)

      return this.success(resultData)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get job application by ID
   */
  async getById(userId: string, applicationId: string): Promise<ServiceResponse<JobApplication>> {
    try {
      const cacheKey = `job:${applicationId}`
      let jobApplication = await this.getCached<JobApplication>(cacheKey)

      if (!jobApplication) {
        jobApplication = await prisma.jobApplication.findFirst({
          where: {
            id: applicationId,
            userId
          },
          include: {
            tags: {
              include: {
                tag: true
              }
            },
            activityLogs: {
              orderBy: { timestamp: 'desc' },
              take: 10
            }
          }
        })

        if (!jobApplication) {
          return { success: false, error: 'Job application not found', code: 'NOT_FOUND' }
        }

        // Cache for 10 minutes
        this.setCache(cacheKey, jobApplication, 600)
      }

      return this.success(jobApplication)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Update job application
   */
  async update(userId: string, applicationId: string, data: UpdateJobApplicationData): Promise<ServiceResponse<JobApplication>> {
    try {
      const existingApp = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      })

      if (!existingApp) {
        return { success: false, error: 'Job application not found', code: 'NOT_FOUND' }
      }

      const jobApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          ...data,
          lastUpdated: new Date()
        },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })

      // Clear caches
      this.clearCache(`job:${applicationId}`)
      this.clearCache(`user:${userId}:jobs`)
      this.clearCache(`user:${userId}:stats`)

      // Log activity if status changed
      if (data.status && data.status !== existingApp.status) {
        await this.logActivity(
          userId, 
          applicationId, 
          'STATUS_UPDATED', 
          `Status changed from ${existingApp.status} to ${data.status}`
        )
      }

      return this.success(jobApplication)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Delete job application
   */
  async delete(userId: string, applicationId: string): Promise<ServiceResponse<boolean>> {
    try {
      const existingApp = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      })

      if (!existingApp) {
        return { success: false, error: 'Job application not found', code: 'NOT_FOUND' }
      }

      await prisma.jobApplication.delete({
        where: { id: applicationId }
      })

      // Clear caches
      this.clearCache(`job:${applicationId}`)
      this.clearCache(`user:${userId}:jobs`)
      this.clearCache(`user:${userId}:stats`)

      // Log activity
      await this.logActivity(
        userId, 
        applicationId, 
        'DELETED', 
        `Deleted application for ${existingApp.jobTitle} at ${existingApp.company}`
      )

      return this.success(true)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get user's job application statistics
   */
  async getUserStats(userId: string): Promise<ServiceResponse<JobApplicationStats>> {
    try {
      const cacheKey = `user:${userId}:stats`
      let stats = await this.getCached<JobApplicationStats>(cacheKey)

      if (!stats) {
        const [applications, statusCounts, priorityCounts] = await Promise.all([
          prisma.jobApplication.findMany({
            where: { userId },
            select: { status: true, appliedDate: true, lastUpdated: true }
          }),
          prisma.jobApplication.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true }
          }),
          prisma.jobApplication.groupBy({
            by: ['priority'],
            where: { userId },
            _count: { priority: true }
          })
        ])

        const total = applications.length
        const byStatus: any = {}
        const byPriority: any = {}

        // Initialize counters
        Object.values(JobStatus).forEach(status => byStatus[status] = 0)
        Object.values(Priority).forEach(priority => byPriority[priority] = 0)

        // Fill actual counts
        statusCounts.forEach(item => byStatus[item.status] = item._count.status)
        priorityCounts.forEach(item => byPriority[item.priority] = item._count.priority)

        // Calculate success rate
        const successfulApplications = byStatus[JobStatus.OFFER] + byStatus[JobStatus.EMPLOYED]
        const successRate = total > 0 ? (successfulApplications / total) * 100 : 0

        // Calculate average response time
        const responseTimes = applications
          .filter(app => app.status !== JobStatus.APPLIED)
          .map(app => {
            const diffTime = app.lastUpdated.getTime() - app.appliedDate.getTime()
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // days
          })
        
        const avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
          : 0

        // Recent applications (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentApplications = applications.filter(app => app.appliedDate >= thirtyDaysAgo).length

        stats = {
          total,
          byStatus,
          byPriority,
          successRate: Math.round(successRate * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
          recentApplications
        }

        // Cache for 15 minutes
        this.setCache(cacheKey, stats, 900)
      }

      return this.success(stats)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Batch update job applications
   */
  async batchUpdateStatus(userId: string, applicationIds: string[], status: JobStatus): Promise<ServiceResponse<number>> {
    try {
      const result = await prisma.jobApplication.updateMany({
        where: {
          id: { in: applicationIds },
          userId
        },
        data: {
          status,
          lastUpdated: new Date()
        }
      })

      // Clear user's caches
      this.clearCache(`user:${userId}:jobs`)
      this.clearCache(`user:${userId}:stats`)

      // Log batch activity
      await this.logBatchActivity(userId, applicationIds, 'BATCH_STATUS_UPDATE', `Batch updated ${result.count} applications to ${status}`)

      return this.success(result.count)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Log activity
   */
  private async logActivity(userId: string, jobApplicationId: string, action: string, description: string): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          jobApplicationId,
          action,
          description,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  /**
   * Log batch activity
   */
  private async logBatchActivity(userId: string, jobApplicationIds: string[], action: string, description: string): Promise<void> {
    try {
      const logs = jobApplicationIds.map(id => ({
        userId,
        jobApplicationId: id,
        action,
        description,
        timestamp: new Date()
      }))

      await prisma.activityLog.createMany({
        data: logs
      })
    } catch (error) {
      console.error('Failed to log batch activity:', error)
    }
  }
}

// Export singleton instance
export const jobApplicationsService = new JobApplicationsService() 