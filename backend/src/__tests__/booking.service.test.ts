import { BookingService } from '../services/booking.service';
import { BookingRepository } from '../repositories/booking.repository';
import { ParkingSpotRepository } from '../repositories/parking-spot.repository';
import { UserRepository } from '../repositories/user.repository';

// Mock repositories
jest.mock('../repositories/booking.repository');
jest.mock('../repositories/parking-spot.repository');
jest.mock('../repositories/user.repository');

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockBookingRepo: jest.Mocked<BookingRepository>;
  let mockSpotRepo: jest.Mocked<ParkingSpotRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockBookingRepo = new BookingRepository() as jest.Mocked<BookingRepository>;
    mockSpotRepo = new ParkingSpotRepository() as jest.Mocked<ParkingSpotRepository>;
    mockUserRepo = new UserRepository() as jest.Mocked<UserRepository>;
    
    bookingService = new BookingService(mockBookingRepo, mockSpotRepo, mockUserRepo);
  });

  describe('createBooking', () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'RENTER' as const
    };

    const mockSpot = {
      id: 'spot1',
      spotNumber: '127',
      floor: -2,
      available: true,
      hourlyRate: 5,
      dailyRate: 30
    };

    const bookingData = {
      userId: 'user1',
      spotId: 'spot1',
      startDate: new Date('2025-07-28T10:00:00Z'),
      endDate: new Date('2025-07-28T12:00:00Z'),
      notes: 'Test booking'
    };

    it('should create a booking successfully', async () => {
      // Setup mocks
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockSpotRepo.findById.mockResolvedValue(mockSpot as any);
      mockBookingRepo.create.mockResolvedValue({
        id: 'booking1',
        ...bookingData,
        totalPrice: 10,
        commission: 1,
        status: 'PENDING'
      } as any);

      const result = await bookingService.createBooking(bookingData);

      expect(result).toBeDefined();
      expect(result.totalPrice).toBe(10);
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user1');
      expect(mockSpotRepo.findById).toHaveBeenCalledWith('spot1');
    });

    it('should throw error if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(bookingService.createBooking(bookingData))
        .rejects
        .toThrow('USER_NOT_FOUND');
    });

    it('should throw error if parking spot not found', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockSpotRepo.findById.mockResolvedValue(null);

      await expect(bookingService.createBooking(bookingData))
        .rejects
        .toThrow('PARKING_SPOT_NOT_FOUND');
    });

    it('should throw error if parking spot not available', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser as any);
      mockSpotRepo.findById.mockResolvedValue({
        ...mockSpot,
        available: false
      } as any);

      await expect(bookingService.createBooking(bookingData))
        .rejects
        .toThrow('PARKING_SPOT_NOT_AVAILABLE');
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price correctly for hourly booking', () => {
      const startDate = new Date('2025-07-28T10:00:00Z');
      const endDate = new Date('2025-07-28T12:00:00Z');
      const hourlyRate = 5;
      const dailyRate = 30;

      const result = (bookingService as any).calculatePrice(
        startDate, 
        endDate, 
        hourlyRate, 
        dailyRate
      );

      expect(result.hours).toBe(2);
      expect(result.totalPrice).toBe(10); // 2 hours * 5 (base price)
      expect(result.commission).toBe(1); // 10% of 10
      expect(result.finalPrice).toBe(11); // base price + commission
    });

    it('should use daily rate for long bookings', () => {
      const startDate = new Date('2025-07-28T10:00:00Z');
      const endDate = new Date('2025-07-29T10:00:00Z'); // 24 hours
      const hourlyRate = 5;
      const dailyRate = 30;

      const result = (bookingService as any).calculatePrice(
        startDate, 
        endDate, 
        hourlyRate, 
        dailyRate
      );

      expect(result.hours).toBe(24);
      expect(result.days).toBe(1);
      expect(result.totalPrice).toBe(30); // 1 day * 30 (daily rate)
      expect(result.commission).toBe(3); // 10% of 30
      expect(result.finalPrice).toBe(33); // base price + commission
    });
  });
});
