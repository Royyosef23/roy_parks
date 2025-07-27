# 🚗 מערכת הוספת חניות - המרה מסימולציה ל-API אמיתי

## סקירה כללית

הפכנו את מערכת הוספת החניות מסימולציה בצד הקליינט ל-API מלא עם חיבור לבסיס נתונים.

## מה שהוסף/שונה

### 🔧 Backend Changes

#### 1. **Controller חדש לחניות** (`src/controllers/parkingController.ts`)
- `addParkingSpot` - הוספת חנייה חדשה
- `getMyParkingSpots` - קבלת החניות של המשתמש
- `updateParkingSpot` - עדכון חנייה קיימת
- `deleteParkingSpot` - מחיקת חנייה
- `getAvailableParkingSpots` - קבלת חניות זמינות (ציבורי)

#### 2. **Routes מעודכנים** (`src/routes/parking.ts`)
```
POST   /api/v1/parking-spots          - הוספת חנייה
GET    /api/v1/parking-spots/my-spots - החניות שלי
PUT    /api/v1/parking-spots/:id      - עדכון חנייה
DELETE /api/v1/parking-spots/:id      - מחיקת חנייה
GET    /api/v1/parking-spots/available - חניות זמינות
```

#### 3. **Validation Schemas** (`src/middleware/validation.ts`)
- `addParkingSpotSchema` - ולידציה להוספת חנייה
- `updateParkingSpotSchema` - ולידציה לעדכון חנייה

#### 4. **Authentication & Authorization**
- כל הפעולות דורשות אימות JWT
- רק OWNER יכול להוסיף/לערוך/למחוק חניות
- זימת חניות זמינות - גישה ציבורית

### 🎨 Frontend Changes

#### 1. **Service חדש** (`src/services/parkingService.ts`)
```typescript
export const parkingService = {
  addParkingSpot(data: AddParkingSpotData),
  getMyParkingSpots(),
  getAvailableParkingSpots(filters?),
  updateParkingSpot(id, data),
  deleteParkingSpot(id)
}
```

#### 2. **Hook מותאם אישית** (`useParkingSpots`)
```typescript
const {
  spots,
  loading,
  error,
  fetchMySpots,
  addSpot,
  updateSpot,
  deleteSpot
} = useParkingSpots();
```

#### 3. **קומפוננט טופס** (`src/components/AddParkingSpotForm.tsx`)
- טופס מלא להוספת חנייה
- אימות בצד הקליינט
- טיפול בשגיאות
- UI ידידותי

## איך להשתמש

### דוגמה פשוטה בReact

```tsx
import { AddParkingSpotForm } from './components/AddParkingSpotForm';

function MyApp() {
  const handleSuccess = (newSpot) => {
    console.log('חנייה נוספה:', newSpot);
    // רענון הרשימה, ניווט, וכד'
  };

  return (
    <AddParkingSpotForm 
      onSuccess={handleSuccess}
      onCancel={() => console.log('המשתמש ביטל')}
    />
  );
}
```

### שימוש ישיר ב-Service

```typescript
import { parkingService } from './services/parkingService';

// הוספת חנייה
const newSpot = await parkingService.addParkingSpot({
  spotNumber: 'A-15',
  floor: '-1',
  size: 'REGULAR',
  type: 'GARAGE',
  hourlyRate: 15,
  dailyRate: 80,
  buildingId: 'building-id',
  description: 'חנייה נוחה'
});

// קבלת החניות שלי
const mySpots = await parkingService.getMyParkingSpots();

// חניות זמינות
const available = await parkingService.getAvailableParkingSpots({
  city: 'תל אביב',
  type: 'GARAGE'
});
```

## בדיקות

### Backend Demo Script
```bash
cd backend
node demo-parking-spots.js
```

### API Manual Testing
```bash
# התחברות
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"Owner123!"}'

# הוספת חנייה (עם טוקן)
curl -X POST http://localhost:3000/api/v1/parking-spots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "spotNumber": "A-101",
    "floor": "-1",
    "size": "REGULAR", 
    "type": "GARAGE",
    "hourlyRate": 15,
    "dailyRate": 80,
    "buildingId": "building-id"
  }'
```

## מבנה הנתונים

### ParkingSpot Model
```typescript
{
  id: string;
  spotNumber: string;        // "A-101"
  floor?: number;           // -1, -2, 0, 1...
  size: 'COMPACT' | 'REGULAR' | 'LARGE';
  type: 'OUTDOOR' | 'COVERED' | 'GARAGE';
  description?: string;
  hourlyRate: number;       // 15.00
  dailyRate: number;        // 80.00
  available: boolean;
  buildingId: string;
  building: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## אבטחה

1. **JWT Authentication** - כל הפעולות דורשות טוקן תקין
2. **Role-based Access** - רק OWNER יכול לנהל חניות
3. **Ownership Validation** - משתמש יכול לערוך רק את החניות שלו
4. **Input Validation** - Joi schemas לכל הנתונים הנכנסים
5. **Error Handling** - טיפול מקיף בשגיאות

## מה השתנה מהסימולציה הקודמת

| הסימולציה הקודמת | המערכת החדשה |
|------------------|---------------|
| `alert("החניה נוספה בהצלחה! (זמנית)")` | קריאה אמיתית לשרת + שמירה בDB |
| נתונים נשמרים ב-localStorage בלבד | נתונים נשמרים ב-PostgreSQL |
| אין אימות משתמשים | אימות JWT מלא |
| אין ולידציה של נתונים | ולידציה מקיפה עם Joi |
| אין קשר לבניינים | קשר מלא למודל Building |
| לא ניתן לחפש/לסנן | חיפוש וסינון חניות זמינות |

## הצעדים הבאים

1. **חיבור לפרונט-אנד** - שילוב הקומפוננט בדפי הפרונט-אנד
2. **תמונות** - הוספת אפשרות להעלאת תמונות לחניות
3. **מפות** - שילוב עם Google Maps לתצוגת מיקום
4. **התראות** - מערכת התראות בזמן אמת
5. **דוחות** - דשבורד עם נתונים סטטיסטיים

## קבצים שנוצרו/שונו

### Backend
- ✅ `src/controllers/parkingController.ts` (חדש)
- ✅ `src/routes/parking.ts` (עודכן)
- ✅ `src/middleware/validation.ts` (הוספו schemas)
- ✅ `demo-parking-spots.js` (חדש)

### Frontend
- ✅ `src/services/parkingService.ts` (חדש)
- ✅ `src/components/AddParkingSpotForm.tsx` (חדש)
- ✅ `src/components/AddParkingSpotForm.css` (חדש)

המערכת כעת מוכנה לשימוש production עם API מלא ואמיתי! 🎉
