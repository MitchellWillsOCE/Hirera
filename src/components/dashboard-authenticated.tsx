'use client'

import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { User } from 'next-auth'
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
  FileText, 
  Settings,
  LogOut,
  Briefcase,
  User as UserIcon,
  Target,
  TrendingUp,
  Trophy,
  Linkedin
} from 'lucide-react'
import { JobCard } from '@/components/job-card'
import { JobTable } from '@/components/job-table'
import { FilterPanel } from '@/components/filter-panel'
import { AnalyticsPanel } from '@/components/analytics-panel'
import { TemplateManager } from '@/components/template-manager'
import { JobForm } from '@/components/job-form'
import { Input } from '@/components/ui/input'
import { JobApplication, FilterOptions, SortOptions } from '@/lib/types'
import { GoalSetting } from '@/components/goals/goal-setting'
import { ApplicationTimeline } from '@/components/timeline/application-timeline'
import { JobInsights } from '@/components/job-insights'
import { LinkedInIntegration } from '@/components/linkedin-integration'
import { Leaderboards } from '@/components/leaderboards'

interface DashboardProps {
  user: User
}

interface Goal {
  id: string
  type: string
  target: number
  achieved: number
  period: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export function Dashboard({ user }: DashboardProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [activeTab, setActiveTab] = useState('jobs')
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'lastUpdated', direction: 'desc' })
  const [filters, setFilters] = useState<FilterOptions>({})

  // Load initial data
  useEffect(() => {
    loadJobs()
    loadGoals()
  }, [])

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
        setFilteredJobs(data)
      }
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
  }

  const handleCreateGoal = async (goalData: any) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })
      
      if (response.ok) {
        const newGoal = await response.json()
        setGoals(prev => [...prev, newGoal])
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleUpdateGoal = async (goalId: string, achieved: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achieved }),
      })
      
      if (response.ok) {
        const updatedGoal = await response.json()
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ))
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleJobCreate = async (jobData: any) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        const newJob = await response.json()
        setJobs(prev => [newJob, ...prev])
        setFilteredJobs(prev => [newJob, ...prev])
        setShowJobForm(false)
      }
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  const handleJobUpdate = async (jobData: any) => {
    if (!editingJob) return

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        const updatedJob = await response.json()
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setFilteredJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setEditingJob(null)
        setShowJobForm(false)
      }
    } catch (error) {
      console.error('Failed to update job:', error)
    }
  }

  const handleJobDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId))
        setFilteredJobs(prev => prev.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const handleStatusUpdate = async (id: string, status: JobApplication['status']) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      loadJobs()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: JobApplication['status']) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: JobApplication['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  // Apply filters and search
  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-3 sm:space-x-4 hover:opacity-80 transition-opacity">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">💼 JobTracker Pro</h1>
                  <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Professional Job Application Management</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center gap-2 min-w-0">
                <UserIcon className="h-4 w-4 text-slate-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 max-w-[80px] sm:max-w-none truncate">
                  {user.name || user.username}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-8 sm:h-9 px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2 hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {/* Job Management Controls */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 sm:h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 sm:h-10 px-2 sm:px-3"
                >
                  <Filter className="h-4 w-4" />
                  <span className="ml-1 sm:ml-2 hidden sm:inline">Filters</span>
                </Button>

                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-8 px-2 sm:px-3"
                  >
                    <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => setShowJobForm(true)}
                  className="h-9 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-1 sm:ml-2 hidden sm:inline">Add Job</span>
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                sortOptions={sortOptions}
                onSortChange={setSortOptions}
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                jobs={jobs}
              />
            )}

            {/* Job List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onEdit={(job) => {
                          setEditingJob(job)
                          setShowJobForm(true)
                        }}
                        onDelete={(id) => handleJobDelete(id)}
                        onStatusUpdate={(id, status) => handleStatusUpdate(id, status)}
                        getStatusColor={getStatusColor}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                ) : (
                  <JobTable
                    jobs={filteredJobs}
                    onEdit={(job) => {
                      setEditingJob(job)
                      setShowJobForm(true)
                    }}
                    onDelete={(id) => handleJobDelete(id)}
                    onStatusUpdate={(id, status) => handleStatusUpdate(id, status)}
                    sortOptions={sortOptions}
                    onSortChange={setSortOptions}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                )}

                {filteredJobs.length === 0 && (
                  <Card className="border-dashed border-2 border-slate-300">
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                      <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">
                        {searchTerm ? 'No matching jobs found' : 'No job applications yet'}
                      </h3>
                      <p className="text-slate-500 text-center mb-4 max-w-md text-sm sm:text-base">
                        {searchTerm
                          ? 'Try adjusting your search terms or clearing filters'
                          : 'Start tracking your job applications to see your progress and analytics'
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowJobForm(true)} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Job
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalSetting
              goals={goals}
              onCreateGoal={handleCreateGoal}
              onUpdateGoal={handleUpdateGoal}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <ApplicationTimeline jobs={jobs} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsPanel jobs={jobs} />
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards">
            <Leaderboards />
          </TabsContent>

          {/* Job Insights Tab */}
          <TabsContent value="insights">
            <JobInsights />
          </TabsContent>

          {/* LinkedIn Integration Tab */}
          <TabsContent value="linkedin">
            <LinkedInIntegration />
          </TabsContent>
        </Tabs>
      </main>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          open={showJobForm}
          onClose={() => {
            setShowJobForm(false)
            setEditingJob(null)
          }}
          onSubmit={editingJob ? handleJobUpdate : handleJobCreate}
          editingJob={editingJob}
        />
      )}
    </div>
  )
} 