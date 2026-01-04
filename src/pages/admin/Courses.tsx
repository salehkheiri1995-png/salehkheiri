import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Loader2, Clock, Users, BookOpen } from "lucide-react";
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
import { ImageUpload } from "@/components/admin/ImageUpload";

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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
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
      console.error("Error fetching courses:", error);
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
    if (!confirm("آیا از حذف این دوره مطمئن هستید؟")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "موفق", description: "دوره حذف شد" });
      fetchCourses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
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

  const filteredCourses = courses.filter(
    (c) => c.title.includes(search) || c.instructor_name?.includes(search)
  );

  const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مدیریت دوره‌ها</h1>
          <p className="text-muted-foreground mt-1">{courses.length} دوره</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setEditingCourse(null); resetForm(); }}>
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
                <Label>تصویر دوره</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
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

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-11" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-card"
            >
              <div className="aspect-video bg-muted relative">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">بدون تصویر</div>
                )}
                {course.is_new && (
                  <span className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs">جدید</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">مدرس: {course.instructor_name}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration_hours} ساعت
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary">{formatPrice(course.price)} تومان</span>
                    {course.original_price && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        {formatPrice(course.original_price)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button asChild variant="ghost" size="icon" title="مدیریت دروس">
                      <Link to={`/admin/courses/${course.id}/lessons`}>
                        <BookOpen className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
