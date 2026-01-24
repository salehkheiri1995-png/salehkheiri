# 💆‍♀️ Salehkheiri - Beauty Salon Management Platform

> یک پلتفرم کامل مدیریت سالن زیبایی با React, Vite, TypeScript و Prisma ORM

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)

## 📋 ویژگی‌ها

### 👥 مدیریت کاربران
- ثبت‌نام و ورود
- پروفایل کاربر
- مدیریت رول‌ها

### 📚 دوره‌های آموزشی
- ایجاد و مدیریت دوره‌ها
- اضافه کردن درس‌های ویدیویی
- ثبت‌نام کاربران در دوره‌ها
- سیستم نظرات و رتبه‌دهی

### 💅 خدمات سالن
- مدیریت خدمات
- رزرو آنلاین
- مدیریت متخصصین
- تقویم رزوها

### 🛍️ فروشگاه اینترنتی
- مدیریت محصولات
- سبد خرید
- سفارش‌گذاری
- مدیریت موجودی

### ⭐ نظرات و رتبه‌دهی
- سیستم نظرات برای دوره‌ها و محصولات
- رتبه‌دهی ستاره‌ای

## 🚀 شروع سریع

### پیش‌نیازها

- Node.js 18+
- PostgreSQL 14+
- npm یا yarn

### ۱. نصب PostgreSQL

#### Windows
```bash
# دانلود از:
https://www.postgresql.org/download/windows/

# یا استفاده از Chocolatey:
choco install postgresql
```

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### ۲. ایجاد Database

```bash
psql -U postgres

CREATE DATABASE salehkheiri;
CREATE USER saleh WITH ENCRYPTED PASSWORD '1374';
GRANT ALL PRIVILEGES ON DATABASE salehkheiri TO saleh;
\q
```

### ۳. کلون کردن پروژه

```bash
git clone https://github.com/saleh1374/salehkheiri.git
cd salehkheiri
```

### ۴. نصب وابستگی‌ها

```bash
npm install
```

### ۵. تنظیم متغیرهای محیطی

```bash
# فایل .env را کپی کن
cp .env.example .env

# اگر .env وجود ندارد، بساز:
echo 'DATABASE_URL="postgresql://saleh:1374@localhost:5432/salehkheiri"
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000/api
JWT_SECRET=your_secret_key_here' > .env
```

### ۶. اجرای Migration

```bash
npx prisma migrate dev
# یا
npm run db:migrate
```

### ۷. شروع اجرا

```bash
# Backend و Frontend با هم
npm run dev

# یا جداگانه:
npm run dev:backend  # Backend: http://localhost:3000
npm run dev:frontend # Frontend: http://localhost:5173
```

## 📊 URLs

| سرویس | URL |
|-------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend (API) | http://localhost:3000/api |
| Health Check | http://localhost:3000/api/health |
| Prisma Studio | npm run db:studio |
| pgAdmin | localhost:5050 |

## 📚 API Endpoints

### Users
```bash
GET    /api/users              # همه کاربران
GET    /api/users/:id          # یک کاربر
POST   /api/users              # ایجاد کاربر
PUT    /api/users/:id          # ویرایش
DELETE /api/users/:id          # حذف
```

### Courses
```bash
GET    /api/courses            # همه دوره‌ها
GET    /api/courses/:id        # یک دوره
POST   /api/courses            # ایجاد
PUT    /api/courses/:id        # ویرایش
DELETE /api/courses/:id        # حذف
```

### Products
```bash
GET    /api/products           # همه محصولات
GET    /api/products/:id       # یک محصول
POST   /api/products           # ایجاد
PUT    /api/products/:id       # ویرایش
DELETE /api/products/:id       # حذف
```

### Services
```bash
GET    /api/services           # همه خدمات
POST   /api/services           # ایجاد
```

### Bookings
```bash
GET    /api/bookings           # همه رزوها
GET    /api/bookings/user/:id  # رزوهای کاربر
POST   /api/bookings           # ایجاد رزو
PUT    /api/bookings/:id       # ویرایش رزو
```

### Cart & Orders
```bash
GET    /api/cart/:userId       # سبد خرید
POST   /api/cart               # اضافه به سبد
DELETE /api/cart/:id           # حذف از سبد

GET    /api/orders             # تمام سفارشات
GET    /api/orders/user/:id    # سفارشات کاربر
POST   /api/orders             # ایجاد سفارش
```

## 🎓 دستورات مفید

```bash
# Backend + Frontend
npm run dev

# فقط Backend
npm run dev:backend

# فقط Frontend
npm run dev:frontend

# Prisma Studio (مدیریت Database)
npm run db:studio

# Migration جدید
npm run db:migrate

# Push schema بدون Migration
npm run db:push

# Reset Database
npm run db:reset

# Build
npm run build

# Lint
npm run lint
```

## 🗄️ ساختار Database

### جداول اصلی:

| جدول | توضیح |
|------|-------|
| `User` | کاربران سیستم |
| `Course` | دوره‌های آموزشی |
| `CourseLessonItem` | درس‌های دوره |
| `CourseEnrollment` | ثبت‌نام‌های دوره |
| `Service` | خدمات سالن |
| `Specialist` | متخصصین |
| `Product` | محصولات فروشگاه |
| `Booking` | رزروی خدمات |
| `CartItem` | اقلام سبد خرید |
| `Order` | سفارشات |
| `OrderItem` | اقلام سفارش |
| `Review` | نظرات کاربران |

## 🔒 امنیت

⚠️ **توجه**: این پروژه برای توسعه محلی است. برای Production:

- [ ] رمز عبور قوی ایجاد کنید
- [ ] `.env` را بدون `git` نگاه دارید
- [ ] JWT_SECRET طولانی ایجاد کنید
- [ ] HTTPS استفاده کنید
- [ ] Password Hashing فعال کنید (bcrypt)
- [ ] Rate Limiting اضافه کنید
- [ ] Input Validation فعال کنید

## 📝 مثال‌های API

### ایجاد دوره

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دوره React",
    "description": "یاد بگیر React از صفر",
    "instructor_name": "صالح خیری",
    "price": 500000,
    "duration_hours": 20,
    "level": "مبتدی"
  }'
```

### ایجاد محصول

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "شامپو",
    "description": "شامپو باکیفیت",
    "price": 50000,
    "category": "Hair Care",
    "stock": 100
  }'
```

### ایجاد رزو

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "service_id": "service-uuid",
    "date": "2026-02-15",
    "time": "14:30"
  }'
```

## 🐛 مشکلات رایج

### "Connection refused"
```bash
# PostgreSQL را start کنید
sudo systemctl start postgresql  # Linux
brew services start postgresql@15 # macOS
# یا Windows Services > PostgreSQL > Start
```

### "Migration failed"
```bash
npm run db:reset
```

### "Port already in use"
```bash
npm run dev:backend -- --port 3001
```

## 📚 منابع

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vite Guide](https://vitejs.dev/)

## 📧 تماس

سوالی دارید؟ Issues یا Pull Requests خوشِ آمدید!

## 📄 لایسنس

MIT License - برای جزئیات بیشتر `LICENSE` را مطالعه کنید.

---

**ساخته شده با ❤️ برای سالن‌های زیبایی**
