# 🎯 **ParkBnB - פלטפורמת השכרת חניות**

## **מה זה הפרויקט?**

**ParkBnB** זה פלטפורמה דיגיטלית שמחברת בין דיירים בבניינים מגורים שיש להם חנייה פנויה לבין דיירים אחרים באותו בניין שצריכים חנייה זמנית.

**דוגמה למקרה שימוש**: דייר שהבן שלו בא לבקר לכמה שעות וצריך חנייה - יוכל להשכיר חנייה מדייר אחר באותו בניין שלא משתמש בה באותן השעות.

**איך זה עובד**:
- דיירים מפרסמים מתי הם לא משתמשים בחניות שלהם
- דיירים אחרים באותו בניין יכולים לשכור את החניות הזמינות
- המערכת פועלת לפי **שיטת נקודות** במקום כסף
- כל שעת חנייה עולה **5 נקודות**
- כל דייר שמצטרף מקבל **25 נקודות** על כל חנייה שהוא מצהיר שיש לו
- חניות עוברות **מנגון אישור מוועד הבית** לפני שהן זמינות להשכרה

**המטרה**: לפתור את בעיית החנייה בבניינים מגורים ולאפשר שיתוף יעיל של משאבי חנייה בתוך קהילת הדיירים.

**תאריך יצירה**: יולי 2025  
**מפתח**: Roy Yosef  
**סטטוס**: 🟡 בפיתוח פעיל (Phase 1 - MVP)

---

## 🏗️ **ארכיטקטורה נוכחית**

### **מבנה הפרויקט:**
```
roy_parks/
├── backend/           # שרת API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # עסק logic (auth, users, buildings, etc.)
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # אימות, validation, error handling
│   │   ├── services/      # שירותים חיצוניים (email, payment)
│   │   └── utils/         # פונקציות עזר
│   ├── prisma/           # סכימת מסד נתונים ו-migrations
│   └── package.json      # dependencies ו-scripts
├── frontend-vite/     # ממשק משתמש (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/   # רכיבים (בתכנון)
│   │   ├── pages/        # דפים עיקריים (בתכנון)
│   │   └── services/     # API calls (בתכנון)
│   └── package.json     # dependencies ו-scripts
├── database/          # קבצי SQL נוספים
├── docs/              # תיעוד מקיף
│   ├── ARCHITECTURE.md     # ארכיטקטורה טכנית
│   ├── DEVELOPMENT_PLAN.md # תכנית פיתוח
│   └── PROJECT_OVERVIEW.md # המסמך הזה
└── docker-compose.yml # הרצה עם Docker (PostgreSQL + Redis)
```

### **טכנולוגיות עיקריות:**

#### **Backend:**
- **Node.js 18+** - סביבת הרצה
- **Express.js** - web framework
- **TypeScript** - בטיחות טיפוסים
- **Prisma** - ORM מודרני לPostgreSQL
- **PostgreSQL 14+** - מסד נתונים יחסי
- **JWT** - אימות משתמשים
- **bcrypt** - הצפנת סיסמאות
- **helmet** - אבטחה בסיסית
- **cors** - חיבור מהfrontend

#### **Frontend:**
- **React 18** - ספריית UI
- **TypeScript** - בטיחות טיפוסים
- **Vite** - כלי פיתוח מהיר
- **Tailwind CSS** - עיצוב מהיר (מתוכנן)

#### **DevOps:**
- **Docker + Docker Compose** - קונטיינרים
- **PostgreSQL** - מסד נתונים יחסי
- **Redis** - קאש מהיר (מתוכנן)
- **GitHub Actions** - CI/CD (מתוכנן)

---

## 📊 **מודל הנתונים**

### **ישויות עיקריות:**

