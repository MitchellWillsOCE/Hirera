import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/linkedin/callback'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!LINKEDIN_CLIENT_ID) {
      return NextResponse.json(
        { error: 'LinkedIn integration not configured' },
        { status: 503 }
      )
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15)
    
    // Store state in session/database for verification
    // In production, you'd want to store this securely
    
    const scope = 'openid profile email w_member_social'
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`

    return NextResponse.json({
      authUrl,
      state
    })
  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 