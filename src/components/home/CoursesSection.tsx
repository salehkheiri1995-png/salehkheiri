import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function CoursesSection() {
  const { data: settings } = useSalonSettings();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["home-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const parseTitle = (title: string) => {
    const match = title.match(/^(.+?)\s+(\S+)\s+(.+)$/);
    if (match) {
      return { main: match[1], highlight: match[2], suffix: match[3] };
    }
    return { main: title, highlight: "", suffix: "" };
  };

  const titleParts = parseTitle(settings?.home_courses_title || "آموزش حرفه‌ای زیبایی");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-medium mb-4 block">دوره‌های آموزشی</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {titleParts.main} <span className="gradient-text">{titleParts.highlight}</span> {titleParts.suffix}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {settings?.home_courses_subtitle || "با دوره‌های تخصصی ما، مهارت‌های زیبایی خود را ارتقا دهید"}
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link to="/courses">
              همه دوره‌ها
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {course.is_new && (
                      <Badge className="bg-accent text-accent-foreground">جدید</Badge>
                    )}
                    {course.level && <Badge variant="secondary">{course.level}</Badge>}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">مدرس: {course.instructor_name || "نامشخص"}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours} ساعت
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students_count} دانشجو
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      {Number(course.rating).toFixed(1)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{formatPrice(Number(course.price))} تومان</span>
                      {course.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(Number(course.original_price))}
                        </span>
                      )}
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/courses/${course.id}`}>ثبت‌نام</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            هنوز دوره‌ای ثبت نشده است
          </div>
        )}
      </div>
    </section>
  );
}