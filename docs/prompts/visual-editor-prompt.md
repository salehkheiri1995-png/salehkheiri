# Visual Page Editor - راهنمای ویرایشگر بصری صفحات

## مفهوم کلی

ویرایشگر بصری یک ابزار قدرتمند مشابه Elementor است که به مدیران سایت اجازه می‌دهد بدون نیاز به کدنویسی، محتوای صفحات را مستقیماً از طریق رابط کاربری ویرایش کنند.

## اجزای سیستم

### 1. پایگاه داده (`site_content`)
جدولی برای ذخیره محتوای سفارشی با ستون‌های:
- `page_key`: کلید صفحه (مثال: `home`, `contact`, `shop`)
- `content_key`: کلید محتوا (مثال: `hero_title`, `cta_description`)
- `content_type`: نوع محتوا (`text`, `image`, `background`, `style`)
- `content_value`: مقدار ذخیره شده

### 2. کامپوننت‌های ویرایشی

#### `EditableText`
برای ویرایش متن‌های ساده و چندخطی:
```tsx
<EditableText
  pageKey="home"
  contentKey="hero_title"
  defaultValue="عنوان پیش‌فرض"
  as="h1"
  multiline={false}
/>
```

**پراپرتی‌ها:**
- `pageKey`: کلید صفحه
- `contentKey`: کلید یکتای محتوا
- `defaultValue`: مقدار پیش‌فرض
- `as`: تگ HTML (h1, h2, h3, h4, p, span, div)
- `multiline`: ویرایش چندخطی
- `className`: کلاس‌های CSS
- `fontStyleKey`: کلید ذخیره سبک فونت (اختیاری)

#### `EditableImage`
برای ویرایش تصاویر با قابلیت آپلود:
```tsx
<EditableImage
  pageKey="home"
  contentKey="hero_image"
  defaultSrc="/placeholder.jpg"
  alt="تصویر قهرمان"
/>
```

**پراپرتی‌ها:**
- `pageKey`: کلید صفحه
- `contentKey`: کلید یکتای محتوا
- `defaultSrc`: آدرس تصویر پیش‌فرض
- `alt`: متن جایگزین
- `className`: کلاس‌های CSS

#### `EditableSection`
برای تغییر پس‌زمینه بخش‌ها:
```tsx
<EditableSection
  pageKey="home"
  contentKey="hero_section"
  defaultBg="bg-background"
>
  {/* محتوای بخش */}
</EditableSection>
```

**پراپرتی‌ها:**
- `pageKey`: کلید صفحه
- `contentKey`: کلید یکتای بخش
- `defaultBg`: کلاس پس‌زمینه پیش‌فرض
- `className`: کلاس‌های اضافی

### 3. Context و Hook (`useVisualEditor`)

```tsx
const {
  isEditMode,      // آیا حالت ویرایش فعال است
  setEditMode,     // تغییر حالت ویرایش
  isAdmin,         // آیا کاربر مدیر است
  getContent,      // دریافت محتوا
  updateContent,   // بروزرسانی محتوا (محلی)
  saveAllChanges,  // ذخیره همه تغییرات در دیتابیس
  hasUnsavedChanges, // آیا تغییرات ذخیره نشده وجود دارد
  isSaving,        // آیا در حال ذخیره است
} = useVisualEditor();
```

### 4. نوار ابزار (`EditorToolbar`)
نواری ثابت در پایین صفحه که شامل:
- دکمه فعال/غیرفعال کردن ویرایش
- نشانگر تغییرات ذخیره نشده
- دکمه ذخیره
- دکمه خروج از حالت ویرایش

## نحوه اضافه کردن ویرایشگر به صفحات جدید

### مرحله 1: اضافه کردن import‌ها
```tsx
import { EditableSection } from "@/components/visual-editor/EditableSection";
import { EditableText } from "@/components/visual-editor/EditableText";
import { EditableImage } from "@/components/visual-editor/EditableImage";
```

### مرحله 2: جایگزینی عناصر استاتیک

**قبل:**
```tsx
<h1 className="text-4xl font-bold">عنوان صفحه</h1>
<p>توضیحات صفحه</p>
```

**بعد:**
```tsx
<EditableText
  pageKey="page_name"
  contentKey="page_title"
  defaultValue="عنوان صفحه"
  as="h1"
  className="text-4xl font-bold"
/>
<EditableText
  pageKey="page_name"
  contentKey="page_description"
  defaultValue="توضیحات صفحه"
  as="p"
/>
```

### مرحله 3: اضافه کردن EditableSection برای پس‌زمینه
```tsx
<EditableSection pageKey="page_name" contentKey="main_section" defaultBg="bg-background">
  {/* محتوای بخش */}
</EditableSection>
```

## نکات مهم

1. **کلیدهای یکتا**: هر ترکیب `pageKey + contentKey` باید یکتا باشد
2. **مقادیر پیش‌فرض**: همیشه `defaultValue` معنادار تنظیم کنید
3. **کلاس‌های CSS**: همه کلاس‌ها از طریق `className` قابل اعمال هستند
4. **عملکرد**: محتوای ویرایش شده در دیتابیس ذخیره می‌شود و در بارگذاری مجدد بازیابی می‌گردد
5. **دسترسی**: فقط کاربران با نقش `admin` می‌توانند ویرایش کنند

## صفحات پشتیبانی شده

- ✅ صفحه اصلی (Hero, Services, Specialists, Courses, Products, CTA)
- ✅ صفحه تماس
- ✅ صفحه نمونه کارها
- ✅ صفحه فروشگاه
- ✅ صفحه دوره‌ها
- ✅ صفحه رزرو نوبت
- ✅ صفحات سوالات متداول، قوانین و حریم خصوصی

## امکانات سبک‌دهی

### تغییر فونت و اندازه متن
با استفاده از `fontStyleKey` می‌توانید به کاربر اجازه تغییر:
- فونت (از لیست فونت‌های فارسی)
- اندازه متن (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
- وزن فونت (light, normal, medium, semibold, bold)

```tsx
<EditableText
  pageKey="home"
  contentKey="hero_title"
  defaultValue="عنوان"
  as="h1"
  fontStyleKey="hero_title_style"
/>
```
