import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/jwt'
import { deleteUser as deleteCognitoUser } from '@/lib/cognito'
import { userService } from '@/services/user.service'
import { JwtPayload } from 'jsonwebtoken'

interface ValidatedToken extends JwtPayload {
  email: string;
  sub: string;
}

function isTokenValidated(token: string | JwtPayload | null): token is ValidatedToken {
  return (token as ValidatedToken)?.email !== undefined && (token as ValidatedToken)?.sub !== undefined
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const validatedToken = await validateToken(token)
    if (!isTokenValidated(validatedToken)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    // Delete from Cognito first
    await deleteCognitoUser(validatedToken.email)

    // Then delete from the local database
    await userService.deleteUser(validatedToken.sub)

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 })
  }
} 