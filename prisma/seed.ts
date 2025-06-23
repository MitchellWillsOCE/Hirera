import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'
import { 
  generateMockUsers, 
  generateMockJobApplications, 
  mockUserProfiles,
  MockUser,
  MockJobApplication
} from '../src/lib/mock-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.achievement.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.analytics.deleteMany({})
  await prisma.activityLog.deleteMany({})
  await prisma.jobApplicationTag.deleteMany({})
  await prisma.jobApplication.deleteMany({})
  await prisma.tag.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Create predefined users with varied data
  console.log('👥 Creating predefined users...')
  const createdUsers = []

  for (const profile of mockUserProfiles) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const user = await prisma.user.create({
      data: {
        username: profile.username,
        email: profile.email,
        password: hashedPassword,
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
        isPublic: true
      }
    })

    createdUsers.push({ user, profile })
    console.log(`   ✓ Created user: ${profile.firstName} ${profile.lastName} (${profile.country})`)
  }

  // Generate additional random users
  console.log('🎲 Creating additional random users...')
  const randomUsers = generateMockUsers(15)
  
  for (const mockUser of randomUsers) {
    const hashedPassword = await bcrypt.hash(mockUser.password, 10)
    
    const user = await prisma.user.create({
      data: {
        username: mockUser.username,
        email: mockUser.email,
        password: hashedPassword,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        country: mockUser.country,
        isPublic: mockUser.isPublic
      }
    })

    const applicationCount = Math.floor(Math.random() * 20) + 5 // 5-25 applications
    createdUsers.push({ 
      user, 
      profile: { 
        ...mockUser, 
        applicationCount,
        successRate: Math.floor(Math.random() * 25) + 5 // 5-30% success rate
      } 
    })
    console.log(`   ✓ Created user: ${mockUser.firstName} ${mockUser.lastName} (${mockUser.country})`)
  }

  // Create job applications for each user
  console.log('💼 Creating job applications...')
  const allTags = new Set<string>()

  for (const { user, profile } of createdUsers) {
    const applications = generateMockJobApplications(profile.applicationCount)
    
    for (const app of applications) {
      // Create job application
      const jobApp = await prisma.jobApplication.create({
        data: {
          jobTitle: app.jobTitle,
          company: app.company,
          location: app.location,
          jobPostUrl: app.jobPostUrl,
          salaryMin: app.salaryMin,
          salaryMax: app.salaryMax,
          salaryCurrency: app.salaryCurrency,
          contactName: app.contactName,
          contactEmail: app.contactEmail,
          contactPhone: app.contactPhone,
          notes: app.notes,
          status: app.status.toUpperCase() as any,
          priority: app.priority.toUpperCase() as any,
          appliedDate: app.appliedDate,
          userId: user.id
        }
      })

      // Track tags
      app.tags.forEach(tag => allTags.add(tag))

      // Create activity log for application
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          jobApplicationId: jobApp.id,
          action: 'CREATE',
          description: `Applied to ${app.jobTitle} at ${app.company}`,
          timestamp: app.appliedDate
        }
      })

      // Create status update activity if not 'applied'
      if (app.status !== 'applied') {
        const statusDate = new Date(app.appliedDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000)
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            jobApplicationId: jobApp.id,
            action: 'UPDATE_STATUS',
            description: `Status changed to ${app.status}`,
            timestamp: statusDate
          }
        })
      }
    }

    console.log(`   ✓ Created ${profile.applicationCount} applications for ${user.username}`)
  }

  // Create tags
  console.log('🏷️  Creating tags...')
  const tagPromises = Array.from(allTags).map(tagName =>
    prisma.tag.create({
      data: { name: tagName }
    })
  )
  await Promise.all(tagPromises)

  // Link job applications to tags
  console.log('🔗 Linking applications to tags...')
  const allJobApps = await prisma.jobApplication.findMany()
  const allDbTags = await prisma.tag.findMany()

  for (const jobApp of allJobApps) {
    // Get original application data to match tags
    const mockApps = generateMockJobApplications(1)
    const randomTags = mockApps[0].tags.slice(0, Math.floor(Math.random() * 4) + 1)
    
    for (const tagName of randomTags) {
      const tag = allDbTags.find(t => t.name === tagName)
      if (tag) {
        try {
          await prisma.jobApplicationTag.create({
            data: {
              jobApplicationId: jobApp.id,
              tagId: tag.id
            }
          })
        } catch (error) {
          // Tag already linked, skip
        }
      }
    }
  }

  // Create goals for some users
  console.log('🎯 Creating user goals...')
  const usersWithGoals = createdUsers.slice(0, 10) // First 10 users get goals
  
  for (const { user } of usersWithGoals) {
    const goalTypes = ['APPLICATIONS', 'INTERVIEWS', 'OFFERS', 'RESPONSES']
    const randomGoalType = goalTypes[Math.floor(Math.random() * goalTypes.length)]
    const target = randomGoalType === 'APPLICATIONS' ? Math.floor(Math.random() * 20) + 10 :
                  randomGoalType === 'INTERVIEWS' ? Math.floor(Math.random() * 5) + 2 :
                  randomGoalType === 'OFFERS' ? Math.floor(Math.random() * 3) + 1 :
                  Math.floor(Math.random() * 10) + 5

    const achieved = Math.floor(target * (Math.random() * 0.8)) // 0-80% progress

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await prisma.goal.create({
      data: {
        userId: user.id,
        type: randomGoalType as any,
        target,
        achieved,
        period: 'MONTHLY',
        startDate,
        endDate,
        isActive: true
      }
    })
  }

  // Create achievements for users who completed goals
  console.log('🏆 Creating achievements...')
  const achievementTypes = [
    'FIRST_APPLICATION', 'FIRST_INTERVIEW', 'FIRST_OFFER',
    'MILESTONE_10_APPS', 'MILESTONE_50_APPS', 'STREAK_7_DAYS'
  ]

  for (const { user, profile } of createdUsers) {
    const userAchievements = []
    
    // Everyone gets first application
    userAchievements.push('FIRST_APPLICATION')
    
    // Based on application count and success rate
    if (profile.applicationCount >= 10) userAchievements.push('MILESTONE_10_APPS')
    if (profile.applicationCount >= 50) userAchievements.push('MILESTONE_50_APPS')
    if (profile.successRate > 15) userAchievements.push('FIRST_INTERVIEW')
    if (profile.successRate > 20) userAchievements.push('FIRST_OFFER')
    if (Math.random() > 0.7) userAchievements.push('STREAK_7_DAYS')

    for (const achievementType of userAchievements) {
      const achievementData = {
        FIRST_APPLICATION: { title: 'First Application', description: 'Submitted your first job application!' },
        FIRST_INTERVIEW: { title: 'First Interview', description: 'Landed your first interview!' },
        FIRST_OFFER: { title: 'First Offer', description: 'Received your first job offer!' },
        MILESTONE_10_APPS: { title: '10 Applications', description: 'Submitted 10 job applications!' },
        MILESTONE_50_APPS: { title: '50 Applications', description: 'Reached 50 job applications!' },
        STREAK_7_DAYS: { title: '7-Day Streak', description: 'Applied to jobs for 7 consecutive days!' }
      }

      const data = achievementData[achievementType as keyof typeof achievementData]
      if (data) {
        await prisma.achievement.create({
          data: {
            userId: user.id,
            type: achievementType as any,
            title: data.title,
            description: data.description,
            unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          }
        })
      }
    }
  }

  // Create analytics data
  console.log('📊 Creating analytics data...')
  for (const { user } of createdUsers) {
    const userApps = await prisma.jobApplication.findMany({
      where: { userId: user.id }
    })

    const totalApps = userApps.length
    const interviews = userApps.filter(app => ['INTERVIEW', 'OFFER'].includes(app.status)).length
    const offers = userApps.filter(app => app.status === 'OFFER').length
    const responses = userApps.filter(app => app.status !== 'APPLIED').length

    await prisma.analytics.create({
      data: {
        userId: user.id,
        period: 'monthly',
        date: new Date(),
        totalApps,
        responsesRate: totalApps > 0 ? (responses / totalApps) * 100 : 0,
        interviewRate: totalApps > 0 ? (interviews / totalApps) * 100 : 0,
        offerRate: totalApps > 0 ? (offers / totalApps) * 100 : 0,
        avgResponseTime: Math.floor(Math.random() * 14) + 3 // 3-17 days
      }
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log(`📈 Summary:`)
  console.log(`   👥 Users created: ${createdUsers.length}`)
  console.log(`   💼 Job applications: ${allJobApps.length}`)
  console.log(`   🏷️  Tags created: ${allTags.size}`)
  console.log(`   🎯 Goals created: ${usersWithGoals.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 