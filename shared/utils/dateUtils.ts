/**
 * פונקציות עזר לעבודה עם תאריכים ושעות
 */

/**
 * חישוב מספר השעות בין שני תאריכים
 */
export function calculateHours(startTime: string | Date, endTime: string | Date): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const diffInMs = end.getTime() - start.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  return Math.ceil(diffInHours);
}

/**
 * בדיקה האם תאריך בעתיד
 */
export function isFutureDate(date: string | Date): boolean {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
}

/**
 * בדיקה האם שני טווחי זמן חופפים
 */
export function doTimeRangesOverlap(
  range1: { start: string | Date; end: string | Date },
  range2: { start: string | Date; end: string | Date }
): boolean {
  const start1 = new Date(range1.start);
  const end1 = new Date(range1.end);
  const start2 = new Date(range2.start);
  const end2 = new Date(range2.end);
  
  return start1 < end2 && start2 < end1;
}

/**
 * פורמט תאריך לתצוגה בעברית
 */
export function formatDateHebrew(date: string | Date): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * פורמט תאריך לקלט HTML
 */
export function formatDateForInput(date: string | Date): string {
  const dateObj = new Date(date);
  return dateObj.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

/**
 * הוספת זמן לתאריך
 */
export function addTime(date: string | Date, amount: number, unit: 'hours' | 'days' | 'weeks'): Date {
  const dateObj = new Date(date);
  
  switch (unit) {
    case 'hours':
      dateObj.setHours(dateObj.getHours() + amount);
      break;
    case 'days':
      dateObj.setDate(dateObj.getDate() + amount);
      break;
    case 'weeks':
      dateObj.setDate(dateObj.getDate() + (amount * 7));
      break;
  }
  
  return dateObj;
}
