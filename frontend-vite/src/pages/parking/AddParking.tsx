import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';

// סכימת וולידציה לטופס הוספת חנייה
const addParkingSchema = z.object({
  description: z.string().optional(),
  parkingType: z.enum(['PRIVATE', 'COVERED', 'OPEN'], {
    errorMap: () => ({ message: 'בחר סוג חנייה' })
  }),
  maxHeight: z.number().optional(),
  hasElectricCharging: z.boolean().default(false),
  isAccessible: z.boolean().default(false),
  instructions: z.string().optional(),
  isAvailable: z.boolean().default(true)
});

type AddParkingFormData = z.infer<typeof addParkingSchema>;

// קבועים של המערכת
const FIXED_ADDRESS = 'פאדובה 32, תל אביב';
const FIXED_PRICE_PER_HOUR = 5; // נקודות

export const AddParking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [approvedClaim, setApprovedClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<AddParkingFormData>({
    resolver: zodResolver(addParkingSchema),
    defaultValues: {
      isAvailable: true,
      hasElectricCharging: false,
      isAccessible: false,
      parkingType: 'PRIVATE'
    }
  });

  // בדיקה האם יש אישור חנייה
  useEffect(() => {
    const checkApprovedClaim = async () => {
      try {
        // TODO: קריאה לשרת לבדיקת אישור
        // const response = await apiClient.get('/parking-claims/my-approved');
        // setApprovedClaim(response.data);
        
        // זמנית - דמה
        const mockApprovedClaim = {
          floor: '-2',
          spotNumber: '127',
          approvedAt: new Date()
        };
        setApprovedClaim(mockApprovedClaim);
      } catch (error) {
        console.error('שגיאה בבדיקת אישור חנייה:', error);
        setApprovedClaim(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkApprovedClaim();
    }
  }, [user]);

  const handleSubmit = async (data: AddParkingFormData) => {
    if (!approvedClaim) {
      alert('אין לך אישור חנייה מוועד הבית');
      return;
    }

    try {
      const parkingData = {
        ...data,
        address: FIXED_ADDRESS,
        floor: approvedClaim.floor,
        spotNumber: approvedClaim.spotNumber,
        pricePerHour: FIXED_PRICE_PER_HOUR
      };
      
      console.log('נתוני חנייה חדשה:', parkingData);
      // TODO: שליחה לשרת
      alert('החנייה נוספה בהצלחה! (זמנית - יחובר לשרת)');
      navigate('/my-parkings');
    } catch (error) {
      console.error('שגיאה בהוספת החנייה:', error);
    }
  };

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          רק בעלי חניות יכולים להוסיף חניות חדשות
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>בודק אישור חנייה...</p>
        </div>
      </div>
    );
  }

  if (!approvedClaim) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <span className="text-4xl mb-4 block">🚫</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              נדרש אישור חנייה מוועד הבית
            </h2>
            <p className="text-gray-600 mb-6">
              כדי להוסיף חנייה, עליך קודם לקבל אישור מוועד הבית שהחנייה באמת שייכת לך.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/request-parking-claim')}
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                בקש אישור חנייה מוועד הבית
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="block w-full text-gray-600 hover:text-gray-800"
              >
                חזור לדשבורד
              </button>
            </div>
          </div>
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
              הוסף חנייה חדשה
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
          {/* מידע מאושר מוועד הבית */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              ✅ חנייה מאושרת על ידי ועד הבית
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">כתובת:</span>
                <div className="text-green-800">{FIXED_ADDRESS}</div>
              </div>
              <div>
                <span className="font-medium text-green-700">מיקום:</span>
                <div className="text-green-800">
                  קומה {approvedClaim.floor}, חנייה #{approvedClaim.spotNumber}
                </div>
              </div>
              <div>
                <span className="font-medium text-green-700">סטטוס:</span>
                <div className="text-green-800">מאושר לפרסום</div>
              </div>
            </div>
          </div>

          {/* מחיר קבוע */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              💎 מחיר חנייה במערכת הנקודות
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {FIXED_PRICE_PER_HOUR} נקודות לשעה
            </div>
            <p className="text-xs text-blue-600 mt-1">
              מחיר קבוע לכל החניות במערכת
            </p>
          </div>

          {/* תיאור */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              תיאור החנייה (אופציונלי)
            </label>
            <textarea
              {...form.register('description')}
              id="description"
              rows={3}
              placeholder="פרטים נוספים על החנייה..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* גובה מקסימלי */}
          <div>
            <label htmlFor="maxHeight" className="block text-sm font-medium text-gray-700 mb-1">
              גובה מקסימלי (מטר)
            </label>
            <input
              {...form.register('maxHeight', { valueAsNumber: true })}
              id="maxHeight"
              type="number"
              step="0.1"
              min="0"
              placeholder="2.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* סוג חנייה */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג חנייה *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'PRIVATE', label: 'פרטית' },
                { value: 'COVERED', label: 'מקורה' },
                { value: 'OPEN', label: 'גלויה' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    {...form.register('parkingType')}
                    type="radio"
                    value={option.value}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="mr-2 text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.parkingType && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.parkingType.message}
              </p>
            )}
          </div>

          {/* אפשרויות נוספות */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">אפשרויות נוספות</h3>
            
            <label className="flex items-center">
              <input
                {...form.register('isAvailable')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="mr-2 text-sm text-gray-900">זמינה להזמנה</span>
            </label>

            <label className="flex items-center">
              <input
                {...form.register('hasElectricCharging')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="mr-2 text-sm text-gray-900">נקודת טעינה לרכב חשמלי</span>
            </label>

            <label className="flex items-center">
              <input
                {...form.register('isAccessible')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="mr-2 text-sm text-gray-900">נגישות לבעלי מוגבלויות</span>
            </label>
          </div>

          {/* הוראות גישה */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              הוראות גישה
            </label>
            <textarea
              {...form.register('instructions')}
              id="instructions"
              rows={3}
              placeholder="כיצד להגיע לחנייה, איפה המפתח, וכו'..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {form.formState.isSubmitting ? 'מוסיף...' : 'הוסף חנייה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
