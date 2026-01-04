import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowRight, GripVertical, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

interface Course {
  id: string;
  title: string;
}

export default function AdminLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: 0,
    is_free: false,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", courseId)
      .single();
    
    if (!error && data) {
      setCourse(data);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update({
            title: formData.title,
            description: formData.description || null,
            video_url: formData.video_url || null,
            duration_minutes: formData.duration_minutes,
            is_free: formData.is_free,
          })
          .eq("id", editingLesson.id);

        if (error) throw error;
        toast({ title: "موفق", description: "درس ویرایش شد" });
      } else {
        const nextIndex = lessons.length > 0 
          ? Math.max(...lessons.map(l => l.order_index)) + 1 
          : 0;

        const { error } = await supabase.from("course_lessons").insert([{
          course_id: courseId,
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
          duration_minutes: formData.duration_minutes,
          is_free: formData.is_free,
          order_index: nextIndex,
        }]);

        if (error) throw error;
        toast({ title: "موفق", description: "درس اضافه شد" });
      }

      setIsDialogOpen(false);
      setEditingLesson(null);
      resetForm();
      fetchLessons();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes,
      is_free: lesson.is_free,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این درس مطمئن هستید؟")) return;

    try {
      const { error } = await supabase.from("course_lessons").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "موفق", description: "درس حذف شد" });
      fetchLessons();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      duration_minutes: 0,
      is_free: false,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/courses">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">مدیریت دروس</h1>
          <p className="text-muted-foreground mt-1">
            {course?.title || "در حال بارگذاری..."}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setEditingLesson(null); resetForm(); }}>
              <Plus className="w-4 h-4" />
              افزودن درس
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "ویرایش درس" : "افزودن درس جدید"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان درس</Label>
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
              <div className="space-y-2">
                <Label>آدرس ویدیو</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>مدت (دقیقه)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_free} 
                  onCheckedChange={(c) => setFormData({ ...formData, is_free: c })} 
                />
                <Label>رایگان (برای پیش‌نمایش)</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ذخیره"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Play className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">هنوز درسی اضافه نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 bg-card rounded-xl border border-border p-4"
            >
              <div className="text-muted-foreground">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold truncate">{lesson.title}</h3>
                  {lesson.is_free && <Badge variant="secondary">رایگان</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {lesson.duration_minutes} دقیقه
                  {lesson.video_url && " • دارای ویدیو"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
