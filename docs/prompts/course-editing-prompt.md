# Course Editing Page - UI/UX Design Prompt

## 📋 نیازمندی‌های سیستم

### بخش اول: Header و Navigation

#### 1.1 - Page Header
- **عنوان**: "ویرایش دوره: [نام دوره]" یا "افزودن دوره جدید"
- **Breadcrumb**: مدیریت > دوره‌ها > [نام دوره] (اگر ویرایش)
- **Back Button**: بازگشت به لیست دوره‌ها
- **Save Draft**: ذخیره پیش‌نویس (اختیاری)

#### 1.2 - Tab Navigation
- 📸 **تصاویر** (Images)
- ℹ️ **اطلاعات اساسی** (Basic Info)
- 📚 **جزئیات دوره** (Course Details)
- 💰 **قیمت‌گذاری** (Pricing)
- ⚙️ **تنظیمات** (Settings)
- 🔍 **SEO** (Optional)

---

## 🎨 بخش تصاویر (Images Tab) - CRITICAL

### مشکل فعلی:
- ❌ تصاویر آپلود نمی‌شوند
- ❌ Preview نمایش داده نمی‌شود
- ❌ حذف تصویر کار نمی‌کند
- ❌ Validation ندارد

### 2.1 - Featured Image Section

**Upload Area:**
- Drag & Drop zone (500x300px preview)
- Click to browse option
- **مجاز فرمت‌ها**: JPG, PNG, WebP
- **حداکثر سایز**: 5MB
- **تصویر بهینه**: 1200x800px

**Image Preview:**
- نمایش فوری تصویر آپلود شده
- نمایش نام فایل
- نمایش سایز فایل
- Zoom option (hover)
- **Change** button برای جایگزینی
- **Delete** button برای حذف

**Image Optimization:**
- ✅ Auto crop to aspect ratio
- ✅ Compression (quality: 85)
- ✅ Progressive loading
- ✅ WebP conversion

**Validation:**
```
❌ فایل بزرگتر از 5MB: "تصویر باید کمتر از 5MB باشد"
❌ فرمت غیرمدعوم: "فقط JPG, PNG, WebP مجاز هستند"
❌ دقت پایین: "تصویر باید حداقل 800x600 باشد"
✅ موفق: "تصویر با موفقیت آپلود شد"
```

### 2.2 - Gallery Images Section

**Gallery Upload:**
- Multi-image uploader
- Drag & drop multiple files
- Show upload progress (percentage)
- "+ افزودن تصویر" button

**Gallery Grid:**
- هر تصویر در یک کارت
- نمایش شماره ترتیب
- Hover effect: opacity + actions
- Actions:
  - 👁️ Preview (modal)
  - 🔼 Move Up
  - 🔽 Move Down
  - 🔄 Replace
  - 🗑️ Delete

**Gallery Features:**
- ✅ Drag to reorder
- ✅ Limit: حداکثر 10 تصویر
- ✅ Show count: "3 / 10"
- ✅ Thumbnail preview

---

## 📝 بخش اطلاعات اساسی (Basic Info Tab)

### 3.1 - Required Fields

**عنوان دوره** (Title)
- Input text field
- Character count: 0/100
- Real-time validation
- ✅ Required
- 🚫 Placeholder: "عنوان جذاب و واضح وارد کنید"

**توضیحات** (Description)
- Rich text editor (Markdown support)
- Formatting toolbar:
  - Bold (B), Italic (I), Underline (U)
  - Lists (bullet, numbered)
  - Headings (H1, H2, H3)
  - Links, Code
- Character count: 0/2000
- Preview mode
- ✅ Required

**مدرس** (Instructor)
- Dropdown select (fetch از database)
- Search/filter option
- Show instructor avatar + name
- "+ افزودن مدرس جدید" option
- ✅ Required

**سطح** (Level)
- Radio buttons یا Select:
  - 🟢 مبتدی (Beginner)
  - 🟡 متوسط (Intermediate)
  - 🔴 پیشرفته (Advanced)
- Visual indicators
- ✅ Required

---

## 📚 بخش جزئیات دوره (Course Details Tab)

### 4.1 - Course Metadata

**مدت دوره** (Duration)
- Number input (hours)
- Min: 1, Max: 1000
- Example: 24

**نوع دوره** (Course Type)
- Radio/Select:
  - 🎬 ویدیویی (Video)
  - 👥 حضوری (In-person)
  - 🔄 ترکیبی (Hybrid)
- ✅ Required

**تعداد درس‌ها** (Lesson Count)
- Auto-calculated from lessons DB
- Display only (non-editable)

**موضوعات** (Topics)
- Tag input (autocomplete)
- Suggestions from database
- Max 10 topics
- Show as colored badges

**پیش‌نیازها** (Prerequisites)
- Multi-select dropdown
- Search capable
- Show selected as removable tags
- "اختیاری" label

