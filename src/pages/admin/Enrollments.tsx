import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, User, BookOpen, FileSpreadsheet, MoreHorizontal, Edit, Trash2, CheckCircle, Clock, TrendingUp, Users, DollarSign, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { exportToExcel, formatEnrollmentsForExport } from "@/lib/excelExport";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";

interface Enrollment {
  id: string;
  user_id: string;
  enrolled_at: string;
  progress_percent: number | null;
  payment_status: string | null;
  completed_at: string | null;
  courses: { id: string; title: string; price: number } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}

interface Course {
  id: string;
  title: string;
  price: number;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  completed: "پرداخت شده",
  pending: "در انتظار پرداخت",
  failed: "ناموفق",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEnrollmentsAndCourses();
  }, []);

  const fetchEnrollmentsAndCourses = async () => {
    try {
      // Fetch enrollments
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from("course_enrollments")
        .select(`*,courses(id, title, price)`)
        .order("enrolled_at", { ascending: false });

      if (enrollError) throw enrollError;

      // Fetch all courses
      const { data: coursesData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, price")
        .order("title", { ascending: true });

      if (courseError) throw courseError;

      // Fetch profiles for enrollments
      const enrollmentsWithProfiles = await Promise.all(
        (enrollmentsData || []).map(async (enrollment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", enrollment.user_id)
            .maybeSingle();
          return { ...enrollment, profiles: profile };
        })
      );

      setEnrollments(enrollmentsWithProfiles);
      setCourses(coursesData || []);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.phone?.includes(search);
    const matchesPayment =
      paymentFilter === "all" || e.payment_status === paymentFilter;
    const matchesCourse =
      selectedCourse === null || e.courses?.id === selectedCourse;
    return matchesSearch && matchesPayment && matchesCourse;
  });

  // Calculate course statistics
  const calculateCourseStats = (courseId: string) => {
    const courseEnrollments = enrollments.filter(
      (e) => e.courses?.id === courseId
    );
    const totalEnrollments = courseEnrollments.length;
    const completedCount = courseEnrollments.filter(
      (e) => e.completed_at
    ).length;
    const avgProgress = courseEnrollments.length > 0
      ? Math.round(
          courseEnrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) /
            courseEnrollments.length
        )
      : 0;
    const totalRevenue = courseEnrollments.reduce(
      (sum, e) => sum + (e.courses?.price || 0),
      0
    );

    return {
      totalEnrollments,
      completedCount,
      avgProgress,
      totalRevenue,
    };
  };

  // Get selected course info
  const selectedCourseInfo = selectedCourse
    ? courses.find((c) => c.id === selectedCourse)
    : null;

  // Get stats for selected course
  const selectedCourseStats = selectedCourse
    ? calculateCourseStats(selectedCourse)
    : null;

  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  const handleUpdatePaymentStatus = async (
    enrollmentId: string,
    status: string
  ) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ payment_status: status })
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("وضعیت پرداخت به‌روز رسانی شد");
      fetchEnrollmentsAndCourses();
    } catch (error) {
      toast.error("خطا در به‌روز رسانی");
    }
  };

  const handleDeleteEnrollment = async () => {
    if (deleteEnrollmentId) {
      try {
        const { error } = await supabase
          .from("course_enrollments")
          .delete()
          .eq("id", deleteEnrollmentId);

        if (error) throw error;
        toast.success("ثبت‌نام حذف شد");
        fetchEnrollmentsAndCourses();
        setDeleteEnrollmentId(null);
      } catch (error) {
        toast.error("خطا در حذف");
      }
    }
  };

  const handleExport = () => {
    const exportData = formatEnrollmentsForExport(filteredEnrollments);
    exportToExcel(
      exportData,
      `ثبت‌نام‌ها-${new Date().toLocaleDateString("fa-IR")}`,
      "ثبت‌نام‌ها"
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Course Selection Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 flex-shrink-0"
      >
        <div className="sticky top-20 space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              دوره‌ها
            </h2>

            {/* All Courses Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCourse(null);
                setCurrentPage(1);
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all mb-3 text-right ${
                selectedCourse === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 bg-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">تمام دوره‌ها</span>
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {enrollments.length}
                </Badge>
              </div>
            </motion.button>

            {/* Course List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {courses.map((course) => {
                const stats = calculateCourseStats(course.id);
                const isSelected = selectedCourse === course.id;

                return (
                  <motion.button
                    key={course.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCourse(course.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-right hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold truncate ${
                            isSelected ? "text-primary" : ""
                          }`}>
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPrice(course.price)} تومان
                          </p>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {stats.totalEnrollments}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="pt-2 space-y-1 border-t border-border/50">
                        {/* Completion Rate */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            ✓ {stats.completedCount} تکمیل
                          </span>
                          <span className="font-medium text-green-600">
                            {stats.totalEnrollments > 0
                              ? Math.round(
                                  (stats.completedCount /
                                    stats.totalEnrollments) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>

                        {/* Average Progress */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            پیشرفت میانگین
                          </span>
                          <span className="font-medium text-blue-600">
                            {stats.avgProgress}%
                          </span>
                        </div>

                        {/* Revenue */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">درآمد</span>
                          <span className="font-medium text-primary">
                            {formatPrice(stats.totalRevenue)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <Progress
                        value={stats.avgProgress}
                        className="h-1.5 mt-2"
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-w-0 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8" />
              {selectedCourseInfo
                ? `دانشجویان دوره: ${selectedCourseInfo.title}`
                : "ثبت‌نام‌های دوره‌ها"}
            </h1>
            <p className="text-muted-foreground">
              {filteredEnrollments.length} ثبت‌نام ثبت شده
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              خروجی Excel
            </Button>
            <SendNotificationDialog />
          </div>
        </div>

        {/* Course Stats Cards - Show only when course selected */}
        {selectedCourse && selectedCourseStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Enrollments */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    کل ثبت‌نام‌ها
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedCourseStats.totalEnrollments}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    تکمیل‌کنندگان
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedCourseStats.completedCount}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            {/* Average Progress */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    پیشرفت میانگین
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedCourseStats.avgProgress}%
                  </p>
                </div>
                <Percent className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    کل درآمد
                  </p>
                  <p className="text-xl font-bold text-amber-600">
                    {formatPrice(selectedCourseStats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="جستجوی نام دوره یا کاربر..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="وضعیت پرداخت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="completed">پرداخت شده</SelectItem>
              <SelectItem value="pending">در انتظار</SelectItem>
              <SelectItem value="failed">ناموفق</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            در حال بارگذاری...
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-right font-semibold">کاربر</TableHead>
                  {!selectedCourse && (
                    <TableHead className="text-right font-semibold">
                      دوره
                    </TableHead>
                  )}
                  <TableHead className="text-center font-semibold">
                    وضعیت پرداخت
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    پیشرفت
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    تاریخ ثبت‌نام
                  </TableHead>
                  <TableHead className="text-center font-semibold">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={selectedCourse ? 5 : 6}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <p className="text-lg font-medium">ثبت‌نامی یافت نشد</p>
                        <p className="text-sm">
                          مگر فیلترهای خود را تغییر دهید
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {enrollment.profiles?.full_name?.charAt(0) ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {enrollment.profiles?.full_name || "بدون نام"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.profiles?.phone || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      {!selectedCourse && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <div>
                              <p className="font-medium">
                                {enrollment.courses?.title || "-"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(enrollment.courses?.price || 0)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge
                          className={
                            PAYMENT_STATUS_COLORS[
                              enrollment.payment_status || "pending"
                            ] || "secondary"
                          }
                        >
                          {
                            PAYMENT_STATUS_LABELS[
                              enrollment.payment_status || "pending"
                            ] || "نامشخص"
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {enrollment.progress_percent || 0}%
                            </span>
                          </div>
                          <Progress
                            value={enrollment.progress_percent || 0}
                            className="h-2"
                          />
                          {enrollment.completed_at && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs text-green-600 dark:text-green-400"
                            >
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تکمیل شده
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(enrollment.enrolled_at),
                            {
                              addSuffix: true,
                              locale: faIR,
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdatePaymentStatus(
                                  enrollment.id,
                                  "completed"
                                )
                              }
                              className="text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="ml-2 h-4 w-4" />
                              <span>تایید پرداخت</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdatePaymentStatus(
                                  enrollment.id,
                                  "pending"
                                )
                              }
                              className="text-yellow-600 focus:text-yellow-600"
                            >
                              <Clock className="ml-2 h-4 w-4" />
                              <span>در انتظار</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteEnrollmentId(enrollment.id)
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              <span>حذف</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              نمایش <span className="font-medium">{startIndex + 1}</span> تا{" "}
              <span className="font-medium">
                {Math.min(endIndex, filteredEnrollments.length)}
              </span>{" "}
              از <span className="font-medium">{filteredEnrollments.length}</span>
              ثبت‌نام
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9"
              >
                قبلی
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={
                      currentPage === pageNumber ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="h-9 w-9"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="h-9"
              >
                بعدی
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog
          open={deleteEnrollmentId !== null}
          onOpenChange={() => setDeleteEnrollmentId(null)}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                این عملیات قابل بازگشت نیست. این ثبت‌نام به طور دائم حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEnrollment}
                className="bg-red-600 hover:bg-red-700"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}