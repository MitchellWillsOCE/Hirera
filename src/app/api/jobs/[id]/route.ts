import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { JobsService } from '@/services/jobs.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const job = await JobsService.getJobApplication(session.user.id, id)

    return NextResponse.json(job)
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    
    const job = await JobsService.updateJobApplication(session.user.id, {
      id,
      ...body
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    await JobsService.deleteJobApplication(session.user.id, id)

    return NextResponse.json({ success: true })
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