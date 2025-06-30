import { BaseService, ServiceResponse } from './base.service'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '@/generated/prisma'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  country?: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  country?: string
  isPublic: boolean
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export class AuthService extends BaseService {
  private jwtSecret: string
  private jwtExpiry: string

  constructor() {
    super(prisma.user)
    this.jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
    this.jwtExpiry = '7d'
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ServiceResponse<AuthUser>> {
    try {
      // Check cache first
      const cacheKey = `user:email:${data.email}`
      const existingUser = await this.getCached<User>(cacheKey)
      if (existingUser) {
        return { success: false, error: 'User already exists', code: 'USER_EXISTS' }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return { success: false, error: 'Invalid email format', code: 'INVALID_EMAIL' }
      }

      // Validate password strength
      if (data.password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' }
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(data.password, saltRounds)

      // Create user
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          country: data.country || 'US',
          isPublic: false
        }
      })

      // Cache user data
      this.setCache(cacheKey, user, 3600) // Cache for 1 hour

      // Return user without password
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        country: user.country ?? undefined,
        isPublic: user.isPublic
      }

      return this.success(authUser)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<ServiceResponse<{ user: AuthUser; token: string }>> {
    try {
      // Check cache first
      const cacheKey = `user:email:${credentials.email.toLowerCase()}`
      let user = await this.getCached<User>(cacheKey)

      if (!user) {
        // Fetch from database
        user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!user) {
          return { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }
        }

        // Cache user data
        this.setCache(cacheKey, user, 3600)
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }
      }

      // Generate JWT token
      const token = this.generateToken({ userId: user.id, email: user.email })

      // Return user without password
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        isPublic: user.isPublic
      }

      return this.success({ user: authUser, token })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ServiceResponse<AuthUser>> {
    try {
      const cacheKey = `user:id:${userId}`
      let user = await this.getCached<User>(cacheKey)

      if (!user) {
        user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          return { success: false, error: 'User not found', code: 'NOT_FOUND' }
        }

        this.setCache(cacheKey, user, 3600)
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        isPublic: user.isPublic
      }

      return this.success(authUser)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<RegisterData>): Promise<ServiceResponse<AuthUser>> {
    try {
      const updateData: any = {}

      if (data.username) updateData.username = data.username
      if (data.firstName) updateData.firstName = data.firstName
      if (data.lastName) updateData.lastName = data.lastName
      if (data.country) updateData.country = data.country

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
      })

      // Clear cache
      this.clearCache(`user:id:${userId}`)
      this.clearCache(`user:email:${user.email}`)

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        isPublic: user.isPublic
      }

      return this.success(authUser)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ServiceResponse<boolean>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return { success: false, error: 'User not found', code: 'NOT_FOUND' }
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.password)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid current password', code: 'INVALID_PASSWORD' }
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })

      // Clear cache
      this.clearCache(`user:id:${userId}`)
      this.clearCache(`user:email:${user.email}`)

      return this.success(true)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry })
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<ServiceResponse<JWTPayload>> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload
      return this.success(decoded)
    } catch (error) {
      return { success: false, error: 'Invalid token', code: 'INVALID_TOKEN' }
    }
  }

  /**
   * Create development test user
   */
  async createTestUser(): Promise<ServiceResponse<AuthUser>> {
    try {
      const testUser = await prisma.user.upsert({
        where: { email: 'test@hirera.com' },
        update: {},
        create: {
          username: 'testuser',
          email: 'test@hirera.com',
          password: await bcrypt.hash('testpassword', 12),
          firstName: 'Test',
          lastName: 'User',
          country: 'US',
          isPublic: true
        }
      })

      const authUser: AuthUser = {
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        country: testUser.country,
        isPublic: testUser.isPublic
      }

      return this.success(authUser)
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Export singleton instance
export const authService = new AuthService() 