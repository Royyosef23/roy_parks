/**
 * תפקידי משתמשים במערכת
 */
export enum UserRole {
  RENTER = 'RENTER',     // דייר שוכר חניות
  OWNER = 'OWNER',       // דייר שמשכיר חניות
  ADMIN = 'ADMIN'        // ועד בית
}

/**
 * הרשאות לפי תפקיד
 */
export const ROLE_PERMISSIONS = {
  [UserRole.RENTER]: [
    'booking:create',
    'booking:view-own',
    'parking:view',
    'points:view-own'
  ],
  [UserRole.OWNER]: [
    'booking:create',
    'booking:view-own',
    'parking:view',
    'parking:create',
    'parking:update-own',
    'availability:manage-own',
    'points:view-own'
  ],
  [UserRole.ADMIN]: [
    'booking:view-all',
    'booking:approve',
    'parking:view-all',
    'parking:approve',
    'user:manage',
    'building:manage',
    'points:manage-all'
  ]
} as const;
