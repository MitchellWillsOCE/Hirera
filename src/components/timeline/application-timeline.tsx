'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Building, User, MapPin, DollarSign, Filter, ZoomIn, ZoomOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { JobApplication } from '@/lib/types'
import { getCurrencySymbol } from '@/lib/currencies'

interface TimelineProps {
  jobs: JobApplication[]
}

interface TimelineEvent {
  id: string
  date: Date
  type: 'application' | 'update' | 'interview' | 'offer' | 'rejection'
  job: JobApplication
  title: string
  description: string
}

export function ApplicationTimeline({ jobs }: TimelineProps) {
  const [filter, setFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('3months')
  const [zoom, setZoom] = useState<number>(1)

  // Generate timeline events from job applications
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []

    jobs.forEach(job => {
      // Ensure dates are Date objects
      const appliedDate = new Date(job.appliedDate);
      const lastUpdated = new Date(job.lastUpdated);

      // Add application event
      events.push({
        id: `${job.id}-applied`,
        date: appliedDate,
        type: 'application',
        job,
        title: `Applied to ${job.company}`,
        description: `${job.jobTitle} at ${job.company}`
      })

      // Add status update events based on current status
      if (job.status !== 'APPLIED') {
        const statusDate = lastUpdated
        let eventType: TimelineEvent['type'] = 'update'
        let title = ''
        let description = ''

        switch (job.status) {
          case 'SCREENING':
            eventType = 'update'
            title = 'Screening Stage'
            description = `Moved to screening for ${job.jobTitle}`
            break
          case 'INTERVIEW':
            eventType = 'interview'
            title = 'Interview Scheduled'
            description = `Interview for ${job.jobTitle} at ${job.company}`
            break
          case 'OFFER':
            eventType = 'offer'
            title = 'Job Offer Received!'
            description = `Received offer for ${job.jobTitle}`
            break
          case 'REJECTED':
            eventType = 'rejection'
            title = 'Application Declined'
            description = `${job.company} declined application`
            break
          case 'WITHDRAWN':
            eventType = 'update'
            title = 'Application Withdrawn'
            description = `Withdrew application for ${job.jobTitle}`
            break
          case 'EMPLOYED':
            eventType = 'offer'
            title = "You're Hired!"
            description = `Started a new role at ${job.company}`
            break
        }

        events.push({
          id: `${job.id}-${job.status}`,
          date: statusDate,
          type: eventType,
          job,
          title,
          description
        })
      }
    })

    return events.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [jobs])

  // Filter events based on time range
  const filteredEvents = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date()

    switch (timeRange) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        cutoffDate = new Date(0)
        break
    }

    let filtered = timelineEvents.filter(event => event.date >= cutoffDate)

    if (filter !== 'all') {
      filtered = filtered.filter(event => event.type === filter)
    }

    return filtered
  }, [timelineEvents, timeRange, filter])

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'application': return '📝'
      case 'interview': return '🎤'
      case 'offer': return '🎉'
      case 'rejection': return '❌'
      case 'update': return '📋'
      default: return '📅'
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'application': return 'from-blue-500 to-blue-600'
      case 'interview': return 'from-purple-500 to-purple-600'
      case 'offer': return 'from-green-500 to-green-600'
      case 'rejection': return 'from-red-500 to-red-600'
      case 'update': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'screening': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'offer': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getPriorityColorClass = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500'
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Application Timeline</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="application">Applications</SelectItem>
              <SelectItem value="interview">Interviews</SelectItem>
              <SelectItem value="offer">Offers</SelectItem>
              <SelectItem value="rejection">Rejections</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {filteredEvents.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h3>
              <p className="text-gray-500 text-center">
                No timeline events match your current filters. Try adjusting the time range or filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative flex items-start space-x-4"
              >
                {/* Timeline Line */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                )}

                {/* Event Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${getEventColor(event.type)} flex items-center justify-center shadow-lg`}>
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                </div>

                {/* Event Content */}
                <Card className="flex-1 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        
                        {/* Job Details */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{event.job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.job.location}</span>
                          </div>
                          {event.job.salary && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                {typeof event.job.salary === 'number' 
                                  ? `${getCurrencySymbol(event.job.salaryCurrency || 'USD')}${event.job.salary}k` 
                                  : event.job.salary}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <Badge className={`mb-2 ${getStatusColor(event.job.status)}`}>
                          {event.job.status.charAt(0).toUpperCase() + event.job.status.slice(1)}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{getRelativeTime(event.date)}</span>
                          </div>
                          <div className="mt-1">{formatDate(event.date)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Priority Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColorClass(event.job.priority)}`} />
                        <span className="text-xs text-gray-500 capitalize">{event.job.priority} Priority</span>
                      </div>

                      {/* Tags */}
                      {event.job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.job.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {event.job.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              +{event.job.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredEvents.filter(e => e.type === 'application').length}
              </div>
              <div className="text-sm text-gray-600">Applications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredEvents.filter(e => e.type === 'interview').length}
              </div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredEvents.filter(e => e.type === 'offer').length}
              </div>
              <div className="text-sm text-gray-600">Offers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredEvents.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 