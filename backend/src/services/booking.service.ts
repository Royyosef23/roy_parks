import { Booking, Prisma, BookingStatus } from '@prisma/client';
import { BookingRepository } from '../repositories/booking.repository';
import { ParkingSpotRepository } from '../repositories/parking-spot.repository';
import { UserRepository } from '../repositories/user.repository';

/**
 * ממשק ליצירת הזמנה חדשה
 */
export interface CreateBookingData {
  userId: string;
  spotId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  carModel?: string;
  licensePlate?: string;
}

/**
 * ממשק לעדכון הזמנה
 */
export interface UpdateBookingData {
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  carModel?: string;
  licensePlate?: string;
}

/**
 * ממשק לחישוב מחיר
 */
export interface PriceCalculation {
  hours: number;
  days: number;
  hourlyRate: number;
  dailyRate: number;
  totalPrice: number;
  commission: number;
  finalPrice: number;
}

/**
 * שירות ניהול הזמנות
 */
export class BookingService {
  private bookingRepository: BookingRepository;
  private spotRepository: ParkingSpotRepository;
  private userRepository: UserRepository;
  private readonly COMMISSION_RATE = 0.1; // 10% עמלה

  constructor(
    bookingRepository?: BookingRepository,
    spotRepository?: ParkingSpotRepository,
    userRepository?: UserRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.spotRepository = spotRepository || new ParkingSpotRepository();
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * יצירת הזמנה חדשה
   */
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    // בדיקה שהמשתמש קיים
    const user = await this.userRepository.findById(bookingData.userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // בדיקה שהחנייה קיימת וזמינה
    const spot = await this.spotRepository.findById(bookingData.spotId);
    if (!spot) {
      throw new Error('PARKING_SPOT_NOT_FOUND');
    }

    if (!spot.available) {
      throw new Error('PARKING_SPOT_NOT_AVAILABLE');
    }

    // בדיקת תאריכים תקינים
    if (bookingData.startDate >= bookingData.endDate) {
      throw new Error('INVALID_DATE_RANGE');
    }

    if (bookingData.startDate < new Date()) {
      throw new Error('START_DATE_IN_PAST');
    }

    // בדיקת התנגשויות בזמנים
    const hasConflict = await this.bookingRepository.checkTimeConflict(
      bookingData.spotId,
      bookingData.startDate,
      bookingData.endDate
    );

    if (hasConflict) {
      throw new Error('TIME_CONFLICT');
    }

    // חישוב מחיר
    const priceCalculation = this.calculatePrice(
      bookingData.startDate,
      bookingData.endDate,
      spot.hourlyRate,
      spot.dailyRate
    );

    // יצירת ההזמנה
    const booking = await this.bookingRepository.create({
      user: { connect: { id: bookingData.userId } },
      spot: { connect: { id: bookingData.spotId } },
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalPrice: priceCalculation.finalPrice,
      commission: priceCalculation.commission,
      notes: bookingData.notes,
      carModel: bookingData.carModel,
      licensePlate: bookingData.licensePlate,
      status: 'PENDING'
    });

    return booking;
  }

  /**
   * קבלת הזמנה לפי ID
   */
  async getBooking(bookingId: string): Promise<Booking | null> {
    return this.bookingRepository.findById(bookingId);
  }

  /**
   * עדכון הזמנה
   */
  async updateBooking(bookingId: string, updateData: UpdateBookingData): Promise<Booking | null> {
    const existingBooking = await this.bookingRepository.findById(bookingId);
    if (!existingBooking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    // אפשר לעדכן רק הזמנות שעדיין לא התחילו
    if (existingBooking.status !== 'PENDING' && existingBooking.status !== 'CONFIRMED') {
      throw new Error('BOOKING_CANNOT_BE_UPDATED');
    }

    // אם משנים תאריכים, צריך לבדוק התנגשויות
    if (updateData.startDate || updateData.endDate) {
      const newStartDate = updateData.startDate || existingBooking.startDate;
      const newEndDate = updateData.endDate || existingBooking.endDate;

      if (newStartDate >= newEndDate) {
        throw new Error('INVALID_DATE_RANGE');
      }

      const hasConflict = await this.bookingRepository.checkTimeConflict(
        existingBooking.spotId,
        newStartDate,
        newEndDate,
        bookingId
      );

      if (hasConflict) {
        throw new Error('TIME_CONFLICT');
      }

      // חישוב מחיר חדש
      const spot = await this.spotRepository.findById(existingBooking.spotId);
      if (spot) {
        const priceCalculation = this.calculatePrice(
          newStartDate,
          newEndDate,
          spot.hourlyRate,
          spot.dailyRate
        );

        updateData = {
          ...updateData,
          totalPrice: priceCalculation.finalPrice,
          commission: priceCalculation.commission
        } as any;
      }
    }

    return this.bookingRepository.update(bookingId, updateData);
  }

  /**
   * אישור הזמנה
   */
  async confirmBooking(bookingId: string): Promise<Booking | null> {
    return this.bookingRepository.updateStatus(bookingId, 'CONFIRMED');
  }

  /**
   * ביטול הזמנה
   */
  async cancelBooking(bookingId: string): Promise<Booking | null> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    // לא ניתן לבטל הזמנה פעילה
    if (booking.status === 'ACTIVE') {
      throw new Error('CANNOT_CANCEL_ACTIVE_BOOKING');
    }

    return this.bookingRepository.updateStatus(bookingId, 'CANCELLED');
  }

  /**
   * התחלת הזמנה (המשתמש הגיע)
   */
  async startBooking(bookingId: string): Promise<Booking | null> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('BOOKING_NOT_CONFIRMED');
    }

