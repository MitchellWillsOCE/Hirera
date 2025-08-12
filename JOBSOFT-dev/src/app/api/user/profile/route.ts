import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { validateToken } from '@/lib/jwt'
import { JwtPayload } from 'jsonwebtoken'

interface ValidatedToken extends JwtPayload {
  email: string;
  sub: string;
}

function isTokenValidated(token: string | JwtPayload | null): token is ValidatedToken {
  return (token as ValidatedToken)?.email !== undefined && (token as ValidatedToken)?.sub !== undefined
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!isTokenValidated(validatedToken)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await userService.getUserProfile(validatedToken.sub);

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: result.code === 'NOT_FOUND' ? 404 : 500 });
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!isTokenValidated(validatedToken)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const result = await userService.updateUserProfile(validatedToken.sub, validatedToken.email, body);

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
} 