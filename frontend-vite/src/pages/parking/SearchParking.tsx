import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// נתונים דמה לבינתיים
const mockAvailableParkings = [
  {
    id: '1',
    address: 'הרצל 123, תל אביב',
    hourlyPrice: 12.5,
    parkingType: 'COVERED',
    distance: 0.3,
    rating: 4.8,
    hasElectricCharging: true,
    isAccessible: false,
    ownerName: 'יוסי כהן'
  },
  {
    id: '2',
    address: 'דיזנגוף 45, תל אביב',
    hourlyPrice: 15.0,
    parkingType: 'PRIVATE',
    distance: 0.7,
    rating: 4.9,
    hasElectricCharging: false,
    isAccessible: true,
    ownerName: 'שרה לוי'
  },
  {
    id: '3',
    address: 'רוטשילד 87, תל אביב',
    hourlyPrice: 18.0,
    parkingType: 'COVERED',
    distance: 1.2,
    rating: 4.6,
    hasElectricCharging: true,
    isAccessible: true,
    ownerName: 'דני אברהמי'
  }
];

export const SearchParking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [duration, setDuration] = useState('2');

  const getParkingTypeText = (type: string) => {
    switch (type) {
      case 'COVERED': return 'מקורה';
      case 'PRIVATE': return 'פרטית';
      case 'OPEN': return 'גלויה';
      default: return type;
    }
  };

  const handleSearch = () => {
    console.log('חיפוש חניות:', { searchLocation, searchDate, searchTime, duration });
    // TODO: שליחה לשרת
  };

  const handleBooking = (parkingId: string) => {
    navigate(`/book-parking/${parkingId}`, {
      state: { 
        date: searchDate, 
        time: searchTime, 
        duration 
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">חפש חנייה</h1>
        <p className="text-gray-600">מצא את החנייה המושלמת בקרבתך</p>
      </div>

      {/* טופס חיפוש */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              מיקום
            </label>
            <input
              id="location"
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="כתובת או אזור"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              תאריך
            </label>
            <input
              id="date"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              שעה
            </label>
            <input
              id="time"
              type="time"
              value={searchTime}
              onChange={(e) => setSearchTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              משך (שעות)
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.5">חצי שעה</option>
              <option value="1">שעה</option>
              <option value="2">שעתיים</option>
              <option value="3">3 שעות</option>
              <option value="4">4 שעות</option>
              <option value="8">יום מלא</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            🔍 חפש חניות
          </button>
        </div>
      </div>

      {/* תוצאות חיפוש */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          חניות זמינות ({mockAvailableParkings.length})
        </h2>
        
        {mockAvailableParkings.map((parking) => (
          <div key={parking.id} className="bg-white rounded-lg shadow p-6 border hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {parking.address}
                  </h3>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      ₪{parking.hourlyPrice}/שעה
                    </div>
                    <div className="text-sm text-gray-500">
                      סה"כ: ₪{(parking.hourlyPrice * parseFloat(duration)).toFixed(1)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <span className="font-medium">סוג:</span>
                    <span className="mr-1">{getParkingTypeText(parking.parkingType)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">מרחק:</span>
                    <span className="mr-1">{parking.distance} ק"מ</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">דירוג:</span>
                    <span className="mr-1">⭐ {parking.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">בעלים:</span>
                    <span className="mr-1">{parking.ownerName}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  {parking.hasElectricCharging && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🔌 טעינה חשמלית
                    </span>
                  )}
                  {parking.isAccessible && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ♿ נגיש
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mr-6">
                <button
                  onClick={() => handleBooking(parking.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  הזמן עכשיו
                </button>
              </div>
            </div>
          </div>
        ))}
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
