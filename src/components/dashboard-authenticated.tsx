'use client'

import React, { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { User } from 'next-auth'
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
  User as UserIcon
} from 'lucide-react'
import { JobCard } from '@/components/job-card'
import { JobTable } from '@/components/job-table'
import { FilterPanel } from '@/components/filter-panel'
import { AnalyticsPanel } from '@/components/analytics-panel'
import { TemplateManager } from '@/components/template-manager'
import { JobForm } from '@/components/job-form'
import { Input } from '@/components/ui/input'
import { JobApplication, FilterOptions, SortOptions } from '@/lib/types'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null)
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'lastUpdated', direction: 'desc' })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadJobs()
  }, [])

  // Apply search and filters
  useEffect(() => {
    let filtered = [...jobs]
    
    if (searchQuery) {
      filtered = filtered.filter((job) =>
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    if (filters.status?.length) {
      filtered = filtered.filter((job) => filters.status!.includes(job.status))
    }
    
    if (filters.priority?.length) {
      filtered = filtered.filter((job) => filters.priority!.includes(job.priority))
    }
    
    if (filters.company) {
      filtered = filtered.filter((job) => 
        job.company.toLowerCase().includes(filters.company!.toLowerCase())
      )
    }
    
    if (filters.tags?.length) {
      filtered = filtered.filter((job) => 
        job.tags.some((tag) => filters.tags!.includes(tag))
      )
    }
    
    setFilteredJobs(filtered)
  }, [searchQuery, jobs, filters])

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const jobsData = await response.json()
      setJobs(jobsData)
      setFilteredJobs(jobsData)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSubmit = async (jobData: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'>) => {
    try {
      if (editingJob) {
        // Update existing job
        const response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        })
        if (!response.ok) {
          throw new Error('Failed to update job')
        }
      } else {
        // Create new job
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        })
        if (!response.ok) {
          throw new Error('Failed to create job')
        }
      }
      setShowJobForm(false)
      setEditingJob(null)
      loadJobs()
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleDeleteJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete job')
      }
      loadJobs()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">💼 JobTracker Pro</h1>
                <p className="text-xs text-slate-600 hidden sm:block">Manage Your Career Journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <UserIcon className="h-4 w-4" />
                <span className="truncate max-w-32">Welcome, {user.firstName || user.username}!</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 px-2 sm:h-9 sm:px-3">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs defaultValue="jobs" className="space-y-4 sm:space-y-6">
          {/* Mobile-optimized tab navigation */}
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-full sm:min-w-0 sm:w-auto sm:mx-auto">
              <TabsTrigger value="jobs" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-[60px] sm:min-w-[80px]">
                Jobs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-[60px] sm:min-w-[80px]">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="templates" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-[60px] sm:min-w-[80px]">
                Templates
              </TabsTrigger>
              <TabsTrigger value="settings" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-[60px] sm:min-w-[80px]">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
            {/* Job Management Controls */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 sm:items-center">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-base sm:text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="whitespace-nowrap h-10 px-4 sm:h-9 sm:px-3"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Cards</span>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  >
                    <Table className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Table</span>
                  </Button>
                </div>
                <Button onClick={() => setShowJobForm(true)} className="whitespace-nowrap h-10 px-4 sm:h-9 sm:px-3">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Add Job</span>
                  <span className="xs:hidden">Add</span>
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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                jobs={jobs}
              />
            )}

            {/* Jobs Display */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading jobs...</p>
              </div>
            ) : (
              <>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {filteredJobs.length === 0 ? (
                      <Card className="col-span-full">
                        <CardContent className="text-center py-6 sm:py-8">
                          <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold text-slate-600 mb-2">No jobs found</h3>
                          <p className="text-sm text-slate-500 mb-4 px-4">
                            {searchQuery || showFilters ? 'No jobs match your criteria' : 'Get started by adding your first job application'}
                          </p>
                          <Button onClick={() => setShowJobForm(true)} className="h-10 px-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Job
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onEdit={handleEditJob}
                          onDelete={handleDeleteJob}
                          onStatusUpdate={handleStatusUpdate}
                          getStatusColor={getStatusColor}
                          getPriorityColor={getPriorityColor}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="min-w-[640px] px-3 sm:px-0">
                      <JobTable
                        jobs={filteredJobs}
                        onEdit={handleEditJob}
                        onDelete={handleDeleteJob}
                        onStatusUpdate={handleStatusUpdate}
                        sortOptions={sortOptions}
                        onSortChange={setSortOptions}
                        getStatusColor={getStatusColor}
                        getPriorityColor={getPriorityColor}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel jobs={jobs} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your account preferences and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <p className="text-slate-600 text-sm sm:text-base break-all">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Username</label>
                    <p className="text-slate-600 text-sm sm:text-base">{user.username}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <p className="text-slate-600 text-sm sm:text-base">{user.firstName || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <p className="text-slate-600 text-sm sm:text-base">{user.lastName || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
                  <Button variant="outline" className="w-full sm:w-auto h-10 px-4">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto h-10 px-4">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          open={showJobForm}
          onClose={() => {
            setShowJobForm(false)
            setEditingJob(null)
          }}
          onSubmit={handleJobSubmit}
          editingJob={editingJob}
        />
      )}
    </div>
  )
} 