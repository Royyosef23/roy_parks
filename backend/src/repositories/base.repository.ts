/**
 * ממשק בסיסי לכל ה-Repositories
 */

export interface BaseRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findMany(filters?: any, options?: QueryOptions): Promise<QueryResult<T>>;
  create(data: any): Promise<T>;
  update(id: TId, data: any): Promise<T | null>;
  delete(id: TId): Promise<boolean>;
}

/**
 * ממשק לפילטרים ועימוד
 */
export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * תוצאת שאילתה עם מטא-דטה
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

/**
 * טייפ עזר לעדכונים חלקיים
 */
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * טייפ עזר ליצירת רשומות חדשות
 */
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
