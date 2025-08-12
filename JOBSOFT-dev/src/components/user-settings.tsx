'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { CognitoService } from '@/lib/cognito'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { countries } from '@/lib/countries'
import { currencies } from '@/lib/currencies'
import {
  Shield,
  Bell,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Key,
  Globe,
  User as UserIcon,
  Mail
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CountryInput } from '@/components/ui/country-input'

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

export default function UserSettings() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    country: 'US',
    isPublic: false,
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
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || 'US',
        isPublic: false, // Default value since we don't have this in our User type
      })
      setPreferences(prev => ({
        ...prev,
        publicProfile: false // Default value
      }))
    }
  }, [user])

  const getAuthHeader = async () => {
    try {
      const token = await CognitoService.getAccessToken();
      if (token) {
        return { 'Authorization': `Bearer ${token}` }
      }
      throw new Error("Session not found.");
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const authHeader = await getAuthHeader();
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          country: profile.country,
          isPublic: profile.isPublic
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
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
      const authHeader = await getAuthHeader();
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          oldPassword: passwords.current,
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
    } catch (error: any) {
      console.error('Failed to change password:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action is irreversible and will permanently delete all your data.')) {
      return
    }

    const password = prompt("Please enter your password to confirm account deletion.");
    if (!password) {
      return;
    }

    try {
      setSaving(true)
      setMessage(null)
      const authHeader = await getAuthHeader();
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        await signOut()
        router.push('/auth/signup');
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to delete account' })
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' })
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
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-6">
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center space-x-2`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={profile.firstName || ''} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={profile.lastName || ''} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <Input id="username" value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <Input id="email" value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <Select value={profile.country || 'US'} onValueChange={(value) => setProfile(p => ({ ...p, country: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="public-profile" checked={profile.isPublic} onCheckedChange={(checked) => setProfile(p => ({ ...p, isPublic: checked }))} />
            <Label htmlFor="public-profile">Public Profile</Label>
          </div>
          <div className="md:col-span-2 flex items-center space-x-2 pt-4">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Change Password</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <Input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))}/>
              <Input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords(p => ({...p, new: e.target.value}))}/>
              <Input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))}/>
            </div>
            <Button onClick={changePassword} disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
              <Key className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold">Account Deletion</h4>
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
              <Button variant="destructive" onClick={deleteAccount} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete Account'}
                <Trash2 className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex items-center justify-between">
            <Label htmlFor="publicProfile" className="flex flex-col space-y-1">
              <span>Public Profile</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Allow other users to see your anonymized progress on leaderboards.
              </span>
            </Label>
            <Switch
              id="publicProfile"
              checked={preferences.publicProfile}
              onCheckedChange={(c) => {
                setPreferences(p => ({ ...p, publicProfile: c }))
                setProfile(p => ({...p, isPublic: c}))
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive important updates about your applications and goals.
              </span>
            </Label>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(c) => setPreferences(p => ({ ...p, emailNotifications: c }))}
            />
          </div>
          <Separator />
           <div className="flex items-center justify-between">
            <Label htmlFor="marketingEmails" className="flex flex-col space-y-1">
              <span>Marketing Emails</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive news, feature updates, and special offers from Hirera.
              </span>
            </Label>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={(c) => setPreferences(p => ({ ...p, marketingEmails: c }))}
            />
          </div>
          <Separator />
           <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
             <Select value={preferences.defaultCurrency} onValueChange={(v) => setPreferences(p => ({ ...p, defaultCurrency: v }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
             <Select value={preferences.timezone} onValueChange={(v) => setPreferences(p => ({ ...p, timezone: v }))}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {/* In a real app, this would be a full list of timezones */}
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="PST">Pacific Standard Time</SelectItem>
                  <SelectItem value="EST">Eastern Standard Time</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 