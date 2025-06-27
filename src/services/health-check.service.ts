import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: Record<string, ServiceHealth>
  version: string
  environment: string
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
  details?: any
}

export class HealthCheckService {
  private async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; time: number }> {
    const start = Date.now()
    try {
      const result = await operation()
      return { result, time: Date.now() - start }
    } catch (error) {
      return { result: error as T, time: Date.now() - start }
    }
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    try {
      const { time } = await this.measureTime(async () => {
        // Test basic database connectivity
        await prisma.$queryRaw`SELECT 1`
        
        // Test user table exists and is accessible
        const userCount = await prisma.user.count()
        
        return { userCount }
      })

      return {
        status: time < 500 ? 'healthy' : time < 1000 ? 'degraded' : 'unhealthy',
        responseTime: time,
        details: { 
          message: 'Database connection successful',
          database_url_is_set: process.env.DATABASE_URL ? 'Yes' : 'No'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: {
          database_url_is_set: process.env.DATABASE_URL ? 'Yes' : 'No'
        }
      }
    }
  }

  private async checkAuth(): Promise<ServiceHealth> {
    try {
      const { time } = await this.measureTime(async () => {
        // Test that NextAuth configuration is valid
        const config = auth
        if (!config) throw new Error('Auth configuration not found')
        
        // Test that the secret is properly set
        const secret = process.env.NEXTAUTH_SECRET
        if (!secret) throw new Error('NEXTAUTH_SECRET not set')
        
        return { hasAuth: true, hasSecret: true }
      })

      return {
        status: 'healthy',
        responseTime: time,
        details: { 
          message: 'Authentication system configured',
          secret_is_set: process.env.NEXTAUTH_SECRET ? 'Yes' : 'No'
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Auth check failed',
        details: {
          secret_is_set: process.env.NEXTAUTH_SECRET ? 'Yes' : 'No'
        }
      }
    }
  }

  private async checkJobsService(): Promise<ServiceHealth> {
    try {
      const { time } = await this.measureTime(async () => {
        // Test that job applications table is accessible
        const jobCount = await prisma.jobApplication.count()
        return { jobCount }
      })

      return {
        status: 'healthy',
        responseTime: time,
        details: { message: 'Jobs service operational' }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Jobs service check failed'
      }
    }
  }

  private async checkGoalsService(): Promise<ServiceHealth> {
    try {
      const { time } = await this.measureTime(async () => {
        // Test that goals table is accessible
        const goalCount = await prisma.goal.count()
        return { goalCount }
      })

      return {
        status: 'healthy',
        responseTime: time,
        details: { message: 'Goals service operational' }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Goals service check failed'
      }
    }
  }

  public async performHealthCheck(): Promise<HealthCheckResult> {
    const start = Date.now()

    // Run all health checks in parallel for faster results
    const [
      database,
      authService,
      jobsService,
      goalsService
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkAuth(),
      this.checkJobsService(),
      this.checkGoalsService()
    ])

    const services = {
      database,
      authService,
      jobsService,
      goalsService
    }

    // Calculate overall health status
    const unhealthyCount = Object.values(services).filter(s => s.status === 'unhealthy').length
    const degradedCount = Object.values(services).filter(s => s.status === 'degraded').length
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy'
    } else if (degradedCount > 0) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    }
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService() 