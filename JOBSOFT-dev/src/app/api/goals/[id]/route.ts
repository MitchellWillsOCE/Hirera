import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found or access denied' },
        { status: 404 }
      )
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    // Check if goal is completed and create achievement
    if (updatedGoal.achieved >= updatedGoal.target && existingGoal.achieved < existingGoal.target) {
      try {
        await prisma.achievement.create({
          data: {
            userId: session.user.id,
            type: 'GOAL_ACHIEVER',
            title: `Goal Completed: ${updatedGoal.type}`,
            description: `Successfully achieved ${updatedGoal.target} ${updatedGoal.type.toLowerCase()} goal!`
          }
        })
      } catch (achievementError) {
        // Achievement creation failed but goal update succeeded
        console.warn('Failed to create achievement:', achievementError)
      }
    }

    return NextResponse.json(updatedGoal)
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
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.goal.delete({
      where: { id },
    })

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
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    // Handle recalculate action
    if (body.action === 'recalculate') {
      const { goalsService } = await import('@/services/goals.service')
      const result = await goalsService.recalculateGoalProgress(session.user.id, id)
      
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