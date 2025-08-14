import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export interface JWTPayload {
  userId: string
  role: string
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

export interface AuthenticatedUser {
  id: string
  name: string | null
  email: string
  role: string
  phone?: string | null
  phoneVerified?: Date | null
  emailVerified?: Date | null
  isVerified?: boolean
  image?: string | null
}

/**
 * Verify JWT token from Authorization header
 * @param request NextRequest object
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyJWTToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    
    // Ensure it's an access token
    if (decoded.type !== 'access') {
      return null
    }

    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Get authenticated user from JWT token
 * @param request NextRequest object
 * @returns User object or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const payload = await verifyJWTToken(request)
    
    if (!payload) {
      return null
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.profile?.phone,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      isVerified: user.isVerified,
      image: user.image
    }
  } catch (error) {
    console.error('Get authenticated user error:', error)
    return null
  }
}

/**
 * Middleware function to protect API routes with JWT authentication
 * @param request NextRequest object
 * @param requiredRole Optional role requirement
 * @returns User object if authenticated, throws error if not
 */
export async function requireAuth(
  request: NextRequest, 
  requiredRole?: string
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error('Insufficient permissions')
  }

  return user
}

/**
 * Generate a new access token for a user
 * @param userId User ID
 * @param userRole User role
 * @returns JWT access token
 */
export function generateAccessToken(userId: string, userRole: string): string {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
  
  return jwt.sign(
    { 
      userId, 
      role: userRole,
      type: 'access'
    },
    jwtSecret,
    { expiresIn: '15m' }
  )
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    jwt.verify(token, jwtSecret)
    return false
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return true
    }
    return true // Consider invalid tokens as expired
  }
}