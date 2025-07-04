import { BaseService, ServiceResponse } from '@/lib/base.service'
import { prisma } from '@/lib/prisma'
import { Goal, GoalType, JobStatus } from '@/generated/prisma'

export class GoalsService extends BaseService {
  constructor() {
    super(prisma.goal)
  }

  /**
   * Update goal progress when a job application is created or updated
   */
  async updateGoalProgress(userId: string, oldStatus?: JobStatus, newStatus?: JobStatus): Promise<void> {
    try {
      const now = new Date()
      
      // Get active goals for the user
      const activeGoals = await prisma.goal.findMany({
        where: {
          userId,
          isActive: true
        }
      })

      for (const goal of activeGoals) {
        let shouldUpdate = false
        let increment = 0

        // Check if this goal should be updated based on the status change
        switch (goal.type) {
          case GoalType.APPLICATIONS:
            // Count new applications (when oldStatus is undefined/null and newStatus is APPLIED)
            if (!oldStatus && newStatus === JobStatus.APPLIED) {
              shouldUpdate = true
              increment = 1
            }
            break

          case GoalType.INTERVIEWS:
            // Count when status changes to INTERVIEW
            if (oldStatus !== JobStatus.INTERVIEW && newStatus === JobStatus.INTERVIEW) {
              shouldUpdate = true
              increment = 1
            }
            // Decrease if status changes away from INTERVIEW
            else if (oldStatus === JobStatus.INTERVIEW && newStatus !== JobStatus.INTERVIEW) {
              shouldUpdate = true
              increment = -1
            }
            break

          case GoalType.OFFERS:
            // Count when status changes to OFFER
            if (oldStatus !== JobStatus.OFFER && newStatus === JobStatus.OFFER) {
              shouldUpdate = true
              increment = 1
            }
            // Decrease if status changes away from OFFER
            else if (oldStatus === JobStatus.OFFER && newStatus !== JobStatus.OFFER) {
              shouldUpdate = true
              increment = -1
            }
            break

          case GoalType.RESPONSES:
            // Count when status changes from APPLIED to any other status (company responded)
            if (oldStatus === JobStatus.APPLIED && newStatus && newStatus !== JobStatus.APPLIED) {
              shouldUpdate = true
              increment = 1
            }
            break
        }

        if (shouldUpdate && increment !== 0) {
          const newAchieved = Math.max(0, goal.achieved + increment)
          
          await prisma.goal.update({
            where: { id: goal.id },
            data: {
              achieved: newAchieved,
              updatedAt: now
            }
          })

          // Check if goal is completed and create achievement
          if (newAchieved >= goal.target && goal.achieved < goal.target) {
            try {
              await prisma.achievement.create({
                data: {
                  userId,
                  type: 'GOAL_ACHIEVER',
                  title: `Goal Completed: ${goal.type}`,
                  description: `Successfully achieved ${goal.target} ${goal.type.toLowerCase()} goal!`
                }
              })
            } catch (achievementError) {
              console.warn('Failed to create achievement:', achievementError)
            }
          }
        }
      }

      // Clear relevant caches
      this.clearCache(`user:${userId}:goals`)
    } catch (error) {
      console.error('Error updating goal progress:', error)
      // Don't throw error as this is a side effect
    }
  }

  /**
   * Recalculate goal progress by counting actual job applications
   */
  async recalculateGoalProgress(userId: string, goalId: string): Promise<ServiceResponse<Goal>> {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      })

      if (!goal) {
        return { success: false, error: 'Goal not found', code: 'NOT_FOUND' }
      }

      // Calculate the period start and end dates
      const createdDate = new Date(goal.createdAt)
      let periodStart = new Date(createdDate)
      let periodEnd = new Date(createdDate)

      switch (goal.period) {
        case 'WEEKLY':
          periodEnd.setDate(periodStart.getDate() + 7)
          break
        case 'MONTHLY':
          periodEnd.setMonth(periodStart.getMonth() + 1)
          break
        case 'QUARTERLY':
          periodEnd.setMonth(periodStart.getMonth() + 3)
          break
        case 'YEARLY':
          periodEnd.setFullYear(periodStart.getFullYear() + 1)
          break
      }

      let actualAchieved = 0

      // Count based on goal type
      switch (goal.type) {
        case GoalType.APPLICATIONS:
          actualAchieved = await prisma.jobApplication.count({
            where: {
              userId,
              appliedDate: {
                gte: periodStart,
                lte: periodEnd
              }
            }
          })
          break

        case GoalType.INTERVIEWS:
          actualAchieved = await prisma.jobApplication.count({
            where: {
              userId,
              status: JobStatus.INTERVIEW,
              appliedDate: {
                gte: periodStart,
                lte: periodEnd
              }
            }
          })
          break

        case GoalType.OFFERS:
          actualAchieved = await prisma.jobApplication.count({
            where: {
              userId,
              status: JobStatus.OFFER,
              appliedDate: {
                gte: periodStart,
                lte: periodEnd
              }
            }
          })
          break

        case GoalType.RESPONSES:
          actualAchieved = await prisma.jobApplication.count({
            where: {
              userId,
              status: {
                not: JobStatus.APPLIED
              },
              appliedDate: {
                gte: periodStart,
                lte: periodEnd
              }
            }
          })
          break
      }

      // Update the goal with the recalculated progress
      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          achieved: actualAchieved,
          updatedAt: new Date()
        }
      })

      this.clearCache(`user:${userId}:goals`)
      
      return this.success(updatedGoal)
    } catch (error) {
      return this.handleError(error)
    }
  }
}

export const goalsService = new GoalsService() 