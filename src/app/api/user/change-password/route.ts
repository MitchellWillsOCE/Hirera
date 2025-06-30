import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid current password" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
} 