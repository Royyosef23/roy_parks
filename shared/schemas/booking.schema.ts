import { z } from 'zod';
import { BookingStatus } from '../constants/booking-status';
import { POINTS_PER_HOUR, MIN_BOOKING_HOURS, MAX_BOOKING_HOURS } from '../constants/point-values';

/**
 * ולידציה של תאריך ושעה
 */
const dateTimeValidator = z.string().refine(
  (val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(),
  'תאריך ושעה חייבים להיות בעתיד'
);

/**
 * ולידציה של טווח זמנים
 */
const timeRangeValidator = z.object({
  startTime: dateTimeValidator,
  endTime: dateTimeValidator
}).refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours >= MIN_BOOKING_HOURS && hours <= MAX_BOOKING_HOURS;
  },
  `זמן ההזמנה חייב להיות בין ${MIN_BOOKING_HOURS} ל-${MAX_BOOKING_HOURS} שעות`
);

/**
 * סכימת יצירת הזמנה
 */
export const CreateBookingSchema = z.object({
  spotId: z.string().uuid('מזהה חנייה לא תקין'),
  startTime: dateTimeValidator,
  endTime: dateTimeValidator
}).and(timeRangeValidator);

/**
 * סכימת עדכון סטטוס הזמנה
 */
export const UpdateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().max(500, 'סיבה לא יכולה להכיל יותר מ-500 תווים').optional()
});

/**
 * סכימת חיפוש הזמנות
 */
export const SearchBookingsSchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  spotId: z.string().uuid().optional(),
  userId: z.string().uuid().optional()
});

// Export types inferred from schemas
export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusSchema>;
export type SearchBookingsDTO = z.infer<typeof SearchBookingsSchema>;