**مخاطبین** (Target Audience)
- Textarea
- Placeholder: "این دوره برای کسانی است که..."

---

## 💰 بخش قیمت‌گذاری (Pricing Tab)

### 5.1 - Price Settings

**قیمت فعلی** (Current Price)
- Number input
- Currency: تومان
- Min: 0, Max: 999,999,999
- Show formatted: "150,000 تومان"
- ✅ Required

**قیمت اصلی** (Original Price - for discount)
- Number input
- Optional
- Must be >= Current Price
- Show discount percentage (auto-calculated):
  ```
  Discount % = ((Original - Current) / Original) * 100
  ```

**درصد تخفیف** (Discount %)
- Auto-calculated (read-only)
- Show in red if > 0
- Example: "-30%"

**موجودی محدود** (Limited Capacity)
- Toggle: yes/no
- If yes, show:
  - "حداکثر دانشجویان": number input
  - "دانشجویان فعلی": display only
  - "جاهای خالی": display only

---

## ⚙️ بخش تنظیمات (Settings Tab)

### 6.1 - Status Controls

**فعال** (Is Active)
- Toggle switch
- Label: "این دوره فعال و قابل خرید است"
- Visual: green when on

**جدید** (Is New)
- Toggle switch
- Label: "نمایش badge "جدید" روی کارت‌ها"
- Duration: "به مدت 7 روز"

**برجسته** (Is Featured)
- Toggle switch
- Label: "نمایش در صفحه اصلی"

**دره شده در سایت** (Is Published)
- Toggle switch
- Label: "نمایش عمومی در کاتالوگ دوره‌ها"
- Warning: "اگر غیرفعال باشد، دوره مخفی خواهد شد"

### 6.2 - SEO Settings (Optional)

**Slug** (URL)
- Text input
- Auto-generated from title
- Manual edit option
- Pattern: lowercase, dash-separated
- Example: "web-development-2024"

**Meta Title**
- Text input (max 60 chars)
- Character count: 0/60
- Suggestion: same as title

**Meta Description**
- Textarea (max 160 chars)
- Character count: 0/160
- Auto-suggest from description

**Keywords**
- Tag input
- Max 10 keywords
- Separated by comma

---

## 💾 بخش Save و Actions

### 7.1 - Action Buttons

**Save Button** (Primary)
- Position: Fixed bottom or sticky top
- State:
  - Normal: "💾 ذخیره تغییرات"
  - Loading: "💫 در حال ذخیره..."
  - Success: "✅ ذخیره شد"
  - Error: "❌ خطا در ذخیره"
- Validation before save:
  - Check required fields
  - Validate file sizes
  - Validate URLs
  - Show errors inline

**Save & Publish**
- Secondary button
- Saves + sets published to true
- Requires image
- Requires description

**Save Draft**
- Tertiary button
- Allows incomplete data
- Quick save

**Discard**
- Outline button
- Warning: "تغییرات بدون ذخیره شده حذف خواهند شد"
- Confirmation dialog

**Preview**
- Outline button
- Opens modal
- Shows how it looks on site

---

## 🖼️ Form Layout

### 8.1 - Desktop Layout (1024px+)
```
┌─────────────────────────────────────────┐
│ ← بازگشت | ویرایش دوره: [نام]           │
├─────────────────────────────────────────┤
│ [تصاویر] [اطلاعات] [قیمت] [تنظیمات]     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │  Featured   │  │  Gallery        │  │
│  │   Image     │  │   Images        │  │
│  │  (500x300)  │  │  (thumbnail)    │  │
│  └─────────────┘  │  (thumbnail)    │  │
│                   │  (thumbnail)    │  │
│                   └─────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ [ذخیره] [انتشار] [پیش‌نمایش] [حذف]      │
└─────────────────────────────────────────┘
```

### 8.2 - Mobile Layout (< 768px)
```
Single column layout
All sections stack vertically
Full-width inputs
Fixed bottom action bar
```

---

## 🔧 تکنیکال Specifications

### 9.1 - Image Upload Handler

**Client-side:**
```javascript
// Validation
- Max size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Min dimensions: 800x600
- Max dimensions: 4000x3000

// Processing
- Compress with quality: 85
- Convert to WebP if possible
- Generate thumbnail (200x200)
- Show progress bar
```

**Server-side:**
```javascript
// Upload to Supabase Storage
- Path: /courses/{course_id}/
- Featured: featured.webp
- Gallery: gallery-{timestamp}.webp
- Public URL generation
- CDN optimization
```

### 9.2 - Form State Management

**Local State:**
```javascript
const [formData, setFormData] = useState({
  title: "",
  description: "",
  image_url: "",
  gallery_images: [],
  // ... other fields
});

const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [activeTab, setActiveTab] = useState('images');
```

