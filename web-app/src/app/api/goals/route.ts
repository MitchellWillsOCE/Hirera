import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/services/goals.service'
import { GoalType, GoalPeriod } from '@/lib/types'
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as GoalType | null
    const period = searchParams.get('period') as GoalPeriod | null

    const result = await goalsService.getGoals(validatedToken.sub, type || undefined, period || undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, target, period, description } = body

    if (!type || !target || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await goalsService.createGoal(validatedToken.sub, {
      type,
      target,
      period,
      description,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

 

