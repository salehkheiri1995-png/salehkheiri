import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Pencil, Trash2, Camera, GripVertical, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  order_index: number;
}

const categories = [
  { id: "hair", label: "مو" },
  { id: "makeup", label: "آرایش" },
  { id: "nail", label: "ناخن" },
  { id: "skin", label: "پوست" },
];

// Sample data - fallback when DB is empty
const samplePortfolioData = [
  {
    id: "sample-1",
    title: "آرایش عروس لاکچری",
    category: "makeup",
    description: "آرایش مدرن و الگان برای عروسی",
    image_url: "https://images.unsplash.com/photo-1607746882042-f3978991f23e?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 1,
    is_active: true,
  },
  {
    id: "sample-2",
    title: "رنگ و مو طبیعی",
    category: "hair",
    description: "سبک مو زنانه مدرن",
    image_url: "https://images.unsplash.com/photo-1562599810-d0d1c27c9ae5?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 2,
    is_active: true,
  },
  {
    id: "sample-3",
    title: "طراحی ناخن ژله‌ای",
    category: "nail",
    description: "رنگ های مختلف و طرح های جدید",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 3,
    is_active: true,
  },
  {
    id: "sample-4",
    title: "درمان پوست صورت",
    category: "skin",
    description: "تمیزکاری و درمان پوست حساس",
    image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 4,
    is_active: true,
  },
  {
    id: "sample-5",
    title: "موج و فر طبیعی",
    category: "hair",
    description: "بوکل های صحیح و طبیعی",
    image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 5,
    is_active: true,
  },
  {
    id: "sample-6",
    title: "آرایش شام برای مهمانی",
    category: "makeup",
    description: "آرایش درخشان برای شب",
    image_url: "https://images.unsplash.com/photo-1529148482759-b3997e4ea767?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 6,
    is_active: true,
  },
  {
    id: "sample-7",
    title: "طراحی ناخن مینیمالیست",
    category: "nail",
    description: "طرح ساده و شیک",
    image_url: "https://images.unsplash.com/photo-1610992015732-2449ec28227c?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 7,
    is_active: true,
  },
  {
    id: "sample-8",
    title: "بلیچ و رنگ مو",
    category: "hair",
    description: "تبدیل رنگ مو به سایه‌های روشن",
    image_url: "https://images.unsplash.com/photo-1563458500-4b20c6cb4c9b?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 8,
    is_active: true,
  },
  {
    id: "sample-9",
    title: "پاکسازی و مراقبت پوست",
    category: "skin",
    description: "پروتکل مراقبت کامل پوست",
    image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 9,
    is_active: true,
  },
  {
    id: "sample-10",
    title: "آرایش روزمره طبیعی",
    category: "makeup",
    description: "آرایش روزانه برای محیط کار",
    image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 10,
    is_active: true,
  },
  {
    id: "sample-11",
    title: "ناخن کریستالی براق",
    category: "nail",
    description: "ناخن براق و درخشان",
    image_url: "https://images.unsplash.com/photo-1600797260371-e80fcca6a472?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 11,
    is_active: true,
  },
  {
    id: "sample-12",
    title: "اصلاح ابرو حرفه‌ای",
    category: "makeup",
    description: "فرم‌دهی و رنگ ابرو",
    image_url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 12,
    is_active: true,
  },
];

export default function AdminPortfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    is_active: true,
    order_index: 0,
  });

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .order("order_index");
        
        // اگر DB خالی بود، Sample Data برگردان
        if (error || !data || data.length === 0) {
          setIsSampleData(true);
          return samplePortfolioData as PortfolioItem[];
        }
        
        setIsSampleData(false);
        return data as PortfolioItem[];
      } catch (err) {
        setIsSampleData(true);
        return samplePortfolioData as PortfolioItem[];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("portfolio").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: "نمونه‌کار با موفقیت اضافه شد" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "خطا در افزودن نمونه‌کار", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("portfolio").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: "نمونه‌کار با موفقیت ویرایش شد" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "خطا در ویرایش نمونه‌کار", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: "نمونه‌کار با موفقیت حذف شد" });
    },
    onError: () => {
      toast({ title: "خطا در حذف نمونه‌کار", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("portfolio")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });

  const openDialog = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || "",
        image_url: item.image_url || "",
        category: item.category || "",
        is_active: item.is_active,
        order_index: item.order_index,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        category: "",
        is_active: true,
        order_index: portfolioItems?.length || 0,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "",
      is_active: true,
      order_index: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCategoryLabel = (categoryId: string | null) => {
    return categories.find((c) => c.id === categoryId)?.label || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نمونه‌کارها</h1>
          <p className="text-muted-foreground">مدیریت نمونه‌کارها و گالری تصاویر</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 ml-2" />
          افزودن نمونه‌کار
        </Button>
      </div>

      {/* Warning if sample data */}
      {isSampleData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-900">Sample Data در حال نمایش</h3>
            <p className="text-sm text-amber-800 mt-1">
              Database هنوز لا ایتم ندارد. برای مشاهده نمونه ایتم از Sample Data استفاده میشود. یک آیتم جدید اضافه کنید تا Database شروع شود!
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{portfolioItems?.length || 0}</p>
                <p className="text-xs text-muted-foreground">کل نمونه‌کارها</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {portfolioItems?.filter((p) => p.is_active).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست نمونه‌کارها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-20">تصویر</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>دسته‌بندی</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    در حال بارگذاری...
                  </TableCell>
                </TableRow>
              ) : portfolioItems?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    نمونه‌کاری یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                portfolioItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryLabel(item.category)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(checked) => {
                          // اگر Sample Data است، نمیتوان تغییر دهی
                          if (item.id.startsWith("sample-")) {
                            toast({
                              title: "نمیتوانید Sample Data را تغییر دهید",
                              variant: "destructive",
                            });
                            return;
                          }
                          toggleActiveMutation.mutate({ id: item.id, is_active: checked });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            // اگر Sample Data است، نمیتوان حذف دهی
                            if (item.id.startsWith("sample-")) {
                              toast({
                                title: "نمیتوانید Sample Data را حذف دهید",
                                variant: "destructive",
                              });
                              return;
                            }
                            if (confirm("آیا از حذف این نمونه‌کار مطمئن هستید؟")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "ویرایش نمونه‌کار" : "افزودن نمونه‌کار جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>تصویر</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="portfolio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">ترتیب نمایش</Label>
              <Input
                id="order"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">فعال</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingItem ? "ذخیره تغییرات" : "افزودن"}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}