'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Linkedin,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Share,
  Users,
  Briefcase,
  Award,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

interface LinkedInConnection {
  connected: boolean
  profileData?: {
    name: string
    headline: string
    profilePicture?: string
    connections?: number
  }
  lastSync?: string
}

export function LinkedInIntegration() {
  const [connection, setConnection] = useState<LinkedInConnection>({ connected: false })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Check for URL parameters indicating LinkedIn auth result
    const urlParams = new URLSearchParams(window.location.search)
    const linkedinSuccess = urlParams.get('linkedin_success')
    const linkedinError = urlParams.get('linkedin_error')

    if (linkedinSuccess) {
      setMessage({ type: 'success', text: 'LinkedIn connected successfully!' })
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      checkConnectionStatus()
    } else if (linkedinError) {
      setMessage({ type: 'error', text: `LinkedIn connection failed: ${linkedinError}` })
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      // In a real implementation, you'd check the user's LinkedIn connection status
      // For now, we'll simulate this
      const hasLinkedIn = localStorage.getItem('linkedin_connected') === 'true'
      
      if (hasLinkedIn) {
        setConnection({
          connected: true,
          profileData: {
            name: 'John Doe',
            headline: 'Software Engineer at Tech Company',
            profilePicture: undefined,
            connections: 500
          },
          lastSync: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error checking LinkedIn status:', error)
    }
  }

  const connectLinkedIn = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/linkedin/auth')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initiate LinkedIn connection')
      }
      
      const { authUrl } = await response.json()
      
      // Redirect to LinkedIn OAuth
      window.location.href = authUrl
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to connect to LinkedIn' 
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectLinkedIn = async () => {
    try {
      // In a real implementation, you'd call an API to disconnect
      localStorage.removeItem('linkedin_connected')
      setConnection({ connected: false })
      setMessage({ type: 'success', text: 'LinkedIn disconnected successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect LinkedIn' })
    }
  }

  const shareAchievement = async (achievement: string) => {
    if (!connection.connected) {
      setMessage({ type: 'error', text: 'Please connect your LinkedIn account first' })
      return
    }

    try {
      // In a real implementation, you'd use LinkedIn's sharing API
      const shareText = `🎉 Exciting news! I just ${achievement} on JobTracker Pro! 💼 #JobSearch #CareerGrowth #Achievement`
      
      // For now, we'll open LinkedIn in a new tab with pre-filled content
      const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shareText)}`
      window.open(linkedinShareUrl, '_blank')
      
      setMessage({ type: 'success', text: 'Opened LinkedIn to share your achievement!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to share on LinkedIn' })
    }
  }

  const mockAchievements = [
    'reached 50 job applications',
    'got my first interview',
    'received a job offer',
    'completed my monthly application goal',
    'achieved a 25% interview rate'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Linkedin className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">LinkedIn Integration</h2>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          {message.type === 'error' ? 
            <AlertCircle className="h-4 w-4 text-red-600" /> : 
            <CheckCircle className="h-4 w-4 text-green-600" />
          }
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={connection.connected ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <span>LinkedIn Connection</span>
              </div>
              <Badge className={connection.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {connection.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connection.connected && connection.profileData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{connection.profileData.name}</h3>
                    <p className="text-sm text-gray-600">{connection.profileData.headline}</p>
                    {connection.profileData.connections && (
                      <p className="text-xs text-gray-500">{connection.profileData.connections} connections</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={disconnectLinkedIn}>
                    Disconnect
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://linkedin.com/in/me" target="_blank" rel="noopener noreferrer">
                      View Profile <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your LinkedIn account to share your job search achievements and stay connected with your professional network.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <div className="flex items-center space-x-2">
                    <Share className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Share achievements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Showcase progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Network updates</span>
                  </div>
                </div>
                
                <Button 
                  onClick={connectLinkedIn} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Sharing */}
      {connection.connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Share Your Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Celebrate your job search milestones by sharing them with your LinkedIn network!
              </p>
              
              <div className="space-y-3">
                {mockAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-900">I just {achievement}!</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => shareAchievement(achievement)}
                    >
                      <Share className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Benefits & Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>LinkedIn Integration Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Professional Networking</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Share job search milestones with your network</li>
                  <li>• Showcase your career progress and achievements</li>
                  <li>• Keep your connections updated on your journey</li>
                  <li>• Build credibility through consistent updates</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Career Growth</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Demonstrate commitment to professional development</li>
                  <li>• Attract potential employers and recruiters</li>
                  <li>• Celebrate wins to maintain motivation</li>
                  <li>• Build a personal brand around your job search</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Setup Instructions */}
      {!connection.connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-800">
                <p><strong>1.</strong> Click "Connect LinkedIn" to authorize the connection</p>
                <p><strong>2.</strong> You'll be redirected to LinkedIn to grant permissions</p>
                <p><strong>3.</strong> Once connected, you can share achievements directly from JobTracker Pro</p>
                <p><strong>4.</strong> Your LinkedIn profile information will be imported to enhance your experience</p>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> LinkedIn integration requires administrator approval for production use. 
                  This demo shows the interface and functionality that would be available once configured.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
} 