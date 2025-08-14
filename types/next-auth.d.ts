import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      phone?: string
      phoneVerified?: Date | null
      emailVerified?: Date | null
      isVerified?: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    phone?: string
    phoneVerified?: Date | null
    isVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
  }
}