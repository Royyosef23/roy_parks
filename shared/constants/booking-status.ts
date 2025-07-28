/**
 * סטטוסים של הזמנות
 */
export const BookingStatus = {
  PENDING: 'PENDING',         // ממתין לאישור ועד הבית
  APPROVED: 'APPROVED',       // אושר על ידי ועד הבית
  COMPLETED: 'COMPLETED',     // הושלם בהצלחה
  CANCELLED: 'CANCELLED'      // בוטל
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

/**
 * סטטוסים של תשלום
 */
export const PaymentStatus = {
  PENDING: 'PENDING',         // ממתין לתשלום
  PAID: 'PAID',              // שולם
  REFUNDED: 'REFUNDED'       // הוחזר
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * מעברים מותרים בין סטטוסים
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  [BookingStatus.PENDING]: [BookingStatus.APPROVED, BookingStatus.CANCELLED],
  [BookingStatus.APPROVED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [], // לא ניתן לשנות סטטוס אחרי השלמה
  [BookingStatus.CANCELLED]: []  // לא ניתן לשנות סטטוס אחרי ביטול
} as const;
