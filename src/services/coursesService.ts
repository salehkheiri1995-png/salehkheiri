// Courses Service - LocalStorage Based
// مثل Portfolio، از localStorage استفاده می‌کند

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  course_id: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  gallery_images: string[];
  price: number;
  original_price: number | null;
  duration_hours: number | null;
  instructor_name: string | null;
  level: string | null;
  course_type: string | null;
  students_count: number | null;
  is_active: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

const COURSES_KEY = 'saleh_courses';
const LESSONS_KEY = 'saleh_lessons';

// ==================== COURSES ====================

export const coursesService = {
  // دریافت تمام دوره‌ها
  getAllCourses: (): Course[] => {
    try {
      const data = localStorage.getItem(COURSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('خطا در دریافت دوره‌ها:', error);
      return [];
    }
  },

  // دریافت یک دوره
  getCourse: (id: string): Course | null => {
    const courses = coursesService.getAllCourses();
    return courses.find(c => c.id === id) || null;
  },

  // اضافه کردن دوره جدید
  addCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Course => {
    const courses = coursesService.getAllCourses();
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    courses.push(newCourse);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return newCourse;
  },

  // ویرایش دوره
  updateCourse: (id: string, updates: Partial<Course>): Course | null => {
    const courses = coursesService.getAllCourses();
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    courses[index] = {
      ...courses[index],
      ...updates,
      id: courses[index].id, // id نباید تغییر کند
      created_at: courses[index].created_at, // created_at نباید تغییر کند
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return courses[index];
  },

  // حذف دوره
  deleteCourse: (id: string): boolean => {
    const courses = coursesService.getAllCourses();
    const filtered = courses.filter(c => c.id !== id);
    
    if (filtered.length === courses.length) return false; // پیدا نشد
    
    // حذف تمام درس‌های این دوره
    lessonsService.deleteLessonsByCourse(id);
    
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
    return true;
  },
};

// ==================== LESSONS ====================

export const lessonsService = {
  // دریافت تمام درس‌ها
  getAllLessons: (): Lesson[] => {
    try {
      const data = localStorage.getItem(LESSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('خطا در دریافت درس‌ها:', error);
      return [];
    }
  },

  // دریافت درس‌های یک دوره
  getLessonsByCourse: (courseId: string): Lesson[] => {
    const lessons = lessonsService.getAllLessons();
    return lessons
      .filter(l => l.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  // دریافت یک درس
  getLesson: (id: string): Lesson | null => {
    const lessons = lessonsService.getAllLessons();
    return lessons.find(l => l.id === id) || null;
  },

  // اضافه کردن درس جدید
  addLesson: (lesson: Omit<Lesson, 'id'>): Lesson => {
    const lessons = lessonsService.getAllLessons();
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    lessons.push(newLesson);
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    return newLesson;
  },

  // ویرایش درس
  updateLesson: (id: string, updates: Partial<Lesson>): Lesson | null => {
    const lessons = lessonsService.getAllLessons();
    const index = lessons.findIndex(l => l.id === id);
    
    if (index === -1) return null;
    
    lessons[index] = {
      ...lessons[index],
      ...updates,
      id: lessons[index].id, // id نباید تغییر کند
    };
    
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    return lessons[index];
  },

  // حذف درس
  deleteLesson: (id: string): boolean => {
    const lessons = lessonsService.getAllLessons();
    const filtered = lessons.filter(l => l.id !== id);
    
    if (filtered.length === lessons.length) return false; // پیدا نشد
    
    localStorage.setItem(LESSONS_KEY, JSON.stringify(filtered));
    return true;
  },

  // حذف تمام درس‌های یک دوره
  deleteLessonsByCourse: (courseId: string): void => {
    const lessons = lessonsService.getAllLessons();
    const filtered = lessons.filter(l => l.course_id !== courseId);
    localStorage.setItem(LESSONS_KEY, JSON.stringify(filtered));
  },

  // بازسازی ترتیب درس‌ها
  reorderLessons: (courseId: string, lessonsIds: string[]): void => {
    const lessons = lessonsService.getAllLessons();
    lessonsIds.forEach((id, index) => {
      const lesson = lessons.find(l => l.id === id && l.course_id === courseId);
      if (lesson) {
        lesson.order_index = index;
      }
    });
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  },
};