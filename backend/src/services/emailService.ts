/**
 * Email Service
 * 
 * שירות לשליחת מיילים - אימות, איפוס סיסמה, הודעות
 */

import nodemailer, { Transporter } from 'nodemailer';

/**
 * Interface לנתוני אימייל
 */
interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

/**
 * יצירת transporter לשליחת מיילים
 * בפיתוח נשתמש בMailHog, בפרודקשן ב-Gmail או שירות אחר
 */
const createTransporter = (): Transporter => {
  // בפיתוח - MailHog
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: 1025,
      ignoreTLS: true
    });
  }

  // בפרודקשן - Gmail או שירות אחר
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * תבניות HTML למיילים
 */
const emailTemplates = {
  welcome: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">ברוך הבא ל-ParkBnB! 🚗</h1>
      <p>שלום ${data.firstName},</p>
      <p>תודה שהצטרפת לפלטפורמת השכרת החניות הכי מתקדמת בישראל!</p>
      <p>עכשיו אתה יכול:</p>
      <ul>
        <li>🔍 לחפש חניות במקומות הכי נוחים</li>
        <li>💰 להשכיר את החנייה שלך ולהרוויח</li>
        <li>⭐ לדרג ולהגיב על חניות</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
        התחל עכשיו
      </a>
      <p>בהצלחה,<br>צוות ParkBnB</p>
    </div>
  `,

  resetPassword: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">איפוס סיסמה 🔐</h1>
      <p>שלום ${data.firstName},</p>
      <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
      <p>לחץ על הכפתור למטה לאיפוס:</p>
      <a href="${data.resetLink}" 
         style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
        איפוס סיסמה
      </a>
      <p><strong>הלינק תקף לשעה אחת בלבד.</strong></p>
      <p>אם לא ביקשת איפוס סיסמה, התעלם מהמייל הזה.</p>
      <p>בברכה,<br>צוות ParkBnB</p>
    </div>
  `,

  bookingConfirmation: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">הזמנה מאושרת! ✅</h1>
      <p>שלום ${data.firstName},</p>
      <p>ההזמנה שלך אושרה בהצלחה!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>פרטי ההזמנה:</h3>
        <p><strong>מקום:</strong> ${data.buildingName}</p>
        <p><strong>כתובת:</strong> ${data.address}</p>
        <p><strong>חנייה:</strong> ${data.spotNumber}</p>
        <p><strong>תאריך:</strong> ${data.startDate} - ${data.endDate}</p>
        <p><strong>מחיר:</strong> ₪${data.totalPrice}</p>
      </div>
      
      <a href="${process.env.FRONTEND_URL}/my-bookings" 
         style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
        צפה בהזמנות שלי
      </a>
      
      <p>נתראה בחנייה!</p>
      <p>צוות ParkBnB</p>
    </div>
  `
};

/**
 * פונקציה לשליחת אימייל
 * 
 * @param emailData - נתוני האימייל
 */
export const sendEmail = async (emailData: EmailData): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // קבלת התבנית המתאימה
    const template = emailTemplates[emailData.template as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`);
    }

    // יצירת HTML content
    const htmlContent = template(emailData.data);

    // הגדרת האימייל
    const mailOptions = {
      from: `"ParkBnB" <${process.env.EMAIL_FROM || 'noreply@parkbnb.com'}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: htmlContent
    };

    // שליחת האימייל
    await transporter.sendMail(mailOptions);
    
    console.log(`📧 Email sent successfully to ${emailData.to}`);
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

/**
 * פונקציה לשליחת מייל פשוט (ללא תבנית)
 */
export const sendSimpleEmail = async (
  to: string, 
  subject: string, 
  html: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ParkBnB" <${process.env.EMAIL_FROM || 'noreply@parkbnb.com'}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Simple email sent to ${to}`);
    
  } catch (error) {
    console.error('❌ Failed to send simple email:', error);
    throw error;
  }
};
