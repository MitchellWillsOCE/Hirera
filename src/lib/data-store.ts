import { JobApplication, Template, AnalyticsData, FilterOptions, SortOptions } from './types';
import { v4 as uuidv4 } from 'uuid';

const JOBS_STORAGE_KEY = 'job-tracker-applications';
const TEMPLATES_STORAGE_KEY = 'job-tracker-templates';

export class DataStore {
  private static instance: DataStore;
  private jobs: JobApplication[] = [];
  private templates: Template[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const jobsData = localStorage.getItem(JOBS_STORAGE_KEY);
        const templatesData = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        
        if (jobsData) {
          this.jobs = JSON.parse(jobsData).map((job: any) => ({
            ...job,
            appliedDate: new Date(job.appliedDate),
            lastUpdated: new Date(job.lastUpdated),
          }));
        }
        
        if (templatesData) {
          this.templates = JSON.parse(templatesData).map((template: any) => ({
            ...template,
            uploadDate: new Date(template.uploadDate),
          }));
        }
      } catch (error) {
        console.error('Error loading data from storage:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(this.jobs));
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(this.templates));
      } catch (error) {
        console.error('Error saving data to storage:', error);
      }
    }
  }

  // Job Application Methods
  getAllJobs(): JobApplication[] {
    return [...this.jobs];
  }

  getJobById(id: string): JobApplication | undefined {
    return this.jobs.find(job => job.id === id);
  }

  addJob(jobData: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'>): JobApplication {
    const newJob: JobApplication = {
      ...jobData,
      id: uuidv4(),
      appliedDate: new Date(),
      lastUpdated: new Date(),
    };
    
    this.jobs.push(newJob);
    this.saveToStorage();
    return newJob;
  }

  updateJob(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return null;

    this.jobs[index] = {
      ...this.jobs[index],
      ...updates,
      lastUpdated: new Date(),
    };
    
    this.saveToStorage();
    return this.jobs[index];
  }

  deleteJob(id: string): boolean {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.jobs.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  filterJobs(filters: FilterOptions): JobApplication[] {
    return this.jobs.filter(job => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(job.status)) {
        return false;
      }
      
      if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          job.tags.some(jobTag => jobTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }
      
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(job.priority)) {
        return false;
      }
      
      if (filters.dateRange) {
        if (job.appliedDate < filters.dateRange.from || job.appliedDate > filters.dateRange.to) {
          return false;
        }
      }
      
      if (filters.salary && job.salary) {
        if (filters.salary.min && job.salary.max && job.salary.max < filters.salary.min) {
          return false;
        }
        if (filters.salary.max && job.salary.min && job.salary.min > filters.salary.max) {
          return false;
        }
      }
      
      return true;
    });
  }

  sortJobs(jobs: JobApplication[], sortOptions: SortOptions): JobApplication[] {
    return [...jobs].sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      let comparison = 0;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });
  }

  // Template Methods
  getAllTemplates(): Template[] {
    return [...this.templates];
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  addTemplate(templateData: Omit<Template, 'id' | 'uploadDate'>): Template {
    const newTemplate: Template = {
      ...templateData,
      id: uuidv4(),
      uploadDate: new Date(),
    };
    
    this.templates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(template => template.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Analytics Methods
  getAnalytics(): AnalyticsData {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const applicationsByStatus = this.jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<JobApplication['status'], number>);

    const applicationsByMonth = this.getApplicationsByMonth(sixMonthsAgo, now);
    const topCompanies = this.getTopCompanies();
    const tagAnalytics = this.getTagAnalytics();
    const averageResponseTime = this.calculateAverageResponseTime();
    const successRate = this.jobs.length > 0 ? 
      (this.jobs.filter(job => job.status === 'offer').length / this.jobs.length) * 100 : 0;

    return {
      totalApplications: this.jobs.length,
      applicationsByStatus,
      applicationsByMonth,
      averageResponseTime,
      successRate,
      topCompanies,
      tagAnalytics,
    };
  }

  private getApplicationsByMonth(startDate: Date, endDate: Date) {
    const monthCounts: { [key: string]: number } = {};
    
    this.jobs.forEach(job => {
      if (job.appliedDate >= startDate && job.appliedDate <= endDate) {
        const monthKey = job.appliedDate.toLocaleString('default', { 
          month: 'short', 
          year: 'numeric' 
        });
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  }

  private getTopCompanies() {
    const companyCounts: { [key: string]: number } = {};
    
    this.jobs.forEach(job => {
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
    });

    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTagAnalytics() {
    const tagCounts: { [key: string]: number } = {};
    
    this.jobs.forEach(job => {
      job.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateAverageResponseTime(): number {
    const responseJobs = this.jobs.filter(job => 
      ['screening', 'interview', 'offer', 'rejected'].includes(job.status)
    );

    if (responseJobs.length === 0) return 0;

    const totalDays = responseJobs.reduce((sum, job) => {
      const daysDiff = Math.floor(
        (job.lastUpdated.getTime() - job.appliedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / responseJobs.length);
  }

  generateSampleData() {
    const sampleJobs: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'>[] = [
      {
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        status: 'interview',
        priority: 'high',
        tags: ['React', 'TypeScript', 'Remote'],
        salary: { min: 120000, max: 150000, currency: 'USD' },
        jobPostUrl: 'https://example.com/job1',
        contactInfo: { name: 'John Smith', email: 'john@techcorp.com' },
        notes: 'Great company culture, exciting projects'
      },
      {
        jobTitle: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        status: 'applied',
        priority: 'medium',
        tags: ['Node.js', 'React', 'MongoDB'],
        salary: { min: 90000, max: 120000, currency: 'USD' },
        jobPostUrl: 'https://example.com/job2',
        notes: 'Early stage startup, equity opportunity'
      },
      {
        jobTitle: 'Software Engineer',
        company: 'BigTech Corp',
        location: 'Seattle, WA',
        status: 'offer',
        priority: 'high',
        tags: ['Java', 'AWS', 'Microservices'],
        salary: { min: 140000, max: 180000, currency: 'USD' },
        contactInfo: { name: 'Sarah Johnson', email: 'sarah.j@bigtech.com' },
        notes: 'Excellent benefits, great team'
      }
    ];

    sampleJobs.forEach(job => this.addJob(job));
  }
} 