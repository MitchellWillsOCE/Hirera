'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Globe, 
  Shield, 
  Bell, 
  Eye,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Key,
  Settings
} from 'lucide-react'
import { countries } from '@/lib/countries'
import { currencies } from '@/lib/currencies'

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

export function UserSettings() {
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
            <User className="h-4 w-4" />
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