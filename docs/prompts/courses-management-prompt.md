# Courses Management - UI/UX Design Prompt

## 📋 نیازمندی‌های سیستم

### بخش اول: Header و Controls

#### 1.1 - Header Section
- **عنوان صفحه**: "مدیریت دوره‌ها" با آیکن 📚
- **آمار کلی**: 
  - 📊 کل دوره‌ها
  - 👥 کل دانشجویان
  - 💰 کل درآمد
  - 📈 میانگین رتبه‌بندی

#### 1.2 - Top Actions Bar
- **"افزودن دوره جدید"** (دکمه Primary)
- **جستجو**: Search box با placeholder "جستجو بر اساس نام یا مدرس..."
- **فیلترها**:
  - 🏷️ **سطح**: مبتدی، متوسط، پیشرفته، همه
  - 🎬 **نوع**: ویدیویی، حضوری، ترکیبی، همه
  - ✅ **وضعیت**: فعال، غیرفعال، همه
  - 🔷 **نو**: جدید، قدیمی، همه
- **نمایش**: List/Grid view toggle
- **مرتب‌سازی**: Sort by (عنوان، تاریخ، قیمت، دانشجویان)
- **خروجی**: Export to Excel

---

### بخش دوم: Course Cards (Grid View)

#### 2.1 - Card Structure
**Card Header (Image Section)**:
- تصویر شاخص دوره (aspect-video)
- **Badges** (بر روی تصویر):
  - 🆕 "جدید" (اگر مربوطه)
  - 🔴 "پرطلب" (if students_count > 50)
  - 🎯 "درحال‌الانجام" (if active)
  - 💸 "تخفیف" (اگر original_price > price)
- **Hover Effect**: Overlay شفاف سیاه با دکمه‌های quick action

#### 2.2 - Card Content
**Title Section**:
- عنوان دوره (1-2 خط)
- مدرس (با آیکن 👨‍🏫)
- وضعیت (badge رنگی)

**Info Grid** (3 ستون):
- ⏱️ مدت (ساعت)
- 👥 تعداد دانشجویان
- 📊 میزان تکمیل (درصد)

**Rating Section**:
- ⭐ ستاره‌های رتبه‌بندی
- (x) نفر رتبه‌بندی کردند

**Price Section**:
- 💰 قیمت فعلی (بزرگ، تاکید شده)
- ~~قیمت اصلی~~ (اگر تخفیف وجود داشته باشد)
- % درصد تخفیف (سبز، برجسته)

**Description**:
- خلاصه‌ی توصیف (۲-۳ خط)
- "...بیشتر بدانید" link

**Action Buttons**:
- 👁️ مشاهده
- ✏️ ویرایش
- 📖 مدیریت دروس
- 🗑️ حذف

#### 2.3 - Card Styling
- Hover shadow: md → lg
- Border color: slight change on hover
- Image zoom: 1 → 1.05 on hover
- Smooth transition: 300ms

---

### بخش سوم: List View (جدول)

#### 3.1 - Table Structure
- ستون‌های اصلی:
  1. **تصویر + نام** (left)
  2. **مدرس** (center)
  3. **سطح** (center, badge)
  4. **نوع** (center, badge)
  5. **قیمت** (right)
  6. **دانشجویان** (center)
  7. **رتبه** (center, stars)
  8. **وضعیت** (center, badge)
  9. **عملیات** (right, dropdown menu)

#### 3.2 - Row Design
- Hover: bg-muted/50
- Striped: bg alternation
- Pagination: 20 items per page
- Column sorting: Click header to sort

---

### بخش چهارم: Add/Edit Dialog

#### 4.1 - Dialog Sections

**Section 1: Images**
- Featured image uploader
- Gallery images uploader (multi)
- Image preview
- Delete image buttons

**Section 2: Basic Info**
- عنوان (required)
- توضیحات (textarea, long)
- مدرس (required)
- سطح (dropdown)
- نوع دوره (dropdown)

**Section 3: Course Details**
- مدت (ساعت)
- تعداد درس
- موضوعات (tags)
- پیش‌نیازها (multi-select)
- مخاطبین (text)

