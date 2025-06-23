import { prisma } from '@/lib/prisma'
import { JobApplication, JobStatus, Priority } from '../generated/prisma'

export interface CreateJobApplicationData {
  jobTitle: string
  company: string
  location: string
  jobPostUrl?: string
  salary?: {
    min?: number
    max?: number
    currency?: string
  }
  contactInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  notes?: string
  status?: JobStatus
  priority?: Priority
  tags?: string[]
}

export interface UpdateJobApplicationData extends Partial<CreateJobApplicationData> {
  id: string
}

export interface JobsFilter {
  status?: JobStatus[]
  priority?: Priority[]
  company?: string
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  salary?: {
    min?: number
    max?: number
  }
}

export interface JobsSortOptions {
  field: keyof JobApplication
  direction: 'asc' | 'desc'
}

export class JobsService {
  static async createJobApplication(userId: string, data: CreateJobApplicationData) {
    const { tags, salary, contactInfo, ...jobData } = data
    
    const jobApplication = await prisma.jobApplication.create({
      data: {
        ...jobData,
        salaryMin: salary?.min,
        salaryMax: salary?.max,
        salaryCurrency: salary?.currency || 'USD',
        contactName: contactInfo?.name,
        contactEmail: contactInfo?.email,
        contactPhone: contactInfo?.phone,
        userId,
        tags: tags ? {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Log activity
    await this.logActivity(userId, jobApplication.id, 'CREATE', 'Job application created')
    
    return this.transformJobApplication(jobApplication)
  }

  static async updateJobApplication(userId: string, data: UpdateJobApplicationData) {
    const { id, tags, salary, contactInfo, ...updateData } = data
    
    // Verify ownership
    const existingJob = await prisma.jobApplication.findFirst({
      where: { id, userId }
    })
    
    if (!existingJob) {
      throw new Error('Job application not found or access denied')
    }

    const jobApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...updateData,
        salaryMin: salary?.min,
        salaryMax: salary?.max,
        salaryCurrency: salary?.currency || 'USD',
        contactName: contactInfo?.name,
        contactEmail: contactInfo?.email,
        contactPhone: contactInfo?.phone,
        tags: tags ? {
          deleteMany: {},
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Log activity
    await this.logActivity(userId, id, 'UPDATE', 'Job application updated')
    
    return this.transformJobApplication(jobApplication)
  }

  static async deleteJobApplication(userId: string, id: string) {
    // Verify ownership
    const existingJob = await prisma.jobApplication.findFirst({
      where: { id, userId }
    })
    
    if (!existingJob) {
      throw new Error('Job application not found or access denied')
    }

    await prisma.jobApplication.delete({
      where: { id }
    })

    // Log activity
    await this.logActivity(userId, id, 'DELETE', 'Job application deleted')
    
    return { success: true }
  }

  static async getJobApplications(
    userId: string, 
    filter?: JobsFilter, 
    sort?: JobsSortOptions,
    search?: string
  ) {
    const where: any = { userId }

    if (filter) {
      if (filter.status?.length) {
        where.status = { in: filter.status }
      }
      if (filter.priority?.length) {
        where.priority = { in: filter.priority }
      }
      if (filter.company) {
        where.company = { contains: filter.company, mode: 'insensitive' }
      }
      if (filter.dateRange) {
        where.appliedDate = {
          gte: filter.dateRange.from,
          lte: filter.dateRange.to
        }
      }
      if (filter.salary) {
        if (filter.salary.min) {
          where.salaryMin = { gte: filter.salary.min }
        }
        if (filter.salary.max) {
          where.salaryMax = { lte: filter.salary.max }
        }
      }
      if (filter.tags?.length) {
        where.tags = {
          some: {
            tag: {
              name: { in: filter.tags }
            }
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    const orderBy: any = {}
    if (sort) {
      orderBy[sort.field] = sort.direction
    } else {
      orderBy.lastUpdated = 'desc'
    }

    const jobApplications = await prisma.jobApplication.findMany({
      where,
      orderBy,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return jobApplications.map(this.transformJobApplication)
  }

  static async getJobApplication(userId: string, id: string) {
    const jobApplication = await prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!jobApplication) {
      throw new Error('Job application not found or access denied')
    }

    return this.transformJobApplication(jobApplication)
  }

  private static transformJobApplication(jobApplication: any) {
    return {
      id: jobApplication.id,
      jobTitle: jobApplication.jobTitle,
      company: jobApplication.company,
      location: jobApplication.location,
      jobPostUrl: jobApplication.jobPostUrl,
      salary: jobApplication.salaryMin || jobApplication.salaryMax ? {
        min: jobApplication.salaryMin,
        max: jobApplication.salaryMax,
        currency: jobApplication.salaryCurrency || 'USD'
      } : undefined,
      contactInfo: jobApplication.contactName || jobApplication.contactEmail || jobApplication.contactPhone ? {
        name: jobApplication.contactName,
        email: jobApplication.contactEmail,
        phone: jobApplication.contactPhone
      } : undefined,
      notes: jobApplication.notes,
      status: jobApplication.status.toLowerCase(),
      priority: jobApplication.priority.toLowerCase(),
      tags: jobApplication.tags?.map((t: any) => t.tag.name) || [],
      appliedDate: jobApplication.appliedDate,
      lastUpdated: jobApplication.lastUpdated
    }
  }

  private static async logActivity(userId: string, jobApplicationId: string, action: string, description: string) {
    await prisma.activityLog.create({
      data: {
        userId,
        jobApplicationId,
        action,
        description
      }
    })
  }
} 