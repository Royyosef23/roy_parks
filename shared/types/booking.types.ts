import { BookingStatus, PaymentStatus } from '../constants/booking-status';

/**
 * סוגי חניות
 */
export enum SpotType {
  REGULAR = 'REGULAR',
  HANDICAPPED = 'HANDICAPPED',
  ELECTRIC = 'ELECTRIC'
}

/**
 * גדלי חניות
 */
export enum SpotSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

/**
 * הזמנה בסיסית
 */
export interface BaseBooking {
  id: string;
  spotId: string;
  userId: string;
  startTime: string;
  endTime: string;
  totalPoints: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * הזמנה עם פרטי חנייה ומשתמש
 */
export interface BookingWithDetails extends BaseBooking {
  spot: {
    id: string;
    number: string;
    floor: string;
    type: SpotType;
    building: {
      name: string;
      address: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

/**
 * יצירת הזמנה חדשה
 */
export interface CreateBookingRequest {
  spotId: string;
  startTime: string;
  endTime: string;
}

/**
 * עדכון סטטוס הזמנה
 */
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string;
}
