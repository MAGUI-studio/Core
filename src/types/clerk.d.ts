export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "member" | "client"
    }
  }

  interface UserPublicMetadata {
    role?: "admin" | "member" | "client"
  }
}
