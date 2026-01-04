import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Lock,
  ChevronDown,
  ChevronUp,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(["all"]);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch lessons
  const { data: lessons } = useQuery({
    queryKey: ["course-lessons", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check enrollment
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  // Fetch lesson progress
  const { data: progressData } = useQuery({
    queryKey: ["lesson-progress", id, user?.id],
    queryFn: async () => {
      if (!user?.id || !lessons) return [];
      const lessonIds = lessons.map(l => l.id);
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!lessons,
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !id) throw new Error("Not authenticated");
      const { error } = await supabase.from("course_enrollments").insert({
        user_id: user.id,
        course_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "ثبت‌نام موفق!",
        description: "شما با موفقیت در این دوره ثبت‌نام کردید.",
      });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت‌نام پیش آمد.",
        variant: "destructive",
      });
    },
  });

  // Update lesson progress mutation
  const updateProgress = useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        }, {
          onConflict: "user_id,lesson_id"
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const isLessonAccessible = (lesson: any) => {
    return lesson.is_free || !!enrollment;
  };

  const isLessonCompleted = (lessonId: string) => {
    return progressData?.some(p => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = progressData?.filter(p => p.completed).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentLesson = lessons?.find(l => l.id === currentLessonId) || lessons?.[0];

  if (courseLoading) {
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
                  <video
                    key={currentLesson.id}
                    controls
                    className="w-full h-full"
                    poster={course.image_url || undefined}
                    onEnded={() => {
                      if (currentLesson) {
                        updateProgress.mutate({ lessonId: currentLesson.id, completed: true });
                      }
                    }}
                  >
                    <source src={currentLesson.video_url} type="video/mp4" />
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
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
                        variant={isLessonCompleted(currentLesson.id) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => updateProgress.mutate({ 
                          lessonId: currentLesson.id, 
                          completed: !isLessonCompleted(currentLesson.id) 
                        })}
                      >
                        {isLessonCompleted(currentLesson.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 ml-1" />
                            تکمیل شده
                          </>
                        ) : (
                          "علامت‌گذاری به عنوان تکمیل"
                        )}
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
                      {course.duration_hours} ساعت
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {course.students_count} دانشجو
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      {Number(course.rating).toFixed(1)}
                    </span>
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline">{course.course_type}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Lessons List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    سرفصل‌ها ({lessons?.length || 0} درس)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {lessons?.map((lesson, index) => (
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
                          isLessonCompleted(lesson.id) 
                            ? "bg-green-500 text-white" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isLessonAccessible(lesson) ? (
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
                          {lesson.duration_minutes} دقیقه
                        </span>
                      </button>
                    ))}
                    {(!lessons || lessons.length === 0) && (
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
              {/* Enroll Card */}
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
                          {formatPrice(Number(course.price))}
                        </span>
                        <span className="text-muted-foreground">تومان</span>
                      </div>
                      {course.original_price && (
                        <span className="text-muted-foreground line-through">
                          {formatPrice(Number(course.original_price))} تومان
                        </span>
                      )}
                    </div>

                    {/* Progress (if enrolled) */}
                    {enrollment && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">پیشرفت شما</span>
                          <span className="text-sm text-muted-foreground">
                            {completedCount} از {totalLessons}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {progressPercent}% تکمیل شده
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    {enrollment ? (
                      <Button className="w-full" size="lg" onClick={() => setCurrentLessonId(lessons?.[0]?.id || null)}>
                        <Play className="w-5 h-5 ml-2" />
                        ادامه یادگیری
                      </Button>
                    ) : user ? (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
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
                        <span className="font-medium">{course.instructor_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">تعداد دروس</span>
                        <span className="font-medium">{lessons?.length || 0} درس</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">مدت دوره</span>
                        <span className="font-medium">{course.duration_hours} ساعت</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">سطح</span>
                        <span className="font-medium">{course.level}</span>
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
