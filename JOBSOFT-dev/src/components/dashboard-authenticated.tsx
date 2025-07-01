'use client'

import React, { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { User } from 'next-auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutGrid, 
  Table, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Settings,
  LogOut,
  Briefcase,
  User as UserIcon,
  Target,
  TrendingUp,
  Trophy,
  Linkedin,
  GitMerge,
  Mail,
  Globe,
  Shield,
  Bell,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Key
} from 'lucide-react'
import { JobCard } from '@/components/job-card'
import { JobTable } from '@/components/job-table'
import { FilterPanel } from '@/components/filter-panel'
import { AnalyticsPanel } from '@/components/analytics-panel'
import { JobForm } from '@/components/job-form'
import { Input } from '@/components/ui/input'
import { JobApplication, FilterOptions, SortOptions } from '@/lib/types'
import { GoalSetting } from '@/components/goals/goal-setting'
import { ApplicationTimeline } from '@/components/timeline/application-timeline'
import { JobInsights } from '@/components/job-insights'
import { LinkedInIntegration } from '@/components/linkedin-integration'
import { Leaderboards } from '@/components/leaderboards'
import { AnimatePresence, motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { countries } from '@/lib/countries'
import { currencies } from '@/lib/currencies'

// --- UserSettings Component Embedded ---
interface UserProfile {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  country?: string
  isPublic: boolean
  createdAt: string
}

function UserSettings() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    country: 'US',
    isPublic: false,
    createdAt: ''
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    publicProfile: false,
    defaultCurrency: 'USD',
    timezone: 'UTC'
  })

  useEffect(() => {
    if (session?.user) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setPreferences(prev => ({
          ...prev,
          publicProfile: data.isPublic
        }))
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data.'})
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile information' })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          country: profile.country,
          isPublic: preferences.publicProfile
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim()
          }
        })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwords.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      })

      if (response.ok) {
        setPasswords({ current: '', new: '', confirm: '' })
        setMessage({ type: 'success', text: 'Password changed successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to change password' })
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action is irreversible and will permanently delete all your data.')) {
      return
    }

    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.href = '/auth/signin'
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to delete account' })
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      setMessage({ type: 'error', text: 'Failed to delete account' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={profile.country || 'US'} 
                  onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publicProfile"
                  checked={preferences.publicProfile}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, publicProfile: checked }))}
                />
                <Label htmlFor="publicProfile" className="text-sm">
                  Make my profile public on leaderboards
                </Label>
              </div>

              <Button onClick={saveProfile} disabled={saving} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and manage your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex items-center space-x-2">
                  <Input value={profile.username} disabled />
                  <Badge variant="secondary">Cannot be changed</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Input value={profile.email} disabled />
                  <Badge variant="secondary">Cannot be changed</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <Input 
                  value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''} 
                  disabled 
                />
              </div>

              <Separator />

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={deleteAccount}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="Enter your new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm your new password"
                />
              </div>

              <Button 
                onClick={changePassword} 
                disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                className="w-full md:w-auto"
              >
                <Key className="h-4 w-4 mr-2" />
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your Hirera experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={preferences.defaultCurrency} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultCurrency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Notification Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email updates about your job applications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive tips, updates, and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
              </div>

              <Button className="w-full md:w-auto" disabled>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
// --- End UserSettings Component ---


interface DashboardAuthenticatedProps {
  user: User
}

interface Goal {
  id: string
  userId: string
  type: string
  target: number
  achieved: number
  period: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TABS = [
  { value: 'jobs', label: 'Jobs', icon: Briefcase },
  { value: 'timeline', label: 'Timeline', icon: GitMerge },
  { value: 'goals', label: 'Goals', icon: Target },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'leaderboards', label: 'Leaderboards', icon: Trophy },
  { value: 'insights', label: 'Insights', icon: TrendingUp },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'settings', label: 'Settings', icon: Settings },
]

