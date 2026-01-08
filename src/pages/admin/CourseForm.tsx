import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  Upload,
  Eye,
  Save,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  title: string;
  description: string;
  image_url: string;
  gallery_images: string[];
  price: number;
  original_price: number;
  duration_hours: number;
  instructor_name: string;
  level: string;
  course_type: string;
  is_active: boolean;
  is_new: boolean;
}

export default function CourseForm() {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
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

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "خطا",
          description: "دوره پیدا نشد",
        });
        navigate("/admin/courses");
        return;
      }

      setCourse(data);
      setFormData({
        title: data.title,
        description: data.description || "",
        image_url: data.image_url || "",
        gallery_images: data.gallery_images || [],
        price: data.price || 0,
        original_price: data.original_price || 0,
        duration_hours: data.duration_hours || 0,
        instructor_name: data.instructor_name || "",
        level: data.level || "مبتدی",
        course_type: data.course_type || "ویدیویی",
        is_active: data.is_active,
        is_new: data.is_new || false,
      });
    } catch (error) {
      console.error("خطا:", error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در بارگذاری دوره",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیح الزامی است";
    }

    if (!formData.image_url) {
      newErrors.image_url = "تسویر دوره الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isGallery: boolean = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "خطا",
            description: `${file.name} بیش از 5MB است`,
          });
          continue;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `courses/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            variant: "destructive",
            title: "خطا",
            description: "خطا در آپلود عکس",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        if (isGallery) {
          if (formData.gallery_images.length < 10) {
            setFormData((prev) => ({
              ...prev,
              gallery_images: [...prev.gallery_images, publicUrl],
            }));
            toast({
              title: "موفق",
              description: "عكس گالری اضافه شد",
            });
          } else {
            toast({
              variant: "destructive",
              title: "هشدار",
              description: "حداکثر 10 عكس",
            });
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            image_url: publicUrl,
          }));
          toast({
            title: "موفق",
            description: "عكس اصلی اضافه شد",
          });
        }
      }
    } catch (error) {
      console.error("خطا:", error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در آپلود عکس",
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "لطفا خطاهای فرم را درست کنید",
      });
      return;
    }

    setSaving(true);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        gallery_images: formData.gallery_images,
        price: formData.price,
        original_price: formData.original_price || null,
        duration_hours: formData.duration_hours,
        instructor_name: formData.instructor_name,
        level: formData.level,
        course_type: formData.course_type,
        is_active: formData.is_active,
        is_new: formData.is_new,
      };

      if (courseId) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);
        
        if (error) throw error;
        toast({ title: "موفق", description: "دوره با موفقیت ویرایش شد" });
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);
        
        if (error) throw error;
        toast({ title: "موفق", description: "دوره با موفقیت اضافه شد" });
      }

      navigate("/admin/courses");
    } catch (error: any) {
      console.error("خطا:", error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const discountPercent = formData.original_price
    ? Math.round(
        ((formData.original_price - formData.price) /
          formData.original_price) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/courses">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {courseId ? "ویرایش دوره" : "افزودن دوره جدید"}
            </h1>
            {courseId && course && (
              <p className="text-muted-foreground mt-1">{course.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="images">🎨 تصاویر</TabsTrigger>
            <TabsTrigger value="basic">ℹ️ اطلاعات</TabsTrigger>
            <TabsTrigger value="details">📚 جزئیات</TabsTrigger>
            <TabsTrigger value="pricing">💰 قیمت</TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:flex">
              ⚙️
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              {/* Featured Image */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">🎨 عكس اصلی</Label>
                <p className="text-sm text-muted-foreground">
                  حداکثر 5MB | فرمت‌ها: JPG, PNG, WebP
                </p>

                {formData.image_url ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.image_url}
                      alt="Featured"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <label>
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          تغیير
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                    <span className="text-sm font-medium">كلك كنيد يا فايل را بكشيد</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                )}

                {errors.image_url && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image_url}
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    🎶 گالری
                  </Label>
                  <Badge variant="secondary">
                    {formData.gallery_images.length} / 10
                  </Badge>
                </div>

                {formData.gallery_images.length < 10 && (
                  <label className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm">+ افزودن عکس‌ها</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                )}

                {formData.gallery_images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {formData.gallery_images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeGalleryImage(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs rounded px-2 py-1">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              {/* Title */}
              <div className="space-y-2">
                <Label>🎯 عنوان</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="عنوان دوره..."
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>📝 توضیح</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  placeholder="توضیح دوره..."
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Instructor */}
              <div className="space-y-2">
                <Label>👨‍🏫 مدرس</Label>
                <Input
                  value={formData.instructor_name}
                  onChange={(e) =>
                    setFormData({...formData, instructor_name: e.target.value})
                  }
                  placeholder="نام مدرس..."
                />
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>📊 سطح</Label>
                <Select value={formData.level} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مبتدی">🟢 مبتدی</SelectItem>
                    <SelectItem value="متوسط">🟡 متوسط</SelectItem>
                    <SelectItem value="پیشرفته">🔴 پیشرفته</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label>⏱️ مدت (ساعت)</Label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) =>
                      setFormData({...formData, duration_hours: Number(e.target.value)})
                    }
                    min="0"
                  />
                </div>

                {/* Course Type */}
                <div className="space-y-2">
                  <Label>🎬 نوع</Label>
                  <Select value={formData.course_type} onValueChange={(val) => setFormData({ ...formData, course_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ویدیویی">🎥 ویدیویی</SelectItem>
                      <SelectItem value="حضوری">👥 حضوری</SelectItem>
                      <SelectItem value="ترکیبی">🔄 ترکیبی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <Label>💰 قیمت</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    min="0"
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-2">
                  <Label>🏷️ قیمت اصلی</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({...formData, original_price: Number(e.target.value)})
                    }
                    min="0"
                  />
                </div>
              </div>

              {/* Discount Display */}
              {discountPercent > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Badge variant="destructive" className="text-lg">
                    -{discountPercent}%
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">- {discountPercent}% تخفیف</p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-4"
            >
              {/* Is Active */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <Label>✅ فعال</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, is_active: val })
                  }
                />
              </div>

              {/* Is New */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <Label>🆕 جدید</Label>
                <Switch
                  checked={formData.is_new}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, is_new: val })
                  }
                />
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4 rounded-t-lg">
          <Link to="/admin/courses">
            <Button type="button" variant="outline">
              انصراف
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </div>
  );
}
