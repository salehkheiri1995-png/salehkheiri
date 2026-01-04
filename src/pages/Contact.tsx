import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Instagram,
  MessageCircle
} from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const { data: settings } = useSalonSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "پیام شما ارسال شد",
      description: "به زودی با شما تماس خواهیم گرفت.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "تلفن",
      value: settings?.phone || "۰۲۱-۱۲۳۴۵۶۷۸",
      href: `tel:${settings?.phone || "02112345678"}`
    },
    {
      icon: Mail,
      title: "ایمیل",
      value: settings?.email || "info@salon.com",
      href: `mailto:${settings?.email || "info@salon.com"}`
    },
    {
      icon: MapPin,
      title: "آدرس",
      value: settings?.address || "تهران، خیابان ولیعصر",
      href: "#"
    },
    {
      icon: Clock,
      title: "ساعات کاری",
      value: settings?.working_hours || "شنبه تا پنجشنبه ۹ تا ۲۱",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">تماس با ما</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              سوالی دارید؟ با ما در تماس باشید. تیم پشتیبانی ما آماده پاسخگویی به شماست.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">ارسال پیام</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">نام و نام خانوادگی</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">شماره تماس</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">موضوع</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">پیام</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Send className="w-4 h-4 ml-2" />
                      {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover-lift">
                    <CardContent className="p-6">
                      <a href={info.href} className="block">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <info.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">{info.title}</h3>
                            <p className="text-sm text-muted-foreground">{info.value}</p>
                          </div>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">ما را در شبکه‌های اجتماعی دنبال کنید</h3>
                  <div className="flex gap-3">
                    {settings?.instagram_url && (
                      <a
                        href={settings.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {settings?.telegram_url && (
                      <a
                        href={settings.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Send className="w-5 h-5" />
                      </a>
                    )}
                    {settings?.whatsapp && (
                      <a
                        href={`https://wa.me/${settings.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>نقشه در این قسمت نمایش داده می‌شود</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