#### **1. Users (משתמשים)**
```typescript
{
  id: string           // מזהה ייחודי
  email: string        // אימייל ייחודי
  password: string     // סיסמה מוצפנת
  firstName: string    // שם פרטי
  lastName: string     // שם משפחה
  phone?: string       // טלפון (אופציונלי)
  avatar?: string      // תמונת פרופיל
  role: UserRole       // RENTER | OWNER | ADMIN
  verified: boolean    // האם האימייל מאומת
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### **2. Buildings (בניינים)**
```typescript
{
  id: string
  name: string         // שם הבניין
  address: string      // כתובת מלאה
  city: string         // עיר
  latitude: number     // קואורדינטות
  longitude: number
  description?: string // תיאור
  amenities: string[]  // שירותים (מעלית, שומר, וכו')
  totalSpots: number   // מספר חניות כולל
  ownerId: string      // בעל הבניין
  createdAt: DateTime
}
```

#### **3. ParkingSpots (חניות)**
```typescript
{
  id: string
  number: string       // מספר החנייה
  floor: string        // קומה
  type: SpotType       // REGULAR | HANDICAPPED | ELECTRIC
  size: SpotSize       // SMALL | MEDIUM | LARGE
  features: string[]   // תכונות (מקורה, חשמל, וכו')
  hourlyRate: number   // תעריף לשעה
  dailyRate: number    // תעריף ליום
  monthlyRate?: number // תעריף חודשי
  available: boolean   // זמין כעת
  buildingId: string
  createdAt: DateTime
}
```

#### **4. Bookings (הזמנות)**
```typescript
{
  id: string
  startTime: DateTime  // זמן התחלה
  endTime: DateTime    // זמן סיום
  totalAmount: number  // סכום כולל
  status: BookingStatus // PENDING | CONFIRMED | COMPLETED | CANCELLED
  paymentStatus: PaymentStatus // PENDING | PAID | REFUNDED
  userId: string       // המזמין
  spotId: string       // החנייה
  createdAt: DateTime
}
```

#### **5. Reviews (ביקורות)**
```typescript
{
  id: string
  rating: number       // דירוג 1-5
  comment?: string     // הערה
  userId: string       // כותב הביקורת
  spotId: string       // החנייה שדורגה
  bookingId: string    // ההזמנה הקשורה
  createdAt: DateTime
}
```

#### **6. Payments (תשלומים)**
```typescript
{
  id: string
  amount: number
  currency: string     // ILS
  method: PaymentMethod // CREDIT_CARD | PAYPAL | BANK_TRANSFER
  stripePaymentId?: string
  status: PaymentStatus
  bookingId: string
  createdAt: DateTime
}
```

#### **7. PointsTransactions (טרנזקציות נקודות)**
```typescript
{
  id: string
  userId: string       // מי ביצע את הטרנזקציה
  points: number       // כמות נקודות (+/-)
  type: TransactionType // EARN | SPEND | INITIAL_GRANT
  reason: string       // סיבה לטרנזקציה
  bookingId?: string   // קשר להזמנה (אם רלוונטי)
  spotId?: string      // קשר לחנייה (אם רלוונטי)
  createdAt: DateTime
}
```

#### **8. UserPointsBalance (יתרת נקודות משתמשים)**
```typescript
{
  userId: string       // מזהה המשתמש
  currentBalance: number // יתרה נוכחית
  totalEarned: number  // סך כל הנקודות שהרוויח
  totalSpent: number   // סך כל הנקודות שהוציא
  updatedAt: DateTime
}
```

---

## 🎯 **תכונות מתוכננות**

### **לדיירים משכירים (בעלי חניות):**
- 📝 **רישום חניות** - הצהרה על חניות שבבעלותם + אישור ועד הבית
- 💰 **קביעת זמינות** - מתי הם לא משתמשים בחנייה
- 📅 **ניהול זמינות** - עדכון שעות זמינות בזמן אמת
- 📊 **מעקב נקודות** - כמה נקודות הרוויחו מהשכרת חניות
- 📷 **תמונות חניות** - תיעוד מיקום ומספר החנייה
- ⚙️ **הגדרות מתקדמות** - זמינות אוטומטית, חסימת תאריכים

### **לדיירים שוכרים (מחפשי חנייה):**
- 🔍 **חיפוש חניות זמינות** - בבניין שלהם בתאריכים ושעות ספציפיות
- � **מערכת נקודות** - תשלום בנקודות במקום כסף
- ⭐ **דירוגים וחוות דעת** - מתן משוב על איכות החניות
- 📱 **הודעות ועדכונים** - התראות על אישור/ביטול הזמנות
- 🎫 **היסטוריית הזמנות** - כל ההזמנות הקודמות ויתרת נקודות
- 🕐 **הזמנות מיידיות** - אישור אוטומטי לחניות זמינות

### **לוועד הבית (אדמינים):**
- 👥 **ניהול דיירים** - אישור דיירים חדשים בבניין
- 🏢 **אישור חניות** - אימות שחניות שבובעלות הדיירים באמת
- 💼 **מתן נקודות ראשוניות** - 25 נקודות לכל חנייה מאושרת
- 📈 **ניתוח שימוש** - סטטיסטיקות על שימוש בחניות בבניין
- 🛡️ **מערכת דיווחים** - טיפול בתלונות ובעיות בין דיירים
- 💰 **ניהול מערכת הנקודות** - הוספת/הפחתת נקודות במקרי חירום

---

## 📈 **מצב פיתוח נוכחי**

### **✅ מה כבר מוכן והושלם:**
- ✅ **מבנה תיקיות מקצועי** - ארכיטקטורה נקייה ומסודרת
- ✅ **סכימת מסד נתונים מלאה** - כל הטבלאות מוגדרות בPrisma
- ✅ **התקנת dependencies** - כל החבילות הנדרשות
- ✅ **תשתית Backend** - Express + TypeScript + middleware בסיסי
- ✅ **מערכת אימות JWT** - register, login, logout
- ✅ **Docker configuration** - PostgreSQL + Redis + network
- ✅ **תיעוד מקיף** - README, ARCHITECTURE, DEVELOPMENT_PLAN
- ✅ **Routes מבנה** - auth, users, buildings, parking, bookings
- ✅ **Error handling** - middleware לטיפול בשגיאות
- ✅ **Validation middleware** - בדיקת נתונים נכנסים

### **🟡 בפיתוח כעת:**
- 🟡 **Controllers implementation** - השלמת הלוגיקה העסקית
- 🟡 **Frontend components** - מעבר מVite default לממשק אמיתי
- 🟡 **Database migrations** - הרצת הseed הראשון
- 🟡 **API testing** - בדיקת endpoints עם Postman/Thunder Client

### **❌ מה עוד לא התחיל:**
- ❌ **Frontend מפותח** - עדיין template של Vite
- ❌ **אינטגרציית תשלומים** - Stripe integration
- ❌ **מערכת הודעות** - Email/SMS notifications
- ❌ **אינטגרציית מפות** - Google Maps API
- ❌ **File upload** - תמונות של חניות
- ❌ **בדיקות אוטומטיות** - Jest/Cypress tests
- ❌ **אפליקציית מובייל** - React Native (עתידי)
- ❌ **CI/CD pipeline** - GitHub Actions

---

## 🚀 **יעדי ה-MVP (חודש הקרוב)**

### **Core API & Authentication**
**מטרה**: בניית תשתית Backend מוצקה ומאובטחת

#### תכונות מרכזיות:
- ✅ **CRUD ל-Users, Buildings, ParkingSpots** - פעולות יצירה, קריאה, עדכון ומחיקה
- ✅ **מערכת Authentication/Authorization** עם JWT ו-bcrypt
- ✅ **Middleware לבדיקת הרשאות** - הבחנה בין Admin (ועד בית) לUser (דייר)
- ✅ **מודלי נתונים מלאים** - כולל טבלאות נקודות וטרנזקציות

#### APIs נדרשים:
```typescript
// Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

