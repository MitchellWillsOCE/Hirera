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
  const createdUsers: { user: any, profile: MockUser }[] = []

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
    console.log(`   ✓ Created user: ${profile.firstName} ${profile.lastName} (${profile.country}) - ${profile.applicationCount} apps planned`)
  }

  // Generate additional random users
  console.log('🎲 Creating additional random users...')
  const randomUsers = generateMockUsers(20) // Increased from 15 to 20
  
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

    createdUsers.push({ user, profile: mockUser })
    console.log(`   ✓ Created user: ${mockUser.firstName} ${mockUser.lastName} (${mockUser.country}) - ${mockUser.applicationCount} apps planned`)
  }

  // Create job applications for each user
  console.log('💼 Creating job applications...')
  const allTags = new Set<string>()
  let totalApplications = 0

  for (const { user, profile } of createdUsers) {
    const applicationCount = profile.applicationCount || Math.floor(Math.random() * 30) + 10
    const applications = generateMockJobApplications(applicationCount)
    
    let userApplicationsCreated = 0
    
    for (const app of applications) {
      try {
        // Create job application
        const jobApp = await prisma.jobApplication.create({
          data: {
            jobTitle: app.jobTitle,
            company: app.company,
            location: app.location,
            jobPostUrl: app.jobPostUrl,
            salary: app.salary,
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
          const statusUpdateDays = app.status === 'screening' ? Math.random() * 3 + 1 :
                                 app.status === 'interview' ? Math.random() * 7 + 2 :
                                 app.status === 'offer' ? Math.random() * 10 + 3 :
                                 app.status === 'rejected' ? Math.random() * 14 + 1 :
                                 Math.random() * 5 + 1

          const statusDate = new Date(app.appliedDate.getTime() + statusUpdateDays * 24 * 60 * 60 * 1000)
          
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              jobApplicationId: jobApp.id,
              action: 'UPDATE_STATUS',
              description: `Status changed to ${app.status}`,
              timestamp: statusDate
            }
          })

          // Add additional activity for interview and offer statuses
          if (app.status === 'interview') {
            const interviewDate = new Date(statusDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
            await prisma.activityLog.create({
              data: {
                userId: user.id,
                jobApplicationId: jobApp.id,
                action: 'INTERVIEW',
                description: `Interview scheduled with ${app.company}`,
                timestamp: interviewDate
              }
            })
          } else if (app.status === 'offer') {
            const offerDate = new Date(statusDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
            await prisma.activityLog.create({
              data: {
                userId: user.id,
                jobApplicationId: jobApp.id,
                action: 'OFFER',
                description: `Received offer from ${app.company}`,
                timestamp: offerDate
              }
            })
          }
        }

        userApplicationsCreated++
        totalApplications++
      } catch (error) {
        console.error(`Error creating application for ${user.username}:`, error)
      }
    }

    console.log(`   ✓ Created ${userApplicationsCreated} applications for ${user.username}`)
  }

  // Create tags
  console.log('🏷️  Creating tags...')
  const tagArray = Array.from(allTags)
  console.log(`   Creating ${tagArray.length} unique tags...`)
  
  const tagPromises = tagArray.map(tagName =>
    prisma.tag.create({
      data: { name: tagName }
    }).catch(error => {
      console.error(`Error creating tag ${tagName}:`, error)
      return null
    })
  )
  
  const createdTags = (await Promise.all(tagPromises)).filter(Boolean)
  console.log(`   ✓ Created ${createdTags.length} tags`)

  // Link job applications to tags
  console.log('🔗 Linking applications to tags...')
  const allJobApps = await prisma.jobApplication.findMany()
  const allDbTags = await prisma.tag.findMany()
  
  let tagLinksCreated = 0

  for (const jobApp of allJobApps) {
    // Generate random tags for this application (simulate the original tag generation)
    const mockApp = generateMockJobApplications(1)[0]
    const tagsToLink = mockApp.tags.slice(0, Math.floor(Math.random() * 6) + 2) // 2-8 tags per application
    
    for (const tagName of tagsToLink) {
      const tag = allDbTags.find(t => t.name === tagName)
      if (tag) {
        try {
          await prisma.jobApplicationTag.create({
            data: {
              jobApplicationId: jobApp.id,
              tagId: tag.id
            }
          })
          tagLinksCreated++
        } catch (error) {
          // Tag already linked, skip
        }
      }
    }
  }

  console.log(`   ✓ Created ${tagLinksCreated} tag associations`)

  // Create goals for users
  console.log('🎯 Creating user goals...')
  const usersWithGoals = createdUsers.slice(0, 15) // First 15 users get goals
  let goalsCreated = 0
  
  for (const { user } of usersWithGoals) {
    const goalCount = Math.floor(Math.random() * 3) + 1 // 1-3 goals per user
    
    for (let i = 0; i < goalCount; i++) {
      const goalTypes = ['APPLICATIONS', 'INTERVIEWS', 'OFFERS', 'RESPONSES']
      const periods = ['WEEKLY', 'MONTHLY', 'QUARTERLY']
      
      const randomGoalType = goalTypes[Math.floor(Math.random() * goalTypes.length)]
      const randomPeriod = periods[Math.floor(Math.random() * periods.length)]
      
      const target = randomGoalType === 'APPLICATIONS' ? Math.floor(Math.random() * 15) + 10 :
                    randomGoalType === 'INTERVIEWS' ? Math.floor(Math.random() * 4) + 2 :
                    randomGoalType === 'OFFERS' ? Math.floor(Math.random() * 2) + 1 :
                    Math.floor(Math.random() * 8) + 3

      const achieved = Math.floor(target * (Math.random() * 0.9)) // 0-90% progress

      try {
        await prisma.goal.create({
          data: {
            userId: user.id,
            type: randomGoalType as any,
            target,
            achieved,
            period: randomPeriod as any,
            isActive: achieved < target
          }
        })
        goalsCreated++
      } catch (error) {
        console.error(`Error creating goal for ${user.username}:`, error)
      }
    }
  }

  console.log(`   ✓ Created ${goalsCreated} goals`)

  // Create achievements for users who completed goals
  console.log('🏆 Creating achievements...')
  const completedGoals = await prisma.goal.findMany({
    where: { 
      achieved: { gte: 1 } // Goals with at least 1 achievement
    },
    include: { user: true }
  })

  let achievementsCreated = 0
  
  for (const goal of completedGoals) {
    const achievementTypes = ['GOAL_COMPLETED', 'MILESTONE_REACHED', 'STREAK_ACHIEVED']
    const randomType = achievementTypes[Math.floor(Math.random() * achievementTypes.length)]
    
    try {
      await prisma.achievement.create({
        data: {
          userId: goal.userId,
          type: randomType as any,
          title: `${goal.type} Goal Completed`,
          description: `Successfully achieved ${goal.achieved}/${goal.target} ${goal.type.toLowerCase()} in ${goal.period.toLowerCase()} period`,
          unlockedAt: new Date()
        }
      })
      achievementsCreated++
    } catch (error) {
      console.error(`Error creating achievement for goal ${goal.id}:`, error)
    }
  }

  console.log(`   ✓ Created ${achievementsCreated} achievements`)

  // Create analytics data for all users
  console.log('📊 Creating analytics data...')
  let analyticsCreated = 0
  
  for (const { user } of createdUsers) {
    const periods = ['weekly', 'monthly', 'quarterly', 'yearly']
    
    for (const period of periods) {
      try {
        await prisma.analytics.create({
          data: {
            userId: user.id,
            period,
            date: new Date(),
            totalApps: Math.floor(Math.random() * 50) + 10,
            responsesRate: Math.floor(Math.random() * 25) + 5,
            interviewRate: Math.floor(Math.random() * 15) + 2,
            offerRate: Math.floor(Math.random() * 5) + 1,
            avgResponseTime: Math.floor(Math.random() * 14) + 3
          }
        })
        analyticsCreated++
      } catch (error) {
        console.error(`Error creating analytics for ${user.username}:`, error)
      }
    }
  }

  console.log(`   ✓ Created ${analyticsCreated} analytics records`)

  // Create some notifications
  console.log('🔔 Creating notifications...')
  let notificationsCreated = 0
  
  for (const { user } of createdUsers.slice(0, 10)) { // First 10 users get notifications
    const notificationCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < notificationCount; i++) {
      const notificationTypes = [
        'Goal deadline approaching',
        'New achievement unlocked',
        'Weekly progress summary',
        'Application status reminder'
      ]
      
      const randomMessage = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      
      try {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM',
            message: randomMessage,
            isRead: Math.random() > 0.3, // 70% chance of being read
            title: 'Notification Title'
          }
        })
        notificationsCreated++
      } catch (error) {
        console.error(`Error creating notification for ${user.username}:`, error)
      }
    }
  }

  console.log(`   ✓ Created ${notificationsCreated} notifications`)

  // Summary
  console.log('\n📈 Seeding Summary:')
  console.log(`   👥 Users: ${createdUsers.length}`)
  console.log(`   💼 Job Applications: ${totalApplications}`)
  console.log(`   🏷️  Tags: ${createdTags.length}`)
  console.log(`   🔗 Tag Links: ${tagLinksCreated}`)
  console.log(`   🎯 Goals: ${goalsCreated}`)
  console.log(`   🏆 Achievements: ${achievementsCreated}`)
  console.log(`   📊 Analytics: ${analyticsCreated}`)
  console.log(`   🔔 Notifications: ${notificationsCreated}`)
  console.log('\n✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 