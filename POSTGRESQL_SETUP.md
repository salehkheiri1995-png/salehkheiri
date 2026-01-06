# PostgreSQL Setup Guide

## 1. نصب PostgreSQL

### Windows
1. دانلود کنید: https://www.postgresql.org/download/windows/
2. نصب کنید (یادتان نرود password رو یادداشت کن)
3. Default port: `5432`

### Linux/Ubuntu
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

---

## 2. Database ایجاد کنید

### SQL Command
```sql
CREATE DATABASE salehkheiri;
CREATE USER saleh WITH PASSWORD '1374';
ALTER ROLE saleh WITH SUPERUSER CREATEDB CREATEROLE;
```

### یا pgAdmin استفاده کنید:
1. pgAdmin رو باز کن
2. راست کلیک > Create > Database
3. نام: `salehkheiri`

---

## 3. .env فایل تنظیم کنید

```env
# Database
DATABASE_URL="postgresql://saleh:1374@localhost:5432/salehkheiri"

# Server
NODE_ENV=development
PORT=5000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 4. Dependencies نصب کنید

### Backend
```bash
npm install @prisma/client
npm install prisma --save-dev
npm install express cors dotenv
npm install -D nodemon
```

### Frontend
```bash
npm install @tanstack/react-query
```

---

## 5. Database Migration

### Prisma Migration اجرا کنید
```bash
npx prisma migrate dev --name init
```

### یا مستقیم database بسازید
```bash
npx prisma db push
```

---

## 6. Server شروع کنید

```bash
# Development
npm run dev

# یا
node server.js
```

Server در `http://localhost:5000` شروع میشه.

---

## 7. Prisma Studio (Optional)

داده‌ها رو بصری مدیریت کنید:

```bash
npx prisma studio
```

برنامه در `http://localhost:5555` باز میشه.

---

## 8. Admin Panel میرید

```
http://localhost:8080/admin/courses
```

- دوره اضافه کنید
- درس اضافه کنید
- داده‌ها **خودکار** به PostgreSQL میرن!

---

## 9. سایت میبینید

```
http://localhost:8080/courses
```

- دوره‌ها از **PostgreSQL** میآن!

---

## 🔒 نکات ایمنی

1. **Production:** رمزعبور `1374` رو تغییر بده!
2. **Environment Variables:** .env فایل رو public نکن
3. **SSL:** Production در PostgreSQL SSL فعال کن
4. **Backups:** روزانه backup بگیر

---

## 🆘 Troubleshooting

### Connection Refused
```bash
# PostgreSQL service چک کنید
sudo systemctl status postgresql

# شروع کنید
sudo systemctl start postgresql
```

### DATABASE_URL اشتباه
```env
# فرمت صحیح:
postgresql://username:password@localhost:5432/database_name

# مثال ما:
postgresql://saleh:1374@localhost:5432/salehkheiri
```

### Migration خرابی
```bash
# Reset کنید
npx prisma migrate reset
```

---

## 📊 Database Structure

### Tables
- `User` - کاربران
- `Course` - دوره‌ها
- `CourseLessonItem` - درس‌ها
- `CourseEnrollment` - ثبت‌نام‌ها
- `Service` - خدمات
- `Specialist` - متخصصان
- `Product` - محصولات
- `Booking` - رزروها
- `CartItem` - سبد خریدی
- `Order` - سفارش‌ها
- `Review` - نظرات

---

## ✅ Checklist

- [ ] PostgreSQL نصب شد
- [ ] Database `salehkheiri` ایجاد شد
- [ ] User `saleh` ایجاد شد
- [ ] .env فایل تنظیم شد
- [ ] Dependencies نصب شدند
- [ ] Migration اجرا شد
- [ ] Server شروع شد
- [ ] Courses API کار میکنه
- [ ] Admin Panel دوره اضافه میکنه
- [ ] سایت دوره‌ها نمایش میدهد

---

**همه آماده! 🚀**
