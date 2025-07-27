/**
 * סטטוסים של הזמנות
 */
export enum BookingStatus {
  PENDING = 'PENDING',         // ממתין לאישור ועד הבית
  APPROVED = 'APPROVED',       // אושר על ידי ועד הבית
  COMPLETED = 'COMPLETED',     // הושלם בהצלחה
  CANCELLED = 'CANCELLED'      // בוטל
}

/**
 * סטטוסים של תשלום
 */
export enum PaymentStatus {
  PENDING = 'PENDING',         // ממתין לתשלום
  PAID = 'PAID',              // שולם
  REFUNDED = 'REFUNDED'       // הוחזר
}

/**
 * מעברים מותרים בין סטטוסים
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  [BookingStatus.PENDING]: [BookingStatus.APPROVED, BookingStatus.CANCELLED],
  [BookingStatus.APPROVED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [], // לא ניתן לשנות סטטוס אחרי השלמה
  [BookingStatus.CANCELLED]: []  // לא ניתן לשנות סטטוס אחרי ביטול
} as const;
