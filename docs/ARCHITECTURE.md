# ארכיטקטורת פלטפורמת חניות ParkBnB 🚗

## סקירה כללית
פלטפורמה לניהול והזמנת חניות פרטיות בבניינים - כמו Airbnb אבל לחניות!

## מבנה הפרויקט

```
roy_parks/
├── frontend/          # React.js - ממשק המשתמש
├── backend/           # Node.js + Express - API Server  
├── database/          # PostgreSQL - מסד נתונים
├── docker/            # Docker containers
├── docs/              # תיעוד
├── .github/           # CI/CD workflows
└── tests/             # בדיקות אוטומטיות
```

## טכנולוגיות נבחרות

### Frontend (לקוח)
- **React.js** - ספריית UI מודרנית
- **TypeScript** - בטיחות טיפוסים  
- **Tailwind CSS** - עיצוב מהיר ויפה
- **React Router** - ניווט בין דפים
- **Axios** - תקשורת עם השרת

### Backend (שרת)
- **Node.js** - סביבת הרצה
- **Express.js** - framework לAPI
- **TypeScript** - בטיחות טיפוסים
- **JWT** - אימות משתמשים
- **bcrypt** - הצפנת סיסמאות

### Database (מסד נתונים)
- **PostgreSQL** - מסד נתונים יחסי
- **Prisma** - ORM מודרני
- **Redis** - קאש מהיר

### DevOps
- **Docker** - קונטיינרים
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy

## תכונות עיקריות

### למשכירים (בעלי חניות)
- 📝 רישום וניהול חניות
- 💰 קביעת מחירים ועמלות
- 📅 ניהול זמינות
- 📊 דוחות הכנסות

### לשוכרים (מחפשי חניה)
- 🔍 חיפוש חניות לפי מיקום ותאריך
- 💳 תשלום מאובטח
- ⭐ דירוגים וחוות דעת
- 📱 אפליקציה ידידותית

### לאדמינים
- 👥 ניהול משתמשים
- 🏢 ניהול בניינים
- 💼 ניהול עמלות
- 📈 ניתוח נתונים

## מודל נתונים

### משתמשים (Users)
- ID, שם, אימייל, סיסמה
- תפקיד (שוכר/משכיר/אדמין)
- פרופיל, תמונה, טלפון

### בניינים (Buildings)  
- כתובת, תיאור, תמונות
- בעלים, מספר חניות
- שעות פעילות

### חניות (Parking Spots)
- מספר חנייה, גודל, סוג
- מחיר ליום/שעה
- זמינות, תמונות

### הזמנות (Bookings)
- מי שוכר, איזו חנייה
- תאריכי התחלה וסיום
- סטטוס, מחיר כולל

## אבטחה
- 🔐 הצפנת סיסמאות עם bcrypt
- 🎫 JWT tokens לאימות
- 🛡️ הגנה מפני SQL injection
- 🌐 HTTPS חובה בפרודקשן

## ביצועים
- ⚡ Redis לקאש
- 📱 Responsive design
- 🔄 Lazy loading לתמונות
- 📊 Pagination לרשימות

## פריסה (Deployment)
- 🐳 Docker containers
- ☁️ Cloud deployment ready
- 🔄 CI/CD עם GitHub Actions
- 📈 Monitoring ו-logging
