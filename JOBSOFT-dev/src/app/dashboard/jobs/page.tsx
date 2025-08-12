'use client';

import { useEffect, useState } from 'react';
import { getJobs, createJob } from '@/services/job-applications.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JobStatus } from '@/lib/types';

interface Job {
  jobId: string;
  userId: string;
  company: string;
  title: string;
  status: string;
  applicationDate: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JobsPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [salary, setSalary] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const userJobs = await getJobs();
      setJobs(userJobs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!company || !title || !location) {
      setFormError('Company, Title, and Location are required.');
      return;
    }

    try {
      await createJob({ 
        company, 
        jobTitle: title, 
        location,
        jobPostUrl: url,
        notes,
        salary: salary ? parseFloat(salary) : undefined,
        status: JobStatus.APPLIED,
      });
      // Reset form and refetch jobs
      setCompany('');
      setTitle('');
      setLocation('');
      setUrl('');
      setNotes('');
      setSalary('');
      fetchJobs();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create job.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Applications</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Job List</CardTitle>
              <CardDescription>All your tracked job applications.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading jobs...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!isLoading && !error && jobs.length === 0 && <p>No jobs found. Add one to get started!</p>}
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.jobId} className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg">{job.title} at {job.company}</h3>
                    <p className="text-sm text-gray-500">Status: {job.status}</p>
                    {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Job Posting</a>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add a New Job</CardTitle>
              <CardDescription>Track a new application.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Job URL</Label>
                  <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://careers.google.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input id="salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g., 150000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this application..." />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <Button type="submit">Add Job</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 