// Users
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/points-balance

// Buildings (Admin only)
POST   /api/v1/buildings
GET    /api/v1/buildings/:id
PUT    /api/v1/buildings/:id

// Parking Spots
POST   /api/v1/parking-spots
GET    /api/v1/parking-spots/building/:buildingId
PUT    /api/v1/parking-spots/:id/approve (Admin only)
```

---

### **ניהול זמינות וחישוב נקודות**
**מטרה**: לוגיקה עסקית לניהול חניות ומערכת נקודות

#### תכונות מרכזיות:
- 🔄 **Endpoint לניהול זמינות ParkingSpot** (start/end time)
- 💎 **לוגיקה לחישוב נקודות**:
  - השכרת חנייה מורידה **5 נקודות לשעה**
  - שחרור חנייה מוסיף **5 נקודות לשעה** למשכיר
  - דייר חדש מקבל **25 נקודות** לכל חנייה מאושרת
- 🗃️ **טבלה ב-Postgres ל-Transactions** (הקצאת/ניכוי נקודות)
- ⚡ **פעולות אטומיות** - כל שינוי בנקודות מתועד בטרנזקציה

#### APIs נדרשים:
```typescript
// Availability Management
POST   /api/v1/parking-spots/:id/availability
GET    /api/v1/parking-spots/:id/available-times
DELETE /api/v1/parking-spots/:id/availability/:timeSlotId