**Form Validation:**
```javascript
const validateForm = () => {
  const newErrors = {};
  if (!formData.title.trim()) {
    newErrors.title = "عنوان الزامی است";
  }
  if (formData.title.length > 100) {
    newErrors.title = "عنوان نباید بیشتر از 100 کاراکتر باشد";
  }
  // ... more validations
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 9.3 - Save Logic

```javascript
const handleSave = async () => {
  if (!validateForm()) {
    toast.error("لطفا خطاهای فرم را درست کنید");
    return;
  }
  
  setLoading(true);
  try {
    // 1. Upload images (if new)
    const imageUrls = await uploadImages();
    
    // 2. Update form data with new URLs
    const dataToSave = {
      ...formData,
      image_url: imageUrls.featured,
      gallery_images: imageUrls.gallery,
    };
    
    // 3. Save to database
    if (isEditing) {
      await supabase
        .from("courses")
        .update(dataToSave)
        .eq("id", courseId);
    } else {
      await supabase.from("courses").insert([dataToSave]);
    }
    
    toast.success("دوره با موفقیت ذخیره شد");
    navigate("/admin/courses");
  } catch (error) {
    toast.error(`خطا: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Validation Rules

| Field | Required | Type | Min | Max | Pattern |
|-------|----------|------|-----|-----|----------|
| Title | ✅ | String | 5 | 100 | Any |
| Description | ✅ | Text | 20 | 2000 | Any |
| Image | ✅ | File | - | 5MB | JPG/PNG |
| Price | ✅ | Number | 0 | 999M | Integer |
| Duration | ✅ | Number | 1 | 1000 | Integer |
| Level | ✅ | Select | - | - | enum |
| Instructor | ✅ | Select | - | - | UUID |

---

## 🎨 Visual States

### 10.1 - Error States
```
❌ Field has error:
- Red border
- Error message below
- Error icon
- Background color: light red

❌ Image upload error:
- Toast notification
- Retry button
- Error details

❌ Form submission error:
- Modal with error list
- Scroll to first error
- Highlight problematic fields
```

### 10.2 - Success States
```
✅ Image uploaded:
- Thumbnail shows
- Success toast
- Green check icon
- File size shown

✅ Form saved:
- Toast: "دوره با موفقیت ذخیره شد"
- Redirect to list
- Show success badge
```

### 10.3 - Loading States
```
⏳ Image uploading:
- Progress bar (0-100%)
- File name shown
- "در حال آپلود..."
- Cancel button

⏳ Form saving:
- Button spinner
- Disabled form inputs
- "در حال ذخیره..."
```

---

## 🔄 Real-time Features

### 11.1 - Auto-save
- Draft save every 30 seconds
- Show indicator: "💾 ذخیره‌شده"
- Debounced requests
- Don't save if no changes

### 11.2 - Character Counters
- Title: "45 / 100"
- Description: "1,250 / 2,000"
- Update in real-time
- Warn at 80% capacity

### 11.3 - Live Preview
- Right panel (desktop)
- Shows how it appears on site
- Update on input change
- Mock student view

---

## ♿ Accessibility

- [ ] ARIA labels on all inputs
- [ ] Focus management
- [ ] Keyboard navigation (Tab)
- [ ] Error announcements
- [ ] Color contrast >= 4.5:1
- [ ] Alt text for images
- [ ] Form validation messages

---

## 📱 Responsive Design

**Desktop (1024px+):**
- Side-by-side forms and preview
- Multiple images in gallery grid

**Tablet (768px - 1023px):**
- Stacked layout
- Full-width inputs
- Gallery: 2 columns

**Mobile (< 768px):**
- Single column
- Full-width everything
- Bottom action bar (sticky)
- Simplified preview

---

## 🚀 Implementation Priority

### Phase 1 (MVP)
- Basic form fields
- Single image upload
- Save/publish
- Validation

### Phase 2
- Gallery images (multiple)
- Rich text editor
- Real-time preview
- Auto-save

### Phase 3
- SEO settings
- Batch upload
- Image cropping
- Advanced validations

### Phase 4
- A/B testing variants
- Analytics integration
- Pricing templates
- AI-powered suggestions

---

## 🔗 Related Components
- Image uploader (MultiImageUpload)
- Rich text editor (markdown)
- Form validation hook
- Image compression utility
- Toast notifications

---

## 📚 Data Model

```typescript
interface CourseEditForm {
  // Images
  image_url: string; // Featured image URL
  gallery_images: string[]; // Array of gallery URLs
  
  // Basic
  title: string;
  description: string;
  instructor_id: string;
  level: "مبتدی" | "متوسط" | "پیشرفته";
  
  // Details
  duration_hours: number;
  course_type: "ویدیویی" | "حضوری" | "ترکیبی";
  topics: string[];
  prerequisites?: string[];
  target_audience: string;
  
  // Pricing
  price: number;
  original_price?: number;
  capacity?: number;
  
  // Settings
  is_active: boolean;
  is_new: boolean;
  is_featured: boolean;
  is_published: boolean;
  
  // SEO
  slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
}
```
