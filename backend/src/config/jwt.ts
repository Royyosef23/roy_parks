import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';

/**
 * הגדרות JWT
 */
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'parkbnb',
  audience: process.env.JWT_AUDIENCE || 'parkbnb-users'
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * יצירת JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience
  } as any);
}

/**
 * אימות JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const options: VerifyOptions = {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    };
    
    const decoded = jwt.verify(token, JWT_CONFIG.secret, options) as JwtPayload & TokenPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

/**
 * חידוש JWT token
 */
export function refreshToken(oldToken: string): string | null {
  const decoded = verifyToken(oldToken);
  if (!decoded) return null;
  
  return generateToken(decoded);
}
