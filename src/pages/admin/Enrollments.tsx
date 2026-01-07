import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowRight, Loader2, Mail, Phone, TrendingUp, CheckCircle, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { coursesService, enrollmentsService, Enrollment } from "@/services/coursesService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
}

export default function AdminEnrollments() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0, not_started: 0, average_progress: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_name: "",
    student_email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchEnrollments();
    }
  }, [courseId]);

  const fetchCourse = () => {
    try {
      const data = coursesService.getCourse(courseId!);
      if (data) {
        setCourse({ id: data.id, title: data.title });
      }
    } catch (error) {
      console.error('خطا:', error);
    }
  };

  const fetchEnrollments = () => {
    try {
      setLoading(true);
      const data = enrollmentsService.getEnrollmentsByCourse(courseId!);
      setEnrollments(data);
      const courseStats = enrollmentsService.getCourseStats(courseId!);
      setStats({
        total: courseStats.total_enrollments,
        completed: courseStats.completed,
        in_progress: courseStats.in_progress,
        not_started: courseStats.not_started,
        average_progress: courseStats.average_progress,
      });
    } catch (error) {
      console.error('خطا:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.student_name.trim() || !formData.student_email.trim()) {
        toast({
          variant: "destructive",
          title: "خطا",
          description: "نام و ایمیل الزامی است",
        });
        setSaving(false);
        return;
      }

      enrollmentsService.enroll({
        course_id: courseId!,
        student_name: formData.student_name,
        student_email: formData.student_email,
        phone: formData.phone || null,
      });

      toast({
        title: "موفق",
        description: "دانشجو تبدیل شد",
      });

      setIsDialogOpen(false);
      setFormData({ student_name: "", student_email: "", phone: "" });
      fetchEnrollments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      enrollmentsService.deleteEnrollment(id);
      toast({
        title: "موفق",
        description: "ثبت‌نام حذف شد",
      });
      fetchEnrollments();
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message,
      });
    }
  };

  const updateProgress = (enrollmentId: string, progress: number) => {
    try {
      enrollmentsService.updateProgress(enrollmentId, progress);
      toast({
        title: "موفق",
        description: "پیشرفت به‌روزرسانی شد",
      });
      fetchEnrollments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link to={`/admin/courses`}>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8" />
            مدیریت ثبت‌نام‌ها
          </h1>
          <p className="text-muted-foreground mt-1">
            {course?.title || "در حال بارگذاری..."}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              اضافه ثبت‌نام
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ثبت‌نام جدید</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>نام دانشجو</Label>
                <Input
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="نام و نام خانوادگی..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>ایمیل</Label>
                <Input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>تلفن (اختیاری)</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09121234567"
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ثبت‌نام"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground mb-1">کل ثبت‌نام‌ها</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground mb-1">تمام شده</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-muted-foreground mb-1">در حال انجام</p>
          <p className="text-3xl font-bold text-orange-600">{stats.in_progress}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-muted-foreground mb-1">بی احراز</p>
          <p className="text-3xl font-bold text-purple-600">{stats.not_started}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
          <p className="text-sm text-muted-foreground mb-1">میانگین پیشرفت</p>
          <p className="text-3xl font-bold text-pink-600">{stats.average_progress}%</p>
        </motion.div>
      </div>

      {/* Enrollments Table/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">هنوز ثبت‌نامی نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 space-y-3"
            >
              {/* Student Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{enrollment.student_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <a href={`mailto:${enrollment.student_email}`} className="flex items-center gap-1 hover:text-primary transition">
                      <Mail className="w-4 h-4" />
                      {enrollment.student_email}
                    </a>
                    {enrollment.phone && (
                      <a href={`tel:${enrollment.phone}`} className="flex items-center gap-1 hover:text-primary transition">
                        <Phone className="w-4 h-4" />
                        {enrollment.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {enrollment.is_completed ? (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      تمام شده
                    </Badge>
                  ) : enrollment.progress > 0 ? (
                    <Badge className="bg-orange-600 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {enrollment.progress}%
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600 text-white">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      بی احراز
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">پیشرفت</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  ثبت‌نام: {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}
                  {enrollment.completion_date && ` • تاریخ پایان: ${new Date(enrollment.completion_date).toLocaleDateString('fa-IR')}`}
                </div>
                <div className="flex items-center gap-2">
                  {!enrollment.is_completed && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProgress(enrollment.id, Math.min(enrollment.progress + 25, 100))}
                      >
                        +25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProgress(enrollment.id, 100)}
                      >
                        100%
                      </Button>
                    </>
                  )}
                  <AlertDialog open={deleteConfirmId === enrollment.id} onOpenChange={() => setDeleteConfirmId(null)}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(enrollment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>آيا مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          اين ثبت‌نام حذف خواهند شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(enrollment.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}