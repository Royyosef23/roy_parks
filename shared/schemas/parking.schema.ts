import { z } from 'zod';
import { SpotType, SpotSize } from '../types/booking.types';

/**
 * סכימת יצירת חנייה
 */
export const CreateParkingSpotSchema = z.object({
  number: z.string()
    .min(1, 'מספר חנייה הוא שדה חובה')
    .max(10, 'מספר חנייה לא יכול להכיל יותר מ-10 תווים'),
  floor: z.string()
    .min(1, 'קומה היא שדה חובה')
    .max(5, 'קומה לא יכולה להכיל יותר מ-5 תווים'),
  type: z.nativeEnum(SpotType),
  size: z.nativeEnum(SpotSize),
  features: z.array(z.string()).default([]),
  description: z.string()
    .max(500, 'תיאור לא יכול להכיל יותר מ-500 תווים')
    .optional(),
  buildingId: z.string().uuid('מזהה בניין לא תקין')
});

/**
 * סכימת עדכון חנייה
 */
export const UpdateParkingSpotSchema = CreateParkingSpotSchema.partial();

/**
 * סכימת הגדרת זמינות
 */
export const SetAvailabilitySchema = z.object({
  startTime: z.string().refine(
    (val: string) => !isNaN(Date.parse(val)),
    'פורמט תאריך לא תקין'
  ),
  endTime: z.string().refine(
    (val: string) => !isNaN(Date.parse(val)),
    'פורמט תאריך לא תקין'
  ),
  recurring: z.object({
    enabled: z.boolean().default(false),
    pattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
    endDate: z.string().optional()
  }).optional()
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  'זמן התחלה חייב להיות לפני זמן הסיום'
);

/**
 * סכימת חיפוש חניות זמינות
 */
export const SearchAvailableSpotsSchema = z.object({
  buildingId: z.string().uuid('מזהה בניין לא תקין'),
  startTime: z.string().refine(
    (val: string) => !isNaN(Date.parse(val)) && new Date(val) > new Date(),
    'זמן התחלה חייב להיות בעתיד'
  ),
  endTime: z.string().refine(
    (val: string) => !isNaN(Date.parse(val)),
    'פורמט תאריך לא תקין'
  ),
  type: z.nativeEnum(SpotType).optional(),
  size: z.nativeEnum(SpotSize).optional()
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  'זמן התחלה חייב להיות לפני זמן הסיום'
);

// Export types inferred from schemas
export type CreateParkingSpotDTO = z.infer<typeof CreateParkingSpotSchema>;
export type UpdateParkingSpotDTO = z.infer<typeof UpdateParkingSpotSchema>;
export type SetAvailabilityDTO = z.infer<typeof SetAvailabilitySchema>;
export type SearchAvailableSpotsDTO = z.infer<typeof SearchAvailableSpotsSchema>;
