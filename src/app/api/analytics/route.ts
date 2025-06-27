import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AnalyticsService } from '@/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quick = searchParams.get('quick') === 'true'

    // Always use getUserAnalytics for now since getQuickStats was removed
    const analytics = await AnalyticsService.getUserAnalytics(session.user.id)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 