# ParkBnB - פלטפורמת השכרת חניות 

פלטפורמה מתקדמת להשכרת חניות פרטיות בבניינים - כמו Airbnb אבל לחניות!

##  מטרת הפרויקט

יצירת פלטפורמה שמחברת בין:
- **בעלי חניות** - שרוצים להשכיר את החניות הפנויות שלהם
- **מחפשי חנייה** - שמחפשים חנייה נוחה ובמחיר הוגן

##  ארכיטקטורה

```
roy_parks/
├── frontend/          # React.js + TypeScript
├── backend/           # Node.js + Express + TypeScript  
├── database/          # PostgreSQL + Prisma
├── docker/            # Docker containers
├── docs/              # תיעוד מלא
└── .github/           # CI/CD workflows
```

##  טכנולוגיות

### Frontend
- **React 18** - ספריית UI מודרנית
- **TypeScript** - בטיחות טיפוסים
- **Tailwind CSS** - עיצוב מהיר ויפה
- **React Router** - ניווט בין דפים
- **React Query** - ניהול state וקאש

### Backend  
- **Node.js** - סביבת הרצה
- **Express.js** - framework לAPI
- **TypeScript** - בטיחות טיפוסים
- **Prisma** - ORM מודרני
- **JWT** - אימות מאובטח

### Database
- **PostgreSQL** - מסד נתונים יחסי
- **Redis** - קאש מהיר

### DevOps
- **Docker** - קונטיינרים
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy

##  תכונות עיקריות

### למשכירים (בעלי חניות)
-  רישום וניהול חניות
-  קביעת מחירים דינמית
-  ניהול זמינות
-  דוחות הכנסות מפורטים

### לשוכרים (מחפשי חנייה)  
-  חיפוש חניות לפי מיקום ותאריך
-  תצוגת מפה אינטראקטיבית
-  תשלום מאובטח
-  דירוגים וחוות דעת

### לאדמינים
-  ניהול משתמשים
-  ניהול בניינים
-  ניהול עמלות
-  ניתוח נתונים

##  התקנה ופיתוח

### דרישות מקדימות
- Node.js 18+
- PostgreSQL 14+
- Redis (אופציונלי לפיתוח)
- Git

### התקנת Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### התקנת Frontend
```bash
cd frontend  
npm install
npm start
```

### הרצה עם Docker
```bash
docker-compose up -d
```

## 📚 תיעוד

- [📋 תכנון פיתוח מלא](./docs/DEVELOPMENT_PLAN.md)
- [🏗️ ארכיטקטורה טכנית](./docs/ARCHITECTURE.md)
- [📖 API Documentation](./docs/API.md) (בקרוב)
- [🎨 UI/UX Design](./docs/DESIGN.md) (בקרוב)

## 🔐 אבטחה

- 🔐 הצפנת סיסמאות עם bcrypt
- 🎫 JWT tokens לאימות
- 🛡️ הגנה מפני SQL injection
- 🌐 HTTPS חובה בפרודקשן
- 🚫 Rate limiting למניעת spam

## 📊 מודל עסקי

- עמלה של 8-12% מכל עסקה
- תשלום מאובטח דרך Stripe
- ביטוח אופציונלי לחניות
- מערכת דירוגים ואמינות

## 🚀 Roadmap

### Phase 1 (MVP) - חודש 1
- [x] ארכיטקטורה בסיסית
- [ ] מערכת משתמשים
- [ ] רישום וחיפוש חניות
- [ ] מערכת הזמנות בסיסית

### Phase 2 - חודש 2  
- [ ] אינטגרציית מפות
- [ ] מערכת תשלומים
- [ ] דירוגים וביקורות
- [ ] אפליקציית מובייל

### Phase 3 - חודש 3
- [ ] ניתוח נתונים מתקדם
- [ ] אינטגרציה עם IoT
- [ ] מערכת הודעות
- [ ] תמיכה מרובת שפות

## 🤝 תרומה לפרויקט

1. Fork הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📄 רישיון

הפרויקט הזה מוגן תחת רישיון MIT - ראה [LICENSE](LICENSE) לפרטים.

## 👨‍💻 מפתח

**Roy Yosef**
- GitHub: [@Royyosef23](https://github.com/Royyosef23)
- Email: roy@parkbnb.com

## 🙏 תודות

תודה לכל הספריות והכלים המדהימים שעוזרים לנו לבנות את הפרויקט הזה!

---

**📍 סטטוס פיתוח**: 🟡 בפיתוח פעיל  
**🔄 עדכון אחרון**: יולי 2025  
**⭐ גרסה**: 1.0.0-alpha