import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Edit, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  description: string | null;
  is_active: boolean;
}

export default function AdminShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const methodData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description || null,
        is_active: formData.is_active,
      };

      if (editingMethod) {
        const { error } = await supabase
          .from("shipping_methods")
          .update(methodData)
          .eq("id", editingMethod.id);
        if (error) throw error;
        toast({ title: "موفق", description: "روش ارسال ویرایش شد" });
      } else {
        const { error } = await supabase
          .from("shipping_methods")
          .insert(methodData);
        if (error) throw error;
        toast({ title: "موفق", description: "روش ارسال اضافه شد" });
      }

      setDialogOpen(false);
      resetForm();
      fetchMethods();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from("shipping_methods")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast({ title: "موفق", description: "روش ارسال حذف شد" });
      setDeleteId(null);
      fetchMethods();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from("shipping_methods")
        .update({ is_active: !is_active })
        .eq("id", id);

      if (error) throw error;
      fetchMethods();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const openEditDialog = (method: ShippingMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      price: method.price.toString(),
      description: method.description || "",
      is_active: method.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({ name: "", price: "", description: "", is_active: true });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">روش‌های ارسال</h1>
          <p className="text-muted-foreground mt-1">{methods.length} روش ارسال</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              افزودن روش ارسال
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMethod ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">نام روش ارسال</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ارسال اکسپرس"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">هزینه (تومان)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ارسال طی ۱ تا ۲ روز کاری"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">فعال</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMethod ? "ذخیره تغییرات" : "افزودن"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">هیچ روش ارسالی تعریف نشده</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={method.is_active ? "" : "opacity-60"}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {method.price === 0 ? "رایگان" : `${formatPrice(method.price)} تومان`}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={() => toggleActive(method.id, method.is_active)}
                    />
                  </div>
                  {method.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {method.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(method)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      ویرایش
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteId(method.id)}
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات قابل بازگشت نیست. روش ارسال برای همیشه حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
