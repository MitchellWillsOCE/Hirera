import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { jobApplicationsService } from '@/services/job-applications.service'
import { JobStatus, Priority } from '@/generated/prisma'

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Enhanced validation
    const requiredFields = ['jobTitle', 'company', 'location']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    // Validate enums
    if (body.status && !Object.values(JobStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      )
    }

    if (body.priority && !Object.values(Priority).includes(body.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value', code: 'INVALID_PRIORITY' },
        { status: 400 }
      )
    }

    // Validate salary if provided
    if (body.salary && (typeof body.salary !== 'number' || body.salary < 0)) {
      return NextResponse.json(
        { error: 'Salary must be a positive number', code: 'INVALID_SALARY' },
        { status: 400 }
      )
    }

    // Validate URLs permissively: must contain a dot, and we'll add https://
    let validatedUrl = body.jobPostUrl;
    if (body.jobPostUrl && body.jobPostUrl.trim()) {
      const urlString = body.jobPostUrl.trim();
      
      if (!urlString.includes('.')) {
        return NextResponse.json(
          { error: 'URL must be a valid address containing a dot.', code: 'INVALID_URL' },
          { status: 400 }
        );
      }
      
      // Prepend https:// if no protocol is present for consistency.
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        validatedUrl = `https://\${urlString}`;
      } else {
        validatedUrl = urlString;
      }
    }
    
    // Explicitly map ONLY the fields expected by the service to prevent extra fields
    const jobData = {
      jobTitle: body.jobTitle,
      company: body.company,
      location: body.location,
      jobPostUrl: validatedUrl,
      salary: body.salary,
      salaryCurrency: body.salaryCurrency,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes,
      status: body.status,
      priority: body.priority,
      appliedDate: body.appliedDate
    };

    // Use optimized service with sanitized data
    const result = await jobApplicationsService.create(session.user.id, jobData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache',
        'Location': `/api/jobs/${result.data?.id}`
      }
    })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 