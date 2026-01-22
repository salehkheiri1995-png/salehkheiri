-- ===========================================
-- سالن زیبایی - Schema کامل دیتابیس
-- نسخه: 2.0 - شامل تمام روابط و Triggers
-- ===========================================

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- انواع سفارشی (Custom Types)
-- ===========================================

-- نقش‌های کاربری
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- وضعیت رزرو
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- وضعیت سفارش
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- وضعیت پرداخت
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- جداول اصلی
-- ===========================================

-- ۱. Profiles (کاربران) - جدول اصلی که بقیه بهش وابسته‌اند
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۲. User Roles (نقش‌های کاربری)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_user_roles_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    
    -- یکتایی
    CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- ۳. Services (خدمات)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    price NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    duration_minutes INTEGER DEFAULT 60 CHECK (duration_minutes > 0),
    gallery_images TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۴. Specialists (متخصصین)
CREATE TABLE IF NOT EXISTS specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- اختیاری: اگر متخصص کاربر سیستم هم باشد
    full_name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    instagram_url TEXT,
    telegram_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_specialists_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL
);

-- ۵. Specialist Services (خدمات هر متخصص) - جدول واسط
CREATE TABLE IF NOT EXISTS specialist_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL,
    service_id UUID NOT NULL,
    custom_price NUMERIC, -- قیمت سفارشی این متخصص برای این خدمت
    custom_duration INTEGER, -- مدت زمان سفارشی
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_specialist_services_specialist 
        FOREIGN KEY (specialist_id) 
        REFERENCES specialists(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_specialist_services_service 
        FOREIGN KEY (service_id) 
        REFERENCES services(id) 
        ON DELETE CASCADE,
    
    -- یکتایی
    CONSTRAINT unique_specialist_service UNIQUE(specialist_id, service_id)
);

-- ۶. Bookings (رزروها)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- می‌تواند null باشد برای رزرو مهمان
    service_id UUID,
    specialist_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total_price NUMERIC DEFAULT 0,
    reminder_sent BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_bookings_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_bookings_service 
        FOREIGN KEY (service_id) 
        REFERENCES services(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_bookings_specialist 
        FOREIGN KEY (specialist_id) 
        REFERENCES specialists(id) 
        ON DELETE SET NULL,
    
    -- جلوگیری از رزرو تکراری
    CONSTRAINT unique_booking_slot 
        UNIQUE(specialist_id, booking_date, booking_time)
);

-- ۷. Products (محصولات)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    image_url TEXT,
    category TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    price NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price IS NULL OR original_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku TEXT UNIQUE, -- کد محصول
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    sales_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hot BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۸. Shipping Methods (روش‌های ارسال)
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    min_delivery_days INTEGER DEFAULT 1,
    max_delivery_days INTEGER DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۹. Orders (سفارشات)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE, -- شماره سفارش قابل نمایش
    user_id UUID,
    shipping_method_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    notes TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_cost NUMERIC NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total NUMERIC NOT NULL DEFAULT 0 CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_orders_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_orders_shipping_method 
        FOREIGN KEY (shipping_method_id) 
        REFERENCES shipping_methods(id) 
        ON DELETE SET NULL
);

-- ۱۰. Order Items (آیتم‌های سفارش)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID,
    product_name TEXT NOT NULL, -- ذخیره نام در زمان خرید
    product_price NUMERIC NOT NULL CHECK (product_price >= 0),
    product_image TEXT, -- ذخیره تصویر در زمان خرید
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total NUMERIC NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE SET NULL
);

