import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface CacheOptions {
  key: string
  ttl?: number // Time to live in seconds
}

// Simple in-memory cache for development (replace with Redis in production)
const cache = new Map<string, { data: any; expires: number }>()

export class BaseService {
  protected model: any
  protected cache: Map<string, { data: any; expires: number }>

  constructor(model?: any) {
    this.model = model
    this.cache = cache
  }

  /**
   * Generic error handling
   */
  protected handleError(error: any): ServiceResponse {
    console.error('Service Error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return { success: false, error: 'Duplicate entry', code: 'DUPLICATE' }
        case 'P2025':
          return { success: false, error: 'Record not found', code: 'NOT_FOUND' }
        case 'P2003':
          return { success: false, error: 'Foreign key constraint failed', code: 'CONSTRAINT' }
        default:
          return { success: false, error: 'Database error', code: 'DB_ERROR' }
      }
    }

    return { success: false, error: error.message || 'Internal server error', code: 'INTERNAL_ERROR' }
  }

  /**
   * Success response helper
   */
  protected success<T>(data: T): ServiceResponse<T> {
    return { success: true, data }
  }

  /**
   * Cache management
   */
  protected async getCached<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  protected setCache(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  protected clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Generic pagination
   */
  protected async paginate<T>(
    query: any,
    options: PaginationOptions = {}
  ): Promise<ServiceResponse<{ items: T[]; pagination: any }>> {
    try {
      const page = Math.max(1, options.page || 1)
      const limit = Math.min(100, Math.max(1, options.limit || 10))
      const skip = (page - 1) * limit

      const items = await query.skip(skip).take(limit)
      // Get total count separately using the same where clause
      const total = await this.model.count()

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }

      return this.success({ items, pagination })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Batch operations for better performance
   */
  protected async batchCreate<T>(data: T[]): Promise<ServiceResponse<T[]>> {
    try {
      const result = await this.model.createMany({
        data,
        skipDuplicates: true
      })
      return this.success(result)
    } catch (error) {
      return this.handleError(error)
    }
  }

  protected async batchUpdate<T>(updates: Array<{ where: any; data: any }>): Promise<ServiceResponse<number>> {
    try {
      const results = await Promise.all(
        updates.map(update => this.model.updateMany(update))
      )
      const totalUpdated = results.reduce((sum, result) => sum + result.count, 0)
      return this.success(totalUpdated)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<ServiceResponse<{ status: string; timestamp: number }>> {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`
      return this.success({
        status: 'healthy',
        timestamp: Date.now()
      })
    } catch (error) {
      return this.handleError(error)
    }
  }
} 