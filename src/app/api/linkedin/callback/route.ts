import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/linkedin/callback'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect('/auth/signin')
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect('/dashboard?linkedin_error=' + encodeURIComponent(error))
    }

    if (!code) {
      return NextResponse.redirect('/dashboard?linkedin_error=no_code')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect('/dashboard?linkedin_error=token_exchange_failed')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user's LinkedIn profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      return NextResponse.redirect('/dashboard?linkedin_error=profile_fetch_failed')
    }

    const profileData = await profileResponse.json()

    // Store LinkedIn connection in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: profileData.sub,
        },
      },
      update: {
        access_token: accessToken,
        expires_at: tokenData.expires_in ? 
          Math.floor(Date.now() / 1000) + tokenData.expires_in : 
          null,
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'linkedin',
        providerAccountId: profileData.sub,
        access_token: accessToken,
        expires_at: tokenData.expires_in ? 
          Math.floor(Date.now() / 1000) + tokenData.expires_in : 
          null,
      },
    })

    // Update user profile with LinkedIn data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: profileData.picture || undefined,
        // You could also update name if needed
      },
    })

    return NextResponse.redirect('/dashboard?linkedin_success=true')
  } catch (error) {
    console.error('LinkedIn callback error:', error)
    return NextResponse.redirect('/dashboard?linkedin_error=server_error')
  }
} 