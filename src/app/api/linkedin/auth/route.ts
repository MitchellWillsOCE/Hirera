import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`
  : 'http://localhost:3000/api/linkedin/callback'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
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
    const state = uuidv4()
    
    // Store state in session/database for verification
    // In production, you'd want to store this securely
    
    const scope = 'openid profile email w_member_social'
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_CALLBACK_URL)}&` +
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