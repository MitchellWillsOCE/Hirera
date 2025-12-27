import { NextRequest, NextResponse } from 'next/server'
import { leaderboardService } from '@/services/leaderboard.service'
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
    if (!validatedToken || typeof (validatedToken as any).sub !== 'string') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'applications'
    const period = searchParams.get('period') || 'month'
    const country = searchParams.get('country') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await leaderboardService.getLeaderboard(
      (validatedToken as any).sub,
      metric,
      period,
      country,
      limit
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
