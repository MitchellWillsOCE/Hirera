// Service exports for optimized microservice architecture
export { BaseService } from './base.service'
export { authService } from './auth.service'
export { jobApplicationsService } from './job-applications.service'
export { optimizedAnalyticsService } from './optimized-analytics.service'
export { healthCheckService } from './health-check.service'

// Re-export types
export type { ServiceResponse, PaginationOptions } from './base.service'
export type { AuthUser, LoginCredentials, RegisterData } from './auth.service'
export type { 
  CreateJobApplicationData, 
  UpdateJobApplicationData, 
  JobApplicationFilters,
  JobApplicationStats 
} from './job-applications.service'
export type { OptimizedAnalyticsData } from './optimized-analytics.service'
export type { HealthCheckResult, ServiceHealth } from './health-check.service'

/**
 * Comprehensive health check for all services and APIs
 */
export async function checkServicesHealth() {
  const { healthCheckService } = await import('./health-check.service')
  return await healthCheckService.performHealthCheck()
} 