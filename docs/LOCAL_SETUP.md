# 📑 راهنمای کامل - اجرای محلی Salehkheiri

> یک راهنمای جامع برای اجرای پروژه Salehkheiri با PostgreSQL محلی بر روی سیستم‌تان

## 📋 فهرست مطالب

1. [پیش‌نیازها](#پیش‌نیازها)
2. [نصب PostgreSQL](#نصب-postgresql)
3. [ایجاد Database](#ایجاد-database)
4. [تنظیم پروژه](#تنظیم-پروژه)
5. [اجرای Backend](#اجرای-backend)
6. [اجرای Frontend](#اجرای-frontend)
7. [تست API](#تست-api)
8. [استفاده از Prisma Studio](#استفاده-از-prisma-studio)
9. [مشکلات معمول](#مشکلات-معمول)

---

## 🔧 پیش‌نیازها

### سیستم‌عامل‌ها

- **Windows 10+** یا **Windows Server 2019+**
- **macOS 10.15+**
- **Linux (Ubuntu 20.04+, Debian 11+)**

### نرم‌افزارهای لازم

```bash
# Node.js (فارغ‌التحصیلی نسخه 18 یا بالاتر)
node --version  # v18.0.0+
npm --version   # 8.0.0+

# Git
git --version

# PostgreSQL
postgres --version  # 14.0+
```

---

## 🐘 نصب PostgreSQL

### Windows

**روش 1: دانلود مستقیم**

1. برو به [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. **PostgreSQL 15 یا 16** را دانلود کن
3. Installer را اجرا کن و مراحل را دنبال کن:
   - Language: English
   - Installation Directory: `C:\Program Files\PostgreSQL\15`
   - Components: 
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4
     - ✅ Stack Builder
   - Data Directory: `C:\Program Files\PostgreSQL\15\data`
   - **رمز عبور postgres را یادداشت کن!**
   - Port: `5432` (پیش‌فرض)

**روش 2: Chocolatey (سریع‌تر)**

```bash
choco install postgresql
```

**روش 3: Docker**

```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=1374 \
  -p 5432:5432 \
  -d postgres:15
```

### macOS

```bash
# Homebrew استفاده کن
brew install postgresql@15

# شروع کن
brew services start postgresql@15

# تست کن
psql --version
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-client

# شروع کن
sudo systemctl start postgresql
sudo systemctl enable postgresql

# تست کن
psql --version
```

### تست اتصال

```bash
# Terminal یا Command Prompt میں:
psql -U postgres

# اگر prompt دید: ✅ کار می‌کند
postgres=#

# خروج
\q
```

---

## 🗄️ ایجاد Database

### مرحله 1: وصل شدن

```bash
psql -U postgres
```

### مرحله 2: دستورات SQL

```sql
-- Database ایجاد کن
CREATE DATABASE salehkheiri;

-- کاربر ایجاد کن
CREATE USER saleh WITH ENCRYPTED PASSWORD '1374';

-- دسترسی‌ها دادن
GRANT ALL PRIVILEGES ON DATABASE salehkheiri TO saleh;
ALTER ROLE saleh CREATEDB;

-- خروج
\q
```

### مرحله 3: تست اتصال

```bash
psql -U saleh -d salehkheiri

# اگر prompt دید: ✅ کار می‌کند
salehkheiri=#

# لیست جداول
\dt

# خروج
\q
```

---

## 🎯 تنظیم پروژه

### مرحله 1: Clone کردن

```bash
git clone https://github.com/saleh1374/salehkheiri.git
cd salehkheiri
```

### مرحله 2: نصب Dependencies

```bash
# تمام packages
npm install

# Backend packages (اگر نیاز باشد)
npm install express cors body-parser ts-node
npm install -D nodemon concurrently
```

### مرحله 3: تنظیم .env

**گزینه 1: کپی کردن template**

```bash
cp .env.example .env
```

**گزینه 2: دستی ایجاد**

```bash
# مسیر: D:\Webbbsite\version03\.env (Windows)
# یا: ~/Projects/salehkheiri/.env (macOS/Linux)

echo 'DATABASE_URL="postgresql://saleh:1374@localhost:5432/salehkheiri"
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000/api
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters_long' > .env
```

### مرحله 4: Database Migration

```bash
# Prisma migration‌ها اجرا کن
npx prisma migrate dev

# یا script استفاده کن
npm run db:migrate
```

**خروجی موفق:**
```
✔ Enter a name for the new migration: initial
✔ Your database is now in sync with your schema.
```

---

## 🚀 اجرای Backend

### روش 1: فقط Backend

```bash
npm run dev:backend

# خروجی:
# ✅ Server running on port 3000
# 🔌 API: http://localhost:3000/api
# 📊 Database: PostgreSQL (Local)
```

### روش 2: Backend + Frontend (توصیه)

```bash
npm run dev

# دو terminal باز خواهد شد:
# Terminal 1: Backend on http://localhost:3000
# Terminal 2: Frontend on http://localhost:5173
```

### روش 3: دستی اجرا

```bash
# Terminal 1 - Backend
ts-node server/index.ts

# Terminal 2 - Frontend
vite
```

---

## 🎨 اجرای Frontend

```bash
# فقط Frontend
npm run dev:frontend

# یا
vite

# مرورگر: http://localhost:5173
```

---

## 🧪 تست API

### Health Check

```bash
curl http://localhost:3000/api/health

# خروجی موفق:
# {"status":"ok","database":"PostgreSQL (Local)","timestamp":"2026-01-24T..."}
```

### اجرای Courses

```bash
curl http://localhost:3000/api/courses

# خروجی موفق:
# []
```

### ایجاد Course

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دوره React",
    "description": "یاد بگیر React",
    "instructor_name": "صالح خیری",
    "price": 500000,
    "duration_hours": 20
  }'

# خروجی موفق:
# {"id":"uuid","title":"دوره React",...}
```

### استفاده از Postman/Thunder Client

1. **Thunder Client** یا **Postman** را باز کن
2. **Method**: `POST`
3. **URL**: `http://localhost:3000/api/courses`
4. **Headers**: `Content-Type: application/json`
5. **Body**:
```json
{
  "title": "دوره React",
  "description": "یاد بگیر React",
  "instructor_name": "صالح خیری",
  "price": 500000,
  "duration_hours": 20
}
```

---

## 📊 استفاده از Prisma Studio

### GUI برای Database

```bash
npm run db:studio

# یا
prima studio

# مرورگر: http://localhost:5555
```

**Prisma Studio میتونه:**
- ✅ داده‌ها رو ببینی
- ✅ داده‌ها رو ایجاد کنی
- ✅ داده‌ها رو ویرایش کنی
- ✅ داده‌ها رو حذف کنی
- ✅ Queries پیچیده بنویسی

---

## 🚨 مشکلات معمول

### "Connection refused" - PostgreSQL متصل نیست

**Windows:**
```bash
# Windows Services باز کن
# به: PostgreSQL > کلیک راست > Start

# یا Command میں:
net start postgresql-x64-15
```

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### "Password authentication failed"

```bash
# تست کن با رمز صحیح
psql -U saleh -d salehkheiri -c "SELECT 1"

# اگر کار نکرد، رمز رو reset کن:
psql -U postgres
ALTER USER saleh WITH PASSWORD '1374';
\q
```

### "Database does not exist"

```bash
# Database‌ها رو فهرست کن
psql -U postgres -l

# اگر salehkheiri نیست، ایجاد کن:
psql -U postgres
CREATE DATABASE salehkheiri;
\q
```

### "Port 3000 already in use"

```bash
# یک پورت دیگر استفاده کن
npm run dev:backend -- --port 3001

# یا:
PORT=3001 npm run dev:backend
```

### "Migration failed"

```bash
# Reset کن (⚠️ تمام داده‌ها حذف میشود)
npm run db:reset

# یا دستی:
npx prisma migrate reset --force
```

### "Prisma schema not found"

```bash
# Prisma init کن
npx prisma init

# یا مطمئن شو که در جذر پروژه‌ای:
ls prisma/schema.prisma
```

---

## 📚 دستورات مفید

```bash
# Development
npm run dev              # Backend + Frontend
npm run dev:backend      # فقط Backend
npm run dev:frontend     # فقط Frontend

# Database
npm run db:studio       # Prisma Studio
npm run db:migrate      # Migration نو
npm run db:push         # Push بدون Migration
npm run db:reset        # Reset کامل

# Build
npm run build           # Production build
npm run preview         # Preview build

# Linting
npm run lint            # ESLint
```

---

## 💾 Backup & Restore

### Backup گرفتن

```bash
pg_dump -U saleh salehkheiri > backup_$(date +%Y%m%d).sql
```

### Restore کردن

```bash
psql -U saleh salehkheiri < backup_20260124.sql
```

---

## 🎓 نکات مفید

1. **Terminal‌های جداگانه**: Backend و Frontend رو در terminal‌های جداگانه بسیار بهتر است
2. **Hot Reload**: Backend خودکار restart میشود (nodemon)
3. **Migrations**: هر تغییری در `prisma/schema.prisma` نیازمند migration جدیدی است
4. **Logging**: Server log‌ها رو برای debugging بررسی کن
5. **Git**: همیشه `.env` رو commit نکن

---

## 📞 سوالات متداول

**Q: چطور رمز پست‌گرس رو تغییر بدم؟**
```bash
psql -U postgres
ALTER USER saleh WITH PASSWORD 'new_password';
\q
```

**Q: pgAdmin چه چیزی است؟**
A: GUI برای PostgreSQL مدیریت. معمولاً روی `localhost:5050` اجرا میشود.

**Q: آیا میتونم MongoDB استفاده کنم؟**
A: بله! فقط Prisma schema رو تغییر بده و `DATABASE_URL` رو آپدیت کن.

**Q: Database رو چطور backup کنم؟**
```bash
pg_dump -U saleh salehkheiri > backup.sql
```

---

**اگر سوالی داشتی یا مشکلی پیش آمد، Issues روی GitHub باز کن! 🎉**
