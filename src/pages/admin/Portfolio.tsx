import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { 
  Plus, Pencil, Trash2, Camera, GripVertical, AlertCircle, 
  Filter, Video, Eye, Heart, Tag, Palette, Settings, LayoutGrid
} from "lucide-react";
import { motion, Reorder } from "framer-motion";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  is_active: boolean;
  order_index: number;
  views_count: number;
  likes_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export default function AdminPortfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderedItems, setOrderedItems] = useState<PortfolioItem[]>([]);
  const [activeTab, setActiveTab] = useState("items");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    category: "",
    is_active: true,
    order_index: 0,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    color: "#6366f1",
    icon: "folder",
    order_index: 0,
    is_active: true,
  });

  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["portfolio-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch portfolio items
  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as PortfolioItem[];
    },
  });

  // Update ordered items when portfolio data changes or filter changes
  useEffect(() => {
    if (portfolioItems) {
      const filtered = selectedCategory === "all" 
        ? portfolioItems 
        : portfolioItems.filter(item => item.category === selectedCategory);
      setOrderedItems(filtered);
    }
  }, [portfolioItems, selectedCategory]);

  // Mutations for portfolio items
  const updateOrderMutation = useMutation({
    mutationFn: async (items: PortfolioItem[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("portfolio")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: "ترتیب نمونه‌کارها با موفقیت ذخیره شد" });
    },
    onError: () => {
      toast({ title: "خطا در ذخیره ترتیب", variant: "destructive" });
    },
  });

  const handleReorder = (newOrder: PortfolioItem[]) => {
    setOrderedItems(newOrder);
    updateOrderMutation.mutate(newOrder);
  };

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

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryFormData) => {
      const { error } = await supabase.from("portfolio_categories").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-categories"] });
      toast({ title: "دسته‌بندی با موفقیت اضافه شد" });
      closeCategoryDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: "خطا در افزودن دسته‌بندی", 
        description: error.message.includes("duplicate") ? "این دسته‌بندی قبلاً وجود دارد" : undefined,
        variant: "destructive" 
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof categoryFormData }) => {
      const { error } = await supabase.from("portfolio_categories").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-categories"] });
      toast({ title: "دسته‌بندی با موفقیت ویرایش شد" });
      closeCategoryDialog();
    },
    onError: () => {
      toast({ title: "خطا در ویرایش دسته‌بندی", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-categories"] });
      toast({ title: "دسته‌بندی با موفقیت حذف شد" });
    },
    onError: () => {
      toast({ title: "خطا در حذف دسته‌بندی", variant: "destructive" });
    },
  });

  const openDialog = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || "",
        image_url: item.image_url || "",
        video_url: item.video_url || "",
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
        video_url: "",
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
      video_url: "",
      category: "",
      is_active: true,
      order_index: 0,
    });
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        slug: category.slug,
        color: category.color,
        icon: category.icon,
        order_index: category.order_index,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        slug: "",
        color: "#6366f1",
        icon: "folder",
        order_index: categories.length,
        is_active: true,
      });
    }
    setIsCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      slug: "",
      color: "#6366f1",
      icon: "folder",
      order_index: 0,
      is_active: true,
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

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate slug from name if empty
    const slug = categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-');
    const dataToSubmit = { ...categoryFormData, slug };
    
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: dataToSubmit });
    } else {
      createCategoryMutation.mutate(dataToSubmit);
    }
  };

  const getCategoryLabel = (categorySlug: string | null) => {
    return categories.find((c) => c.slug === categorySlug)?.name || categorySlug || "-";
  };

  const getCategoryColor = (categorySlug: string | null) => {
    return categories.find((c) => c.slug === categorySlug)?.color || "#6366f1";
  };

  const filteredStats = {
    total: portfolioItems?.length || 0,
    active: portfolioItems?.filter((p) => p.is_active).length || 0,
    withVideo: portfolioItems?.filter((p) => p.video_url).length || 0,
    totalViews: portfolioItems?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
  };

  const colorOptions = [
    { value: "#8B5CF6", label: "بنفش" },
    { value: "#EC4899", label: "صورتی" },
    { value: "#F59E0B", label: "نارنجی" },
    { value: "#10B981", label: "سبز" },
    { value: "#3B82F6", label: "آبی" },
    { value: "#EF4444", label: "قرمز" },
    { value: "#6366f1", label: "ایندیگو" },
    { value: "#14B8A6", label: "فیروزه‌ای" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نمونه‌کارها</h1>
          <p className="text-muted-foreground">مدیریت نمونه‌کارها، ویدیوها و دسته‌بندی‌ها</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStats.total}</p>
                <p className="text-xs text-muted-foreground">کل نمونه‌کارها</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStats.active}</p>
                <p className="text-xs text-muted-foreground">فعال</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStats.withVideo}</p>
                <p className="text-xs text-muted-foreground">دارای ویدیو</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-xs text-muted-foreground">دسته‌بندی</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            نمونه‌کارها
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            دسته‌بندی‌ها
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>لیست نمونه‌کارها</CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="فیلتر دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه دسته‌ها</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => openDialog()} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن نمونه‌کار
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto" dir="rtl">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-14 text-center px-3 py-3">ترتیب</TableHead>
                      <TableHead className="w-24 text-right px-3 py-3">رسانه</TableHead>
                      <TableHead className="text-right px-3 py-3">عنوان</TableHead>
                      <TableHead className="w-32 text-right px-3 py-3">دسته‌بندی</TableHead>
                      <TableHead className="w-28 text-center px-3 py-3">آمار</TableHead>
                      <TableHead className="w-20 text-center px-3 py-3">وضعیت</TableHead>
                      <TableHead className="w-24 text-center px-3 py-3">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          در حال بارگذاری...
                        </TableCell>
                      </TableRow>
                    ) : orderedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {selectedCategory === "all" 
                              ? "نمونه‌کاری یافت نشد" 
                              : `نمونه‌کاری در دسته ${getCategoryLabel(selectedCategory)} یافت نشد`
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <Reorder.Group
                        as="tbody"
                        axis="y"
                        values={orderedItems}
                        onReorder={handleReorder}
                        className="[&>*]:cursor-grab [&>*:active]:cursor-grabbing"
                      >
                        {orderedItems.map((item) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            as="tr"
                            className="border-b transition-colors hover:bg-muted/30"
                            whileDrag={{
                              scale: 1.01,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                              backgroundColor: "rgba(99, 102, 241, 0.05)",
                            }}
                          >
                            {/* ترتیب */}
                            <TableCell className="w-14 text-center px-3 py-3 align-middle">
                              <GripVertical className="w-4 h-4 text-muted-foreground inline cursor-grab active:cursor-grabbing" />
                            </TableCell>

                            {/* رسانه */}
                            <TableCell className="w-24 px-3 py-3 align-middle">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {item.image_url ? (
                                  <div className="relative w-full h-full">
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                    {item.video_url && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Video className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    {item.video_url ? (
                                      <Video className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <Camera className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* عنوان و توضیح */}
                            <TableCell className="px-3 py-3 text-right align-middle">
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{item.title}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* دسته‌بندی */}
                            <TableCell className="w-32 px-3 py-3 text-right align-middle">
                              <Badge 
                                variant="outline"
                                className="inline-flex whitespace-nowrap text-xs"
                                style={{ 
                                  backgroundColor: `${getCategoryColor(item.category)}15`,
                                  borderColor: getCategoryColor(item.category),
                                  color: getCategoryColor(item.category),
                                }}
                              >
                                {getCategoryLabel(item.category)}
                              </Badge>
                            </TableCell>

                            {/* آمار */}
                            <TableCell className="w-28 px-3 py-3 align-middle">
                              <div className="flex flex-col items-center gap-1 text-xs">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-medium">{item.views_count || 0}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-medium">{item.likes_count || 0}</span>
                                </span>
                              </div>
                            </TableCell>

                            {/* وضعیت */}
                            <TableCell className="w-20 text-center px-3 py-3 align-middle">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={(checked) => {
                                  toggleActiveMutation.mutate({ id: item.id, is_active: checked });
                                }}
                              />
                            </TableCell>

                            {/* عملیات */}
                            <TableCell className="w-24 px-3 py-3 align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDialog(item)}
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    if (confirm("آیا از حذف این نمونه‌کار مطمئن هستید؟")) {
                                      deleteMutation.mutate(item.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Categories Reference Table */}
          {categories.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  جدول مرجع دسته‌بندی‌ها
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  این جدول نشان می‌دهد که هر لیبل مربوط به کدام دسته‌بندی است
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="px-4 py-3 text-right">نام دسته‌بندی</TableHead>
                        <TableHead className="px-4 py-3 text-right">شناسه (Slug)</TableHead>
                        <TableHead className="px-4 py-3 text-right">رنگ</TableHead>
                        <TableHead className="px-4 py-3 text-center">تعداد نمونه‌کار</TableHead>
                        <TableHead className="px-4 py-3 text-center">وضعیت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-muted/50">
                          <TableCell className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="font-medium">{category.name}</span>
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: category.color }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <code className="text-xs bg-muted px-2 py-1 rounded" dir="ltr">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <code className="text-xs" dir="ltr">{category.color}</code>
                              <div 
                                className="w-6 h-6 rounded border flex-shrink-0" 
                                style={{ backgroundColor: category.color }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center">
                            <Badge variant="secondary">
                              {portfolioItems?.filter(p => p.category === category.slug).length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "فعال" : "غیرفعال"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن دسته‌بندی
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-8">در حال بارگذاری...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  دسته‌بندی‌ای یافت نشد
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 relative group text-right"
                      style={{ borderColor: `${category.color}40` }}
                      dir="rtl"
                    >
                      <div className="flex items-center gap-3 mb-2 justify-end">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground" dir="ltr">{category.slug}</p>
                        </div>
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {portfolioItems?.filter(p => p.category === category.slug).length || 0} نمونه‌کار
                        </span>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openCategoryDialog(category)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) {
                              deleteCategoryMutation.mutate(category.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Portfolio Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
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
              <Label htmlFor="video_url">لینک ویدیو (اختیاری)</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                لینک مستقیم ویدیو یا لینک یوتیوب/آپارات
              </p>
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
                    <SelectItem key={cat.id} value={cat.slug}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat_name">نام دسته‌بندی</Label>
              <Input
                id="cat_name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat_slug">شناسه (Slug)</Label>
              <Input
                id="cat_slug"
                value={categoryFormData.slug}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                placeholder="auto-generated"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                اگر خالی بگذارید، خودکار از نام ساخته می‌شود
              </p>
            </div>
            <div className="space-y-2">
              <Label>رنگ</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      categoryFormData.color === color.value 
                        ? "border-foreground scale-110" 
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setCategoryFormData({ ...categoryFormData, color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cat_active">فعال</Label>
              <Switch
                id="cat_active"
                checked={categoryFormData.is_active}
                onCheckedChange={(checked) =>
                  setCategoryFormData({ ...categoryFormData, is_active: checked })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingCategory ? "ذخیره تغییرات" : "افزودن"}
              </Button>
              <Button type="button" variant="outline" onClick={closeCategoryDialog}>
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}