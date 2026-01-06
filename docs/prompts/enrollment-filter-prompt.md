# Enrollment Filter Feature - UI/UX Prompt

## 📋 نیازمندی‌های سیستم

### بخش اول: لیست دوره‌ها (Course Selection Panel)

#### 1.1 - طراحی Sidebar/Panel
- یک پنل سمت چپ یا بالا نمایش دهنده تمام دوره‌های موجود
- نمایش اطلاعات هر دوره:
  - 🎓 عنوان دوره
  - 👥 تعداد کل ثبت‌نام‌شدگان
  - 💰 قیمت دوره
  - 📊 درصد تکمیل‌شدگی (میانگین پیشرفت دانشجویان)
  - 💵 درآمد کل دریافت‌شده

#### 1.2 - استایل هر دوره
- کارت حاوی اطلاعات
- Hover effect: سایه و تغییر پس‌زمینه
- Active state: border رنگی و پس‌زمینه برجسته
- نمایش badge تعداد دانشجویان
- Progress bar نمایش درصد تکمیل

#### 1.3 - Functionality
- کلیک روی هر دوره → فیلتر کردن جدول
- "تمام دوره‌ها" بعنوان گزینه پیش‌فرض
- مشخص کردن دوره‌ی فعلی (active state)
- Loading state هنگام تغییر دوره

---

### بخش دوم: جدول Enrollments (Filtered Table)

#### 2.1 - تغییرات جدول
- نمایش تنها کاربرانی که در دوره‌ی انتخاب‌شده شرکت کردند
- اضافه کردن ستون جدید: "سطح پیشرفت" (درصد)
- نمایش تاریخ تکمیل دوره (اگر موجود باشد)

#### 2.2 - Header جدول
- نمایش نام دوره‌ی فعلی
- عنوان: "دانشجویان دوره: [نام دوره]"
- نمایش تعداد دانشجویان این دوره

#### 2.3 - Breadcrumb (اختیاری)
- نمایش مسیر: صفحه‌ی اصلی > دوره‌های من > [نام دوره]
- امکان برگشت به لیست کامل

---

### بخش سوم: Stats و Metrics

#### 3.1 - آمار دوره‌ی انتخاب‌شده
هنگام انتخاب یک دوره، نمایش:
- 👥 تعداد کل دانشجویان
- ✅ تعداد دانشجویان کامل‌کنندگان
- ⏳ میانگین درصد پیشرفت
- 💰 درآمد کل دریافت‌شده
- 💵 میانگین درآمد هر دانشجو
- 📅 تاریخ ایجاد دوره

#### 3.2 - نمایش Stats
- Cards بزرگ در بالای جدول
- Animated counters (شمارش تدریجی)
- Icons مناسب برای هر stat
- رنگ‌بندی: سبز (موفقیت)، آبی (اطلاعات)، نارنجی (هشدار)

---

### بخش چهارم: عملیات و Actions

#### 4.1 - Actions برای دوره‌ی انتخاب‌شده
- 📊 **دانلود گزارش**: Export به Excel شامل تمام دانشجویان
- 📨 **ارسال اطلاع رسانی**: فقط به دانشجویان این دوره
- 🔄 **تازه‌سازی**: Refresh کردن اطلاعات
- 🏆 **شهادت**: صدور گواهی برای دانشجویان

#### 4.2 - Bulk Actions
- انتخاب چندین دانشجو
- ارسال پیام جمعی
- تغییر وضعیت دسته‌ای
- حذف دسته‌ای

---

### بخش پنجم: تجربه کاربری (UX)

#### 5.1 - Responsive Design
- **Desktop**: Sidebar سمت چپ + جدول در سمت راست
- **Tablet**: Sidebar بالا (slider افقی) + جدول پایین
- **Mobile**: Dropdown برای انتخاب دوره + جدول کامل

#### 5.2 - Animations & Transitions
- Fade in/out هنگام تغییر دوره
- Slide animation برای panel جدید
- Smooth transition برای رنگ‌ها
- Loading skeleton هنگام fetch

#### 5.3 - Accessibility
- Keyboard navigation (Tab/Arrow keys)
- Screen reader support
- Color contrast ✓
- Focus states واضح

---

### بخش ششم: Visual Design

#### 6.1 - Color Scheme
- **Primary**: رنگ تم (تال)
- **Success**: سبز (#22c55e)
- **Warning**: نارنجی (#f97316)
- **Danger**: قرمز (#ef4444)
- **Neutral**: خاکستری

#### 6.2 - Typography
- Title دوره: font-size: 20px, weight: 600
- Stats labels: font-size: 14px, weight: 500
- Table data: font-size: 14px, weight: 400

#### 6.3 - Spacing & Layout
- Padding panels: 16px - 24px
- Gap between cards: 16px
- Border radius: 8px - 12px
- Shadows: subtle (sm to md)

---

### بخش هفتم: Performance

#### 7.1 - Optimization
- Virtual scrolling برای جداول بزرگ
- Lazy loading برای images
- Memoization برای components
- Debouncing برای search/filters

#### 7.2 - Data Caching
- Cache enrollment data
- Update cache on changes
- Invalidate cache strategically

---

## 🎨 Layout Wireframe

```
┌─────────────────────────────────────────────────┐
│         صفحه ثبت‌نام‌های دوره‌ها                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  دوره‌ها     │  │  Stats & Metrics       │ │
│  │  ────────    │  │  ─────────────────────  │ │
│  │ [▶ دوره ۱]   │  │  👥 150 دانشجو        │ │
│  │ [ ] دوره ۲   │  │  ✅ 45 کامل‌کننده      │ │
│  │ [ ] دوره ۳   │  │  ⏳ 65% میانگین        │ │
│  │ [ ] دوره ۴   │  │  💰 15M تومان          │ │
│  └──────────────┘  └─────────────────────────┘ │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  دانشجویان دوره: [دوره ۱]                │  │
│  │                                          │  │
│  │  ┌──────────────────────────────────────┐ │  │
│  │  │ نام    │ وضعیت │ پیشرفت │ عملیات  │ │  │
│  │  ├──────────────────────────────────────┤ │  │
│  │  │ ...                                  │ │  │
│  │  └──────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📝 Implementation Notes

1. **State Management**: استفاده از React hooks برای selected course
2. **Data Filtering**: Server-side filtering اگر dataset بزرگ است
3. **Caching**: استفاده از React Query یا SWR
4. **Error Handling**: نمایش خطا و retry button
5. **Loading States**: Skeleton loaders برای بهتر UX

---

## 🚀 Priority

**Phase 1 (MVP)**:
- Course selection panel
- Table filtering
- Basic stats display

**Phase 2**:
- Bulk actions
- Advanced filtering
- Export functionality

**Phase 3**:
- Analytics dashboard
- Certificates
- Advanced reports
