import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/services/goals.service'
import { validateToken } from '@/lib/jwt'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const result = await goalsService.updateGoal(validatedToken.sub, id, body);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: result.code === 'NOT_FOUND' ? 404 : 400 }
        )
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    const result = await goalsService.deleteGoal(validatedToken.sub, id);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: result.code === 'NOT_FOUND' ? 404 : 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    if (body.action === 'recalculate') {
      const result = await goalsService.recalculateGoalProgress(validatedToken.sub, id)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.code === 'NOT_FOUND' ? 404 : 400 }
        )
      }

      return NextResponse.json(result.data)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error handling goal action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 

