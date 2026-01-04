import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Building2, Phone, Instagram, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  hero_badge_text: string | null;
  hero_title: string | null;
  hero_highlight: string | null;
  hero_description: string | null;
  home_services_title: string | null;
  home_services_subtitle: string | null;
  home_specialists_title: string | null;
  home_specialists_subtitle: string | null;
  home_courses_title: string | null;
  home_courses_subtitle: string | null;
  home_products_title: string | null;
  home_products_subtitle: string | null;
  home_booking_title: string | null;
  home_booking_subtitle: string | null;
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
          hero_badge_text: formData.hero_badge_text,
          hero_title: formData.hero_title,
          hero_highlight: formData.hero_highlight,
          hero_description: formData.hero_description,
          home_services_title: formData.home_services_title,
          home_services_subtitle: formData.home_services_subtitle,
          home_specialists_title: formData.home_specialists_title,
          home_specialists_subtitle: formData.home_specialists_subtitle,
          home_courses_title: formData.home_courses_title,
          home_courses_subtitle: formData.home_courses_subtitle,
          home_products_title: formData.home_products_title,
          home_products_subtitle: formData.home_products_subtitle,
          home_booking_title: formData.home_booking_title,
          home_booking_subtitle: formData.home_booking_subtitle,
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
            hero_badge_text: formData.hero_badge_text,
            hero_title: formData.hero_title,
            hero_highlight: formData.hero_highlight,
            hero_description: formData.hero_description,
            home_services_title: formData.home_services_title,
            home_services_subtitle: formData.home_services_subtitle,
            home_specialists_title: formData.home_specialists_title,
            home_specialists_subtitle: formData.home_specialists_subtitle,
            home_courses_title: formData.home_courses_title,
            home_courses_subtitle: formData.home_courses_subtitle,
            home_products_title: formData.home_products_title,
            home_products_subtitle: formData.home_products_subtitle,
            home_booking_title: formData.home_booking_title,
            home_booking_subtitle: formData.home_booking_subtitle,
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
        <p className="text-muted-foreground mt-1">تنظیمات عمومی و محتوای صفحات</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="w-4 h-4" />
              اطلاعات سالن
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Phone className="w-4 h-4" />
              تماس و شبکه‌های اجتماعی
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Home className="w-4 h-4" />
              متن‌های صفحه خانه
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      درباره سالن
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="about_text">توضیحات</Label>
                      <Textarea
                        id="about_text"
                        value={formData.about_text || ""}
                        onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                        rows={6}
                        placeholder="توضیحات درباره سالن (نمایش در فوتر)..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="w-5 h-5" />
                      شبکه‌های اجتماعی
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Hero Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش اصلی (Hero)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hero_badge_text">متن نشان بالای عنوان</Label>
                      <Input
                        id="hero_badge_text"
                        value={formData.hero_badge_text || ""}
                        onChange={(e) => setFormData({ ...formData, hero_badge_text: e.target.value })}
                        placeholder="پذیرش آنلاین فعال است"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero_title">عنوان اصلی (خط اول)</Label>
                      <Input
                        id="hero_title"
                        value={formData.hero_title || ""}
                        onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                        placeholder="زیبایی شما،"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero_highlight">عنوان اصلی (خط دوم - رنگی)</Label>
                      <Input
                        id="hero_highlight"
                        value={formData.hero_highlight || ""}
                        onChange={(e) => setFormData({ ...formData, hero_highlight: e.target.value })}
                        placeholder="اولویت ماست"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="hero_description">توضیحات Hero</Label>
                      <Textarea
                        id="hero_description"
                        value={formData.hero_description || ""}
                        onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                        rows={2}
                        placeholder="با بهترین متخصصان زیبایی..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Services Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش خدمات</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home_services_title">عنوان</Label>
                      <Input
                        id="home_services_title"
                        value={formData.home_services_title || ""}
                        onChange={(e) => setFormData({ ...formData, home_services_title: e.target.value })}
                        placeholder="خدمات زیبایی حرفه‌ای"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="home_services_subtitle">زیرعنوان</Label>
                      <Input
                        id="home_services_subtitle"
                        value={formData.home_services_subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, home_services_subtitle: e.target.value })}
                        placeholder="با تیم متخصص ما..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Specialists Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش متخصصان</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home_specialists_title">عنوان</Label>
                      <Input
                        id="home_specialists_title"
                        value={formData.home_specialists_title || ""}
                        onChange={(e) => setFormData({ ...formData, home_specialists_title: e.target.value })}
                        placeholder="متخصصان حرفه‌ای ما"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="home_specialists_subtitle">زیرعنوان</Label>
                      <Input
                        id="home_specialists_subtitle"
                        value={formData.home_specialists_subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, home_specialists_subtitle: e.target.value })}
                        placeholder="با بهترین متخصصان..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Courses Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش دوره‌ها</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home_courses_title">عنوان</Label>
                      <Input
                        id="home_courses_title"
                        value={formData.home_courses_title || ""}
                        onChange={(e) => setFormData({ ...formData, home_courses_title: e.target.value })}
                        placeholder="آموزش حرفه‌ای زیبایی"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="home_courses_subtitle">زیرعنوان</Label>
                      <Input
                        id="home_courses_subtitle"
                        value={formData.home_courses_subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, home_courses_subtitle: e.target.value })}
                        placeholder="با دوره‌های تخصصی ما..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Products Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش محصولات</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home_products_title">عنوان</Label>
                      <Input
                        id="home_products_title"
                        value={formData.home_products_title || ""}
                        onChange={(e) => setFormData({ ...formData, home_products_title: e.target.value })}
                        placeholder="محصولات پرفروش"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="home_products_subtitle">زیرعنوان</Label>
                      <Input
                        id="home_products_subtitle"
                        value={formData.home_products_subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, home_products_subtitle: e.target.value })}
                        placeholder="بهترین محصولات زیبایی..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>بخش رزرو (CTA)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home_booking_title">عنوان</Label>
                      <Input
                        id="home_booking_title"
                        value={formData.home_booking_title || ""}
                        onChange={(e) => setFormData({ ...formData, home_booking_title: e.target.value })}
                        placeholder="همین حالا نوبت خود را رزرو کنید"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="home_booking_subtitle">زیرعنوان</Label>
                      <Input
                        id="home_booking_subtitle"
                        value={formData.home_booking_subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, home_booking_subtitle: e.target.value })}
                        placeholder="به سادگی و در کمترین زمان..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

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