-- ۱۱. Courses (دوره‌ها)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL-friendly نام
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    preview_video_url TEXT, -- ویدیو معرفی
    instructor_id UUID, -- ارتباط با متخصص
    instructor_name TEXT,
    price NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price IS NULL OR original_price >= 0),
    duration_hours INTEGER DEFAULT 0 CHECK (duration_hours >= 0),
    lessons_count INTEGER DEFAULT 0,
    level TEXT DEFAULT 'مبتدی',
    course_type TEXT DEFAULT 'ویدیویی',
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    students_count INTEGER DEFAULT 0 CHECK (students_count >= 0),
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    requirements TEXT[], -- پیش‌نیازها
    what_you_learn TEXT[], -- چه چیزی یاد می‌گیرید
    order_index INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_courses_instructor 
        FOREIGN KEY (instructor_id) 
        REFERENCES specialists(id) 
        ON DELETE SET NULL
);

-- ۱۲. Course Lessons (درس‌های دوره)
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_duration_seconds INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0 CHECK (duration_minutes >= 0),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT false, -- درس رایگان برای پیش‌نمایش
    is_published BOOLEAN DEFAULT true,
    attachments TEXT[] DEFAULT '{}', -- فایل‌های پیوست
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_course_lessons_course 
        FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE
);

-- ۱۳. Course Enrollments (ثبت‌نام دوره‌ها)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_watched_lesson_id UUID,
    last_watched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'completed',
    payment_amount NUMERIC DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_course_enrollments_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_course_enrollments_course 
        FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_course_enrollments_last_lesson 
        FOREIGN KEY (last_watched_lesson_id) 
        REFERENCES course_lessons(id) 
        ON DELETE SET NULL,
    
    -- یکتایی: هر کاربر فقط یک بار در هر دوره
    CONSTRAINT unique_user_course UNIQUE(user_id, course_id)
);

-- ۱۴. Lesson Progress (پیشرفت درس‌ها)
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    watched_seconds INTEGER DEFAULT 0 CHECK (watched_seconds >= 0),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT, -- یادداشت‌های کاربر
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_lesson_progress_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_lesson_progress_lesson 
        FOREIGN KEY (lesson_id) 
        REFERENCES course_lessons(id) 
        ON DELETE CASCADE,
    
    -- یکتایی
    CONSTRAINT unique_user_lesson UNIQUE(user_id, lesson_id)
);

-- ۱۵. Portfolio Categories (دسته‌بندی نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۱۶. Portfolio (نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    category_id UUID, -- ارتباط با دسته‌بندی
    category TEXT, -- برای سازگاری
    specialist_id UUID, -- متخصص مرتبط
    order_index INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_portfolio_category 
        FOREIGN KEY (category_id) 
        REFERENCES portfolio_categories(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_portfolio_specialist 
        FOREIGN KEY (specialist_id) 
        REFERENCES specialists(id) 
        ON DELETE SET NULL
);

-- ۱۷. Reviews (نظرات محصولات/خدمات)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    product_id UUID,
    service_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    pros TEXT[], -- نقاط قوت
    cons TEXT[], -- نقاط ضعف
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    admin_reply TEXT,
    admin_replied_at TIMESTAMPTZ,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_reviews_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_service 
        FOREIGN KEY (service_id) 
        REFERENCES services(id) 
        ON DELETE CASCADE,
    
    -- حداقل یکی از product_id یا service_id باید پر باشد
    CONSTRAINT check_review_target 
        CHECK (product_id IS NOT NULL OR service_id IS NOT NULL)
);

-- ۱۸. Portfolio Reviews (نظرات نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_portfolio_reviews_portfolio 
        FOREIGN KEY (portfolio_id) 
        REFERENCES portfolio(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_portfolio_reviews_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    
    -- هر کاربر فقط یک نظر برای هر نمونه کار
    CONSTRAINT unique_portfolio_user_review UNIQUE(portfolio_id, user_id)
);

-- ۱۹. Notifications (اعلان‌ها)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE
);

-- ۲۰. Wishlist (لیست علاقه‌مندی‌ها)
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    product_id UUID,
    course_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_wishlist_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_course 
        FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE,
    
    -- حداقل یکی باید پر باشد
    CONSTRAINT check_wishlist_item 
        CHECK (product_id IS NOT NULL OR course_id IS NOT NULL),
    
    -- یکتایی
    CONSTRAINT unique_wishlist_product UNIQUE(user_id, product_id),
    CONSTRAINT unique_wishlist_course UNIQUE(user_id, course_id)
);

