# Dockerfile לFrontend
# קובץ זה מגדיר איך לבנות container לאפליקציית React

# שלב 1: Build stage
FROM node:18-alpine AS builder

# הגדרת תיקיית עבודה
WORKDIR /app

# העתקת package files
COPY package*.json ./

# התקנת dependencies
RUN npm ci --only=production && npm cache clean --force

# העתקת קוד המקור
COPY . .

# הגדרת משתני build
ARG REACT_APP_API_URL=http://localhost:3001
ARG REACT_APP_GOOGLE_MAPS_KEY=""

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_MAPS_KEY=$REACT_APP_GOOGLE_MAPS_KEY

# בניית האפליקציה
RUN npm run build

# שלב 2: Production stage עם Nginx
FROM nginx:alpine AS production

# התקנת curl לhealth checks
RUN apk add --no-cache curl

# העתקת קבצי הbuild מהשלב הקודם
COPY --from=builder /app/build /usr/share/nginx/html

# העתקת תצורת Nginx מותאמת אישית
COPY nginx.conf /etc/nginx/nginx.conf

# יצירת user לא-root
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# הגדרת הרשאות
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# חשיפת פורט
EXPOSE 80

# הגדרת health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# החלפה למשתמש לא-root
USER nginx

# הפעלת Nginx
CMD ["nginx", "-g", "daemon off;"]
