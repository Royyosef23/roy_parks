/**
 * נקודת כניסה מרכזית לכל ה-Repositories
 */

export * from './base.repository';
export * from './user.repository';
export * from './booking.repository';
export * from './parking-spot.repository';

// יבוא הקלאסים
import { UserRepository } from './user.repository';
import { BookingRepository } from './booking.repository';  
import { ParkingSpotRepository } from './parking-spot.repository';

// יצוא הקלאסים
export { UserRepository, BookingRepository, ParkingSpotRepository };

// Factory function ליצירת repositories
export function createRepositories() {
  return {
    user: new UserRepository(),
    booking: new BookingRepository(),
    parkingSpot: new ParkingSpotRepository()
  };
}

// יצוא הטייפ של ה-repositories
export type Repositories = ReturnType<typeof createRepositories>;
