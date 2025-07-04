import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jobApplicationsService } from '@/services/job-applications.service'
import { JobStatus, Priority } from '@/generated/prisma'
import * as z from 'zod'

const jobFormSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  jobPostUrl: z.string().url().optional().or(z.literal('')),
  salary: z.number().positive().optional(),
  salaryCurrency: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  appliedDate: z.date().optional(),
  tags: z.array(z.string()).optional()
})

// Enable response caching
export const revalidate = 300 // Cache for 5 minutes

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
    
    // Enhanced filtering with proper type safety
    const filters = {
      status: searchParams.get('status')?.split(',').filter(s => 
        Object.values(JobStatus).includes(s as JobStatus)
      ) as JobStatus[] | undefined,
      priority: searchParams.get('priority')?.split(',').filter(p => 
        Object.values(Priority).includes(p as Priority)
      ) as Priority[] | undefined,
      company: searchParams.get('company') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
    }

    // Enhanced pagination
    const pagination = {
      page: Math.max(1, parseInt(searchParams.get('page') || '1')),
      limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))),
      orderBy: searchParams.get('orderBy') || 'appliedDate',
      orderDirection: (searchParams.get('orderDirection') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    }

    // Use optimized service
    const result = await jobApplicationsService.getUserJobApplications(
      session.user.id,
      filters,
      pagination
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        'X-Total-Count': result.data?.pagination?.total?.toString() || '0',
        'X-Page': pagination.page.toString(),
        'X-Per-Page': pagination.limit.toString()
      }
    })
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
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Use Zod for validation
    const validatedData = jobFormSchema.parse(body)

    const result = await jobApplicationsService.create(session.user.id, validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: 400 })
    }

    return NextResponse.json(result.data, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache',
        'Location': `/api/jobs/${result.data?.id}`
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors
      return NextResponse.json({ errors }, { status: 400 })
    }

    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 