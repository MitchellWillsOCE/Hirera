'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
// Dialog imports removed - using custom modal implementation
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JobApplication, JobStatus, Priority } from '@/lib/types'
import { X, Plus, DollarSign, User, Mail, Phone, Link, MapPin, Building, Briefcase } from 'lucide-react'
import { currencies, getCurrencySymbol } from '@/lib/currencies'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const jobFormSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  jobPostUrl: z.string().optional().or(z.literal('')).refine((url) => {
    if (!url) return true;
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
      } else {
        new URL(`https://${url}`);
      }
      return true;
    } catch {
      return false;
    }
  }, "Please enter a valid URL."),
  salary: z.number().optional(),
  salaryCurrency: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  tags: z.array(z.string()).optional(),
})

export type JobFormValues = z.infer<typeof jobFormSchema>

interface JobFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: JobFormValues) => Promise<{ success: boolean; errors?: any }>
  editingJob?: (JobApplication & { tags: { tag: { name: string } }[] }) | null
}

export function JobForm({ open, onClose, onSubmit, editingJob }: JobFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      jobTitle: '',
      company: '',
      location: '',
      jobPostUrl: '',
      salary: undefined,
      salaryCurrency: 'USD',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
      status: JobStatus.APPLIED,
      priority: Priority.MEDIUM,
      tags: [],
    }
  })

  const { reset, setValue, setError, formState: { errors } } = form
  const [tags, setTags] = React.useState<string[]>([])
  const [currentTag, setCurrentTag] = React.useState('')

  useEffect(() => {
    if (open) {
      if (editingJob) {
        const jobTags = editingJob.tags?.map(t => typeof t === 'string' ? t : t.tag.name) || []
        
        // Normalize status and priority from potentially incorrect legacy data
        const normalizedStatus = editingJob.status ? editingJob.status.toUpperCase() as JobStatus : JobStatus.APPLIED;
        const normalizedPriority = editingJob.priority ? editingJob.priority.toUpperCase() as Priority : Priority.MEDIUM;

        reset({
          jobTitle: editingJob.jobTitle,
          company: editingJob.company,
          location: editingJob.location,
          jobPostUrl: editingJob.jobPostUrl || '',
          salary: editingJob.salary || undefined,
          salaryCurrency: editingJob.salaryCurrency || 'USD',
          contactName: editingJob.contactName || '',
          contactEmail: editingJob.contactEmail || '',
          contactPhone: editingJob.contactPhone || '',
          notes: editingJob.notes || '',
          status: normalizedStatus,
          priority: normalizedPriority,
          tags: jobTags,
        })
        setTags(jobTags)
      } else {
        reset({
          jobTitle: '',
          company: '',
          location: '',
          jobPostUrl: '',
          salary: undefined,
          salaryCurrency: 'USD',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          notes: '',
          status: JobStatus.APPLIED,
          priority: Priority.MEDIUM,
          tags: [],
        })
        setTags([])
      }
      setCurrentTag('')
    }
  }, [editingJob, open, reset])
  
  const handleSubmit = async (values: JobFormValues) => {
    const result = await onSubmit({ ...values, tags })
    if (!result.success && result.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(field as keyof JobFormValues, {
          type: 'manual',
          message: message as string,
        })
      }
    }
  }
  
  const addTag = () => {
    const trimmedTag = currentTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag]
      setTags(newTags)
      setValue('tags', newTags)
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const suggestedTags = [
    'Remote', 'Full-time', 'Part-time', 'Contract', 'Freelance',
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Senior', 'Junior', 'Lead'
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.2, 
              ease: "easeOut"
            }}
            className="relative w-[95vw] max-w-none sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border rounded-lg shadow-lg p-3 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left pb-4 sm:pb-6">
              <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold leading-none tracking-tight">
                <Briefcase className="h-5 w-5" />
                {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill in the details for your job application. Required fields are marked with *
              </p>
            </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Job Title *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Senior Frontend Developer" 
                                {...field} 
                                value={field.value || ''} 
                                className={cn(errors.jobTitle && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Company *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Google" 
                                {...field} 
                                value={field.value || ''}
                                className={cn(errors.company && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Location *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. San Francisco, CA" 
                                {...field} 
                                value={field.value || ''} 
                                className={cn(errors.location && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jobPostUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <Link className="h-3 w-3" /> Job Post URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                {...field} 
                                value={field.value || ''} 
                                className={cn(errors.jobPostUrl && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={cn(errors.status && "border-red-500 focus-visible:ring-red-500")}>
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(JobStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Priority *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={cn(errors.priority && "border-red-500 focus-visible:ring-red-500")}>
                                  <SelectValue placeholder="Select a priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(Priority).map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Salary Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Salary</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 120000"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                className={cn("rounded-r-none focus:z-10", errors.salary && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salaryCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Currency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'USD'}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a currency" /></SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {currencies.map(c => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.code} ({getCurrencySymbol(c.code)}) - {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2"><User className="h-3 w-3" />Contact Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Jane Doe" 
                                {...field} 
                                value={field.value || ''} 
                                className={cn(errors.contactName && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2"><Mail className="h-3 w-3" />Contact Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. jane.d@example.com" 
                                {...field} 
                                value={field.value || ''}
                                className={cn(errors.contactEmail && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2"><Phone className="h-3 w-3" />Contact Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. (123) 456-7890" 
                              {...field} 
                              value={field.value || ''}
                              className={cn(errors.contactPhone && "border-red-500 focus-visible:ring-red-500")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-2">
                    <h3 className="text-base sm:text-lg font-semibold">Additional Details</h3>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Notes & Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste job description, add notes about the role, etc."
                              className={`min-h-[120px] ${cn(errors.notes && "border-red-500 focus-visible:ring-red-500")}`}
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Tags</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="Add a tag..."
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className={cn(errors.tags && "border-red-500 focus-visible:ring-red-500")}
                              />
                            </FormControl>
                            <Button type="button" onClick={addTag}>Add</Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingJob ? 'Save Changes' : 'Create Application'}
                    </Button>
                  </div>
                </form>
              </Form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 