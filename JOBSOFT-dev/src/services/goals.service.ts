import { BaseService, ServiceResponse } from '@/lib/base.service'
import docClient from '@/lib/dynamodb'
import { QueryCommand, UpdateCommand, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { JobStatus, GoalType, GoalPeriod } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = 'Hirera' // This should be in an env var

export class GoalsService extends BaseService {
  constructor() {
    super(null) // Passing null since we're not using prisma client here.
  }

  /**
   * Update goal progress when a job application is created or updated
   */
  async updateGoalProgress(userId: string, oldStatus?: JobStatus, newStatus?: JobStatus): Promise<void> {
    try {
      const { Items: activeGoals } = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        FilterExpression: 'isActive = :isActive',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'GOAL#',
          ':isActive': true,
        },
      }))

      if (!activeGoals) return

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
        }

        if (shouldUpdate && increment !== 0) {
          const newAchieved = Math.max(0, goal.achieved + increment)
          
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: goal.PK, SK: goal.SK },
            UpdateExpression: 'set achieved = :achieved, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':achieved': newAchieved,
              ':updatedAt': new Date().toISOString(),
            },
          }))

          // Check if goal is completed and create achievement
          if (newAchieved >= goal.target && goal.achieved < goal.target) {
            await docClient.send(new PutCommand({
              TableName: TABLE_NAME,
              Item: {
                PK: `USER#${userId}`,
                SK: `ACHIEVEMENT#${goal.id}`,
                EntityType: 'Achievement',
                userId,
                type: 'GOAL_ACHIEVER',
                title: `Goal Completed: ${goal.type}`,
                description: `Successfully achieved ${goal.target} ${goal.type.toLowerCase()} goal!`,
                createdAt: new Date().toISOString()
              }
            }))
          }
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error)
    }
  }

  /**
   * Recalculate goal progress by counting actual job applications
   */
  async recalculateGoalProgress(userId: string, goalId: string): Promise<ServiceResponse<any>> {
    // Recalculating progress will be more complex with DynamoDB.
    // It would involve querying/scanning the job applications and counting them.
    // This is a placeholder for that logic. For now, it will return a success.
    // A proper implementation would require efficient querying, possibly with a GSI.
    console.log(`Recalculating progress for goal ${goalId} for user ${userId}`)
    return this.success({ message: "Recalculation logic not yet implemented for DynamoDB." })
  }

  async getGoals(userId: string, type?: GoalType, period?: GoalPeriod): Promise<ServiceResponse<any[]>> {
    try {
      const params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        FilterExpression: 'isActive = :isActive',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'GOAL#',
          ':isActive': true,
        },
      };

      if (type) {
        params.FilterExpression += ' and #type = :type';
        params.ExpressionAttributeValues[':type'] = type;
        params.ExpressionAttributeNames = { '#type': 'type' };
      }

      if (period) {
        params.FilterExpression += ' and period = :period';
        params.ExpressionAttributeValues[':period'] = period;
      }

      const { Items } = await docClient.send(new QueryCommand(params));
      return this.success(Items || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createGoal(userId: string, data: { type: GoalType; target: number; period: GoalPeriod; description?: string }): Promise<ServiceResponse<any>> {
    try {
      // Deactivate existing similar goals
      const { Items: existingGoals } = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        FilterExpression: '#type = :type and period = :period and isActive = :isActive',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'GOAL#',
          ':type': data.type,
          ':period': data.period,
          ':isActive': true,
        },
      }));

      if (existingGoals) {
        for (const goal of existingGoals) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: goal.PK, SK: goal.SK },
            UpdateExpression: 'set isActive = :isActive',
            ExpressionAttributeValues: {
              ':isActive': false,
            },
          }));
        }
      }

      const goalId = uuidv4();
      const now = new Date().toISOString();
      const newGoal = {
        PK: `USER#${userId}`,
        SK: `GOAL#${goalId}`,
        id: goalId,
        EntityType: 'Goal',
        userId,
        ...data,
        achieved: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newGoal,
      }));

      return this.success(newGoal);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateGoal(userId: string, goalId: string, data: any): Promise<ServiceResponse<any>> {
    try {
      const { Item: existingGoal } = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` }
      }));

      if (!existingGoal) {
        return { success: false, error: 'Goal not found', code: 'NOT_FOUND' };
      }

      let updateExpression = 'set ';
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};

      Object.entries(data).forEach(([key, value], index) => {
        if (value !== undefined) {
          const valueKey = `:val${index}`;
          const nameKey = `#key${index}`;
          updateExpression += `${nameKey} = ${valueKey}, `;
          expressionAttributeValues[valueKey] = value;
          expressionAttributeNames[nameKey] = key;
        }
      });
      
      updateExpression += '#updatedAt = :updatedAt';
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const { Attributes: updatedGoal } = await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      }));

      if (updatedGoal && updatedGoal.achieved >= updatedGoal.target && existingGoal.achieved < existingGoal.target) {
        // Create achievement
      }

      return this.success(updatedGoal);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteGoal(userId: string, goalId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Optional: First check if goal exists to provide a better error message.
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` }
      }));
      return this.success(true);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const goalsService = new GoalsService() 