// Points System
GET    /api/v1/users/points/balance
GET    /api/v1/users/points/transactions
POST   /api/v1/admin/points/grant (Admin only)
```

---

### **Booking Flow**
**מטרה**: מערכת הזמנות מלאה עם workflow אישורים

#### תכונות מרכזיות:
- 📝 **יצירת Booking והקצאת נקודות** (אטומי, בטרנזקציה)
- 🔄 **סטטוסים מתקדמים**:
  - `PENDING` → ממתין לאישור ועד הבית
  - `APPROVED` → אושר על ידי ועד הבית
  - `COMPLETED` → הושלם בהצלחה
  - `CANCELLED` → בוטל (החזרת נקודות)
- 📧 **Email/SMS Notification בסיסי** למשתמשים כאשר סטטוס משתנה
- 🔒 **בדיקות הרשאות** - רק ועד הבית יכול לאשר הזמנות

#### APIs נדרשים:
```typescript
// Booking Management
POST   /api/v1/bookings
GET    /api/v1/bookings/my-bookings
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id/approve (Admin only)
PUT    /api/v1/bookings/:id/cancel
```

---

### **Frontend בסיסי**
**מטרה**: ממשק משתמש פונקציונלי וידידותי

#### דפים מרכזיים:
- 🔐 **דף Login/Register** - אימות משתמשים
- 📊 **דף Dashboard למשתמש**:
  - צפייה ביתרת נקודות זמינה
  - רשימת חניות זמינות בבניין
  - מעקב אחר הזמנות קיימות
- 📝 **דף יצירת Booking** - בחירת חנייה ושעות
- 📋 **רשימת Bookings קיימות** + מעקב סטטוס

#### טכנולוגיות:
- ⚡ **Vite + React + TypeScript** - פיתוח מהיר ויעיל
- 🎨 **Tailwind CSS** - עיצוב מהיר ומותאם לצייל
- 🔄 **React Query** - ניהול מצב ו-API calls
- 📝 **React Hook Form + Zod** - טפסים ו-validation

---

### **DevOps & CI/CD**
**מטרה**: פריסה אוטומטית ותשתית יציבה

#### תשתית:
- 🐳 **Docker Compose** להרצת:
  - Backend (Node.js + Express)
  - PostgreSQL (מסד נתונים)
  - Redis (caching לגרסה עתידית)
- 🔄 **GitHub Actions**:
  - Build/Test ל-Backend (unit tests בסיסיים)
  - Build ל-Frontend
  - Deploy אוטומטי ל-staging (Azure App Service)

#### אבטחה ואמינות:
- 🛡️ **Rate limiting** (express-rate-limit)
- 🔒 **Helmet** להגנות HTTP headers
- 🌐 **CORS** קונפיגורציה מוגדרת
- 📝 **Logging** עם winston או pino
- 🚨 **Error handling** מתקדם

---

### **תיעוד והרצה מקומית**
**מטרה**: תיעוד מקיף לפיתוח ותחזוקה

#### תיעוד נדרש:
- 📖 **README** עם הוראות Run ל-Docker Compose
- 📋 **Postman Collection** / **Swagger** לתיעוד ה-API
- 🔧 **Environment Variables** - מדריך הגדרה
- 🧪 **Testing Guide** - איך להריץ בדיקות

---

## 📅 **לוח זמנים מוצע**

| שבוע | מטרה עיקרית | Deliverables |
|------|-------------|-------------|
| **1** | **Core API + Authentication** | CRUD Users/Spots, JWT, bcrypt, Middleware הרשאות |
| **2** | **זמינות & נקודות** | Availability endpoints, Transactions table, Points services |
| **3** | **Booking flow + Approvals** | Booking endpoints, approval workflow, Email notifications |
| **4** | **Frontend MVP + DevOps** | React UI בסיסי, Docker Compose, CI/CD pipelines, תיעוד |

---

## 🛠️ **דגשים והמלצות נוספות**

### **בדיקות אוטומטיות:**
- 🧪 **Unit tests** ל-core business logic (חישוב נקודות, יצירת booking)
- 🔄 **Integration tests** לAPI endpoints מרכזיים
- 🎯 **End-to-end tests** לזרימות משתמש מרכזיות

### **Logging & Error handling:**
- 📝 **winston או pino** ב-Node.js
- 🚨 **React ErrorBoundary** בצד frontend
- 📊 **Structured logging** עם correlation IDs

### **Validation:**
- ✅ **Joi/Zod** ל-API validation
- 📝 **React Hook Form + Zod** בצד ה-UI
- 🔍 **Input sanitization** למניעת XSS

### **Security:**
- 🚫 **Rate limiting** (express-rate-limit)
- 🔒 **Helmet** להגנות HTTP headers
- 🌐 **CORS** קונפיגורציה מוגדרת רק לדומיין שלך
- 🔐 **Environment management** - dotenv + GitHub Secrets

### **Monitoring:**
- 📈 **Health checks** לכל השירותים
- 📊 **Basic metrics** (response time, error rate)
- 🚨 **Console logging** ל-stdout עם אופציה ל-alerts

---

עם הגדרת milestones ברורים, קל יהיה לעקוב, לזהות חסרים בזמן אמת ולהעביר לעבודה הבאה (מפות, תשלומים ב-Stripe, ביקורות) ברצף נטול בלבול. 

**🎯 המוקד: לסיים MVP פונקציונלי שמשרת את הצרכים הבסיסיים של קהילת הדיירים בבניין!**

---

## 🎨 **ארכיטקטורה מומלצת - Layered Architecture**

### **1. הפרדת שכבות לפי תפקידים**

```
┌────────────────┐       ┌───────────────────────┐       ┌───────────────────┐
│  Front-end     │  ↔    │  API Gateway / Client │  ↔    │  Back-end         │
│ (React + UI)   │       │  (axios / react-query)│       │ (Express + TS)    │
└────────────────┘       └───────────────────────┘       └───────────────────┘
```

#### **UI Layer (React):**
- ✅ אחראית על תצוגה, ניהול state ו-UX בלבד
- ✅ כל חישוב או החלטה עסקית מורכבת מועברת ל-Backend
- ✅ React Query לניהול cache וריענון אוטומטי

#### **Client/API Layer (parkingApi.ts):**
- ✅ פונקציות שנקראות מ-UI וממירות קריאות HTTP
- ✅ axios/Fetch + React Query ל-caching וריענון
- ✅ Type-safe עם shared schemas

#### **Controller Layer (Express):**
- ✅ מקבל/בודק/ממיר request ל-DTO
- ✅ מפנה ל-Service ומחזיר response
- ✅ ולידציה עם Zod schemas

#### **Service (Business) Layer:**
- ✅ כל הלוגיקה העסקית: חישוב נקודות, חוקים, זמנים
- ✅ טרנזקציות אטומיות
- ✅ פונקציות או classes עם Dependency Injection

#### **Data Access Layer (Prisma):**
- ✅ CRUD ל-DB בלבד
- ✅ שליפת/שמירת נתונים ללא לוגיקה עסקית

---

### **2. מבנה Monorepo עם Shared Code**

```
roy_parks/
├── backend/                 # Backend עם Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # HTTP Controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── parking.controller.ts
│   │   │   └── points.controller.ts
│   │   ├── services/        # Business Logic Layer
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── parking.service.ts
│   │   │   ├── points.service.ts
│   │   │   └── notification.service.ts
│   │   ├── repositories/    # Data Access Layer
│   │   │   ├── user.repository.ts
│   │   │   ├── booking.repository.ts
│   │   │   └── points.repository.ts
│   │   ├── middleware/      # Express Middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── routes/          # API Routes
│   │   │   └── v1/
│   │   │       ├── auth.routes.ts
│   │   │       ├── booking.routes.ts
│   │   │       └── parking.routes.ts
│   │   ├── config/          # Configuration
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   └── redis.ts
│   │   └── utils/           # Shared Utilities
│   │       ├── logger.ts
│   │       ├── errors.ts
│   │       └── helpers.ts
│   ├── prisma/              # Database Schema & Migrations
│   └── tests/               # Backend Tests
├── frontend/                # Frontend עם React + TypeScript
│   ├── src/
│   │   ├── components/      # React Components
│   │   │   ├── common/      # Reusable UI Components
│   │   │   ├── layout/      # Layout Components
│   │   │   └── features/    # Feature-specific Components
│   │   ├── pages/           # Page Components
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── booking/
│   │   │   └── admin/
│   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBooking.ts
│   │   │   └── usePoints.ts
│   │   ├── api/             # API Client Layer
│   │   │   ├── authApi.ts
│   │   │   ├── bookingApi.ts
│   │   │   └── parkingApi.ts
│   │   ├── store/           # State Management
│   │   │   └── authStore.ts
│   │   └── utils/           # Frontend Utilities
│   │       ├── formatters.ts
│   │       └── validators.ts
└── shared/                  # שיתוף קוד בין Front ו-Back
    ├── schemas/             # Zod Schemas
    │   ├── auth.schema.ts
    │   ├── booking.schema.ts
    │   ├── parking.schema.ts
    │   └── points.schema.ts
    ├── types/               # TypeScript Types
    │   ├── auth.types.ts
    │   ├── booking.types.ts
    │   └── api.types.ts
    ├── constants/           # Shared Constants
    │   ├── roles.ts
    │   ├── booking-status.ts
    │   └── point-values.ts
    └── utils/               # Shared Utility Functions
        ├── dateUtils.ts
        └── validationUtils.ts
