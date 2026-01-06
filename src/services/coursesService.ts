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
  students_count: number;
  is_active: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_email: string;
  student_name: string;
  phone: string | null;
  enrolled_at: string;
  progress: number; // 0-100
  completion_date: string | null;
  is_completed: boolean;
}

const COURSES_KEY = 'saleh_courses';
const LESSONS_KEY = 'saleh_lessons';
const ENROLLMENTS_KEY = 'saleh_enrollments';

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
  addCourse: (course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'students_count'>): Course => {
    const courses = coursesService.getAllCourses();
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      students_count: 0,
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
    
    // تعداد دانشجویان را از enrollment ها می‌خوانیم
    const studentCount = enrollmentsService.getEnrollmentsByCourse(id).length;
    
    courses[index] = {
      ...courses[index],
      ...updates,
      id: courses[index].id,
      created_at: courses[index].created_at,
      students_count: studentCount, // آپدیت اتومات
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return courses[index];
  },

  // حذف دوره
  deleteCourse: (id: string): boolean => {
    const courses = coursesService.getAllCourses();
    const filtered = courses.filter(c => c.id !== id);
    
    if (filtered.length === courses.length) return false;
    
    // حذف تمام درس‌های این دوره
    lessonsService.deleteLessonsByCourse(id);
    
    // حذف تمام ثبت‌نام‌های این دوره
    enrollmentsService.deleteEnrollmentsByCourse(id);
    
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
    return true;
  },

  // به‌روزرسانی تعداد دانشجویان
  updateStudentCount: (courseId: string): void => {
    const courses = coursesService.getAllCourses();
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const count = enrollmentsService.getEnrollmentsByCourse(courseId).length;
      course.students_count = count;
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    }
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
      id: lessons[index].id,
    };
    
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    return lessons[index];
  },

  // حذف درس
  deleteLesson: (id: string): boolean => {
    const lessons = lessonsService.getAllLessons();
    const filtered = lessons.filter(l => l.id !== id);
    
    if (filtered.length === lessons.length) return false;
    
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

// ==================== ENROLLMENTS ====================

export const enrollmentsService = {
  // دریافت تمام ثبت‌نام‌ها
  getAllEnrollments: (): Enrollment[] => {
    try {
      const data = localStorage.getItem(ENROLLMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('خطا در دریافت ثبت‌نام‌ها:', error);
      return [];
    }
  },

  // دریافت ثبت‌نام‌های یک دوره
  getEnrollmentsByCourse: (courseId: string): Enrollment[] => {
    const enrollments = enrollmentsService.getAllEnrollments();
    return enrollments.filter(e => e.course_id === courseId);
  },

  // دریافت ثبت‌نام‌های یک دانشجو
  getEnrollmentsByStudent: (studentEmail: string): Enrollment[] => {
    const enrollments = enrollmentsService.getAllEnrollments();
    return enrollments.filter(e => e.student_email === studentEmail);
  },

  // دریافت یک ثبت‌نام
  getEnrollment: (id: string): Enrollment | null => {
    const enrollments = enrollmentsService.getAllEnrollments();
    return enrollments.find(e => e.id === id) || null;
  },

  // بررسی اگر دانشجو در دوره ثبت‌نام شده است
  isEnrolled: (courseId: string, studentEmail: string): boolean => {
    const enrollments = enrollmentsService.getAllEnrollments();
    return enrollments.some(e => e.course_id === courseId && e.student_email === studentEmail);
  },

  // ثبت‌نام جدید
  enroll: (enrollment: Omit<Enrollment, 'id' | 'enrolled_at' | 'progress' | 'completion_date' | 'is_completed'>): Enrollment => {
    // بررسی اگر قبلاً ثبت‌نام شده
    if (enrollmentsService.isEnrolled(enrollment.course_id, enrollment.student_email)) {
      throw new Error('دانشجو قبلاً در این دوره ثبت‌نام شده است');
    }

    const enrollments = enrollmentsService.getAllEnrollments();
    const newEnrollment: Enrollment = {
      ...enrollment,
      id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      enrolled_at: new Date().toISOString(),
      progress: 0,
      completion_date: null,
      is_completed: false,
    };
    enrollments.push(newEnrollment);
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));

    // به‌روزرسانی تعداد دانشجویان
    coursesService.updateStudentCount(enrollment.course_id);

    return newEnrollment;
  },

  // ویرایش ثبت‌نام
  updateEnrollment: (id: string, updates: Partial<Enrollment>): Enrollment | null => {
    const enrollments = enrollmentsService.getAllEnrollments();
    const index = enrollments.findIndex(e => e.id === id);
    
    if (index === -1) return null;

    const oldEnrollment = enrollments[index];
    
    enrollments[index] = {
      ...enrollments[index],
      ...updates,
      id: enrollments[index].id,
      enrolled_at: enrollments[index].enrolled_at,
    };
    
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    return enrollments[index];
  },

  // حذف ثبت‌نام
  deleteEnrollment: (id: string): boolean => {
    const enrollments = enrollmentsService.getAllEnrollments();
    const enrollment = enrollments.find(e => e.id === id);
    
    if (!enrollment) return false;
    
    const filtered = enrollments.filter(e => e.id !== id);
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(filtered));

    // به‌روزرسانی تعداد دانشجویان
    coursesService.updateStudentCount(enrollment.course_id);

    return true;
  },

  // حذف تمام ثبت‌نام‌های یک دوره
  deleteEnrollmentsByCourse: (courseId: string): void => {
    const enrollments = enrollmentsService.getAllEnrollments();
    const filtered = enrollments.filter(e => e.course_id !== courseId);
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(filtered));
  },

  // به‌روزرسانی پیشرفت
  updateProgress: (id: string, progress: number): Enrollment | null => {
    const updates: Partial<Enrollment> = { progress };
    
    // اگر پیشرفت 100% شود
    if (progress >= 100) {
      updates.progress = 100;
      updates.is_completed = true;
      updates.completion_date = new Date().toISOString();
    }
    
    return enrollmentsService.updateEnrollment(id, updates);
  },

  // دریافت آمار دوره
  getCourseStats: (courseId: string) => {
    const enrollments = enrollmentsService.getEnrollmentsByCourse(courseId);
    return {
      total_enrollments: enrollments.length,
      completed: enrollments.filter(e => e.is_completed).length,
      in_progress: enrollments.filter(e => !e.is_completed && e.progress > 0).length,
      not_started: enrollments.filter(e => e.progress === 0).length,
      average_progress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0,
    };
  },
};