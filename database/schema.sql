-- ===========================================
-- سالن زیبایی - Schema دیتابیس
-- نسخه: 1.0
-- ===========================================

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('user', 'admin');

-- ===========================================
-- جداول اصلی
-- ===========================================

-- Profiles (کاربران)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (نقش‌های کاربری)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Services (خدمات)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 60,
    gallery_images TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Specialists (متخصصین)
CREATE TABLE IF NOT EXISTS specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    avatar_url TEXT,
    instagram_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings (رزروها)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    specialist_id UUID REFERENCES specialists(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products (محصولات)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    image_url TEXT,
    category TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    stock INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_hot BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping Methods (روش‌های ارسال)
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders (سفارشات)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    shipping_cost NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items (آیتم‌های سفارش)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses (دوره‌ها)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    instructor_name TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    duration_hours INTEGER DEFAULT 0,
    level TEXT DEFAULT 'مبتدی',
    course_type TEXT DEFAULT 'ویدیویی',
    students_count INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course Lessons (درس‌های دوره)
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course Enrollments (ثبت‌نام دوره‌ها)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    progress_percent INTEGER DEFAULT 0,
    last_watched_lesson_id UUID,
    completed_at TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Lesson Progress (پیشرفت درس‌ها)
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Portfolio (نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    category TEXT,
    order_index INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio Categories (دسته‌بندی نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews (نظرات محصولات/خدمات)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio Reviews (نظرات نمونه کارها)
CREATE TABLE IF NOT EXISTS portfolio_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolio(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications (اعلان‌ها)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salon Settings (تنظیمات سالن)
CREATE TABLE IF NOT EXISTS salon_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_name TEXT NOT NULL DEFAULT 'سالن زیبایی',
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    instagram_url TEXT,
    telegram_url TEXT,
    whatsapp TEXT,
    working_hours TEXT,
    about_text TEXT,
    hero_badge_text TEXT,
    hero_title TEXT,
    hero_highlight TEXT,
    hero_description TEXT,
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
    shipping_cost NUMERIC DEFAULT 50000,
    free_shipping_threshold NUMERIC DEFAULT 500000,
    section_services_enabled BOOLEAN DEFAULT true,
    section_portfolio_enabled BOOLEAN DEFAULT true,
    section_specialists_enabled BOOLEAN DEFAULT true,
    section_courses_enabled BOOLEAN DEFAULT true,
    section_shop_enabled BOOLEAN DEFAULT true,
    section_booking_enabled BOOLEAN DEFAULT true,
    visual_edit_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Theme Settings (تنظیمات تم)
CREATE TABLE IF NOT EXISTS theme_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_color TEXT DEFAULT '15 60% 65%',
    secondary_color TEXT DEFAULT '350 40% 92%',
    accent_color TEXT DEFAULT '38 70% 55%',
    background_color TEXT DEFAULT '30 30% 98%',
    foreground_color TEXT DEFAULT '20 20% 15%',
    muted_color TEXT DEFAULT '35 30% 94%',
    card_color TEXT DEFAULT '30 25% 97%',
    font_family TEXT DEFAULT 'Vazirmatn',
    heading_font_family TEXT DEFAULT 'Vazirmatn',
    base_font_size TEXT DEFAULT '16px',
    heading_scale NUMERIC DEFAULT 1.25,
    border_radius TEXT DEFAULT '0.75rem',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site Content (محتوای سایت برای ویرایش بصری)
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text',
    content_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(page_key, content_key)
);

-- ===========================================
-- Indexes برای بهینه‌سازی
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_specialist_id ON bookings(specialist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_site_content_page_key ON site_content(page_key);

-- ===========================================
-- Triggers برای updated_at
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
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

-- یک روش ارسال پیش‌فرض
INSERT INTO shipping_methods (name, description, price) 
VALUES ('ارسال عادی', 'ارسال با پست', 50000)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Helper Function برای بررسی نقش
-- ===========================================

CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- پایان Schema
-- ===========================================
