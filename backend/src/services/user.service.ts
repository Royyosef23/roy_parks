import bcrypt from 'bcrypt';
import { User, Prisma } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { generateToken, verifyToken, TokenPayload } from '../config/jwt';
import { RegisterSchema, LoginSchema, UpdateProfileSchema, type RegisterDTO, type LoginDTO, type UpdateProfileDTO } from '@roy-parks/shared';

/**
 * ממשק לתוצאת התחברות
 */
export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

/**
 * שירות ניהול משתמשים
 */
export class UserService {
  private userRepository: UserRepository;
  private readonly SALT_ROUNDS = 12;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * רישום משתמש חדש
   */
  async register(userData: RegisterDTO): Promise<AuthResult> {
    // ולידציה של הנתונים
    const validatedData = RegisterSchema.parse(userData);

    // בדיקה האם האימייל כבר קיים
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('USER_EMAIL_EXISTS');
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(validatedData.password, this.SALT_ROUNDS);

    // יצירת המשתמש
    const user = await this.userRepository.create({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      role: validatedData.role
    });

    // יצירת טוקן
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // החזרת התוצאה ללא הסיסמה
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * התחברות משתמש
   */
  async login(loginData: LoginDTO): Promise<AuthResult> {
    // ולידציה של הנתונים
    const validatedData = LoginSchema.parse(loginData);

    // מציאת המשתמש
    const user = await this.userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // בדיקת הסיסמה
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD');
    }

    // בדיקה האם המשתמש מאומת
    if (!user.verified) {
      throw new Error('USER_NOT_VERIFIED');
    }

    // יצירת טוקן
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // החזרת התוצאה ללא הסיסמה
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * קבלת פרופיל משתמש לפי ID
   */
  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * עדכון פרופיל משתמש
   */
  async updateProfile(userId: string, updateData: UpdateProfileDTO): Promise<Omit<User, 'password'> | null> {
    // ולידציה של הנתונים
    const validatedData = UpdateProfileSchema.parse(updateData);

    const updatedUser = await this.userRepository.update(userId, validatedData);
    if (!updatedUser) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * שינוי סיסמה
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // בדיקת הסיסמה הנוכחית
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    // הצפנת הסיסמה החדשה
    const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // עדכון הסיסמה
    const result = await this.userRepository.updatePassword(userId, hashedNewPassword);
    return result !== null;
  }

  /**
   * אימות טוקן והחזרת פרטי המשתמש
   */
  async verifyTokenAndGetUser(token: string): Promise<Omit<User, 'password'> | null> {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return this.getProfile(decoded.userId);
  }

  /**
   * סימון משתמש כמאומת
   */
  async verifyUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.markAsVerified(userId);
    return result !== null;
  }

  /**
   * מחיקת משתמש
   */
  async deleteUser(userId: string): Promise<boolean> {
    return this.userRepository.delete(userId);
  }

  /**
   * קבלת רשימת משתמשים (למנהלים)
   */
  async getUsers(filters?: any, options?: any) {
    return this.userRepository.findMany(filters, options);
  }

  /**
   * קבלת בעלי בניינים עם הבניינים שלהם
   */
  async getBuildingOwners() {
    return this.userRepository.findOwnersWithBuildings();
  }

  /**
   * קבלת משתמש עם ההזמנות שלו
   */
  async getUserWithBookings(userId: string): Promise<User | null> {
    const users = await this.userRepository.findWithBookings(userId);
    return users.length > 0 ? users[0] : null;
  }
}
