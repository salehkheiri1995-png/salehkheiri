import { Router } from 'express';
import { coursesService } from '../services/coursesService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await coursesService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await coursesService.getCourse(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    const course = await coursesService.createCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    const course = await coursesService.updateCourse(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    await coursesService.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Lessons
// Get lessons by course
router.get('/:courseId/lessons', async (req, res) => {
  try {
    const lessons = await coursesService.getLessonsByCourse(req.params.courseId);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Create lesson
router.post('/:courseId/lessons', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    const lesson = await coursesService.createLesson({
      ...req.body,
      course_id: req.params.courseId,
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/:courseId/lessons/:lessonId', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    const lesson = await coursesService.updateLesson(req.params.lessonId, req.body);
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/:courseId/lessons/:lessonId', authMiddleware, async (req, res) => {
  try {
    // TODO: Check if user is admin
    await coursesService.deleteLesson(req.params.lessonId);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Enrollments
// Enroll student
router.post('/:courseId/enroll', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, email, studentName, phone } = req.body;
    
    const enrollment = await coursesService.enrollStudent(
      courseId,
      userId,
      email,
      studentName,
      phone
    );
    res.status(201).json(enrollment);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Get student enrollments
router.get('/student/:userId/enrollments', async (req, res) => {
  try {
    const enrollments = await coursesService.getEnrollmentsByStudent(req.params.userId);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Get course enrollments
router.get('/:courseId/enrollments', async (req, res) => {
  try {
    const enrollments = await coursesService.getEnrollmentsByCourse(req.params.courseId);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

export default router;