    const now = new Date();
    if (now < booking.startDate) {
      throw new Error('BOOKING_NOT_STARTED_YET');
    }

    return this.bookingRepository.updateStatus(bookingId, 'ACTIVE');
  }

  /**
   * סיום הזמנה
   */
  async completeBooking(bookingId: string): Promise<Booking | null> {
    return this.bookingRepository.updateStatus(bookingId, 'COMPLETED');
  }

  /**
   * קבלת הזמנות של משתמש
   */
  async getUserBookings(userId: string, options?: any) {
    return this.bookingRepository.findByUser(userId, options);
  }

  /**
   * קבלת הזמנות לחנייה
   */
  async getSpotBookings(spotId: string, options?: any) {
    return this.bookingRepository.findBySpot(spotId, options);
  }

  /**
   * קבלת הזמנות פעילות
   */
  async getActiveBookings(options?: any) {
    return this.bookingRepository.findActive(options);
  }

  /**
   * חישוב מחיר הזמנה
   */
  calculatePrice(startDate: Date, endDate: Date, hourlyRate: number, dailyRate: number): PriceCalculation {
    const diffInMs = endDate.getTime() - startDate.getTime();
    const totalHours = Math.ceil(diffInMs / (1000 * 60 * 60)); // עיגול כלפי מעלה
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    // חישוב מחיר בסיסי
    const basePrice = (totalDays * dailyRate) + (remainingHours * hourlyRate);
    
    // חישוב עמלה
    const commission = basePrice * this.COMMISSION_RATE;
    const finalPrice = basePrice + commission;

    return {
      hours: totalHours,
      days: totalDays,
      hourlyRate,
      dailyRate,
      totalPrice: basePrice,
      commission,
      finalPrice
    };
  }

  /**
   * בדיקת זמינות חנייה לתאריכים מסוימים
   */
  async checkAvailability(spotId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || !spot.available) {
      return false;
    }

    const hasConflict = await this.bookingRepository.checkTimeConflict(spotId, startDate, endDate);
    return !hasConflict;
  }

  /**
   * סימון הזמנות שהסתיימו כהושלמו
   */
  async markExpiredBookingsAsCompleted(): Promise<number> {
    return this.bookingRepository.markExpiredAsCompleted();
  }

  /**
   * קבלת הזמנות שהסתיימו אבל לא סומנו כהושלמו
   */
  async getExpiredActiveBookings(): Promise<Booking[]> {
    return this.bookingRepository.findExpiredActive();
  }
}
