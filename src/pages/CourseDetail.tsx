import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Lock,
  BookOpen
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  duration_hours: number | null;
  instructor_name: string | null;
  level: string | null;
  students_count: number | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean | null;
  course_id: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number | null;
  enrolled_at: string;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCourseData();
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // دریافت دوره
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // دریافت دروس
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      
      if (lessonsData && lessonsData.length > 0) {
        setCurrentLessonId(lessonsData[0].id);
      }

      // بررسی ثبت‌نام
      if (user?.id) {
        const { data: enrollmentData } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('course_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setEnrollment(enrollmentData);
      }
    } catch (error) {
      console.error('خطا در دریافت اطلاعات دوره:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user?.id || !id) {
      toast({
        title: "خطا",
        description: "ابتدا وارد شوید",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: id,
          user_id: user.id,
          progress_percent: 0,
        })
        .select()
        .single();

      if (error) throw error;
      
      setEnrollment(data);
      toast({
        title: "ثبت‌نام موفق!",
        description: "شما با موفقیت در این دوره ثبت‌نام کردید.",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "مشکلی در ثبت‌نام پیش آمد.",
        variant: "destructive",
      });
    }
  };

  const handleLessonProgress = async (lessonId: string, completed: boolean) => {
    if (!enrollment) return;
    
    try {
      const newProgress = completed ? 100 : 0;
      const { error } = await supabase
        .from('course_enrollments')
        .update({ progress_percent: newProgress })
        .eq('id', enrollment.id);

      if (error) throw error;
      
      setEnrollment({ ...enrollment, progress_percent: newProgress });
      
      toast({
        title: "موفق",
        description: completed ? "درس علامت‌گذاری شد" : "علامت‌گذاری لغو شد",
      });
    } catch (error) {
      console.error('خطا:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const isLessonAccessible = (lesson: Lesson) => {
    return lesson.is_free || !!enrollment;
  };

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="aspect-video w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-video bg-charcoal rounded-2xl overflow-hidden"
              >
                {currentLesson?.video_url && isLessonAccessible(currentLesson) ? (
                  <VideoPlayer
                    key={currentLesson.id}
                    videoUrl={currentLesson.video_url}
                    poster={course.image_url || undefined}
                    onEnded={() => {
                      if (currentLesson && enrollment) {
                        handleLessonProgress(currentLesson.id, true);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <img
                      src={course.image_url || "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop"}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    {!enrollment ? (
                      <>
                        <Lock className="w-16 h-16 mb-4 relative z-10" />
                        <p className="text-lg relative z-10">برای مشاهده ویدیو ابتدا ثبت‌نام کنید</p>
                      </>
                    ) : (
                      <>
                        <Play className="w-16 h-16 mb-4 relative z-10" />
                        <p className="text-lg relative z-10">یک درس را انتخاب کنید</p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Current Lesson Info */}
              {currentLesson && enrollment && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{currentLesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{currentLesson.description}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLessonProgress(currentLesson.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 ml-1" />
                        تكمیل شده
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {course.duration_hours || 0} ساعت
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {course.students_count || 0} دانشجو
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      4.5
                    </span>
                    <Badge variant="secondary">{course.level || 'مبتدی'}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Lessons List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    سرفصل‌ها ({lessons.length} درس)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (isLessonAccessible(lesson)) {
                            setCurrentLessonId(lesson.id);
                          } else if (!user) {
                            toast({
                              title: "ابتدا وارد شوید",
                              description: "برای مشاهده دروس ابتدا وارد حساب کاربری شوید.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 text-right transition-colors",
                          currentLessonId === lesson.id ? "bg-primary/5" : "hover:bg-muted/50",
                          !isLessonAccessible(lesson) && "opacity-60"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          "bg-muted text-muted-foreground"
                        )}>
                          {isLessonAccessible(lesson) ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              درس {index + 1}
                            </span>
                            {lesson.is_free && <Badge variant="secondary" className="text-xs">رایگان</Badge>}
                          </div>
                          <h4 className="font-medium truncate">{lesson.title}</h4>
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration_minutes || 0} دقیقه
                        </span>
                      </button>
                    ))}
                    {lessons.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        هنوز درسی اضافه نشده است
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                        <span className="text-muted-foreground">تومان</span>
                      </div>
                      {course.original_price && course.original_price > course.price && (
                        <span className="text-muted-foreground line-through">
                          {formatPrice(course.original_price)} تومان
                        </span>
                      )}
                    </div>

                    {/* Progress (if enrolled) */}
                    {enrollment && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">پیشرفت شما</span>
                          <span className="text-sm text-muted-foreground">
                            {enrollment.progress_percent || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress_percent || 0} className="h-2" />
                      </div>
                    )}

                    {/* Action Button */}
                    {enrollment ? (
                      <Button className="w-full" size="lg" onClick={() => setCurrentLessonId(lessons[0]?.id || null)}>
                        <Play className="w-5 h-5 ml-2" />
                        ادامه یادگیری
                      </Button>
                    ) : user ? (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleEnroll}
                      >
                        ثبت‌نام در دوره
                      </Button>
                    ) : (
                      <Button asChild className="w-full" size="lg">
                        <Link to="/auth">ورود برای ثبت‌نام</Link>
                      </Button>
                    )}

                    {/* Course Info */}
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">مدرس</span>
                        <span className="font-medium">{course.instructor_name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تعداد دروس</span>
                        <span className="font-medium">{lessons.length} درس</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">مدت دوره</span>
                        <span className="font-medium">{course.duration_hours || 0} ساعت</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">سطح</span>
                        <span className="font-medium">{course.level || 'مبتدی'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}