export function DashboardAuthenticated({ user }: DashboardAuthenticatedProps) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [activeTab, setActiveTab] = useState('jobs')
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'lastUpdated', direction: 'desc' })
  const [filters, setFilters] = useState<FilterOptions>({})

  // Load initial data when component mounts and user is available
  useEffect(() => {
    if (user) {
      loadJobs()
      loadGoals()
    }
  }, [user])

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        // API now returns { items, pagination } structure
        const jobsArray = data.items || data
        setJobs(jobsArray)
        setFilteredJobs(jobsArray)
      } else if (response.status === 401) {
        console.error('Unauthorized access to jobs - user may need to re-authenticate')
        // Optionally redirect to login or show error message
      } else {
        console.error('Failed to load jobs:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
  }

  const handleCreateGoal = async (goalData: any) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })
      
      if (response.ok) {
        const newGoal = await response.json()
        setGoals(prev => [...prev, newGoal])
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleUpdateGoal = async (goalId: string, achieved: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achieved }),
      })
      
      if (response.ok) {
        const updatedGoal = await response.json()
        setGoals(prev => prev.map(goal => 
          goal.id === goalId ? updatedGoal : goal
        ))
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleJobCreate = async (jobData: any) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        const newJob = await response.json()
        setJobs(prev => [newJob, ...prev])
        setFilteredJobs(prev => [newJob, ...prev])
        setShowJobForm(false)
      }
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  const handleJobUpdate = async (jobData: any) => {
    if (!editingJob) return

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      if (response.ok) {
        const updatedJob = await response.json()
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setFilteredJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setEditingJob(null)
        setShowJobForm(false)
      }
    } catch (error) {
      console.error('Failed to update job:', error)
    }
  }

  const handleJobDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId))
        setFilteredJobs(prev => prev.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const handleStatusUpdate = async (id: string, status: JobApplication['status']) => {
    const originalJobs = [...jobs];
    const updatedJobs = jobs.map(j => (j.id === id ? { ...j, status, lastUpdated: new Date() } : j));
    setJobs(updatedJobs);
    setFilteredJobs(updatedJobs);
  
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
  
      if (!response.ok) {
        setJobs(originalJobs);
        setFilteredJobs(originalJobs);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setJobs(originalJobs);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm])

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-3 sm:space-x-4 hover:opacity-80 transition-opacity">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Hirera</h1>
                  <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Professional Job Application Management</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center gap-2 min-w-0">
                <UserIcon className="h-4 w-4 text-slate-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 max-w-[80px] sm:max-w-none truncate">
                  {user.name || (user as any).username}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-8 sm:h-9 px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:ml-2 hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:w-auto lg:inline-grid">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 sm:h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 sm:h-10 px-2 sm:px-3"
                >
                  <Filter className="h-4 w-4" />
                  <span className="ml-1 sm:ml-2 hidden sm:inline">Filters</span>
                </Button>

                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="h-8 px-2 sm:px-3"
                  >
                    <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => setShowJobForm(true)}
                    className="h-9 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.div>
                    <span className="ml-1 sm:ml-2 hidden sm:inline">Add Job</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {showFilters && (
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                sortOptions={sortOptions}
                onSortChange={setSortOptions}
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                jobs={jobs}
              />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === 'card' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredJobs.map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{ 
                              duration: 0.4,
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 260,
                              damping: 20
                            }}
                            layout
                          >
                            <JobCard
                              job={job}
                              onEdit={handleEditJob}
                              onDelete={handleJobDelete}
                              onStatusUpdate={handleStatusUpdate}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <JobTable
                          jobs={filteredJobs}
                          onEdit={handleEditJob}
                          onDelete={handleJobDelete}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {filteredJobs.length === 0 && !loading && (
                  <Card className="border-dashed border-2 border-slate-300">
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                      <Briefcase className="h-16 w-16 text-slate-400 mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">
                        {searchTerm ? 'No matching jobs found' : 'No job applications yet'}
                      </h3>
                      <p className="text-slate-500 text-center mb-4 max-w-md text-sm sm:text-base">
                        {searchTerm
                          ? 'Try adjusting your search terms or clearing filters'
                          : 'Start tracking your job applications to see your progress and analytics'
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowJobForm(true)} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Job
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="timeline"><ApplicationTimeline jobs={jobs} /></TabsContent>
          <TabsContent value="goals"><GoalSetting goals={goals} onCreateGoal={handleCreateGoal} onUpdateGoal={handleUpdateGoal} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsPanel jobs={jobs} /></TabsContent>
          <TabsContent value="leaderboards"><Leaderboards /></TabsContent>
          <TabsContent value="insights"><JobInsights /></TabsContent>
          <TabsContent value="linkedin"><LinkedInIntegration /></TabsContent>
          <TabsContent value="settings"><UserSettings /></TabsContent>
        </Tabs>
      </main>

      {showJobForm && (
        <JobForm
          open={showJobForm}
          onClose={() => {
            setShowJobForm(false)
            setEditingJob(null)
          }}
          onSubmit={editingJob ? handleJobUpdate : handleJobCreate}
          editingJob={editingJob}
        />
      )}
    </div>
  )
}