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
  X,
  Check,
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

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(courseId ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

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
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;
      setCourse(data);
      setFormData({
        title: data.title,
        description: data.description || "",
        image_url: data.image_url || "",
        gallery_images: data.gallery_images || [],
        price: data.price,
        original_price: data.original_price || 0,
        duration_hours: data.duration_hours || 0,
        instructor_name: data.instructor_name || "",
        level: data.level || "مبتدی",
        course_type: data.course_type || "ویدیویی",
        is_active: data.is_active,
        is_new: data.is_new || false,
      });
    } catch (error) {
      console.error("خطا در دریافت دوره:", error);
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
    } else if (formData.title.length > 100) {
      newErrors.title = "عنوان نباید بیشتر از 100 کاراکتر باشد";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیح الزامی است";
    } else if (formData.description.length < 20) {
      newErrors.description = "توضیح باید حداقل 20 کاراکتر باشد";
    }

    if (!formData.image_url) {
      newErrors.image_url = "تسویر دوره الزامی است";
    }

    if (formData.price < 0) {
      newErrors.price = "قیمت نباید منفی باشد";
    }

    if (formData.original_price && formData.original_price < formData.price) {
      newErrors.original_price = "قیمت اصلی باید بیشتر و برابر قیمت فعلی باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file: File, isGallery: boolean = false): Promise<string> => {
    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("فایل بیش از 5MB است");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("فلط عکس مجاز است");
      }

      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = isGallery
        ? `gallery-${timestamp}-${randomId}.webp`
        : `featured-${timestamp}.webp`;

      const folder = courseId ? courseId : "temp";
      const filePath = `courses/${folder}/${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from("course-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("خطا Supabase:", error);
        throw new Error(`خطا آپلود: ${error.message}`);
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("course-images")
        .getPublicUrl(data.path);

      console.log("عكس با موفقیت آپلود شد:", publicData.publicUrl);

      return publicData.publicUrl;
    } catch (error: any) {
      console.error("خطا در آپلود:", error);
      throw error;
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isGallery: boolean = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${Date.now()}-${i}`;
        
        // Add to uploading list
        setUploadingFiles((prev) => [...prev, fileId]);

        try {
          // Upload image
          const url = await uploadImage(file, isGallery);

          // Add to form
          if (isGallery) {
            setFormData((prev) => ({
              ...prev,
              gallery_images: [...prev.gallery_images, url],
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              image_url: url,
            }));
          }

          toast({
            title: "موفق",
            description: `${isGallery ? "عكس گالری" : "عكس"} با موفقیت آپلود شد`,
          });
        } catch (error: any) {
          console.error(`خطا فایل ${file.name}:`, error);
          toast({
            variant: "destructive",
            title: "خطا آپلود",
            description: error.message || `خطا در آپلود ${file.name}`,
          });
        } finally {
          // Remove from uploading list
          setUploadingFiles((prev) => prev.filter((id) => id !== fileId));
        }
      }
    } catch (error) {
      console.error("خطا کلی:", error);
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

    const submitData = {
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      gallery_images: formData.gallery_images,
      price: formData.price,
      original_price: formData.original_price || null,
      duration_hours: formData.duration_hours || null,
      instructor_name: formData.instructor_name,
      level: formData.level,
      course_type: formData.course_type,
      is_active: formData.is_active,
      is_new: formData.is_new,
    };

    try {
      if (courseId) {
        const { error } = await supabase
          .from("courses")
          .update(submitData)
          .eq("id", courseId);

        if (error) throw error;
        toast({ title: "موفق", description: "دوره با موفقیت ویرایش شد" });
      } else {
        const { error } = await supabase.from("courses").insert([submitData]);
        if (error) throw error;
        toast({ title: "موفق", description: "دوره با موفقیت اضافه شد" });
      }

      navigate("/admin/courses");
    } catch (error: any) {
      console.error("خطا در ذخیره:", error);
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
                <Label className="text-base font-semibold">🎨 عكس اصلی دوره</Label>
                <p className="text-sm text-muted-foreground">
                  حداکثر ابعاد: 5MB | فرمت‌ها: JPG, PNG, WebP
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
                          onClick={(e) => e.preventDefault()}
                        >
                          <Upload className="w-4 h-4" />
                          تغیير
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, false)}
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
                      onChange={(e) => handleImageChange(e, false)}
                      className="hidden"
                      disabled={uploadingFiles.length > 0}
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
                    🎶 گالری عکس‌ها
                  </Label>
                  <Badge variant="secondary">
                    {formData.gallery_images.length} / 10
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  برای نمایش جزئیات بیشتر عکس‌ها اضافه کنید
                </p>

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
                      onChange={(e) => handleImageChange(e, true)}
                      className="hidden"
                      disabled={uploadingFiles.length > 0}
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
                <Label>🎯 عنوان دوره</Label>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      maxLength={100}
                      placeholder="عنوانی جذاب و واضح"
                      className={errors.title ? "border-red-500" : ""}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formData.title.length}/100
                  </span>
                </div>
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>📝 توضیحات</Label>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      maxLength={2000}
                      rows={5}
                      placeholder="برای شرح بیشتر كلیك كنيد..."
                      className={errors.description ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description}</p>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

              {/* Instructor */}
              <div className="space-y-2">
                <Label>👨‍🏫 مدرس</Label>
                <Input
                  value={formData.instructor_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructor_name: e.target.value,
                    })
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
                      setFormData({
                        ...formData,
                        duration_hours: Number(e.target.value),
                      })
                    }
                    min="0"
                  />
                </div>

                {/* Course Type */}
                <div className="space-y-2">
                  <Label>🎬 نوع دوره</Label>
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
                  <Label>💰 قیمت فعلی</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    min="0"
                    placeholder="0"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm">{errors.price}</p>
                  )}
                </div>

                {/* Original Price */}
                <div className="space-y-2">
                  <Label>🏷️ قیمت اصلی</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: Number(e.target.value),
                      })
                    }
                    min="0"
                    placeholder="0"
                    className={errors.original_price ? "border-red-500" : ""}
                  />
                  {errors.original_price && (
                    <p className="text-red-600 text-sm">{errors.original_price}</p>
                  )}
                </div>
              </div>

              {/* Discount Display */}
              {discountPercent > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Badge variant="destructive" className="text-lg">
                    -{discountPercent}%
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      تخفیف
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      از{" "}
                      {formData.original_price.toLocaleString()} به{" "}
                      {formData.price.toLocaleString()}
                    </p>
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
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              <div className="space-y-4">
                {/* Is Active */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="font-semibold">✅ فعال</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      این دوره قابل خرید است
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, is_active: val })
                    }
                  />
                </div>

                {/* Is New */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="font-semibold">🆕 جدید</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      نمایش badge "جدید" برای 7 روز
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_new}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, is_new: val })
                    }
                  />
                </div>
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/courses")}
          >
            <Eye className="w-4 h-4 mr-2" />
            پیش‌نمایش
          </Button>
          <Button type="submit" disabled={saving || uploadingFiles.length > 0} className="gap-2">
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