```

---

### **3. חוזים וממשקים (DTO & Schema)**

#### **Shared Schemas עם Zod:**
```typescript
// shared/schemas/booking.schema.ts
import { z } from 'zod';

export const CreateBookingSchema = z.object({
  spotId: z.string().uuid(),
  startTime: z.string().refine(s => !isNaN(Date.parse(s))),
  endTime: z.string().refine(s => !isNaN(Date.parse(s))),
});

export const BookingResponseSchema = z.object({
  id: z.string().uuid(),
  spotId: z.string().uuid(),
  startTime: z.string(),
  endTime: z.string(),
  totalPoints: z.number(),
  status: z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;
export type BookingResponseDTO = z.infer<typeof BookingResponseSchema>;
```

#### **Backend Controller:**
```typescript
// backend/src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import { CreateBookingSchema } from '../../../shared/schemas/booking.schema';
import { BookingService } from '../services/booking.service';

export class BookingController {
  static async create(req: Request, res: Response) {
    // 1. ולידציה עם Zod
    const dto = CreateBookingSchema.parse(req.body);
    
    // 2. העברה ל-Service Layer
    const booking = await BookingService.create(dto, req.user.id);
    
    // 3. החזרת תגובה
    res.status(201).json(booking);
  }
}
```

#### **Frontend API Client:**
```typescript
// frontend/src/api/bookingApi.ts
import axios from 'axios';
import type { CreateBookingDTO, BookingResponseDTO } from '../../shared/schemas/booking.schema';

export const bookingApi = {
  create: (dto: CreateBookingDTO): Promise<BookingResponseDTO> =>
    axios.post<BookingResponseDTO>('/api/v1/bookings', dto).then(r => r.data),
    
  getMyBookings: (): Promise<BookingResponseDTO[]> =>
    axios.get<BookingResponseDTO[]>('/api/v1/bookings/my').then(r => r.data),
};
```

---

### **4. State Management בצד Frontend**

#### **React Query לניהול Server State:**
```typescript
// frontend/src/hooks/useBooking.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation(bookingApi.create, {
    onSuccess: () => {
      // רענון אוטומטי של נתונים קשורים
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['availability']);
      queryClient.invalidateQueries(['points']);
    },
  });
}

