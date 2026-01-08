import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Loader2, Clock, Users, BookOpen, LayoutGrid, List, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  course_type: string | null;
  students_count: number;
  is_active: boolean;
  is_new: boolean | null;
  created_at: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      
      // Fetch real enrollment counts
      const { data: enrollmentCounts, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('course_id');
      
      if (enrollmentError) throw enrollmentError;
      
      // Count enrollments per course
      const countMap: Record<string, number> = {};
      (enrollmentCounts || []).forEach(e => {
        countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
      });
      
      // Merge with courses
      const coursesWithRealCount = (coursesData || []).map(course => ({
        ...course,
        students_count: countMap[course.id] || 0
      }));
      
      setCourses(coursesWithRealCount);
    } catch (error) {
      console.error('خطا در دریافت دوره‌ها:', error);
      toast({ variant: "destructive", title: "خطا", description: "خطا در بارگذاری دوره‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const syncStudentCounts = async () => {
    try {
      setSyncing(true);
      
      // Get real counts from enrollments
      const { data: enrollmentCounts, error } = await supabase
        .from('course_enrollments')
        .select('course_id');
      
      if (error) throw error;
      
      // Count enrollments per course
      const countMap: Record<string, number> = {};
      (enrollmentCounts || []).forEach(e => {
        countMap[e.course_id] = (countMap[e.course_id] || 0) + 1;
      });
      
      // Update each course's students_count in database
      for (const course of courses) {
        const realCount = countMap[course.id] || 0;
        await supabase
          .from('courses')
          .update({ students_count: realCount })
          .eq('id', course.id);
      }
      
      toast({ title: "موفق", description: "تعداد دانشجویان همگام‌سازی شد" });
      fetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "موفق", description: "دوره حذف شد" });
      fetchCourses();
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const filterCourses = (courses: Course[]) => {
    return courses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor_name?.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
      const matchesType = typeFilter === 'all' || c.course_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.is_active : !c.is_active);
      return matchesSearch && matchesLevel && matchesType && matchesStatus;
    });
  };

  const sortCourses = (courses: Course[]) => {
    const sorted = [...courses];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
      default:
        return sorted;
    }
  };

  const filteredCourses = sortCourses(filterCourses(courses));

  const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

  // Calculate stats
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.is_active).length,
    inactive: courses.filter(c => !c.is_active).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.students_count || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * (c.students_count || 0)), 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            مدیریت دوره‌ها
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredCourses.length} دوره از {courses.length} نمایش داده می‌شود
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={syncStudentCounts} disabled={syncing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            همگام‌سازی آمار
          </Button>
          <Button asChild>
            <Link to="/admin/courses/new" className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن دوره
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground mb-1">کل دوره‌ها</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-muted-foreground mb-1">دوره‌های فعال</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-muted-foreground mb-1">کل دانشجویان</p>
          <p className="text-3xl font-bold text-purple-600">{formatPrice(stats.totalStudents)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-muted-foreground mb-1">کل درآمد</p>
          <p className="text-2xl font-bold text-orange-600">{formatPrice(stats.totalRevenue / 1000000)}M</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-muted-foreground mb-1">غیرفعال</p>
          <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="space-y-4 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">فیلتر و جستجو</h2>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="جستجو بر اساس نام..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="سطح" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="مبتدی">مبتدی</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="پیشرفته">پیشرفته</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="نوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="ویدیویی">ویدیویی</SelectItem>
              <SelectItem value="حضوری">حضوری</SelectItem>
              <SelectItem value="ترکیبی">ترکیبی</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">مرتب:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="price-asc">قیمت کمتر</SelectItem>
              <SelectItem value="price-desc">قیمت بیشتر</SelectItem>
              <SelectItem value="popular">محبوب‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">دوره‌ای با این فیلتر پیدا نشد</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group"
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                {course.is_new && <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">🆕 جدید</Badge>}
                {course.is_active && <Badge className="absolute top-3 left-3 bg-green-500 text-white">✅ فعال</Badge>}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg line-clamp-2 flex-1">{course.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <span className="text-xl">...</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/courses/${course.id}/edit`} className="gap-2">
                          <Pencil className="w-4 h-4" />
                          ویرایش
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/courses/${course.id}/lessons`} className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          دروس
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/courses/${course.id}/enrollments`} className="gap-2">
                          <Users className="w-4 h-4" />
                          ثبت‌نام‌ها
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteConfirmId(course.id)} className="text-red-600 gap-2">
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-muted-foreground text-sm mb-3 font-medium">👨‍🏫 {course.instructor_name || "-"}</p>
                <div className="space-y-2 mb-3 pb-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground"><Clock className="w-3 h-3 inline mr-1" />مدت</span>
                    <span className="font-medium">{course.duration_hours || 0} ساعت</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground"><Users className="w-3 h-3 inline mr-1" />دانشجو</span>
                    <span className="font-medium">{course.students_count || 0} نفر</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <Badge variant="outline">{course.level || 'مبتدی'}</Badge>
                  <Badge variant="secondary">{course.course_type || 'ویدیویی'}</Badge>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">{formatPrice(course.price)}</span>
                    <span className="text-xs text-muted-foreground ml-1">تومان</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-right p-4 font-semibold">نام</th>
                <th className="text-right p-4 font-semibold">مدرس</th>
                <th className="text-center p-4 font-semibold">سطح</th>
                <th className="text-center p-4 font-semibold">نوع</th>
                <th className="text-center p-4 font-semibold">قیمت</th>
                <th className="text-center p-4 font-semibold">دانشجو</th>
                <th className="text-center p-4 font-semibold">وضعیت</th>
                <th className="text-center p-4 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {course.image_url ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 m-auto" />}
                      </div>
                      <span className="font-medium line-clamp-1">{course.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{course.instructor_name || "-"}</td>
                  <td className="p-4 text-center"><Badge variant="outline">{course.level || 'مبتدی'}</Badge></td>
                  <td className="p-4 text-center"><Badge variant="secondary">{course.course_type || 'ویدیویی'}</Badge></td>
                  <td className="p-4 text-center font-medium">{formatPrice(course.price)}</td>
                  <td className="p-4 text-center">{course.students_count || 0}</td>
                  <td className="p-4 text-center">
                    <Badge className={course.is_active ? "bg-green-500" : "bg-gray-500"}>{course.is_active ? "فعال" : "غیرفعال"}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/admin/courses/${course.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(course.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این دوره و تمام دروس و ثبت‌نام‌های مرتبط حذف خواهند شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}