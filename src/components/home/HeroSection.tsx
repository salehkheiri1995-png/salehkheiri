import { motion } from "framer-motion";
import { Calendar, Play, Star, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { EditableText } from "@/components/visual-editor/EditableText";
import { EditableImage } from "@/components/visual-editor/EditableImage";

const stats = [
  { icon: Users, value: "+۵۰۰۰", label: "مشتری راضی" },
  { icon: Star, value: "۴.۹", label: "امتیاز" },
  { icon: Award, value: "+۱۵", label: "سال تجربه" },
];

export function HeroSection() {
  const { data: settings } = useSalonSettings();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-right"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <EditableText
                pageKey="home"
                contentKey="hero_badge"
                defaultValue={settings?.hero_badge_text || "پذیرش آنلاین فعال است"}
                as="span"
              />
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              <EditableText
                pageKey="home"
                contentKey="hero_title"
                defaultValue={settings?.hero_title || "زیبایی شما،"}
                as="span"
              />
              <br />
              <EditableText
                pageKey="home"
                contentKey="hero_highlight"
                defaultValue={settings?.hero_highlight || "اولویت ماست"}
                as="span"
                className="gradient-text"
              />
            </h1>

            <EditableText
              pageKey="home"
              contentKey="hero_description"
              defaultValue={settings?.hero_description || "با بهترین متخصصان زیبایی، خدمات حرفه‌ای را تجربه کنید. از مراقبت پوست تا آرایش عروس، همه در یک مکان."}
              as="p"
              multiline
              className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
            />

            <div className="flex flex-wrap gap-4 mb-12">
              <Button asChild size="lg" className="gap-2 text-base h-14 px-8">
                <Link to="/booking">
                  <Calendar className="w-5 h-5" />
                  رزرو نوبت
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base h-14 px-8">
                <Play className="w-5 h-5" />
                معرفی سالن
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <EditableText
                      pageKey="home"
                      contentKey={`stat_${index}_value`}
                      defaultValue={stat.value}
                      as="span"
                      className="text-2xl font-bold"
                    />
                  </div>
                  <EditableText
                    pageKey="home"
                    contentKey={`stat_${index}_label`}
                    defaultValue={stat.label}
                    as="span"
                    className="text-sm text-muted-foreground"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated">
              <EditableImage
                pageKey="home"
                contentKey="hero_image"
                defaultSrc="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=1000&fit=crop"
                alt="سالن زیبایی"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent pointer-events-none" />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-8 top-1/4 glass-card p-4 rounded-2xl animate-float"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div>
                  <p className="font-bold">۴.۹ از ۵</p>
                  <p className="text-sm text-muted-foreground">+۱۲۰۰ نظر</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-8 bottom-1/4 glass-card p-4 rounded-2xl"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-bold">+۵۰۰۰</p>
                  <p className="text-sm text-muted-foreground">مشتری خوشحال</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