export function useMyBookings() {
  return useQuery(['bookings', 'my'], bookingApi.getMyBookings, {
    staleTime: 60_000, // 1 דקה
    refetchOnWindowFocus: true,
  });
}
```

#### **React Hook Form עם Zod:**
```typescript
// frontend/src/components/forms/BookingForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookingSchema, type CreateBookingDTO } from '../../../shared/schemas/booking.schema';

export function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateBookingDTO>({
    resolver: zodResolver(CreateBookingSchema), // ולידציה אוטומטית
  });
  
  const createBooking = useCreateBooking();
  
  const onSubmit = (data: CreateBookingDTO) => {
    createBooking.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* טופס עם ולידציה אוטומטית */}
    </form>
  );
}
```

---

### **5. הפרדת לוגיקה לפי תחומי אחריות**

| סוג לוגיקה | מקום מתאים | דוגמה |
|------------|------------|--------|
| **חישוב נקודות** | `BookingService` (backend) | `calculatePoints(hours)` |
| **ולידציה עסקית** | `Service Layer` + `Zod Schema` | זמן התחלה < זמן סיום |
| **עיצוב נתונים לתצוגה** | Frontend בלבד | פורמט תאריכים, מספור עמודים |
| **רענון אוטומטי** | React Query (frontend) | `refetchOnWindowFocus` |
| **אבטחה ואימות** | Middleware (backend) | JWT verification |

---

### **6. דוגמה מלאה: יצירת הזמנה**

#### **Service Layer עם לוגיקה עסקית:**
```typescript
// backend/src/services/booking.service.ts
import { prisma } from '../config/database';
import { PointsService } from './points.service';
import { POINTS_PER_HOUR } from '../../../shared/constants/point-values';

export class BookingService {
  static async create(dto: CreateBookingDTO, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. ודא שהחנייה זמינה
      const spot = await tx.parkingSpot.findUniqueOrThrow({
        where: { id: dto.spotId }
      });
      
      // 2. חשב נקודות נדרשות
      const hours = this.calculateHours(dto.startTime, dto.endTime);
      const requiredPoints = hours * POINTS_PER_HOUR;
      
      // 3. ודא שיש למשתמש מספיק נקודות
      const userBalance = await PointsService.getBalance(userId, tx);
      if (userBalance < requiredPoints) {
        throw new Error('Insufficient points');
      }
      
      // 4. צור הזמנה
      const booking = await tx.booking.create({
        data: {
          ...dto,
          userId,
          totalPoints: requiredPoints,
          status: 'PENDING'
        }
      });
      
      // 5. נכה נקודות
      await PointsService.deduct(userId, requiredPoints, booking.id, tx);
      
      return booking;
    });
  }
  
  private static calculateHours(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  }
}
```

---

### **7. אבטחה ואמינות**

#### **ולידציה כפולה:**
```typescript
// Frontend validation לחוויית משתמש
const schema = CreateBookingSchema;

// Backend validation לאבטחה
app.post('/api/v1/bookings', 
  authMiddleware,                    // אימות JWT
  validateBody(CreateBookingSchema), // ולידציה
  BookingController.create          // עיבוד
);
```

#### **Error Handling:**
```typescript
// Frontend - ErrorBoundary
export function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent fallback={<ErrorPage />}>
      {children}
    </ErrorBoundaryComponent>
  );
}

