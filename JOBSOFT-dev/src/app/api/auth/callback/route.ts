import { NextRequest, NextResponse } from 'next/server';
import { URLSearchParams } from 'url';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, message: 'Authorization code not found.' }, { status: 400 });
  }

  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback';

  if (!cognitoDomain || !clientId) {
    console.error('Missing Cognito environment variables for token exchange.');
    return NextResponse.redirect(new URL('/auth/signin?error=Configuration_Error', req.nextUrl.origin));
  }
  
  const tokenUrl = `https://${cognitoDomain}/oauth2/token`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(clientSecret ? { Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64') } : {}),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error('Failed to exchange authorization code for tokens:', tokens);
      throw new Error(tokens.error_description || 'Token exchange failed');
    }

    const { id_token, access_token, refresh_token } = tokens;

    const responseRedirect = NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    
    // Set tokens in secure, http-only cookies
    responseRedirect.cookies.set('id_token', id_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    responseRedirect.cookies.set('access_token', access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    responseRedirect.cookies.set('refresh_token', refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return responseRedirect;

  } catch (error) {
    console.error('Cognito callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=Authentication_Failed', req.nextUrl.origin));
  }
} 