import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobApplication } from '@/lib/types';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  Calendar,
  Building,
  Tag,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsPanelProps {
  jobs: JobApplication[];
}

export function AnalyticsPanel({ jobs }: AnalyticsPanelProps) {
  const analytics = useMemo(() => {
    const totalApplications = jobs.length;
    const applicationsByStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const offersReceived = applicationsByStatus.offer || 0;
    const successRate = totalApplications > 0 ? (offersReceived / totalApplications) * 100 : 0;

    // Calculate average response time
    const respondedJobs = jobs.filter(job => 
      ['screening', 'interview', 'offer', 'rejected'].includes(job.status)
    );
    
    let averageResponseTime = 0;
    if (respondedJobs.length > 0) {
      const totalDays = respondedJobs.reduce((sum, job) => {
        const daysDiff = Math.floor(
          (job.lastUpdated.getTime() - job.appliedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + daysDiff;
      }, 0);
      averageResponseTime = Math.round(totalDays / respondedJobs.length);
    }

    // Top companies
    const topCompanies = Object.entries(
      jobs.reduce((acc, job) => {
        acc[job.company] = (acc[job.company] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tag analytics
    const tagAnalytics = Object.entries(
      jobs.reduce((acc, job) => {
        job.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalApplications,
      applicationsByStatus,
      successRate,
      averageResponseTime,
      topCompanies,
      tagAnalytics
    };
  }, [jobs]);

  const statusColors = {
    applied: 'bg-blue-500',
    screening: 'bg-yellow-500',
    interview: 'bg-purple-500',
    offer: 'bg-green-500',
    rejected: 'bg-red-500',
    withdrawn: 'bg-gray-500'
  };

  const getStatusPercentage = (status: JobApplication['status']) => {
    const total = analytics.totalApplications;
    const count = analytics.applicationsByStatus[status] || 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const calculateResponseRate = () => {
    const responded = jobs.filter(job => 
      ['screening', 'interview', 'offer', 'rejected'].includes(job.status)
    ).length;
    return jobs.length > 0 ? Math.round((responded / jobs.length) * 100) : 0;
  };

  const getAverageSalary = () => {
    const jobsWithSalary = jobs.filter(job => job.salary?.min || job.salary?.max);
    if (jobsWithSalary.length === 0) return null;
    
    const totalSalary = jobsWithSalary.reduce((sum, job) => {
      const min = job.salary?.min || 0;
      const max = job.salary?.max || min;
      return sum + (min + max) / 2;
    }, 0);
    
    return Math.round(totalSalary / jobsWithSalary.length);
  };

  const getMostCommonTags = () => {
    const tagCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      job.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  };

  const averageSalary = getAverageSalary();
  const responseRate = calculateResponseRate();
  const commonTags = getMostCommonTags();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    Total Applications
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {analytics.totalApplications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-green-50 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    Success Rate
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {Math.round(analytics.successRate)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    <span className="hidden sm:inline">Avg Response Time</span>
                    <span className="sm:hidden">Response</span>
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {analytics.averageResponseTime} <span className="text-sm">days</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-orange-50 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    Response Rate
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {responseRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Application Status Distribution</span>
              <span className="sm:hidden">Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics.applicationsByStatus).map(([status, count], index) => {
                const percentage = getStatusPercentage(status as JobApplication['status']);
                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-3 sm:space-x-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize truncate">
                          {status}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 flex-shrink-0 ml-2">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCompanies.slice(0, 6).map((company, index) => (
                  <motion.div
                    key={company.company}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{company.company}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {company.count} {company.count === 1 ? 'application' : 'applications'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {analytics.topCompanies.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No companies yet. Start adding applications!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Common Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Popular Skills & Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonTags.map(([tag, count], index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {count} {count === 1 ? 'job' : 'jobs'}
                    </span>
                  </motion.div>
                ))}
                {commonTags.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No tags yet. Add some to your applications!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {averageSalary && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Average Salary</span>
                  </div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    ${averageSalary.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {jobs.filter(job => {
                    const thisMonth = new Date().getMonth();
                    const jobMonth = job.appliedDate.getMonth();
                    return jobMonth === thisMonth;
                  }).length} applications
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Interview Rate</span>
                </div>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {jobs.length > 0 ? Math.round((jobs.filter(job => 
                    ['interview', 'offer'].includes(job.status)
                  ).length / jobs.length) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Quick Tips
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Track follow-up dates to improve response rates</li>
                <li>• Update your application status regularly for better insights</li>
                <li>• Use tags to organize applications by skills and requirements</li>
                <li>• Review successful applications to identify patterns</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 