import { Prisma } from '@prisma/client';

export type JobStatus = Prisma.JobStatus;
export type Priority = Prisma.Priority;

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  jobPostUrl?: string;
  salary?: number;
  salaryCurrency?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN' | 'EMPLOYED';
  tags: string[];
  appliedDate: Date;
  lastUpdated: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Template {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'other';
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  fileData: string; // base64 encoded file data
}

export interface AnalyticsData {
  totalApplications: number;
  applicationsByStatus: Record<JobApplication['status'], number>;
  applicationsByMonth: { month: string; count: number }[];
  averageResponseTime: number;
  successRate: number;
  topCompanies: { company: string; count: number }[];
  tagAnalytics: { tag: string; count: number }[];
}

export interface FilterOptions {
  status?: JobApplication['status'][];
  company?: string;
  tags?: string[];
  priority?: JobApplication['priority'][];
  dateRange?: {
    from: Date;
    to: Date;
  };
  salary?: {
    min?: number;
    max?: number;
  };
}

export interface SortOptions {
  field: keyof JobApplication;
  direction: 'asc' | 'desc';
}

export type ViewMode = 'card' | 'table'; 