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
  Activity,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { RadialChart, MultiRadialChart } from '@/components/ui/radial-chart';

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
    const interviewsReceived = applicationsByStatus.interview || 0;
    const successRate = totalApplications > 0 ? (offersReceived / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviewsReceived / totalApplications) * 100 : 0;

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

    // Response rate (replied in any way)
    const responseRate = totalApplications > 0 ? (respondedJobs.length / totalApplications) * 100 : 0;

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
      interviewRate,
      responseRate,
      averageResponseTime,
      topCompanies,
      tagAnalytics,
      offersReceived,
      interviewsReceived
    };
  }, [jobs]);

  const statusColors = {
    applied: '#3b82f6', // blue
    screening: '#f59e0b', // yellow
    interview: '#8b5cf6', // purple
    offer: '#10b981', // green
    rejected: '#ef4444', // red
    withdrawn: '#6b7280' // gray
  };

  const getStatusPercentage = (status: JobApplication['status']) => {
    const total = analytics.totalApplications;
    const count = analytics.applicationsByStatus[status] || 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
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
  const commonTags = getMostCommonTags();

  // Prepare data for multi-radial chart
  const statusChartData = Object.entries(analytics.applicationsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
    maxValue: analytics.totalApplications,
    color: statusColors[status as keyof typeof statusColors]
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview with Radial Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Success Rate Chart */}
              <div className="flex flex-col items-center space-y-4">
                <RadialChart
                  value={analytics.successRate}
                  maxValue={100}
                  size={120}
                  strokeWidth={10}
                  color="#10b981"
                  centerContent={
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {analytics.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Success</div>
                    </div>
                  }
                />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Success Rate</h3>
                  <p className="text-sm text-gray-600">{analytics.offersReceived} offers received</p>
                </div>
              </div>

              {/* Response Rate Chart */}
              <div className="flex flex-col items-center space-y-4">
                <RadialChart
                  value={analytics.responseRate}
                  maxValue={100}
                  size={120}
                  strokeWidth={10}
                  color="#f59e0b"
                  centerContent={
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {analytics.responseRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Response</div>
                    </div>
                  }
                />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Response Rate</h3>
                  <p className="text-sm text-gray-600">Companies that responded</p>
                </div>
              </div>

              {/* Interview Rate Chart */}
              <div className="flex flex-col items-center space-y-4">
                <RadialChart
                  value={analytics.interviewRate}
                  maxValue={100}
                  size={120}
                  strokeWidth={10}
                  color="#8b5cf6"
                  centerContent={
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {analytics.interviewRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Interview</div>
                    </div>
                  }
                />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Interview Rate</h3>
                  <p className="text-sm text-gray-600">{analytics.interviewsReceived} interviews</p>
                </div>
              </div>

              {/* Multi-Status Distribution */}
              <div className="flex flex-col items-center space-y-4">
                <MultiRadialChart data={statusChartData.slice(0, 3)} size={120} />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Status Distribution</h3>
                  <p className="text-sm text-gray-600">{analytics.totalApplications} total applications</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalApplications}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
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
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.averageResponseTime} <span className="text-sm text-gray-600">days</span>
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
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
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies Applied</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.topCompanies.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-orange-600" />
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
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skills Tagged</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.tagAnalytics.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Status Distribution with Individual Radial Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Application Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analytics.applicationsByStatus).map(([status, count], index) => {
                const percentage = getStatusPercentage(status as JobApplication['status']);
                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <RadialChart
                      value={count}
                      maxValue={analytics.totalApplications}
                      size={80}
                      strokeWidth={8}
                      color={statusColors[status as keyof typeof statusColors]}
                      centerContent={
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900">{count}</div>
                        </div>
                      }
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 capitalize">{status}</p>
                      <p className="text-xs text-gray-600">{percentage}%</p>
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCompanies.slice(0, 6).map((company, index) => (
                  <motion.div
                    key={company.company}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{company.company}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {company.count} apps
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {analytics.topCompanies.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No companies yet. Start adding applications!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Skills & Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Popular Skills & Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {commonTags.map(([tag, count], index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <Badge variant="outline" className="font-medium">
                      {tag}
                    </Badge>
                    <span className="text-sm text-gray-600 font-medium">
                      {count} {count === 1 ? 'job' : 'jobs'}
                    </span>
                  </motion.div>
                ))}
                {commonTags.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No tags yet. Add some to your applications!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Success Metrics</h4>
                </div>
                <p className="text-sm text-green-700">
                  {analytics.successRate > 10 ? 
                    "Great success rate! Keep applying to similar roles." :
                    "Focus on tailoring applications to improve success rate."
                  }
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Activity Level</h4>
                </div>
                <p className="text-sm text-blue-700">
                  {analytics.totalApplications > 20 ? 
                    "Excellent application volume! Maintain consistency." :
                    "Consider increasing application frequency for better results."
                  }
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Response Time</h4>
                </div>
                <p className="text-sm text-purple-700">
                  {analytics.averageResponseTime < 14 ? 
                    "Companies are responding quickly to your applications!" :
                    "Response times are normal. Stay patient and persistent."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 