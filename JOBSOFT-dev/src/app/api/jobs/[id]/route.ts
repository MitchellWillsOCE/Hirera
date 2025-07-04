import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jobApplicationsService } from '@/services/job-applications.service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const jobApplication = await prisma.jobApplication.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!jobApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    return NextResponse.json(jobApplication)
  } catch (error) {
    console.error('Error fetching job:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    // Filter out fields that shouldn't be in the update data
    const { tags, ...updateData } = body
    
    const result = await jobApplicationsService.update(session.user.id, id, updateData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === 'NOT_FOUND' ? 404 : 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.jobApplication.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Job application deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 