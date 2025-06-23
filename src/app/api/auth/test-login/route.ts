import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const testUserData = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'testpassword123'
    }

    // Check if test user already exists
    let testUser = await prisma.user.findUnique({
      where: { email: testUserData.email }
    })

    if (!testUser) {
      // Create test user if doesn't exist
      const hashedPassword = await bcrypt.hash(testUserData.password, 12)
      
      testUser = await prisma.user.create({
        data: {
          email: testUserData.email,
          username: testUserData.username,
          firstName: testUserData.firstName,
          lastName: testUserData.lastName,
          password: hashedPassword,
        }
      })

      // Create initial analytics record
      await prisma.analytics.create({
        data: {
          userId: testUser.id,
        }
      })

      console.log('Test user created:', testUserData.email)
    }

    // Return test user credentials for frontend to use
    return NextResponse.json({
      success: true,
      credentials: {
        email: testUserData.email,
        password: testUserData.password
      },
      message: 'Test user ready'
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Failed to create/login test user' },
      { status: 500 }
    )
  }
} 