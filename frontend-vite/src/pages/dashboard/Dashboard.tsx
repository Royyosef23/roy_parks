import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            ברוך הבא, {user.firstName}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* כרטיס פרטי משתמש */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        פרטי המשתמש
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user.email}
                      </dd>
                      <dd className="text-sm text-gray-500">
                        {user.role === 'ADMIN' ? 'מנהל' : 'דייר'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* כרטיס בניין */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        הבניין שלי
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        פאדובה 32, תל אביב
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* כרטיס נקודות */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        הנקודות שלי
                      </dt>
                      <dd className="text-2xl font-bold text-blue-600">
                        {(user as any).points || 0} נקודות
                      </dd>
                      <dd className="text-xs text-gray-500">
                        שווה ל-{Math.floor(((user as any).points || 0) / 5)} שעות חנייה
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mt-6">
            {/* כרטיס פעולות מהירות */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        פעולות מהירות
                      </dt>
                      <dd className="mt-2 space-y-2">
                        {user.role === 'ADMIN' ? (
                          <>
                            <button 
                              onClick={() => navigate('/vaad-management')}
                              className="block w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors font-medium"
                            >
                                ניהול בקשות אישור חניות
                            </button>
                            <button 
                              onClick={() => navigate('/admin-dashboard')}
                              className="block w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            >
                               דשבורד ניהול
                            </button>
                          </>
                        ) : user.role === 'RESIDENT' ? (
                          <>
                            <button 
                              onClick={() => navigate('/add-parking')}
                              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                               הוסף חנייה חדשה
                            </button>
                            <button 
                              onClick={() => navigate('/my-parkings')}
                              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                               הניהול שלי
                            </button>
                            <button 
                              onClick={() => navigate('/reservations')}
                              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                               צפה בהזמנות
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => navigate('/search-parking')}
                              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                               חפש חנייה
                            </button>
                            <button 
                              onClick={() => navigate('/my-reservations')}
                              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                               ההזמנות שלי
                            </button>
                          </>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* סטטיסטיקות */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              סטטיסטיקות
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">
                  {user.role === 'ADMIN' ? 'חניות פעילות' : 'הזמנות פעילות'}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">
                  {user.role === 'ADMIN' ? 'הזמנות השבוע' : 'הזמנות השבוע'}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600">
                  {user.role === 'ADMIN' ? 'הכנסות החודש' : 'הוצאות החודש'}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">⭐ 5.0</div>
                <div className="text-sm text-gray-600">דירוג ממוצע</div>
              </div>
            </div>
          </div>

          {/* הודעה זמנית */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              🚧 <strong>בפיתוח:</strong> הדשבורד נמצא בשלבי פיתוח. בקרוב יתווספו פיצ'רים נוספים כמו ניהול חניות, הזמנות ותשלומים.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