**Section 4: Pricing**
- قیمت (required)
- قیمت اصلی (for discount display)
- موجودی (limited spots)

**Section 5: Metadata**
- Slug (auto-generated, editable)
- SEO Title
- SEO Description
- Keywords (tags)

**Section 6: Status**
- فعال (toggle)
- جدید (toggle)
- درج شده در سایت اصلی (toggle)
- Featured (toggle)

**Section 7: Gallery**
- آپلود گالری
- مرتب‌سازی تصاویر (drag-drop)
- حذف گالری

#### 4.2 - Dialog Features
- **Tabs** برای تنظیم بخش‌ها
- **Auto-save** drafts
- **Preview** دوره (کوچک)
- **Validation** قبل از ثبت
- **Loading state** و success/error toasts

---

### بخش پنجم: Advanced Features

#### 5.1 - Bulk Actions
- Checkbox برای انتخاب دوره‌ها
- **Select All** option
- Bulk actions bar:
  - 🗑️ حذف انتخاب‌شده‌ها
  - ✅ فعال کردن
  - ❌ غیرفعال کردن
  - 📌 درج شده
  - 📊 گزارش

#### 5.2 - Analytics Dashboard
- Recent courses added
- Most popular courses
- Revenue chart (monthly)
- Student growth chart
- Top instructors

#### 5.3 - Quick Stats Cards
- کل دوره‌ها
- دوره‌های فعال
- دوره‌های غیرفعال
- اضافه شده این ماه

---

### بخش ششم: Instructor Management (Sub-section)

#### 6.1 - Instructor List
- نام مدرس
- تعداد دوره‌ها
- میانگین رتبه‌بندی
- کل دانشجویان
- درآمد
- عملیات

#### 6.2 - Instructor Modal
- نام (required)
- بیوگرافی (textarea)
- تصویر (avatar)
- ایمیل (required)
- تلفن
- شبکه‌های اجتماعی (links)
- موارد تخصص (tags)
- درصد کمیسیون

---

### بخش هفتم: Category Management

#### 7.1 - Categories
- دسته‌بندی دوره‌ها
- دسته فرعی (sub-categories)
- تعداد دوره‌ها درهر دسته
- ترتیب نمایش
- فعال/غیرفعال

---

### بخش هشتم: UX/UI Standards

#### 8.1 - Responsive Design
- **Mobile**: Single column, dropdown for filters
- **Tablet**: 2 columns, inline filters
- **Desktop**: 3+ columns, sidebar filters

#### 8.2 - Visual Hierarchy
- H1: Page title (30px, bold)
- H2: Section titles (24px, semibold)
- H3: Card titles (18px, semibold)
- Body: 14px, regular
- Caption: 12px, muted

