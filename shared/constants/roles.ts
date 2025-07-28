/**
 * תפקידי משתמשים במערכת - מעודכן למודל הדינמי החדש
 */
export const UserRole = {
  RESIDENT: 'RESIDENT', // דייר - יכול לשכור ולהשכיר חניות
  ADMIN: 'ADMIN'        // מנהל - ועד בית עם הרשאות מלאות
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * הרשאות לפי תפקיד - מעודכן למודל דינמי
 */
export const ROLE_PERMISSIONS = {
  [UserRole.RESIDENT]: [
    'parking:offer',        // יכול להציע חניות
    'parking:book',         // יכול לשכור חניות  
    'parking:view',         // יכול לראות חניות
    'booking:create',       // יכול ליצור הזמנות
    'booking:view-own',     // יכול לראות הזמנות שלו
    'points:view-own',      // יכול לראות נקודות שלו
    'profile:update'        // יכול לעדכן פרופיל
  ],
  [UserRole.ADMIN]: [
    // הרשאות בסיסיות כמו דיירים
    'parking:offer',
    'parking:book', 
    'parking:view',
    'booking:create',
    'booking:view-own',
    'points:view-own',
    'profile:update',
    // הרשאות ניהול
    'booking:view-all',
    'booking:approve',
    'parking:view-all',
    'parking:approve',
    'user:manage',
    'user:verify',
    'building:manage',
    'points:manage-all'
  ]
} as const;
