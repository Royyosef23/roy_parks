# מדריך התקנה והפעלה - ParkBnB 🚀

מדריך שלב-אחר-שלב להתקנה והפעלה של פלטפורמת ParkBnB במחשב שלך.

## דרישות מוקדמות 📋

### תוכנות שצריך להתקין:
1. **Node.js 18+** - [הורדה](https://nodejs.org/)
2. **PostgreSQL 14+** - [הורדה](https://www.postgresql.org/download/)
3. **Git** - [הורדה](https://git-scm.com/)
4. **Docker Desktop** (אופציונלי) - [הורדה](https://www.docker.com/products/docker-desktop/)
5. **VS Code** (מומלץ) - [הורדה](https://code.visualstudio.com/)

### חשבונות שצריך לפתוח (אופציונלי לשלב זה):
- **Stripe** לתשלומים - [הרשמה](https://stripe.com/)
- **Cloudinary** לתמונות - [הרשמה](https://cloudinary.com/)
- **Google Maps API** למפות - [הרשמה](https://developers.google.com/maps)

## אופציה 1: התקנה עם Docker (קל יותר) 🐳

### שלב 1: שכפול הפרויקט
```bash
git clone https://github.com/Royyosef23/roy_parks.git
cd roy_parks
```

### שלב 2: יצירת קובץ Environment
```bash
# יצירת קובץ .env בתיקיית הבסיס
cp .env.example .env
```

### שלב 3: הפעלה עם Docker
```bash
# הפעלת כל השירותים
docker-compose up -d

# צפייה בלוגים
docker-compose logs -f
```

### שלב 4: בדיקה שהכל עובד
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- Database Admin: http://localhost:8080 (user: postgres, pass: postgres)

## אופציה 2: התקנה ידנית (יותר שליטה) ⚙️

### שלב 1: שכפול הפרויקט
```bash
git clone https://github.com/Royyosef23/roy_parks.git
cd roy_parks
```

### שלב 2: הגדרת מסד הנתונים
```bash
# התחברות לPostgreSQL
psql -U postgres

# יצירת מסד נתונים
CREATE DATABASE parkbnb_dev;
CREATE USER parkbnb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE parkbnb_dev TO parkbnb_user;
\\q
```

### שלב 3: הגדרת Backend
```bash
cd backend

# התקנת חבילות
npm install

# יצירת קובץ .env
cp .env.example .env
```

ערוך את הקובץ `backend/.env`:
```env
DATABASE_URL="postgresql://parkbnb_user:your_password@localhost:5432/parkbnb_dev"
JWT_SECRET="your-very-secret-jwt-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV=development
```

```bash
# יצירת Prisma client
npx prisma generate

# הרצת migrations
npx prisma migrate dev --name init

# (אופציונלי) הוספת נתונים לדוגמה
npx prisma db seed

# הפעלת השרת
npm run dev
```

### שלב 4: הגדרת Frontend
```bash
# בטרמינל חדש
cd frontend

# התקנת חבילות
npm install

# יצירת קובץ .env
cp .env.example .env
```

ערוך את הקובץ `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

```bash
# הפעלת האפליקציה
npm start
```

### שלב 5: בדיקה שהכל עובד
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- API Docs: http://localhost:3001/api/v1/docs

## הגדרות נוספות (אופציונלי) ⚡

### Redis לקאש (משפר ביצועים)
```bash
# התקנה על Ubuntu/WSL
sudo apt update
sudo apt install redis-server

# התקנה על macOS
brew install redis

# התקנה על Windows
# הורד מ: https://github.com/microsoftarchive/redis/releases

# הפעלה
redis-server
```

הוסף ל-`backend/.env`:
```env
REDIS_URL="redis://localhost:6379"
```

### MailHog לבדיקת מיילים
```bash
# התקנה
go install github.com/mailhog/MailHog@latest

# הפעלה
mailhog
```

ממשק MailHog: http://localhost:8025

### הגדרת VS Code Extensions (מומלץ)
התקן את הExtensions האלה:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Prisma
- Thunder Client (לבדיקת API)
- GitLens

## פתרון בעיות נפוצות 🔧

### הbackend לא עולה
```bash
# בדוק שPostgreSQL רץ
sudo service postgresql status

# בדוק שהחיבור למסד הנתונים עובד
npx prisma db push

# בדוק שהפורט פנוי
lsof -i :3001
```

### הfrontend לא עולה
```bash
# נקה cache
npm start -- --reset-cache

# התקן מחדש
rm -rf node_modules package-lock.json
npm install
```

### בעיות עם Prisma
```bash
# איפוס מסד הנתונים
npx prisma migrate reset

# יצירת migration חדש
npx prisma migrate dev

# צפייה במסד הנתונים
npx prisma studio
```

### שגיאות הרשאות (Linux/Mac)
```bash
sudo chown -R $USER ~/.npm
sudo chown -R $USER node_modules
```

## פקודות שימושיות 📝

### Backend
```bash
npm run dev          # הפעלה במצב פיתוח
npm run build        # בניית הפרויקט
npm start            # הפעלה במצב production
npm test             # הרצת בדיקות
npm run lint         # בדיקת קוד
npx prisma studio    # פתיחת ממשק מסד הנתונים
```

### Frontend
```bash
npm start            # הפעלה במצב פיתוח
npm run build        # בניית הפרויקט
npm test             # הרצת בדיקות
npm run lint         # בדיקת קוד
```

### Docker
```bash
docker-compose up -d              # הפעלת כל השירותים
docker-compose down               # עצירת כל השירותים
docker-compose logs -f backend    # צפייה בלוגים של שירות
docker-compose restart backend    # הפעלה מחדש של שירות
```

## מבנה תיקיות 📂

```
roy_parks/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # לוגיקה עסקית
│   │   ├── routes/         # נתיבי API
│   │   ├── middleware/     # middleware functions
│   │   ├── services/       # שירותים עזר
│   │   └── utils/          # פונקציות עזר
│   ├── prisma/             # schema ו-migrations
│   └── tests/              # בדיקות
├── frontend/               # React.js App
│   ├── src/
│   │   ├── components/     # רכיבי UI
│   │   ├── pages/         # דפים
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   └── utils/         # פונקציות עזר
│   └── public/            # קבצים סטטיים
├── database/              # קבצי מסד נתונים
├── docker/                # קבצי Docker
├── docs/                  # תיעוד
└── .github/               # CI/CD workflows
```

## הצעדים הבאים 🎯

אחרי שהכל עובד, תוכל:

1. **לפתח תכונות חדשות** - ראה [Development Plan](./DEVELOPMENT_PLAN.md)
2. **לקרוא על הארכיטקטורה** - ראה [Architecture](./ARCHITECTURE.md)
3. **להעלות לפרודקשן** - ראה [Deployment Guide](./DEPLOYMENT.md)
4. **לתרום לפרויקט** - ראה [Contributing](./CONTRIBUTING.md)

## עזרה ותמיכה 💬

- 📧 Email: roy@parkbnb.com
- 🐛 Issues: [GitHub Issues](https://github.com/Royyosef23/roy_parks/issues)
- 📖 Docs: [Documentation](./docs/)

---

**זה הכל! תהנה מהפיתוח! 🚀**
