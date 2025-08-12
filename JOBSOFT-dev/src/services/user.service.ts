import { BaseService, ServiceResponse } from '@/lib/base.service';
import docClient from '@/lib/dynamodb';
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { updateUserAttributes } from '@/lib/cognito';

const TABLE_NAME = 'Hirera'; // This should be in an env var

export class UserService extends BaseService {
  constructor() {
    super(null);
  }

  async getUserProfile(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { Item } = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROFILE`,
        },
      }));

      if (!Item) {
        return { success: false, error: 'User not found', code: 'NOT_FOUND' };
      }
      
      // Don't expose sensitive data
      const { PK, SK, EntityType, ...userProfile } = Item;
      return this.success(userProfile);

    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUserProfile(userId: string, email: string, data: any): Promise<ServiceResponse<any>> {
    try {
        const { firstName, lastName, country, isPublic } = data;

        // Update in Cognito
        await updateUserAttributes(email, {
            'given_name': firstName,
            'family_name': lastName,
            'custom:country': country,
            'custom:isPublic': isPublic.toString(),
        });

        // Update in DynamoDB
        const updateExpression = 'set #firstName = :firstName, #lastName = :lastName, #country = :country, #isPublic = :isPublic, #updatedAt = :updatedAt';
        const expressionAttributeNames = {
            '#firstName': 'firstName',
            '#lastName': 'lastName',
            '#country': 'country',
            '#isPublic': 'isPublic',
            '#updatedAt': 'updatedAt',
        };
        const expressionAttributeValues = {
            ':firstName': firstName,
            ':lastName': lastName,
            ':country': country,
            ':isPublic': isPublic,
            ':updatedAt': new Date().toISOString(),
        };

        const { Attributes } = await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `USER#${userId}`,
              SK: `PROFILE`,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        }));

      return this.success(Attributes);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      // This is a simplified delete. A real-world scenario would involve
      // deleting all related items (jobs, goals, etc.) which can be complex
      // and might require a batch delete operation or a more sophisticated
      // cleanup process.
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROFILE`,
        },
      }));
      return this.success(true);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const userService = new UserService(); 