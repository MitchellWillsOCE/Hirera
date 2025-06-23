import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  Flag,
  Clock,
  Tag,
  FileText,
  Users
} from 'lucide-react';
import { JobApplication } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: JobApplication['status']) => void;
  getStatusColor: (status: JobApplication['status']) => string;
  getPriorityColor: (priority: JobApplication['priority']) => string;
}

export function JobCard({ 
  job, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  getStatusColor, 
  getPriorityColor 
}: JobCardProps) {
  const formatSalary = (job: JobApplication) => {
    // Handle new schema with salaryMin/salaryMax
    if ((job as any).salaryMin || (job as any).salaryMax) {
      const min = (job as any).salaryMin;
      const max = (job as any).salaryMax;
      const currency = (job as any).salaryCurrency || 'USD';
      const symbol = currency === 'USD' ? '$' : currency;
      
      if (min && max) {
        return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
      } else if (min) {
        return `From ${symbol}${min.toLocaleString()}`;
      } else if (max) {
        return `Up to ${symbol}${max.toLocaleString()}`;
      }
    }
    
    // Handle old schema with single salary field
    if (job.salary) {
      const { min, max, currency } = job.salary;
      const symbol = currency === 'USD' ? '$' : currency;
      
      if (min && max) {
        return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
      } else if (min) {
        return `From ${symbol}${min.toLocaleString()}`;
      } else if (max) {
        return `Up to ${symbol}${max.toLocaleString()}`;
      }
    }
    
    return null;
  };

  const statusOptions: JobApplication['status'][] = [
    'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'
  ];

  const getDaysAgo = (date: Date | string | null | undefined) => {
    if (!date) return 0;
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return 0;
    
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusEmoji = (status: JobApplication['status']) => {
    const statusEmojis = {
      applied: '📝',
      screening: '📞',
      interview: '🎤',
      offer: '🎉',
      rejected: '❌',
      withdrawn: '🚫'
    };
    return statusEmojis[status];
  };

  const formatDate = (date: Date | string | null | undefined, formatString: string) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) return 'N/A';
      
      return format(dateObj, formatString);
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}
      transition={{ duration: 0.2 }}
      className="h-full group"
    >
      <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden relative">
        {/* Priority Indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${job.priority === 'high' ? 'bg-red-500' : job.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {job.jobTitle}
              </CardTitle>
              <div className="flex items-center text-slate-600 dark:text-slate-400 mt-1">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="font-medium">{job.company}</span>
              </div>
            </div>
            <Badge className={`${getPriorityColor(job.priority)} text-xs font-medium ml-2 animate-pulse`}>
              <Flag className="h-3 w-3 mr-1" />
              {job.priority}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${getStatusColor(job.status)} hover:opacity-80 cursor-pointer transition-all duration-200 hover:scale-105`}
                >
                  <span className="mr-2">{getStatusEmoji(job.status)}</span>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusUpdate(job.id, status)}
                    className={job.status === status ? 'bg-slate-100 dark:bg-slate-700' : ''}
                  >
                    <span className="mr-2">{getStatusEmoji(status)}</span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="h-3 w-3 mr-1" />
              {getDaysAgo(job.appliedDate)} days ago
            </div>
          </div>

          {/* Salary */}
          {(job.salary || (job as any).salaryMin || (job as any).salaryMax) && formatSalary(job) && (
            <motion.div 
              className="flex items-center text-sm text-slate-700 dark:text-slate-300"
              whileHover={{ scale: 1.05 }}
            >
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              <span className="font-semibold">{formatSalary(job)}</span>
            </motion.div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                <Tag className="h-3 w-3 mr-1" />
                Skills & Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {job.tags.slice(0, 3).map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-100 transition-colors duration-200"
                    >
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
                {job.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(job.contactInfo?.name || job.contactInfo?.email) && (
            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              <div className="font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Contact
              </div>
              {job.contactInfo.name && (
                <div className="flex items-center mt-1">
                  <span className="font-medium">{job.contactInfo.name}</span>
                </div>
              )}
              {job.contactInfo.email && (
                <div className="flex items-center mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="text-xs">{job.contactInfo.email}</span>
                </div>
              )}
              {job.contactInfo.phone && (
                <div className="flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="text-xs">{job.contactInfo.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes Preview */}
          {job.notes && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="font-medium mb-1 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Notes
              </div>
              <p className="line-clamp-2 text-xs bg-slate-50 dark:bg-slate-700/50 p-2 rounded italic">
                "{job.notes}"
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {job.jobPostUrl && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(job.jobPostUrl, '_blank')}
                    className="p-2 h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(job)}
                  className="p-2 h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(job.id)}
                  className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Application Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Applied: {formatDate(job.appliedDate, 'MMM dd, yyyy')}
            </div>
            <div>
              Updated: {formatDate(job.lastUpdated, 'MMM dd')}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 