import { Link } from "react-router-dom";
import { Sparkles, Instagram, Send, Phone, MapPin, Clock, Heart } from "lucide-react";
import { useSalonSettings } from "@/hooks/useSalonSettings";

const quickLinks = [
  { href: "/services", label: "خدمات" },
  { href: "/courses", label: "دوره‌های آموزشی" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
];

const supportLinks = [
  { href: "/faq", label: "سوالات متداول" },
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/privacy", label: "حریم خصوصی" },
  { href: "/contact", label: "تماس با ما" },
];

export function Footer() {
  const { data: settings } = useSalonSettings();

  return (
    <footer className="bg-charcoal text-white/90">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">{settings?.salon_name || "سالن زیبایی"}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              {settings?.about_text || "ما در سالن زیبایی با ارائه خدمات حرفه‌ای و با کیفیت، زیبایی شما را به اوج می‌رسانیم."}
            </p>
            <div className="flex gap-3">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Send className="w-5 h-5" />
                </a>
              )}
              {!settings?.instagram_url && !settings?.telegram_url && (
                <>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">دسترسی سریع</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6">پشتیبانی</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">اطلاعات تماس</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">{settings?.address || "تهران، خیابان ولیعصر، پلاک ۱۲۳"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-white/60 text-sm" dir="ltr">{settings?.phone || "۰۲۱-۱۲۳۴۵۶۷۸"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span className="text-white/60 text-sm">{settings?.working_hours || "شنبه تا پنج‌شنبه: ۹ صبح تا ۹ شب"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © ۱۴۰۳ {settings?.salon_name || "سالن زیبایی"}. تمامی حقوق محفوظ است.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            ساخته شده با <Heart className="w-4 h-4 text-primary fill-primary" /> در ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
