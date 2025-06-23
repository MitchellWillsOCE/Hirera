'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Users, 
  Calendar,
  ExternalLink,
  BarChart3,
  PieChart,
  Target,
  Star,
  Building,
  Code,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

interface JobInsight {
  id: string
  title: string
  company: string
  location: string
  salaryRange?: string
  description: string
  skills: string[]
  source: string
  url?: string
  postedDate: string
}

interface MarketTrend {
  skill: string
  demand: number
  growth: string
  averageSalary: number
  jobCount: number
}

interface JobMarketData {
  insights: JobInsight[]
  trends: MarketTrend[]
  salaryBenchmarks: {
    role: string
    location: string
    min: number
    max: number
    median: number
  }[]
  summary: {
    totalJobs: number
    averageSalary: number
    topSkills: string[]
    hotCompanies: string[]
  }
}

export function JobInsights() {
  const [marketData, setMarketData] = useState<JobMarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('software engineer')
  const [location, setLocation] = useState('remote')
  const [experience, setExperience] = useState('mid')

  const fetchJobInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/job-insights?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&experience=${experience}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch job insights')
      }
      
      const data = await response.json()
      setMarketData(data)
    } catch (error) {
      console.error('Error fetching job insights:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobInsights()
  }, [])

  const getGrowthColor = (growth: string) => {
    if (growth.startsWith('+')) return 'text-green-600'
    if (growth.startsWith('-')) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDemandLevel = (demand: number) => {
    if (demand >= 90) return { level: 'Very High', color: 'bg-red-500' }
    if (demand >= 70) return { level: 'High', color: 'bg-orange-500' }
    if (demand >= 50) return { level: 'Medium', color: 'bg-yellow-500' }
    return { level: 'Low', color: 'bg-gray-500' }
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Job Market Insights</h2>
        </div>
      </div>

      {/* Search Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Job Title</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="san francisco">San Francisco, CA</SelectItem>
                  <SelectItem value="new york">New York, NY</SelectItem>
                  <SelectItem value="seattle">Seattle, WA</SelectItem>
                  <SelectItem value="austin">Austin, TX</SelectItem>
                  <SelectItem value="london">London, UK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchJobInsights} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      )}

      {marketData && !loading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg mr-4">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {marketData.summary.totalJobs.toLocaleString()}
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-3 rounded-lg mr-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatSalary(marketData.summary.averageSalary)}
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-50 p-3 rounded-lg mr-4">
                      <Code className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Top Skill</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {marketData.summary.topSkills[0]}
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-orange-50 p-3 rounded-lg mr-4">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hot Company</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {marketData.summary.hotCompanies[0]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Skill Demand & Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketData.trends.map((trend, index) => (
                    <motion.div
                      key={trend.skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{trend.skill}</h3>
                        <div className="flex items-center space-x-2">
                          {trend.growth.startsWith('+') ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> : 
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          }
                          <span className={`text-sm font-medium ${getGrowthColor(trend.growth)}`}>
                            {trend.growth}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Demand Level</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getDemandLevel(trend.demand).color}`} />
                            <span className="text-sm">{getDemandLevel(trend.demand).level}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Salary</span>
                          <span className="text-sm font-medium">{formatSalary(trend.averageSalary)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Job Count</span>
                          <span className="text-sm">{trend.jobCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Salary Benchmarks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Salary Benchmarks for {location}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.salaryBenchmarks.map((benchmark, index) => (
                    <motion.div
                      key={benchmark.role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{benchmark.role}</h3>
                        <p className="text-sm text-gray-600">{benchmark.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatSalary(benchmark.median)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatSalary(benchmark.min)} - {formatSalary(benchmark.max)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recent Job Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.insights.slice(0, 8).map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-blue-600 font-medium">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">{job.source}</Badge>
                          {job.salaryRange && (
                            <p className="text-sm text-green-600 font-medium">{job.salaryRange}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(job.postedDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      {job.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            View Job <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
} 