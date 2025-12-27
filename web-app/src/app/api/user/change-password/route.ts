import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/jwt'
import { changePassword } from '@/lib/cognito'
import { JwtPayload } from 'jsonwebtoken'

interface ValidatedToken extends JwtPayload {
  email: string;
}

function isTokenValidated(token: string | JwtPayload | null): token is ValidatedToken {
  return (token as ValidatedToken)?.email !== undefined
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.split(' ')[1] ||
      request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!isTokenValidated(validatedToken)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await changePassword(validatedToken.email, oldPassword, newPassword)

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error: any) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
} 

