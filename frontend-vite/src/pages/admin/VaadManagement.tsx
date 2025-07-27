import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// טיפוסים זמניים
interface ParkingClaim {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  floor: string;
  spotNumber: string;
  additionalInfo?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
}

// נתונים דמה לבינתיים
const mockPendingClaims: ParkingClaim[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      firstName: 'יוסי',
      lastName: 'כהן',
      email: 'yossi@example.com'
    },
    floor: '-2',
    spotNumber: '127',
    additionalInfo: 'זה ליד המעלית, חנייה פינתית',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    user: {
      id: 'user2',
      firstName: 'שרה',
      lastName: 'לוי',
      email: 'sarah@example.com'
    },
    floor: '-1',
    spotNumber: '45',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString() // אתמול
  },
  {
    id: '3',
    user: {
      id: 'user3',
      firstName: 'דני',
      lastName: 'אברהמי',
      email: 'danny@example.com'
    },
    floor: '-3',
    spotNumber: '89',
    additionalInfo: 'חנייה רחבה, מתאימה לרכב גדול',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000).toISOString() // לפני יומיים
  }
];

export const VaadManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ParkingClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: טעינת בקשות מהשרת
    setTimeout(() => {
      setClaims(mockPendingClaims);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (claimId: string) => {
    if (!confirm('האם אתה בטוח שברצונך לאשר את הבקשה? המשתמש יקבל 15 נקודות.')) {
      return;
    }

    setProcessingClaimId(claimId);
    try {
      // TODO: שליחה לשרת
      console.log('מאשר בקשה:', claimId);
      
      // עדכון מקומי זמני
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'APPROVED' as const,
              approvedAt: new Date().toISOString()
            }
          : claim
      ));
      
      alert('הבקשה אושרה בהצלחה! המשתמש קיבל 15 נקודות.');
    } catch (error) {
      console.error('שגיאה באישור הבקשה:', error);
      alert('שגיאה באישור הבקשה');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleReject = async (claimId: string) => {
    const reason = prompt('הזן סיבה לדחיית הבקשה:');
    if (!reason) return;

    setProcessingClaimId(claimId);
    try {
      // TODO: שליחה לשרת
      console.log('דוחה בקשה:', claimId, 'סיבה:', reason);
      
      // עדכון מקומי זמני
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'REJECTED' as const,
              rejectedAt: new Date().toISOString(),
              rejectReason: reason
            }
          : claim
      ));
      
      alert('הבקשה נדחתה.');
    } catch (error) {
      console.error('שגיאה בדחיית הבקשה:', error);
      alert('שגיאה בדחיית הבקשה');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFloorText = (floor: string) => {
    switch (floor) {
      case '-1': return 'קומה -1 (מרתף ראשון)';
      case '-2': return 'קומה -2 (מרתף שני)';
      case '-3': return 'קומה -3 (מרתף שלישי)';
      default: return `קומה ${floor}`;
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          רק חברי ועד הבית יכולים לגשת לדף זה
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>טוען בקשות...</p>
        </div>
      </div>
    );
  }

  const pendingClaims = claims.filter(claim => claim.status === 'PENDING');
  const processedClaims = claims.filter(claim => claim.status !== 'PENDING');

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול בקשות אישור חניות</h1>
        <p className="text-gray-600 mt-1">פאדובה 32 - ועד הבית</p>
      </div>

      {/* סטטיסטיקות מהירות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{pendingClaims.length}</div>
          <div className="text-sm text-gray-600">בקשות ממתינות</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {processedClaims.filter(c => c.status === 'APPROVED').length}
          </div>
          <div className="text-sm text-gray-600">בקשות מאושרות</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {processedClaims.filter(c => c.status === 'REJECTED').length}
          </div>
          <div className="text-sm text-gray-600">בקשות שנדחו</div>
        </div>
      </div>

      {/* בקשות ממתינות */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          בקשות ממתינות לאישור ({pendingClaims.length})
        </h2>
        
        {pendingClaims.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              אין בקשות ממתינות
            </h3>
            <p className="text-gray-500">
              כל הבקשות טופלו. בקשות חדשות יופיעו כאן.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="bg-white border border-orange-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {claim.user.firstName} {claim.user.lastName}
                      </h3>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        ממתין לאישור
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">אימייל:</span>
                        <div className="text-gray-900">{claim.user.email}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">חנייה מבוקשת:</span>
                        <div className="text-gray-900">{getFloorText(claim.floor)} - חנייה #{claim.spotNumber}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">תאריך בקשה:</span>
                        <div className="text-gray-900">{formatDate(claim.createdAt)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">כתובת:</span>
                        <div className="text-gray-900">פאדובה 32, תל אביב</div>
                      </div>
                    </div>
                    
                    {claim.additionalInfo && (
                      <div className="mb-4">
                        <span className="font-medium text-gray-700">מידע נוסף:</span>
                        <div className="text-gray-900 mt-1 p-2 bg-gray-50 rounded text-sm">
                          {claim.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse mr-4">
                    <button
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingClaimId === claim.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {processingClaimId === claim.id ? 'מאשר...' : '✓ אשר'}
                    </button>
                    <button
                      onClick={() => handleReject(claim.id)}
                      disabled={processingClaimId === claim.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {processingClaimId === claim.id ? 'דוחה...' : '✗ דחה'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* בקשות שטופלו */}
      {processedClaims.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            בקשות שטופלו ({processedClaims.length})
          </h2>
          
          <div className="space-y-2">
            {processedClaims.map((claim) => (
              <div key={claim.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="font-medium text-gray-900">
                        {claim.user.firstName} {claim.user.lastName}
                      </span>
                      <span className="text-gray-600">
                        {getFloorText(claim.floor)} - חנייה #{claim.spotNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(claim.approvedAt || claim.rejectedAt || claim.createdAt)}
                      </span>
                    </div>
                    {claim.rejectReason && (
                      <div className="text-sm text-red-600 mt-1">
                        סיבת דחייה: {claim.rejectReason}
                      </div>
                    )}
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {claim.status === 'APPROVED' ? 'אושר' : 'נדחה'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
