import { BaseService, ServiceResponse, PaginationOptions } from '@/lib/base.service'
import docClient from '@/lib/dynamodb'
import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
// Re-define enums and types that were previously imported from Prisma
import { JobStatus, Priority, GoalType, GoalPeriod, AchievementType, NotificationType, TemplateType } from '@/lib/types';
import { goalsService } from '@/services/goals.service'

const TABLE_NAME = "Hirera"; // This should be in an env var

// Re-defining interfaces from the original service file
export interface CreateJobApplicationData {
  jobTitle: string
  company: string
  location: string
  jobPostUrl?: string
  salary?: number
  salaryCurrency?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
  status?: JobStatus
  priority?: Priority
  appliedDate?: Date
  tags?: string[]
}

export interface UpdateJobApplicationData extends Partial<CreateJobApplicationData> {}

export interface JobApplicationFilters {
  status?: JobStatus[]
  priority?: Priority[]
  company?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface JobApplicationStats {
  total: number
  byStatus: Record<JobStatus, number>
  byPriority: Record<Priority, number>
  successRate: number
  interviewRate: number
  rejectionRate: number
  avgResponseTime: number
  recentApplications: number
}

export class JobApplicationsService extends BaseService {
  constructor() {
    // BaseService constructor might not be needed anymore if it was Prisma-specific.
    // For now, we'll keep it but not call super if it's not needed.
    super(null); // Passing null since we're not using prisma client here.
  }

  async create(userId: string, data: CreateJobApplicationData): Promise<ServiceResponse<any>> {
    try {
      const jobId = uuidv4();
      const now = new Date().toISOString();
      const { tags, ...jobData } = data;

      const item = {
        PK: `USER#${userId}`,
        SK: `JOB#${jobId}`,
        EntityType: "JobApplication",
        id: jobId,
        userId,
        ...jobData,
        status: jobData.status || JobStatus.APPLIED,
        priority: jobData.priority || Priority.MEDIUM,
        appliedDate: jobData.appliedDate ? new Date(jobData.appliedDate).toISOString() : now,
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }));
      
      if (tags && tags.length > 0) {
        await this.handleTags(jobId, userId, tags);
      }

      // In DynamoDB, "logging" would typically be another PutItem call.
      // await this.logActivity(userId, jobId, 'CREATED', `...`);

      return this.success(item);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserJobApplications(
    userId: string, 
    filters: JobApplicationFilters = {}, 
    pagination: PaginationOptions = {}
  ): Promise<ServiceResponse<any>> {
    try {
      const params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "JOB#",
        },
        // DynamoDB filtering is more complex and often less efficient than in SQL.
        // It's better to create secondary indexes (GSI) for common query patterns.
        // For now, we can use a FilterExpression, but this is not optimal for performance.
      };
      
      const { Items, Count } = await docClient.send(new QueryCommand(params));

      return this.success({ items: Items, pagination: { total: Count } });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(userId: string, applicationId: string): Promise<ServiceResponse<any>> {
    try {
      const params = {
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `JOB#${applicationId}`,
        },
      };
      const { Item } = await docClient.send(new GetCommand(params));
      if (!Item) {
        return { success: false, error: 'Job application not found', code: 'NOT_FOUND' };
      }
      return this.success(Item);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(userId: string, applicationId: string, data: UpdateJobApplicationData): Promise<ServiceResponse<any>> {
    try {
      // First, verify the item exists and belongs to the user
      const existing = await this.getById(userId, applicationId);
      if (!existing.success) {
        return existing;
      }

      const { tags, ...updateData } = data;

      let updateExpression = "set ";
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};

      // Build the update expression dynamically
      Object.entries(updateData).forEach(([key, value], index) => {
        if (value !== undefined) {
          const valueKey = `:val${index}`;
          const nameKey = `#key${index}`;
          updateExpression += `${nameKey} = ${valueKey}, `;
          expressionAttributeValues[valueKey] = value;
          expressionAttributeNames[nameKey] = key;
        }
      });
      
      // Add updatedAt timestamp
      updateExpression += "#updatedAt = :updatedAt";
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      const params = {
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `JOB#${applicationId}`,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: ReturnValue.ALL_NEW,
      };

      const { Attributes } = await docClient.send(new UpdateCommand(params));
      
      if (tags) {
        await this.handleTags(applicationId, userId, tags);
      }

      return this.success(Attributes);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(userId: string, applicationId: string): Promise<ServiceResponse<boolean>> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `JOB#${applicationId}`,
        },
      }));
      return this.success(true);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  private async handleTags(jobId: string, userId: string, tags: string[]): Promise<void> {
    // This is a simplified version. A robust implementation would involve
    // batch writing and clearing old tags.
    const tagPromises = tags.map(tag => {
      const item = {
        PK: `JOB#${jobId}`,
        SK: `TAG#${tag}`,
        EntityType: "JobTagLink",
        jobId,
        tag,
        userId,
      };
      return docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }));
    });
    await Promise.all(tagPromises);
  }

  // logActivity, logBatchActivity would be refactored similarly,
  // creating new items in DynamoDB.
}

export const jobApplicationsService = new JobApplicationsService() 

// This service now acts as a client to the Next.js API routes,
// which in turn proxy requests to the job-service microservice.

const API_PROXY_URL = '/api/jobs';

export const getJobs = async () => {
  const response = await fetch(API_PROXY_URL);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch jobs' }));
    throw new Error(errorData.message);
  }

  return response.json();
};

export const createJob = async (jobData: { 
  company: string; 
  jobTitle: string; 
  location: string;
  jobPostUrl?: string; 
  status?: string; 
  applicationDate?: string; 
  notes?: string;
  salary?: number;
  salaryCurrency?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  priority?: string;
}) => {
  // Map UI payload to job-service expected fields
  const payload = {
    title: jobData.jobTitle,
    company: jobData.company,
    location: jobData.location,
    url: jobData.jobPostUrl,
    status: jobData.status,
    applicationDate: jobData.applicationDate,
    notes: jobData.notes,
    salary: jobData.salary,
    salaryCurrency: jobData.salaryCurrency,
    contactName: jobData.contactName,
    contactEmail: jobData.contactEmail,
    contactPhone: jobData.contactPhone,
    tags: jobData.tags,
    priority: jobData.priority,
  };

  const response = await fetch(API_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create job' }));
    throw new Error(errorData.message);
  }

  return response.json();
}; 