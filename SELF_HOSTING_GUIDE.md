# راهنمای هاست شخصی پروژه

این راهنما نحوه اجرای پروژه روی سرور شخصی با دیتابیس PostgreSQL محلی را توضیح می‌دهد.

## پیش‌نیازها

1. **Node.js** نسخه 18 یا بالاتر
2. **PostgreSQL** نسخه 14 یا بالاتر
3. **Git** برای دریافت پروژه

---

## مرحله ۱: خروجی گرفتن از پروژه

1. در Lovable روی دکمه **"Export to GitHub"** کلیک کنید
2. پروژه را در سیستم خود clone کنید:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

## مرحله ۲: نصب PostgreSQL

### روی Windows:
1. [PostgreSQL](https://www.postgresql.org/download/windows/) را دانلود و نصب کنید
2. رمز عبور postgres را یادداشت کنید

### روی macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### روی Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## مرحله ۳: ایجاد دیتابیس

```bash
# وارد PostgreSQL شوید
sudo -u postgres psql

# دیتابیس و کاربر بسازید
CREATE DATABASE salon_db;
CREATE USER salon_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE salon_db TO salon_user;
\q
```

---

## مرحله ۴: اجرای Migration ها

فایل SQL زیر تمام جداول مورد نیاز را ایجاد می‌کند:

```bash
# اتصال به دیتابیس
psql -U salon_user -d salon_db -f database/schema.sql
```

---

## مرحله ۵: تنظیم متغیرهای محیطی

یک فایل `.env.local` بسازید:

```env
# Database
DATABASE_URL=postgresql://salon_user:your_secure_password@localhost:5432/salon_db

# Application
VITE_API_URL=http://localhost:5000/api
NODE_ENV=production
PORT=5000

# JWT Secret (یک رشته تصادفی امن)
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_chars

# Optional: برای آپلود تصاویر
UPLOAD_DIR=./uploads
```

---

## مرحله ۶: نصب وابستگی‌ها

```bash
npm install
```

---

## مرحله ۷: Build و اجرا

### برای توسعه:
```bash
npm run dev
```

### برای Production:
```bash
npm run build
npm run preview
```

---

## مرحله ۸: اجرای سرور Backend (اختیاری)

اگر می‌خواهید backend کامل داشته باشید، سرور Express را اجرا کنید:

```bash
cd server
npm install
npm start
```

---

## ساختار دیتابیس

جداول اصلی پروژه:

| جدول | توضیحات |
|------|---------|
| `profiles` | اطلاعات کاربران |
| `services` | خدمات سالن |
| `specialists` | متخصصین |
| `bookings` | رزروها |
| `products` | محصولات فروشگاه |
| `orders` | سفارشات |
| `courses` | دوره‌های آموزشی |
| `course_enrollments` | ثبت‌نام دوره‌ها |
| `portfolio` | نمونه کارها |
| `reviews` | نظرات |
| `salon_settings` | تنظیمات سالن |
| `theme_settings` | تنظیمات تم |

---

## نکات امنیتی

1. **رمز عبور قوی**: از رمزهای پیچیده برای دیتابیس استفاده کنید
2. **فایروال**: پورت PostgreSQL (5432) را از دسترسی عمومی ببندید
3. **SSL**: در production از SSL استفاده کنید
4. **Backup**: روزانه از دیتابیس backup بگیرید

```bash
# گرفتن backup
pg_dump -U salon_user salon_db > backup_$(date +%Y%m%d).sql

# بازیابی backup
psql -U salon_user -d salon_db < backup_20240101.sql
```

---

## استفاده از Docker (پیشنهادی)

فایل `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: salon_db
      POSTGRES_USER: salon_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://salon_user:your_secure_password@db:5432/salon_db
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

اجرا:
```bash
docker-compose up -d
```

---

## پشتیبانی

برای سوالات بیشتر، مستندات PostgreSQL و Prisma را مطالعه کنید:
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
