import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { JobsService } from '@/services/jobs.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    
    // Parse filters
    const statusFilter = searchParams.get('status')
    const priorityFilter = searchParams.get('priority')
    const company = searchParams.get('company') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    
    const filters = {
      status: statusFilter ? statusFilter.split(',') as any[] : undefined,
      priority: priorityFilter ? priorityFilter.split(',') as any[] : undefined,
      company,
      tags
    }
    
    // Parse sorting
    const sortField = searchParams.get('sortField') || 'lastUpdated'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    
    const sort = {
      field: sortField as any,
      direction: sortDirection as 'asc' | 'desc'
    }

    const jobs = await JobsService.getJobApplications(
      session.user.id,
      filters,
      sort,
      search
    )

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
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
    
    const job = await JobsService.createJobApplication(session.user.id, body)

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 