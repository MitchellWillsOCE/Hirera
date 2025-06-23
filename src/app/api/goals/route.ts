import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goals = await prisma.goal.findMany({
      where: { 
        userId: session.user.id,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, target, period, startDate, endDate } = body

    // Validate required fields
    if (!type || !target || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has an active goal of this type and period
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: session.user.id,
        type,
        period,
        isActive: true,
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) }
      }
    })

    if (existingGoal) {
      return NextResponse.json(
        { error: 'You already have an active goal of this type for this period' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        type,
        target: parseInt(target),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    return NextResponse.json(goal, { status: 201 })
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, achieved } = body

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
      data: { achieved: parseInt(achieved) }
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