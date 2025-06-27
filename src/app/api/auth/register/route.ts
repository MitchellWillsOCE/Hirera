import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Environment Check: Ensure the database is configured.
    if (!process.env.DATABASE_URL) {
      console.error('CRITICAL: DATABASE_URL is not set.');
      return NextResponse.json(
        { error: 'Service is not configured correctly. Please contact support.' },
        { status: 503 } // 503 Service Unavailable
      );
    }

    const body = await request.json()
    const { firstName, lastName, username, email, password, country } = body

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !country) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate field formats
    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json(
        { error: 'First name and last name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (!country || country.length !== 2) {
      return NextResponse.json(
        { error: 'Please select a valid country' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
      }
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'An account with this email address already exists' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        country: country.toUpperCase(),
        isPublic: true // Default to public profile
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        country: true,
        createdAt: true
      }
    })

    // Create initial analytics record
    await prisma.analytics.create({
      data: {
        userId: user.id,
        period: 'monthly',
        date: new Date()
      }
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration API Error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Handle Prisma-specific errors or other database issues
    if (error instanceof Error && error.message.includes('Prisma')) {
       return NextResponse.json(
        { error: 'Database operation failed. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
} 