-- ۲۱. Salon Settings (تنظیمات سالن)
CREATE TABLE IF NOT EXISTS salon_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_name TEXT NOT NULL DEFAULT 'سالن زیبایی',
    logo_url TEXT,
    favicon_url TEXT,
    phone TEXT,
    phone2 TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    map_lat NUMERIC,
    map_lng NUMERIC,
    instagram_url TEXT,
    telegram_url TEXT,
    whatsapp TEXT,
    youtube_url TEXT,
    working_hours TEXT,
    working_hours_detail JSONB, -- ساعات کاری هر روز
    about_text TEXT,
    hero_badge_text TEXT,
    hero_title TEXT,
    hero_highlight TEXT,
    hero_description TEXT,
    hero_image_url TEXT,
    home_services_title TEXT,
    home_services_subtitle TEXT,
    home_specialists_title TEXT,
    home_specialists_subtitle TEXT,
    home_courses_title TEXT,
    home_courses_subtitle TEXT,
    home_products_title TEXT,
    home_products_subtitle TEXT,
    home_booking_title TEXT,
    home_booking_subtitle TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    shipping_cost NUMERIC DEFAULT 50000,
    free_shipping_threshold NUMERIC DEFAULT 500000,
    section_services_enabled BOOLEAN DEFAULT true,
    section_portfolio_enabled BOOLEAN DEFAULT true,
    section_specialists_enabled BOOLEAN DEFAULT true,
    section_courses_enabled BOOLEAN DEFAULT true,
    section_shop_enabled BOOLEAN DEFAULT true,
    section_booking_enabled BOOLEAN DEFAULT true,
    visual_edit_enabled BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۲۲. Theme Settings (تنظیمات تم)
CREATE TABLE IF NOT EXISTS theme_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_color TEXT DEFAULT '15 60% 65%',
    secondary_color TEXT DEFAULT '350 40% 92%',
    accent_color TEXT DEFAULT '38 70% 55%',
    background_color TEXT DEFAULT '30 30% 98%',
    foreground_color TEXT DEFAULT '20 20% 15%',
    muted_color TEXT DEFAULT '35 30% 94%',
    card_color TEXT DEFAULT '30 25% 97%',
    border_color TEXT DEFAULT '30 20% 90%',
    font_family TEXT DEFAULT 'Vazirmatn',
    heading_font_family TEXT DEFAULT 'Vazirmatn',
    base_font_size TEXT DEFAULT '16px',
    heading_scale NUMERIC DEFAULT 1.25,
    border_radius TEXT DEFAULT '0.75rem',
    button_radius TEXT DEFAULT '0.5rem',
    card_shadow TEXT DEFAULT '0 1px 3px rgba(0,0,0,0.1)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۲۳. Site Content (محتوای سایت برای ویرایش بصری)
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text', -- text, image, html, json
    content_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- یکتایی
    CONSTRAINT unique_page_content UNIQUE(page_key, content_key)
);

-- ۲۴. Activity Log (لاگ فعالیت‌ها)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL, -- login, logout, create, update, delete, etc.
    entity_type TEXT, -- user, order, booking, etc.
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_activity_logs_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL
);

-- ۲۵. Coupons (کدهای تخفیف)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percent', -- percent, fixed
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC, -- حداکثر تخفیف برای درصدی
    usage_limit INTEGER, -- حداکثر تعداد استفاده
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT DEFAULT 'all', -- all, products, courses
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ۲۶. Coupon Usage (استفاده از کد تخفیف)
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL,
    user_id UUID NOT NULL,
    order_id UUID,
    discount_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- روابط
    CONSTRAINT fk_coupon_usage_coupon 
        FOREIGN KEY (coupon_id) 
        REFERENCES coupons(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_coupon_usage_user 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_coupon_usage_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE SET NULL
);

