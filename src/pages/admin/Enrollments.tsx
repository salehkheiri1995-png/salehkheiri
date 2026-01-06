import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, User, BookOpen, FileSpreadsheet, MoreHorizontal, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [editEnrollment, setEditEnrollment] = useState<Enrollment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data: enrollmentsData, error } = await supabase
        .from("course_enrollments")
        .select(`*,courses(id, title, price)`)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

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
    } catch (error) {
      console.error("خطا در دریافت ثبت‌نام‌ها:", error);
      toast.error("خطا در دریافت ثبت‌نام‌ها");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.phone?.includes(search);
    const matchesPayment =
      paymentFilter === "all" || e.payment_status === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  const handleUpdateProgress = async (enrollmentId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ progress_percent: newProgress })
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("پیشرفت به‌روز رسانی شد");
      fetchEnrollments();
    } catch (error) {
      toast.error("خطا در به‌روز رسانی");
    }
  };

  const handleUpdatePaymentStatus = async (enrollmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ payment_status: status })
        .eq("id", enrollmentId);

      if (error) throw error;
      toast.success("وضعیت پرداخت به‌روز رسانی شد");
      fetchEnrollments();
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
        fetchEnrollments();
        setDeleteEnrollmentId(null);
      } catch (error) {
        toast.error("خطا در حذف");
      }
    }
  };

  const courseStats = enrollments.reduce(
    (acc, e) => {
      const courseId = e.courses?.id;
      if (courseId) {
        if (!acc[courseId]) {
          acc[courseId] = { title: e.courses?.title || "", count: 0, revenue: 0 };
        }
        acc[courseId].count += 1;
        acc[courseId].revenue += e.courses?.price || 0;
      }
      return acc;
    },
    {} as Record<string, { title: string; count: number; revenue: number }>
  );

  const handleExport = () => {
    const exportData = formatEnrollmentsForExport(filteredEnrollments);
    exportToExcel(exportData, `ثبت‌نام‌ها-${new Date().toLocaleDateString("fa-IR")}`, "ثبت‌نام‌ها");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            ثبت‌نام‌های دوره‌ها
          </h1>
          <p className="text-muted-foreground">
            {enrollments.length} ثبت‌نام ثبت شده
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            خروجی Excel
          </Button>
          <SendNotificationDialog />
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(courseStats)
          .slice(0, 4)
          .map(([id, stat]) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-sm truncate mb-3">{stat.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <User className="w-4 h-4" />
                  {stat.count} نفر
                </div>
                <div className="text-sm font-bold text-primary">
                  {formatPrice(stat.revenue)}
                </div>
              </div>
            </motion.div>
          ))}
      </div>

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
        <div className="text-center py-12 text-muted-foreground">در حال بارگذاری...</div>
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
                <TableHead className="text-right font-semibold">دوره</TableHead>
                <TableHead className="text-center font-semibold">وضعیت پرداخت</TableHead>
                <TableHead className="text-center font-semibold">پیشرفت</TableHead>
                <TableHead className="text-center font-semibold">تاریخ ثبت‌نام</TableHead>
                <TableHead className="text-center font-semibold">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <p className="text-lg font-medium">ثبت‌نامی یافت نشد</p>
                      <p className="text-sm">مگر فیلترهای خود را تغیير دهيد</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {enrollment.profiles?.full_name?.charAt(0) || "?"}
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">
                            {enrollment.courses?.title || "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(enrollment.courses?.price || 0)} تومان
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={PAYMENT_STATUS_COLORS[enrollment.payment_status || "pending"] || "secondary"}>
                        {PAYMENT_STATUS_LABELS[enrollment.payment_status || "pending"] || "نامشخص"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {enrollment.progress_percent || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress_percent || 0} className="h-2" />
                        {enrollment.completed_at && (
                          <Badge variant="outline" className="mt-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تکميل شده
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(enrollment.enrolled_at), {
                          addSuffix: true,
                          locale: faIR,
                        })}
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
                          <DropdownMenuItem>
                            <Clock className="ml-2 h-4 w-4" />
                            <span>وضعیت پرداخت</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem
                            onClick={() => handleUpdatePaymentStatus(enrollment.id, "completed")}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle className="ml-2 h-4 w-4" />
                            <span>تایيد پرداخت</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePaymentStatus(enrollment.id, "pending")}
                            className="text-yellow-600 focus:text-yellow-600"
                          >
                            <Clock className="ml-2 h-4 w-4" />
                            <span>در انتظار</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteEnrollmentId(enrollment.id)}
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
            <span className="font-medium">{Math.min(endIndex, filteredEnrollments.length)}</span> از{" "}
            <span className="font-medium">{filteredEnrollments.length}</span> ثبت‌نام
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
                  variant={currentPage === pageNumber ? "default" : "outline"}
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
            <AlertDialogTitle>آيا مطمئن هستيد؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              اين عمليات قابل بازگشت نيست. اين ثبت‌نام به طور دائم حذف خواهد شد.
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
    </div>
  );
}