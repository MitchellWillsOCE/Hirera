import { NextResponse } from 'next/server'

export async function GET() {
  const authUrl = process.env.HEALTH_AUTH_URL || process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001'
  const jobsUrl = process.env.HEALTH_JOBS_URL || process.env.JOB_SERVICE_URL || 'http://localhost:3002'
  const start = Date.now()
  const results: Record<string, { status: string; responseTime?: number; error?: string }> = {}
  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  async function check(name: string, url: string) {
    const t0 = Date.now()
    try {
      const res = await fetch(`${url}/health`, { cache: 'no-store' })
      results[name] = { status: res.ok ? 'healthy' : 'unhealthy', responseTime: Date.now() - t0 }
    } catch (e: any) {
      results[name] = { status: 'unhealthy', responseTime: Date.now() - t0, error: e?.message }
    }
  }

  await Promise.all([
    check('auth', authUrl),
    check('jobs', jobsUrl),
  ])

  if (Object.values(results).some(r => r.status === 'unhealthy')) overall = 'unhealthy'

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    services: results,
    elapsedMs: Date.now() - start,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, {
    status: overall === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}