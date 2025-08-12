'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutGrid, 
  Table, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Settings,
  LogOut,
  Briefcase,
  User as UserIcon,
  Target,
  TrendingUp,
  Trophy,
  Linkedin,
  GitMerge
} from 'lucide-react'
import { JobCard } from '@/components/job-card'
import { JobTable } from '@/components/job-table'
import { FilterPanel } from '@/components/filter-panel'
import { AnalyticsPanel } from '@/components/analytics-panel'
import { JobForm } from '@/components/job-form'
import { Input } from '@/components/ui/input'
import { JobApplication, FilterOptions, SortOptions } from '@/lib/types'
import { GoalSetting } from '@/components/goals/goal-setting'
import { ApplicationTimeline } from '@/components/timeline/application-timeline'
import { JobInsights } from '@/components/job-insights'
import { Leaderboards } from '@/components/leaderboards'
import UserSettings from './user-settings'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getJobs } from '@/services/job-applications.service'

interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
}

interface DashboardAuthenticatedProps {
  user: User
}

interface Goal {
  id: string
  userId: string
  type: string
  target: number
  achieved: number
  period: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function DashboardAuthenticated({ user }: DashboardAuthenticatedProps) {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null)
  
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sort, setSort] = useState<SortOptions>({ field: 'appliedDate', direction: 'desc' })
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    loadJobs()
    loadGoals()
  }, [])

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const data = await getJobs()
      // The new service returns jobId, but the frontend components expect id.
      const formattedJobs = data.map((job: any) => ({
        ...job,
        id: job.jobId, 
      }));
      setJobs(formattedJobs)
    } catch (error) {
      console.error('An error occurred while fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        setGoals(await response.json());
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };
  
  const handleCreateGoal = async (goalData: any) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (response.ok) {
        loadGoals();
      } else {
        console.error('Failed to create goal');
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: string, achieved: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achieved }),
      });
      if (response.ok) {
        loadGoals();
      } else {
        console.error('Failed to update goal');
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };
  
  const handleJobCreate = async (jobData: any) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        loadJobs()
        setShowJobForm(false)
        return { success: true }
      } else {
        const errorData = await response.json();
        console.error('Failed to create job:', errorData)
        return { success: false, errors: errorData.errors }
      }
    } catch (error) {
      console.error('An error occurred during job creation:', error)
      return { success: false, errors: { form: 'An unexpected error occurred.' } }
    }
  }

  const handleJobUpdate = async (jobData: any) => {
    if (!editingJob) return { success: false };
    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        loadJobs()
        setShowJobForm(false)
        setEditingJob(null)
        return { success: true }
      } else {
        const errorData = await response.json();
        console.error('Failed to update job', errorData)
        return { success: false, errors: errorData.errors }
      }
    } catch (error) {
      console.error('An error occurred during job update:', error)
      return { success: false, errors: { form: 'An unexpected error occurred.' } }
    }
  }

  const handleJobDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job application?')) {
      try {
        await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
        loadJobs()
      } catch (error) {
        console.error('Failed to delete job', error)
      }
    }
  }

  const handleStatusUpdate = async (id: string, status: JobApplication['status']) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setJobs(jobs.map(job => (job.id === id ? { ...job, status } : job)));
        loadGoals();
      }
    } catch (error) {
      console.error('Failed to update status', error)
    }
  };

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin');
  }

  const filteredAndSortedJobs = jobs
    .filter(job => {
      const searchTermLower = searchTerm.toLowerCase()
      let passes = true
      if (searchTerm) {
        passes = job.jobTitle.toLowerCase().includes(searchTermLower) ||
                 job.company.toLowerCase().includes(searchTermLower)
      }
      if (filters.status && filters.status.length > 0) {
        passes = passes && filters.status.includes(job.status)
      }
      if (filters.salary && (filters.salary.min || filters.salary.max)) {
        const jobSalary = job.salary ?? 0;
        const minSalary = filters.salary.min ?? 0;
        const maxSalary = filters.salary.max ?? Infinity;
        passes = passes && jobSalary >= minSalary && jobSalary <= maxSalary;
      }
      return passes
    })
    .sort((a, b) => {
      const fieldA = a[sort.field] as any;
      const fieldB = b[sort.field] as any;
      let comparison = 0
      if (fieldA > fieldB) {
        comparison = 1
      } else if (fieldA < fieldB) {
        comparison = -1
      }
      return sort.direction === 'asc' ? comparison : -comparison
    })

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-0">
                Hirera
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Welcome, {user?.name || 'User'}
              </span>
               <Link href="/dashboard/settings" passHref>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6">
            <TabsTrigger value="applications"><LayoutGrid className="w-4 h-4 mr-2"/>Applications</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2"/>Analytics</TabsTrigger>
            <TabsTrigger value="goals"><Target className="w-4 h-4 mr-2"/>Goals</TabsTrigger>
            <TabsTrigger value="timeline"><GitMerge className="w-4 h-4 mr-2"/>Timeline</TabsTrigger>
            <TabsTrigger value="insights"><TrendingUp className="w-4 h-4 mr-2"/>Job Insights</TabsTrigger>
            <TabsTrigger value="leaderboards"><Trophy className="w-4 h-4 mr-2"/>Leaderboards</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={showJobForm ? 'form' : 'tabs'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {showJobForm ? (
                <JobForm 
                  onSubmit={editingJob ? handleJobUpdate : handleJobCreate}
                  onClose={() => { setShowJobForm(false); setEditingJob(null); }}
                  editingJob={editingJob}
                  open={showJobForm}
                />
              ) : (
                <>
                  <TabsContent value="applications">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Job Applications</CardTitle>
                        <CardDescription>
                          Track and manage all your job applications in one place.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                          <div className="relative w-full sm:w-auto sm:flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Search by title or company..." 
                              className="pl-10 w-full"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                             <Button 
                              variant="outline" 
                              className="w-full sm:w-auto"
                              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            >
                              <Filter className="h-4 w-4 mr-2"/>
                              Filters
                              <Badge className="ml-2">
                                {Object.values(filters).filter(f => Array.isArray(f) ? f.length > 0 : !!f).length}
                              </Badge>
                            </Button>
                             <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setView('grid')} 
                                className={view === 'grid' ? 'bg-blue-100 dark:bg-blue-900' : ''}
                              >
                                <LayoutGrid className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setView('table')}
                                className={view === 'table' ? 'bg-blue-100 dark:bg-blue-900' : ''}
                              >
                                <Table className="h-5 w-5" />
                              </Button>
                            </div>
                             <Button className="w-full sm:w-auto" onClick={() => setShowJobForm(true)}>
                              <Plus className="h-4 w-4 mr-2"/> Add Job
                            </Button>
                          </div>
                        </div>
                        
                        <FilterPanel
                          filters={filters}
                          onFiltersChange={setFilters}
                          sortOptions={sort}
                          onSortChange={setSort}
                          searchQuery={searchTerm}
                          onSearchChange={setSearchTerm}
                          jobs={jobs}
                        />

                        {isLoading ? (
                          <div className="text-center py-12">
                            <p>Loading applications...</p>
                          </div>
                        ) : view === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAndSortedJobs.map(job => (
                              <JobCard 
                                key={job.id} 
                                job={job} 
                                onStatusUpdate={handleStatusUpdate}
                                onEdit={handleEditJob}
                                onDelete={handleJobDelete}
                              />
                            ))}
                          </div>
                        ) : (
                          <JobTable 
                            jobs={filteredAndSortedJobs} 
                            onStatusUpdate={handleStatusUpdate}
                            onEdit={handleEditJob}
                            onDelete={handleJobDelete}
                          />
                        )}
                        { !isLoading && filteredAndSortedJobs.length === 0 && (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg mt-6">
                            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No applications found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new job application.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="analytics">
                    <AnalyticsPanel jobs={jobs} />
                  </TabsContent>
                  <TabsContent value="goals">
                    <GoalSetting goals={goals} onCreateGoal={handleCreateGoal} onUpdateGoal={handleUpdateGoal} />
                  </TabsContent>
                  <TabsContent value="timeline">
                    <ApplicationTimeline jobs={jobs} />
                  </TabsContent>
                  <TabsContent value="insights">
                    <JobInsights />
                  </TabsContent>
                  <TabsContent value="leaderboards">
                    <Leaderboards />
                  </TabsContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  )
}