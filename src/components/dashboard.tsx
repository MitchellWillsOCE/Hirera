'use client';

// Hot reload test - this comment should trigger an automatic page refresh
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Grid3X3, Table2, Filter, Download, Upload, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { JobApplication, ViewMode, FilterOptions, SortOptions } from '@/lib/types';
import { DataStore } from '@/lib/data-store';
import { JobCard } from './job-card';
import { JobTable } from './job-table';
import { JobForm } from './job-form';
import { FilterPanel } from './filter-panel';
import { AnalyticsPanel } from './analytics-panel';
import { TemplateManager } from './template-manager';

export function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'lastUpdated',
    direction: 'desc',
  });
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const dataStore = DataStore.getInstance();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, filters, sortOptions, searchQuery]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const allJobs = dataStore.getAllJobs();
      
      // Generate sample data if no jobs exist
      if (allJobs.length === 0) {
        dataStore.generateSampleData();
        setJobs(dataStore.getAllJobs());
      } else {
        setJobs(allJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = dataStore.filterJobs(filters);
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    const sorted = dataStore.sortJobs(filtered, sortOptions);
    setFilteredJobs(sorted);
  };

  const handleJobSubmit = (jobData: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'>) => {
    if (editingJob) {
      dataStore.updateJob(editingJob.id, jobData);
    } else {
      dataStore.addJob(jobData);
    }
    loadJobs();
    setShowJobForm(false);
    setEditingJob(null);
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      dataStore.deleteJob(id);
      loadJobs();
    }
  };

  const handleStatusUpdate = (id: string, status: JobApplication['status']) => {
    dataStore.updateJob(id, { status });
    loadJobs();
  };

  const getStatusColor = (status: JobApplication['status']) => {
    const statusColors = {
      applied: 'bg-blue-100 text-blue-800 border-blue-200',
      screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      interview: 'bg-purple-100 text-purple-800 border-purple-200',
      offer: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusColors[status];
  };

  const getPriorityColor = (priority: JobApplication['priority']) => {
    const priorityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return priorityColors[priority];
  };

  const getQuickStats = () => {
    const analytics = dataStore.getAnalytics();
    return [
      {
        title: 'Total Applications',
        value: analytics.totalApplications,
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Active Applications',
        value: jobs.filter(job => ['applied', 'screening', 'interview'].includes(job.status)).length,
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Offers Received',
        value: analytics.applicationsByStatus.offer || 0,
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Success Rate',
        value: `${Math.round(analytics.successRate)}%`,
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                💼 JobTracker Pro
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your job applications efficiently and track your progress
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {getQuickStats().map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 max-w-md">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            {/* View Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="h-4 w-4" />
                  <Switch
                    checked={viewMode === 'table'}
                    onCheckedChange={(checked) => setViewMode(checked ? 'table' : 'card')}
                  />
                  <Table2 className="h-4 w-4" />
                  <Label className="text-sm font-medium">
                    {viewMode === 'card' ? 'Card View' : 'Table View'}
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {filteredJobs.length} of {jobs.length} applications
                </Badge>
              </div>
            </motion.div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    sortOptions={sortOptions}
                    onSortChange={setSortOptions}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    jobs={jobs}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Job Applications */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {filteredJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No applications found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Try adjusting your filters or add your first job application
                  </p>
                  <Button onClick={() => setShowJobForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Application
                  </Button>
                </motion.div>
              ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <JobCard
                          job={job}
                          onEdit={handleEditJob}
                          onDelete={handleDeleteJob}
                          onStatusUpdate={handleStatusUpdate}
                          getStatusColor={getStatusColor}
                          getPriorityColor={getPriorityColor}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel jobs={jobs} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
        </Tabs>

        {/* Job Form Dialog */}
        <JobForm
          open={showJobForm}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSubmit={handleJobSubmit}
          editingJob={editingJob}
        />
      </div>
    </div>
  );
} 