#### 8.3 - Colors
- **Primary**: Teal (#208080)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f97316)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

#### 8.4 - Spacing & Layout
- Card padding: 16px
- Gap between cards: 24px
- Section margin: 32px
- Border radius: 12px
- Shadows: sm → md → lg

#### 8.5 - Animations
- Page load: fade-in
- Card load: stagger (50ms delay)
- Hover: scale (1 → 1.02), shadow expand
- Dialog: fade-in, scale-up
- Transitions: 300ms ease

#### 8.6 - Accessibility
- ARIA labels on all buttons
- Keyboard navigation (Tab/Arrow)
- Focus indicators (clear)
- Color contrast ✓
- Screen reader support

---

### بخش نهم: Status Badges

#### 9.1 - Level Badges
```
🟢 مبتدی: Green
🟡 متوسط: Orange
🔴 پیشرفته: Red
```

#### 9.2 - Type Badges
```
🎬 ویدیویی: Blue
🏫 حضوری: Purple
🔀 ترکیبی: Cyan
```

#### 9.3 - Status Badges
```
✅ فعال: Green
❌ غیرفعال: Gray
⏳ درحال‌تدوین: Orange
🔒 خصوصی: Red
```

---

### بخش دهم: Performance

#### 10.1 - Optimization
- Virtual scrolling برای جداول بزرگ
- Image lazy loading
- Memoization برای cards
- Debounced search
- Pagination (not infinite scroll)

#### 10.2 - Loading States
- Skeleton loaders برای cards
- Table skeleton
- Image placeholders
- Spinner برای buttons

---

## 📊 Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│  مدیریت دوره‌ها                      📊 آمار | [+ افزودن]  │
├─────────────────────────────────────────────────────────────┤
│ [جستجو...] [سطح ▼] [نوع ▼] [وضعیت ▼] [مرتب ▼] [Export]    │
├─────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ [عکس دوره] │  │ [عکس دوره] │  │ [عکس دوره] │     │
│  │ 🆕           │  │              │  │ 🔴           │     │
│  │              │  │              │  │              │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ نام دوره    │  │ نام دوره    │  │ نام دوره    │     │
│  │ مدرس        │  │ مدرس        │  │ مدرس        │     │
│  │              │  │              │  │              │     │
│  │ ⏱ 20h ⭐4.5 │  │ ⏱ 15h ⭐4.2 │  │ ⏱ 30h ⭐4.8 │     │
│  │ 👥 120      │  │ 👥 85       │  │ 👥 200      │     │
│  │              │  │              │  │              │     │
│  │ 150K تومان  │  │ 200K تومان  │  │ 100K تومان  │     │
│  │              │  │              │  │              │     │
│  │[مشاهده][ویرایش]│  │[مشاهده][ویرایش]│  │[مشاهده][ویرایش]│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Key Design Decisions

1. **Card-based Layout**: بهتر برای نمایش تصاویر و اطلاعات
2. **Dual View (Grid/List)**: انعطاف برای ترجیح‌های مختلف کاربران
3. **Advanced Filters**: فیلتر‌کردن سریع و دقیق
4. **Bulk Actions**: کارایی برای مدیریت جمعی
5. **Analytics Integration**: درک بهتر عملکرد دوره‌ها
6. **Modal-based Editing**: بدون ترک صفحه
7. **Rich Media Support**: دو نوع تصویر (featured + gallery)

---

## ✨ Implementation Priorities

### Phase 1 (MVP)
- Grid view with cards
- Search & basic filters
- Add/Edit dialog
- Delete with confirmation
- Image upload

### Phase 2
- List view (table)
- Advanced filters
- Bulk actions
- Export Excel
- Instructor management

### Phase 3
- Analytics dashboard
- Category management
- Lesson management link
- Rating system
- Student reviews

### Phase 4
- Advanced search (Elasticsearch)
- Recommendation engine
- Price optimization
- Capacity management
- Waitlist system

---

## 📝 Data Model

```javascript
interface Course {
  id: string;
  title: string;                    // عنوان دوره
  slug: string;                     // URL slug
  description: string;              // توضیحات
  image_url: string;                // تصویر شاخص
  gallery_images: string[];         // گالری تصاویر
  price: number;                    // قیمت
  original_price?: number;          // قیمت اصلی (برای تخفیف)
  duration_hours: number;           // مدت دوره
  level: 'مبتدی' | 'متوسط' | 'پیشرفته';
  course_type: 'ویدیویی' | 'حضوری' | 'ترکیبی';
  instructor_name: string;          // نام مدرس
  students_count: number;           // تعداد دانشجویان
  rating: number;                   // میانگین رتبه‌بندی
  is_active: boolean;               // فعال
  is_new: boolean;                  // جدید
  is_featured: boolean;             // برجسته
  lessons_count: number;            // تعداد درس‌ها
  topics: string[];                 // موضوعات
  created_at: string;               // تاریخ ایجاد
  updated_at: string;               // تاریخ ویرایش
}
```

---

## 🔗 Related Pages
- `/admin/courses` - این صفحه
- `/admin/courses/[id]/lessons` - مدیریت درس‌های دوره
- `/admin/instructors` - مدیریت مدرس‌ها
- `/admin/categories` - مدیریت دسته‌بندی‌ها

---

## 📚 Resources
- Icons: Lucide React
- Form: React Hook Form
- Upload: Supabase Storage
- Date: date-fns
- Animation: Framer Motion
