/**
 * נקודת כניסה מרכזית לכל השירותים
 */

export * from './user.service';
export * from './booking.service';

// יבוא הקלאסים
import { UserService } from './user.service';
import { BookingService } from './booking.service';

// יצוא הקלאסים
export { UserService, BookingService };

// Factory function ליצירת services
export function createServices() {
  return {
    user: new UserService(),
    booking: new BookingService()
  };
}

// יצוא הטייפ של ה-services
export type Services = ReturnType<typeof createServices>;
