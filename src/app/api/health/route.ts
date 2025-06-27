import { NextResponse } from 'next/server'
import { checkServicesHealth } from '@/services'

export async function GET() {
  try {
    const healthStatus = await checkServicesHealth()
    
    const responseStatus = healthStatus.status === 'healthy' ? 200 : 
                          healthStatus.status === 'degraded' ? 207 : 503

    return NextResponse.json({
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      services: healthStatus.services,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: responseStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {}
    }, { status: 503 })
  }
} 