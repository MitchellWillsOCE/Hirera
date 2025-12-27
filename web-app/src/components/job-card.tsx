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
import { JobStatus } from '@/generated/prisma';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCountryFlag } from '@/lib/countries';
import { getCurrencySymbol } from '@/lib/currencies';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: JobApplication['status']) => void;
}

export function JobCard({ 
  job, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
}: JobCardProps) {
  const handleStatusChange = (newStatus: JobStatus) => {
    onStatusUpdate(job.id, newStatus);
  };

  const formatUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const statusOptions: JobApplication['status'][] = [
    'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'EMPLOYED'
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

  const getStatusIcon = (status: JobApplication['status']) => {
    const icons = {
      APPLIED: '📝',
      SCREENING: '📞', 
      INTERVIEW: '🎤',
      OFFER: '🎉',
      REJECTED: '❌',
      WITHDRAWN: '🚫',
      EMPLOYED: '💼'
    }
    return icons[status] || '📝'
  }

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
        <div className={`absolute top-0 left-0 w-full h-1 ${job.priority === 'HIGH' ? 'bg-red-500' : job.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} />
        
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
            <Badge className={`text-xs font-medium ml-2 ${job.priority === 'HIGH' ? 'bg-red-100 text-red-800' : job.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
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
            <Select value={job.status} onValueChange={(value) => onStatusUpdate(job.id, value as JobApplication['status'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPLIED">📝 Applied</SelectItem>
                <SelectItem value="SCREENING">📞 Screening</SelectItem>
                <SelectItem value="INTERVIEW">🎤 Interview</SelectItem>
                <SelectItem value="OFFER">🎉 Offer</SelectItem>
                <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                <SelectItem value="WITHDRAWN">🚫 Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="h-3 w-3 mr-1" />
              {getDaysAgo(job.appliedDate)} days ago
            </div>
          </div>

          {/* Salary */}
          {typeof job.salary === 'number' && (
            <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              <span className="font-semibold">
                {getCurrencySymbol(job.salaryCurrency || 'USD')}{job.salary.toLocaleString()}
              </span>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                <Tag className="h-3 w-3 mr-1" />
                Skills & Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {job.tags.slice(0, 3).map((tagObj, index) => (
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
                      {tagObj.tag.name}
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
          {(job.contactName || job.contactEmail) && (
            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              <div className="font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Contact
              </div>
              {job.contactName && (
                <div className="flex items-center mt-1">
                  <span className="font-medium">{job.contactName}</span>
                </div>
              )}
              {job.contactEmail && (
                <div className="flex items-center mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="text-xs">{job.contactEmail}</span>
                </div>
              )}
              {job.contactPhone && (
                <div className="flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="text-xs">{job.contactPhone}</span>
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

          <div className="flex justify-between items-center pt-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(job);
                }}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              {job.jobPostUrl && (
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <a href={formatUrl(job.jobPostUrl)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-3 w-3 mr-1" /> View Post
                  </a>
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(job.id);
                  }}
                >
                  Confirm Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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