# Dockerfile לBackend
# קובץ זה מגדיר איך לבנות container לשרת הbackend

# שלב 1: Build stage
FROM node:18-alpine AS builder

# הגדרת תיקיית עבודה
WORKDIR /app

# העתקת package files
COPY package*.json ./
COPY prisma ./prisma/

# התקנת dependencies
RUN npm ci --only=production && npm cache clean --force

# יצירת Prisma client
RUN npx prisma generate

# העתקת קוד המקור
COPY . .

# בניית הפרויקט
RUN npm run build

# שלב 2: Production stage
FROM node:18-alpine AS production

# התקנת dumb-init לטיפול נכון בsignals
RUN apk add --no-cache dumb-init

# יצירת user לא-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# הגדרת תיקיית עבודה
WORKDIR /app

# העתקת קבצים מה-builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# הגדרת משתני סביבה
ENV NODE_ENV=production
ENV PORT=3001

# חשיפת פורט
EXPOSE 3001

# החלפה למשתמש לא-root
USER nextjs

# הגדרת health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# הפעלת האפליקציה
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
