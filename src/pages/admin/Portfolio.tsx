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
import { Plus, Pencil, Trash2, Camera, GripVertical } from "lucide-react";
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

export default function AdminPortfolio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
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
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as PortfolioItem[];
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
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: item.id, is_active: checked })
                        }
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
