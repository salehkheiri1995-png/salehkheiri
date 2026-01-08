import { motion } from "framer-motion";
import { Calendar, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { EditableText } from "@/components/visual-editor/EditableText";

export function CTASection() {
  const { data: settings } = useSalonSettings();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <EditableText
            pageKey="home"
            contentKey="cta_label"
            defaultValue="رزرو آنلاین"
            as="span"
            className="text-primary font-medium mb-4 block"
          />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <EditableText
              pageKey="home"
              contentKey="cta_title"
              defaultValue={settings?.home_booking_title || "همین حالا نوبت خود را رزرو کنید"}
              as="span"
            />
          </h2>
          <EditableText
            pageKey="home"
            contentKey="cta_subtitle"
            defaultValue={settings?.home_booking_subtitle || "به سادگی و در کمترین زمان، نوبت خود را به صورت آنلاین رزرو کنید"}
            as="p"
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 text-base h-14 px-8 w-full sm:w-auto">
              <Link to="/booking">
                <Calendar className="w-5 h-5" />
                رزرو آنلاین
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base h-14 px-8 w-full sm:w-auto">
              <Phone className="w-5 h-5" />
              تماس تلفنی
            </Button>
            <Button size="lg" variant="ghost" className="gap-2 text-base h-14 px-8 w-full sm:w-auto">
              <MessageCircle className="w-5 h-5" />
              پیام در واتساپ
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-12 border-t border-border">
            <div className="text-center">
              <EditableText
                pageKey="home"
                contentKey="cta_stat_1_value"
                defaultValue="+۵۰۰۰"
                as="p"
                className="text-3xl font-bold gradient-text"
              />
              <EditableText
                pageKey="home"
                contentKey="cta_stat_1_label"
                defaultValue="مشتری راضی"
                as="p"
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="text-center">
              <EditableText
                pageKey="home"
                contentKey="cta_stat_2_value"
                defaultValue="+۱۵"
                as="p"
                className="text-3xl font-bold gradient-text"
              />
              <EditableText
                pageKey="home"
                contentKey="cta_stat_2_label"
                defaultValue="سال تجربه"
                as="p"
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="text-center">
              <EditableText
                pageKey="home"
                contentKey="cta_stat_3_value"
                defaultValue="+۲۰"
                as="p"
                className="text-3xl font-bold gradient-text"
              />
              <EditableText
                pageKey="home"
                contentKey="cta_stat_3_label"
                defaultValue="متخصص حرفه‌ای"
                as="p"
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="text-center">
              <EditableText
                pageKey="home"
                contentKey="cta_stat_4_value"
                defaultValue="۴.۹"
                as="p"
                className="text-3xl font-bold gradient-text"
              />
              <EditableText
                pageKey="home"
                contentKey="cta_stat_4_label"
                defaultValue="امتیاز از ۵"
                as="p"
                className="text-sm text-muted-foreground"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
