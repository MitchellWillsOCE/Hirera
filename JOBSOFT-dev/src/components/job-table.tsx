'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { JobApplication, JobStatus } from '@/lib/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrencySymbol } from '@/lib/currencies';

interface JobTableProps {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: JobApplication['status']) => void;
}

export function JobTable({
  jobs,
  onEdit,
  onDelete,
  onStatusUpdate,
}: JobTableProps) {
  const handleStatusChange = (job: JobApplication, newStatus: JobStatus) => {
    onStatusUpdate(job.id, newStatus);
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Job Title
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Company
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Location
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Status
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Priority
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Applied Date
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Salary
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {jobs.map((job, index) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {job.jobTitle}
                      </div>
                      {job.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {job.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {job.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-slate-100 font-medium">
                      {job.company}
                    </div>
                    {job.contactInfo?.name && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Contact: {job.contactInfo.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-300">
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Select value={job.status} onValueChange={(value) => handleStatusChange(job, value as JobStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="SCREENING">Screening</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        <SelectItem value="EMPLOYED">Employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                    >
                      {job.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      {new Date(job.appliedDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Updated: {new Date(job.lastUpdated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {job.salary ? (
                        <span className="text-green-600 dark:text-green-400">
                          {getCurrencySymbol(job.salaryCurrency || 'USD')}{job.salary.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {job.jobPostUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(job.jobPostUrl, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(job)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(job.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {jobs.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-slate-500 dark:text-slate-400">
              No job applications to display
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 