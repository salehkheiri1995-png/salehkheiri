# 🚀 سریع‌ترین شروع - Salehkheiri

> برای Windows Command Prompt (بدون PowerShell)

---

## ✅ 1️⃣ PostgreSQL را شروع کن

```
Windows Services > PostgreSQL > کلیک راست > Start

# یا Command Prompt:
net start postgresql-x64-15
```

---

## ✅ 2️⃣ Git Pull کن

```
cd D:\Webbbsite\version03
git pull origin main
```

---

## ✅ 3️⃣ .env فایل رو بساز

```
notepad .env
```

این متن رو paste کن:

```
DATABASE_URL=postgresql://saleh:1374@localhost:5432/salehkheiri
NODE_ENV=development
PORT=3000
VITE_API_URL=http://localhost:3000/api
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters_long
```

**Ctrl+S** و ببند.

---

## ✅ 4️⃣ Dependencies نصب کن

```
npm install
```

**صبر کن تا 100% تمام شود** (5-10 دقیقه)

---

## ✅ 5️⃣ Database Migration

```
npx prisma migrate dev
```

وقتی پرسید: **Enter**

---

## ✅ 6️⃣ اجرا کن

```
npm run dev
```

**باید بدین:**
```
✅ Server running on http://localhost:3000
✅ VITE ready in XXXms on http://localhost:5173
```

---

## 🌐 URLs

| سرویس | URL |
|------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000/api |
| Prisma Studio | npm run db:studio |
| Health Check | http://localhost:3000/api/health |

---

## 🚨 اگر خطا داد:

### "Connection refused"
```
PostgreSQL رو شروع کن (Step 1)
```

### "Port 3000 already in use"
```
npm run dev:backend -- --port 3001
```

### "migration failed"
```
npx prisma migrate reset
```

---

## 📞 سوالات؟

Issues رو GitHub باز کن یا سوال بپرس! 🎉