// Backend - Global Error Handler
app.use((error, req, res, next) => {
  logger.error(error);
  
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

---

**היתרונות של הארכיטקטורה הזו:**
✅ **הפרדת אחריות ברורה** - כל קוד יודע בדיוק מה הוא אמור לעשות  
✅ **שיתוף קוד בטוח** - schemas ו-types משותפים  
✅ **קלות תחזוקה** - שינויים במקום אחד משפיעים על כל המערכת  
✅ **ולידציה כפולה** - אבטחה בצד שרת + UX טוב בצד לקוח  
✅ **סקלביליות** - קל להוסיף תכונות חדשות  
✅ **בדיקות קלות** - כל שכבה ניתנת לבדיקה בנפרד

---

## 🔐 **אבטחה ואמינות**

### **אמצעי אבטחה מיושמים:**
- 🔐 **הצפנת סיסמאות** - bcrypt עם salt
- 🎫 **JWT tokens** - authentication מאובטח
- 🛡️ **הגנה מפני SQL injection** - Prisma ORM
- 🌐 **CORS מוגדר** - רק מdomain מאושרים
- 🔒 **Helmet.js** - אבטחת HTTP headers

### **אמצעי אבטחה מתוכננים:**
- 🚫 **Rate limiting** - הגבלת בקשות למניעת DDoS
- 📧 **Email verification** - אימות כתובת אימייל
- 📱 **2FA** - אימות דו-שלבי (אופציונלי)
- 🌐 **HTTPS חובה** - בפרודקשן בלבד
- 🔍 **Input validation** - בדיקת כל הנתונים הנכנסים
- 📝 **Audit logs** - תיעוד כל הפעולות הרגישות

### **גיבוי ואמינות:**
- 🗄️ **גיבוי מסד נתונים** - יומי ושבועי
- 🔄 **High availability** - עבור פרודקשן
- 📊 **Monitoring** - ניטור ביצועים ותקלות
- 🚨 **Error tracking** - Sentry או כלי דומה

---

## 💰 **מודל עסקי ומערכת נקודות**

### **מערכת הנקודות:**
1. **נקודות ראשוניות**: כל דייר מקבל **25 נקודות** לכל חנייה מאושרת שבבעלותו
2. **עלות השכרה**: **5 נקודות לשעת חנייה**
3. **הכנסה מהשכרה**: **5 נקודות לשעה** למשכיר
4. **מנגון איזון**: המערכת מעודדת הן השכרה והן שיתוף חניות

### **דוגמה למחזור נקודות:**
- **דייר א'** יש לו חנייה אחת → מקבל 25 נקודות
- **דייר א'** משכיר חנייה ל-5 שעות → מרוויח 25 נקודות נוספות
- **דייר ב'** שוכר חנייה ל-5 שעות → משלם 25 נקודות
- **איזון**: דייר ב' צריך לשתף את החנייה שלו כדי להרוויח נקודות

### **יתרונות המודל:**
✅ **ללא עלות כספית** - מערכת פנימית לקהילת הדיירים  
✅ **מעודד שיתוף** - כדי לשכור צריך גם להשכיר  
✅ **פשטות** - לא צריך לטפל בתשלומים והחזרים  
✅ **קהילתיות** - מחזק את הקהילה בבניין  
✅ **גמישות** - ועד הבית יכול להתאים את המערכת  

### **מקורות הכנסה עתידיים:**
1. **מנוי ועד בית**: ₪99/חודש לבניין (כולל ניהול והתקנה)
2. **תמיכה טכנית**: ₪299 להתקנה וחודש ניסיון חינם
3. **תכונות פרימיום**: דוחות מתקדמים, אינטגרציה עם מערכות בניין
4. **רישוי לחברות ניהול**: B2B לחברות שמנהלות מספר בניינים

### **KPIs עיקריים:**
- **מספר בניינים פעילים**
- **מספר דיירים רשומים**
- **מספר הזמנות חודשיות**
- **שיעור פעילות** (כמה % מהדיירים משתמשים)
- **שביעות רצון דיירים** (סקרים רבעוניים)

---

## 📱 **חוויית משתמש (UX)**

### **זרימות עיקריות:**

#### **זרימת דייר משכיר:**
1. **רישום** → יצירת חשבון + הזנת פרטי בניין
2. **הצהרת חנייה** → מספר חנייה, תמונה, מיקום
3. **ממתין לאישור** → ועד הבית מאמת שהחנייה שייכת לו
4. **קבלת נקודות** → 25 נקודות לחנייה מאושרת
5. **הגדרת זמינות** → מתי הוא לא משתמש בחנייה
6. **מעקב הזמנות** → ראיית מי שכר ומתי

#### **זרימת דייר שוכר:**
1. **חיפוש** → ראיית חניות זמינות בבניין ובתאריכים רצויים
2. **בחירה** → בחירת חנייה ושעות
3. **תשלום בנקודות** → ניכוי 5 נקודות לשעה מהיתרה
4. **ממתין לאישור** → ועד הבית מאשר את ההזמנה
5. **אישור** → קבלת פרטי חנייה ומידע על המשכיר
6. **שימוש** → חנייה בתאריכים ושעות שנקבעו

#### **זרימת ועד בית:**
1. **ניהול דיירים** → אישור דיירים חדשים בבניין
2. **אישור חניות** → אימות שחניות שייכות לדיירים
3. **מתן נקודות** → הענקת 25 נקודות לחנייה מאושרת
4. **אישור הזמנות** → אישור/דחיית בקשות השכרה
5. **מעקב פעילות** → ראיית סטטיסטיקות השימוש
6. **פתרון בעיות** → טיפול בתלונות ובעיות

### **עקרונות עיצוב:**
- **קהילתיות** - דגש על שיתוף ושיתוף פעולה בין דיירים
- **פשטות** - ממשק ברור ללא מורכבות מיותרת
- **שקיפות** - כל דייר רואה את יתרת הנקודות שלו ותנועות
- **אמון** - מנגני אישור ודירוג ליצירת אמון בקהילה
- **מובייל ראשון** - רוב השימוש יהיה בנייד
- **עברית מימין לשמאל** - ממשק מלא בעברית

---

## 🚀 **הפעלה ופריסה**

### **סביבות פיתוח:**
```bash
# Development (מקומי)
npm run dev            # Backend על פורט 3001
npm run dev:frontend   # Frontend על פורט 3000
docker-compose up      # PostgreSQL + Redis

# Staging (בדיקות)
docker-compose -f docker-compose.staging.yml up

# Production (פרודקשן)
docker-compose -f docker-compose.prod.yml up
```

### **משתני סביבה נדרשים:**
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/parkbnb"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# External Services
STRIPE_SECRET_KEY="sk_live_..."
GOOGLE_MAPS_API_KEY="AIza..."
SENDGRID_API_KEY="SG...."

# Upload
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="secret"
```

### **פריסה מומלצת לפרודקשן:**
- **Frontend**: Vercel או Netlify
- **Backend**: Railway, Render או DigitalOcean
- **Database**: PostgreSQL managed (Supabase, Planet Scale)
- **Redis**: Redis Cloud או AWS ElastiCache
- **CDN**: Cloudflare לתמונות ונכסים סטטיים

---

## 📊 **מטריקות ומעקב**

### **מטריקות טכניות:**
- **זמן תגובה API** - מתחת ל200ms
- **זמינות שרת** - 99.9% uptime
- **זמן טעינת דף** - מתחת ל3 שניות
- **שגיאות** - פחות מ1% מהבקשות

### **מטריקות עסקיות:**
- **המרה** - אחוז מבקרים שעושים הזמנה
- **ערך עסקה ממוצע** - סכום ההזמנה הממוצע
- **תדירות שימוש** - כמה פעמים משתמש חוזר
- **שביעות רצון** - דירוג ממוצע בביקורות

### **כלי מעקב מומלצים:**
- **Google Analytics** - ניתוח תנועה באתר
- **Mixpanel** - מעקב אחר events ופעולות משתמש
- **Sentry** - מעקב שגיאות ותקלות
- **New Relic** - ניטור ביצועים

---

## 📞 **תמיכה וקהילה**

### **ערוצי תמיכה מתוכננים:**
- 📧 **אימייל תמיכה**: support@parkbnb.co.il
- 💬 **צ'אט חי** - בשעות העבודה
- 📱 **WhatsApp Business** - תמיכה מהירה
- 📚 **מרכז עזרה** - מאמרים ושאלות נפוצות

### **תיעוד למפתחים:**
- **API Documentation** - Swagger/OpenAPI
- **SDK** - לפיתוח אפליקציות צד שלישי
- **Webhooks** - להתראות על אירועים
- **Testing Environment** - Sandbox לבדיקות

---

## 🎯 **מסקנות והמלצות**

### **נקודות חוזק של הפרויקט:**
✅ **רעיון עסקי מבטיח** - פותר בעיה אמיתית  
✅ **ארכיטקטורה טכנית מקצועית** - טכנולוגיות מודרניות  
✅ **תכנון מפורט** - תיעוד מקיף ותכנית ברורה  
✅ **מודל נתונים טוב** - יחסים נכונים ומבנה הגיוני  
✅ **דגש על אבטחה** - גישה מאובטחת מההתחלה  

### **אתגרים עיקריים:**
⚠️ **אימוץ בקהילה** - צריך שדיירים יתחילו להשתמש במערכת  
⚠️ **ועדי בית** - צורך לשכנע ועדי בית לאמץ את המערכת  
⚠️ **איזון נקודות** - לוודא שהמערכת לא תתקעה (יותר מדי ביקוש ולא מספיק היצע)  
⚠️ **פיתוח מותאם** - צרכים ספציפיים לכל בניין/קהילה  

### **המלצות לצעדים הבאים:**
1. **התמקדות בMVP** - לסיים גרסה בסיסית פונקציונלית מהר
2. **בניין פיילוט** - למצוא בניין אחד שמוכן לנסות את המערכת
3. **משוב מועד בית** - לוודא שהמערכת עונה על הצרכים האמיתיים
4. **פיתוח מדורג** - להתחיל מבניין אחד ולהרחיב בהדרגה
5. **מדידת הצלחה** - לעקוב אחר שיעור השימוש והשביעות רצון

---

**זהו פרויקט חברתי-טכנולוגי מבטיח שיכול לפתור בעיה אמיתית בקהילות דיירים! הארכיטקטורה מקצועית, המודל הכלכלי הגיוני והמוקד ברור. עכשיו צריך להתמקד בהשלמת המוצר המינימלי הכדאי (MVP) ולמצוא בניין פיילוט לבדיקה ראשונית.**

---

*עדכון אחרון: יולי 2025*  
*מכין: Roy Yosef*  
*גרסה: 1.0*
