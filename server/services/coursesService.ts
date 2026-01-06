import { prisma } from '../db';
import { Course, CourseLessonItem, CourseEnrollment } from '@prisma/client';

export const coursesService = {
  // Courses
  async getAllCourses() {
    return prisma.course.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
  },

  async getCourse(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { lessons: true },
    });
  },

  async createCourse(data: any) {
    return prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        instructor_name: data.instructor_name,
        price: data.price,
        original_price: data.original_price,
        duration_hours: data.duration_hours,
        students_count: data.students_count || 0,
        rating: data.rating || 0,
        level: data.level || 'مبتدی',
        course_type: data.course_type || 'آنلاین',
        image_url: data.image_url,
        is_active: data.is_active !== false,
        is_new: data.is_new || false,
      },
    });
  },

  async updateCourse(id: string, data: any) {
    return prisma.course.update({
      where: { id },
      data,
    });
  },

  async deleteCourse(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  },

  // Lessons
  async getLessonsByCourse(courseId: string) {
    return prisma.courseLessonItem.findMany({
      where: { course_id: courseId },
      orderBy: { order_index: 'asc' },
    });
  },

  async getLesson(id: string) {
    return prisma.courseLessonItem.findUnique({
      where: { id },
    });
  },

  async createLesson(data: any) {
    return prisma.courseLessonItem.create({
      data: {
        course_id: data.course_id,
        title: data.title,
        description: data.description,
        video_url: data.video_url,
        duration_minutes: data.duration_minutes,
        order_index: data.order_index,
        is_free: data.is_free || false,
      },
    });
  },

  async updateLesson(id: string, data: any) {
    return prisma.courseLessonItem.update({
      where: { id },
      data,
    });
  },

  async deleteLesson(id: string) {
    return prisma.courseLessonItem.delete({
      where: { id },
    });
  },

  // Enrollments
  async enrollStudent(courseId: string, userId: string, email: string, studentName: string, phone?: string) {
    return prisma.courseEnrollment.create({
      data: {
        course_id: courseId,
        user_id: userId,
        email,
        student_name: studentName,
        phone,
        progress: 0,
      },
    });
  },

  async getEnrollmentsByStudent(userId: string) {
    return prisma.courseEnrollment.findMany({
      where: { user_id: userId },
      include: { course: true },
    });
  },

  async getEnrollmentsByCourse(courseId: string) {
    return prisma.courseEnrollment.findMany({
      where: { course_id: courseId },
    });
  },

  async getEnrollment(courseId: string, userId: string) {
    return prisma.courseEnrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        },
      },
    });
  },

  async updateProgress(enrollmentId: string, totalLessons: number, completedCount: number) {
    const progress = Math.round((completedCount / totalLessons) * 100);
    return prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: { progress },
    });
  },
};
