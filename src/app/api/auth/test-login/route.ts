import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Helper function to create sample job applications
async function createSampleJobApplications(userId: string) {
  const sampleJobs = [
    { company: 'Google', jobTitle: 'Software Engineer', status: 'APPLIED', salaryMin: 170000, salaryMax: 190000, location: 'Mountain View, CA' },
    { company: 'Microsoft', jobTitle: 'Senior Developer', status: 'INTERVIEW', salaryMin: 160000, salaryMax: 180000, location: 'Seattle, WA' },
    { company: 'Apple', jobTitle: 'iOS Developer', status: 'OFFER', salaryMin: 180000, salaryMax: 200000, location: 'Cupertino, CA' },
    { company: 'Meta', jobTitle: 'Frontend Engineer', status: 'REJECTED', salaryMin: 165000, salaryMax: 185000, location: 'Menlo Park, CA' },
    { company: 'Amazon', jobTitle: 'Full Stack Developer', status: 'APPLIED', salaryMin: 155000, salaryMax: 175000, location: 'Seattle, WA' },
    { company: 'Netflix', jobTitle: 'Senior Software Engineer', status: 'SCREENING', salaryMin: 190000, salaryMax: 210000, location: 'Los Gatos, CA' },
    { company: 'Tesla', jobTitle: 'Software Engineer', status: 'INTERVIEW', salaryMin: 145000, salaryMax: 165000, location: 'Austin, TX' },
    { company: 'Spotify', jobTitle: 'Backend Engineer', status: 'APPLIED', salaryMin: 150000, salaryMax: 170000, location: 'New York, NY' },
    { company: 'Uber', jobTitle: 'Software Engineer', status: 'REJECTED', salaryMin: 160000, salaryMax: 180000, location: 'San Francisco, CA' },
    { company: 'Airbnb', jobTitle: 'Full Stack Engineer', status: 'SCREENING', salaryMin: 175000, salaryMax: 195000, location: 'San Francisco, CA' },
  ]

  // Check if user already has applications
  const existingApps = await prisma.jobApplication.count({
    where: { userId }
  })

  if (existingApps === 0) {
    const applications = sampleJobs.map((job, index) => {
      const daysAgo = Math.floor(Math.random() * 60) + 1 // 1-60 days ago
      const appliedDate = new Date()
      appliedDate.setDate(appliedDate.getDate() - daysAgo)
      
      let lastUpdated = new Date(appliedDate)
      if (job.status !== 'APPLIED') {
        // Add some time for status updates
        lastUpdated.setDate(appliedDate.getDate() + Math.floor(Math.random() * 14) + 1)
      }

      return {
        userId,
        company: job.company,
        jobTitle: job.jobTitle,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: 'USD',
        status: job.status as 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN',
        notes: `${job.jobTitle} role at ${job.company}. Great opportunity to work on cutting-edge technology.`,
        appliedDate,
        lastUpdated,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH'
      }
    })

    await prisma.jobApplication.createMany({
      data: applications
    })
  }
}

