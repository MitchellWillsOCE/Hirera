export const JobStatus = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING', 
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  EMPLOYED: 'EMPLOYED'
} as const;

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
export type Priority = typeof Priority[keyof typeof Priority];

export const GoalType = {
  APPLICATIONS: 'APPLICATIONS',
  INTERVIEWS: 'INTERVIEWS',
  OFFERS: 'OFFERS',
  RESPONSES: 'RESPONSES',
} as const;

export type GoalType = typeof GoalType[keyof typeof GoalType];

export const GoalPeriod = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const;

export type GoalPeriod = typeof GoalPeriod[keyof typeof GoalPeriod];

export const AchievementType = {
  GOAL_COMPLETED: 'GOAL_COMPLETED',
  FIRST_APPLICATION: 'FIRST_APPLICATION',
  FIRST_INTERVIEW: 'FIRST_INTERVIEW',
  FIRST_OFFER: 'FIRST_OFFER',
} as const;

export type AchievementType = typeof AchievementType[keyof typeof AchievementType];

export const NotificationType = {
  REMINDER: 'REMINDER',
  STATUS_UPDATE: 'STATUS_UPDATE',
  GOAL_PROGRESS: 'GOAL_PROGRESS',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const TemplateType = {
  RESUME: 'RESUME',
  COVER_LETTER: 'COVER_LETTER',
} as const;

export type TemplateType = typeof TemplateType[keyof typeof TemplateType];

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  jobPostUrl?: string | null;
  salary?: number | null;
  salaryCurrency?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  status: JobStatus;
  tags: { tag: { name: string; id: string } }[];
  appliedDate: Date;
  lastUpdated: Date;
  priority: Priority;
  userId: string;
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