import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analytics.service'
import { validateToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.split(' ')[1] ||
      request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!validatedToken || typeof validatedToken.sub !== 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceResponse = await analyticsService.getUserAnalytics(validatedToken.sub)

    if (!serviceResponse.success) {
      return NextResponse.json({ error: serviceResponse.error }, { status: 500 })
    }

    return NextResponse.json(serviceResponse.data)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 

