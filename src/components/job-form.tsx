import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobApplication } from '@/lib/types';
import { X, Plus, DollarSign, User, Mail, Phone, Link, MapPin, Building, Briefcase, Flag } from 'lucide-react';

const jobFormSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  jobPostUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  salaryMin: z.number().min(0, 'Salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Salary must be positive').optional(),
  salaryCurrency: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  tags: z.array(z.string()).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'>) => void;
  editingJob?: JobApplication | null;
}

export function JobForm({ open, onClose, onSubmit, editingJob }: JobFormProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      jobTitle: '',
      company: '',
      location: '',
      jobPostUrl: '',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: 'USD',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
      status: 'APPLIED',
      priority: 'MEDIUM',
      tags: [],
    },
  });

  const [tags, setTags] = React.useState<string[]>([]);
  const [currentTag, setCurrentTag] = React.useState('');

  useEffect(() => {
    if (editingJob) {
      form.reset({
        jobTitle: editingJob.jobTitle,
        company: editingJob.company,
        location: editingJob.location,
        jobPostUrl: editingJob.jobPostUrl || '',
        salaryMin: editingJob.salary?.min,
        salaryMax: editingJob.salary?.max,
        salaryCurrency: editingJob.salary?.currency || 'USD',
        contactName: editingJob.contactInfo?.name || '',
        contactEmail: editingJob.contactInfo?.email || '',
        contactPhone: editingJob.contactInfo?.phone || '',
        notes: editingJob.notes || '',
        status: editingJob.status,
        priority: editingJob.priority,
        tags: editingJob.tags,
      });
      setTags(editingJob.tags);
    } else {
      form.reset();
      setTags([]);
      setCurrentTag('');
    }
  }, [editingJob, form, open]);

  const handleSubmit = (values: JobFormValues) => {
    const formattedData: Omit<JobApplication, 'id' | 'appliedDate' | 'lastUpdated'> = {
      jobTitle: values.jobTitle,
      company: values.company,
      location: values.location,
      jobPostUrl: values.jobPostUrl || undefined,
      salary: values.salaryMin || values.salaryMax ? {
        min: values.salaryMin,
        max: values.salaryMax,
        currency: values.salaryCurrency || 'USD',
      } : undefined,
      contactInfo: values.contactName || values.contactEmail || values.contactPhone ? {
        name: values.contactName || undefined,
        email: values.contactEmail || undefined,
        phone: values.contactPhone || undefined,
      } : undefined,
      notes: values.notes || undefined,
      status: values.status,
      priority: values.priority,
      tags: values.tags || [],
    };

    onSubmit(formattedData);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const suggestedTags = [
    'Remote', 'Full-time', 'Part-time', 'Contract', 'Freelance',
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
    'Senior', 'Junior', 'Lead', 'Manager', 'Director'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="h-5 w-5" />
            {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Fill in the details for your job application. Required fields are marked with *
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
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
                        <Input placeholder="e.g. Senior Frontend Developer" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
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
                        <Input placeholder="e.g. Google" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
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
                        <MapPin className="h-3 w-3" />
                        Location *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
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
                        <Link className="h-3 w-3" />
                        Job Post URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
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
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="APPLIED">📝 Applied</SelectItem>
                          <SelectItem value="SCREENING">📞 Screening</SelectItem>
                          <SelectItem value="INTERVIEW">🎤 Interview</SelectItem>
                          <SelectItem value="OFFER">🎉 Offer</SelectItem>
                          <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                          <SelectItem value="WITHDRAWN">🚫 Withdrawn</SelectItem>
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
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Flag className="h-3 w-3" />
                        Priority
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">🟢 Low</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                          <SelectItem value="HIGH">🔴 High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salary Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Minimum Salary</FormLabel>
                      <FormControl>
                        <Input placeholder="80000" type="number" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Maximum Salary</FormLabel>
                      <FormControl>
                        <Input placeholder="120000" type="number" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Contact Email
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="john@company.com" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Contact Phone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" className="h-12 sm:h-10 text-base sm:text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Skills & Tags</h3>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Add a tag (e.g., React, Remote, Senior)"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
                  />
                  <Button type="button" onClick={addTag} size="sm" disabled={!currentTag.trim()} className="h-12 sm:h-10 px-4">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add Tag</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>

                {/* Current Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-2 text-sm">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(tag)}
                          className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggested Tags */}
                <div className="space-y-2">
                  <FormDescription className="text-xs sm:text-sm">Suggested tags:</FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTags([...tags, tag]);
                        }}
                        className="h-8 text-xs px-2 sm:px-3"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this application..."
                      className="min-h-[100px] text-base sm:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Optional notes about the role, company culture, interview process, etc.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm bg-blue-600 hover:bg-blue-700"
              >
                {editingJob ? 'Update Application' : 'Add Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 