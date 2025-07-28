import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';

// סכימת וולידציה לבקשת אישור חנייה
const claimRequestSchema = z.object({
  floor: z.enum(['-1', '-2', '-3'], {
    errorMap: () => ({ message: 'יש לבחור קומה בחניון' })
  }),
  spotNumber: z.string()
    .min(1, 'יש לציין מספר חנייה')
    .max(3, 'מספר חנייה יכול להכיל עד 3 ספרות')
    .regex(/^\d+$/, 'מספר חנייה יכול להכיל רק ספרות'),
  additionalInfo: z.string().optional()
});

type ClaimRequestFormData = z.infer<typeof claimRequestSchema>;

export const RequestParkingClaim: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<ClaimRequestFormData>({
    resolver: zodResolver(claimRequestSchema)
  });

  const handleSubmit = async (data: ClaimRequestFormData) => {
    try {
      console.log('בקשת אישור חנייה:', data);
      // TODO: שליחה לשרת
      /*
      await apiClient.post('/parking-claims', {
        floor: data.floor,
        spotNumber: data.spotNumber,
        additionalInfo: data.additionalInfo
      });
      */
      
      alert('הבקשה נשלחה בהצלחה לוועד הבית! תקבל הודעה כשהבקשה תטופל.');
      navigate('/dashboard');
    } catch (error) {
      console.error('שגיאה בשליחת הבקשה:', error);
      alert('שגיאה בשליחת הבקשה. נסה שוב.');
    }
  };

  if (!user || (user.role !== 'RESIDENT' && user.role !== 'ADMIN')) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          רק דיירים יכולים לבקש אישור חנייה
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              בקש אישור חנייה מוועד הבית
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* הסבר על התהליך */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-blue-900 mb-2">
              🏢 חניון פאדובה 32 - תהליך אישור חנייה
            </h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>כתובת:</strong> פאדובה 32, תל אביב</p>
              <p><strong>חניון תת-קרקעי:</strong> 3 קומות (-1, -2, -3)</p>
              <div className="mt-3 p-3 bg-blue-100 rounded">
                <p className="font-medium">📋 תהליך האישור:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>בחר את קומת החנייה ומספרה המדויק</li>
                  <li>הבקשה נשלחת לוועד הבית לאישור</li>
                  <li>לאחר אישור תקבל <strong>15 נקודות</strong> ותוכל לפרסם את החנייה</li>
                  <li>מחיר קבוע: <strong>5 נקודות לשעה</strong></li>
                </ol>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* קומה בחניון */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                קומה בחניון תת-קרקעי *
              </label>
              <select
                {...form.register('floor')}
                id="floor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">בחר קומה</option>
                <option value="-1">קומה -1 (מרתף ראשון)</option>
                <option value="-2">קומה -2 (מרתף שני)</option>
                <option value="-3">קומה -3 (מרתף שלישי)</option>
              </select>
              {form.formState.errors.floor && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.floor.message}
                </p>
              )}
            </div>

            {/* מספר חנייה */}
            <div>
              <label htmlFor="spotNumber" className="block text-sm font-medium text-gray-700 mb-1">
                מספר חנייה בקומה *
              </label>
              <input
                {...form.register('spotNumber')}
                id="spotNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="מספר החנייה (לדוגמה: 15, 127, 5)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                הזן את המספר המדויק שמופיע על החנייה או במסמכי הבעלות
              </p>
              {form.formState.errors.spotNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.spotNumber.message}
                </p>
              )}
            </div>

            {/* מידע נוסף */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                מידע נוסף (אופציונלי)
              </label>
              <textarea
                {...form.register('additionalInfo')}
                id="additionalInfo"
                rows={3}
                placeholder="מידע נוסף שיעזור לוועד הבית לאמת את החנייה..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* הסכמות */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                תנאים לאישור:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• אני מאשר שהחנייה המבוקשת שייכת לי על פי תעודת הבעלות</li>
                <li>• אני מתחייב להשכיר את החנייה באמצעות מערכת הנקודות בלבד</li>
                <li>• אני מבין שמידע כוזב עלול להוביל לביטול החשבון</li>
              </ul>
            </div>

            {/* כפתורי פעולה */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {form.formState.isSubmitting ? 'שולח בקשה...' : 'שלח בקשה לוועד הבית'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
