import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Search, Loader2, TrendingUp, CheckCircle, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnrollmentWithCourse {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  progress_percent: number;
  completed_at: string | null;
  course_title: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

export default function EnrollmentsOverview() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(title),
          profile:profiles(full_name, phone)
        `)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      
      const enrollmentData = (data || []).map(e => ({
        ...e,
        course_title: Array.isArray(e.course) ? e.course[0]?.title : e.course?.title || 'نامشخص',
        profile: Array.isArray(e.profile) ? e.profile[0] : e.profile,
      }));
      
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error('خطا در دریافت ثبت‌نام‌ها:', error);
      toast({ variant: "destructive", title: "خطا", description: "خطا در بارگذاری داده‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = (enrollments: EnrollmentWithCourse[]) => {
    return enrollments.filter((e) => {
      const studentName = e.profile?.full_name || '';
      const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) || 
                           e.course_title.toLowerCase().includes(search.toLowerCase());
      
      const isCompleted = e.completed_at !== null;
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'completed' ? isCompleted : 
                            filterStatus === 'in-progress' ? !isCompleted && e.progress_percent > 0 :
                            e.progress_percent === 0);
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredEnrollments = filterEnrollments(enrollments);

  // Calculate stats
  const stats = {
    total: enrollments.length,
    completed: enrollments.filter(e => e.completed_at !== null).length,
    in_progress: enrollments.filter(e => !e.completed_at && e.progress_percent > 0).length,
    not_started: enrollments.filter(e => e.progress_percent === 0).length,
    average_progress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
      : 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-8 h-8" />
          مدیریت تمام ثبت‌نام‌ها
        </h1>
        <p className="text-muted-foreground mt-1">
          کل ثبت‌نام‌ها: <strong>{enrollments.length}</strong> دانشجو
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground mb-1">کل ثبت‌نام‌ها</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground mb-1">تمام‌شده</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-muted-foreground mb-1">در حال انجام</p>
          <p className="text-3xl font-bold text-orange-600">{stats.in_progress}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-muted-foreground mb-1">شروع نکرده</p>
          <p className="text-3xl font-bold text-purple-600">{stats.not_started}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
          <p className="text-sm text-muted-foreground mb-1">میانگین پیشرفت</p>
          <p className="text-3xl font-bold text-pink-600">{stats.average_progress}%</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="space-y-4 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">فیلتر و جستجو</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="جستجو (نام، دوره)..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pr-10" 
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="completed">تمام‌شده</SelectItem>
              <SelectItem value="in-progress">در حال انجام</SelectItem>
              <SelectItem value="not-started">شروع نکرده</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">ثبت‌نام‌ای با این شرایط پیدا نشد</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-right p-4 font-semibold">نام دانشجو</th>
                <th className="text-right p-4 font-semibold">تلفن</th>
                <th className="text-right p-4 font-semibold">دوره</th>
                <th className="text-center p-4 font-semibold">پیشرفت</th>
                <th className="text-center p-4 font-semibold">وضعیت</th>
                <th className="text-right p-4 font-semibold">ثبت‌نام</th>
                <th className="text-center p-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => {
                const isCompleted = enrollment.completed_at !== null;
                return (
                  <tr key={enrollment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium">{enrollment.profile?.full_name || 'کاربر'}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {enrollment.profile?.phone ? (
                        <a href={`tel:${enrollment.profile.phone}`} className="hover:text-primary transition flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {enrollment.profile.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">
                      <Link to={`/admin/courses/${enrollment.course_id}/enrollments`} className="text-primary hover:underline">
                        {enrollment.course_title}
                      </Link>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium">{enrollment.progress_percent}%</span>
                    </td>
                    <td className="p-4 text-center">
                      {isCompleted ? (
                        <Badge className="bg-green-600 text-white gap-1">
                          <CheckCircle className="w-3 h-3" />
                          تمام
                        </Badge>
                      ) : enrollment.progress_percent > 0 ? (
                        <Badge className="bg-orange-600 text-white gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {enrollment.progress_percent}%
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-600 text-white gap-1">
                          <AlertCircle className="w-3 h-3" />
                          شروع نشده
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4 text-center">
                      <Link to={`/admin/courses/${enrollment.course_id}/enrollments`}>
                        <Button variant="outline" size="sm">مدیریت</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
