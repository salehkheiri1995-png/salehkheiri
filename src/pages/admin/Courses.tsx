import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Loader2, Clock, Users, BookOpen, LayoutGrid, List, FileSpreadsheet, Zap, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  price: number;
  original_price: number | null;
  duration_hours: number | null;
  instructor_name: string | null;
  level: string | null;
  course_type: string | null;
  students_count: number | null;
  is_active: boolean;
  is_new: boolean;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    gallery_images: [] as string[],
    price: 0,
    original_price: 0,
    duration_hours: 0,
    instructor_name: "",
    level: "مبتدی",
    course_type: "ویدیویی",
    is_active: true,
    is_new: false,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("خطا در دریافت دوره‌ها:", error);
      toast({ variant: "destructive", title: "خطا", description: "خطا در بارگذاری دوره‌ها" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const submitData = {
      ...formData,
      original_price: formData.original_price || null,
    };

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(submitData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "موفق", description: "دوره ویرایش شد" });
      } else {
        const { error } = await supabase.from("courses").insert([submitData]);
        if (error) throw error;
        toast({ title: "موفق", description: "دوره اضافه شد" });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      image_url: course.image_url || "",
      gallery_images: course.gallery_images || [],
      price: course.price,
      original_price: course.original_price || 0,
      duration_hours: course.duration_hours || 0,
      instructor_name: course.instructor_name || "",
      level: course.level || "مبتدی",
      course_type: course.course_type || "ویدیویی",
      is_active: course.is_active,
      is_new: course.is_new || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "موفق", description: "دوره حذف شد" });
      fetchCourses();
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      gallery_images: [],
      price: 0,
      original_price: 0,
      duration_hours: 0,
      instructor_name: "",
      level: "مبتدی",
      course_type: "ویدیویی",
      is_active: true,
      is_new: false,
    });
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11" onClick={() => { setEditingCourse(null); resetForm(); }}>
              <Plus className="w-4 h-4" />
              افزودن دوره
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "ویرایش دوره" : "افزودن دوره جدید"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>تصاویر دوره</Label>
                <MultiImageUpload
                  featuredImage={formData.image_url}
                  galleryImages={formData.gallery_images}
                  onFeaturedChange={(url) => setFormData({ ...formData, image_url: url })}
                  onGalleryChange={(urls) => setFormData({ ...formData, gallery_images: urls })}
                  folder="courses"
                />
              </div>
              <div className="space-y-2">
                <Label>عنوان دوره</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مدرس</Label>
                  <Input
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>مدت (ساعت)</Label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>قیمت</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>قیمت اصلی</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>سطح</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مبتدی">مبتدی</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="پیشرفته">پیشرفته</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع دوره</Label>
                  <Select value={formData.course_type} onValueChange={(v) => setFormData({ ...formData, course_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ویدیویی">ویدیویی</SelectItem>
                      <SelectItem value="حضوری">حضوری</SelectItem>
                      <SelectItem value="ترکیبی">ترکیبی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>فعال</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_new} onCheckedChange={(c) => setFormData({ ...formData, is_new: c })} />
                  <Label>جدید</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ذخیره"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
            <Input placeholder="جستجو بر اساس نام یا مدرس..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
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
              <SelectItem value="newest">جدیدترين</SelectItem>
              <SelectItem value="price-asc">قیمت بالاتر</SelectItem>
              <SelectItem value="price-desc">قیمت لوانطر</SelectItem>
              <SelectItem value="popular">مکمل وابسته‌شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                      <DropdownMenuItem onClick={() => handleEdit(course)} className="gap-2">
                        <Pencil className="w-4 h-4" />
                        ویرایش
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/courses/${course.id}/lessons`} className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          مدیریت دروس
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
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.course_type}</Badge>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">{formatPrice(course.price)}</span>
                    <span className="text-xs text-muted-foreground ml-1">تومان</span>
                    {course.original_price && course.original_price > course.price && (
                      <>
                        <span className="text-xs text-muted-foreground line-through mr-2">{formatPrice(course.original_price)}</span>
                        <Badge variant="destructive" className="ml-2">
                          {Math.round(((course.original_price - course.price) / course.original_price) * 100)}%
                        </Badge>
                      </>
                    )}
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
                  <td className="p-4 text-center">
                    <Badge variant="outline">{course.level}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary">{course.course_type}</Badge>
                  </td>
                  <td className="p-4 text-center font-bold text-primary">{formatPrice(course.price)}</td>
                  <td className="p-4 text-center">{course.students_count || 0}</td>
                  <td className="p-4 text-center">
                    <Badge variant={course.is_active ? "default" : "destructive"}>
                      {course.is_active ? "✅ فعال" : "❌ غیرفعال"}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          ...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(course)} className="gap-2">
                          <Pencil className="w-4 h-4" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/courses/${course.id}/lessons`} className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            دروس
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteConfirmId(course.id)} className="text-red-600 gap-2">
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آيا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              اين دوره به طور رايگان حذف خواهد شد. اين عمليات قابل بازگشت نیست.
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