// Helper function to create mock leaderboard users
async function createMockLeaderboardUsers() {
  const mockUsers = [
    { username: 'john_dev', firstName: 'John', lastName: 'Smith', country: 'US', email: 'john@mock.com' },
    { username: 'sarah_code', firstName: 'Sarah', lastName: 'Johnson', country: 'CA', email: 'sarah@mock.com' },
    { username: 'alex_tech', firstName: 'Alex', lastName: 'Chen', country: 'US', email: 'alex@mock.com' },
    { username: 'maria_eng', firstName: 'Maria', lastName: 'Garcia', country: 'GB', email: 'maria@mock.com' },
    { username: 'david_dev', firstName: 'David', lastName: 'Wilson', country: 'AU', email: 'david@mock.com' },
    { username: 'lisa_code', firstName: 'Lisa', lastName: 'Brown', country: 'DE', email: 'lisa@mock.com' },
    { username: 'mike_tech', firstName: 'Mike', lastName: 'Davis', country: 'US', email: 'mike@mock.com' },
    { username: 'anna_eng', firstName: 'Anna', lastName: 'Miller', country: 'FR', email: 'anna@mock.com' },
    { username: 'tom_dev', firstName: 'Tom', lastName: 'Anderson', country: 'CA', email: 'tom@mock.com' },
    { username: 'kate_code', firstName: 'Kate', lastName: 'Taylor', country: 'IN', email: 'kate@mock.com' },
  ]

  const hashedPassword = await bcrypt.hash('mockpassword123', 12)

  for (const userData of mockUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      // Create mock user
      const mockUser = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          isPublic: true, // Make them visible in leaderboards
        }
      })

      // Create sample job applications for each mock user
      const numApplications = Math.floor(Math.random() * 15) + 5 // 5-20 applications
      const applications = []

      const companies = ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Tesla', 'Spotify', 'Uber', 'Airbnb', 'Shopify', 'Stripe', 'Zoom', 'Slack', 'Figma']
      const positions = ['Software Engineer', 'Senior Developer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer']
      const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

      for (let i = 0; i < numApplications; i++) {
        const daysAgo = Math.floor(Math.random() * 90) + 1 // 1-90 days ago
        const appliedDate = new Date()
        appliedDate.setDate(appliedDate.getDate() - daysAgo)
        
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        let lastUpdated = new Date(appliedDate)
        if (status !== 'APPLIED') {
          lastUpdated.setDate(appliedDate.getDate() + Math.floor(Math.random() * 21) + 1)
        }

        const salaryBase = Math.floor(Math.random() * 100000) + 80000 // 80k-180k base
        applications.push({
          userId: mockUser.id,
          company: companies[Math.floor(Math.random() * companies.length)],
          jobTitle: positions[Math.floor(Math.random() * positions.length)],
          location: 'Remote',
          salaryMin: salaryBase,
          salaryMax: salaryBase + 20000, // 20k range
          salaryCurrency: 'USD',
          status: status as 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN',
          notes: 'Sample job application for leaderboard testing',
          appliedDate,
          lastUpdated,
          priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH'
        })
      }

      await prisma.jobApplication.createMany({
        data: applications
      })

      // Create analytics record
      await prisma.analytics.create({
        data: {
          userId: mockUser.id,
          period: 'monthly',
          date: new Date(),
        }
      })
    }
  }
}

// Helper function to create sample goals
async function createSampleGoals(userId: string) {
  // Check if user already has goals
  const existingGoals = await prisma.goal.count({
    where: { userId }
  })

  if (existingGoals === 0) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)

    const sampleGoals = [
      {
        userId,
        type: 'APPLICATIONS' as const,
        target: 20,
        achieved: 10, // Current progress from sample applications
        period: 'MONTHLY' as const,
        startDate: monthStart,
        endDate: monthEnd,
        isActive: true
      },
      {
        userId,
        type: 'INTERVIEWS' as const,
        target: 5,
        achieved: 2, // Based on sample data
        period: 'MONTHLY' as const,
        startDate: monthStart,
        endDate: monthEnd,
        isActive: true
      },
      {
        userId,
        type: 'OFFERS' as const,
        target: 2,
        achieved: 1, // Based on sample data
        period: 'QUARTERLY' as const,
        startDate: quarterStart,
        endDate: quarterEnd,
        isActive: true
      }
    ]

    await prisma.goal.createMany({
      data: sampleGoals
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const testUserData = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'testpassword123'
    }

    // Check if test user already exists
    let testUser = await prisma.user.findUnique({
      where: { email: testUserData.email }
    })

    if (!testUser) {
      // Create test user if doesn't exist
      const hashedPassword = await bcrypt.hash(testUserData.password, 12)
      
      testUser = await prisma.user.create({
        data: {
          email: testUserData.email,
          username: testUserData.username,
          firstName: testUserData.firstName,
          lastName: testUserData.lastName,
          password: hashedPassword,
          isPublic: true, // Make test user visible in leaderboards
        }
      })

      // Create initial analytics record
      await prisma.analytics.create({
        data: {
          userId: testUser.id,
          period: 'monthly',
          date: new Date(),
        }
      })

      console.log('Test user created:', testUserData.email)
    }

    // Create sample job applications for test user
    await createSampleJobApplications(testUser.id)

    // Create mock leaderboard users
    await createMockLeaderboardUsers()

    // Create sample goals for test user
    await createSampleGoals(testUser.id)

    // Return test user credentials for frontend to use
    return NextResponse.json({
      success: true,
      credentials: {
        email: testUserData.email,
        password: testUserData.password
      },
      message: 'Test user ready with sample data and leaderboard populated'
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Failed to create/login test user' },
      { status: 500 }
    )
  }
} 