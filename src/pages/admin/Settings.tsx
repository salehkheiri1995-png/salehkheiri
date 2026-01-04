import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Building2, Phone, Mail, MapPin, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface SalonSettings {
  id: string;
  salon_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  whatsapp: string | null;
  working_hours: string | null;
  about_text: string | null;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<SalonSettings>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["salon-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SalonSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      if (!settings?.id) {
        // Create if not exists
        const { error } = await supabase.from("salon_settings").insert({
          salon_name: formData.salon_name || "سالن زیبایی",
          logo_url: formData.logo_url,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          instagram_url: formData.instagram_url,
          telegram_url: formData.telegram_url,
          whatsapp: formData.whatsapp,
          working_hours: formData.working_hours,
          about_text: formData.about_text,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("salon_settings")
          .update({
            salon_name: formData.salon_name,
            logo_url: formData.logo_url,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            instagram_url: formData.instagram_url,
            telegram_url: formData.telegram_url,
            whatsapp: formData.whatsapp,
            working_hours: formData.working_hours,
            about_text: formData.about_text,
          })
          .eq("id", settings.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "ذخیره شد",
        description: "تنظیمات با موفقیت ذخیره شد.",
      });
      queryClient.invalidateQueries({ queryKey: ["salon-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">تنظیمات</h1>
        <p className="text-muted-foreground mt-1">تنظیمات عمومی سالن</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  اطلاعات سالن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salon_name">نام سالن</Label>
                  <Input
                    id="salon_name"
                    value={formData.salon_name || ""}
                    onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                    placeholder="نام سالن زیبایی"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">آدرس لوگو</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about_text">درباره سالن</Label>
                  <Textarea
                    id="about_text"
                    value={formData.about_text || ""}
                    onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                    rows={4}
                    placeholder="توضیحات درباره سالن..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours">ساعات کاری</Label>
                  <Input
                    id="working_hours"
                    value={formData.working_hours || ""}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                    placeholder="مثال: شنبه تا پنج‌شنبه ۹ صبح تا ۹ شب"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  اطلاعات تماس
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تلفن</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@salon.com"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    placeholder="آدرس کامل سالن"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  شبکه‌های اجتماعی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">اینستاگرام</Label>
                    <Input
                      id="instagram_url"
                      value={formData.instagram_url || ""}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram_url">تلگرام</Label>
                    <Input
                      id="telegram_url"
                      value={formData.telegram_url || ""}
                      onChange={(e) => setFormData({ ...formData, telegram_url: e.target.value })}
                      placeholder="https://t.me/..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">واتساپ</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp || ""}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button type="submit" size="lg" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
            ) : (
              <Save className="w-5 h-5 ml-2" />
            )}
            ذخیره تنظیمات
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
