import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { coursesService, lessonsService, enrollmentsService } from "@/services/coursesService";

export default function SampleData() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const sampleCourses = [
    {
      title: "React و TypeScript برای مبتدیان",
      description: "یاد بگیرید چگونه با React و TypeScript جامع ابر بسازید. این دوره برای باگرمی بره مهم طراحی شده است.",
      price: 450000,
      original_price: 600000,
      duration_hours: 20,
      instructor_name: "مهدی ربانی",
      level: "مبتدی",
      course_type: "ویدیویی",
      is_active: true,
      is_new: true,
      image_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%2364748b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3EReact %26 TypeScript%3C/text%3E%3C/svg%3E",
      gallery_images: [],
    },
    {
      title: "Django برای وب اپلیکیشن‌های بزرگ",
      description: "یاد بگیرید چگونه اپلیکیشن‌های پرقدرت با Django بسازید. شامل databases، authentication، و deployment.",
      price: 550000,
      original_price: 700000,
      duration_hours: 25,
      instructor_name: "علی عتیقی",
      level: "متوسط",
      course_type: "ویدیویی",
      is_active: true,
      is_new: false,
      image_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23166534' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDjango%3C/text%3E%3C/svg%3E",
      gallery_images: [],
    },
    {
      title: "کار با AI و Machine Learning",
      description: "یاد بگیرید چگونه مدل‌های AI را انعظام دهید. TensorFlow، PyTorch، و Scikit-Learn.",
      price: 650000,
      original_price: 850000,
      duration_hours: 30,
      instructor_name: "ربابه هزاری",
      level: "پیشرفته",
      course_type: "ویدیویی",
      is_active: true,
      is_new: true,
      image_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%237c2d12' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3EAI %26 ML%3C/text%3E%3C/svg%3E",
      gallery_images: [],
    },
  ];

  const lessonsData = [
    {
      course_index: 0,
      lessons: [
        {
          title: "مقدمه React",
          description: "React را شناسایی کنیم و توپولوژی آن را یاد بگیریم",
          duration_minutes: 45,
          is_free: true,
          video_url: "https://example.com/video1",
        },
        {
          title: "Components و Props",
          description: "Componentها را طراحی کنیم و اطلاعات را با Props انتقال دهیم",
          duration_minutes: 60,
          is_free: false,
          video_url: "https://example.com/video2",
        },
        {
          title: "State و Hooks",
          description: "useState و useEffect یا بگیریم",
          duration_minutes: 50,
          is_free: false,
          video_url: "https://example.com/video3",
        },
      ],
    },
    {
      course_index: 1,
      lessons: [
        {
          title: "Django Setup و Configuration",
          description: "Django را تثبیت کنیم و پروژه را شروع کنیم",
          duration_minutes: 40,
          is_free: true,
          video_url: "https://example.com/video4",
        },
        {
          title: "Models و Databases",
          description: "Django ORM را یاد بگیریم",
          duration_minutes: 55,
          is_free: false,
          video_url: "https://example.com/video5",
        },
      ],
    },
  ];

  const enrollmentsSampleData = [
    { course_index: 0, student_name: "رامین مهرابی", student_email: "ramin@example.com", phone: "09121234567" },
    { course_index: 0, student_name: "زهرا علیزاده", student_email: "zahra@example.com", phone: "09129876543" },
    { course_index: 0, student_name: "علی رضایی", student_email: "ali@example.com", phone: null },
    { course_index: 1, student_name: "ربابه گلزاده", student_email: "rababe@example.com", phone: "09135551234" },
    { course_index: 1, student_name: "مریم سلطانی", student_email: "maryam@example.com", phone: "09147778888" },
    { course_index: 2, student_name: "محسن بهرامی", student_email: "mohsen@example.com", phone: null },
  ];

  const handleAddSampleData = async () => {
    setLoading(true);

    try {
      // Clear existing data
      localStorage.removeItem('saleh_courses');
      localStorage.removeItem('saleh_lessons');
      localStorage.removeItem('saleh_enrollments');

      // Add courses
      const courseIds: string[] = [];
      for (const courseData of sampleCourses) {
        const course = coursesService.addCourse(courseData);
        courseIds.push(course.id);
      }

      // Add lessons
      for (const lessonGroup of lessonsData) {
        const courseId = courseIds[lessonGroup.course_index];
        lessonGroup.lessons.forEach((lesson, index) => {
          lessonsService.addLesson({
            ...lesson,
            course_id: courseId,
            order_index: index,
          });
        });
      }

      // Add enrollments
      for (const enrollment of enrollmentsSampleData) {
        const courseId = courseIds[enrollment.course_index];
        enrollmentsService.enroll({
          course_id: courseId,
          student_name: enrollment.student_name,
          student_email: enrollment.student_email,
          phone: enrollment.phone,
        });

        // Add random progress
        const enrollments = enrollmentsService.getEnrollmentsByCourse(courseId);
        const lastEnrollment = enrollments[enrollments.length - 1];
        const randomProgress = Math.floor(Math.random() * 100);
        enrollmentsService.updateProgress(lastEnrollment.id, randomProgress);
      }

      toast({
        title: "موفق",
        description: `سه دوره، ۶ درس و ۶ ثبت‌نام اضافه شد`,
      });
      setCompleted(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/courses">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seed Sample Data</h1>
          <p className="text-muted-foreground mt-1">برای آزمایش دادههای نمونه اضافه کنید</p>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 space-y-6"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-bold">برنامه اضافه اطلاعات</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span><strong>3 دوره</strong> مختلف (مبتدی، متوسط، پیشرفته)</span>
            </li>
            <li className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span><strong>6 درس</strong> منطقی برای دوره‌ها</span>
            </li>
            <li className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span><strong>6 ثبت‌نام</strong> تصادفی برای دوره‌ها</span>
            </li>
            <li className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span>چند عكس ساده برای هر دوره</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>⚠️ نكته:</strong> این عملیات متصله به داده‌های قبلی را پالایش خواهد کرد!
          </p>
        </div>

        {completed ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-bold text-green-900 dark:text-green-100">تمام شد!</p>
              <p className="text-sm text-green-800 dark:text-green-200">بروید به <Link to="/admin/courses" className="underline font-bold">Courses</Link> و داده‌ها را مطالعه کنید</p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleAddSampleData}
            disabled={loading}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال اضافه...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                اضافه داده‌های نمونه
              </>
            )}
          </Button>
        )}
      </motion.div>
    </div>
  );
}