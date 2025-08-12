import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis' // Assuming you have a redis instance

interface ServiceStatus {
  status: 'healthy' | 'unhealthy'
  details?: string
  responseTime?: number
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  services: {
    database: ServiceStatus
    cache: ServiceStatus
    // Add other services here e.g., external APIs
  }
}

async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    return { status: 'healthy', responseTime }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    return { 
      status: 'unhealthy', 
      details: error.message || 'Database connection failed',
      responseTime
    }
  }
}

async function checkCacheHealth(): Promise<ServiceStatus> {
  const startTime = Date.now()
  try {
    if (!redis.isReady) {
        throw new Error('Redis client is not ready.')
    }
    await redis.ping()
    const responseTime = Date.now() - startTime
    return { status: 'healthy', responseTime }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    return { 
      status: 'unhealthy', 
      details: error.message || 'Cache connection failed',
      responseTime
    }
  }
}

export async function checkServicesHealth(): Promise<HealthStatus> {
  const [database, cache] = await Promise.all([
    checkDatabaseHealth(),
    checkCacheHealth()
  ])

  const services = { database, cache }
  const isUnhealthy = Object.values(services).some(s => s.status === 'unhealthy')
  const isDegraded = Object.values(services).some(s => s.status === 'unhealthy') && !isUnhealthy
  
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
  if (isUnhealthy) {
    overallStatus = 'unhealthy'
  } else if (isDegraded) {
    overallStatus = 'degraded'
  }
  
  return {
    status: overallStatus,
    services
  }
} 