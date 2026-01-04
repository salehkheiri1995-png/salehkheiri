import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Loader2, Star } from "lucide-react";
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
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";

interface Specialist {
  id: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  gallery_images: string[] | null;
  experience_years: number | null;
  rating: number | null;
  instagram_url: string | null;
  is_active: boolean;
}

export default function AdminSpecialists() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    bio: "",
    avatar_url: "",
    gallery_images: [] as string[],
    experience_years: 0,
    instagram_url: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSpecialists(data || []);
    } catch (error) {
      console.error("Error fetching specialists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingSpecialist) {
        const { error } = await supabase
          .from("specialists")
          .update(formData)
          .eq("id", editingSpecialist.id);

        if (error) throw error;
        toast({ title: "موفق", description: "متخصص ویرایش شد" });
      } else {
        const { error } = await supabase.from("specialists").insert([formData]);
        if (error) throw error;
        toast({ title: "موفق", description: "متخصص اضافه شد" });
      }

      setIsDialogOpen(false);
      setEditingSpecialist(null);
      resetForm();
      fetchSpecialists();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    setFormData({
      full_name: specialist.full_name,
      title: specialist.title || "",
      bio: specialist.bio || "",
      avatar_url: specialist.avatar_url || "",
      gallery_images: specialist.gallery_images || [],
      experience_years: specialist.experience_years || 0,
      instagram_url: specialist.instagram_url || "",
      is_active: specialist.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این متخصص مطمئن هستید؟")) return;

    try {
      const { error } = await supabase.from("specialists").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "موفق", description: "متخصص حذف شد" });
      fetchSpecialists();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      title: "",
      bio: "",
      avatar_url: "",
      gallery_images: [],
      experience_years: 0,
      instagram_url: "",
      is_active: true,
    });
  };

  const filteredSpecialists = specialists.filter(
    (s) => s.full_name.includes(search) || s.title?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مدیریت متخصصان</h1>
          <p className="text-muted-foreground mt-1">{specialists.length} متخصص</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setEditingSpecialist(null); resetForm(); }}>
              <Plus className="w-4 h-4" />
              افزودن متخصص
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSpecialist ? "ویرایش متخصص" : "افزودن متخصص جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>تصاویر</Label>
                <MultiImageUpload
                  featuredImage={formData.avatar_url}
                  galleryImages={formData.gallery_images}
                  onFeaturedChange={(url) => setFormData({ ...formData, avatar_url: url })}
                  onGalleryChange={(urls) => setFormData({ ...formData, gallery_images: urls })}
                  folder="specialists"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام کامل</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تخصص</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>بیوگرافی</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>سال تجربه</Label>
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اینستاگرام</Label>
                  <Input
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>فعال</Label>
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
        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-11"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSpecialists.map((specialist, index) => (
            <motion.div
              key={specialist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-card text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                {specialist.avatar_url ? (
                  <img src={specialist.avatar_url} alt={specialist.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {specialist.full_name[0]}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{specialist.full_name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{specialist.title}</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{specialist.rating || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {specialist.experience_years} سال تجربه
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(specialist)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(specialist.id)} className="text-destructive">
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
