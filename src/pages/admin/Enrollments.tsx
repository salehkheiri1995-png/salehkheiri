import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, User, BookOpen, FileSpreadsheet } from "lucide-react";
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

const PAYMENT_STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "پرداخت شده", variant: "default" },
  pending: { label: "در انتظار پرداخت", variant: "secondary" },
  failed: { label: "ناموفق", variant: "destructive" },
};

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data: enrollmentsData, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses(id, title, price)
        `)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each enrollment
      const enrollmentsWithProfiles = await Promise.all(
        (enrollmentsData || []).map(async (enrollment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", enrollment.user_id)
            .maybeSingle();

          return {
            ...enrollment,
            profiles: profile,
          };
        })
      );

      setEnrollments(enrollmentsWithProfiles);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("خطا در دریافت ثبت‌نام‌ها");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.courses?.title?.includes(search) ||
      e.profiles?.full_name?.includes(search) ||
      e.profiles?.phone?.includes(search)
  );

  // Group by course for stats
  const courseStats = enrollments.reduce((acc, e) => {
    const courseId = e.courses?.id;
    if (courseId) {
      if (!acc[courseId]) {
        acc[courseId] = {
          title: e.courses?.title || "",
          count: 0,
          revenue: 0,
        };
      }
      acc[courseId].count += 1;
      acc[courseId].revenue += e.courses?.price || 0;
    }
    return acc;
  }, {} as Record<string, { title: string; count: number; revenue: number }>);

  const handleExport = () => {
    const exportData = formatEnrollmentsForExport(filteredEnrollments);
    exportToExcel(exportData, `ثبت‌نام‌ها-${new Date().toLocaleDateString('fa-IR')}`, 'ثبت‌نام‌ها');
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            ثبت‌نام‌های دوره‌ها
          </h1>
          <p className="text-muted-foreground mt-1">
            {enrollments.length} ثبت‌نام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            خروجی Excel
          </Button>
          <SendNotificationDialog />
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(courseStats).slice(0, 4).map(([id, stat]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <h3 className="font-medium text-sm truncate mb-2">{stat.title}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <User className="w-4 h-4" />
                {stat.count} نفر
              </div>
              <div className="text-sm font-bold text-primary">
                {formatPrice(stat.revenue)} تومان
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="جستجوی نام دوره یا کاربر..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">در حال بارگذاری...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>دوره</TableHead>
                <TableHead>وضعیت پرداخت</TableHead>
                <TableHead>پیشرفت</TableHead>
                <TableHead>تاریخ ثبت‌نام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    ثبت‌نامی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
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
                        <span className="font-medium">
                          {enrollment.courses?.title || "-"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(enrollment.courses?.price || 0)} تومان
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          PAYMENT_STATUS_LABELS[enrollment.payment_status || "pending"]?.variant || "secondary"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[enrollment.payment_status || "pending"]?.label || "نامشخص"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {enrollment.progress_percent || 0}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress_percent || 0} className="h-2" />
                      </div>
                      {enrollment.completed_at && (
                        <Badge variant="outline" className="mt-1 text-xs text-green-600">
                          تکمیل شده
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(enrollment.enrolled_at), {
                          addSuffix: true,
                          locale: faIR,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
