import { User } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * בדיקת יכולות משתמש דינמיות
 */
export interface UserCapabilities {
  canBookParking: boolean;      // יכול לשכור חניות
  canOfferParking: boolean;     // יכול להציע חניות
  canApproveParking: boolean;   // יכול לאשר חניות (Admin)
  canManageBuilding: boolean;   // יכול לנהל בניין (Admin)
  hasApprovedParkingSpots: boolean; // יש לו חניות מאושרות
}

/**
 * קבלת יכולות משתמש על פי המידע הנוכחי
 */
export async function getUserCapabilities(userId: string): Promise<UserCapabilities> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      verified: true
    }
  });

  if (!user) {
    return {
      canBookParking: false,
      canOfferParking: false,
      canApproveParking: false,
      canManageBuilding: false,
      hasApprovedParkingSpots: false
    };
  }

  // בדיקת חניות מאושרות באמצעות raw SQL (עובד עם הסכמה הנוכחית)
  let hasApprovedParkingSpots = false;
  try {
    const approvedSpots = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM parking_spots 
      WHERE "ownerId" = ${userId} AND approved = true
    ` as any[];
    hasApprovedParkingSpots = parseInt(approvedSpots[0]?.count || '0') > 0;
  } catch (error) {
    // אם יש שגיאה בבדיקת החניות, נמשיך בלי זה
    console.warn('Could not check parking spots:', error);
  }

  return {
    // כל דייר מאומת יכול לשכור חניות (לא משנה אם יש לו חניות או לא!)
    canBookParking: user.verified,
    
    // כל דייר מאומת יכול להציע חניות (לא משנה אם יש לו חניות קיימות)
    canOfferParking: user.verified,
    
    // רק Admin יכול לאשר חניות
    canApproveParking: user.role === 'ADMIN',
    
    // רק Admin יכול לנהל בניין
    canManageBuilding: user.role === 'ADMIN',
    
    // האם יש לו חניות מאושרות (למידע בלבד)
    hasApprovedParkingSpots
  };
}

/**
 * בדיקה האם משתמש יכול לבצע פעולה ספציפית
 */
export async function canUserPerformAction(
  userId: string, 
  action: keyof UserCapabilities
): Promise<boolean> {
  const capabilities = await getUserCapabilities(userId);
  return capabilities[action];
}

/**
 * בדיקה האם משתמש יכול לנהל חנייה ספציפית
 */
export async function canUserManageParkingSpot(userId: string, spotId: string): Promise<boolean> {
  try {
    // שימוש ב-raw SQL לבדיקה שהחנייה שייכת למשתמש
    const spots = await prisma.$queryRaw`
      SELECT id FROM parking_spots 
      WHERE id = ${spotId} AND "ownerId" = ${userId}
    ` as any[];
    
    return spots.length > 0;
  } catch (error) {
    console.warn('Could not check parking spot ownership:', error);
    return false;
  }
}

/**
 * בדיקה האם משתמש יכול לשכור חנייה ספציפית
 */
export async function canUserBookParkingSpot(userId: string, spotId: string): Promise<boolean> {
  // לא יכול לשכור חנייה שלו
  const isOwner = await canUserManageParkingSpot(userId, spotId);
  if (isOwner) return false;
  
  // בדיקת יכולת בסיסית לשכירה
  return await canUserPerformAction(userId, 'canBookParking');
}

/**
 * קבלת תיאור סטטוס המשתמש
 */
export async function getUserStatusDescription(userId: string): Promise<string> {
  const capabilities = await getUserCapabilities(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) return 'משתמש לא קיים';
  
  if (user.role === 'ADMIN') {
    return 'מנהל / ועד הבית';
  }
  
  const statuses: string[] = [];
  
  if (!user.verified) {
    statuses.push('ממתין לאימות אימייל');
    return statuses.join(' • ');
  }
  
  // אם הוא מאומת, הוא יכול לעשות הכל
  const activeCapabilities: string[] = [];
  
  if (capabilities.canOfferParking) {
    activeCapabilities.push('יכול להציע חניות');
  }
  
  if (capabilities.canBookParking) {
    activeCapabilities.push('יכול לשכור חניות');
  }
  
  if (capabilities.hasApprovedParkingSpots) {
    // ספירה של חניות מאושרות
    const approvedSpots = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM parking_spots 
      WHERE "ownerId" = ${userId} AND approved = true
    ` as any[];
    const count = parseInt(approvedSpots[0]?.count || '0');
    statuses.push(`בעלים של ${count} חניות מאושרות`);
  }
  
  statuses.push(...activeCapabilities);
  
  return statuses.length > 0 ? statuses.join(' • ') : 'דייר פעיל';
}
