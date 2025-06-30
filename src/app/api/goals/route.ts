import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoalType, GoalPeriod } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period')

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type: type.toUpperCase() as GoalType }),
        ...(period && { period: period.toUpperCase() as GoalPeriod }),
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)
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
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, target, period, description } = body

    if (!type || !target || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Deactivate existing similar goals
    await prisma.goal.updateMany({
      where: {
        userId: session.user.id,
        type: type.toUpperCase() as GoalType,
        period: period.toUpperCase() as GoalPeriod,
        isActive: true,
      },
      data: {
        isActive: false
      }
    })

    const newGoal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        type: type.toUpperCase() as GoalType,
        target: Number(target),
        period: period.toUpperCase() as GoalPeriod,
        description,
      }
    })

    return NextResponse.json(newGoal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, ...data } = await request.json()

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
        ...data,
        ...(data.type && { type: data.type.toUpperCase() as GoalType }),
        ...(data.period && { period: data.period.toUpperCase() as GoalPeriod }),
      },
    })

    // Check if goal is completed and create achievement
    if (updatedGoal.achieved >= updatedGoal.target) {
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: 'GOAL_ACHIEVER',
          title: `Goal Completed: ${updatedGoal.type}`,
          description: `Successfully achieved ${updatedGoal.target} ${updatedGoal.type.toLowerCase()} goal!`
        }
      })
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