-- ===========================================
-- Indexes برای بهینه‌سازی
-- ===========================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Specialists
CREATE INDEX IF NOT EXISTS idx_specialists_active ON specialists(is_active);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_specialist_id ON bookings(specialist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_hot ON products(is_hot) WHERE is_hot = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);

-- Course Enrollments
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- Course Lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(course_id, order_index);

-- Lesson Progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_active ON portfolio(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- Site Content
CREATE INDEX IF NOT EXISTS idx_site_content_page_key ON site_content(page_key);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- ===========================================
-- Functions (توابع)
-- ===========================================

-- تابع آپدیت updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تابع بررسی نقش کاربر
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تابع ایجاد شماره سفارش
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                  lpad(nextval('order_number_seq')::TEXT, 4, '0');
    NEW.order_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence برای شماره سفارش
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- تابع آپدیت rating محصول
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    review_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT COALESCE(AVG(rating), 0), COUNT(*) 
        INTO avg_rating, review_count
        FROM reviews 
        WHERE product_id = OLD.product_id AND is_approved = true;
        
        UPDATE products 
        SET rating = avg_rating, reviews_count = review_count
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    ELSE
        SELECT COALESCE(AVG(rating), 0), COUNT(*) 
        INTO avg_rating, review_count
        FROM reviews 
        WHERE product_id = NEW.product_id AND is_approved = true;
        
        UPDATE products 
        SET rating = avg_rating, reviews_count = review_count
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- تابع آپدیت تعداد دانشجویان دوره
CREATE OR REPLACE FUNCTION update_course_students_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET students_count = (
            SELECT COUNT(*) FROM course_enrollments 
            WHERE course_id = OLD.course_id
        )
        WHERE id = OLD.course_id;
        RETURN OLD;
    ELSE
        UPDATE courses 
        SET students_count = (
            SELECT COUNT(*) FROM course_enrollments 
            WHERE course_id = NEW.course_id
        )
        WHERE id = NEW.course_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- تابع آپدیت progress دوره
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    new_progress INTEGER;
BEGIN
    -- تعداد کل درس‌ها
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons cl
    JOIN course_enrollments ce ON ce.course_id = cl.course_id
    WHERE ce.user_id = NEW.user_id 
    AND cl.course_id = (SELECT course_id FROM course_lessons WHERE id = NEW.lesson_id);
    
    -- تعداد درس‌های تکمیل شده
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    JOIN course_lessons cl ON cl.id = lp.lesson_id
    WHERE lp.user_id = NEW.user_id 
    AND lp.completed = true
    AND cl.course_id = (SELECT course_id FROM course_lessons WHERE id = NEW.lesson_id);
    
    -- محاسبه درصد
    IF total_lessons > 0 THEN
        new_progress := (completed_lessons * 100) / total_lessons;
    ELSE
        new_progress := 0;
    END IF;
    
    -- آپدیت enrollment
    UPDATE course_enrollments
    SET 
        progress_percent = new_progress,
        last_watched_lesson_id = NEW.lesson_id,
        last_watched_at = now(),
        completed_at = CASE WHEN new_progress = 100 THEN now() ELSE NULL END
    WHERE user_id = NEW.user_id
    AND course_id = (SELECT course_id FROM course_lessons WHERE id = NEW.lesson_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تابع کاهش موجودی محصول
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        stock = stock - NEW.quantity,
        sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تابع برگرداندن موجودی محصول (در صورت لغو سفارش)
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('cancelled') AND OLD.status NOT IN ('cancelled') THEN
        UPDATE products p
        SET 
            stock = stock + oi.quantity,
            sales_count = GREATEST(0, sales_count - oi.quantity)
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تابع آپدیت تعداد استفاده کوپن
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- Triggers
-- ===========================================

-- Triggers برای updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- Trigger شماره سفارش
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Trigger آپدیت rating محصول
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    WHEN (pg_trigger_depth() = 0)
    EXECUTE FUNCTION update_product_rating();

-- Trigger تعداد دانشجویان
DROP TRIGGER IF EXISTS update_course_students ON course_enrollments;
CREATE TRIGGER update_course_students
    AFTER INSERT OR DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_students_count();

-- Trigger پیشرفت دوره
DROP TRIGGER IF EXISTS update_enrollment_on_lesson_progress ON lesson_progress;
CREATE TRIGGER update_enrollment_on_lesson_progress
    AFTER INSERT OR UPDATE ON lesson_progress
    FOR EACH ROW
    WHEN (NEW.completed = true)
    EXECUTE FUNCTION update_enrollment_progress();

-- Trigger کاهش موجودی
DROP TRIGGER IF EXISTS decrease_stock_on_order_item ON order_items;
CREATE TRIGGER decrease_stock_on_order_item
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION decrease_product_stock();

-- Trigger برگرداندن موجودی
DROP TRIGGER IF EXISTS restore_stock_on_cancel ON orders;
CREATE TRIGGER restore_stock_on_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION restore_product_stock();

-- Trigger استفاده کوپن
DROP TRIGGER IF EXISTS update_coupon_usage ON coupon_usage;
CREATE TRIGGER update_coupon_usage
    AFTER INSERT ON coupon_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_usage_count();

-- ===========================================
-- داده‌های اولیه
-- ===========================================

-- Salon Settings پیش‌فرض
INSERT INTO salon_settings (salon_name) 
VALUES ('سالن زیبایی')
ON CONFLICT DO NOTHING;

-- Theme Settings پیش‌فرض
INSERT INTO theme_settings (id) 
VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- روش‌های ارسال پیش‌فرض
INSERT INTO shipping_methods (name, description, price, min_delivery_days, max_delivery_days) 
VALUES 
    ('ارسال عادی', 'ارسال با پست پیشتاز', 50000, 3, 5),
    ('ارسال سریع', 'ارسال با پیک', 100000, 1, 2),
    ('ارسال رایگان', 'برای سفارش‌های بالای ۵۰۰ هزار تومان', 0, 3, 7)
ON CONFLICT DO NOTHING;

-- دسته‌بندی‌های نمونه کار پیش‌فرض
INSERT INTO portfolio_categories (name, slug, color, icon) 
VALUES 
    ('آرایش عروس', 'bridal', '#e91e63', 'heart'),
    ('کوتاهی و رنگ مو', 'hair', '#9c27b0', 'scissors'),
    ('ناخن', 'nails', '#f44336', 'palette'),
    ('اکستنشن مژه', 'lashes', '#2196f3', 'eye')
ON CONFLICT DO NOTHING;

-- ===========================================
-- Views برای گزارش‌گیری
-- ===========================================

-- نمای سفارشات با جزئیات
CREATE OR REPLACE VIEW orders_detail AS
SELECT 
    o.*,
    p.full_name as customer_full_name,
    sm.name as shipping_method_name,
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
    (SELECT json_agg(json_build_object(
        'id', oi.id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.product_price,
        'total', oi.total
    )) FROM order_items oi WHERE oi.order_id = o.id) as items
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN shipping_methods sm ON o.shipping_method_id = sm.id;

-- نمای آمار داشبورد
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('month', now())) as orders_this_month,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= date_trunc('month', now()) AND status != 'cancelled') as revenue_this_month,
    (SELECT COUNT(*) FROM bookings WHERE created_at >= date_trunc('month', now())) as bookings_this_month,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= date_trunc('month', now())) as new_users_this_month,
    (SELECT COUNT(*) FROM course_enrollments WHERE created_at >= date_trunc('month', now())) as enrollments_this_month;

-- ===========================================
-- پایان Schema
-- ===========================================
