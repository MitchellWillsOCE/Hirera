import { BaseService, ServiceResponse } from '@/lib/base.service'
import docClient from '@/lib/dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { JobStatus, Priority } from '@/lib/types'

const TABLE_NAME = 'Hirera' // This should be in an env var

export interface JobApplicationStats {
  total: number
  byStatus: Record<JobStatus, number>
  byPriority: Record<Priority, number>
  successRate: number
  interviewRate: number
  rejectionRate: number
  avgResponseTime: number
  recentApplications: number
}

export class AnalyticsService extends BaseService {
  constructor() {
    super(null) // Passing null since we're not using prisma client here.
  }

  async getUserAnalytics(userId: string): Promise<ServiceResponse<JobApplicationStats>> {
    try {
      // Caching logic can be implemented here if needed

      const { Items: apps } = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'JOB#',
        },
      }))

      if (!apps || apps.length === 0) {
        return this.success({
          total: 0,
          byStatus: {} as Record<JobStatus, number>,
          byPriority: {} as Record<Priority, number>,
          successRate: 0,
          interviewRate: 0,
          rejectionRate: 0,
          avgResponseTime: 0,
          recentApplications: 0,
        })
      }

      const total = apps.length
      const byStatus = apps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {} as Record<JobStatus, number>)

      const byPriority = apps.reduce((acc, app) => {
        acc[app.priority] = (acc[app.priority] || 0) + 1
        return acc
      }, {} as Record<Priority, number>)

      const successfulStates: JobStatus[] = [JobStatus.OFFER, JobStatus.EMPLOYED]
      const successCount = apps.filter(app => successfulStates.includes(app.status)).length
      const successRate = total > 0 ? (successCount / total) * 100 : 0

      const interviewStates: JobStatus[] = [JobStatus.INTERVIEW, JobStatus.OFFER, JobStatus.EMPLOYED]
      const interviewCount = apps.filter(app => interviewStates.includes(app.status)).length
      const interviewRate = total > 0 ? (interviewCount / total) * 100 : 0
      
      const rejectionRate = total > 0 ? ((byStatus.REJECTED || 0) / total) * 100 : 0

      const respondedApps = apps.filter(app => app.appliedDate && app.updatedAt && app.status !== 'APPLIED')
      const avgResponseTime = respondedApps.length > 0
        ? respondedApps.reduce((acc, app) => {
            const diff = new Date(app.updatedAt).getTime() - new Date(app.appliedDate).getTime()
            return acc + (diff / (1000 * 60 * 60 * 24)) // difference in days
          }, 0) / respondedApps.length
        : 0

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentApplications = apps.filter(app => app.appliedDate && new Date(app.appliedDate) >= thirtyDaysAgo).length
      
      const stats: JobApplicationStats = {
        total,
        byStatus,
        byPriority,
        successRate,
        interviewRate,
        rejectionRate,
        avgResponseTime,
        recentApplications
      }
      
      // Caching logic can be implemented here if needed

      return this.success(stats)
    } catch (error) {
      return this.handleError(error)
    }
  }
}

export const analyticsService = new AnalyticsService() 