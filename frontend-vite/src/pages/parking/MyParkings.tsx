import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// נתונים דמה לבינתיים - חניות בפאדובה 32
const mockParkings = [
  {
    id: '1',
    address: 'פאדובה 32, תל אביב',
    floor: '-2',
    spotNumber: '127',
    pricePerHour: 5, // נקודות
    parkingType: 'COVERED',
    isAvailable: true,
    reservationsCount: 3,
    monthlyEarnings: 90 // נקודות
  },
  {
    id: '2', 
    address: 'פאדובה 32, תל אביב',
    floor: '-1',
    spotNumber: '45',
    pricePerHour: 5, // נקודות
    parkingType: 'PRIVATE',
    isAvailable: false,
    reservationsCount: 5,
    monthlyEarnings: 156 // נקודות
  }
];

export const MyParkings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          רק בעלי חניות יכולים לראות את הדף הזה
        </div>
      </div>
    );
  }

  const getParkingTypeText = (type: string) => {
    switch (type) {
      case 'COVERED': return 'מקורה';
      case 'PRIVATE': return 'פרטית';
      case 'OPEN': return 'גלויה';
      default: return type;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">הניהול שלי</h1>
        <button
          onClick={() => navigate('/add-parking')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + הוסף חנייה חדשה
        </button>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{mockParkings.length}</div>
          <div className="text-sm text-gray-600">סך חניות</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {mockParkings.filter(p => p.isAvailable).length}
          </div>
          <div className="text-sm text-gray-600">זמינות</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">
            {mockParkings.reduce((sum, p) => sum + p.reservationsCount, 0)}
          </div>
          <div className="text-sm text-gray-600">הזמנות החודש</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">
            {mockParkings.reduce((sum, p) => sum + p.monthlyEarnings, 0)} נקודות
          </div>
          <div className="text-sm text-gray-600">הכנסות החודש</div>
        </div>
      </div>

      {/* רשימת חניות */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">החניות שלי</h2>
        </div>
        
        {mockParkings.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              אין לך חניות עדיין
            </h3>
            <p className="text-gray-500 mb-4">
              התחל להרוויח מהחניות שלך על ידי הוספת החנייה הראשונה
            </p>
            <button
              onClick={() => navigate('/add-parking')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              הוסף חנייה ראשונה
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {mockParkings.map((parking) => (
              <div key={parking.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        קומה {parking.floor}, חנייה #{parking.spotNumber}
                      </h3>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parking.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parking.isAvailable ? 'זמינה' : 'תפוסה'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getParkingTypeText(parking.parkingType)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="font-medium">{parking.address}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">מחיר:</span> {parking.pricePerHour} נקודות/שעה
                      </div>
                      <div>
                        <span className="font-medium">הזמנות החודש:</span> {parking.reservationsCount}
                      </div>
                      <div>
                        <span className="font-medium">הכנסות החודש:</span> {parking.monthlyEarnings} נקודות
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse mr-4">
                    <button
                      onClick={() => navigate(`/parking/${parking.id}/edit`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => navigate(`/parking/${parking.id}/reservations`)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      הזמנות
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('האם אתה בטוח שברצונך למחוק את החנייה?')) {
                          alert('החנייה נמחקה (זמנית - יחובר לשרת)');
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* כפתור חזרה */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← חזור לדשבורד
        </button>
      </div>
    </div>
  );
};
